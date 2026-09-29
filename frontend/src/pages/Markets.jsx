import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, Activity, BarChart2, TrendingUp, Play, Maximize2, Minimize2,
  Calendar, Zap, Building2, ExternalLink, ArrowUpRight, ArrowDownRight,
  Filter, ChevronRight, FileText, CheckCircle2, AlertTriangle, RefreshCw,
  Clock, ShieldAlert, Sparkles, Layers
} from 'lucide-react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { apiClient } from '../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Symbol categories with popular options
const SYMBOL_CATEGORIES = {
  'Crypto': [
    { label: 'Bitcoin',    value: 'BINANCE:BTCUSDT' },
    { label: 'Ethereum',   value: 'BINANCE:ETHUSDT' },
    { label: 'BNB',        value: 'BINANCE:BNBUSDT' },
    { label: 'Solana',     value: 'BINANCE:SOLUSDT' },
    { label: 'XRP',        value: 'BINANCE:XRPUSDT' },
    { label: 'DOGE',       value: 'BINANCE:DOGEUSDT' },
    { label: 'Cardano',    value: 'BINANCE:ADAUSDT' },
    { label: 'Avalanche',  value: 'BINANCE:AVAXUSDT' },
    { label: 'Polygon',    value: 'BINANCE:MATICUSDT' },
    { label: 'Chainlink',  value: 'BINANCE:LINKUSDT' },
  ],
  'US Stocks': [
    { label: 'Apple',      value: 'NASDAQ:AAPL' },
    { label: 'Microsoft',  value: 'NASDAQ:MSFT' },
    { label: 'Tesla',      value: 'NASDAQ:TSLA' },
    { label: 'NVIDIA',     value: 'NASDAQ:NVDA' },
    { label: 'Google',     value: 'NASDAQ:GOOGL' },
    { label: 'Amazon',     value: 'NASDAQ:AMZN' },
    { label: 'Meta',       value: 'NASDAQ:META' },
    { label: 'Netflix',    value: 'NASDAQ:NFLX' },
    { label: 'AMD',        value: 'NASDAQ:AMD' },
    { label: 'Palantir',   value: 'NASDAQ:PLTR' },
  ],
  'Global Indices': [
    { label: 'S&P 500',    value: 'FOREXCOM:SPXUSD' },
    { label: 'NASDAQ 100', value: 'FOREXCOM:NAS100USD' },
    { label: 'Dow Jones',  value: 'FOREXCOM:DJI' },
    { label: 'FTSE 100',   value: 'INDEX:FTSE' },
    { label: 'DAX 40',     value: 'XETR:DAX' },
    { label: 'Nikkei 225', value: 'TVC:NI225' },
    { label: 'Hang Seng',  value: 'HSI:HSI' },
  ],
  'Forex': [
    { label: 'EUR/USD',  value: 'FX:EURUSD' },
    { label: 'GBP/USD',  value: 'FX:GBPUSD' },
    { label: 'USD/JPY',  value: 'FX:USDJPY' },
    { label: 'AUD/USD',  value: 'FX:AUDUSD' },
    { label: 'USD/CAD',  value: 'FX:USDCAD' },
    { label: 'USD/CHF',  value: 'FX:USDCHF' },
  ],
  'Commodities': [
    { label: 'Gold',       value: 'TVC:GOLD' },
    { label: 'Silver',     value: 'TVC:SILVER' },
    { label: 'Crude Oil',  value: 'TVC:USOIL' },
    { label: 'Brent',      value: 'TVC:UKOIL' },
    { label: 'Natural Gas',value: 'TVC:NATURALGAS' },
    { label: 'Copper',     value: 'TVC:COPPER' },
  ],
};

const INTERVALS = [
  { label: '1m',  value: '1' },
  { label: '5m',  value: '5' },
  { label: '15m', value: '15' },
  { label: '1H',  value: '60' },
  { label: '4H',  value: '240' },
  { label: '1D',  value: 'D' },
  { label: '1W',  value: 'W' },
  { label: '1M',  value: 'M' },
];

const ALL_SYMBOLS = Object.values(SYMBOL_CATEGORIES).flat();

// Heuristic indicator computation helpers for lightweight-charts
const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push({ time: data[i].time });
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push({ time: data[i].time, value: sum / period });
    }
  }
  return sma;
};

const calculateEMA = (data, period) => {
  const ema = [];
  if (data.length === 0) return ema;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < Math.min(period, data.length); i++) {
    sum += data[i].close;
  }
  let prevEma = sum / Math.min(period, data.length);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push({ time: data[i].time });
    } else if (i === period - 1) {
      ema.push({ time: data[i].time, value: prevEma });
    } else {
      const val = data[i].close * k + prevEma * (1 - k);
      ema.push({ time: data[i].time, value: val });
      prevEma = val;
    }
  }
  return ema;
};

const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
  const upper = [];
  const lower = [];
  const middle = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push({ time: data[i].time });
      lower.push({ time: data[i].time });
      middle.push({ time: data[i].time });
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      const mean = sum / period;
      middle.push({ time: data[i].time, value: mean });

      let varianceSum = 0;
      for (let j = 0; j < period; j++) {
        varianceSum += Math.pow(data[i - j].close - mean, 2);
      }
      const sd = Math.sqrt(varianceSum / period);
      upper.push({ time: data[i].time, value: mean + multiplier * sd });
      lower.push({ time: data[i].time, value: mean - multiplier * sd });
    }
  }
  return { upper, lower, middle };
};

const calculateVWAP = (data) => {
  const vwap = [];
  let cumPV = 0;
  let cumV = 0;
  let lastDateStr = '';

  for (let i = 0; i < data.length; i++) {
    const bar = data[i];
    const barDate = new Date(bar.time * 1000);
    const dateStr = barDate.toDateString();
    if (lastDateStr && dateStr !== lastDateStr) {
      cumPV = 0;
      cumV = 0;
    }
    lastDateStr = dateStr;

    const p = (bar.open + bar.high + bar.low + bar.close) / 4;
    const v = bar.volume || 1;
    cumPV += p * v;
    cumV += v;
    vwap.push({ time: bar.time, value: cumPV / cumV });
  }
  return vwap;
};

const calculateRSISignals = (data) => {
  const rsi = [];
  const period = 14;
  if (data.length <= period) return [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * 13 + gain) / 14;
    avgLoss = (avgLoss * 13 + loss) / 14;

    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  const markers = [];
  for (let i = period + 1; i < data.length; i++) {
    const prev = rsi[i - 1];
    const curr = rsi[i];
    if (prev >= 30 && curr < 30) {
      markers.push({
        time: data[i].time,
        position: 'belowBar',
        color: '#00ff88',
        shape: 'arrowUp',
        text: 'RSI BUY'
      });
    } else if (prev <= 70 && curr > 70) {
      markers.push({
        time: data[i].time,
        position: 'aboveBar',
        color: '#ff4444',
        shape: 'arrowDown',
        text: 'RSI SELL'
      });
    }
  }
  return markers;
};

const calculateMACDSignals = (data) => {
  if (data.length < 26) return [];
  const prices = data.map(d => d.close);
  
  const computeEMAVal = (pricesList, period) => {
    const ema = [];
    const k = 2 / (period + 1);
    let sum = 0;
    for (let i = 0; i < Math.min(period, pricesList.length); i++) sum += pricesList[i];
    let prev = sum / Math.min(period, pricesList.length);
    for (let i = 0; i < pricesList.length; i++) {
      if (i < period - 1) ema.push(null);
      else if (i === period - 1) ema.push(prev);
      else {
        const val = pricesList[i] * k + prev * (1 - k);
        ema.push(val);
        prev = val;
      }
    }
    return ema;
  };

  const ema12 = computeEMAVal(prices, 12);
  const ema26 = computeEMAVal(prices, 26);
  const macdLine = [];
  for (let i = 0; i < prices.length; i++) {
    if (ema12[i] === null || ema26[i] === null) macdLine.push(null);
    else macdLine.push(ema12[i] - ema26[i]);
  }

  const validIndex = macdLine.findIndex(x => x !== null);
  const validMacd = macdLine.slice(validIndex);
  const signalEMA = computeEMAVal(validMacd, 9);
  const signalLine = new Array(validIndex).fill(null).concat(signalEMA);

  const markers = [];
  for (let i = validIndex + 1; i < data.length; i++) {
    const prevM = macdLine[i - 1];
    const prevS = signalLine[i - 1];
    const currM = macdLine[i];
    const currS = signalLine[i];

    if (prevM !== null && prevS !== null && currM !== null && currS !== null) {
      if (prevM <= prevS && currM > currS) {
        markers.push({
          time: data[i].time,
          position: 'belowBar',
          color: '#00ff88',
          shape: 'arrowUp',
          text: 'MACD BUY'
        });
      } else if (prevM >= prevS && currM < currS) {
        markers.push({
          time: data[i].time,
          position: 'aboveBar',
          color: '#ff4444',
          shape: 'arrowDown',
          text: 'MACD SELL'
        });
      }
    }
  }
  return markers;
};

const chartCalculateStochRSI = (data, period = 14) => {
  if (data.length <= period * 2) return [];
  const rsiValues = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsiValues[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * 13 + gain) / 14;
    avgLoss = (avgLoss * 13 + loss) / 14;
    rsiValues[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  const stochRsi = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period * 2 - 1) {
      stochRsi.push(null);
    } else {
      let minRsi = 100;
      let maxRsi = 0;
      for (let j = 0; j < period; j++) {
        const val = rsiValues[i - j];
        if (val < minRsi) minRsi = val;
        if (val > maxRsi) maxRsi = val;
      }
      const denom = maxRsi - minRsi;
      const val = denom === 0 ? 0.5 : (rsiValues[i] - minRsi) / denom;
      stochRsi.push(val * 100);
    }
  }

  const markers = [];
  for (let i = period * 2; i < data.length; i++) {
    const prev = stochRsi[i - 1];
    const curr = stochRsi[i];
    if (prev !== null && curr !== null) {
      if (prev <= 20 && curr > 20) {
        markers.push({
          time: data[i].time,
          position: 'belowBar',
          color: '#00e676',
          shape: 'arrowUp',
          text: 'STOCH RSI BUY'
        });
      } else if (prev >= 80 && curr < 80) {
        markers.push({
          time: data[i].time,
          position: 'aboveBar',
          color: '#ff1744',
          shape: 'arrowDown',
          text: 'STOCH RSI SELL'
        });
      }
    }
  }
  return markers;
};

const chartCalculateIchimoku = (data) => {
  const tenkan = [];
  const kijun = [];
  const markers = [];

  for (let i = 0; i < data.length; i++) {
    if (i < 8) {
      tenkan.push({ time: data[i].time });
    } else {
      let highestHigh = data[i].high;
      let lowestLow = data[i].low;
      for (let j = 1; j < 9; j++) {
        if (data[i - j].high > highestHigh) highestHigh = data[i - j].high;
        if (data[i - j].low < lowestLow) lowestLow = data[i - j].low;
      }
      tenkan.push({ time: data[i].time, value: (highestHigh + lowestLow) / 2 });
    }

    if (i < 25) {
      kijun.push({ time: data[i].time });
    } else {
      let highestHigh = data[i].high;
      let lowestLow = data[i].low;
      for (let j = 1; j < 26; j++) {
        if (data[i - j].high > highestHigh) highestHigh = data[i - j].high;
        if (data[i - j].low < lowestLow) lowestLow = data[i - j].low;
      }
      kijun.push({ time: data[i].time, value: (highestHigh + lowestLow) / 2 });
    }
  }

  for (let i = 26; i < data.length; i++) {
    const prevT = tenkan[i - 1].value;
    const prevK = kijun[i - 1].value;
    const currT = tenkan[i].value;
    const currK = kijun[i].value;

    if (prevT && prevK && currT && currK) {
      if (prevT <= prevK && currT > currK) {
        markers.push({
          time: data[i].time,
          position: 'belowBar',
          color: '#00e5ff',
          shape: 'arrowUp',
          text: 'ICHIMOKU BUY'
        });
      } else if (prevT >= prevK && currT < currK) {
        markers.push({
          time: data[i].time,
          position: 'aboveBar',
          color: '#d500f9',
          shape: 'arrowDown',
          text: 'ICHIMOKU SELL'
        });
      }
    }
  }

  return { tenkan, kijun, markers };
};

const chartCalculatePivotPoints = (data) => {
  const pData = [];
  const r1Data = [];
  const s1Data = [];
  const r2Data = [];
  const s2Data = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      pData.push({ time: data[i].time });
      r1Data.push({ time: data[i].time });
      s1Data.push({ time: data[i].time });
      r2Data.push({ time: data[i].time });
      s2Data.push({ time: data[i].time });
    } else {
      const prev = data[i - 1];
      const p = (prev.high + prev.low + prev.close) / 3;
      const r1 = 2 * p - prev.low;
      const s1 = 2 * p - prev.high;
      const r2 = p + (prev.high - prev.low);
      const s2 = p - (prev.high - prev.low);

      pData.push({ time: data[i].time, value: p });
      r1Data.push({ time: data[i].time, value: r1 });
      s1Data.push({ time: data[i].time, value: s1 });
      r2Data.push({ time: data[i].time, value: r2 });
      s2Data.push({ time: data[i].time, value: s2 });
    }
  }

  return { pData, r1Data, s1Data, r2Data, s2Data };
};

const chartCalculateSAR = (data, step = 0.02, maxStep = 0.20) => {
  const sar = [];
  if (data.length === 0) return { sar, markers: [] };

  const markers = [];
  let isBullish = true;
  let ep = data[0].high;
  let af = step;
  let prevSar = data[0].low;

  sar.push({ time: data[0].time, value: prevSar });

  for (let i = 1; i < data.length; i++) {
    const bar = data[i];
    let currentSar = prevSar + af * (ep - prevSar);

    if (isBullish) {
      if (bar.low < currentSar) {
        isBullish = false;
        currentSar = ep;
        ep = bar.low;
        af = step;
        markers.push({
          time: bar.time,
          position: 'aboveBar',
          color: '#ff4444',
          shape: 'arrowDown',
          text: 'SAR SELL'
        });
      } else {
        if (bar.high > ep) {
          ep = bar.high;
          af = Math.min(af + step, maxStep);
        }
        const minPastTwo = Math.min(data[i].low, data[i - 1].low);
        if (currentSar > minPastTwo) currentSar = minPastTwo;
      }
    } else {
      if (bar.high > currentSar) {
        isBullish = true;
        currentSar = ep;
        ep = bar.high;
        af = step;
        markers.push({
          time: bar.time,
          position: 'belowBar',
          color: '#00ff88',
          shape: 'arrowUp',
          text: 'SAR BUY'
        });
      } else {
        if (bar.low < ep) {
          ep = bar.low;
          af = Math.min(af + step, maxStep);
        }
        const maxPastTwo = Math.max(data[i].high, data[i - 1].high);
        if (currentSar < maxPastTwo) currentSar = maxPastTwo;
      }
    }

    sar.push({ time: bar.time, value: currentSar });
    prevSar = currentSar;
  }

  return { sar, markers };
};

export default function Markets() {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isPro = user?.is_pro || false;
  const [activeIndicators, setActiveIndicators] = useState({
    sma20: false,
    ema50: false,
    rsi: false,
    macd: false,
    bollinger: false,
    stochRsi: false,
    ichimoku: false,
    pivotPoints: false,
    vwap: false,
    sar: false
  });
  const initialSymbol = location.state?.selectSymbol || 'BINANCE:BTCUSDT';
  const initialCategory = (initialSymbol.endsWith('-USD') || initialSymbol.includes('USDT') || initialSymbol.includes('BINANCE:')) 
    ? 'Crypto' 
    : (initialSymbol.endsWith('=F') || initialSymbol.startsWith('TVC:'))
    ? 'Commodities'
    : (initialSymbol.startsWith('NASDAQ:') || initialSymbol.startsWith('SP:'))
    ? 'US Stocks'
    : (initialSymbol.startsWith('FX:') || initialSymbol.includes('USD'))
    ? 'Forex'
    : 'Global Indices';

  const resolveYahooSymbol = useCallback((sym) => {
    if (!sym) return '';
    const s = sym.toUpperCase();
    const mappings = {
      'TVC:GOLD': 'GC=F',
      'GOLD': 'GC=F',
      'TVC:SILVER': 'SI=F',
      'SILVER': 'SI=F',
      'TVC:USOIL': 'CL=F',
      'USOIL': 'CL=F',
      'TVC:UKOIL': 'BZ=F',
      'UKOIL': 'BZ=F',
      'TVC:NATURALGAS': 'NG=F',
      'NATURALGAS': 'NG=F',
      'TVC:COPPER': 'HG=F',
      'COPPER': 'HG=F'
    };
    if (mappings[s]) return mappings[s];
    return s.includes(':') ? s.split(':')[1] : s;
  }, []);

  const [symbol, setSymbol] = useState(initialSymbol);
  const [interval, setInterval] = useState('D');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchRef = useRef();
  // Inline chart search
  const [chartSearchQuery, setChartSearchQuery] = useState('');
  const [showChartSearch, setShowChartSearch] = useState(false);
  const chartSearchRef = useRef();
  // News expand state
  const [expandedNews, setExpandedNews] = useState(null);
  const [liveNews, setLiveNews] = useState([]);
  const [liveNewsLoading, setLiveNewsLoading] = useState(false);
  const [newsTimestamps] = useState(() => [Date.now() - 15*60*1000, Date.now() - 65*60*1000, Date.now() - 3*60*60*1000, Date.now() - 30*60*1000, Date.now() - 2*60*60*1000, Date.now() - 45*60*1000]);

  // Fetch live market intelligence news and update periodically
  useEffect(() => {
    let isMounted = true;
    const fetchMarketNews = async () => {
      try {
        setLiveNewsLoading(true);
        const res = await apiClient.get('/market/news');
        if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setLiveNews(res.data.slice(0, 8));
        }
      } catch (err) {
        console.warn('Live news fetch fallback:', err);
      } finally {
        if (isMounted) setLiveNewsLoading(false);
      }
    };
    fetchMarketNews();
    const timer = setInterval(fetchMarketNews, 60000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const selectedMarket = 'International';

  const allowedCategories = Object.keys(SYMBOL_CATEGORIES);

  const isSymbolIndian = (s) => {
    return s.value.startsWith('NSE:') || s.value.startsWith('BSE:') || s.value.endsWith('.NS') || s.value.endsWith('.BO');
  };

  useEffect(() => {
    if (!allowedCategories.includes(activeCategory) && allowedCategories.length > 0) {
      setActiveCategory(allowedCategories[0]);
    }
  }, [activeCategory]);

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const [activeTab, setActiveTab] = useState('tradingview');

  useEffect(() => {
    if (location.state && location.state.selectSymbol) {
      const selected = location.state.selectSymbol;
      setSymbol(selected);
      
      const isCrypto = selected.endsWith('-USD') || selected.includes('USDT') || selected.includes('BINANCE:');
      const isCommodity = selected.endsWith('=F') || selected.startsWith('TVC:');
      if (isCrypto) {
        setActiveCategory('Crypto');
      } else if (isCommodity) {
        setActiveCategory('Commodities');
      } else if (selected.startsWith('FX:') || selected.includes('USD')) {
        setActiveCategory('Forex');
      } else if (selected.startsWith('NASDAQ:') || selected.startsWith('SP:')) {
        setActiveCategory('US Stocks');
      } else {
        setActiveCategory('Global Indices');
      }
    }
  }, [location.state]);

  const tvContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);
  const isTvReadyRef = useRef(false);
  const prevTvSymbolRef = useRef(null);
  const prevTvIntervalRef = useRef(null);
  const customChartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const lastSymbolRef = useRef(symbol);

  const [customHistory, setCustomHistory] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');
  const [liveInfo, setLiveInfo] = useState(null);

  // ─── Impactful Market Announcements & Corporate Events State ───
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const [announcementsHasMore, setAnnouncementsHasMore] = useState(true);
  const [announcementsCounts, setAnnouncementsCounts] = useState({ total: 0, today: 0, yesterday: 0, positive: 0, negative: 0 });
  const [announcementsDayFilter, setAnnouncementsDayFilter] = useState('all'); // 'all' | 'today' | 'yesterday'
  const [announcementsTypeFilter, setAnnouncementsTypeFilter] = useState('all'); // 'all' | 'contract' | 'regulatory' | 'macro' | 'results'
  const [announcementsImpactFilter, setAnnouncementsImpactFilter] = useState('all'); // 'all' | 'positive' | 'negative' | 'high_impact'
  const [announcementsSearch, setAnnouncementsSearch] = useState('');
  const [loadingMoreAnnouncements, setLoadingMoreAnnouncements] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

  const fetchAnnouncements = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setAnnouncementsLoading(true);
      else setLoadingMoreAnnouncements(true);

      const res = await apiClient.get('/market/announcements', {
        params: {
          day: announcementsDayFilter,
          type: announcementsTypeFilter,
          impact: announcementsImpactFilter,
          search: announcementsSearch,
          page,
          limit: 16
        }
      });

      if (res.data && res.data.items) {
        if (append) {
          setAnnouncements(prev => [...prev, ...res.data.items]);
        } else {
          setAnnouncements(res.data.items);
        }
        setAnnouncementsHasMore(res.data.hasMore);
        setAnnouncementsPage(res.data.page);
        if (res.data.counts) {
          setAnnouncementsCounts(res.data.counts);
        }
      }
    } catch (err) {
      console.warn('Failed to load announcements feed:', err);
    } finally {
      setAnnouncementsLoading(false);
      setLoadingMoreAnnouncements(false);
    }
  }, [announcementsDayFilter, announcementsTypeFilter, announcementsImpactFilter, announcementsSearch]);

  useEffect(() => {
    fetchAnnouncements(1, false);
  }, [fetchAnnouncements]);

  const handleLoadMoreAnnouncements = () => {
    if (!loadingMoreAnnouncements && announcementsHasMore) {
      fetchAnnouncements(announcementsPage + 1, true);
    }
  };

  const filteredSymbols = searchQuery.length > 0
    ? ALL_SYMBOLS.filter(s => {
        const matchesQuery = s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.value.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery && !isSymbolIndian(s);
      })
    : SYMBOL_CATEGORIES[activeCategory] || [];

  const selectSymbol = useCallback((val) => {
    setSymbol(val);
    setShowSearch(false);
    setSearchQuery('');
  }, []);

  const displayLabel = ALL_SYMBOLS.find(s => s.value === symbol)?.label || symbol;

  const isIndianStock = false;

  // Automatically switch tab when a new symbol is selected
  useEffect(() => {
    if (symbol !== lastSymbolRef.current) {
      setActiveTab('tradingview');
      lastSymbolRef.current = symbol;
    }
  }, [symbol]);

  // Inject spinner styles
  useEffect(() => {
    const styleId = 'nonstock-spinner-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Smart TV symbol resolver
  const resolveTVSymbol = (rawSymbol) => {
    const s = rawSymbol.toUpperCase();
    
    // S&P 500 & Index override (free Forex.com and index mapping with zero licensing errors)
    if (s === 'SP:SPX' || s === 'SPX' || s === 'INDEX:SPX' || s === 'S&P 500' || s === 'S&P500' || s === '^GSPC') {
      return 'FOREXCOM:SPXUSD';
    }
    if (s === 'NASDAQ:NDX' || s === 'NDX' || s === 'NASDAQ 100' || s === '^NDX') {
      return 'FOREXCOM:NAS100USD';
    }
    if (s === 'DJ:DJI' || s === 'DJI' || s === 'DOW' || s === 'DOW JONES' || s === '^DJI') {
      return 'FOREXCOM:DJI';
    }
    
    // 1. If it already has an exchange prefix
    if (s.includes(':')) {
      return s;
    }

    // 2. Cryptocurrencies (e.g., BTC, BITCOIN, BTC-USD, ETH-USD)
    const isCrypto = s.includes('-USD') || s.includes('-USDT') || s.endsWith('USD') || s.endsWith('USDT') || ['BTC', 'BITCOIN', 'ETH', 'ETHEREUM', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'TRX', 'SHIB', 'AVAX', 'DOT', 'LINK', 'MATIC'].includes(s);
    if (isCrypto) {
      let baseSymbol = s.replace('-USD', '').replace('-USDT', '').replace('USD', '').replace('USDT', '');
      if (baseSymbol === 'BITCOIN') baseSymbol = 'BTC';
      if (baseSymbol === 'ETHEREUM') baseSymbol = 'ETH';
      return `BINANCE:${baseSymbol}USDT`;
    }

    // 3. Forex Pairs (e.g., EURUSD=X or EURUSD)
    if (s.endsWith('=X')) {
      const cleanForex = s.replace('=X', '');
      return `FX:${cleanForex}`;
    }
    if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF'].includes(s)) {
      return `FX:${s}`;
    }

    // 4. Commodity Futures (e.g., GC=F, CL=F, SI=F)
    if (s.endsWith('=F')) {
      const mappings = {
        'GC=F': 'TVC:GOLD',
        'SI=F': 'TVC:SILVER',
        'CL=F': 'TVC:USOIL',
        'BZ=F': 'TVC:UKOIL',
        'NG=F': 'TVC:NATURALGAS',
        'HG=F': 'TVC:COPPER'
      };
      return mappings[s] || s;
    }
    if (s === 'GOLD') return 'TVC:GOLD';
    if (s === 'SILVER') return 'TVC:SILVER';
    if (s === 'CRUDE OIL' || s === 'OIL') return 'TVC:USOIL';

    // 5. Explicit Indian Equities with .NS or .BO
    if (s.endsWith('.NS')) {
      return `NSE:${s.replace('.NS', '')}`;
    }
    if (s.endsWith('.BO')) {
      return `BSE:${s.replace('.BO', '')}`;
    }

    // 6. Default all other equities to NASDAQ or NYSE
    const nyseStocks = ['BABA', 'DIS', 'BA', 'JPM', 'NKE', 'WMT', 'V', 'MA', 'PFE', 'KO'];
    if (nyseStocks.includes(s)) {
      return `NYSE:${s}`;
    }
    return `NASDAQ:${s}`;
  };

  // 1. Render TradingView Widget (Official Script version with instant dynamic switching & fixed dimensions)
  useEffect(() => {
    if (activeTab !== 'tradingview') return;

    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId);
    const isLightMode = theme === 'light';
    const tvSymbol = resolveTVSymbol(symbol);
    const tvInterval = interval === 'D' ? 'D' : interval === 'W' ? 'W' : interval === 'M' ? 'M' : '240';

    // ─── INSTANT SWITCH: If widget is already mounted & ready, switch symbol/resolution with zero reload lag! ───
    if (tvWidgetRef.current && isTvReadyRef.current && typeof tvWidgetRef.current.chart === 'function') {
      try {
        let changed = false;
        if (prevTvSymbolRef.current !== tvSymbol) {
          prevTvSymbolRef.current = tvSymbol;
          tvWidgetRef.current.chart().setSymbol(tvSymbol);
          changed = true;
        }
        if (prevTvIntervalRef.current !== tvInterval) {
          prevTvIntervalRef.current = tvInterval;
          tvWidgetRef.current.chart().setResolution(tvInterval);
          changed = true;
        }
        if (changed) return;
      } catch (err) {
        console.warn('Dynamic TradingView switch fallback:', err);
      }
    }

    const initTVWidget = () => {
      if (tvContainerRef.current && window.TradingView) {
        tvContainerRef.current.innerHTML = '';
        isTvReadyRef.current = false;
        prevTvSymbolRef.current = tvSymbol;
        prevTvIntervalRef.current = tvInterval;

        const widget = new window.TradingView.widget({
          container_id: tvContainerRef.current.id,
          symbol: tvSymbol,
          interval: tvInterval,
          timezone: 'exchange',
          theme: isLightMode ? 'light' : 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: isLightMode ? '#ffffff' : '#101427',
          loading_screen: {
            backgroundColor: isLightMode ? '#ffffff' : '#0a0e27',
            foregroundColor: '#00ff88'
          },
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          width: '100%',
          height: isFullscreen ? '100%' : 700,
          autosize: false,
          hide_volume: false
        });

        if (widget && typeof widget.onChartReady === 'function') {
          widget.onChartReady(() => {
            isTvReadyRef.current = true;
          });
        }

        tvWidgetRef.current = widget;
      }
    };

    if (window.TradingView) {
      initTVWidget();
    } else if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initTVWidget;
      document.head.appendChild(script);
    } else {
      script.onload = initTVWidget;
    }
  }, [symbol, interval, activeTab, chartKey, isFullscreen, theme]);

  // 2. Custom Chart Mapping and Helper Functions
  const mapIntervalForApi = useCallback((v) => {
    switch (v) {
      case '1': return '1m';
      case '5': return '5m';
      case '15': return '15m';
      case '60': return '60m';
      case '240': return '60m';
      case 'D': return '1d';
      case 'W': return '1wk';
      case 'M': return '1mo';
      default: return '1d';
    }
  }, []);

  const getRangeForInterval = useCallback((v) => {
    switch (v) {
      case '1': return '7d';
      case '5': return '1mo';
      case '15': return '3mo';
      case '60': return '2y';
      case '240': return '2y';
      case 'D': return '5y';
      case 'W': return '5y';
      case 'M': return '10y';
      default: return '5y';
    }
  }, []);

  const getIntervalBarTime = useCallback((timeMs, intervalVal) => {
    const date = new Date(timeMs);
    if (intervalVal === 'D') {
      date.setHours(0, 0, 0, 0);
      return Math.floor(date.getTime() / 1000);
    }
    if (intervalVal === 'W') {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(date.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      return Math.floor(startOfWeek.getTime() / 1000);
    }
    if (intervalVal === 'M') {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return Math.floor(date.getTime() / 1000);
    }
    const mins = parseInt(intervalVal);
    if (!isNaN(mins)) {
      const coeff = 1000 * 60 * mins;
      const rounded = new Date(Math.floor(timeMs / coeff) * coeff);
      return Math.floor(rounded.getTime() / 1000);
    }
    return Math.floor(timeMs / 1000);
  }, []);

  // 3. Custom Chart Renderer
  const initCustomChart = useCallback((historyData) => {
    if (!customChartContainerRef.current) return;

    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.remove();
      } catch (e) {
        console.error(e);
      }
      chartInstanceRef.current = null;
    }

    const chart = createChart(customChartContainerRef.current, {
      width: customChartContainerRef.current.clientWidth,
      height: 540,
      layout: {
        background: { color: theme === 'dark' ? (isPro ? '#0b0803' : '#0a0e27') : (isPro ? '#fdfcf7' : '#ffffff') },
        textColor: theme === 'dark' ? '#9b9eaf' : '#5a6a85',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)' },
        horzLines: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff88',
      downColor: '#ff4444',
      borderVisible: false,
      wickUpColor: '#00ff88',
      wickDownColor: '#ff4444',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const seenTimes = new Set();
    const formattedCandles = [];
    const formattedVolume = [];

    historyData.forEach((candle) => {
      const timeSec = Math.floor(candle.time / 1000);
      if (seenTimes.has(timeSec)) return;
      seenTimes.add(timeSec);

      formattedCandles.push({
        time: timeSec,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });

      const volColor = candle.close >= candle.open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
      formattedVolume.push({
        time: timeSec,
        value: candle.volume || 0,
        color: volColor,
      });
    });

    candlestickSeries.setData(formattedCandles);
    volumeSeries.setData(formattedVolume);

    // Render Indicators based on activeIndicators state
    if (activeIndicators.sma20) {
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#00bcd4',
        lineWidth: 1.5,
        title: 'SMA 20',
      });
      const smaData = calculateSMA(formattedCandles, 20).filter(d => d.value !== undefined);
      smaSeries.setData(smaData);
    }

    if (activeIndicators.ema50) {
      const emaSeries = chart.addSeries(LineSeries, {
        color: '#ff9800',
        lineWidth: 1.5,
        title: 'EMA 50',
      });
      const emaData = calculateEMA(formattedCandles, 50).filter(d => d.value !== undefined);
      emaSeries.setData(emaData);
    }

    if (activeIndicators.bollinger) {
      const bbUpper = chart.addSeries(LineSeries, {
        color: 'rgba(255, 235, 59, 0.4)',
        lineWidth: 1.2,
        title: 'BB Upper',
        lineStyle: 1,
      });
      const bbLower = chart.addSeries(LineSeries, {
        color: 'rgba(255, 235, 59, 0.4)',
        lineWidth: 1.2,
        title: 'BB Lower',
        lineStyle: 1,
      });
      const bbMiddle = chart.addSeries(LineSeries, {
        color: 'rgba(255, 235, 59, 0.25)',
        lineWidth: 1,
        title: 'BB Middle',
      });

      const { upper, lower, middle } = calculateBollingerBands(formattedCandles);
      bbUpper.setData(upper.filter(d => d.value !== undefined));
      bbLower.setData(lower.filter(d => d.value !== undefined));
      bbMiddle.setData(middle.filter(d => d.value !== undefined));
    }

    if (activeIndicators.vwap) {
      const vwapSeries = chart.addSeries(LineSeries, {
        color: '#3f51b5',
        lineWidth: 1.5,
        title: 'VWAP',
      });
      const vwapData = calculateVWAP(formattedCandles).filter(d => d.value !== undefined);
      vwapSeries.setData(vwapData);
    }

    if (activeIndicators.ichimoku) {
      const tenkanSeries = chart.addSeries(LineSeries, {
        color: '#29b6f6',
        lineWidth: 1.2,
        title: 'Tenkan-sen',
      });
      const kijunSeries = chart.addSeries(LineSeries, {
        color: '#ef5350',
        lineWidth: 1.2,
        title: 'Kijun-sen',
      });
      const { tenkan, kijun } = chartCalculateIchimoku(formattedCandles);
      tenkanSeries.setData(tenkan.filter(d => d.value !== undefined));
      kijunSeries.setData(kijun.filter(d => d.value !== undefined));
    }

    if (activeIndicators.pivotPoints) {
      const pSeries = chart.addSeries(LineSeries, { color: '#ffeb3b', lineWidth: 1, title: 'Pivot P', lineStyle: 1 });
      const r1Series = chart.addSeries(LineSeries, { color: '#ff5252', lineWidth: 1, title: 'Pivot R1', lineStyle: 2 });
      const s1Series = chart.addSeries(LineSeries, { color: '#00e676', lineWidth: 1, title: 'Pivot S1', lineStyle: 2 });
      const r2Series = chart.addSeries(LineSeries, { color: '#d50000', lineWidth: 1, title: 'Pivot R2', lineStyle: 2 });
      const s2Series = chart.addSeries(LineSeries, { color: '#00c853', lineWidth: 1, title: 'Pivot S2', lineStyle: 2 });

      const { pData, r1Data, s1Data, r2Data, s2Data } = chartCalculatePivotPoints(formattedCandles);
      pSeries.setData(pData.filter(d => d.value !== undefined));
      r1Series.setData(r1Data.filter(d => d.value !== undefined));
      s1Series.setData(s1Data.filter(d => d.value !== undefined));
      r2Series.setData(r2Data.filter(d => d.value !== undefined));
      s2Series.setData(s2Data.filter(d => d.value !== undefined));
    }

    if (activeIndicators.sar) {
      const sarSeries = chart.addSeries(LineSeries, {
        color: '#e040fb',
        lineWidth: 1,
        title: 'Parabolic SAR',
        lineStyle: 3, // Dotted
      });
      const { sar } = chartCalculateSAR(formattedCandles);
      sarSeries.setData(sar.filter(d => d.value !== undefined));
    }

    let markers = [];
    if (activeIndicators.rsi) {
      markers = markers.concat(calculateRSISignals(formattedCandles));
    }
    if (activeIndicators.macd) {
      markers = markers.concat(calculateMACDSignals(formattedCandles));
    }
    if (activeIndicators.stochRsi) {
      markers = markers.concat(chartCalculateStochRSI(formattedCandles));
    }
    if (activeIndicators.ichimoku) {
      const { markers: ichiMarkers } = chartCalculateIchimoku(formattedCandles);
      markers = markers.concat(ichiMarkers);
    }
    if (activeIndicators.sar) {
      const { markers: sarMarkers } = chartCalculateSAR(formattedCandles);
      markers = markers.concat(sarMarkers);
    }

    if (markers.length > 0) {
      markers.sort((a, b) => a.time - b.time);
      candlestickSeries.setMarkers(markers);
    }

    chartInstanceRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !customChartContainerRef.current) return;
      const width = customChartContainerRef.current.clientWidth;
      chart.resize(width, 540);
    });
    resizeObserver.observe(customChartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.remove();
        } catch (e) {}
        chartInstanceRef.current = null;
      }
    };
  }, [activeIndicators]);

  // 4. Fetch Custom History Effect
  useEffect(() => {
    if (activeTab !== 'custom') return;

    let active = true;
    const fetchHistory = async () => {
      setCustomLoading(true);
      setCustomError('');
      try {
        const apiInterval = mapIntervalForApi(interval);
        const apiRange = getRangeForInterval(interval);
        const cleanSymbol = resolveYahooSymbol(symbol);
        const res = await apiClient.get(`/market/stock-history/${cleanSymbol}?range=${apiRange}&interval=${apiInterval}`);
        if (active) {
          setCustomHistory(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch stock history:', err);
        if (active) {
          setCustomError('Failed to load historical chart data. Please try another symbol.');
        }
      } finally {
        if (active) {
          setCustomLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      active = false;
    };
  }, [symbol, interval, activeTab, chartKey, mapIntervalForApi, getRangeForInterval]);

  // 5. Initialize Custom Chart Effect
  useEffect(() => {
    if (activeTab !== 'custom' || customHistory.length === 0 || !customChartContainerRef.current) return;

    const cleanup = initCustomChart(customHistory);

    return () => {
      if (cleanup) cleanup();
    };
  }, [customHistory, activeTab, initCustomChart]);

  // 6. Live WebSocket Connection and initial tick fetch
  useEffect(() => {
    if (activeTab !== 'custom') return;

    const cleanSymbol = resolveYahooSymbol(symbol);

    // Fetch initial snapshot first
    const fetchSnapshot = async () => {
      try {
        const res = await apiClient.get(`/market/stock/${cleanSymbol}`);
        setLiveInfo({
          price: res.data.price,
          change: res.data.change,
          changePercent: res.data.changePercent,
          dayHigh: res.data.dayHigh,
          dayLow: res.data.dayLow,
          volume: res.data.volume
        });
      } catch (err) {
        console.warn('Failed to fetch initial snapshot:', err);
      }
    };
    fetchSnapshot();

    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
    const token = localStorage.getItem('token');

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to live price stream');
      socket.emit('subscribe', [cleanSymbol]);
    });

    socket.on('tick', (tick) => {
      if (tick.symbol !== cleanSymbol) return;

      const priceVal = parseFloat(tick.price);
      if (candlestickSeriesRef.current && !isNaN(priceVal)) {
        const barTime = getIntervalBarTime(tick.timestamp || Date.now(), interval);
        
        const lastCandle = customHistory[customHistory.length - 1];
        let open = priceVal;
        let high = priceVal;
        let low = priceVal;
        let close = priceVal;

        if (lastCandle) {
          const lastCandleSec = Math.floor(lastCandle.time / 1000);
          if (barTime === lastCandleSec) {
            open = lastCandle.open;
            high = Math.max(lastCandle.high, priceVal);
            low = Math.min(lastCandle.low, priceVal);
          } else {
            open = lastCandle.close;
            high = Math.max(open, priceVal);
            low = Math.min(open, priceVal);
          }
        }

        candlestickSeriesRef.current.update({
          time: barTime,
          open,
          high,
          low,
          close
        });

        if (volumeSeriesRef.current && tick.volume) {
          const volColor = close >= open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
          volumeSeriesRef.current.update({
            time: barTime,
            value: parseInt(tick.volume),
            color: volColor
          });
        }

        setLiveInfo({
          price: tick.price,
          change: tick.change,
          changePercent: tick.changePercent,
          dayHigh: tick.dayHigh,
          dayLow: tick.dayLow,
          volume: tick.volume
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [symbol, interval, activeTab, customHistory, getIntervalBarTime]);

  // Close search dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchQuery('');
      }
      if (chartSearchRef.current && !chartSearchRef.current.contains(e.target)) {
        setShowChartSearch(false);
        setChartSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatNewsTime = (ts) => {
    const diffMs = Date.now() - ts;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs/24)} day${Math.floor(hrs/24) !== 1 ? 's' : ''} ago`;
  };

  const NEWS_ITEMS = [
    {
      source: 'Bloomberg Terminal',
      sourceUrl: 'https://www.bloomberg.com/markets',
      title: 'Nvidia Blackwell Ultra architecture crushes demand models as AI capex surges',
      desc: 'Big tech infrastructure spend hits new record highs. Tech sector momentum propels S&P 500 and Nasdaq into uncharted territory.',
      fullDesc: 'Morgan Stanley and Goldman Sachs equity desks highlight accelerating enterprise adoption for next-gen accelerators. Order backlog extends well through 2026, leading to widespread price target upgrades across semiconductor manufacturers and high-performance server integrators.',
      sentiment: 'Bullish',
      tsIdx: 0
    },
    {
      source: 'Reuters Global',
      sourceUrl: 'https://www.reuters.com/markets',
      title: 'Federal Reserve rate cut probability rises to 85% following cooling CPI print',
      desc: 'Benchmark 10-year Treasury yields drop to 3.82% as interest rate traders position for accelerated monetary easing cycles.',
      fullDesc: 'Consumer Price Index data shows core inflation declining closer to the central bank 2.0% target. Interest rate swap contracts now reflect three consecutive rate adjustments over upcoming FOMC meetings, stimulating liquidity across equity and digital asset markets worldwide.',
      sentiment: 'Bullish',
      tsIdx: 1
    },
    {
      source: 'CoinDesk Intelligence',
      sourceUrl: 'https://www.coindesk.com',
      title: 'Bitcoin institutional ETF inflows hit $1.2B weekly milestone',
      desc: 'Sovereign wealth funds and corporate treasuries expand digital asset allocations ahead of macroeconomic liquidity injection.',
      fullDesc: 'Net inflows into US spot Bitcoin ETFs crossed nine figures for the fourth consecutive week. On-chain metrics reveal illiquid supply reaching all-time peaks while exchange balances decline to lowest levels since 2018.',
      sentiment: 'Bullish',
      tsIdx: 2
    },
    {
      source: 'Wall Street Journal',
      sourceUrl: 'https://www.wsj.com/finance/stocks',
      title: 'S&P 500 records new all-time high amid broad-based market breadth expansion',
      desc: 'Rally extends beyond mega-caps as cyclical, industrial, and financial sectors post notable quarterly gains.',
      fullDesc: 'Market breadth indicators showcase over 74% of S&P 500 constituents trading above their 200-day simple moving average. Earnings revisions remain positive across 9 out of 11 sectors, reinforcing institutional fund manager allocations.',
      sentiment: 'Bullish',
      tsIdx: 3
    },
    {
      source: 'Financial Times Energy',
      sourceUrl: 'https://www.ft.com/commodities',
      title: 'Crude Oil stabilizes near $78 as OPEC+ reaffirms voluntary supply discipline',
      desc: 'Brent and WTI crude contracts exhibit tight trading ranges as geopolitical supply risks counter soft seasonal refining margins.',
      fullDesc: 'OPEC+ delegates signal an extension of voluntary 2.2 million barrel-per-day production curbs. Physical prompt spreads continue backwardation, highlighting immediate tightness in Atlantic basin physical crude supplies.',
      sentiment: 'Neutral',
      tsIdx: 4
    },
    {
      source: 'ForexLive Global',
      sourceUrl: 'https://www.forexlive.com',
      title: 'EUR/USD tests key 1.1100 resistance as US Dollar Index weakens',
      desc: 'Currency traders watch ECB policy tone and US labor data for breakout confirmation into fresh multi-month ranges.',
      fullDesc: 'The US Dollar Index (DXY) slipped towards 101.20 as divergent central bank expectations favor European and commodity-linked currencies. Volatility indices in foreign exchange markets remain elevated around key macroeconomic announcements.',
      sentiment: 'Volatile',
      tsIdx: 5
    }
  ];

  const filteredChartSymbols = chartSearchQuery.length > 0
    ? ALL_SYMBOLS.filter(s => s.label.toLowerCase().includes(chartSearchQuery.toLowerCase()) || s.value.toLowerCase().includes(chartSearchQuery.toLowerCase()))
    : SYMBOL_CATEGORIES[activeCategory] || [];

  return (
    <div style={{ paddingBottom: '32px', display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, backgroundImage: 'linear-gradient(135deg, #00ff88, #00bcd4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', fontSize: '26px', fontWeight: 900 }}>
            Live Global Terminal
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '13px' }}>
            Streaming real-time international charts across US Equities, Crypto, Global Indices, Forex & Commodities
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="live-badge" style={{ background: 'rgba(0, 255, 136, 0.15)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
            LIVE
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 14px', borderRadius: '8px' }}>
            {displayLabel}
          </span>
        </div>
      </div>

      {/* Single Unified International Search & Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Unified Search Input */}
        <div ref={searchRef} style={{ position: 'relative', flex: '1 1 320px', maxWidth: '460px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0 12px' }}>
            <Search size={15} style={{ color: '#9b9eac', marginRight: '8px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              placeholder="Search global assets (e.g. S&P 500, BTC, AAPL, EUR/USD, Gold)..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '10px 0',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                style={{ background: 'transparent', border: 'none', color: '#9b9eac', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
              >
                ✕
              </button>
            )}
          </div>

          {showSearch && (
            <div style={{ position: 'absolute', top: '48px', left: 0, right: 0, background: '#0d1128', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.75)', zIndex: 100, overflow: 'hidden' }}>
              {/* Category selector pills inside search */}
              <div style={{ display: 'flex', gap: '4px', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                {allowedCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      background: activeCategory === cat ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeCategory === cat ? '#00ff88' : 'rgba(255,255,255,0.08)'}`,
                      color: activeCategory === cat ? '#00ff88' : '#9b9eac',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Symbol List */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredSymbols.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#9b9eac', fontSize: '13px' }}>No global symbols match "{searchQuery}"</div>
                ) : filteredSymbols.map(s => (
                  <div
                    key={s.value}
                    onClick={() => selectSymbol(s.value)}
                    style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(0,255,136,0.08)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}>{s.label}</span>
                    <span style={{ color: '#00bcd4', fontSize: '11px', fontFamily: 'monospace' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Category Shortcuts */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(SYMBOL_CATEGORIES).map(([cat, syms]) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                if (syms && syms.length > 0) {
                  selectSymbol(syms[0].value);
                }
              }}
              style={{
                padding: '8px 14px',
                background: activeCategory === cat ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeCategory === cat ? '#00ff88' : 'rgba(255,255,255,0.08)'}`,
                color: activeCategory === cat ? '#00ff88' : '#9b9eac',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(prev => !prev);
              setChartKey(k => k + 1);
            }}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen TradingView"}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: isFullscreen ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isFullscreen ? '#00ff88' : 'rgba(255,255,255,0.12)'}`,
              color: isFullscreen ? '#00ff88' : '#e1e3e6',
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700, transition: 'all 0.2s', marginLeft: '6px'
            }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullscreen ? 'Exit' : 'Full Screen'}
          </button>
        </div>
      </div>

      {/* Main Workspace TradingView Chart Card - 700px Tall & Responsive */}
      <div
        style={isFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999999,
          background: theme === 'light' ? '#ffffff' : '#0a0e27',
          borderRadius: 0,
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        } : {
          width: '100%',
          height: '700px',
          minHeight: '700px',
          background: theme === 'light' ? '#ffffff' : '#0a0e27',
          borderRadius: '16px',
          border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          boxShadow: theme === 'light' ? '0 8px 24px rgba(0,0,0,0.06)' : '0 8px 32px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
      >
        {/* TradingView Container with exact dimensions */}
        <div
          id="tradingview_chart_container"
          ref={tvContainerRef}
          style={{
            width: '100%',
            height: isFullscreen ? '100vh' : '700px',
            minHeight: isFullscreen ? '100vh' : '700px'
          }}
        />
      </div>

      <p style={{ color: '#9b9eac', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>
        Live streaming powered by <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00bcd4', textDecoration: 'none' }}>TradingView</a>. Professional international market feed.
      </p>

      {/* Advanced Market Intelligence (Live Metrics) */}
      <div style={{ marginTop: '24px', background: 'rgba(16, 20, 45, 0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: '#00bcd4' }} />
          Advanced Market Intelligence & Quant Flow
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 700 }}>Dark Pool Flow</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffb300', marginTop: '6px' }}>Moderate Buy Bias (62%)</div>
            <div style={{ fontSize: '11px', color: '#9b9eac', marginTop: '4px' }}>Institutional off-exchange volume</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 700 }}>Order Book Skew</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#00ff88', marginTop: '6px' }}>+14,500 Contracts (Bid Side)</div>
            <div style={{ fontSize: '11px', color: '#9b9eac', marginTop: '4px' }}>Active buy limit depth dominance</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 700 }}>Implied Volatility (IV)</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ff4444', marginTop: '6px' }}>Expanding (14.2% &rarr; 18.5%)</div>
            <div style={{ fontSize: '11px', color: '#9b9eac', marginTop: '4px' }}>Short-term options volatility breakout</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 700 }}>Global Sentiment Index</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#00bcd4', marginTop: '6px' }}>Neutral / Steady (54/100)</div>
            <div style={{ fontSize: '11px', color: '#9b9eac', marginTop: '4px' }}>Cross-market macro sentiment gauge</div>
          </div>
        </div>
      </div>

      {/* ─── HIGH-IMPACT MARKET ANNOUNCEMENTS & CORPORATE CONTRACTS TERMINAL ─── */}
      <div style={{ marginTop: '32px', background: 'rgba(16, 20, 45, 0.55)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.45)' }}>
        
        {/* Header & Live Stream Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(0, 255, 136, 0.15)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                <Zap size={18} style={{ color: '#00ff88' }} />
              </span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px' }}>
                High-Impact Announcements & Corporate Contracts
              </h2>
            </div>
            <p style={{ margin: '6px 0 0 42px', fontSize: '13px', color: '#9b9eac' }}>
              Live stream of multi-billion contract wins, corporate orders, regulatory filings, and central bank events with quantitative impact scoring.
            </p>
          </div>

          {/* Quick Metrics Counter Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.25)', color: '#00ff88', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
              {announcementsCounts.today} Today
            </span>
            <span style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
              {announcementsCounts.yesterday} Yesterday
            </span>
            <span style={{ background: 'rgba(0, 255, 136, 0.08)', border: '1px solid rgba(0, 255, 136, 0.2)', color: '#00ff88', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
              ▲ {announcementsCounts.positive} +ve Impact
            </span>
            <span style={{ background: 'rgba(255, 68, 68, 0.08)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff4444', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
              ▼ {announcementsCounts.negative} -ve Impact
            </span>
            <button
              onClick={() => fetchAnnouncements(1, false)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              title="Refresh Announcements Feed"
            >
              <RefreshCw size={13} className={announcementsLoading ? 'animate-spin' : ''} />
              Sync
            </button>
          </div>
        </div>

        {/* ─── Filter Controls Bar ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px', background: 'rgba(0, 0, 0, 0.25)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          
          {/* Row 1: Day Tabs & Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Day Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {[
                { id: 'all', label: `All Feeds (${announcementsCounts.total || 0})` },
                { id: 'today', label: `Today's Announcements (${announcementsCounts.today || 0})`, isNew: true },
                { id: 'yesterday', label: `Yesterday's Announcements (${announcementsCounts.yesterday || 0})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAnnouncementsDayFilter(tab.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: announcementsDayFilter === tab.id ? 'rgba(0, 255, 136, 0.18)' : 'transparent',
                    color: announcementsDayFilter === tab.id ? '#00ff88' : '#9b9eac',
                    fontWeight: announcementsDayFilter === tab.id ? 800 : 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.isNew && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88' }} />}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '0 12px', minWidth: '280px', flex: '1 1 300px', maxWidth: '420px' }}>
              <Search size={14} style={{ color: '#9b9eac', marginRight: '8px' }} />
              <input
                type="text"
                value={announcementsSearch}
                onChange={e => setAnnouncementsSearch(e.target.value)}
                placeholder="Search company, contract, or ticker (e.g. L&T, Order, FDA)..."
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '8px 0', color: '#ffffff', fontSize: '12px', outline: 'none' }}
              />
              {announcementsSearch && (
                <button
                  type="button"
                  onClick={() => setAnnouncementsSearch('')}
                  style={{ background: 'transparent', border: 'none', color: '#9b9eac', cursor: 'pointer', fontSize: '13px' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Impact Filters & Category Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            
            {/* Impact Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#9b9eac', textTransform: 'uppercase', marginRight: '4px' }}>
                Impact:
              </span>
              {[
                { id: 'all', label: 'All Impacts' },
                { id: 'positive', label: '🟢 +ve Impact (Bullish)', activeColor: '#00ff88' },
                { id: 'negative', label: '🔴 -ve Impact (Bearish)', activeColor: '#ff4444' },
                { id: 'high_impact', label: '⚡ High Impact (>80 Score)', activeColor: '#ffb300' }
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setAnnouncementsImpactFilter(chip.id)}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '6px',
                    border: `1px solid ${announcementsImpactFilter === chip.id ? (chip.activeColor || '#00bcd4') : 'rgba(255,255,255,0.08)'}`,
                    background: announcementsImpactFilter === chip.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                    color: announcementsImpactFilter === chip.id ? (chip.activeColor || '#ffffff') : '#9b9eac',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#9b9eac', textTransform: 'uppercase', marginRight: '4px' }}>
                Category:
              </span>
              {[
                { id: 'all', label: 'All' },
                { id: 'contract', label: '💼 Contracts & Orders' },
                { id: 'regulatory', label: '🏛️ Regulatory & Filings' },
                { id: 'macro', label: '🌍 Macro & ForexFactory' },
                { id: 'results', label: '📊 Corporate Actions' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setAnnouncementsTypeFilter(cat.id)}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '6px',
                    border: `1px solid ${announcementsTypeFilter === cat.id ? '#00bcd4' : 'rgba(255,255,255,0.08)'}`,
                    background: announcementsTypeFilter === cat.id ? 'rgba(0,188,212,0.12)' : 'rgba(255,255,255,0.02)',
                    color: announcementsTypeFilter === cat.id ? '#00bcd4' : '#9b9eac',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Scrollable Announcements Feed Grid ─── */}
        {announcementsLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>Loading verified market announcements & scoring feed...</div>
            <div style={{ fontSize: '12px', color: '#9b9eac', marginTop: '4px' }}>Aggregating corporate order wins, exchange disclosures & macro calendar</div>
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <FileText size={32} style={{ color: '#9b9eac', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>No announcements match your selected filters</div>
            <div style={{ fontSize: '12px', color: '#9b9eac', marginTop: '6px' }}>Try switching day tabs or clearing your search keywords.</div>
            <button
              onClick={() => { setAnnouncementsDayFilter('all'); setAnnouncementsTypeFilter('all'); setAnnouncementsImpactFilter('all'); setAnnouncementsSearch(''); }}
              style={{ marginTop: '14px', background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {announcements.map((ann, idx) => {
              const isPositive = ann.impact === '+ve Impact';
              const isNegative = ann.impact === '-ve Impact';
              const isExpanded = expandedAnnouncement === ann.id;

              const impactColors = isPositive
                ? { bg: 'rgba(0, 255, 136, 0.12)', border: 'rgba(0, 255, 136, 0.35)', text: '#00ff88', glow: '0 0 12px rgba(0, 255, 136, 0.25)' }
                : isNegative
                ? { bg: 'rgba(255, 68, 68, 0.12)', border: 'rgba(255, 68, 68, 0.35)', text: '#ff4444', glow: '0 0 12px rgba(255, 68, 68, 0.25)' }
                : { bg: 'rgba(0, 188, 212, 0.12)', border: 'rgba(0, 188, 212, 0.35)', text: '#00bcd4', glow: '0 0 12px rgba(0, 188, 212, 0.25)' };

              return (
                <div
                  key={ann.id || idx}
                  style={{
                    background: isExpanded ? 'rgba(16, 24, 52, 0.85)' : 'rgba(12, 16, 38, 0.65)',
                    border: `1px solid ${isExpanded ? impactColors.border : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '14px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: isExpanded ? impactColors.glow : 'none'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = impactColors.border; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { if (!isExpanded) { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; } e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Top Bar: Company Name, Ticker Link & Published Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>
                        {ann.company}
                      </span>
                      {ann.symbol && ann.symbol !== 'GLOBAL' && (
                        <button
                          onClick={() => {
                            selectSymbol(ann.symbol);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                            toast.success(`Charting ${ann.company} (${ann.symbol}) on TradingView`);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(0, 188, 212, 0.12)',
                            border: '1px solid rgba(0, 188, 212, 0.3)',
                            color: '#00bcd4',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            cursor: 'pointer'
                          }}
                          title={`Click to chart ${ann.symbol} on TradingView`}
                        >
                          <BarChart2 size={11} />
                          {ann.symbol}
                        </button>
                      )}
                    </div>

                    <span style={{ fontSize: '11px', color: '#9b9eac', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      <Clock size={11} />
                      {ann.publishedAt}
                    </span>
                  </div>

                  {/* Impact Direction & Quantitative Score Meter */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${impactColors.border}` }}>
                    
                    {/* Impact Direction Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        background: impactColors.bg,
                        color: impactColors.text,
                        fontWeight: 900,
                        fontSize: '12px'
                      }}>
                        {isPositive ? <ArrowUpRight size={14} /> : isNegative ? <ArrowDownRight size={14} /> : null}
                        {ann.impact}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: impactColors.text, textTransform: 'uppercase' }}>
                        {ann.impactLevel}
                      </span>
                    </div>

                    {/* Quantitative Impact Score Meter (1-100) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 700 }}>
                          Impact Score
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: impactColors.text, fontFamily: 'monospace' }}>
                          {ann.impactScore}/100
                        </div>
                      </div>
                      <div style={{ width: '45px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${ann.impactScore}%`, height: '100%', background: impactColors.text, borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Expected Move / Projected Effect */}
                  {ann.expectedMove && (
                    <div style={{ fontSize: '11px', fontWeight: 800, color: impactColors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🎯 Expected Effect:</span>
                      <span style={{ background: impactColors.bg, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${impactColors.border}` }}>
                        {ann.expectedMove}
                      </span>
                    </div>
                  )}

                  {/* Headline Title */}
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#ffffff', lineHeight: '1.45' }}>
                    {ann.title}
                  </h3>

                  {/* Summary Description */}
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {ann.summary}
                  </p>

                  {/* Expandable Trade Takeaway & Details */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {ann.takeaway && (
                        <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#00ff88', lineHeight: '1.45' }}>
                          <strong style={{ display: 'block', marginBottom: '2px', color: '#ffffff' }}>💡 Quant & Trade Takeaway:</strong>
                          {ann.takeaway}
                        </div>
                      )}
                      {ann.sourceUrl && (
                        <a
                          href={ann.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#00bcd4',
                            fontSize: '11px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            marginTop: '4px'
                          }}
                        >
                          Official Disclosure Source ({ann.source}) <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Footer Row: Type Tag & Expand Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#9b9eac', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontWeight: 600 }}>
                      {ann.type}
                    </span>

                    <button
                      onClick={() => setExpandedAnnouncement(isExpanded ? null : ann.id)}
                      style={{ background: 'transparent', border: 'none', color: '#00bcd4', fontSize: '11px', fontWeight: 800, cursor: 'pointer', padding: '4px' }}
                    >
                      {isExpanded ? '▲ Hide Analysis' : '▼ View Takeaway & Source'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Scroll to Load More Announcements ─── */}
        {!announcementsLoading && announcements.length > 0 && announcementsHasMore && (
          <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '12px', color: '#9b9eac', marginBottom: '12px' }}>
              Showing {announcements.length} of {announcementsCounts.total || announcements.length} impactful announcements
            </div>
            <button
              onClick={handleLoadMoreAnnouncements}
              disabled={loadingMoreAnnouncements}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 188, 212, 0.2))',
                border: '1px solid rgba(0, 255, 136, 0.4)',
                color: '#00ff88',
                padding: '10px 24px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: loadingMoreAnnouncements ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(0, 255, 136, 0.15)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { if (!loadingMoreAnnouncements) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              {loadingMoreAnnouncements ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Loading More Announcements...
                </>
              ) : (
                <>
                  Scroll for More Announcements (+16)
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}