const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { fetchYahooQuote } = require('./marketData');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

// Helper to determine if a symbol is an Indian stock/index (native currency is INR)
const isIndianSymbol = (symbol) => {
  if (!symbol) return false;
  const s = symbol.toUpperCase();
  const isCrypto = s.endsWith('-USD') || s.endsWith('-USDT') || ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA'].includes(s);
  const isForex = s.endsWith('=X') || (s.includes('USD') && s.includes('INR')) || s.includes('EURUSD') || s.includes('GBPUSD');
  const isCommodity = s.endsWith('=F');
  if (isCrypto || isForex || isCommodity) return false;
  return s.endsWith('.NS') || s.endsWith('.BO') || ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'NIFTY', 'SENSEX', 'BANKNIFTY', 'NSEI', 'BSESN'].includes(s);
};

// Helper to fetch live USD/INR exchange rate
async function getUsdInrRate() {
  try {
    const quote = await fetchYahooQuote('INR=X');
    if (quote && quote.price) {
      return parseFloat(quote.price);
    }
  } catch (err) {
    console.warn('⚠️ Failed to fetch live USD/INR rate, using fallback 83.5:', err.message);
  }
  return 83.5;
}

// GET /api/paper/portfolio - Fetch virtual balance, holdings, value (all values denominated in USD)
router.get('/portfolio', authenticate, async (req, res) => {
  try {
    const userRes = await query('SELECT virtual_balance, virtual_refill_count, consecutive_sl_hits, is_pro FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPro = userRes.rows[0].is_pro || false;
    let virtualBalance = parseFloat(userRes.rows[0].virtual_balance || 50000.00);
    
    // Auto upgrade Pro users to $1,000,000 virtual balance
    if (isPro && virtualBalance <= 50000.00) {
      virtualBalance = 1000000.00;
      await query('UPDATE users SET virtual_balance = $1 WHERE id = $2', [virtualBalance, req.user.id]);
    }
    const refillCount = parseInt(userRes.rows[0].virtual_refill_count || 1);
    const consecutiveSlHits = parseInt(userRes.rows[0].consecutive_sl_hits || 0);

    const holdingsRes = await query(
      'SELECT symbol, quantity, buy_price, buy_date, stop_loss, take_profit FROM paper_portfolio_items WHERE user_id = $1',
      [req.user.id]
    );

    const holdings = holdingsRes.rows;
    const usdInrRate = await getUsdInrRate();
    let totalHoldingsValue = 0;

    // Fetch live prices for valuation
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
        
        const isIndian = isIndianSymbol(item.symbol);
        
        // Convert native prices to USD for portfolio value aggregation
        const buyPriceUsd = isIndian ? buyPrice / usdInrRate : buyPrice;
        const livePriceUsd = isIndian ? livePrice / usdInrRate : livePrice;

        const currentValuation = quantity * livePriceUsd;
        const totalCost = quantity * buyPriceUsd;
        const pnl = currentValuation - totalCost;
        const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

        totalHoldingsValue += currentValuation;

        return {
          symbol: item.symbol,
          quantity,
          buyPrice, // Native (INR for Indian stocks, USD for others)
          buyDate: item.buy_date,
          livePrice, // Native
          currentValuation, // USD
          pnl, // USD
          pnlPercent,
          isIndian,
          stopLoss: item.stop_loss ? parseFloat(item.stop_loss) : null,
          takeProfit: item.take_profit ? parseFloat(item.take_profit) : null
        };
      })
    );

    res.json({
      virtualBalance,
      refillCount,
      consecutiveSlHits,
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
  const { symbol, action, quantity, price, triggerReason, pendingOrderId } = req.body;

  if (!symbol || !action || !quantity || !price) {
    return res.status(400).json({ error: 'Missing parameters: symbol, action, quantity, price' });
  }

  const qty = parseFloat(quantity);
  const prc = parseFloat(price); // Native price

  if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) {
    return res.status(400).json({ error: 'Invalid quantity or price' });
  }

  try {
    const userRes = await query('SELECT virtual_balance FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const currentBalance = parseFloat(userRes.rows[0].virtual_balance || 50000.00);

    const isIndian = isIndianSymbol(symbol);
    const usdInrRate = await getUsdInrRate();
    let costUsd = isIndian ? (qty * prc) / usdInrRate : (qty * prc);
    let isPendingOrderFill = false;

    if (pendingOrderId) {
      const pendingRes = await query('SELECT id, action FROM paper_pending_orders WHERE id = $1 AND user_id = $2', [pendingOrderId, req.user.id]);
      if (pendingRes.rows.length > 0) {
        isPendingOrderFill = true;
        // For BUY, funds were already reserved/deducted when placing order
        if (action.toUpperCase() === 'BUY') {
          costUsd = 0;
        }
        await query('DELETE FROM paper_pending_orders WHERE id = $1 AND user_id = $2', [pendingOrderId, req.user.id]);
      }
    }

    if (action.toUpperCase() === 'BUY') {
      if (!isPendingOrderFill && currentBalance < costUsd) {
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
        const newBuyPrice = (existingQty * existingBuyPrice + qty * prc) / newQty;

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
      const newBalance = currentBalance - costUsd;
      await query('UPDATE users SET virtual_balance = $1 WHERE id = $2', [newBalance, req.user.id]);

      // Log to balance history
      await query(
        'INSERT INTO paper_balance_history (id, user_id, type, amount, new_balance, description) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          crypto.randomUUID(),
          req.user.id,
          'TRADE_BUY',
          -costUsd,
          newBalance,
          isPendingOrderFill
            ? `Filled pending BUY order: ${qty} units of ${symbol} at ${isIndian ? '₹' : '$'}${prc}`
            : `Bought ${qty} units of ${symbol} at ${isIndian ? '₹' : '$'}${prc}`
        ]
      );

      // Log trade
      await query(
        'INSERT INTO paper_trades (id, user_id, symbol, action, quantity, price, pnl, buy_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [crypto.randomUUID(), req.user.id, symbol, 'BUY', qty, prc, 0, prc]
      );

      return res.json({ 
        success: true, 
        message: isPendingOrderFill 
          ? `Filled: Pending BUY order for ${qty} units of ${symbol} at ${isIndian ? '₹' : '$'}${prc}`
          : `Successfully bought ${qty} units of ${symbol} for $${costUsd.toFixed(2)}`, 
        newBalance 
      });
    } else if (action.toUpperCase() === 'SELL') {
      // Check holding
      const existingRes = await query(
        'SELECT id, quantity, buy_price FROM paper_portfolio_items WHERE user_id = $1 AND symbol = $2',
        [req.user.id, symbol]
      );

      if (existingRes.rows.length === 0) {
        return res.status(400).json({ error: 'You do not own this asset virtually' });
      }

      const existing = existingRes.rows[0];
      const existingQty = parseFloat(existing.quantity);
      const existingBuyPrice = parseFloat(existing.buy_price);

      if (existingQty < qty) {
        return res.status(400).json({ error: 'Insufficient quantity to sell' });
      }

      const newQty = existingQty - qty;

      // Calculate realized PnL in USD
      const buyPriceUsd = isIndian ? existingBuyPrice / usdInrRate : existingBuyPrice;
      const sellPriceUsd = isIndian ? prc / usdInrRate : prc;
      const profitAndLossUsd = qty * (sellPriceUsd - buyPriceUsd);

      if (newQty === 0) {
        await query('DELETE FROM paper_portfolio_items WHERE id = $1', [existing.id]);
      } else {
        await query('UPDATE paper_portfolio_items SET quantity = $1 WHERE id = $2', [newQty, existing.id]);
      }

      // Update balance
      const newBalance = currentBalance + costUsd;
      await query('UPDATE users SET virtual_balance = $1 WHERE id = $2', [newBalance, req.user.id]);

      // Log to balance history
      await query(
        'INSERT INTO paper_balance_history (id, user_id, type, amount, new_balance, description) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          crypto.randomUUID(),
          req.user.id,
          'TRADE_SELL',
          costUsd,
          newBalance,
          isPendingOrderFill
            ? `Filled pending SELL order: ${qty} units of ${symbol} at ${isIndian ? '₹' : '$'}${prc} (P&L: $${profitAndLossUsd.toFixed(2)})`
            : `Sold ${qty} units of ${symbol} at ${isIndian ? '₹' : '$'}${prc} (Realized P&L: $${profitAndLossUsd.toFixed(2)})`
        ]
      );

      // Handle Stop Loss vs Take Profit hit tracking
      if (triggerReason === 'stop_loss') {
        await query('UPDATE users SET consecutive_sl_hits = consecutive_sl_hits + 1 WHERE id = $1', [req.user.id]);
      } else if (triggerReason === 'take_profit') {
        await query('UPDATE users SET consecutive_sl_hits = 0 WHERE id = $1', [req.user.id]);
      }

      // Log trade
      await query(
        'INSERT INTO paper_trades (id, user_id, symbol, action, quantity, price, pnl, buy_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [crypto.randomUUID(), req.user.id, symbol, 'SELL', qty, prc, profitAndLossUsd, existingBuyPrice]
      );

      return res.json({ 
        success: true, 
        message: isPendingOrderFill
          ? `Filled: Pending SELL order for ${qty} units of ${symbol} at ${isIndian ? '₹' : '$'}${prc}`
          : `Successfully sold ${qty} units of ${symbol} for $${costUsd.toFixed(2)}`, 
        newBalance, 
        profitAndLoss: profitAndLossUsd 
      });
    } else {
      return res.status(400).json({ error: 'Invalid action. Must be BUY or SELL' });
    }
  } catch (error) {
    console.error('❌ Execute paper trade error:', error);
    res.status(500).json({ error: 'Failed to process virtual order' });
  }
});

// POST /api/paper/set-sltp - Save Stop Loss and Take Profit levels for an active position
router.post('/set-sltp', authenticate, async (req, res) => {
  const { symbol, stopLoss, takeProfit } = req.body;
  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  try {
    const sl = stopLoss ? parseFloat(stopLoss) : null;
    const tp = takeProfit ? parseFloat(takeProfit) : null;

    await query(
      'UPDATE paper_portfolio_items SET stop_loss = $1, take_profit = $2 WHERE user_id = $3 AND symbol = $4',
      [sl, tp, req.user.id, symbol]
    );

    res.json({ success: true, message: `Successfully updated SL/TP levels for ${symbol}` });
  } catch (error) {
    console.error('❌ Set SL/TP error:', error);
    res.status(500).json({ error: 'Failed to update SL/TP levels' });
  }
});

// POST /api/paper/refill - Request a virtual $50,000 balance refill (Max twice per account for standard users)
router.post('/refill', authenticate, async (req, res) => {
  try {
    const userRes = await query('SELECT virtual_balance, virtual_refill_count, is_pro FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPro = userRes.rows[0].is_pro || false;
    const currentBalance = parseFloat(userRes.rows[0].virtual_balance || 0);
    const refillCount = parseInt(userRes.rows[0].virtual_refill_count || 1);

    if (!isPro && refillCount >= 2) {
      return res.status(400).json({ error: 'Maximum virtual refill limit reached. You can only refill your account twice.' });
    }

    const refillAmount = isPro ? 1000000.00 : 50000.00;
    const newBalance = currentBalance + refillAmount;
    const newRefillCount = refillCount + 1;

    await query(
      'UPDATE users SET virtual_balance = $1, virtual_refill_count = $2 WHERE id = $3',
      [newBalance, newRefillCount, req.user.id]
    );

    // Log to balance history
    await query(
      'INSERT INTO paper_balance_history (id, user_id, type, amount, new_balance, description) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        crypto.randomUUID(),
        req.user.id,
        'REFILL',
        refillAmount,
        newBalance,
        'Virtual account refill deposit'
      ]
    );

    res.json({
      success: true,
      message: isPro 
        ? 'Your Pro account has been refilled with another $1,000,000!' 
        : 'Your account has been refilled with another $50,000! Warning: This is your final chance—make it a learned opportunity!',
      newBalance,
      refillCount: newRefillCount
    });
  } catch (error) {
    console.error('❌ Refill paper portfolio error:', error);
    res.status(500).json({ error: 'Failed to refill virtual portfolio' });
  }
});

// GET /api/paper/history - Get trade logs
router.get('/history', authenticate, async (req, res) => {
  try {
    const historyRes = await query(
      'SELECT id, symbol, action, quantity, price, pnl, buy_price as "buyPrice", timestamp FROM paper_trades WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100',
      [req.user.id]
    );
    res.json({ history: historyRes.rows });
  } catch (error) {
    console.error('❌ Get paper history error:', error);
    res.status(500).json({ error: 'Failed to retrieve trading logs' });
  }
});

// POST /api/paper/reset - Reset simulated capital to $50,000 (or $1,000,000 for Pro)
router.post('/reset', authenticate, async (req, res) => {
  try {
    const userRes = await query('SELECT is_pro FROM users WHERE id = $1', [req.user.id]);
    const isPro = userRes.rows[0]?.is_pro || false;
    const resetBalance = isPro ? 1000000.00 : 50000.00;

    await query('UPDATE users SET virtual_balance = $1, consecutive_sl_hits = 0 WHERE id = $2', [resetBalance, req.user.id]);
    await query('DELETE FROM paper_portfolio_items WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM paper_trades WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM paper_pending_orders WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM paper_balance_history WHERE user_id = $1', [req.user.id]);

    // Initial deposit log
    await query(
      'INSERT INTO paper_balance_history (id, user_id, type, amount, new_balance, description) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        crypto.randomUUID(),
        req.user.id,
        'RESET',
        resetBalance,
        resetBalance,
        'Simulated portfolio reset and initial deposit'
      ]
    );

    res.json({ success: true, message: `Simulated portfolio reset to $${resetBalance.toLocaleString()} successfully.` });
  } catch (error) {
    console.error('❌ Reset paper portfolio error:', error);
    res.status(500).json({ error: 'Failed to reset virtual portfolio' });
  }
});

// POST /api/paper/orders - Place a pending limit/stop order
router.post('/orders', authenticate, async (req, res) => {
  const { symbol, action, type, quantity, price, triggerPrice } = req.body;

  if (!symbol || !action || !type || !quantity || !price) {
    return res.status(400).json({ error: 'Missing parameters: symbol, action, type, quantity, price' });
  }

  const qty = parseFloat(quantity);
  const prc = parseFloat(price);
  const trig = triggerPrice ? parseFloat(triggerPrice) : null;

  if (isNaN(qty) || qty <= 0 || isNaN(prc) || prc <= 0) {
    return res.status(400).json({ error: 'Invalid quantity or price' });
  }

  try {
    const isIndian = isIndianSymbol(symbol);
    const usdInrRate = await getUsdInrRate();
    const costUsd = isIndian ? (qty * prc) / usdInrRate : (qty * prc);

    // If BUY, reserve funds immediately
    if (action.toUpperCase() === 'BUY') {
      const userRes = await query('SELECT virtual_balance FROM users WHERE id = $1', [req.user.id]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const currentBalance = parseFloat(userRes.rows[0].virtual_balance || 0);

      if (currentBalance < costUsd) {
        return res.status(400).json({ error: 'Insufficient virtual funds to place order' });
      }

      const newBalance = currentBalance - costUsd;
      await query('UPDATE users SET virtual_balance = $1 WHERE id = $2', [newBalance, req.user.id]);

      // Log reservation to balance history
      await query(
        'INSERT INTO paper_balance_history (id, user_id, type, amount, new_balance, description) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          crypto.randomUUID(),
          req.user.id,
          'ORDER_RESERVE',
          -costUsd,
          newBalance,
          `Reserved funds for pending BUY ${type} order: ${qty} units of ${symbol} at ${isIndian ? '₹' : '$'}${prc}`
        ]
      );
    } else {
      // If SELL, check quantity
      const existingRes = await query(
        'SELECT quantity FROM paper_portfolio_items WHERE user_id = $1 AND symbol = $2',
        [req.user.id, symbol]
      );
      const existingQty = existingRes.rows.length > 0 ? parseFloat(existingRes.rows[0].quantity) : 0;
      if (existingQty < qty) {
        return res.status(400).json({ error: 'Insufficient quantity in holdings to place SELL order' });
      }
    }

    const orderId = 'ord_' + crypto.randomBytes(4).toString('hex');
    await query(
      'INSERT INTO paper_pending_orders (id, user_id, symbol, action, type, quantity, price, trigger_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [orderId, req.user.id, symbol, action.toUpperCase(), type.toLowerCase(), qty, prc, trig]
    );

    res.json({
      success: true,
      message: `Pending ${action} order placed successfully.`,
      order: { id: orderId, symbol, action, type, quantity: qty, price: prc, triggerPrice: trig }
    });
  } catch (error) {
    console.error('❌ Place pending order error:', error);
    res.status(500).json({ error: 'Failed to place pending order' });
  }
});

// GET /api/paper/orders - Retrieve active pending orders
router.get('/orders', authenticate, async (req, res) => {
  try {
    const ordersRes = await query(
      'SELECT id, symbol, action, type, quantity, price, trigger_price as "triggerPrice", timestamp FROM paper_pending_orders WHERE user_id = $1 ORDER BY timestamp DESC',
      [req.user.id]
    );
    res.json({ orders: ordersRes.rows });
  } catch (error) {
    console.error('❌ Get pending orders error:', error);
    res.status(500).json({ error: 'Failed to retrieve pending orders' });
  }
});

// DELETE /api/paper/orders/:id - Cancel a pending order (restores balance for BUY orders)
router.delete('/orders/:id', authenticate, async (req, res) => {
  try {
    const orderRes = await query(
      'SELECT symbol, action, type, quantity, price FROM paper_pending_orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pending order not found' });
    }

    const order = orderRes.rows[0];
    const qty = parseFloat(order.quantity);
    const prc = parseFloat(order.price);

    // If BUY, refund reserved funds
    if (order.action.toUpperCase() === 'BUY') {
      const isIndian = isIndianSymbol(order.symbol);
      const usdInrRate = await getUsdInrRate();
      const refundUsd = isIndian ? (qty * prc) / usdInrRate : (qty * prc);

      const userRes = await query('SELECT virtual_balance FROM users WHERE id = $1', [req.user.id]);
      const currentBalance = parseFloat(userRes.rows[0].virtual_balance || 0);
      const newBalance = currentBalance + refundUsd;

      await query('UPDATE users SET virtual_balance = $1 WHERE id = $2', [newBalance, req.user.id]);

      // Log refund to balance history
      await query(
        'INSERT INTO paper_balance_history (id, user_id, type, amount, new_balance, description) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          crypto.randomUUID(),
          req.user.id,
          'ORDER_CANCEL',
          refundUsd,
          newBalance,
          `Cancelled pending BUY ${order.type} order of ${qty} units of ${order.symbol}; returned reserved funds`
        ]
      );
    }

    await query('DELETE FROM paper_pending_orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

    res.json({ success: true, message: 'Pending order cancelled and balance updated.' });
  } catch (error) {
    console.error('❌ Cancel pending order error:', error);
    res.status(500).json({ error: 'Failed to cancel pending order' });
  }
});

// GET /api/paper/balance-history - Retrieve balance history logs
router.get('/balance-history', authenticate, async (req, res) => {
  try {
    const historyRes = await query(
      'SELECT type, amount, new_balance as "newBalance", description, timestamp FROM paper_balance_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100',
      [req.user.id]
    );
    res.json({ history: historyRes.rows });
  } catch (error) {
    console.error('❌ Get paper balance history error:', error);
    res.status(500).json({ error: 'Failed to retrieve balance history' });
  }
});

// GET /api/paper/leaderboard - Get user leaderboard based on virtual USD cash balance
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
