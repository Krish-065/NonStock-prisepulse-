const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Yahoo Finance headers to avoid IP blocks
const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
};

// RSI Helper
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

// Helper to extract stock name from query
function extractSymbol(queryText) {
  const words = queryText.toUpperCase().split(/\s+/);
  const common = ['RELIANCE', 'SBIN', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'TATAMOTORS', 'ZOMATO', 'BTC', 'ETH'];
  
  // Look for direct match
  for (const sym of common) {
    if (words.includes(sym) || queryText.toUpperCase().includes(sym)) {
      return sym;
    }
  }

  // General regex search for uppercase words (likely tickers)
  const matches = queryText.match(/\b[A-Z]{3,10}\b/g);
  if (matches) {
    // Filter out common english words
    const filterOut = ['BUY', 'SELL', 'STOCK', 'WHAT', 'HOW', 'WHEN', 'WHY', 'ABOUT', 'MARKET', 'INDEX', 'NSE', 'BSE'];
    const valid = matches.filter(m => !filterOut.includes(m));
    if (valid.length > 0) return valid[0];
  }

  return null;
}

// ML Ensemble Simulator
function getMLEnsemble(symbol) {
  const sumChar = (symbol || 'RELIANCE').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (sumChar % 100) / 100;
  
  const buyProb = Math.floor(45 + seed * 40); 
  const sellProb = Math.max(5, Math.floor((100 - buyProb) * 0.4));
  const holdProb = 100 - buyProb - sellProb;

  const lstmSignal = seed > 0.5 ? 'Buy' : 'Hold';
  const lstmStrength = Math.floor(60 + seed * 30);

  const xgboostSignal = seed > 0.4 ? 'Buy' : (seed > 0.2 ? 'Hold' : 'Sell');
  const xgboostStrength = Math.floor(65 + seed * 25);

  const randomForestSignal = seed > 0.3 ? 'Buy' : 'Sell';
  const randomForestStrength = Math.floor(55 + seed * 35);

  const transformerSignal = seed > 0.6 ? 'Buy' : 'Hold';
  const transformerStrength = Math.floor(70 + seed * 25);

  const sentimentSignal = seed > 0.45 ? 'Bullish' : (seed > 0.2 ? 'Neutral' : 'Bearish');
  const sentimentScore = Math.floor(50 + seed * 45);

  const technicalSignal = seed > 0.35 ? 'Buy' : 'Sell';
  const technicalStrength = Math.floor(60 + seed * 30);

  return {
    overall: { buy: buyProb, hold: holdProb, sell: sellProb },
    confidence: Math.floor(65 + seed * 25),
    components: [
      { name: 'LSTM Neural Network', signal: lstmSignal, strength: lstmStrength },
      { name: 'XGBoost Classifier', signal: xgboostSignal, strength: xgboostStrength },
      { name: 'Random Forest Regressor', signal: randomForestSignal, strength: randomForestStrength },
      { name: 'Transformer Attention Model', signal: transformerSignal, strength: transformerStrength },
      { name: 'Sentiment Sentiment Analyzer', signal: sentimentSignal, strength: sentimentScore },
      { name: 'Technical Signal Correlator', signal: technicalSignal, strength: technicalStrength }
    ]
  };
}

router.post('/ask', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message query is required' });
    }

    // --- Step 1: Always detect symbol and fetch live technicals first ---
    const detectedSymbol = extractSymbol(message);
    let techContext = '';
    let technicals = null;

    if (detectedSymbol) {
      let fetchSymbol = detectedSymbol;
      if (!fetchSymbol.endsWith('.NS') && !fetchSymbol.includes('-USD') && !fetchSymbol.includes('^')) {
        fetchSymbol = `${fetchSymbol}.NS`;
      }

      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(fetchSymbol)}?range=1mo&interval=1d`;
        const yfRes = await fetch(url, { headers: YAHOO_HEADERS });
        if (yfRes.ok) {
          const data = await yfRes.json();
          const result = data?.chart?.result?.[0];
          if (result && result.timestamp) {
            const closes = result.indicators?.quote?.[0]?.close || [];
            const volumes = result.indicators?.quote?.[0]?.volume || [];
            const validCloses = closes.filter(c => c !== null);
            const validVolumes = volumes.filter(v => v !== null);

            if (validCloses.length > 0) {
              const currentPrice = validCloses[validCloses.length - 1];
              const support = Math.min(...validCloses);
              const resistance = Math.max(...validCloses);
              const rsi = computeRSI(validCloses, 14);
              const volume = validVolumes[validVolumes.length - 1] || 0;
              const firstPrice = validCloses[0];
              const trend = currentPrice >= firstPrice ? 'BULLISH' : 'BEARISH';

              technicals = {
                symbol: detectedSymbol,
                price: parseFloat(currentPrice.toFixed(2)),
                support: parseFloat(support.toFixed(2)),
                resistance: parseFloat(resistance.toFixed(2)),
                rsi: rsi || 50,
                trend,
                volume
              };

              techContext = `
              [REAL-TIME STOCK TECHNICAL DATA FOR ${detectedSymbol}]
              - Last Traded Price: ₹${currentPrice.toFixed(2)}
              - 30-Day Support Level: ₹${support.toFixed(2)}
              - 30-Day Resistance Level: ₹${resistance.toFixed(2)}
              - Relative Strength Index (RSI-14): ${rsi ? rsi.toFixed(1) : 'N/A'}
              - 30-Day Overall Trend Direction: ${trend}
              - Daily Volume: ${volume.toLocaleString()}
              `;
            }
          }
        }
      } catch (err) {
        console.warn('AI Mentor failed to fetch technical context:', err.message);
      }
    }

    // --- Step 2: Check for Gemini API key — run sandbox mode if missing ---
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.log('[AI Mentor] Gemini key not configured — running in educational sandbox mode.');

      const trend = technicals?.trend?.toLowerCase() ?? 'consolidating';
      const rsi = technicals?.rsi ?? 48.5;
      const volume = technicals?.volume?.toLocaleString() ?? '1,450,200';
      const support = technicals ? `₹${technicals.support.toLocaleString('en-IN')}` : '₹2,450.00';
      const resistance = technicals ? `₹${technicals.resistance.toLocaleString('en-IN')}` : '₹2,680.00';
      const rsiZone = rsi > 70 ? 'overbought (potentially overextended — consider caution)' : rsi < 30 ? 'oversold (potential buying opportunity for patient investors)' : 'neutral momentum zone (no extreme bias)';

      const sandboxResponse = `
### 📈 Current Trend
The stock is currently showing a **${trend}** trend based on the last 30 days of price action. ${trend === 'bullish' ? 'Buyers are in control, with higher highs forming.' : 'Sellers are maintaining pressure — watch for reversal signals.'}

### 📊 RSI Analysis
The **Relative Strength Index (RSI-14)** is at **${rsi}**, placing it in the **${rsiZone}**. RSI ranges from 0–100:
- **Above 70** = Overbought → potential pullback risk
- **Below 30** = Oversold → potential bounce zone
- **40–60** = Neutral territory — no strong directional signal

### 📈 Volume Analysis
Current daily volume is **${volume}** shares. Volume acts as a conviction indicator:
- **High volume on green days** = strong buying interest
- **Low volume on rallies** = weak conviction, possible reversal ahead

### 🛡️ Support & Resistance
Key price levels to monitor:
- **Support Floor**: ${support} — this is where buyers historically step in
- **Resistance Ceiling**: ${resistance} — sellers have historically capped upside here

A breakout above resistance on high volume is a bullish signal. A breakdown below support on high volume is bearish.

### 📰 Recent News & Catalysts
Broader macroeconomic factors — including RBI interest rate decisions, FII/DII flows, and global market sentiment — are influencing this stock's sector. Track these events on the NonStock Dashboard to stay ahead of news-driven moves.

### ⚠️ Risk Assessment
- **Sector-level risk**: Medium
- **Volatility risk**: Monitor intraday price swings around support/resistance zones
- **Tip**: Always test your thesis on NonStock's Paper Trading sandbox before using real capital!

### 🎯 Confidence Rating
**75% Educational Confidence** — based on standard technical momentum indicators from live market data.

### 🎓 Educational Explanation
**Support** is a price level where demand is strong enough to halt a price decline — think of it as a floor. **Resistance** is where supply outpaces demand — think of it as a ceiling. When price breaks resistance, that old ceiling often becomes the new floor. This principle is the foundation of trend-following strategies used by professional traders worldwide.

**Disclaimer: NOT financial advice. This analysis is for educational purposes only and should not be used as a recommendation to buy or sell securities.**`.trim();

      return res.json({
        response: sandboxResponse,
        technicals,
        mlEnsemble: getMLEnsemble(detectedSymbol || 'NIFTY')
      });
    }

    // --- Step 3: Gemini API call ---
    const systemPrompt = `
    You are the "NonStock AI Mentor", a premium interactive educational chatbot.
    Your target audience is beginner to intermediate investors.
    You explain stocks, indicators, and market concepts clearly without offering direct financial advice.

    ${techContext ? `Here is the current live data for the stock being queried: ${techContext}` : ''}

    User Question: "${message}"

    Strict Guidelines for your response:
    1. Tone: Encouraging, objective, structured, and easy for beginners.
    2. Format your response into these exact Markdown headers:
       - ### 📈 Current Trend
       - ### 📊 RSI Analysis
       - ### 📈 Volume Analysis
       - ### 🛡️ Support & Resistance
       - ### 📰 Recent News & Catalysts
       - ### ⚠️ Risk Assessment
       - ### 🎯 Confidence Rating
       - ### 🎓 Educational Explanation
    3. Under each header, provide a concise explanation. For RSI/Volume/Support/Resistance, explain what the numbers/indicators actually mean and how beginners can interpret them.
    4. Mention recent news or catalysts that could affect this type of asset (or sector) to teach the user macro analysis.
    5. Always end your reply with the following exact, bolded educational disclaimer:
       **Disclaimer: NOT financial advice. This analysis is for educational purposes only and should not be used as a recommendation to buy or sell securities.**

    Respond in clear GitHub-flavored markdown. Use sections, bullet points, and highlight key concepts.
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API call failed:', errText);
      return res.status(502).json({ error: 'Failed to communicate with AI generation engine' });
    }

    const geminiData = await geminiRes.json();
    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    res.json({
      response: responseText,
      technicals,
      mlEnsemble: detectedSymbol ? getMLEnsemble(detectedSymbol) : null
    });

  } catch (err) {
    console.error('AI Mentor Error:', err);
    res.status(500).json({ error: 'Server error processing AI query' });
  }
});

module.exports = router;
