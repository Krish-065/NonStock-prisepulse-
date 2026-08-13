const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Controller to handle requests to the Jarvis AI Mentor.
 * Powered by Groq API (LLaMA 3.3 70B)
 */
exports.getMentorResponse = async (req, res) => {
  try {
    const { message, marketData, accountMode = 'learner' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message field is required.' });
    }

    // Default values if marketData is partially provided
    const symbol = marketData?.symbol || 'N/A';
    const timeframe = marketData?.timeframe || '15m';
    const currentPrice = marketData?.currentPrice || 'N/A';
    const rsi = marketData?.rsi || 'N/A';
    const macdSignal = marketData?.macd?.signal || marketData?.macd || 'N/A';
    const trend = marketData?.trend || 'N/A';
    const patternDetected = marketData?.patternDetected || 'N/A';

    // Build standard structure to feed context to Groq
    const marketContext = `
Asset Symbol: ${symbol}
Timeframe: ${timeframe}
Current Price: ${currentPrice}
RSI (14): ${rsi}
MACD Status: ${macdSignal}
Trend Context: ${trend}
Candlestick/Market Pattern Detected: ${patternDetected}
`;

    // Mode-specific instructions
    let modeInstructions = '';
    if (accountMode === 'pro') {
      modeInstructions = `
- Provide highly technical, professional-grade technical, quantitative, and volatility analysis.
- Reference institutional concepts like liquidity grabs, order blocks, volume profiles, mean reversion, statistical volatility expansion, and multi-timeframe correlation.
- Be concise, direct, and authoritative, matching the tone of an elite Wall Street macro analyst.
`;
    } else {
      modeInstructions = `
- Provide clear, simple, and intuitive educational explanations.
- Use everyday analogies (e.g. comparing buyers/sellers to a busy auction or supply/demand dynamics of a local shop).
- Explain technical jargon clearly (e.g. what RSI or MACD signifies under the hood).
- Emphasize key risk management rules (position sizing, risk-to-reward ratio, and stop-loss placement).
`;
    }

    const systemPrompt = `You are "None", an elite, institutional-grade AI Trading Mentor and Quantitative Specialist on the NonStock trading platform.
Your purpose is to analyze the user's trading query or action in the context of live market conditions, indicators, patterns, and traps, and provide a deep, educational, and structured breakdown.

User Account Mode: ${accountMode === 'pro' ? 'Professional' : 'Learner / Novice'}
${modeInstructions}

Here is the current market data context for the asset:
${marketContext}

Guidelines:
1. Keep it Concise: Ensure your response is perfectly on-point, clear, and direct. Avoid excessively long essays. Target between 200 to 300 words. Focus only on high-value insights.
2. Explain the Trade Logic: Analyze candlestick patterns, breakouts, traps, and technical indicators (RSI, MACD, etc.).
3. Focus on "Traps & Fakeouts": Explicitly warn the user about potential liquidity traps, fake breakouts, and retail traps (e.g., buying the absolute top or selling the bottom).
4. Educational Value: Do not just state the signal, explain *why* the indicators/patterns behave this way.
5. Risk Management First: Emphasize capital preservation. Discuss appropriate risk-to-reward ratios and where invalidation levels (stop-loss zones) would logically sit.
6. Strict Disclaimer: Do NOT provide direct buy/sell recommendations or financial advice. Maintain an educational, analytical perspective.
7. Response structure:
- Use clear markdown headers starting with "###" or "##" (do NOT use "#" headers).
- Use bullet points for lists.
- Highlight key terms in **bold**.
- Keep sections clean: e.g. "### 🔍 Market Analysis", "### 📊 Pattern & Indicator Ingest", "### 🛡️ Risk Playbook & Invalidation Zones", "### 💡 Educational Key Takeaways".
- Always end with this exact disclaimer: "**Disclaimer: NOT financial advice. This analysis is for educational and simulation purposes only.**"`;

    if (!GROQ_API_KEY) {
      console.warn('[None Controller] GROQ_API_KEY is not defined. Falling back to sandbox response.');
      const sandboxResponse = buildSandboxResponse(message, marketData, accountMode);
      return res.json({
        success: true,
        response: sandboxResponse,
        model: 'sandbox-llama-3.3-70b-mock'
      });
    }

    // Call Groq API
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API returned status ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      const aiResponse = responseData?.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('Groq returned an empty response.');
      }

      return res.json({
        success: true,
        response: aiResponse,
        model: 'llama-3.3-70b-versatile'
      });

    } catch (apiError) {
      console.error('[None Controller] Groq API call failed, falling back to sandbox:', apiError.message);
      const sandboxResponse = buildSandboxResponse(message, marketData, accountMode);
      return res.json({
        success: true,
        response: sandboxResponse,
        model: 'sandbox-llama-3.3-70b-mock',
        warning: 'Groq API failed. Displaying simulated analyzer feedback.'
      });
    }

  } catch (error) {
    console.error('[None Controller] Unexpected error:', error);
    return res.status(500).json({ error: 'Server error processing None mentor query.' });
  }
};

/**
 * High-fidelity fallback responder to prevent crashes if Groq API is offline/unreachable
 */
function buildSandboxResponse(query, marketData, mode) {
  const symbol = marketData?.symbol || 'AAPL';
  const price = marketData?.currentPrice || 185.50;
  const rsi = marketData?.rsi || 68.4;
  const trend = marketData?.trend || 'Upward Breakout';
  const pattern = marketData?.patternDetected || 'Potential Liquidity Trap';

  const isPro = mode === 'pro';

  if (isPro) {
    return `### 🔍 Institutional Market Analysis for ${symbol}
The asset is currently trading at **$${price}**, experiencing high volume profile expansion. The trend context is labeled as **${trend}**.
- **Order Block Analysis**: We observe an institutional sell-side order block resting just above the current range.
- **Liquidity Sweeps**: The current structural pattern indicates a high probability of a buy-stop liquidity sweep. Retail buy stops accumulated above resistance are likely being targeted before a mean-reverting correction occurs.

### 📊 Ingested Indicators & Pattern
- **RSI (14)**: Positioned at **${rsi}**, showing near-overbought conditions. We detect minor bearish divergence on smaller intraday timeframes.
- **Pattern Model**: The **${pattern}** suggests that this breakout lacks sustained institutional backup. Initiating long positions here carries elevated risk.

### 🛡️ Professional Risk Playbook
- **Invalidation Zone**: The long setup is strictly invalidated if the hourly candle closes below structural support.
- **Risk-Reward Ratio**: Target a 1:2.5 RR. Maintain stop-loss trailing structures to secure profits in high-volatility environments.

### 💡 Educational Key Takeaways
- Institutional algorithms regularly engineer fake breakouts to match supply/demand imbalances. Retail traders chasing green breakout candles are often trapped as liquidity for large-block sellers.

**Disclaimer: NOT financial advice. This analysis is for educational and simulation purposes only.**`;
  }

  return `### 🔍 Simple Market Analysis for ${symbol}
We are looking at **${symbol}** which is currently priced at **$${price}**. The trend is currently **${trend}**.
- **What this means**: The stock has been moving up recently, but we are approaching a key price zone where sellers have previously stepped in.

### 📊 Understanding Your Indicators
- **RSI (Relative Strength Index)**: At **${rsi}**, the RSI indicates that the stock is getting close to the "overbought" level (above 70). Think of this like a runner who has been sprinting hard; they might need to slow down or pause to catch their breath soon.
- **Pattern Detected**: The **${pattern}** is a warning sign. A "liquidity trap" or fakeout is when the price looks like it is breaking out to go higher, convincing buyers to jump in, only to reverse suddenly.

### 🛡️ Risk Management & Stop-Loss Floor
- **Stop-Loss Floor**: If you were to trade this, a logical stop-loss or safety net would be set just below the recent support floor.
- **Emotional Checklist**: Don't let FOMO (Fear of Missing Out) force you into buying at the top of a rally. Patience is a trader's greatest asset.

### 💡 Educational Lesson
- Always check if the trading volume is high during a breakout. If the volume is low, the breakout is likely a trap and might reverse quickly!

**Disclaimer: NOT financial advice. This analysis is for educational and simulation purposes only.**`;
}

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
};

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

// Helper to fetch live Yahoo Finance search news
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
    console.warn('[AI Controller News] Failed to fetch news for', symbol, err.message);
  }
  return [];
}

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

  // Fallback default for 1-4 character symbols without explicit suffix: test US ticker first if clean symbol is US-like
  return { yahooTicker: `${s}.NS`, currency: '₹', tvTicker: `NSE:${s}`, isIndian: true };
}

exports.getLiveTechnicals = async (req, res) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required.' });
    }

    const resolved = resolveYahooTicker(symbol);
    let sym = resolved.yahooTicker;

    try {
      let url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1mo&interval=1d`;
      let yfRes = await fetch(url, { headers: YAHOO_HEADERS });
      
      // If primary query failed and symbol was assumed .NS, retry without .NS (US stock fallback)
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

      if (!yfRes.ok) {
        throw new Error(`Yahoo Finance status ${yfRes.status}`);
      }

      const data = await yfRes.json();
      const result = data?.chart?.result?.[0];
      
      if (!result || !result.timestamp) {
        throw new Error('Invalid Yahoo response data format');
      }

      const closes = (result.indicators?.quote?.[0]?.close || []).filter(Boolean);
      const volumes = (result.indicators?.quote?.[0]?.volume || []).filter(Boolean);

      if (closes.length === 0) {
        throw new Error('No historical prices found');
      }

      const last = closes[closes.length - 1];
      const sup = Math.min(...closes);
      const resVal = Math.max(...closes);
      const rsi = computeRSI(closes, 14) || 50;
      const vol = volumes[volumes.length - 1] || 0;
      const trendVal = last >= closes[0] ? 'BULLISH' : 'BEARISH';
      
      const newsList = await getLiveNews(symbol);

      return res.json({
        success: true,
        symbol: symbol.toUpperCase(),
        price: parseFloat(last.toFixed(2)),
        support: parseFloat(sup.toFixed(2)),
        resistance: parseFloat(resVal.toFixed(2)),
        rsi: parseFloat(rsi.toFixed(1)),
        trend: trendVal,
        volume: vol,
        currency: resolved.currency,
        tvSymbol: resolved.tvTicker,
        isIndian: resolved.isIndian,
        news: newsList
      });

    } catch (apiError) {
      console.warn(`[None Controller] Yahoo Finance fetch failed for ${sym}, using fallback:`, apiError.message);
      let basePrice = 100;
      const cleanSym = symbol.toUpperCase().replace('.NS', '').replace('-USD', '').replace('=X', '').replace('=F', '');
      if (cleanSym === 'TSLA') basePrice = 338.23;
      else if (cleanSym === 'AAPL') basePrice = 224.50;
      else if (cleanSym === 'NVDA') basePrice = 128.80;
      else if (cleanSym === 'BTC') basePrice = 65000;
      else if (cleanSym === 'ETH') basePrice = 3500;
      else if (cleanSym === 'RELIANCE') basePrice = 1385;
      else if (cleanSym === 'TCS') basePrice = 3850;
      else if (cleanSym === 'INFY') basePrice = 1420;
      else {
        let charSum = 0;
        for (let i = 0; i < cleanSym.length; i++) {
          charSum += cleanSym.charCodeAt(i);
        }
        basePrice = (charSum % 400) + 10;
      }

      const sup = parseFloat((basePrice * 0.95).toFixed(2));
      const resVal = parseFloat((basePrice * 1.05).toFixed(2));
      const rsi = Math.floor(35 + Math.random() * 40);

      return res.json({
        success: true,
        symbol: symbol.toUpperCase(),
        price: basePrice,
        support: sup,
        resistance: resVal,
        rsi: rsi,
        trend: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
        volume: 1200000,
        currency: resolved.currency,
        tvSymbol: resolved.tvTicker,
        isIndian: resolved.isIndian,
        news: [],
        warning: 'Yahoo API offline. Simulated market data loaded.'
      });
    }

  } catch (error) {
    console.error('[None Controller] Error fetching live technicals:', error);
    return res.status(500).json({ error: 'Server error retrieving stock technicals.' });
  }
};
