const express = require('express');
const router = express.Router();
const { query } = require('../db/index');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

// GET /api/chart/drawings/:symbol
router.get('/drawings/:symbol', authenticate, async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase();

    const result = await query(
      `SELECT drawings_data, indicators_data, chart_type FROM saved_chart_drawings WHERE user_id = $1 AND symbol = $2`,
      [req.user.id, cleanSymbol]
    );

    if (result.rows.length === 0) {
      return res.json({ drawings: [], indicators: [], chartType: 'candlestick' });
    }

    const row = result.rows[0];
    res.json({
      drawings: JSON.parse(row.drawings_data || '[]'),
      indicators: JSON.parse(row.indicators_data || '[]'),
      chartType: row.chart_type || 'candlestick'
    });
  } catch (err) {
    console.error('❌ Fetch chart drawings error:', err);
    res.status(500).json({ error: 'Failed to fetch saved chart state' });
  }
});

// POST /api/chart/drawings
router.post('/drawings', authenticate, async (req, res) => {
  try {
    const { symbol, drawings, indicators, chartType } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const cleanSymbol = symbol.toUpperCase();
    const drawingsJson = JSON.stringify(drawings || []);
    const indicatorsJson = JSON.stringify(indicators || []);
    const cType = chartType || 'candlestick';
    const id = crypto.randomUUID();

    await query(
      `INSERT INTO saved_chart_drawings (id, user_id, symbol, drawings_data, indicators_data, chart_type, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id, symbol)
       DO UPDATE SET drawings_data = $4, indicators_data = $5, chart_type = $6, updated_at = NOW()`,
      [id, req.user.id, cleanSymbol, drawingsJson, indicatorsJson, cType]
    );

    res.json({ success: true, message: 'Chart drawings & preferences saved successfully' });
  } catch (err) {
    console.error('❌ Save chart drawings error:', err);
    res.status(500).json({ error: 'Failed to save chart state' });
  }
});

module.exports = router;
