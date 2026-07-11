const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { fetchYahooQuote } = require('./marketData');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

// GET /api/paper/portfolio - Fetch virtual balance, holdings, and value
router.get('/portfolio', authenticate, async (req, res) => {
  try {
    const userRes = await query('SELECT virtual_balance FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const virtualBalance = parseFloat(userRes.rows[0].virtual_balance || 1000000.00);

    const holdingsRes = await query(
      'SELECT symbol, quantity, buy_price, buy_date FROM paper_portfolio_items WHERE user_id = $1',
      [req.user.id]
    );

    const holdings = holdingsRes.rows;
    let totalHoldingsValue = 0;

    // Fetch live prices for current valuation
    const holdingsWithLiveInfo = await Promise.all(
      holdings.map(async (item) => {
        let livePrice = parseFloat(item.buy_price);
        try {
          const quote = await fetchYahooQuote(item.symbol);
          if (quote && quote.price) {
            livePrice = parseFloat(quote.price);
          }
        } catch (err) {
          console.warn(`Failed to fetch live price for ${item.symbol}:`, err.message);
        }

        const quantity = parseFloat(item.quantity);
        const buyPrice = parseFloat(item.buy_price);
        const currentValuation = quantity * livePrice;
        const totalCost = quantity * buyPrice;
        const pnl = currentValuation - totalCost;
        const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

        totalHoldingsValue += currentValuation;

        return {
          symbol: item.symbol,
          quantity,
          buyPrice,
          buyDate: item.buy_date,
          livePrice,
          currentValuation,
          pnl,
          pnlPercent,
        };
      })
    );

    res.json({
      virtualBalance,
      totalHoldingsValue,
      totalPortfolioValue: virtualBalance + totalHoldingsValue,
      holdings: holdingsWithLiveInfo,
    });
  } catch (error) {
    console.error('❌ Get paper portfolio error:', error);
    res.status(500).json({ error: 'Failed to retrieve paper portfolio' });
  }
});

// POST /api/paper/trade - Execute simulated buy/sell order
router.post('/trade', authenticate, async (req, res) => {
  const { symbol, action, quantity, price } = req.body;

  if (!symbol || !action || !quantity || !price) {
    return res.status(400).json({ error: 'Missing parameters: symbol, action, quantity, price' });
  }

  const qty = parseFloat(quantity);
  const prc = parseFloat(price);

  if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) {
    return res.status(400).json({ error: 'Invalid quantity or price' });
  }

  try {
    // Start transaction steps manually
    const userRes = await query('SELECT virtual_balance FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const currentBalance = parseFloat(userRes.rows[0].virtual_balance || 1000000.00);

    const cost = qty * prc;

    if (action.toUpperCase() === 'BUY') {
      if (currentBalance < cost) {
        return res.status(400).json({ error: 'Insufficient virtual funds' });
      }

      // Check existing holding
      const existingRes = await query(
        'SELECT id, quantity, buy_price FROM paper_portfolio_items WHERE user_id = $1 AND symbol = $2',
        [req.user.id, symbol]
      );

      if (existingRes.rows.length > 0) {
        const existing = existingRes.rows[0];
        const existingQty = parseFloat(existing.quantity);
        const existingBuyPrice = parseFloat(existing.buy_price);

        const newQty = existingQty + qty;
        const newBuyPrice = (existingQty * existingBuyPrice + cost) / newQty;

        await query(
          'UPDATE paper_portfolio_items SET quantity = $1, buy_price = $2 WHERE id = $3',
          [newQty, newBuyPrice, existing.id]
        );
      } else {
        await query(
          'INSERT INTO paper_portfolio_items (id, user_id, symbol, quantity, buy_price) VALUES ($1, $2, $3, $4, $5)',
          [crypto.randomUUID(), req.user.id, symbol, qty, prc]
        );
      }

      // Update balance
      const newBalance = currentBalance - cost;
      await query('UPDATE users SET virtual_balance = $1 WHERE id = $2', [newBalance, req.user.id]);

      // Log trade
      await query(
        'INSERT INTO paper_trades (id, user_id, symbol, action, quantity, price, pnl) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [crypto.randomUUID(), req.user.id, symbol, 'BUY', qty, prc, 0]
      );

      return res.json({ success: true, message: `Successfully bought ${qty} shares of ${symbol}`, newBalance });
    } else if (action.toUpperCase() === 'SELL') {
      // Check holding
      const existingRes = await query(
        'SELECT id, quantity, buy_price FROM paper_portfolio_items WHERE user_id = $1 AND symbol = $2',
        [req.user.id, symbol]
      );

      if (existingRes.rows.length === 0) {
        return res.status(400).json({ error: 'You do not own this stock virtually' });
      }

      const existing = existingRes.rows[0];
      const existingQty = parseFloat(existing.quantity);
      const existingBuyPrice = parseFloat(existing.buy_price);

      if (existingQty < qty) {
        return res.status(400).json({ error: 'Insufficient quantity to sell' });
      }

      const newQty = existingQty - qty;
      const profitAndLoss = qty * (prc - existingBuyPrice);

      if (newQty === 0) {
        await query('DELETE FROM paper_portfolio_items WHERE id = $1', [existing.id]);
      } else {
        await query('UPDATE paper_portfolio_items SET quantity = $1 WHERE id = $2', [newQty, existing.id]);
      }

      // Update balance
      const newBalance = currentBalance + cost;
      await query('UPDATE users SET virtual_balance = $1 WHERE id = $2', [newBalance, req.user.id]);

      // Log trade
      await query(
        'INSERT INTO paper_trades (id, user_id, symbol, action, quantity, price, pnl) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [crypto.randomUUID(), req.user.id, symbol, 'SELL', qty, prc, profitAndLoss]
      );

      return res.json({ success: true, message: `Successfully sold ${qty} shares of ${symbol}`, newBalance, profitAndLoss });
    } else {
      return res.status(400).json({ error: 'Invalid action. Must be BUY or SELL' });
    }
  } catch (error) {
    console.error('❌ Execute paper trade error:', error);
    res.status(500).json({ error: 'Failed to process virtual order' });
  }
});

// GET /api/paper/history - Get trade logs
router.get('/history', authenticate, async (req, res) => {
  try {
    const historyRes = await query(
      'SELECT symbol, action, quantity, price, pnl, timestamp FROM paper_trades WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100',
      [req.user.id]
    );
    res.json({ history: historyRes.rows });
  } catch (error) {
    console.error('❌ Get paper history error:', error);
    res.status(500).json({ error: 'Failed to retrieve trading logs' });
  }
});

// POST /api/paper/reset - Reset simulated capital to ₹10,00,000
router.post('/reset', authenticate, async (req, res) => {
  try {
    await query('UPDATE users SET virtual_balance = 1000000.00 WHERE id = $1', [req.user.id]);
    await query('DELETE FROM paper_portfolio_items WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM paper_trades WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'Simulated portfolio reset to ₹10,00,000 successfully.' });
  } catch (error) {
    console.error('❌ Reset paper portfolio error:', error);
    res.status(500).json({ error: 'Failed to reset virtual portfolio' });
  }
});

// GET /api/paper/leaderboard - Get user leaderboard based on virtual cash balance
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const leaderboardRes = await query(
      'SELECT name, virtual_balance as "virtualBalance" FROM users ORDER BY virtual_balance DESC LIMIT 20'
    );
    res.json({ leaderboard: leaderboardRes.rows });
  } catch (error) {
    console.error('❌ Get paper leaderboard error:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard ranking' });
  }
});

module.exports = router;
