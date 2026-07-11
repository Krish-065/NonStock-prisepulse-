const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../db/index');
const crypto = require('crypto');

// Technical indicator helpers
function computeRSI(prices, period = 14) {
  if (prices.length <= period) return null;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

function computeEMA(prices, period = 20) {
  if (prices.length < period) return null;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((acc, p) => acc + p, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return parseFloat(ema.toFixed(2));
}

// Background simulator function
async function checkAlertsForUser(userId) {
  try {
    const alerts = await query(
      `SELECT * FROM price_alerts WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    for (const alert of alerts.rows) {
      let fetchSymbol = alert.symbol;
      if (!fetchSymbol.endsWith('.NS') && !fetchSymbol.includes('-USD') && !fetchSymbol.includes('^')) {
        fetchSymbol = `${fetchSymbol}.NS`;
      }
      
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(fetchSymbol)}?range=1mo&interval=1d`;
      const yfRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!yfRes.ok) continue;

      const data = await yfRes.json();
      const result = data?.chart?.result?.[0];
      if (!result || !result.timestamp) continue;

      const closes = result.indicators?.quote?.[0]?.close || [];
      const validCloses = closes.filter(c => c !== null);
      if (validCloses.length === 0) continue;

      const currentPrice = validCloses[validCloses.length - 1];
      const targetVal = parseFloat(alert.target_price);
      let currentValue = currentPrice;

      if (alert.trigger_type === 'rsi') {
        const rsi = computeRSI(validCloses, alert.indicator_period || 14);
        if (rsi !== null) currentValue = rsi;
      } else if (alert.trigger_type === 'ema') {
        const ema = computeEMA(validCloses, alert.indicator_period || 20);
        if (ema !== null) currentValue = ema;
      }

      let triggered = false;
      const cond = alert.condition.toLowerCase();
      if (cond === 'above' && currentValue > targetVal) {
        triggered = true;
      } else if (cond === 'below' && currentValue < targetVal) {
        triggered = true;
      } else if (cond === 'crosses') {
        if (validCloses.length > 1) {
          const prevClose = validCloses[validCloses.length - 2];
          let prevValue = prevClose;
          if (alert.trigger_type === 'rsi') {
            const rsiPrev = computeRSI(validCloses.slice(0, -1), alert.indicator_period || 14);
            if (rsiPrev !== null) prevValue = rsiPrev;
          } else if (alert.trigger_type === 'ema') {
            const emaPrev = computeEMA(validCloses.slice(0, -1), alert.indicator_period || 20);
            if (emaPrev !== null) prevValue = emaPrev;
          }
          const prevDiff = prevValue - targetVal;
          const currDiff = currentValue - targetVal;
          if (prevDiff * currDiff < 0) {
            triggered = true;
          }
        }
      }

      if (triggered) {
        await query(
          `UPDATE price_alerts 
           SET status = 'triggered', triggered_at = NOW() 
           WHERE id = $1`,
          [alert.id]
        );
      }
    }
  } catch (err) {
    console.error('Trigger check error:', err);
  }
}

// 1. Fetch user alerts (running simulation first)
router.get('/', authenticate, async (req, res) => {
  try {
    // Run validation sweep
    await checkAlertsForUser(req.user.id);

    const result = await query(
      `SELECT * FROM price_alerts WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch alerts error:', err);
    res.status(500).json({ error: 'Failed to retrieve price alerts' });
  }
});

// 2. Create alert
router.post('/', authenticate, async (req, res) => {
  try {
    const { symbol, target_price, channel, trigger_type, indicator_period, condition } = req.body;
    if (!symbol || !target_price) {
      return res.status(400).json({ error: 'Symbol and target value are required' });
    }

    const alertId = crypto.randomUUID();
    await query(
      `INSERT INTO price_alerts 
       (id, user_id, symbol, target_price, status, channel, trigger_type, indicator_period, condition) 
       VALUES ($1, $2, $3, $4, 'active', $5, $6, $7, $8)`,
      [
        alertId, 
        req.user.id, 
        symbol.toUpperCase(), 
        parseFloat(target_price), 
        channel || 'in-app', 
        trigger_type || 'price', 
        parseInt(indicator_period) || 14, 
        condition || 'above'
      ]
    );

    const result = await query(`SELECT * FROM price_alerts WHERE id = $1`, [alertId]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'Failed to construct alert rule' });
  }
});

// 3. Delete alert
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query(`DELETE FROM price_alerts WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete alert error:', err);
    res.status(500).json({ error: 'Failed to remove alert' });
  }
});

module.exports = router;
