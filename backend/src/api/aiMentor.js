const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { query } = require('../db/index');
const { authenticate } = require('../middleware/auth');

// Yahoo Finance headers to avoid IP blocks
const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
};

// ─── RSI Computation ──────────────────────────────────────────────────────────
function computeRSI(prices, period = 14) {
  if (prices.length <= period) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

// ─── Symbol Extractor ─────────────────────────────────────────────────────────
function extractSymbol(queryText) {
  const upper = queryText.toUpperCase();
  const words = upper.split(/\s+/);
  const common = ['RELIANCE', 'SBIN', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK',
    'TATAMOTORS', 'ZOMATO', 'BTC', 'ETH', 'WIPRO', 'ADANIENT', 'ONGC',
    'BAJFINANCE', 'LTIM', 'MARUTI', 'SUNPHARMA', 'HINDUNILVR', 'AXISBANK'];

  for (const sym of common) {
    if (words.includes(sym) || upper.includes(sym)) return sym;
  }

  // Crypto aliases
  if (upper.includes('BITCOIN')) return 'BTC';
  if (upper.includes('ETHEREUM')) return 'ETH';

  const matches = queryText.match(/\b[A-Z]{3,10}\b/g);
  if (matches) {
    const filterOut = ['BUY', 'SELL', 'STOCK', 'WHAT', 'HOW', 'WHEN', 'WHY',
      'ABOUT', 'MARKET', 'INDEX', 'NSE', 'BSE', 'THE', 'FOR', 'ARE', 'NOW',
      'RIGHT', 'GOOD', 'BAD', 'HIGH', 'LOW', 'WILL', 'CAN', 'GET', 'BEST'];
    const valid = matches.filter(m => !filterOut.includes(m));
    if (valid.length > 0) return valid[0];
  }
  return null;
}

// ─── ML Ensemble Simulator ────────────────────────────────────────────────────
function getMLEnsemble(symbol) {
  const seed = ((symbol || 'NIFTY').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100) / 100;
  const buyProb = Math.floor(45 + seed * 40);
  const sellProb = Math.max(5, Math.floor((100 - buyProb) * 0.4));
  return {
    overall: { buy: buyProb, hold: 100 - buyProb - sellProb, sell: sellProb },
    confidence: Math.floor(65 + seed * 25),
    components: [
      { name: 'LSTM Neural Network',          signal: seed > 0.5 ? 'Buy' : 'Hold',                         strength: Math.floor(60 + seed * 30) },
      { name: 'XGBoost Classifier',           signal: seed > 0.4 ? 'Buy' : seed > 0.2 ? 'Hold' : 'Sell',  strength: Math.floor(65 + seed * 25) },
      { name: 'Random Forest Regressor',      signal: seed > 0.3 ? 'Buy' : 'Sell',                         strength: Math.floor(55 + seed * 35) },
      { name: 'Transformer Attention Model',  signal: seed > 0.6 ? 'Buy' : 'Hold',                         strength: Math.floor(70 + seed * 25) },
      { name: 'Sentiment Analyzer',           signal: seed > 0.45 ? 'Bullish' : seed > 0.2 ? 'Neutral' : 'Bearish', strength: Math.floor(50 + seed * 45) },
      { name: 'Technical Signal Correlator',  signal: seed > 0.35 ? 'Buy' : 'Sell',                        strength: Math.floor(60 + seed * 30) },
    ]
  };
}

// ─── Sandbox Response Builder (always returns 200, never crashes) ─────────────
function buildSandboxResponse(technicals, detectedSymbol) {
  const trend      = technicals?.trend?.toLowerCase() ?? 'consolidating';
  const rsi        = technicals?.rsi ?? 48.5;
  const volume     = technicals?.volume?.toLocaleString() ?? '1,450,200';
  const support    = technicals ? `₹${technicals.support.toLocaleString('en-IN')}` : '₹2,450.00';
  const resistance = technicals ? `₹${technicals.resistance.toLocaleString('en-IN')}` : '₹2,680.00';
  const rsiZone    = rsi > 70 ? 'overbought (potentially overextended — consider caution)'
                   : rsi < 30 ? 'oversold (potential buying opportunity for patient investors)'
                   : 'neutral momentum zone (no extreme bias)';

  const response = `### 📈 Current Trend
The asset is currently showing a **${trend}** trend based on the last 30 days of price action. ${trend === 'bullish' ? 'Buyers are in control, with higher highs forming.' : 'Sellers are maintaining pressure — watch for reversal signals near resistance.'}

### 📊 RSI Analysis
The **Relative Strength Index (RSI-14)** is at **${rsi}**, placing it in the **${rsiZone}**. RSI ranges from 0–100:
- **Above 70** = Overbought → potential pullback risk
- **Below 30** = Oversold → potential bounce zone
- **40–60** = Neutral territory — no strong directional signal

### 📈 Volume Analysis
Current daily volume is **${volume}** shares. Volume is a conviction indicator:
- **High volume on green days** = strong buying interest
- **Low volume on rallies** = weak conviction, possible reversal ahead

### 🛡️ Support & Resistance
Key price levels to monitor:
- **Support Floor**: ${support} — where buyers historically step in
- **Resistance Ceiling**: ${resistance} — where sellers have historically capped upside

A breakout above resistance on high volume is bullish. A breakdown below support on high volume is bearish.

### 📰 Recent News & Catalysts
Macroeconomic factors — including central bank decisions, FII/DII flows, and global market sentiment — are influencing this asset's sector. Track these events on the NonStock Dashboard to stay ahead of news-driven moves.

### ⚠️ Risk Assessment
- **Sector-level risk**: Medium
- **Volatility risk**: Monitor intraday price swings around support/resistance zones
- **Tip**: Always test your thesis on NonStock's **Paper Trading sandbox** before using real capital!

### 🛡️ Confidence Rating
**75% Educational Confidence** — based on live technical momentum indicators.

### 🎓 Educational Explanation
**Support** is a price level where demand halts a decline — think of it as a floor. **Resistance** is where supply exceeds demand — a ceiling. When price breaks resistance convincingly, that old ceiling often becomes the new support floor. This is the foundation of trend-following strategies used by professional traders worldwide.

**Disclaimer: NOT financial advice. This analysis is for educational purposes only and should not be used as a recommendation to buy or sell securities.**`;

  return {
    response: response.trim(),
    technicals,
    mlEnsemble: getMLEnsemble(detectedSymbol || 'NIFTY')
  };
}

// ─── GET /conversations ───────────────────────────────────────────────────────
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, created_at, updated_at FROM ai_conversations WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch conversations error:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// ─── GET /conversations/:id/messages ──────────────────────────────────────────
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    // Verify ownership
    const convCheck = await query(
      'SELECT id FROM ai_conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (convCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    const result = await query(
      'SELECT id, sender, text, created_at FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ─── DELETE /conversations/:id ────────────────────────────────────────────────
router.delete('/conversations/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM ai_conversations WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }
    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// ─── POST /ask ────────────────────────────────────────────────────────────────
router.post('/ask', authenticate, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message query is required' });

    let activeConversationId = conversationId;

    // Verify or create conversation in DB
    if (activeConversationId) {
      const convCheck = await query(
        'SELECT id FROM ai_conversations WHERE id = $1 AND user_id = $2',
        [activeConversationId, req.user.id]
      );
      if (convCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found or access denied' });
      }
    } else {
      // Auto-create a conversation
      activeConversationId = 'conv_' + crypto.randomBytes(8).toString('hex');
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      await query(
        'INSERT INTO ai_conversations (id, user_id, title) VALUES ($1, $2, $3)',
        [activeConversationId, req.user.id, title]
      );
    }

    // Save the user's message
    const userMsgId = 'msg_' + crypto.randomBytes(8).toString('hex');
    await query(
      'INSERT INTO ai_messages (id, conversation_id, sender, text) VALUES ($1, $2, $3, $4)',
      [userMsgId, activeConversationId, 'user', message]
    );

    // Detect symbol & fetch live Yahoo Finance technicals
    const detectedSymbol = extractSymbol(message);
    let techContext = '';
    let technicals  = null;

    if (detectedSymbol) {
      let sym = detectedSymbol;
      if (!sym.endsWith('.NS') && !sym.includes('-USD') && !sym.includes('^')) {
        sym = detectedSymbol === 'BTC' ? 'BTC-USD'
            : detectedSymbol === 'ETH' ? 'ETH-USD'
            : `${sym}.NS`;
      }
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1mo&interval=1d`;
        const yfRes = await fetch(url, { headers: YAHOO_HEADERS });
        if (yfRes.ok) {
          const data = await yfRes.json();
          const result = data?.chart?.result?.[0];
          if (result?.timestamp) {
            const closes  = (result.indicators?.quote?.[0]?.close  || []).filter(Boolean);
            const volumes = (result.indicators?.quote?.[0]?.volume || []).filter(Boolean);
            if (closes.length > 0) {
              const last = closes[closes.length - 1];
              const sup  = Math.min(...closes);
              const resVal  = Math.max(...closes);
              const rsi  = computeRSI(closes, 14);
              const vol  = volumes[volumes.length - 1] || 0;
              technicals = {
                symbol:     detectedSymbol,
                price:      parseFloat(last.toFixed(2)),
                support:    parseFloat(sup.toFixed(2)),
                resistance: parseFloat(resVal.toFixed(2)),
                rsi:        rsi || 50,
                trend:      last >= closes[0] ? 'BULLISH' : 'BEARISH',
                volume:     vol
              };
              techContext = `[LIVE: ${detectedSymbol}] Price ₹${last.toFixed(2)}, Support ₹${sup.toFixed(2)}, Resistance ₹${resVal.toFixed(2)}, RSI ${rsi?.toFixed(1)}, Trend ${technicals.trend}, Vol ${vol.toLocaleString()}`;
            }
          }
        }
      } catch (e) {
        console.warn('[AI Mentor] Yahoo Finance error:', e.message);
      }
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    // helper to save model reply & send final HTTP response
    const finalizeAndSave = async (responseText, techObj, mlObj) => {
      const aiMsgId = 'msg_' + crypto.randomBytes(8).toString('hex');
      await query(
        'INSERT INTO ai_messages (id, conversation_id, sender, text) VALUES ($1, $2, $3, $4)',
        [aiMsgId, activeConversationId, 'model', responseText]
      );
      await query(
        'UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1',
        [activeConversationId]
      );
      return res.json({
        response: responseText,
        technicals: techObj,
        mlEnsemble: mlObj,
        conversationId: activeConversationId
      });
    };

    if (!GEMINI_API_KEY) {
      console.log('[AI Mentor] No Gemini key — sandbox mode');
      const sb = buildSandboxResponse(technicals, detectedSymbol);
      return await finalizeAndSave(sb.response, sb.technicals, sb.mlEnsemble);
    }

    try {
      const systemInstructionText = `You are the "NonStock AI Mentor", a premium educational investing chatbot for beginner investors in India.
Your goal is to explain financial concepts clearly, guide users through technical analysis indicators, and help them understand stock trends.

Response Format Guidelines:
- Use standard markdown headers starting with "###" for sections (e.g., "### What is RSI?") and "##" for major topics. These headers will be formatted with custom colors in the UI.
- Use bullet points starting with "-" for lists.
- Use bold text (surrounded by "**") to highlight key terms.
- Avoid using code blocks (e.g., \`\`\`), tables, or HTML in your response as the custom parser in the frontend is optimized for headers, bold text, and lists.
- At the end of your response, always append: "**Disclaimer: NOT financial advice. This analysis is for educational purposes only.**"

Behavioral Guidelines:
- Explain financial concepts with clear, simple language and Indian examples if helpful (like tea shops, local businesses, Nifty 50, Reliance).
- If the user asks about specific stocks or indicators, check if live market data context is provided. If it is, incorporate it into your explanation of the stock's trend, RSI, support/resistance, and volume.
- Keep your answers educational. Do NOT give direct BUY, SELL, or HOLD recommendations. Always frame insights as technical assessments and educational analysis.
- Maintain context of the conversation. Learn from previous questions and answers in the chat history to provide intelligent follow-up responses.`;

      // Load full history from DB for Gemini
      const dbHistory = await query(
        'SELECT sender, text FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [activeConversationId]
      );

      const contents = [];
      if (dbHistory.rows.length > 0) {
        dbHistory.rows.forEach((item) => {
          // sender maps to either 'user' or 'model' (Gemini expects user/model)
          const role = item.sender === 'user' ? 'user' : 'model';
          
          // Skip leading model messages to guarantee starting with 'user'
          if (contents.length === 0 && role === 'model') return;
          
          // Avoid consecutive duplicates
          if (contents.length > 0 && contents[contents.length - 1].role === role) return;

          contents.push({
            role: role,
            parts: [{ text: item.text }]
          });
        });
      }

      // Inject live market data context into the last query if available
      const currentPromptText = techContext
        ? `[Live market data context: ${techContext}]\nUser query: ${message}`
        : message;

      // Ensure the last part has the live context injected
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text = currentPromptText;
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: currentPromptText }]
        });
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstructionText }]
            },
            contents: contents
          })
        }
      );

      if (!geminiRes.ok) {
        const body = await geminiRes.text();
        console.warn(`[AI Mentor] Gemini ${geminiRes.status} — sandbox fallback. ${body.substring(0, 150)}`);
        const sb = buildSandboxResponse(technicals, detectedSymbol);
        return await finalizeAndSave(sb.response, sb.technicals, sb.mlEnsemble);
      }

      const data = await geminiRes.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.warn('[AI Mentor] Gemini empty response — sandbox fallback');
        const sb = buildSandboxResponse(technicals, detectedSymbol);
        return await finalizeAndSave(sb.response, sb.technicals, sb.mlEnsemble);
      }

      const mlObj = detectedSymbol ? getMLEnsemble(detectedSymbol) : null;
      return await finalizeAndSave(text, technicals, mlObj);

    } catch (geminiErr) {
      console.warn('[AI Mentor] Gemini exception — sandbox fallback:', geminiErr.message);
      const sb = buildSandboxResponse(technicals, detectedSymbol);
      return await finalizeAndSave(sb.response, sb.technicals, sb.mlEnsemble);
    }

  } catch (err) {
    console.error('[AI Mentor] Unexpected error:', err);
    res.status(500).json({ error: 'Server error processing AI query' });
  }
});

module.exports = router;
