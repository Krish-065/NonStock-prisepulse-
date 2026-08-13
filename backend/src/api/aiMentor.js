const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { query } = require('../db/index');
const { authenticate } = require('../middleware/auth');

let vectorStore = [];
try {
  const storePath = path.join(__dirname, '../knowledge_base/vector_store.json');
  if (fs.existsSync(storePath)) {
    vectorStore = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  } else {
    const kbPath = path.join(__dirname, '../knowledge_base/trading_kb.json');
    if (fs.existsSync(kbPath)) {
      vectorStore = JSON.parse(fs.readFileSync(kbPath, 'utf8')).map(item => ({ ...item, embedding: [] }));
    }
  }
} catch (err) {
  console.error('[AI Mentor] Failed to load knowledge base:', err);
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordSimilarity(query, item) {
  const queryClean = query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const titleClean = item.title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const contentClean = item.content.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const categoryClean = (item.category || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  const stopWords = new Set(['what', 'are', 'the', 'and', 'for', 'how', 'does', 'work', 'with', 'about', 'this', 'that', 'they', 'them', 'these', 'those', 'where', 'when', 'which', 'who', 'why', 'you', 'your', 'like', 'there', 'here', 'should', 'buy', 'sell']);
  
  const queryWords = queryClean.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  if (queryWords.length === 0) return 0;
  
  let score = 0;
  for (const word of queryWords) {
    if (titleClean.includes(word)) {
      score += 5;
    }
    if (categoryClean.includes(word)) {
      score += 3;
    }
    if (contentClean.includes(word)) {
      score += 1.2;
    }
  }
  return score / queryWords.length;
}

async function performRAG(queryText, GEMINI_API_KEY) {
  let queryVector = null;
  const hasVectors = vectorStore.some(item => item.embedding && item.embedding.length > 0);

  if (GEMINI_API_KEY && hasVectors) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: queryText }] }
        })
      });
      if (response.ok) {
        const data = await response.json();
        queryVector = data?.embedding?.values;
      }
    } catch (e) {
      console.warn('[RAG Engine] Embedding fetch exception:', e.message);
    }
  }

  const results = vectorStore.map(item => {
    let score = 0;
    if (queryVector && item.embedding && item.embedding.length > 0) {
      score = cosineSimilarity(queryVector, item.embedding);
    } else {
      score = keywordSimilarity(queryText, item);
    }
    return { item, score };
  });

  return results
    .filter(r => r.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.item);
}

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

// ─── Fetch Stock News ────────────────────────────────────────────────────────
async function getLiveNews(symbol) {
  try {
    const cleanSym = symbol.split('.')[0].split('-')[0].toUpperCase();
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanSym)}`;
    const res = await fetch(url, { headers: YAHOO_HEADERS });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.news && Array.isArray(data.news)) {
      return data.news.slice(0, 5).map(item => ({
        title: item.title,
        publisher: item.publisher,
        link: item.link,
        time: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toLocaleString() : 'N/A'
      }));
    }
  } catch (err) {
    console.warn('[AI News Service] Failed to fetch news for', symbol, err.message);
  }
  return [];
}


// ─── Ticker & Currency Resolver ────────────────────────────────────────────────
const US_TICKERS = new Set([
  'TSLA', 'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'AMD',
  'SPY', 'QQQ', 'COIN', 'DIS', 'BA', 'JPM', 'BABA', 'NKE', 'INTC', 'PLTR', 'UBER',
  'CRUDE', 'GOLD', 'SILVER'
]);

const CRYPTO_TICKERS = new Set([
  'BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA', 'AVAX', 'DOT', 'LINK', 'BNB'
]);

const INDIAN_TICKERS = new Set([
  'RELIANCE', 'TCS', 'INFY', 'INFOSYS', 'SBIN', 'HDFCBANK', 'ICICIBANK', 'TATAMOTORS',
  'TATASTEEL', 'WIPRO', 'ADANIENT', 'ONGC', 'BAJFINANCE', 'LTIM', 'MARUTI', 'SUNPHARMA',
  'HINDUNILVR', 'AXISBANK', 'ZOMATO', 'PAYTM', 'ITC', 'KOTAKBANK', 'LT', 'BHARTIARTL'
]);

function resolveYahooTicker(rawSymbol) {
  let s = (rawSymbol || 'NIFTY').toUpperCase().trim();
  s = s.replace('NSE:', '').replace('BSE:', '').replace('NASDAQ:', '').replace('NYSE:', '');

  if (s === 'NIFTY' || s === 'NIFTY50' || s === 'NIFTY 50' || s === '^NSEI') {
    return { yahooTicker: '^NSEI', currency: '₹', tvTicker: 'NSE:NIFTY', isIndian: true };
  }
  if (s === 'SENSEX' || s === '^BSESN') {
    return { yahooTicker: '^BSESN', currency: '₹', tvTicker: 'BSE:SENSEX', isIndian: true };
  }
  if (s === 'BANKNIFTY' || s === 'NIFTYBANK' || s === '^NSEBANK') {
    return { yahooTicker: '^NSEBANK', currency: '₹', tvTicker: 'NSE:BANKNIFTY', isIndian: true };
  }

  if (CRYPTO_TICKERS.has(s) || s.endsWith('-USD')) {
    const base = s.replace('-USD', '');
    return { yahooTicker: `${base}-USD`, currency: '$', tvTicker: `BINANCE:${base}USDT`, isIndian: false };
  }

  if (US_TICKERS.has(s) || s.endsWith('.US')) {
    const base = s.replace('.US', '');
    return { yahooTicker: base, currency: '$', tvTicker: `NASDAQ:${base}`, isIndian: false };
  }

  if (s.endsWith('.NS')) {
    const base = s.replace('.NS', '');
    return { yahooTicker: s, currency: '₹', tvTicker: `NSE:${base}`, isIndian: true };
  }
  if (s.endsWith('.BO')) {
    const base = s.replace('.BO', '');
    return { yahooTicker: s, currency: '₹', tvTicker: `BSE:${base}`, isIndian: true };
  }

  if (INDIAN_TICKERS.has(s)) {
    return { yahooTicker: `${s}.NS`, currency: '₹', tvTicker: `NSE:${s}`, isIndian: true };
  }

  return { yahooTicker: `${s}.NS`, currency: '₹', tvTicker: `NSE:${s}`, isIndian: true };
}

// ─── Symbol Extractor ─────────────────────────────────────────────────────────
function extractSymbol(queryText) {
  const upper = queryText.toUpperCase();
  const words = upper.split(/\s+/);
  const common = ['RELIANCE', 'SBIN', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK',
    'TATAMOTORS', 'ZOMATO', 'BTC', 'ETH', 'WIPRO', 'ADANIENT', 'ONGC',
    'BAJFINANCE', 'LTIM', 'MARUTI', 'SUNPHARMA', 'HINDUNILVR', 'AXISBANK',
    'TSLA', 'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META'];

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
function buildSandboxResponse(technicals, detectedSymbol, queryText = '', history = [], retrievedChunks = []) {
  const upper = (queryText || '').toUpperCase();
  let responseText = '';

  // 1. Classify query for conditional/geopolitical/macroeconomic analysis
  const isConditional = upper.includes('IF') || upper.includes('WHICH') || upper.includes('WOULD') || upper.includes('AFFECT') || upper.includes('FUTURE OF') || upper.includes('HAPPEN') || upper.includes('WAR') || upper.includes('TRUMP');
  const isGeopolitical = upper.includes('WAR') || upper.includes('TRUMP') || upper.includes('CONFLICT') || upper.includes('GEOPOLITIC') || upper.includes('INDIA') || upper.includes('ELECTION') || upper.includes('TARIFF');
  const isMacro = upper.includes('INFLATION') || upper.includes('INTEREST RATE') || upper.includes('FED') || upper.includes('RBI') || upper.includes('RECES') || upper.includes('BUDGET') || upper.includes('GDP');

  // 2. Extract memory context from history to learn from user asked questions
  let memoryContext = '';
  const prevUserQueries = (history || [])
    .filter(h => h.sender === 'user' && h.text !== queryText)
    .map(h => h.text.toUpperCase());

  const prevSymbols = [];
  const prevConcepts = [];
  
  const commonTickers = ['BTC', 'ETH', 'RELIANCE', 'SBIN', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'NIFTY', 'GOLD', 'AAPL', 'TSLA'];
  const commonIndicators = ['RSI', 'MACD', 'SUPPORT', 'RESISTANCE', 'VOLUME', 'EMA', 'SMA', 'PE RATIO'];

  prevUserQueries.forEach(q => {
    commonTickers.forEach(t => { if (q.includes(t) && !prevSymbols.includes(t)) prevSymbols.push(t); });
    commonIndicators.forEach(c => { if (q.includes(c) && !prevConcepts.includes(c)) prevConcepts.push(c); });
  });

  if (prevSymbols.length > 0 || prevConcepts.length > 0) {
    const memoryParts = [];
    if (prevSymbols.length > 0) memoryParts.push(`your interest in **${prevSymbols.join(', ')}**`);
    if (prevConcepts.length > 0) memoryParts.push(`our previous discussion on **${prevConcepts.join(', ')}**`);
    memoryContext = `\n\n### 🧠 Memory Sync & Learnings
*Note: Factoring in ${memoryParts.join(' and ')} from your previous queries. I will monitor these sectors to build your comprehensive trading strategy.*`;
  }

  // 3. Select matching education/strategy chunk or geopolitical/macro outlook
  if (retrievedChunks && retrievedChunks.length > 0) {
    if (retrievedChunks.length === 1) {
      const primary = retrievedChunks[0];
      responseText = `### 📚 Learning Hub: ${primary.title} (${primary.category})
${primary.content}

### 💡 Sandbox Educational Insights
In our trading learning environment, understanding **${primary.title}** is crucial.
${detectedSymbol && technicals ? `\nLet's apply this: looking at live charts for **${detectedSymbol}** at ₹${technicals.price}, we see key support at ₹${technicals.support} and resistance at ₹${technicals.resistance}.` : 'To practice, you can query specific stocks like "Reliance" or "TCS" to see real-time indicators alongside these concepts.'}`;
    } else {
      responseText = `### 📚 Learning Hub: Unified Study Guide\n`;
      retrievedChunks.forEach((chunk, index) => {
        responseText += `\n#### ${index + 1}. ${chunk.title} (${chunk.category})
${chunk.content}\n`;
      });
      responseText += `\n### 💡 Sandbox Educational Insights
In our trading learning environment, synthesizing these concepts is crucial.
${detectedSymbol && technicals ? `\nLet's apply this: looking at live charts for **${detectedSymbol}** at ₹${technicals.price}, we see key support at ₹${technicals.support} and resistance at ₹${technicals.resistance}.` : 'To practice, you can query specific stocks like "Reliance" or "TCS" to see real-time indicators alongside these concepts.'}`;
    }
  } else if (isGeopolitical) {
    let asset = 'Gold';
    if (upper.includes('BTC') || upper.includes('BITCOIN') || upper.includes('CRYPTO')) asset = 'Bitcoin';
    else if (upper.includes('NIFTY') || upper.includes('STOCK') || upper.includes('RELIANCE')) asset = 'Equities';
    else if (upper.includes('OIL') || upper.includes('CRUDE')) asset = 'Crude Oil';

    responseText = `### 🌐 Macro Geopolitical Outlook: ${asset} Analysis
As a macroeconomic analyst and veteran trader, I evaluate geopolitical escalations—such as political shifts, tariffs, or military conflicts involving major global players like Donald Trump or nations like India—through safe-haven capital flows, inflation pressure, and liquidity cycles.

### 🛡️ Safe-Haven vs Risk-On Dynamics
- **Gold & Precious Metals**: In times of high geopolitical stress or trade wars, capital seeks security. **Gold** historically benefits as a premier hedge because it lacks counterparty risk and currency inflation risk.
- **Equities Markets (Nifty 50 / US Indices)**: Markets dislike uncertainty. A geopolitical crisis typically leads to short-term panic sales, supply chain bottlenecks, and higher input costs.
- **US Dollar & Treasuries**: The USD usually strengthens during initial shock periods as a global liquidity standard, which temporarily puts pressure on emerging market currencies (like the Indian Rupee).

### 🚦 Tactical Trader Playbook
- **Volatility & Position Sizing**: When volatility spikes, bid-ask spreads widen. Always reduce your position size (lot size) to keep your total risk below **1% to 2%** of capital.
- **Technical Key Zones**: Do not chase momentum rallies. Watch weekly SMA/EMA retests for entry points once panic headlines consolidate.`;
  }
  else if (isMacro) {
    responseText = `### 🏦 Macroeconomic Outlook: Inflation & Policy Shift
Analyzing central bank rate decisions (US Fed, RBI) and inflation metrics (CPI) is essential for positioning. High interest rates or recession worries shift the trading environment significantly:

### ⚙️ Macro Transmission Channels
- **Interest Rates**: Rate hikes raise the discount rate for corporate cash flows. This directly compresses P/E multiples of high-growth sectors (such as Tech or Startups).
- **Inflation Risks**: Persistent inflation increases operating costs. Focus on value companies with strong pricing power that can easily pass costs to consumers.
- **Liquidity Cycles**: Focus on central bank balance sheets. When liquidity shrinks, speculative bubble assets tend to correct first.

### 🚦 Trader Setup & Allocation
- **Defensive Pivot**: Move capital towards short-term bonds, high-yield dividend value stocks, or commodities.
- **Divergence Play**: Watch for central bank policy differences to trade major Forex pairs (like USD/INR or EUR/USD).`;
  }
  else if (isConditional) {
    responseText = `### 🔮 Conditional Scenario Modeling & Trading Outlook
Predicting exact market moves in conditional scenarios is impossible. Instead, professional traders model multiple scenarios and execute trades based on structural confirmations:

### 🎭 Scenario A: The Bull Case (Priced-in Optimism)
- If the conditional event resolves positively, capital moves back to risk-on assets. Look for key resistance breakouts supported by high volume.
- **Technical Confirmation**: RSI holding in the 55-65 zone and MACD crossing above the signal line.

### 📉 Scenario B: The Bear Case (Risk Realization)
- If the event causes market distress, expect rapid liquidation. Safe havens (Gold, US Dollar, defensive stocks) will outperform.
- **Risk Mitigation**: Place hard stop losses at structural support levels. Never let a conditional trade turn into a long-term investment.`;
  }
  else if (upper.includes('RSI') || upper.includes('RELATIVE STRENGTH INDEX')) {
    responseText = `### 📊 What is the Relative Strength Index (RSI)?
The **Relative Strength Index (RSI)** is a popular momentum oscillator used in technical analysis. It measures the speed and change of price movements on a scale from **0 to 100**.

### 💡 Key RSI Levels
- **Overbought (> 70)**: Suggests the asset has experienced significant upward price pressure and may be due for a consolidation or correction.
- **Oversold (< 30)**: Indicates the asset has experienced significant downward price pressure and may be poised for a potential bounce or reversal.
- **Neutral (30 to 70)**: Suggests consolidation or trend continuation without extreme momentum.

### 🎓 How to use RSI
Traders use RSI to identify potential entry and exit points, detect bullish/bearish divergences (where price makes a new high/low but RSI does not), and confirm trend strength.`;
  } 
  else if (upper.includes('SUPPORT') || upper.includes('RESISTANCE')) {
    responseText = `### 🛡️ Support & Resistance Explained
**Support** and **Resistance** are fundamental concepts in technical analysis representing key price floors and ceilings.

### 📉 Support (The Floor)
- Support is the price level at which demand is strong enough to prevent the price from declining further.
- It is visually represented as a horizontal line or zone connecting previous price lows.
- When price approaches support, buyers are more likely to buy and sellers are less likely to sell, creating a price floor.

### 📈 Resistance (The Ceiling)
- Resistance is the price level at which selling pressure is strong enough to prevent the price from rising further.
- It connects previous price highs.
- When price approaches resistance, sellers are more likely to sell and buyers are less likely to buy, capping the upside.

### 🔄 Role Reversal
A key concept is that once a resistance level is broken, it often becomes a support level for future price drops, and vice versa.`;
  }
  else if (upper.includes('MACD') || upper.includes('MOVING AVERAGE CONVERGENCE')) {
    responseText = `### 📊 Understanding MACD (Moving Average Convergence Divergence)
The **MACD** is a trend-following momentum indicator that shows the relationship between two moving averages of an asset’s price.

### ⚙️ How it is Calculated
- **MACD Line**: The difference between the 12-day EMA and the 26-day EMA.
- **Signal Line**: A 9-day EMA of the MACD Line.
- **Histogram**: The difference between the MACD Line and the Signal Line, indicating momentum strength.

### 🚦 Key Signals
- **Signal Line Crossover**: Bullish when MACD crosses above the Signal Line; Bearish when it crosses below.
- **Zero Line Crossover**: MACD above zero indicates bullish momentum; below zero indicates bearish momentum.`;
  }
  else if (upper.includes('VOLUME')) {
    responseText = `### 📈 The Importance of Trading Volume
**Trading Volume** is the total number of shares or contracts traded during a given period. It is one of the most critical indicators for confirming price trends.

### 🔍 Key Volume Interpretations
- **Trend Confirmation**: High volume on price rallies confirms strong buyer conviction. Low volume suggests lack of interest and warning of a potential trend reversal.
- **Breakouts**: When a price breaks out of a consolidation pattern or support/resistance on high volume, it signals a strong, sustainable move.
- **Climax Volume**: Extremely high volume spike after a prolonged trend can signal the exhaustion of buyers or sellers (reversal warning).`;
  }
  else if (upper.includes('OPTION') || upper.includes('CALL') || upper.includes('PUT') || upper.includes('DERIVATIVE')) {
    responseText = `### 🎭 Introduction to Options & Derivatives
**Options** are financial derivatives that give the buyer the right, but not the obligation, to buy or sell an underlying asset at a specified price within a specific time period.

### 📈 Call Options (Bullish View)
- A **Call Option** gives you the right to **buy** the stock at a fixed price (Strike Price).
- You buy calls when you expect the stock price to rise significantly.

### 📉 Put Options (Bearish View)
- A **Put Option** gives you the right to **sell** the stock at a fixed Strike Price.
- You buy puts when you expect the stock price to fall.

### ⚠️ Key Risks (Time Decay)
Unlike stocks, options have an expiration date. **Theta (Time Decay)** eats away at the option value every day, meaning option buyers can lose their entire premium if the stock does not move in their favor quickly enough.`;
  }
  else if (upper.includes('RISK') || upper.includes('STOP LOSS') || upper.includes('LEVERAGE') || upper.includes('CAPITAL')) {
    responseText = `### 🛡️ Risk Management & Stop Losses
Capital preservation is the single most important rule in trading. Without proper risk management, even the best strategies will lead to account liquidation.

### 🛑 The Stop Loss Order
- A **Stop Loss** is a pre-set order that automatically exits your trade once the stock hits a certain price level.
- It caps your maximum downside and prevents a single bad trade from wiping out your portfolio.

### ⚖️ The 1% Rule
- Never risk more than **1% to 2%** of your total trading capital on a single trade.
- For example, with a ₹1,00,000 account, your maximum loss on any trade should be capped at ₹1,000 to ₹2,000.

### ⚡ The Double-Edged Sword of Leverage
- **Leverage** allows you to trade larger positions with less money.
- While leverage multiplies your gains, it also **multiplies your losses** at the same rate, increasing liquidation risk.`;
  }
  else if (upper.includes('EMA') || upper.includes('SMA') || upper.includes('MOVING AVERAGE') || upper.includes('CROSSOVER')) {
    responseText = `### 📈 Understanding Moving Averages (SMA & EMA)
**Moving Averages** smooth out price data to create a single flowing line, making it easier to identify the underlying trend direction.

### ⚙️ SMA vs EMA
- **Simple Moving Average (SMA)**: Calculates the average price over a set period. It treats all days equally.
- **Exponential Moving Average (EMA)**: Gives more weight to recent prices. It reacts faster to recent price changes.

### 🚦 Golden Cross & Death Cross
- **Golden Cross (Bullish)**: When a short-term moving average (e.g. 50-day EMA) crosses **above** a long-term moving average (e.g. 200-day EMA).
- **Death Cross (Bearish)**: When the 50-day EMA crosses **below** the 200-day EMA, signalling potential downward trend.`;
  }
  else if (upper.includes('PE RATIO') || upper.includes('FUNDAMENTAL') || upper.includes('EARNINGS') || upper.includes('REVENUE')) {
    responseText = `### 🔍 Introduction to Fundamental Analysis
**Fundamental Analysis** is the method of evaluating a stock by measuring its intrinsic value through financial statements, management capability, and economic factors.

### 📊 Key Ratios to Know
- **Price-to-Earnings (P/E) Ratio**: Compares stock price to earnings per share. High P/E might mean the stock is overvalued or has high growth expectations.
- **Debt-to-Equity (D/E) Ratio**: Measures financial leverage. A high ratio indicates higher risk from debt interest obligations.
- **Return on Equity (ROE)**: Measures how effectively management is using shareholders' capital to generate profits.`;
  }
  else if (upper.includes('CRYPTO') || upper.includes('BITCOIN') || upper.includes('ETHEREUM') || upper.includes('BLOCKCHAIN')) {
    responseText = `### 🪙 Cryptocurrency & Digital Assets
**Cryptocurrencies** are decentralized digital currencies powered by **Blockchain technology** — a secure, distributed ledger.

### ₿ Major Cryptocurrencies
- **Bitcoin (BTC)**: The first and largest cryptocurrency, often referred to as "digital gold" due to its fixed supply cap of 21 million coins.
- **Ethereum (ETH)**: A programmable blockchain that supports smart contracts and decentralized applications (dApps).

### ⚡ Volatility and Risk
Cryptocurrencies trade 24/7 globally and are subject to extreme price volatility, regulatory changes, and technical risks. Always proceed with extreme caution.`;
  }
  else if (detectedSymbol && technicals) {
    const trend = technicals.trend?.toLowerCase() ?? 'consolidating';
    const rsi = technicals.rsi ?? 50;
    const volume = technicals.volume?.toLocaleString() ?? '1,450,200';
    const currSym = technicals.currency || (['TSLA', 'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'BTC', 'ETH'].includes(detectedSymbol.toUpperCase()) ? '$' : '₹');
    const support = `${currSym}${technicals.support?.toLocaleString()}`;
    const resistance = `${currSym}${technicals.resistance?.toLocaleString()}`;
    const rsiZone = rsi > 70 ? 'overbought (potentially overextended — consider caution)'
                   : rsi < 30 ? 'oversold (potential buying opportunity for patient investors)'
                   : 'neutral momentum zone (no extreme bias)';

    responseText = `### 📈 Technical Outlook for ${detectedSymbol}
The asset is currently showing a **${trend}** trend based on recent price action. ${trend === 'bullish' ? 'Buyers are in control, with higher highs forming.' : 'Sellers are maintaining pressure — watch for reversal signals near resistance.'}

### 📊 RSI Analysis
The **Relative Strength Index (RSI-14)** is at **${rsi}**, placing it in the **${rsiZone}**.

### 🛡️ Key Price Levels to Monitor
- **Support Floor**: ${support} — where buyers historically step in and prevent further declines.
- **Resistance Ceiling**: ${resistance} — where selling pressure has historically capped upside movements.

### 📈 Volume Analysis
Current daily volume is **${volume}** shares. Volume confirms the conviction behind the price move.`;
  }
  else {
    responseText = `### 👋 Welcome to NonStock AI Mentor!
I am your interactive companion for financial learning and stock analysis. You can ask me about:
- **Financial concepts**: e.g., "What is RSI?", "How do Support and Resistance work?", "What does Volume mean?"
- **Stock technical analysis**: Mention any stock symbol (like TCS, RELIANCE, NIFTY) to retrieve live technical indicators.
- **Trading strategies**: Learn about indicators, crossovers, and risk management.

Try asking: *"What is the RSI indicator?"* or *"Analyze Reliance"* to get started!`;
  }

  let finalResponse = responseText.trim();
  if (memoryContext) {
    finalResponse += memoryContext;
  }
  finalResponse += `\n\n**Disclaimer: NOT financial advice. This analysis is for educational and quantitative analysis purposes.**`;

  return {
    response: finalResponse,
    technicals,
    mlEnsemble: detectedSymbol ? getMLEnsemble(detectedSymbol) : null
  };
}

// ─── GET /knowledge ──────────────────────────────────────────────────────────
router.get('/knowledge', authenticate, (req, res) => {
  try {
    const categories = {};
    vectorStore.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push({
        id: item.id,
        title: item.title
      });
    });
    res.json(categories);
  } catch (err) {
    console.error('[AI Mentor] Failed to get knowledge categories:', err);
    res.status(500).json({ error: 'Failed to retrieve trading concepts list' });
  }
});

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
    const { message, conversationId, marketData } = req.body;
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

    // Fetch conversation history early for context and sandbox memory
    const dbHistory = await query(
      'SELECT sender, text FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [activeConversationId]
    );

    // Detect symbol & fetch live Yahoo Finance technicals
    const detectedSymbol = extractSymbol(message) || (marketData && marketData.symbol);
    let techContext = '';
    let technicals  = null;

    if (marketData && marketData.symbol) {
      technicals = {
        symbol:     marketData.symbol,
        price:      parseFloat(marketData.currentPrice),
        rsi:        parseFloat(marketData.rsi),
        macd:       marketData.macd,
        trend:      marketData.trend,
        patternDetected: marketData.patternDetected
      };
      techContext = `[SIMULATED: ${marketData.symbol}] Price ₹${marketData.currentPrice}, RSI ${marketData.rsi}, MACD ${marketData.macd?.signal || 'N/A'}, Trend ${marketData.trend}, Pattern: ${marketData.patternDetected}`;
    } else if (detectedSymbol) {
      const resolved = resolveYahooTicker(detectedSymbol);
      let sym = resolved.yahooTicker;
      try {
        let url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1mo&interval=1d`;
        let yfRes = await fetch(url, { headers: YAHOO_HEADERS });
        if (!yfRes.ok && sym.endsWith('.NS')) {
          const altSym = sym.replace('.NS', '');
          const altUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(altSym)}?range=1mo&interval=1d`;
          const altRes = await fetch(altUrl, { headers: YAHOO_HEADERS });
          if (altRes.ok) {
            yfRes = altRes;
            resolved.currency = '$';
            resolved.tvTicker = `NASDAQ:${altSym}`;
            resolved.isIndian = false;
          }
        }
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
                symbol:     detectedSymbol.toUpperCase(),
                price:      parseFloat(last.toFixed(2)),
                support:    parseFloat(sup.toFixed(2)),
                resistance: parseFloat(resVal.toFixed(2)),
                rsi:        rsi || 50,
                trend:      last >= closes[0] ? 'BULLISH' : 'BEARISH',
                volume:     vol,
                currency:   resolved.currency,
                tvSymbol:   resolved.tvTicker,
                isIndian:   resolved.isIndian
              };
              techContext = `[LIVE: ${detectedSymbol}] Price ${resolved.currency}${last.toFixed(2)}, Support ${resolved.currency}${sup.toFixed(2)}, Resistance ${resolved.currency}${resVal.toFixed(2)}, RSI ${rsi?.toFixed(1)}, Trend ${technicals.trend}, Vol ${vol.toLocaleString()}`;
            }
          }
        }
      } catch (e) {
        console.warn('[AI Mentor] Yahoo Finance error:', e.message);
      }
    }

    // Fetch live Yahoo Finance news for context
    let newsContext = '';
    let newsList = [];
    if (detectedSymbol) {
      newsList = await getLiveNews(detectedSymbol);
      if (newsList.length > 0) {
        newsContext = `\n[RECENT NEWS HEADLINES FOR ${detectedSymbol}]:\n` + 
          newsList.map((n, i) => `${i + 1}. "${n.title}" (Source: ${n.publisher}, Published: ${n.time})`).join('\n') + '\n';
      }
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    // helper to save model reply & send final HTTP response
    const finalizeAndSave = async (responseText, techObj, mlObj, newsObj = []) => {
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
        news: newsObj,
        conversationId: activeConversationId
      });
    };

    const userRes = await query('SELECT name, is_pro FROM users WHERE id = $1', [req.user.id]);
    const userObj = userRes.rows[0];
    const isPro = userObj?.is_pro || false;
    const userName = userObj?.name || (req.user?.email ? req.user.email.split('@')[0] : 'Trader');

    if (!isPro) {
      const msgCount = await query(
        `SELECT COUNT(*) FROM ai_messages WHERE conversation_id = $1 AND sender = 'user'`,
        [activeConversationId]
      );
      if (parseInt(msgCount.rows[0].count) >= 5) {
        return res.status(403).json({
          error: 'Free limit reached',
          isLimitReached: true,
          response: 'NonStock Pro membership required to unlock unlimited AI mentor conversations and advanced Greeks insights. Upgrade today!'
        });
      }
    }

    // Perform RAG search for relevant articles
    const retrievedChunks = await performRAG(message, GEMINI_API_KEY);
    let ragContext = '';
    if (retrievedChunks.length > 0) {
      ragContext = `\n\n[Retrieved Trading Knowledge Base Context]:\n` + 
        retrievedChunks.map((chunk, index) => `${index + 1}. Topic: ${chunk.title}\nCategory: ${chunk.category}\nContent: ${chunk.content}`).join('\n\n') +
        `\n\nWhen answering, verify terms and concepts against this retrieved context. Refer to these specific strategies or risk parameters to explain clearly.`;
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.log('[AI Mentor] No Groq key — sandbox mode');
      const sb = buildSandboxResponse(technicals, detectedSymbol, message, dbHistory.rows, retrievedChunks);
      return await finalizeAndSave(sb.response, sb.technicals, sb.mlEnsemble, newsList);
    }

    try {
      let systemInstructionText = '';
      if (isPro) {
        systemInstructionText = `You are "None" — a brilliant, seasoned trading mentor and quantitative specialist on the NonStock platform. You have 20+ years of institutional trading experience: you've sat on trading desks, survived multiple market crashes, and trained hundreds of professional traders. You're talking to a Pro-tier user named "${userName}" right now, so you treat them as a peer — another serious market participant who respects depth, precision, and candor.

Your personality & greeting rules:
- CRITICAL GREETING RULE: Always greet and address the user directly by their name ("${userName}") at the very beginning of your reply (e.g. "Hey ${userName}!", "Hello ${userName},", "Great to see you ${userName}!").
- CRITICAL FOLLOW-UP RULE: Always end your response with a warm, engaging invitation to ask further follow-up questions or test another chart setup (e.g. "What symbol or setup would you like us to break down next, ${userName}?", "Feel free to drop any follow-up questions in the chat!").
- You speak like a sharp, experienced market professional — direct, confident, occasionally sarcastic about retail mistakes, but always genuinely helpful.
- You lead with your own take first ("Honestly ${userName}, looking at this setup...", "My read here is...", "Here's what I'd be watching..."), then break it down.
- You DON'T sound like a textbook or a Wikipedia article. You sound like someone who has actually put money on the line.
- You use structure (headers, bullets) only when it genuinely helps clarity. Not to pad responses.
- You remember what was discussed earlier in the conversation and naturally reference it.

Formatting rules:
- Start replies directly with a personal greeting to ${userName}.
- Use ### headers only for complex multi-part answers. For simple questions, write flowing conversational paragraphs.
- Bold key terms and price levels.
- Target 250–400 words. Don't pad. Don't repeat yourself.
- Always end with your personal invitation for follow-up questions, followed by: "**Note:** This is technical analysis for educational purposes — not financial advice."

If live market data is provided, analyze it critically and honestly. Give your actual read.
If news context is provided, weave it into your analysis naturally.

${ragContext}`;
      } else {
        systemInstructionText = `You are "None" — a warm, knowledgeable trading mentor on the NonStock platform. Think of yourself as that brilliant friend who genuinely understands markets and actually enjoys explaining things. You're talking to a learner named "${userName}".

Your personality & greeting rules:
- CRITICAL GREETING RULE: Always greet and address the user directly by their name ("${userName}") at the very beginning of your reply (e.g. "Hey ${userName}!", "Hello ${userName},", "Welcome back ${userName}!").
- CRITICAL FOLLOW-UP RULE: Always end your response with a warm, encouraging invitation to ask further questions or explore related topics (e.g. "What other concept or stock can I help you with next, ${userName}?", "Don't hesitate to ask me anything else about this!").
- You're warm, encouraging, and patient. You explain things the way a knowledgeable older friend would — using everyday analogies, Indian examples when they fit (chai shop demand, Diwali shopping rush, cricket match momentum), and connecting concepts to things people already intuitively understand.
- You lead with empathy: if someone seems confused or anxious about the markets, acknowledge it.
- You speak in clear, friendly sentences. No corporate jargon dumps. When you must use a technical term, you immediately explain it in plain words.
- You remember the conversation and build on prior topics naturally.

Formatting rules:
- Start replies directly with a personal greeting to ${userName}.
- Use ### headers only when breaking down a multi-step concept. Otherwise, conversational paragraphs work better.
- Bold the most important terms and numbers.
- Target 200–350 words. Keep it digestible.
- Always end with your personal invitation for follow-up questions, followed by: "**Heads up:** This is educational content — not financial advice. Always do your own research!"

If live market data is provided, use it to make your explanation concrete and real.

${ragContext}`;
      }

      const groqMessages = [
        { role: 'system', content: systemInstructionText }
      ];

      if (dbHistory.rows.length > 0) {
        dbHistory.rows.forEach((item) => {
          const role = item.sender === 'user' ? 'user' : 'assistant';
          
          if (groqMessages.length === 1 && role === 'assistant') return;
          if (groqMessages.length > 1 && groqMessages[groqMessages.length - 1].role === role) return;

          groqMessages.push({
            role: role,
            content: item.text
          });
        });
      }

      let currentPromptText = message;
      if (techContext || newsContext) {
        currentPromptText = `[Context Information]\n`;
        if (techContext) {
          currentPromptText += `Market Indicators/Simulated Setup: ${techContext}\n\n`;
        }
        if (newsContext) {
          currentPromptText += `Latest News Headlines & Geopolitical Context: ${newsContext}\n\n`;
        }
        currentPromptText += `User Query: ${message}`;
      }

      if (groqMessages.length > 1 && groqMessages[groqMessages.length - 1].role === 'user') {
        groqMessages[groqMessages.length - 1].content = currentPromptText;
      } else {
        groqMessages.push({
          role: 'user',
          content: currentPromptText
        });
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          temperature: 0.75,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const body = await response.text();
        console.warn(`[AI Mentor] Groq ${response.status} — sandbox fallback. ${body.substring(0, 150)}`);
        const sb = buildSandboxResponse(technicals, detectedSymbol, message, dbHistory.rows, retrievedChunks);
        return await finalizeAndSave(sb.response, sb.technicals, sb.mlEnsemble, newsList);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) {
        console.warn('[AI Mentor] Groq empty response — sandbox fallback');
        const sb = buildSandboxResponse(technicals, detectedSymbol, message, dbHistory.rows, retrievedChunks);
        return await finalizeAndSave(sb.response, sb.technicals, sb.mlEnsemble, newsList);
      }

      const mlObj = detectedSymbol ? getMLEnsemble(detectedSymbol) : null;
      return await finalizeAndSave(text, technicals, mlObj, newsList);

    } catch (groqErr) {
      console.warn('[AI Mentor] Groq exception — sandbox fallback:', groqErr.message);
      const sb = buildSandboxResponse(technicals, detectedSymbol, message, dbHistory.rows, retrievedChunks);
      return await finalizeAndSave(sb.response, sb.technicals, sb.mlEnsemble, newsList);
    }

  } catch (err) {
    console.error('[AI Mentor] Unexpected error:', err);
    res.status(500).json({ error: 'Server error processing AI query' });
  }
});

module.exports = router;
