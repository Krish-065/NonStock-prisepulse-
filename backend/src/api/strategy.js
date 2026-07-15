const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

// Yahoo Finance headers to avoid IP blocks
const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
};

// Heuristic indicator computation helpers
function computeSMA(prices, period) {
  const sma = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

function computeEMA(prices, period) {
  const ema = [];
  if (prices.length === 0) return ema;
  const k = 2 / (period + 1);
  
  // First value is simple SMA as seed
  let sum = 0;
  for (let i = 0; i < Math.min(period, prices.length); i++) {
    sum += prices[i];
  }
  let prevEma = sum / Math.min(period, prices.length);
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      ema.push(prevEma);
    } else {
      const val = prices[i] * k + prevEma * (1 - k);
      ema.push(val);
      prevEma = val;
    }
  }
  return ema;
}

function computeRSI(prices, period = 14) {
  const rsi = [];
  if (prices.length <= period) {
    return new Array(prices.length).fill(null);
  }

  let gains = 0;
  let losses = 0;

  // First RSI value seed
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(null);
    } else if (i === period) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    } else {
      const diff = prices[i] - prices[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }
  return rsi;
}

function computeMACD(prices) {
  const ema12 = computeEMA(prices, 12);
  const ema26 = computeEMA(prices, 26);
  const macdLine = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (ema12[i] === null || ema26[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(ema12[i] - ema26[i]);
    }
  }

  // Filter nulls out to compute Signal line
  const firstValidIdx = macdLine.findIndex(x => x !== null);
  const validMacd = macdLine.slice(firstValidIdx);
  const validSignal = computeEMA(validMacd, 9);
  
  const signalLine = new Array(firstValidIdx).fill(null).concat(validSignal);
  const histogram = [];
  for (let i = 0; i < prices.length; i++) {
    if (macdLine[i] === null || signalLine[i] === null) {
      histogram.push(null);
    } else {
      histogram.push(macdLine[i] - signalLine[i]);
    }
  }

  return { macdLine, signalLine, histogram };
}

function computeADX(history, period = 14) {
  const adx = new Array(history.length).fill(null);
  if (history.length <= period * 2) return adx;

  const plusDM = [];
  const minusDM = [];
  const tr = [];

  for (let i = 1; i < history.length; i++) {
    const upMove = history[i].high - history[i - 1].high;
    const downMove = history[i - 1].low - history[i].low;

    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);

    const trVal = Math.max(
      history[i].high - history[i].low,
      Math.abs(history[i].high - history[i - 1].close),
      Math.abs(history[i].low - history[i - 1].close)
    );
    tr.push(trVal);
  }

  // Wilder's smoothing
  let smoothedTR = 0;
  let smoothedPlusDM = 0;
  let smoothedMinusDM = 0;

  for (let i = 0; i < period; i++) {
    smoothedTR += tr[i];
    smoothedPlusDM += plusDM[i];
    smoothedMinusDM += minusDM[i];
  }

  let prevTR = smoothedTR;
  let prevPlusDM = smoothedPlusDM;
  let prevMinusDM = smoothedMinusDM;

  const plusDI = [100 * (prevPlusDM / prevTR)];
  const minusDI = [100 * (prevMinusDM / prevTR)];
  const dx = [100 * Math.abs(plusDI[0] - minusDI[0]) / (plusDI[0] + minusDI[0] || 1)];

  for (let i = period; i < tr.length; i++) {
    smoothedTR = prevTR - (prevTR / period) + tr[i];
    smoothedPlusDM = prevPlusDM - (prevPlusDM / period) + plusDM[i];
    smoothedMinusDM = prevMinusDM - (prevMinusDM / period) + minusDM[i];

    const pDI = 100 * (smoothedPlusDM / smoothedTR);
    const mDI = 100 * (smoothedMinusDM / smoothedTR);
    plusDI.push(pDI);
    minusDI.push(mDI);
    dx.push(100 * Math.abs(pDI - mDI) / (pDI + mDI || 1));

    prevTR = smoothedTR;
    prevPlusDM = smoothedPlusDM;
    prevMinusDM = smoothedMinusDM;
  }

  // Average DX to get ADX
  let dxSum = 0;
  for (let i = 0; i < period; i++) {
    dxSum += dx[i];
  }
  let prevAdx = dxSum / period;
  adx[period * 2 - 1] = prevAdx;

  for (let i = period; i < dx.length; i++) {
    const curAdx = (prevAdx * (period - 1) + dx[i]) / period;
    adx[i + 1] = curAdx;
    prevAdx = curAdx;
  }

  return adx;
}

// Backtesting Core Engine
router.post('/backtest', async (req, res) => {
  try {
    let {
      symbol,
      range = '1y',
      interval = '1d',
      buyConditions = [],
      sellConditions = [],
      buyLogicGate = 'AND',
      sellLogicGate = 'AND',
      stopLoss = 0,
      takeProfit = 0,
      capital = 1000000,
      riskPercent = 2
    } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    symbol = symbol.toUpperCase();
    if (!symbol.endsWith('.NS') && !symbol.includes('-USD') && !symbol.includes('^')) {
      symbol = `${symbol}.NS`;
    }

    // Fetch Yahoo Finance Historical Bars
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
    const response = await fetch(url, { headers: YAHOO_HEADERS });
    if (!response.ok) {
      return res.status(404).json({ error: 'Failed to retrieve market history for backtest' });
    }
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.timestamp) {
      return res.status(404).json({ error: 'No data returned for backtest' });
    }

    const timestamps = result.timestamp;
    const quotes = result.indicators?.quote?.[0] || {};
    const opens   = quotes.open   || [];
    const highs   = quotes.high   || [];
    const lows    = quotes.low    || [];
    const closes  = quotes.close  || [];
    const volumes = quotes.volume || [];

    const bars = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (opens[i] !== null && closes[i] !== null) {
        bars.push({
          time:   timestamps[i] * 1000,
          open:   parseFloat(opens[i]),
          high:   parseFloat(highs[i]),
          low:    parseFloat(lows[i]),
          close:  parseFloat(closes[i]),
          volume: Math.round(volumes[i] || 0)
        });
      }
    }

    if (bars.length < 30) {
      return res.status(400).json({ error: 'Insufficient historical data bars to compute indicators' });
    }

    // Compute technical indicators
    const prices = bars.map(b => b.close);
    const rsi = computeRSI(prices, 14);
    const ema20 = computeEMA(prices, 20);
    const ema50 = computeEMA(prices, 50);
    const sma20 = computeSMA(prices, 20);
    const sma50 = computeSMA(prices, 50);
    const adx = computeADX(bars, 14);
    const { macdLine, signalLine, histogram: macdHist } = computeMACD(prices);

    // Helper evaluation logic
    const evalCondition = (cond, idx) => {
      let val = null;
      let targetVal = cond.targetType === 'value' ? parseFloat(cond.targetValue) : null;
      
      // Resolve value of indicator
      if (cond.indicator === 'RSI') val = rsi[idx];
      else if (cond.indicator === 'Price') val = prices[idx];
      else if (cond.indicator === 'EMA20') val = ema20[idx];
      else if (cond.indicator === 'EMA50') val = ema50[idx];
      else if (cond.indicator === 'SMA20') val = sma20[idx];
      else if (cond.indicator === 'SMA50') val = sma50[idx];
      else if (cond.indicator === 'ADX') val = adx[idx];
      else if (cond.indicator === 'MACD') val = macdLine[idx];

      if (val === null) return false;

      // Resolve target indicator if not static value
      if (cond.targetType === 'indicator') {
        if (cond.targetIndicator === 'EMA20') targetVal = ema20[idx];
        else if (cond.targetIndicator === 'EMA50') targetVal = ema50[idx];
        else if (cond.targetIndicator === 'SMA20') targetVal = sma20[idx];
        else if (cond.targetIndicator === 'SMA50') targetVal = sma50[idx];
        else if (cond.targetIndicator === 'SignalLine') targetVal = signalLine[idx];
      }

      if (targetVal === null) return false;

      // Evaluate operators
      if (cond.operator === 'lessThan') return val < targetVal;
      if (cond.operator === 'greaterThan') return val > targetVal;
      
      // Crosses helpers (checks if crossover happened from previous bar to current bar)
      if (idx === 0) return false;
      let prevVal = null;
      let prevTargetVal = cond.targetType === 'value' ? parseFloat(cond.targetValue) : null;
      
      if (cond.indicator === 'RSI') prevVal = rsi[idx - 1];
      else if (cond.indicator === 'Price') prevVal = bars[idx - 1].close;
      else if (cond.indicator === 'EMA20') prevVal = ema20[idx - 1];
      else if (cond.indicator === 'EMA50') prevVal = ema50[idx - 1];
      else if (cond.indicator === 'SMA20') prevVal = sma20[idx - 1];
      else if (cond.indicator === 'SMA50') prevVal = sma50[idx - 1];
      else if (cond.indicator === 'ADX') prevVal = adx[idx - 1];
      else if (cond.indicator === 'MACD') prevVal = macdLine[idx - 1];

      if (prevVal === null) return false;

      if (cond.targetType === 'indicator') {
        if (cond.targetIndicator === 'EMA20') prevTargetVal = ema20[idx - 1];
        else if (cond.targetIndicator === 'EMA50') prevTargetVal = ema50[idx - 1];
        else if (cond.targetIndicator === 'SMA20') prevTargetVal = sma20[idx - 1];
        else if (cond.targetIndicator === 'SMA50') prevTargetVal = sma50[idx - 1];
        else if (cond.targetIndicator === 'SignalLine') prevTargetVal = signalLine[idx - 1];
      }

      if (prevTargetVal === null) return false;

      if (cond.operator === 'crossesAbove') return prevVal <= prevTargetVal && val > targetVal;
      if (cond.operator === 'crossesBelow') return prevVal >= prevTargetVal && val < targetVal;

      return false;
    };

    // Run chronological bar simulation
    let currentCash = parseFloat(capital);
    let position = null; // { entryPrice, qty, entryDate, entryIndex }
    const trades = [];
    let peakEquity = currentCash;
    let maxDrawdown = 0;
    let maxLoss = 0;

    for (let i = 1; i < bars.length; i++) {
      const currentPrice = bars[i].close;
      const dateStr = new Date(bars[i].time).toLocaleDateString('en-IN');

      // 1. Check Stop Loss / Take Profit on active positions
      if (position) {
        const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        let exitReason = null;
        
        if (stopLoss > 0 && pnlPercent <= -stopLoss) {
          exitReason = 'Stop Loss';
        } else if (takeProfit > 0 && pnlPercent >= takeProfit) {
          exitReason = 'Take Profit';
        }

        if (exitReason) {
          const proceeds = position.qty * currentPrice;
          const profitVal = proceeds - (position.qty * position.entryPrice);
          currentCash += proceeds;
          
          trades.push({
            entryDate: position.entryDate,
            exitDate: dateStr,
            entryPrice: position.entryPrice,
            exitPrice: currentPrice,
            pnl: parseFloat(pnlPercent.toFixed(2)),
            pnlValue: parseFloat(profitVal.toFixed(2)),
            duration: i - position.entryIndex,
            exitReason
          });
          
          if (profitVal < maxLoss) maxLoss = profitVal;
          position = null;
          continue;
        }
      }

      // 2. Evaluate exit/sell signal if position is open
      if (position) {
        let sellSignal = false;
        if (sellConditions.length > 0) {
          const evals = sellConditions.map(cond => evalCondition(cond, i));
          sellSignal = sellLogicGate === 'AND' ? evals.every(x => x) : evals.some(x => x);
        }

        if (sellSignal) {
          const proceeds = position.qty * currentPrice;
          const profitVal = proceeds - (position.qty * position.entryPrice);
          currentCash += proceeds;
          
          trades.push({
            entryDate: position.entryDate,
            exitDate: dateStr,
            entryPrice: position.entryPrice,
            exitPrice: currentPrice,
            pnl: parseFloat((((currentPrice - position.entryPrice) / position.entryPrice) * 100).toFixed(2)),
            pnlValue: parseFloat(profitVal.toFixed(2)),
            duration: i - position.entryIndex,
            exitReason: 'Sell Rule Triggered'
          });

          if (profitVal < maxLoss) maxLoss = profitVal;
          position = null;
          continue;
        }
      }

      // 3. Evaluate entry/buy signal if no position is open
      if (!position) {
        let buySignal = false;
        if (buyConditions.length > 0) {
          const evals = buyConditions.map(cond => evalCondition(cond, i));
          buySignal = buyLogicGate === 'AND' ? evals.every(x => x) : evals.some(x => x);
        }

        if (buySignal) {
          // Determine quantity based on riskPercent and stopLoss
          let qty = 0;
          if (riskPercent > 0 && stopLoss > 0) {
            const riskAmount = currentCash * (parseFloat(riskPercent) / 100);
            const lossPerShare = currentPrice * (parseFloat(stopLoss) / 100);
            qty = Math.floor(riskAmount / lossPerShare);
            const maxQty = Math.floor((currentCash * 0.98) / currentPrice);
            if (qty > maxQty || qty <= 0) {
              qty = maxQty;
            }
          } else {
            const allocation = currentCash * 0.95;
            qty = Math.floor(allocation / currentPrice);
          }
          
          if (qty > 0) {
            position = {
              entryPrice: currentPrice,
              qty,
              entryDate: dateStr,
              entryIndex: i
            };
            currentCash -= qty * currentPrice;
          }
        }
      }

      // 4. Update Max Drawdown tracking
      const currentEquity = currentCash + (position ? position.qty * currentPrice : 0);
      if (currentEquity > peakEquity) peakEquity = currentEquity;
      const drawdown = ((peakEquity - currentEquity) / peakEquity) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Auto close final position at end of period
    if (position) {
      const finalPrice = bars[bars.length - 1].close;
      const finalDate = new Date(bars[bars.length - 1].time).toLocaleDateString('en-IN');
      const proceeds = position.qty * finalPrice;
      const profitVal = proceeds - (position.qty * position.entryPrice);
      currentCash += proceeds;
      
      trades.push({
        entryDate: position.entryDate,
        exitDate: finalDate,
        entryPrice: position.entryPrice,
        exitPrice: finalPrice,
        pnl: parseFloat((((finalPrice - position.entryPrice) / position.entryPrice) * 100).toFixed(2)),
        pnlValue: parseFloat(profitVal.toFixed(2)),
        duration: (bars.length - 1) - position.entryIndex,
        exitReason: 'Period End'
      });
      
      if (profitVal < maxLoss) maxLoss = profitVal;
    }

    // Compute key statistics
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    const winRate = totalTrades > 0 ? parseFloat(((wins.length / totalTrades) * 100).toFixed(2)) : 0;
    const netProfitValue = currentCash - capital;
    const netProfitPercent = parseFloat(((netProfitValue / capital) * 100).toFixed(2));
    
    // Average holding time
    const avgHoldingTime = totalTrades > 0 
      ? Math.round(trades.reduce((sum, t) => sum + t.duration, 0) / totalTrades)
      : 0;

    // Sharpe Ratio (simplified metric: Avg Trade PnL / SD of Trade PnLs)
    let sharpeRatio = 0;
    if (totalTrades > 1) {
      const pnls = trades.map(t => t.pnl);
      const avgPnl = pnls.reduce((s, x) => s + x, 0) / totalTrades;
      const variance = pnls.reduce((s, x) => s + Math.pow(x - avgPnl, 2), 0) / (totalTrades - 1);
      const sd = Math.sqrt(variance);
      sharpeRatio = sd > 0 ? parseFloat((avgPnl / sd).toFixed(2)) : 0;
    } else if (totalTrades === 1) {
      sharpeRatio = trades[0].pnl > 0 ? 1.0 : -1.0;
    }

    res.json({
      winRate,
      profit: parseFloat(netProfitPercent.toFixed(2)),
      profitVal: parseFloat(netProfitValue.toFixed(2)),
      drawdown: parseFloat(maxDrawdown.toFixed(2)),
      sharpeRatio,
      maxLoss: parseFloat(Math.abs(maxLoss).toFixed(2)),
      avgHoldingTime,
      trades
    });

  } catch (err) {
    console.error('Backtester calculation error:', err);
    res.status(500).json({ error: 'Server error during backtester computations' });
  }
});

// Save Algorithmic Strategy
router.post('/saved', authenticate, async (req, res) => {
  try {
    const { name, indicators, stopLoss, takeProfit, capital, riskPercent } = req.body;
    if (!name || !indicators) {
      return res.status(400).json({ error: 'Strategy name and indicators details are required' });
    }

    const id = crypto.randomUUID();
    await query(
      `INSERT INTO saved_strategies (id, user_id, name, indicators, stop_loss, take_profit, capital, risk_percent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, req.user.id, name, JSON.stringify(indicators), stopLoss || 0, takeProfit || 0, capital || 100000, riskPercent || 2]
    );

    res.status(201).json({ message: 'Strategy saved successfully', strategyId: id });
  } catch (err) {
    console.error('Save strategy error:', err);
    res.status(500).json({ error: 'Failed to save strategy configuration' });
  }
});

// List Saved Strategies
router.get('/saved', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, indicators, stop_loss as "stopLoss", take_profit as "takeProfit", capital, risk_percent as "riskPercent", created_at as "createdAt"
       FROM saved_strategies WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    
    // Parse json strings
    const list = result.rows.map(row => ({
      ...row,
      indicators: JSON.parse(row.indicators)
    }));

    res.json(list);
  } catch (err) {
    console.error('List strategies error:', err);
    res.status(500).json({ error: 'Failed to retrieve saved strategies' });
  }
});

// Delete Saved Strategy
router.delete('/saved/:id', authenticate, async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM saved_strategies WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.json({ message: 'Strategy deleted successfully' });
  } catch (err) {
    console.error('Delete strategy error:', err);
    res.status(500).json({ error: 'Failed to delete strategy' });
  }
});

// Share strategy on Community board
router.post('/share', authenticate, async (req, res) => {
  try {
    const { strategyName, indicators, winRate, netProfit, drawdown } = req.body;
    if (!strategyName || !indicators) {
      return res.status(400).json({ error: 'Strategy details are required to share' });
    }

    const id = crypto.randomUUID();
    await query(
      `INSERT INTO shared_strategies (id, user_id, strategy_name, indicators, win_rate, net_profit, drawdown)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, req.user.id, strategyName, JSON.stringify(indicators), winRate || 0, netProfit || 0, drawdown || 0]
    );

    res.status(201).json({ message: 'Strategy shared with the community successfully!', sharedId: id });
  } catch (err) {
    console.error('Share strategy error:', err);
    res.status(500).json({ error: 'Failed to publish strategy to community feed' });
  }
});

// Get all shared strategies from the community board
router.get('/shared', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT s.id, s.strategy_name as "strategyName", s.indicators, s.win_rate as "winRate", s.net_profit as "netProfit", 
              s.drawdown, s.copied_count as "copiedCount", s.created_at as "createdAt", u.name as "authorName"
       FROM shared_strategies s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.win_rate DESC, s.created_at DESC`
    );

    const list = result.rows.map(row => ({
      ...row,
      indicators: JSON.parse(row.indicators)
    }));

    res.json(list);
  } catch (err) {
    console.error('Get shared strategies error:', err);
    res.status(500).json({ error: 'Failed to retrieve shared feed' });
  }
});

// Get specific shared strategy details by ID
router.get('/shared/:id', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT s.id, s.strategy_name as "strategyName", s.indicators, s.win_rate as "winRate", s.net_profit as "netProfit", 
              s.drawdown, s.copied_count as "copiedCount", s.created_at as "createdAt", u.name as "authorName"
       FROM shared_strategies s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shared strategy template not found' });
    }

    const row = result.rows[0];
    const strategy = {
      ...row,
      indicators: JSON.parse(row.indicators)
    };

    res.json(strategy);
  } catch (err) {
    console.error('Get shared strategy details error:', err);
    res.status(500).json({ error: 'Failed to retrieve shared strategy' });
  }
});

// Copy community strategy to user's saved list
router.post('/copy/:id', authenticate, async (req, res) => {
  try {
    const sharedRes = await query(
      `SELECT * FROM shared_strategies WHERE id = $1`,
      [req.params.id]
    );
    if (sharedRes.rows.length === 0) {
      return res.status(404).json({ error: 'Shared strategy not found' });
    }
    const shared = sharedRes.rows[0];

    const newSavedId = crypto.randomUUID();
    await query(
      `INSERT INTO saved_strategies (id, user_id, name, indicators, stop_loss, take_profit, capital, risk_percent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [newSavedId, req.user.id, `Copy of ${shared.strategy_name}`, shared.indicators, 5.0, 10.0, 1000000.0, 2.0]
    );

    // Increment copied count
    await query(
      `UPDATE shared_strategies SET copied_count = copied_count + 1 WHERE id = $1`,
      [req.params.id]
    );

    res.status(201).json({ message: 'Strategy copied to your dashboard', strategyId: newSavedId });
  } catch (err) {
    console.error('Copy strategy error:', err);
    res.status(500).json({ error: 'Failed to copy strategy' });
  }
});

module.exports = router;
