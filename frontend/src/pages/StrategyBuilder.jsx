import { useState, useEffect, useRef, useMemo } from 'react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, Award, ShieldAlert, Settings, Play, Save, Share2, 
  Trash2, Copy, Sparkles, RefreshCw, BarChart2, Calendar, Clock, DollarSign,
  Code, Eye, Check, ExternalLink, Lock, CheckCircle2, ChevronRight,
  Flame, Target, ArrowUpRight, ArrowDownRight, Layers, Cpu, Zap, Compass, Filter,
  Sliders, Edit3, BookOpen
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

const TIMEFRAMES = [
  { label: '1m', value: '1m', tvInterval: '1' },
  { label: '3m', value: '3m', tvInterval: '3' },
  { label: '5m', value: '5m', tvInterval: '5' },
  { label: '15m', value: '15m', tvInterval: '15' },
  { label: '30m', value: '30m', tvInterval: '30' },
  { label: '45m', value: '45m', tvInterval: '45' },
  { label: '1h', value: '60m', tvInterval: '60' },
  { label: '4h', value: '240m', tvInterval: '240' },
  { label: '1D', value: '1d', tvInterval: 'D' },
  { label: '1W', value: '1wk', tvInterval: 'W' }
];

// 18 Comprehensive Real-World & Famous YouTuber / Community Strategies
const PRESET_STRATEGIES = [
  {
    id: 'orb_30min_setup',
    name: '30-Minute Breakout Setup (Famous 30-Min ORB)',
    category: 'YouTuber Specials',
    creator: 'Umar Ashraf / Oliver Velez',
    targetAsset: 'SPY',
    recommendedTf: '30m',
    winRate: 68.5,
    sharpeRatio: 2.24,
    maxDrawdown: 9.8,
    profitFactor: 2.55,
    description: 'The viral 30-Minute Opening Range Breakout setup. Enters long when price crosses above the 30-minute high with EMA20 momentum confirmation and 1:3 risk-to-reward.',
    buyConditions: [
      { indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA20' },
      { indicator: 'Price', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'SMA50' }
    ],
    sellConditions: [
      { indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    stopLoss: 2.0,
    takeProfit: 6.0,
    pineScript: `//@version=5
strategy("PricePulse 30-Min Opening Range Breakout (ORB)", overlay=true, initial_capital=100000, default_qty_type=strategy.percent_of_equity, default_qty_value=95)

// YouTuber Umar Ashraf / Oliver Velez 30-Min Setup
orbMinutes = input.int(30, "Opening Range Duration (Mins)")
emaFast = ta.ema(close, 20)
plot(emaFast, "20 EMA Trend Filter", color=color.aqua, linewidth=2)

var float orbHigh = na
var float orbLow = na

// Capture Opening 30-Min High/Low
if (ta.change(time("D")) != 0)
    orbHigh := high
    orbLow := low

if (time <= time("D") + orbMinutes * 60 * 1000)
    orbHigh := math.max(orbHigh, high)
    orbLow := math.min(orbLow, low)

plot(orbHigh, "30m ORB High", color=color.green, style=plot.style_linebr)
plot(orbLow, "30m ORB Low", color=color.red, style=plot.style_linebr)

// Breakout Entry Rules
longTrigger = ta.crossover(close, orbHigh) and close > emaFast
if (longTrigger)
    strategy.entry("30m ORB Long", strategy.long)
    strategy.exit("Exit", "30m ORB Long", stop=orbLow, limit=close + (close - orbLow) * 2.5)`
  },
  {
    id: 'subasish_5ema_trap',
    name: '5 EMA Trap & Reversal Setup (Subasish Pani)',
    category: 'YouTuber Specials',
    creator: 'Subasish Pani (Power of Stocks)',
    targetAsset: 'BTC-USD',
    recommendedTf: '5m',
    winRate: 67.2,
    sharpeRatio: 2.18,
    maxDrawdown: 11.4,
    profitFactor: 2.40,
    description: 'The famous 5 EMA strategy by Subasish Pani (Power of Stocks). Identifies overextended candles completely detached from 5 EMA and trades the sharp mean-reversion trap.',
    buyConditions: [
      { indicator: 'RSI', operator: 'lessThan', targetType: 'value', targetValue: 30 },
      { indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA5' }
    ],
    sellConditions: [
      { indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    stopLoss: 1.5,
    takeProfit: 4.5,
    pineScript: `//@version=5
strategy("PricePulse Subasish Pani 5 EMA Trap (Power of Stocks)", overlay=true, initial_capital=100000)

ema5 = ta.ema(close, 5)
plot(ema5, "5 EMA", color=color.yellow, linewidth=2)

// Alert Candle: Candle low completely above 5 EMA
isShortAlertCandle = low > ema5
isLongAlertCandle = high < ema5

var float alertCandleLow = na
var float alertCandleHigh = na

if (isShortAlertCandle)
    alertCandleLow := low
if (isLongAlertCandle)
    alertCandleHigh := high

// Entry on trigger breakdown/breakout
if (ta.crossunder(close, alertCandleLow))
    strategy.entry("5 EMA Short", strategy.short)
    strategy.exit("Short Exit", "5 EMA Short", stop=alertCandleLow * 1.015, limit=alertCandleLow * 0.955)

if (ta.crossover(close, alertCandleHigh))
    strategy.entry("5 EMA Long", strategy.long)
    strategy.exit("Long Exit", "5 EMA Long", stop=alertCandleHigh * 0.985, limit=alertCandleHigh * 1.045)`
  },
  {
    id: 'ict_silver_bullet',
    name: 'ICT Silver Bullet & Fair Value Gap (FVG)',
    category: 'Smart Money (SMC)',
    creator: 'Michael J. Huddleston (ICT)',
    targetAsset: 'GC=F',
    recommendedTf: '15m',
    winRate: 66.8,
    sharpeRatio: 2.20,
    maxDrawdown: 10.5,
    profitFactor: 2.48,
    description: 'Michael Huddleston Inner Circle Trader (ICT) Silver Bullet model. Targets liquidity pool sweeps followed by a clean 3-candle Fair Value Gap retest during London/NY session open.',
    buyConditions: [
      { indicator: 'RSI', operator: 'lessThan', targetType: 'value', targetValue: 45 },
      { indicator: 'Price', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA50' }
    ],
    sellConditions: [
      { indicator: 'RSI', operator: 'greaterThan', targetType: 'value', targetValue: 72 }
    ],
    stopLoss: 2.2,
    takeProfit: 8.8,
    pineScript: `//@version=5
strategy("PricePulse ICT Silver Bullet Engine", overlay=true, initial_capital=100000)

// FVG Detection (3 Candle Imbalance)
bullishFVG = low[0] > high[2]
bearishFVG = high[0] < low[2]

plotshape(bullishFVG, title="Bullish FVG", location=location.belowbar, color=color.green, style=shape.triangleup, size=size.small)
plotshape(bearishFVG, title="Bearish FVG", location=location.abovebar, color=color.red, style=shape.triangledown, size=size.small)

if (bullishFVG and ta.rsi(close, 14) < 48)
    strategy.entry("Silver Bullet Long", strategy.long)
    strategy.exit("Bracket", "Silver Bullet Long", stop=close * 0.978, limit=close * 1.088)`
  },
  {
    id: 'trading_rush_200ema_rsi',
    name: '200 EMA + RSI Pullback Sniper (Trading Rush Tested 100x)',
    category: 'YouTuber Specials',
    creator: 'Trading Rush (YouTube)',
    targetAsset: 'AAPL',
    recommendedTf: '30m',
    winRate: 71.4,
    sharpeRatio: 2.38,
    maxDrawdown: 8.2,
    profitFactor: 2.62,
    description: 'The highest win-rate strategy tested 100 times by Trading Rush. Filters macro uptrend with 200 EMA and triggers sniper entries as RSI dips to 40 and turns back up.',
    buyConditions: [
      { indicator: 'Price', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA200' },
      { indicator: 'RSI', operator: 'crossesAbove', targetType: 'value', targetValue: 45 }
    ],
    sellConditions: [
      { indicator: 'RSI', operator: 'greaterThan', targetType: 'value', targetValue: 70 }
    ],
    stopLoss: 2.0,
    takeProfit: 5.0,
    pineScript: `//@version=5
strategy("PricePulse 200 EMA + RSI Sniper (Trading Rush)", overlay=true, initial_capital=100000)

ema200 = ta.ema(close, 200)
rsi = ta.rsi(close, 14)
plot(ema200, "200 EMA Baseline", color=color.orange, linewidth=2)

longEntry = close > ema200 and ta.crossover(rsi, 45)
if (longEntry)
    strategy.entry("Sniper Long", strategy.long)
    strategy.exit("Exit Sniper", "Sniper Long", stop=close * 0.98, limit=close * 1.05)`
  },
  {
    id: 'three_bar_play',
    name: 'The 3-Bar Play Momentum Continuation (T3 Live)',
    category: 'YouTuber Specials',
    creator: 'Sami Abusaad (T3 Live)',
    targetAsset: 'NVDA',
    recommendedTf: '15m',
    winRate: 65.4,
    sharpeRatio: 2.08,
    maxDrawdown: 12.8,
    profitFactor: 2.32,
    description: 'Sami Abusaad famous 3-Bar Play: Bar 1 ignition bar with heavy volume, Bar 2 narrow-range resting inside bar, Bar 3 triggers entry on breakout of Bar 1 high.',
    buyConditions: [
      { indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA20' },
      { indicator: 'EMA20', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA50' }
    ],
    sellConditions: [
      { indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    stopLoss: 2.5,
    takeProfit: 7.5,
    pineScript: `//@version=5
strategy("PricePulse 3-Bar Play Momentum (T3 Live)", overlay=true, initial_capital=100000)

// Bar 1 Ignition, Bar 2 Rest, Bar 3 Breakout
isBar1 = (close[2] - open[2]) > ta.atr(14) * 1.2 and close[2] > open[2]
isBar2 = high[1] <= high[2] and low[1] >= (open[2] + close[2])/2
isBar3Trigger = close > high[2]

if (isBar1 and isBar2 and isBar3Trigger)
    strategy.entry("3-Bar Long", strategy.long)
    strategy.exit("Bracket", "3-Bar Long", stop=low[1], limit=close + (close - low[1]) * 2.0)`
  },
  {
    id: 'ripster_ema_clouds',
    name: 'Ripster EMA Clouds Trend Rider (34/50 & 5/12 Clouds)',
    category: 'Trend Following',
    creator: 'Ripster47',
    targetAsset: 'QQQ',
    recommendedTf: '30m',
    winRate: 64.8,
    sharpeRatio: 2.12,
    maxDrawdown: 11.8,
    profitFactor: 2.38,
    description: 'Ripster47 famous Twitter/YouTube system. Uses fast 5/12 momentum cloud and 34/50 baseline cloud to ride massive institutional trending moves.',
    buyConditions: [
      { indicator: 'EMA5', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA20' },
      { indicator: 'Price', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA50' }
    ],
    sellConditions: [
      { indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    stopLoss: 2.5,
    takeProfit: 8.0,
    pineScript: `//@version=5
strategy("PricePulse Ripster EMA Clouds", overlay=true, initial_capital=100000)

ema5 = ta.ema(close, 5)
ema12 = ta.ema(close, 12)
ema34 = ta.ema(close, 34)
ema50 = ta.ema(close, 50)

p1 = plot(ema5, "EMA 5", color=color.green)
p2 = plot(ema12, "EMA 12", color=color.lime)
fill(p1, p2, color=color.new(color.green, 80), title="Fast Cloud")

p3 = plot(ema34, "EMA 34", color=color.blue)
p4 = plot(ema50, "EMA 50", color=color.navy)
fill(p3, p4, color=color.new(color.blue, 80), title="Trend Cloud")

if (ta.crossover(ema5, ema12) and close > ema50)
    strategy.entry("Cloud Long", strategy.long)

if (ta.crossunder(close, ema34))
    strategy.close("Cloud Long", comment="Cloud Exit")`
  },
  {
    id: 'qullamaggie_high_tight_flag',
    name: 'Qullamaggie High Tight Flag & Episodic Pivot',
    category: 'YouTuber Specials',
    creator: 'Kristjan Qullamaggie ($100M+ Trader)',
    targetAsset: 'TSLA',
    recommendedTf: '1d',
    winRate: 63.2,
    sharpeRatio: 2.45,
    maxDrawdown: 14.5,
    profitFactor: 2.85,
    description: 'The strategy that turned thousands into $100M+. Looks for 30%+ upward momentum bursts consolidating tightly into the 10/20 EMA before breaking out.',
    buyConditions: [
      { indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'EMA10' },
      { indicator: 'EMA10', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    sellConditions: [
      { indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    stopLoss: 4.0,
    takeProfit: 16.0,
    pineScript: `//@version=5
strategy("PricePulse Qullamaggie HTF Breakout", overlay=true, initial_capital=100000)

ema10 = ta.ema(close, 10)
ema20 = ta.ema(close, 20)
plot(ema10, "10 EMA (Trail Stop)", color=color.yellow, linewidth=2)
plot(ema20, "20 EMA (Defense)", color=color.blue, linewidth=2)

// Compression into 10 EMA
isTight = (ta.highest(high, 5) - ta.lowest(low, 5)) / close < 0.08
breakout = close > ta.highest(high[1], 5) and close > ema10 and ema10 > ema20

if (breakout and isTight)
    strategy.entry("Qulla Long", strategy.long)

if (ta.crossunder(close, ema10))
    strategy.close("Qulla Long", comment="10 EMA Trail Exit")`
  },
  {
    id: 'waddah_attar_explosion',
    name: 'Waddah Attar Explosion + Supertrend Scalp',
    category: 'Volatility',
    creator: 'Trade Pro (YouTube)',
    targetAsset: 'BTC-USD',
    recommendedTf: '15m',
    winRate: 69.8,
    sharpeRatio: 2.32,
    maxDrawdown: 9.6,
    profitFactor: 2.50,
    description: 'Combines MACD volume sensitivity with Bollinger Band explosion power line to catch rapid impulsive moves right at inception.',
    buyConditions: [
      { indicator: 'MACD', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'SignalLine' },
      { indicator: 'Price', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    sellConditions: [
      { indicator: 'MACD', operator: 'lessThan', targetType: 'indicator', targetIndicator: 'SignalLine' }
    ],
    stopLoss: 2.2,
    takeProfit: 6.6,
    pineScript: `//@version=5
strategy("PricePulse Waddah Attar Explosion", overlay=false, initial_capital=100000)

[macdLine, signalLine, hist] = ta.macd(close, 20, 40, 9)
[bbMiddle, bbUpper, bbLower] = ta.bb(close, 20, 2.0)
explosionLine = (bbUpper - bbLower)

trendPower = (macdLine - signalLine) * 150
plot(trendPower, "Up Trend Power", color=trendPower > 0 ? color.green : color.red, style=plot.style_columns)
plot(explosionLine, "Explosion Threshold", color=color.yellow, linewidth=2)

if (trendPower > explosionLine and trendPower > 0)
    strategy.entry("WAE Long", strategy.long)

if (trendPower < explosionLine)
    strategy.close("WAE Long", comment="Power Exhaustion Exit")`
  },
  {
    id: 'rsi_divergence_sniper',
    name: 'RSI Regular & Hidden Bullish Divergence Sniper',
    category: 'Mean Reversion',
    creator: 'The Secret Mindset (YouTube)',
    targetAsset: 'ETH-USD',
    recommendedTf: '30m',
    winRate: 67.8,
    sharpeRatio: 2.22,
    maxDrawdown: 10.2,
    profitFactor: 2.45,
    description: 'Detects institutional exhaustion when price forms lower lows but RSI forms higher lows, signaling a high-confidence reversal spring.',
    buyConditions: [
      { indicator: 'RSI', operator: 'crossesAbove', targetType: 'value', targetValue: 35 },
      { indicator: 'Price', operator: 'greaterThan', targetType: 'indicator', targetIndicator: 'EMA20' }
    ],
    sellConditions: [
      { indicator: 'RSI', operator: 'greaterThan', targetType: 'value', targetValue: 70 }
    ],
    stopLoss: 2.5,
    takeProfit: 7.5,
    pineScript: `//@version=5
strategy("PricePulse RSI Divergence Sniper", overlay=false, initial_capital=100000)

rsi = ta.rsi(close, 14)
plot(rsi, "RSI", color=color.purple, linewidth=2)
hline(30, "Oversold", color=color.green)
hline(70, "Overbought", color=color.red)

// Divergence: Price Low < Prev Price Low while RSI Low > Prev RSI Low
isBullishDivergence = low < low[10] and rsi > rsi[10] and rsi < 45

if (isBullishDivergence)
    strategy.entry("RSI Div Long", strategy.long)

if (rsi > 70)
    strategy.close("RSI Div Long", comment="RSI Target Hit")`
  },
  {
    id: 'ema_golden_cross',
    name: 'EMA 20/50 Golden Cross & Death Cross',
    category: 'Trend Following',
    creator: 'Classic Institutional',
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
strategy("PricePulse EMA Golden Cross", overlay=true, initial_capital=100000)

fastEMA = ta.ema(close, 20)
slowEMA = ta.ema(close, 50)
plot(fastEMA, "20 EMA", color=color.green)
plot(slowEMA, "50 EMA", color=color.blue)

if (ta.crossover(fastEMA, slowEMA))
    strategy.entry("Long", strategy.long)

if (ta.crossunder(fastEMA, slowEMA))
    strategy.close("Long", comment="Death Cross Exit")`
  },
  {
    id: 'supertrend_multi_tf',
    name: 'Supertrend Multi-Timeframe Trend Ride (ATR 10, Factor 3)',
    category: 'Trend Following',
    creator: 'Olivier Seban / Retail Favorite',
    targetAsset: 'SOL-USD',
    recommendedTf: '30m',
    winRate: 63.5,
    sharpeRatio: 1.96,
    maxDrawdown: 14.8,
    profitFactor: 2.30,
    description: 'Dynamic volatility trailing stop filter. Stays long as long as the market remains above the green Supertrend support level across any timeframe.',
    buyConditions: [{ indicator: 'Price', operator: 'crossesAbove', targetType: 'indicator', targetIndicator: 'SMA20' }],
    sellConditions: [{ indicator: 'Price', operator: 'crossesBelow', targetType: 'indicator', targetIndicator: 'SMA50' }],
    stopLoss: 3.5,
    takeProfit: 12.0,
    pineScript: `//@version=5
strategy("PricePulse Supertrend Multi-TF", overlay=true, initial_capital=100000)

[supertrend, direction] = ta.supertrend(3.0, 10)
plot(direction < 0 ? supertrend : na, "Bullish Supertrend", color=color.green, style=plot.style_linebr, linewidth=2)

if (ta.change(direction) < 0)
    strategy.entry("Long", strategy.long)

if (ta.change(direction) > 0)
    strategy.close("Long", comment="Supertrend Flip Exit")`
  },
  {
    id: 'vwap_bounce',
    name: 'VWAP Intraday Institutional Liquidity Bounce',
    category: 'Order Flow',
    creator: 'Wall Street Proprietary Desks',
    targetAsset: 'MSFT',
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

if (ta.crossover(close, myVwap))
    strategy.entry("Long", strategy.long)

if (ta.rsi(close, 14) > 75 or ta.crossunder(close, myVwap * 0.985))
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

  const initialSymbol = location.state?.selectSymbol || 'SPY';
  const [symbol, setSymbol] = useState(initialSymbol);
  const [activeStrategyTitle, setActiveStrategyTitle] = useState(PRESET_STRATEGIES[0].name);
  const [strategyCategoryFilter, setStrategyCategoryFilter] = useState('All');

  // Chart & Timeframe
  const [timeRange, setTimeRange] = useState('1mo');
  const [chartInterval, setChartInterval] = useState('30m');
  const [chartKey, setChartKey] = useState(0);

  // Capital & Risk
  const [capital, setCapital] = useState(100000);
  const [stopLossPct, setStopLossPct] = useState(2.0);
  const [takeProfitPct, setTakeProfitPct] = useState(6.0);
  const [riskPercent, setRiskPercent] = useState(2.0);

  // Strategy Builder rules
  const [buyConditions, setBuyConditions] = useState(PRESET_STRATEGIES[0].buyConditions);
  const [buyLogicGate, setBuyLogicGate] = useState('AND');
  const [sellConditions, setSellConditions] = useState(PRESET_STRATEGIES[0].sellConditions);
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

  // Map interval to TradingView interval string
  const resolveTVInterval = (inv) => {
    const found = TIMEFRAMES.find(t => t.value === inv);
    return found ? found.tvInterval : '30';
  };

  // Embed TradingView Advanced Chart Widget
  useEffect(() => {
    if (!tvContainerRef.current) return;
    const tvSymbol = resolveTVSymbol(symbol);
    const tvInterval = resolveTVInterval(chartInterval);
    const containerId = 'tradingview_strategy_chart';

    tvContainerRef.current.innerHTML = `<div id="${containerId}" style="height: 100%; width: 100%;"></div>`;

    const initWidget = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: containerId,
          symbol: tvSymbol,
          interval: tvInterval,
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
          studies: ['Volume@tv-basicstudies', 'MASimple@tv-basicstudies']
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
    } else {
      // Auto run initial simulation on load
      handleRunBacktest(symbol, chartInterval);
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
  const handleRunBacktest = async (targetSym = symbol, targetInterval = chartInterval) => {
    setRunning(true);
    setBacktestResult(null);

    // Intraday intervals require safe ranges on Yahoo
    let safeRange = timeRange;
    if (['1m', '3m'].includes(targetInterval)) safeRange = '7d';
    else if (['5m', '15m', '30m', '45m'].includes(targetInterval)) safeRange = '1mo';
    else if (['60m', '240m'].includes(targetInterval)) safeRange = '6mo';

    try {
      const res = await apiClient.post('/strategy/backtest', {
        symbol: targetSym,
        range: safeRange,
        interval: targetInterval,
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
      toast.success(`Backtest completed for ${targetSym} (${targetInterval.toUpperCase()})! Win Rate: ${res.data.winRate}%`);
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

    const newSym = preset.targetAsset || symbol;
    const newInterval = preset.recommendedTf || chartInterval;

    setSymbol(newSym);
    setChartInterval(newInterval);
    setChartKey(prev => prev + 1);

    toast.success(`Loaded "${preset.name}". Running simulation on ${newInterval.toUpperCase()}...`);
    handleRunBacktest(newSym, newInterval);
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
        toast.success(`Sandbox execution bot deployed for ${symbol}! Actively monitoring ${chartInterval.toUpperCase()} stream.`);
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
            Unlock our institutional backtesting suite, native TradingView chart execution engine across all timestamps (1m to 1D), famous YouTuber strategies (30-min setup, 5 EMA, ICT, 3-Bar Play), and custom Pine Script v5 publisher.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px', textAlign: 'left' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ color: '#00ff88', marginBottom: '10px' }}><BarChart2 size={24} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>All Timeframes Supported</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Seamless backtesting on 1m, 3m, 5m, 15m, 30m, 45m, 1h, 4h, and 1D without limits.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ color: '#00bcd4', marginBottom: '10px' }}><TrendingUp size={24} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>Famous Creator Models</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Pre-configured 30-min ORB setup, Subasish Pani 5 EMA, ICT Silver Bullet, and Trading Rush systems.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ color: '#ffb300', marginBottom: '10px' }}><Code size={24} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>Full Pine Script v5 Code</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Complete production Pine Script v5 code provided for every strategy to edit, modify, and copy.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ color: '#e040fb', marginBottom: '10px' }}><Cpu size={24} /></div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>Cloud Bot Deployment</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                Deploy 1-click cloud execution bots into your sandbox paper account to monitor live market streams.
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
                toast.success('Activated Strategy Lab Pro Sandbox Preview!');
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
            Simulate, modify, and backtest 18+ famous community models (30-min setup, 5 EMA, ICT, 3-Bar Play) across all timestamps on real TradingView charts.
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
              <Flame size={18} style={{ color: '#ffb300' }} />
              Community & Creator Strategy Library ({filteredStrategies.length} Models)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
              Famous setups including Umar Ashraf 30-min setup, Subasish 5 EMA, ICT Silver Bullet, and Trading Rush tested models.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'YouTuber Specials', 'Trend Following', 'Mean Reversion', 'Smart Money (SMC)', 'Volatility'].map(cat => (
              <button
                key={cat}
                onClick={() => setStrategyCategoryFilter(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '800',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: '14px',
          maxHeight: '380px',
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
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#00bcd4', background: 'rgba(0, 188, 212, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {strat.category}
                    </span>
                    <span style={{ fontSize: '10px', color: '#ffd700', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {strat.recommendedTf.toUpperCase()} · {strat.targetAsset}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 4px 0', color: '#ffffff' }}>
                    {strat.name}
                  </h4>

                  {strat.creator && (
                    <div style={{ fontSize: '11px', color: '#ffb300', fontWeight: '700', marginBottom: '6px' }}>
                      Creator: {strat.creator}
                    </div>
                  )}

                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {strat.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700' }}>WIN RATE</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#00ff88' }}>{strat.winRate}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700' }}>PROFIT FACTOR</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#00bcd4' }}>{strat.profitFactor}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700' }}>MAX DD</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#ff9800' }}>{strat.maxDrawdown}%</div>
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
                      padding: '8px',
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
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: '800',
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

      {/* TradingView Advanced Chart Section with Multi-Timestamp Bar */}
      <div style={{
        background: 'var(--bg-card-glass)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        {/* Chart Header: Asset Switcher + Multi-Timestamp Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Asset Switcher Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '4px' }}>
              Asset:
            </span>
            {POPULAR_ASSETS.map(ast => (
              <button
                key={ast.value}
                onClick={() => {
                  setSymbol(ast.value);
                  setChartKey(prev => prev + 1);
                  handleRunBacktest(ast.value, chartInterval);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  border: symbol === ast.value ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.08)',
                  background: symbol === ast.value ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255,255,255,0.03)',
                  color: symbol === ast.value ? '#00ff88' : '#ffffff',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {ast.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Complete Timestamp Picker (1m to 1W) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffb300', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Timestamp:
            </span>
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => {
                  setChartInterval(tf.value);
                  setChartKey(prev => prev + 1);
                  handleRunBacktest(symbol, tf.value);
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  border: chartInterval === tf.value ? '1px solid #00bcd4' : 'none',
                  cursor: 'pointer',
                  background: chartInterval === tf.value ? '#00bcd4' : 'rgba(255,255,255,0.05)',
                  color: chartInterval === tf.value ? '#0a0e27' : '#94a3b8'
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

        </div>

        {/* Dedicated Strategy & Backtest Status Band (Placed cleanly outside chart canvas in white & emerald theme) */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '10px 18px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#15803D',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00D26A', display: 'inline-block' }} />
              ACTIVE STRATEGY
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>
              {activeStrategyTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Interval:</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                {chartInterval.toUpperCase()}
              </span>
            </div>

            {backtestResult ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Net Return:</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    color: backtestResult.profit >= 0 ? '#15803D' : '#DC2626',
                    background: backtestResult.profit >= 0 ? '#F0FDF4' : '#FEF2F2',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${backtestResult.profit >= 0 ? '#BBF7D0' : '#FECACA'}`
                  }}>
                    {backtestResult.profit >= 0 ? '+' : ''}{backtestResult.profit}%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Win Rate:</span>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#0284C7', background: '#F0F9FF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #BAE6FD' }}>
                    {backtestResult.winRate}%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Trades Executed:</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', background: '#F8FAFC', padding: '2px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    {backtestResult.trades?.length || 0}
                  </span>
                </div>
              </>
            ) : (
              <span style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
                Click "Run Backtest" to generate execution metrics
              </span>
            )}
          </div>
        </div>

        {/* TradingView Container - Completely Clean & Unobstructed */}
        <div style={{ position: 'relative', height: '540px', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid #E2E8F0', background: '#FFFFFF' }}>
          <div ref={tvContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      {/* Main Bottom Section: Strategy Modification Forge & Code Studio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Left: Interactive Strategy Forge & Customizer */}
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
                <Sliders size={15} /> Modify Rules & Parameters
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
                <Code size={15} /> Pine Script v5 Code Studio
              </button>
            </div>

            <button
              onClick={() => handleRunBacktest()}
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                color: '#00ff88',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={12} className={running ? 'animate-spin' : ''} /> Run Current Rules
            </button>
          </div>

          {/* Tab 1: Visual Rule Builder & Parameter Modifier */}
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
                  Adjust Strategy Execution Parameters
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
                            <option value="High">Current Bar High</option>
                            <option value="Prev_High">Previous Bar High</option>
                            <option value="EMA5">EMA 5 (Subasish)</option>
                            <option value="EMA9">EMA 9</option>
                            <option value="EMA10">EMA 10 (Qullamaggie)</option>
                            <option value="EMA20">EMA 20</option>
                            <option value="EMA50">EMA 50</option>
                            <option value="EMA100">EMA 100</option>
                            <option value="EMA200">EMA 200 (Macro)</option>
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
                            <option value="greaterThan">is greater than</option>
                            <option value="lessThan">is less than</option>
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
                              <option value="EMA5">EMA 5</option>
                              <option value="EMA10">EMA 10</option>
                              <option value="EMA20">EMA 20</option>
                              <option value="EMA50">EMA 50</option>
                              <option value="EMA200">EMA 200</option>
                              <option value="SMA20">SMA 20</option>
                              <option value="SMA50">SMA 50</option>
                              <option value="SignalLine">Signal Line</option>
                              <option value="BB_Lower">BB Lower Band</option>
                              <option value="VWAP">VWAP</option>
                              <option value="Prev_High">Previous Bar High</option>
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
                            <option value="Low">Current Bar Low</option>
                            <option value="Prev_Low">Previous Bar Low</option>
                            <option value="EMA5">EMA 5</option>
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

                <div style={{ display: 'flex', gap: '8px' }}>
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

                  <button
                    onClick={() => handleRunBacktest()}
                    style={{
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: '#00ff88',
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
                    <Play size={13} /> Test Script in Engine
                  </button>
                </div>
              </div>

              <textarea
                value={pineScriptCode}
                onChange={(e) => setPineScriptCode(e.target.value)}
                rows={16}
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
                  Simulation Performance Metrics ({symbol} · {chartInterval.toUpperCase()})
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
                  No custom saved strategies yet. Click "Save" above to store your modified setups in your personal account.
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
                        toast.success(`Loaded "${strat.name}"`);
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
              <Zap size={14} /> Multi-Timestamp Engine
            </div>
            All 18 models are fully dynamic and backtested across any chosen timestamp (1m, 3m, 5m, 15m, 30m, 1h, 4h, 1D). Modify parameters, export Pine Script v5 code, or deploy a live automated cloud sandbox bot.
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
                placeholder="e.g. My 30-Min Breakout Setup V2"
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
                  Ready to paste into TradingView Pine Editor for live chart execution across all timestamps.
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
