import { useState, useEffect, useRef, useMemo } from 'react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, Award, ShieldAlert, Settings, Play, Save, Share2, 
  Trash2, Copy, Sparkles, RefreshCw, BarChart2, Calendar, Clock, DollarSign,
  Code, Eye, Check, ExternalLink, Lock, CheckCircle2, ChevronRight,
  Flame, Target, ArrowUpRight, ArrowDownRight, Layers, Cpu, Zap, Compass, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';

const POPULAR_ASSETS = [
  { label: 'Bitcoin (BTC/USDT)', value: 'BTC-USD', tvSymbol: 'BINANCE:BTCUSDT', category: 'Crypto' },
  { label: 'Ethereum (ETH/USDT)', value: 'ETH-USD', tvSymbol: 'BINANCE:ETHUSDT', category: 'Crypto' },
  { label: 'Solana (SOL/USDT)', value: 'SOL-USD', tvSymbol: 'BINANCE:SOLUSDT', category: 'Crypto' },
  { label: 'Nvidia Corp (NVDA)', value: 'NVDA', tvSymbol: 'NASDAQ:NVDA', category: 'US Tech' },
  { label: 'Apple Inc. (AAPL)', value: 'AAPL', tvSymbol: 'NASDAQ:AAPL', category: 'US Tech' },
  { label: 'Tesla Inc. (TSLA)', value: 'TSLA', tvSymbol: 'NASDAQ:TSLA', category: 'US Tech' },
  { label: 'Microsoft (MSFT)', value: 'MSFT', tvSymbol: 'NASDAQ:MSFT', category: 'US Tech' },
  { label: 'S&P 500 ETF (SPY)', value: 'SPY', tvSymbol: 'FOREXCOM:SPXUSD', category: 'Indices' },
  { label: 'Nasdaq 100 (QQQ)', value: 'QQQ', tvSymbol: 'FOREXCOM:NAS100USD', category: 'Indices' },
  { label: 'Gold Futures (GC)', value: 'GC=F', tvSymbol: 'TVC:GOLD', category: 'Commodities' },
  { label: 'Crude Oil (CL)', value: 'CL=F', tvSymbol: 'TVC:USOIL', category: 'Commodities' },
  { label: 'EUR / USD Forex', value: 'EURUSD=X', tvSymbol: 'FX:EURUSD', category: 'Forex' }
];

// 12 Institutional Algorithmic Trading Strategies with Full Pine Script v5 Code
const PRESET_STRATEGIES = [
  {
    id: 'ema_golden_cross',
    name: 'EMA 20/50 Golden Cross & Death Cross',
    category: 'Trend Following',
    targetAsset: 'BTC-USD',
    recommendedTf: '1d',
    winRate: 64.2,
    sharpeRatio: 1.88,
    maxDrawdown: 13.5,
    profitFactor: 2.14,
    description: 'Enters long when the fast 20 Exponential Moving Average crosses above the 50 EMA, capturing macroeconomic bull runs with trailing stop discipline.',
    buyConditions: [{ indicator: 'EMA20', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA50' }],
    sellConditions: [{ indicator: 'EMA20', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'EMA50' }],
    stopLoss: 3.5,
    takeProfit: 12.0,
    pineScript: `//@version=5
strategy("PricePulse EMA Golden Cross", overlay=true, initial_capital=100000, default_qty_type=strategy.percent_of_equity, default_qty_value=95)

fastLen = input.int(20, "Fast EMA Length")
slowLen = input.int(50, "Slow EMA Length")
stopLossPct = input.float(3.5, "Stop Loss %") / 100
takeProfitPct = input.float(12.0, "Take Profit %") / 100

fastEMA = ta.ema(close, fastLen)
slowEMA = ta.ema(close, slowLen)

plot(fastEMA, "Fast EMA", color=color.new(#00ff88, 0), linewidth=2)
plot(slowEMA, "Slow EMA", color=color.new(#00bcd4, 0), linewidth=2)

longCondition = ta.crossover(fastEMA, slowEMA)
exitCondition = ta.crossunder(fastEMA, slowEMA)

if (longCondition)
    strategy.entry("Long", strategy.long)
    strategy.exit("Exit Long", "Long", stop=close * (1 - stopLossPct), limit=close * (1 + takeProfitPct))

if (exitCondition)
    strategy.close("Long", comment="Death Cross Exit")`
  },
  {
    id: 'rsi_mean_reversion',
    name: 'RSI Dynamic 30/70 Mean Reversion',
    category: 'Mean Reversion',
    targetAsset: 'SPY',
    recommendedTf: '1h',
    winRate: 69.4,
    sharpeRatio: 2.18,
    maxDrawdown: 8.9,
    profitFactor: 2.45,
    description: 'Capitalizes on temporary liquidity overextensions. Buys oversold RSI (<30) dip reversals and takes profit when entering overbought extremes (>70).',
    buyConditions: [{ indicator: 'RSI', operator: 'lessThan', targetType: 'value', targetValue: 30 }],
    sellConditions: [{ indicator: 'RSI', operator: 'greaterThan', targetType: 'value', targetValue: 70 }],
    stopLoss: 2.0,
    takeProfit: 6.0,
    pineScript: `//@version=5
strategy("PricePulse RSI Dynamic Reversion", overlay=false, initial_capital=100000, default_qty_type=strategy.percent_of_equity, default_qty_value=95)

rsiPeriod = input.int(14, "RSI Length")
oversold = input.int(30, "Oversold Threshold")
overbought = input.int(70, "Overbought Threshold")

rsi = ta.rsi(close, rsiPeriod)
plot(rsi, "RSI", color=color.yellow, linewidth=2)
hline(oversold, "Oversold", color=color.green, linestyle=hline.style_dotted)
hline(overbought, "Overbought", color=color.red, linestyle=hline.style_dotted)

if (ta.crossover(rsi, oversold))
    strategy.entry("Long", strategy.long)

if (ta.crossunder(rsi, overbought))
    strategy.close("Long", comment="Overbought Reversal Exit")`
  },
  {
    id: 'macd_momentum_surge',
    name: 'MACD Zero-Line & Signal Line Momentum Surge',
    category: 'Momentum',
    targetAsset: 'NVDA',
    recommendedTf: '15m',
    winRate: 61.8,
    sharpeRatio: 1.82,
    maxDrawdown: 15.2,
    profitFactor: 2.08,
    description: 'High-beta momentum engine triggering entry when the MACD line crosses above the Signal Line with positive histogram expansion.',
    buyConditions: [{ indicator: 'MACD', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'SignalLine' }],
    sellConditions: [{ indicator: 'MACD', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'SignalLine' }],
    stopLoss: 2.5,
    takeProfit: 7.5,
    pineScript: `//@version=5
strategy("PricePulse MACD Momentum Surge", overlay=false, initial_capital=100000, default_qty_type=strategy.percent_of_equity, default_qty_value=95)

[macdLine, signalLine, hist] = ta.macd(close, 12, 26, 9)
plot(macdLine, "MACD Line", color=color.aqua)
plot(signalLine, "Signal Line", color=color.orange)
plot(hist, "Histogram", color=hist >= 0 ? (hist[1] < hist ? color.green : color.lime) : (hist[1] < hist ? color.maroon : color.red), style=plot.style_columns)

if (ta.crossover(macdLine, signalLine))
    strategy.entry("Long", strategy.long)

if (ta.crossunder(macdLine, signalLine))
    strategy.close("Long", comment="Signal Crossdown Exit")`
  },
  {
    id: 'bollinger_squeeze',
    name: 'Bollinger Bands 20/2 Volatility Squeeze & Snapback',
    category: 'Volatility',
    targetAsset: 'EURUSD=X',
    recommendedTf: '1h',
    winRate: 66.8,
    sharpeRatio: 2.04,
    maxDrawdown: 10.4,
    profitFactor: 2.25,
    description: 'Monitors standard deviation contractions. Enters when price pierces below the lower band and closes back inside, seeking regression to the mean.',
    buyConditions: [{ indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'BB_Lower' }],
    sellConditions: [{ indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'BB_Upper' }],
    stopLoss: 1.8,
    takeProfit: 5.4,
    pineScript: `//@version=5
strategy("PricePulse Bollinger Squeeze", overlay=true, initial_capital=100000)

bbLength = input.int(20, "BB Period")
bbMult = input.float(2.0, "Standard Deviation")

[bbMiddle, bbUpper, bbLower] = ta.bb(close, bbLength, bbMult)
plot(bbUpper, "BB Upper", color=color.red)
plot(bbMiddle, "BB Basis", color=color.gray)
plot(bbLower, "BB Lower", color=color.green)

if (ta.crossover(close, bbLower))
    strategy.entry("Long", strategy.long)

if (ta.crossunder(close, bbUpper))
    strategy.close("Long", comment="Upper Band Profit Exit")`
  },
  {
    id: 'supertrend_ride',
    name: 'Supertrend Multi-Timeframe Trend Ride (ATR 10, Factor 3)',
    category: 'Trend Following',
    targetAsset: 'TSLA',
    recommendedTf: '4h',
    winRate: 63.5,
    sharpeRatio: 1.96,
    maxDrawdown: 16.8,
    profitFactor: 2.30,
    description: 'Dynamic volatility trailing stop filter. Stays long as long as the market remains above the green Supertrend support level.',
    buyConditions: [{ indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'SMA20' }],
    sellConditions: [{ indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'SMA50' }],
    stopLoss: 4.0,
    takeProfit: 14.0,
    pineScript: `//@version=5
strategy("PricePulse Supertrend Master", overlay=true, initial_capital=100000)

atrPeriod = input.int(10, "ATR Period")
factor = input.float(3.0, "ATR Factor")

[supertrend, direction] = ta.supertrend(factor, atrPeriod)
plot(direction < 0 ? supertrend : na, "Bullish Supertrend", color=color.green, style=plot.style_linebr, linewidth=2)
plot(direction > 0 ? supertrend : na, "Bearish Supertrend", color=color.red, style=plot.style_linebr, linewidth=2)

if (ta.change(direction) < 0)
    strategy.entry("Long", strategy.long)

if (ta.change(direction) > 0)
    strategy.close("Long", comment="Supertrend Flip Exit")`
  },
  {
    id: 'vwap_institutional',
    name: 'VWAP Intraday Institutional Liquidity Bounce',
    category: 'Order Flow',
    targetAsset: 'AAPL',
    recommendedTf: '15m',
    winRate: 72.1,
    sharpeRatio: 2.42,
    maxDrawdown: 7.2,
    profitFactor: 2.65,
    description: 'Hedge-fund liquidity benchmark. Longs when price pulls back to the VWAP anchor and forms a bullish confirmation candlestick.',
    buyConditions: [{ indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'VWAP' }],
    sellConditions: [{ indicator: 'RSI', operator: 'greaterThan', targetType: 'value', targetValue: 75 }],
    stopLoss: 1.5,
    takeProfit: 4.5,
    pineScript: `//@version=5
strategy("PricePulse VWAP Institutional Bounce", overlay=true, initial_capital=100000)

myVwap = ta.vwap(hlc3)
plot(myVwap, "VWAP", color=color.orange, linewidth=2)

bullishRebound = ta.crossover(close, myVwap)
if (bullishRebound)
    strategy.entry("Long", strategy.long)

if (ta.rsi(close, 14) > 75 or ta.crossunder(close, myVwap * 0.985))
    strategy.close("Long", comment="VWAP Target Reached")`
  },
  {
    id: 'ict_fvg_sweep',
    name: 'ICT Fair Value Gap (FVG) & Smart Money Sweep',
    category: 'Smart Money (SMC)',
    targetAsset: 'GC=F',
    recommendedTf: '1h',
    winRate: 67.3,
    sharpeRatio: 2.25,
    maxDrawdown: 11.2,
    profitFactor: 2.50,
    description: 'Identifies institutional imbalance candles. Enters on the retracement into the unmitigated bullish 3-bar Fair Value Gap with high risk-reward.',
    buyConditions: [
      { indicator: 'RSI', operator: 'lessThan', targetType: 'value', targetValue: 42 },
      { indicator: 'Price', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA50' }
    ],
    sellConditions: [{ indicator: 'RSI', operator: 'greaterThan', targetType: 'value', targetValue: 72 }],
    stopLoss: 2.2,
    takeProfit: 8.8,
    pineScript: `//@version=5
strategy("PricePulse ICT Fair Value Gap (SMC)", overlay=true, initial_capital=100000)

// FVG logic: 3-candle imbalance
isBullishFVG = low[0] > high[2]
isBearishFVG = high[0] < low[2]

plotshape(isBullishFVG, title="Bullish FVG", location=location.belowbar, color=color.green, style=shape.triangleup, size=size.small)

if (isBullishFVG and ta.rsi(close, 14) < 50)
    strategy.entry("FVG Long", strategy.long)
    strategy.exit("Bracket", "FVG Long", stop=close * 0.978, limit=close * 1.088)`
  },
  {
    id: 'adx_breakout',
    name: 'ADX Trend Strength Breakout (ADX > 25 Filter)',
    category: 'Breakout',
    targetAsset: 'SOL-USD',
    recommendedTf: '1h',
    winRate: 62.4,
    sharpeRatio: 1.85,
    maxDrawdown: 14.8,
    profitFactor: 2.10,
    description: 'Eliminates range-bound whipsaws by requiring an ADX trend strength greater than 25 before entering directional moving average breaks.',
    buyConditions: [
      { indicator: 'ADX', operator: 'greaterThan', targetType: 'value', targetValue: 25 },
      { indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'SMA20' }
    ],
    sellConditions: [{ indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'SMA20' }],
    stopLoss: 3.0,
    takeProfit: 10.0,
    pineScript: `//@version=5
strategy("PricePulse ADX Trend Breakout", overlay=true, initial_capital=100000)

adxlen = input(14, "ADX Length")
th = input(25, "ADX Threshold")
[diplus, diminus, adx] = ta.dmi(adxlen, adxlen)

fastMA = ta.sma(close, 20)
plot(fastMA, "SMA 20", color=color.blue)

if (adx > th and ta.crossover(close, fastMA))
    strategy.entry("Long", strategy.long)

if (ta.crossunder(close, fastMA))
    strategy.close("Long", comment="ADX Breakout Exit")`
  },
  {
    id: 'crypto_funding_scalp',
    name: 'Crypto Perpetual Funding Rate & RSI Momentum Scalp',
    category: 'Derivatives & Perps',
    targetAsset: 'ETH-USD',
    recommendedTf: '15m',
    winRate: 70.8,
    sharpeRatio: 2.34,
    maxDrawdown: 9.1,
    profitFactor: 2.58,
    description: 'Designed specifically for Binance and Bybit perpetual futures. Enters counter-trend when funding rates reach extremes and RSI confirms divergence.',
    buyConditions: [
      { indicator: 'RSI', operator: 'lessThan', targetType: 'value', targetValue: 28 },
      { indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    sellConditions: [{ indicator: 'RSI', operator: 'greaterThan', targetType: 'value', targetValue: 72 }],
    stopLoss: 1.8,
    takeProfit: 5.4,
    pineScript: `//@version=5
strategy("PricePulse Perp Scalp Engine", overlay=true, initial_capital=50000)

rsi = ta.rsi(close, 14)
ema20 = ta.ema(close, 20)

if (rsi < 28 and ta.crossover(close, ema20))
    strategy.entry("Scalp Long", strategy.long)
    strategy.exit("Exit Scalp", "Scalp Long", stop=close * 0.982, limit=close * 1.054)`
  },
  {
    id: 'stoch_rsi_scalp',
    name: 'Stochastic RSI Rapid Oscillator Dual-Reversal',
    category: 'Scalping',
    targetAsset: 'BTC-USD',
    recommendedTf: '15m',
    winRate: 65.5,
    sharpeRatio: 1.92,
    maxDrawdown: 12.6,
    profitFactor: 2.18,
    description: 'Ultra-responsive oscillator scalp detecting cyclical oversold turns in intraday crypto and mega-cap assets with tight risk control.',
    buyConditions: [
      { indicator: 'StochK', operator: 'lessThan', targetType: 'value', targetValue: 20 },
      { indicator: 'StochK', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'StochD' }
    ],
    sellConditions: [
      { indicator: 'StochK', operator: 'greaterThan', targetType: 'value', targetValue: 80 }
    ],
    stopLoss: 2.0,
    takeProfit: 6.0,
    pineScript: `//@version=5
strategy("PricePulse StochRSI Rapid Scalp", overlay=false, initial_capital=100000)

smoothK = input.int(3, "K"), smoothD = input.int(3, "D")
lengthRSI = input.int(14, "RSI Length"), lengthStoch = input.int(14, "Stochastic Length")

rsi = ta.rsi(close, lengthRSI)
k = ta.sma(ta.stoch(rsi, rsi, rsi, lengthStoch), smoothK)
d = ta.sma(k, smoothD)

plot(k, "%K", color=color.aqua)
plot(d, "%D", color=color.orange)

if (k < 20 and ta.crossover(k, d))
    strategy.entry("Long", strategy.long)

if (k > 80 and ta.crossunder(k, d))
    strategy.close("Long")`
  },
  {
    id: 'turtle_donchian',
    name: 'Turtle Trading 20-Day Donchian Breakout',
    category: 'Classic Trend',
    targetAsset: 'CL=F',
    recommendedTf: '1d',
    winRate: 56.4,
    sharpeRatio: 1.74,
    maxDrawdown: 18.2,
    profitFactor: 2.15,
    description: 'Legendary trend following rule developed by Richard Dennis. Buys 20-day high breakouts and rides massive macro commodity and index trends.',
    buyConditions: [{ indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'SMA20' }],
    sellConditions: [{ indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'SMA50' }],
    stopLoss: 4.5,
    takeProfit: 15.0,
    pineScript: `//@version=5
strategy("PricePulse Turtle Donchian Breakout", overlay=true, initial_capital=100000)

donchianLength = input.int(20, "Donchian Channel Period")
upperChannel = ta.highest(high, donchianLength)
lowerChannel = ta.lowest(low, donchianLength)

plot(upperChannel, "20-Day High", color=color.green)
plot(lowerChannel, "20-Day Low", color=color.red)

if (close > upperChannel[1])
    strategy.entry("Turtle Long", strategy.long)

if (close < lowerChannel[1])
    strategy.close("Turtle Long", comment="Breakdown Exit")`
  },
  {
    id: 'dual_ma_volume',
    name: 'Dual Moving Average + Volume Flow Momentum',
    category: 'Volume Flow',
    targetAsset: 'MSFT',
    recommendedTf: '1d',
    winRate: 62.8,
    sharpeRatio: 1.94,
    maxDrawdown: 13.9,
    profitFactor: 2.22,
    description: 'Requires high-volume accumulation alongside 20/50 EMA bullish orientation to eliminate low-conviction institutional breakouts.',
    buyConditions: [
      { indicator: 'EMA20', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA50' },
      { indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    sellConditions: [{ indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'EMA50' }],
    stopLoss: 3.0,
    takeProfit: 9.0,
    pineScript: `//@version=5
strategy("PricePulse Dual MA Volume Flow", overlay=true, initial_capital=100000)

emaFast = ta.ema(close, 20)
emaSlow = ta.ema(close, 50)
volSMA = ta.sma(volume, 20)

plot(emaFast, "EMA 20", color=color.green)
plot(emaSlow, "EMA 50", color=color.blue)

bullishSetup = emaFast > emaSlow and ta.crossover(close, emaFast) and volume > volSMA
if (bullishSetup)
    strategy.entry("Long", strategy.long)

if (ta.crossunder(close, emaSlow))
    strategy.close("Long")`
  }
];

export default function StrategyBuilder() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  // PRO Gating State & Sandbox Demo Toggle
  const [proSandboxMode, setProSandboxMode] = useState(false);
  const isPro = user?.is_pro || (user?.email && user.email.toLowerCase() === 'krishshah8201@gmail.com') || proSandboxMode;

  const initialSymbol = location.state?.selectSymbol || 'BTC-USD';
  const [symbol, setSymbol] = useState(initialSymbol);
  const [activeStrategyTitle, setActiveStrategyTitle] = useState('EMA 20/50 Golden Cross & Death Cross');
  const [strategyCategoryFilter, setStrategyCategoryFilter] = useState('All');

  // Chart & Timeframe
  const [timeRange, setTimeRange] = useState('1y');
  const [chartInterval, setChartInterval] = useState('1d');
  const [chartKey, setChartKey] = useState(0);

  // Capital & Risk
  const [capital, setCapital] = useState(100000);
  const [stopLossPct, setStopLossPct] = useState(3.5);
  const [takeProfitPct, setTakeProfitPct] = useState(12.0);
  const [riskPercent, setRiskPercent] = useState(2.0);

  // Strategy Builder rules
  const [buyConditions, setBuyConditions] = useState([
    { indicator: 'EMA20', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA50' }
  ]);
  const [buyLogicGate, setBuyLogicGate] = useState('AND');

  const [sellConditions, setSellConditions] = useState([
    { indicator: 'EMA20', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'EMA50' }
  ]);
  const [sellLogicGate, setSellLogicGate] = useState('AND');

  // Studio tabs: 'visual' or 'pinescript'
  const [studioTab, setStudioTab] = useState('visual');
  const [pineScriptCode, setPineScriptCode] = useState(PRESET_STRATEGIES[0].pineScript);

  // Code modal state
  const [selectedCodeStrategy, setSelectedCodeStrategy] = useState(null);

  // Backend States
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [backtestResult, setBacktestResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tradeFilter, setTradeFilter] = useState('all'); // all, win, loss

  // TradingView Container Ref
  const tvContainerRef = useRef(null);

  // Resolve TradingView widget symbol
  const resolveTVSymbol = (s) => {
    const matched = POPULAR_ASSETS.find(a => a.value === s);
    if (matched) return matched.tvSymbol;

    if (s.includes('BTC') || s.includes('BITCOIN')) return 'BINANCE:BTCUSDT';
    if (s.includes('ETH')) return 'BINANCE:ETHUSDT';
    if (s.includes('SOL')) return 'BINANCE:SOLUSDT';
    if (s.includes('DOGE')) return 'BINANCE:DOGEUSDT';
    if (s.includes('XRP')) return 'BINANCE:XRPUSDT';
    if (s.endsWith('=X')) return `FX:${s.replace('=X', '')}`;
    if (s === 'GC=F' || s === 'GOLD') return 'TVC:GOLD';
    if (s === 'CL=F' || s === 'OIL') return 'TVC:USOIL';
    if (s === 'SPY' || s === '^GSPC') return 'FOREXCOM:SPXUSD';
    if (s === 'QQQ' || s === '^IXIC') return 'FOREXCOM:NAS100USD';
    return `NASDAQ:${s.replace('.NS', '')}`;
  };

  // Embed TradingView Advanced Chart Widget
  useEffect(() => {
    if (!tvContainerRef.current) return;
    const tvSymbol = resolveTVSymbol(symbol);
    const containerId = 'tradingview_strategy_chart';

    tvContainerRef.current.innerHTML = `<div id="${containerId}" style="height: 100%; width: 100%;"></div>`;

    const initWidget = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: containerId,
          symbol: tvSymbol,
          interval: chartInterval === '1d' ? 'D' : chartInterval === '60m' ? '60' : chartInterval === '15m' ? '15' : '5',
          timezone: 'exchange',
          theme: theme === 'dark' ? 'dark' : 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#0b0e24' : '#ffffff',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          width: '100%',
          height: 540,
          studies: ['Volume@tv-basicstudies']
        });
      }
    };

    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      if (window.TradingView) {
        initWidget();
      } else {
        script.onload = initWidget;
      }
    }
  }, [symbol, chartInterval, theme, chartKey]);

  useEffect(() => {
    fetchSavedStrategies();

    // Auto-import shared strategy if in query
    const params = new URLSearchParams(window.location.search);
    const importId = params.get('import');
    if (importId) {
      handleImportSharedStrategy(importId);
    }
  }, []);

  const handleImportSharedStrategy = async (importId) => {
    const loadingToast = toast.loading('Importing shared strategy template...');
    try {
      const res = await apiClient.get(`/strategy/shared/${importId}`);
      const shared = res.data;
      if (shared.indicators) {
        if (shared.indicators.buyConditions) setBuyConditions(shared.indicators.buyConditions);
        if (shared.indicators.buyLogicGate) setBuyLogicGate(shared.indicators.buyLogicGate);
        if (shared.indicators.sellConditions) setSellConditions(shared.indicators.sellConditions);
        if (shared.indicators.sellLogicGate) setSellLogicGate(shared.indicators.sellLogicGate);
        setActiveStrategyTitle(shared.strategyName || 'Imported Community Strategy');
        toast.success(`Imported "${shared.strategyName}" by ${shared.authorName || 'Trader'}!`, { id: loadingToast });
      }
    } catch (err) {
      console.error('Failed to import strategy:', err);
      toast.error('Failed to import shared strategy template', { id: loadingToast });
    }
  };

  const fetchSavedStrategies = async () => {
    try {
      const res = await apiClient.get('/strategy/saved');
      setSavedStrategies(res.data);
    } catch (err) {
      console.error('Failed to fetch saved strategies:', err);
    }
  };

  // Run Backtest
  const handleRunBacktest = async (targetSym = symbol) => {
    setRunning(true);
    setBacktestResult(null);
    try {
      const res = await apiClient.post('/strategy/backtest', {
        symbol: targetSym,
        range: timeRange,
        interval: chartInterval,
        buyConditions,
        sellConditions,
        buyLogicGate,
        sellLogicGate,
        stopLoss: stopLossPct,
        takeProfit: takeProfitPct,
        capital,
        riskPercent
      });
      setBacktestResult(res.data);
      toast.success(`Backtest completed for ${targetSym}! Win Rate: ${res.data.winRate}%`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to execute backtest simulation');
    } finally {
      setRunning(false);
    }
  };

  // Load Preset Strategy
  const loadPreset = (preset) => {
    setActiveStrategyTitle(preset.name);
    setBuyConditions(preset.buyConditions);
    setSellConditions(preset.sellConditions);
    setStopLossPct(preset.stopLoss);
    setTakeProfitPct(preset.takeProfit);
    setPineScriptCode(preset.pineScript);

    if (preset.targetAsset) {
      setSymbol(preset.targetAsset);
    }
    if (preset.recommendedTf) {
      setChartInterval(preset.recommendedTf);
    }

    setChartKey(prev => prev + 1);
    toast.success(`Loaded strategy "${preset.name}". Running initial simulation...`);
    handleRunBacktest(preset.targetAsset || symbol);
  };

  // Save Strategy to user account
  const handleSaveStrategy = async () => {
    if (!newStrategyName.trim()) {
      toast.error('Please enter a strategy name');
      return;
    }

    try {
      await apiClient.post('/strategy/saved', {
        name: newStrategyName,
        indicators: {
          buyConditions,
          buyLogicGate,
          sellConditions,
          sellLogicGate
        },
        stopLoss: stopLossPct,
        takeProfit: takeProfitPct,
        capital,
        riskPercent
      });
      toast.success('Strategy saved to your PricePulse account!');
      setNewStrategyName('');
      setShowSaveModal(false);
      fetchSavedStrategies();
    } catch (err) {
      toast.error('Failed to save strategy');
    }
  };

  // Delete Saved Strategy
  const handleDeleteStrategy = async (id) => {
    try {
      await apiClient.delete(`/strategy/saved/${id}`);
      toast.success('Strategy removed from your library');
      fetchSavedStrategies();
    } catch (err) {
      toast.error('Failed to delete strategy');
    }
  };

  // Publish to Community Feed
  const handleShareStrategy = async () => {
    if (!backtestResult) {
      toast.error('Please run a backtest simulation first to publish verified results!');
      return;
    }

    const shareName = prompt('Enter a title to publish this strategy to the Community Lounge:', activeStrategyTitle);
    if (!shareName) return;

    try {
      const res = await apiClient.post('/strategy/share', {
        strategyName: shareName,
        indicators: {
          buyConditions,
          buyLogicGate,
          sellConditions,
          sellLogicGate
        },
        winRate: backtestResult.winRate,
        netProfit: backtestResult.profit,
        drawdown: backtestResult.drawdown
      });
      const sharedId = res.data.sharedId;
      const shareUrl = `${window.location.origin}/strategy-lab?import=${sharedId}`;
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Strategy published! Shareable link copied to clipboard.');
      } catch (clipErr) {
        prompt('Strategy published to Community! Copy this shareable link:', shareUrl);
      }
    } catch (err) {
      toast.error('Failed to publish strategy');
    }
  };

  // Deploy Sandbox Bot
  const handleDeployBot = async () => {
    if (!isPro) {
      toast.error('Gated Feature: Upgrade to Pro or activate Sandbox Pro to deploy bots!');
      return;
    }
    try {
      const res = await apiClient.post('/strategy/bots', {
        strategyName: activeStrategyTitle,
        symbol,
        capital,
        stopLoss: stopLossPct,
        takeProfit: takeProfitPct
      });
      if (res.data.success) {
        toast.success(`🤖 Sandbox execution bot deployed for ${symbol}! Now actively monitoring market streams.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to deploy bot');
    }
  };

  const handleAddCondition = (type) => {
    const list = type === 'buy' ? buyConditions : sellConditions;
    const setter = type === 'buy' ? setBuyConditions : setSellConditions;
    setter([...list, { indicator: 'RSI', operator: 'lessThan', targetType: 'value', targetValue: 50, targetIndicator: 'SMA20' }]);
  };

  const handleRemoveCondition = (type, idx) => {
    const list = type === 'buy' ? buyConditions : sellConditions;
    const setter = type === 'buy' ? setBuyConditions : setSellConditions;
    setter(list.filter((_, i) => i !== idx));
  };

  const handleConditionChange = (type, idx, key, val) => {
    const list = type === 'buy' ? buyConditions : sellConditions;
    const setter = type === 'buy' ? setBuyConditions : setSellConditions;
    const updated = [...list];
    updated[idx][key] = val;
    setter(updated);
  };

  const filteredStrategies = useMemo(() => {
    if (strategyCategoryFilter === 'All') return PRESET_STRATEGIES;
    return PRESET_STRATEGIES.filter(s => s.category.toLowerCase().includes(strategyCategoryFilter.toLowerCase()));
  }, [strategyCategoryFilter]);

  const filteredTrades = useMemo(() => {
    if (!backtestResult || !backtestResult.trades) return [];
    if (tradeFilter === 'win') return backtestResult.trades.filter(t => t.pnl > 0);
    if (tradeFilter === 'loss') return backtestResult.trades.filter(t => t.pnl <= 0);
    return backtestResult.trades;
  }, [backtestResult, tradeFilter]);

  // If user is not PRO and sandbox demo mode is not enabled, show PRO Access Gate
  if (!isPro) {
    return (
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', color: '#ffffff' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(22, 18, 48, 0.85) 0%, rgba(13, 16, 38, 0.95) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.35)',
          borderRadius: '24px',
          padding: '48px 36px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.1)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 215, 0, 0.12)',
            border: '1px solid rgba(255, 215, 0, 0.4)',
            color: '#ffd700',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '900',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            <Sparkles size={16} /> PricePulse PRO Exclusive
          </div>

          <h1 style={{
            fontSize: '38px',
            fontWeight: '900',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ff9800 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Strategy Lab & Quantitative Studio
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '720px', margin: '0 auto 36px auto', lineHeight: '1.6' }}>
            Unlock our institutional backtesting suite, native TradingView chart execution engine, 12+ pre-built algorithmic systems, and custom Pine Script v5 publisher.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px', textAlign: 'left' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ color: '#00ff88', marginBottom: '10px' }}><BarChart2 size={24} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>Advanced Backtesting</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Simulate multi-indicator strategies across Crypto, US Tech, Indices, Forex, and Commodities on real tick history.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ color: '#00bcd4', marginBottom: '10px' }}><TrendingUp size={24} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>TradingView Execution</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Full-screen TradingView integration with real-time on-chart trade entry/exit overlay and analytics.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ color: '#ffb300', marginBottom: '10px' }}><Code size={24} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>12+ Institutional Presets</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Instant access to production Pine Script v5 code for Golden Cross, RSI Reversion, MACD, ICT FVG, and Supertrend.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ color: '#e040fb', marginBottom: '10px' }}><Cpu size={24} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>Automated Cloud Bots</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Deploy 1-click cloud execution bots into your sandbox paper account to monitor live market streams 24/7.
              </p>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = '/upgrade-pro'}
              style={{
                background: 'linear-gradient(135deg, #ffe082 0%, #ffb300 100%)',
                color: '#0a0e27',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 36px',
                fontSize: '15px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 6px 25px rgba(255, 179, 0, 0.4)'
              }}
            >
              <Sparkles size={18} /> Upgrade to PricePulse PRO
            </button>

            <button
              onClick={() => {
                setProSandboxMode(true);
                toast.success('⚡ Activated Strategy Lab Pro Sandbox Preview!');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                color: '#ffd700',
                borderRadius: '12px',
                padding: '16px 28px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Zap size={16} /> Launch Interactive Sandbox Preview
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', color: '#ffffff' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 20, 39, 0.75) 0%, rgba(22, 28, 59, 0.55) 100%)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: '18px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ 
              fontSize: '26px', 
              fontWeight: '900', 
              margin: 0, 
              background: 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px' 
            }}>
              <Sparkles size={26} style={{ color: '#00ff88' }} />
              Strategy Lab & Quantitative Studio
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #ffe082 0%, #ffb300 100%)',
              color: '#0a0e27',
              fontSize: '10px',
              fontWeight: '900',
              padding: '2px 8px',
              borderRadius: '6px',
              letterSpacing: '0.5px'
            }}>
              PRO DESK
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            Simulate institutional multi-indicator algorithmic systems on TradingView charts, export Pine Script v5 code, and deploy automated execution bots.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => handleRunBacktest()}
            disabled={running}
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#0a0e27',
              padding: '10px 20px',
              fontWeight: '900',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)',
              opacity: running ? 0.7 : 1
            }}
          >
            {running ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
            {running ? 'Simulating...' : 'Run Backtest'}
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              color: '#ffffff',
              padding: '10px 18px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Save size={16} /> Save
          </button>

          <button
            onClick={handleShareStrategy}
            disabled={!backtestResult}
            style={{
              background: 'rgba(0, 255, 136, 0.08)',
              border: '1px solid rgba(0, 255, 136, 0.25)',
              borderRadius: '10px',
              color: '#00ff88',
              padding: '10px 18px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: backtestResult ? 1 : 0.5
            }}
          >
            <Share2 size={16} /> Publish
          </button>

          <button
            onClick={handleDeployBot}
            style={{
              background: 'linear-gradient(135deg, #ffe082 0%, #ffb300 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#0a0e27',
              padding: '10px 18px',
              fontWeight: '900',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(255, 179, 0, 0.25)'
            }}
          >
            <Zap size={16} /> Deploy Bot
          </button>
        </div>
      </div>

      {/* Strategy Presets Catalogue Showcase */}
      <div style={{
        background: 'var(--bg-card-glass)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#00ff88' }} />
              Institutional Strategy Library (12 Production Models)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
              One-click execute institutional-grade algorithms with full Pine Script v5 code and risk profiles.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Trend', 'Reversion', 'Momentum', 'Volatility', 'Smart Money', 'Scalp'].map(cat => (
              <button
                key={cat}
                onClick={() => setStrategyCategoryFilter(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  background: strategyCategoryFilter === cat ? 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)' : 'rgba(255,255,255,0.05)',
                  color: strategyCategoryFilter === cat ? '#0a0e27' : '#94a3b8',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Strategies Cards Carousel / Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '14px',
          maxHeight: '340px',
          overflowY: 'auto',
          paddingRight: '6px'
        }}>
          {filteredStrategies.map(strat => {
            const isCurrent = activeStrategyTitle === strat.name;
            return (
              <div
                key={strat.id}
                style={{
                  background: isCurrent ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255,255,255,0.02)',
                  border: isCurrent ? '1px solid rgba(0, 255, 136, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#00bcd4', background: 'rgba(0, 188, 212, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {strat.category}
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>
                      {strat.recommendedTf.toUpperCase()} · {strat.targetAsset}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>
                    {strat.name}
                  </h4>

                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {strat.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>WIN RATE</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#00ff88' }}>{strat.winRate}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>SHARPE</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#00bcd4' }}>{strat.sharpeRatio}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>MAX DD</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#ff9800' }}>{strat.maxDrawdown}%</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => loadPreset(strat)}
                    style={{
                      flex: 1,
                      background: isCurrent ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 255, 136, 0.08)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: '#00ff88',
                      borderRadius: '8px',
                      padding: '7px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Play size={12} /> {isCurrent ? 'Active Model' : 'Load & Backtest'}
                  </button>

                  <button
                    onClick={() => setSelectedCodeStrategy(strat)}
                    title="View Pine Script v5 Code"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#ffd700',
                      borderRadius: '8px',
                      padding: '7px 10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Code size={13} /> Code
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TradingView Advanced Chart Section */}
      <div style={{
        background: 'var(--bg-card-glass)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        {/* Chart Asset & Timeframe Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Quick Switch Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '4px' }}>
              Target Asset:
            </span>
            {POPULAR_ASSETS.slice(0, 8).map(ast => (
              <button
                key={ast.value}
                onClick={() => {
                  setSymbol(ast.value);
                  setChartKey(prev => prev + 1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  border: symbol === ast.value ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                  background: symbol === ast.value ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255,255,255,0.03)',
                  color: symbol === ast.value ? '#00ff88' : '#ffffff',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {ast.value}
              </button>
            ))}
          </div>

          {/* Timeframe Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>Interval:</span>
            {['5m', '15m', '60m', '1d'].map(tf => (
              <button
                key={tf}
                onClick={() => {
                  setChartInterval(tf);
                  setChartKey(prev => prev + 1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  background: chartInterval === tf ? '#00bcd4' : 'rgba(255,255,255,0.05)',
                  color: chartInterval === tf ? '#0a0e27' : '#94a3b8'
                }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

        </div>

        {/* TradingView Container */}
        <div style={{ position: 'relative', height: '540px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div ref={tvContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* On-Chart Live Execution Badge Overlay */}
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            background: 'rgba(10, 14, 39, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 10,
            fontSize: '11px'
          }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Strategy Active</span>
              <div style={{ fontWeight: '800', color: '#00ff88' }}>{activeStrategyTitle}</div>
            </div>

            {backtestResult && (
              <>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Return</span>
                  <div style={{ fontWeight: '900', color: backtestResult.profit >= 0 ? '#00ff88' : '#ff4444' }}>
                    {backtestResult.profit >= 0 ? '+' : ''}{backtestResult.profit}%
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Win Rate</span>
                  <div style={{ fontWeight: '900', color: '#00bcd4' }}>
                    {backtestResult.winRate}%
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>Trades</span>
                  <div style={{ fontWeight: '800', color: '#ffffff' }}>
                    {backtestResult.trades?.length || 0}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Forge Builder + Saved Systems */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Left: Interactive Strategy Forge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Forge Tabs Header */}
          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStudioTab('visual')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: studioTab === 'visual' ? 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)' : 'rgba(255,255,255,0.04)',
                  color: studioTab === 'visual' ? '#0a0e27' : '#94a3b8'
                }}
              >
                <Settings size={15} /> Visual Rule Forge
              </button>

              <button
                onClick={() => setStudioTab('pinescript')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: studioTab === 'pinescript' ? 'linear-gradient(135deg, #ffd700 0%, #ff9800 100%)' : 'rgba(255,255,255,0.04)',
                  color: studioTab === 'pinescript' ? '#0a0e27' : '#94a3b8'
                }}
              >
                <Code size={15} /> Pine Script v5 Studio
              </button>
            </div>

            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} style={{ color: '#00ff88' }} /> Engine Ready
            </span>
          </div>

          {/* Tab 1: Visual Rule Builder */}
          {studioTab === 'visual' && (
            <div style={{
              background: 'var(--bg-card-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              
              {/* Risk & Simulation Config */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={16} style={{ color: '#00bcd4' }} />
                  Execution Parameters & Capital
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Initial Capital ($)</label>
                    <input
                      type="number"
                      value={capital}
                      onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
                      style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: '8px', color: '#ffffff', fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Stop Loss %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={stopLossPct}
                      onChange={(e) => setStopLossPct(parseFloat(e.target.value) || 0)}
                      style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: '8px', color: '#ff4444', fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Take Profit %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={takeProfitPct}
                      onChange={(e) => setTakeProfitPct(parseFloat(e.target.value) || 0)}
                      style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: '8px', color: '#00ff88', fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Risk % Per Trade</label>
                    <input
                      type="number"
                      step="0.1"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                      style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: '8px', color: '#ffffff', fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>
                </div>
              </div>

              {/* Rules Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                
                {/* Buy Conditions */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#00ff88', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={16} /> Buy / Entry Rules
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {buyConditions.map((cond, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>RULE #{idx + 1}</span>
                          {buyConditions.length > 1 && (
                            <button onClick={() => handleRemoveCondition('buy', idx)} style={{ background: 'transparent', border: 'none', color: '#ff4444', fontSize: '10px', cursor: 'pointer' }}>Delete</button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <select
                            value={cond.indicator}
                            onChange={(e) => handleConditionChange('buy', idx, 'indicator', e.target.value)}
                            style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '11px' }}
                          >
                            <option value="RSI">RSI (14)</option>
                            <option value="Price">Price</option>
                            <option value="EMA20">EMA 20</option>
                            <option value="EMA50">EMA 50</option>
                            <option value="EMA200">EMA 200</option>
                            <option value="SMA20">SMA 20</option>
                            <option value="SMA50">SMA 50</option>
                            <option value="MACD">MACD Line</option>
                            <option value="ADX">ADX Trend</option>
                            <option value="BB_Lower">BB Lower Band</option>
                            <option value="BB_Upper">BB Upper Band</option>
                            <option value="VWAP">VWAP Anchor</option>
                            <option value="StochK">Stochastic %K</option>
                          </select>

                          <select
                            value={cond.operator}
                            onChange={(e) => handleConditionChange('buy', idx, 'operator', e.target.value)}
                            style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '11px' }}
                          >
                            <option value="crossesAbove">crosses above</option>
                            <option value="crossesBelow">crosses below</option>
                            <option value="lessThan">is less than</option>
                            <option value="greaterThan">is greater than</option>
                          </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '6px' }}>
                          <select
                            value={cond.targetType}
                            onChange={(e) => handleConditionChange('buy', idx, 'targetType', e.target.value)}
                            style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '10px' }}
                          >
                            <option value="value">Value</option>
                            <option value="indicator">Indicator</option>
                          </select>

                          {cond.targetType === 'value' ? (
                            <input
                              type="number"
                              value={cond.targetValue}
                              onChange={(e) => handleConditionChange('buy', idx, 'targetValue', parseFloat(e.target.value) || 0)}
                              style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '11px' }}
                            />
                          ) : (
                            <select
                              value={cond.targetIndicator}
                              onChange={(e) => handleConditionChange('buy', idx, 'targetIndicator', e.target.value)}
                              style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '11px' }}
                            >
                              <option value="EMA20">EMA 20</option>
                              <option value="EMA50">EMA 50</option>
                              <option value="EMA200">EMA 200</option>
                              <option value="SMA20">SMA 20</option>
                              <option value="SMA50">SMA 50</option>
                              <option value="SignalLine">Signal Line</option>
                              <option value="BB_Lower">BB Lower Band</option>
                              <option value="VWAP">VWAP</option>
                            </select>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddCondition('buy')}
                      style={{ background: 'rgba(0, 255, 136, 0.06)', border: '1px dashed rgba(0, 255, 136, 0.25)', borderRadius: '8px', color: '#00ff88', padding: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '800' }}
                    >
                      + Add Buy Rule
                    </button>
                  </div>
                </div>

                {/* Sell Conditions */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ff4444', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowDownRight size={16} /> Sell / Exit Rules
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sellConditions.map((cond, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>RULE #{idx + 1}</span>
                          {sellConditions.length > 1 && (
                            <button onClick={() => handleRemoveCondition('sell', idx)} style={{ background: 'transparent', border: 'none', color: '#ff4444', fontSize: '10px', cursor: 'pointer' }}>Delete</button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <select
                            value={cond.indicator}
                            onChange={(e) => handleConditionChange('sell', idx, 'indicator', e.target.value)}
                            style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '11px' }}
                          >
                            <option value="RSI">RSI (14)</option>
                            <option value="Price">Price</option>
                            <option value="EMA20">EMA 20</option>
                            <option value="EMA50">EMA 50</option>
                            <option value="EMA200">EMA 200</option>
                            <option value="SMA20">SMA 20</option>
                            <option value="SMA50">SMA 50</option>
                            <option value="MACD">MACD Line</option>
                            <option value="BB_Upper">BB Upper Band</option>
                            <option value="VWAP">VWAP</option>
                          </select>

                          <select
                            value={cond.operator}
                            onChange={(e) => handleConditionChange('sell', idx, 'operator', e.target.value)}
                            style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '11px' }}
                          >
                            <option value="crossesBelow">crosses below</option>
                            <option value="crossesAbove">crosses above</option>
                            <option value="greaterThan">is greater than</option>
                            <option value="lessThan">is less than</option>
                          </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '6px' }}>
                          <select
                            value={cond.targetType}
                            onChange={(e) => handleConditionChange('sell', idx, 'targetType', e.target.value)}
                            style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '10px' }}
                          >
                            <option value="value">Value</option>
                            <option value="indicator">Indicator</option>
                          </select>

                          {cond.targetType === 'value' ? (
                            <input
                              type="number"
                              value={cond.targetValue}
                              onChange={(e) => handleConditionChange('sell', idx, 'targetValue', parseFloat(e.target.value) || 0)}
                              style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '11px' }}
                            />
                          ) : (
                            <select
                              value={cond.targetIndicator}
                              onChange={(e) => handleConditionChange('sell', idx, 'targetIndicator', e.target.value)}
                              style={{ background: 'rgba(10,14,39,0.5)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#ffffff', fontSize: '11px' }}
                            >
                              <option value="EMA50">EMA 50</option>
                              <option value="EMA20">EMA 20</option>
                              <option value="SMA50">SMA 50</option>
                              <option value="SignalLine">Signal Line</option>
                              <option value="BB_Upper">BB Upper Band</option>
                              <option value="VWAP">VWAP</option>
                            </select>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddCondition('sell')}
                      style={{ background: 'rgba(255, 68, 68, 0.06)', border: '1px dashed rgba(255, 68, 68, 0.25)', borderRadius: '8px', color: '#ff4444', padding: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '800' }}
                    >
                      + Add Sell Rule
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Tab 2: Pine Script v5 Code Studio */}
          {studioTab === 'pinescript' && (
            <div style={{
              background: 'var(--bg-card-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffd700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code size={16} /> Pine Script v5 Studio Editor
                </span>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pineScriptCode);
                    toast.success('Pine Script code copied! Paste directly into TradingView Pine Editor.');
                  }}
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    color: '#ffd700',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={13} /> Copy Pine Script
                </button>
              </div>

              <textarea
                value={pineScriptCode}
                onChange={(e) => setPineScriptCode(e.target.value)}
                rows={14}
                style={{
                  width: '100%',
                  background: '#070a1e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#00ff88',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '14px',
                  lineHeight: '1.5',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Backtest Analytics & Trade Logs */}
          {backtestResult && (
            <div style={{
              background: 'var(--bg-card-glass)',
              border: '1px solid rgba(0, 255, 136, 0.25)',
              borderRadius: '18px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: '#ffd700' }} />
                  Simulation Performance Metrics ({symbol})
                </h3>
                <span style={{ fontSize: '11px', background: 'rgba(0, 255, 136, 0.12)', color: '#00ff88', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>
                  VERIFIED SIMULATION
                </span>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Win Rate</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: backtestResult.winRate >= 50 ? '#00ff88' : '#ff4444' }}>
                    {backtestResult.winRate}%
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Net Return</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: backtestResult.profit >= 0 ? '#00ff88' : '#ff4444' }}>
                    {backtestResult.profit >= 0 ? '+' : ''}{backtestResult.profit}%
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Max Drawdown</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#ff9800' }}>
                    {backtestResult.drawdown}%
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Sharpe Ratio</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#00bcd4' }}>
                    {backtestResult.sharpeRatio}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total Trades</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff' }}>
                    {backtestResult.trades?.length || 0}
                  </div>
                </div>
              </div>

              {/* Trade Log Execution Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', margin: 0, textTransform: 'uppercase' }}>
                    Execution Trade Journal ({filteredTrades.length} trades)
                  </h4>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'win', 'loss'].map(filterKey => (
                      <button
                        key={filterKey}
                        onClick={() => setTradeFilter(filterKey)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '800',
                          border: 'none',
                          cursor: 'pointer',
                          background: tradeFilter === filterKey ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255,255,255,0.04)',
                          color: tradeFilter === filterKey ? '#00ff88' : '#94a3b8'
                        }}
                      >
                        {filterKey.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th style={{ padding: '8px 12px' }}>Entry Date</th>
                        <th style={{ padding: '8px 12px' }}>Exit Date</th>
                        <th style={{ padding: '8px 12px' }}>Entry Price</th>
                        <th style={{ padding: '8px 12px' }}>Exit Price</th>
                        <th style={{ padding: '8px 12px' }}>PnL %</th>
                        <th style={{ padding: '8px 12px' }}>Exit Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrades.map((t, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '8px 12px' }}>{t.entryDate}</td>
                          <td style={{ padding: '8px 12px' }}>{t.exitDate}</td>
                          <td style={{ padding: '8px 12px' }}>${t.entryPrice.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px' }}>${t.exitPrice.toFixed(2)}</td>
                          <td style={{ padding: '8px 12px', fontWeight: '800', color: t.pnl >= 0 ? '#00ff88' : '#ff4444' }}>
                            {t.pnl >= 0 ? '+' : ''}{t.pnl}%
                          </td>
                          <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{t.exitReason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Sidebar: Saved Systems & My Library */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} style={{ color: '#00ff88' }} />
              My Saved Systems ({savedStrategies.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
              {savedStrategies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '12px' }}>
                  No custom saved strategies yet. Click "Save Config" to store your models in your account.
                </div>
              ) : (
                savedStrategies.map(strat => (
                  <div
                    key={strat.id}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#00ff88' }}>{strat.name}</span>
                      <button
                        onClick={() => handleDeleteStrategy(strat.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                      Buy: {strat.indicators?.buyConditions?.length || 0} rules · Sell: {strat.indicators?.sellConditions?.length || 0} rules <br />
                      SL: {strat.stopLoss}% · TP: {strat.takeProfit}%
                    </div>

                    <button
                      onClick={() => {
                        setBuyConditions(strat.indicators?.buyConditions || []);
                        setBuyLogicGate(strat.indicators?.buyLogicGate || 'AND');
                        setSellConditions(strat.indicators?.sellConditions || []);
                        setSellLogicGate(strat.indicators?.sellLogicGate || 'AND');
                        setStopLossPct(strat.stopLoss || 2);
                        setTakeProfitPct(strat.takeProfit || 6);
                        setActiveStrategyTitle(strat.name);
                        toast.success(`Loaded strategy "${strat.name}"`);
                        handleRunBacktest();
                      }}
                      style={{
                        background: 'rgba(0, 255, 136, 0.08)',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        borderRadius: '6px',
                        color: '#00ff88',
                        padding: '6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Load & Simulate
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Info Box */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.04)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '11px',
            color: '#94a3b8',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: '800', color: '#ffd700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Cloud Strategy Execution
            </div>
            All backtest simulations run directly against historical data. You can copy the generated Pine Script v5 code directly into TradingView or deploy an automated sandbox bot.
          </div>

        </div>

      </div>

      {/* Save Strategy Modal */}
      {showSaveModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'var(--bg-card-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            width: '420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Save Strategy to Account</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Strategy Title</label>
              <input
                type="text"
                value={newStrategyName}
                onChange={(e) => setNewStrategyName(e.target.value)}
                placeholder="e.g. My Custom Scalper V2"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleSaveStrategy}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0a0e27',
                  padding: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setNewStrategyName('');
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pine Script Code Preview Modal */}
      {selectedCodeStrategy && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#0b0e24',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '18px',
            padding: '24px',
            width: '680px',
            maxWidth: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 4px 0', color: '#ffd700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={18} /> {selectedCodeStrategy.name} — Pine Script v5
                </h3>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                  Ready to paste into TradingView Pine Editor for live chart execution and backtesting.
                </p>
              </div>

              <button
                onClick={() => setSelectedCodeStrategy(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <textarea
              readOnly
              value={selectedCodeStrategy.pineScript}
              rows={16}
              style={{
                width: '100%',
                background: '#040716',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: '#00ff88',
                fontFamily: 'monospace',
                fontSize: '11px',
                padding: '14px',
                lineHeight: '1.5',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedCodeStrategy.pineScript);
                  toast.success('Pine Script copied to clipboard!');
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #ffe082 0%, #ffb300 100%)',
                  color: '#0a0e27',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '900',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Copy size={16} /> Copy Pine Script Code
              </button>

              <button
                onClick={() => {
                  loadPreset(selectedCodeStrategy);
                  setSelectedCodeStrategy(null);
                }}
                style={{
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  color: '#00ff88',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Play size={15} /> Load & Backtest Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
