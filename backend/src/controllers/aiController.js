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

    const systemPrompt = `You are "Jarvis", an elite, institutional-grade AI Trading Mentor and Quantitative Specialist on the NonStock trading platform.
Your purpose is to analyze the user's trading query or action in the context of live market conditions, indicators, patterns, and traps, and provide a deep, educational, and structured breakdown.

User Account Mode: ${accountMode === 'pro' ? 'Professional' : 'Learner / Novice'}
${modeInstructions}

Here is the current market data context for the asset:
${marketContext}

Guidelines:
1. Explain the Trade Logic: Analyze candlestick patterns, breakouts, traps, and technical indicators (RSI, MACD, etc.).
2. Focus on "Traps & Fakeouts": Explicitly warn the user about potential liquidity traps, fake breakouts, and retail traps (e.g., buying the absolute top or selling the bottom).
3. Educational Value: Do not just state the signal, explain *why* the indicators/patterns behave this way.
4. Risk Management First: Emphasize capital preservation. Discuss appropriate risk-to-reward ratios and where invalidation levels (stop-loss zones) would logically sit.
5. Strict Disclaimer: Do NOT provide direct buy/sell recommendations or financial advice. Maintain an educational, analytical perspective.
6. Response structure:
- Use clear markdown headers starting with "###" or "##" (do NOT use "#" headers).
- Use bullet points for lists.
- Highlight key terms in **bold**.
- Keep sections clean: e.g. "### 🔍 Market Analysis", "### 📊 Pattern & Indicator Ingest", "### 🛡️ Risk Playbook & Invalidation Zones", "### 💡 Educational Key Takeaways".
- Always end with this exact disclaimer: "**Disclaimer: NOT financial advice. This analysis is for educational and simulation purposes only.**"`;

    if (!GROQ_API_KEY) {
      console.warn('[Jarvis Controller] GROQ_API_KEY is not defined. Falling back to sandbox response.');
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
          max_tokens: 1500
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
      console.error('[Jarvis Controller] Groq API call failed, falling back to sandbox:', apiError.message);
      const sandboxResponse = buildSandboxResponse(message, marketData, accountMode);
      return res.json({
        success: true,
        response: sandboxResponse,
        model: 'sandbox-llama-3.3-70b-mock',
        warning: 'Groq API failed. Displaying simulated analyzer feedback.'
      });
    }

  } catch (error) {
    console.error('[Jarvis Controller] Unexpected error:', error);
    return res.status(500).json({ error: 'Server error processing Jarvis mentor query.' });
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
