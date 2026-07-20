import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Activity, BarChart2 } from 'lucide-react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { apiClient } from '../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Symbol categories with popular options
const SYMBOL_CATEGORIES = {
  'Indian Stocks': [
    { label: 'SENSEX',     value: 'BSE:SENSEX' },
    { label: 'NIFTY 50',   value: 'NSE:NIFTY' },
    { label: 'RELIANCE',   value: 'NSE:RELIANCE' },
    { label: 'TCS',        value: 'NSE:TCS' },
    { label: 'HDFC Bank',  value: 'NSE:HDFCBANK' },
    { label: 'INFOSYS',    value: 'NSE:INFY' },
    { label: 'ICICI Bank', value: 'NSE:ICICIBANK' },
    { label: 'SBI',        value: 'NSE:SBIN' },
    { label: 'ADANI ENT',  value: 'NSE:ADANIENT' },
    { label: 'ZOMATO',     value: 'NSE:ZOMATO' },
    { label: 'WIPRO',      value: 'NSE:WIPRO' },
    { label: 'HCLTECH',    value: 'NSE:HCLTECH' },
    { label: 'MARUTI',     value: 'NSE:MARUTI' },
    { label: 'TATAMOTORS', value: 'NSE:TATAMOTORS' },
    { label: 'BAJFINANCE', value: 'NSE:BAJFINANCE' },
    { label: 'TITAN',      value: 'NSE:TITAN' },
    { label: 'SUNPHARMA',  value: 'NSE:SUNPHARMA' },
    { label: 'DRREDDY',    value: 'NSE:DRREDDY' },
    { label: 'IRCTC',      value: 'NSE:IRCTC' },
    { label: 'HAL',        value: 'NSE:HAL' },
  ],
  'Crypto': [
    { label: 'Bitcoin',    value: 'BINANCE:BTCUSDT' },
    { label: 'Ethereum',   value: 'BINANCE:ETHUSDT' },
    { label: 'BNB',        value: 'BINANCE:BNBUSDT' },
    { label: 'Solana',     value: 'BINANCE:SOLUSDT' },
    { label: 'XRP',        value: 'BINANCE:XRPUSDT' },
    { label: 'DOGE',       value: 'BINAGE:DOGEUSDT' },
    { label: 'ADA',        value: 'BINANCE:ADAUSDT' },
    { label: 'AVAX',       value: 'BINANCE:AVAXUSDT' },
    { label: 'MATIC',      value: 'BINANCE:MATICUSDT' },
    { label: 'LINK',       value: 'BINANCE:LINKUSDT' },
  ],
  'Forex': [
    { label: 'USD/INR',  value: 'FX_IDC:USDINR' },
    { label: 'EUR/INR',  value: 'FX_IDC:EURINR' },
    { label: 'GBP/INR',  value: 'FX_IDC:GBPINR' },
    { label: 'EUR/USD',  value: 'FX:EURUSD' },
    { label: 'GBP/USD',  value: 'FX:GBPUSD' },
    { label: 'USD/JPY',  value: 'FX:USDJPY' },
    { label: 'AUD/USD',  value: 'FX:AUDUSD' },
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
    { label: 'S&P 500',    value: 'SP:SPX' },
    { label: 'NASDAQ',     value: 'NASDAQ:NDX' },
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
    const gain = diff > 0 ? gain : 0;
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

export default function Markets() {
  const location = useLocation();
  const { user } = useAuth();
  const isPro = user?.is_pro || false;
  const [activeIndicators, setActiveIndicators] = useState({
    sma20: false,
    ema50: false,
    rsi: false,
    macd: false,
    bollinger: false,
    vwap: false,
  });
  const initialSymbol = location.state?.selectSymbol || 'NSE:NIFTY';
  const initialCategory = (initialSymbol.endsWith('-USD') || initialSymbol.includes('USDT') || initialSymbol.includes('BINANCE:')) 
    ? 'Crypto' 
    : (initialSymbol.endsWith('=F') || initialSymbol.startsWith('TVC:'))
    ? 'Commodities'
    : (initialSymbol.startsWith('NASDAQ:') || initialSymbol.startsWith('SP:'))
    ? 'US Stocks'
    : 'Indian Stocks';

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
  const searchRef = useRef();

  const selectedMarket = 'All';

  const allowedCategories = Object.keys(SYMBOL_CATEGORIES).filter(cat => {
    if (selectedMarket === 'Indian') return cat === 'Indian Stocks';
    if (selectedMarket === 'International') return cat !== 'Indian Stocks';
    return true;
  });

  const isSymbolIndian = (s) => {
    return s.value.startsWith('NSE:') || s.value.startsWith('BSE:') || s.value.endsWith('.NS') || s.value.endsWith('.BO');
  };

  useEffect(() => {
    if (!allowedCategories.includes(activeCategory) && allowedCategories.length > 0) {
      setActiveCategory(allowedCategories[0]);
    }
  }, [selectedMarket, activeCategory]);

  const [activeTab, setActiveTab] = useState(
    (symbol.startsWith('NSE:') || symbol.startsWith('BSE:') || activeCategory === 'Indian Stocks' || symbol.endsWith('=F') || symbol.startsWith('TVC:') || activeCategory === 'Commodities')
      ? 'custom'
      : 'tradingview'
  );

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
      } else {
        const isUS = selected.startsWith('NASDAQ:') || selected.startsWith('SP:');
        if (isUS) {
          setActiveCategory('US Stocks');
        } else {
          setActiveCategory('Indian Stocks');
        }
      }
    }
  }, [location.state]);

  const tvContainerRef = useRef(null);
  const customChartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const lastSymbolRef = useRef(symbol);

  const [customHistory, setCustomHistory] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');
  const [liveInfo, setLiveInfo] = useState(null);

  const filteredSymbols = searchQuery.length > 0
    ? ALL_SYMBOLS.filter(s => {
        const matchesQuery = s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.value.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesQuery) return false;
        if (selectedMarket === 'Indian') return isSymbolIndian(s);
        if (selectedMarket === 'International') return !isSymbolIndian(s);
        return true;
      })
    : SYMBOL_CATEGORIES[activeCategory] || [];

  const selectSymbol = useCallback((val) => {
    setSymbol(val);
    setChartKey(k => k + 1);
    setShowSearch(false);
    setSearchQuery('');
  }, []);

  const displayLabel = ALL_SYMBOLS.find(s => s.value === symbol)?.label || symbol;

  const isIndianStock = symbol.startsWith('NSE:') || symbol.startsWith('BSE:') || symbol.includes('.NS') || symbol.includes('.BO') || activeCategory === 'Indian Stocks';

  // Automatically switch tab when a new symbol is selected
  useEffect(() => {
    if (symbol !== lastSymbolRef.current) {
      const isInd = symbol.startsWith('NSE:') || symbol.startsWith('BSE:') || symbol.includes('.NS') || symbol.includes('.BO');
      const isCommodity = symbol.endsWith('=F') || symbol.startsWith('TVC:') || activeCategory === 'Commodities';
      setActiveTab((isInd || isCommodity) ? 'custom' : 'tradingview');
      lastSymbolRef.current = symbol;
    }
  }, [symbol, activeCategory]);

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
    
    // 1. If it already has an exchange prefix
    if (s.includes(':')) {
      return s;
    }

    // 2. Handle known indices
    if (s === 'NIFTY' || s === '^NSEI' || s === 'NSE:NIFTY') return 'NSE:NIFTY';
    if (s === 'SENSEX' || s === '^BSESN' || s === 'BSE:SENSEX') return 'BSE:SENSEX';
    if (s === 'BANKNIFTY' || s === '^NSEBANK' || s === 'NSE:BANKNIFTY') return 'NSE:BANKNIFTY';

    // 3. Cryptocurrencies (e.g., BTC-USD, ETH-USD)
    const isCrypto = s.includes('-USD') || s.includes('-USDT') || s.endsWith('USD') || s.endsWith('USDT') || ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'TRX', 'SHIB', 'AVAX', 'DOT'].includes(s);
    if (isCrypto) {
      const baseSymbol = s.replace('-USD', '').replace('-USDT', '').replace('USD', '').replace('USDT', '');
      return `BINANCE:${baseSymbol}USDT`;
    }

    // 4. Forex Pairs (e.g., EURUSD=X)
    if (s.endsWith('=X')) {
      const cleanForex = s.replace('=X', '');
      return `FX_IDC:${cleanForex}`;
    }

    // 4b. Commodity Futures (e.g., GC=F, CL=F, SI=F)
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

    // 5. Standard Equities
    if (s.endsWith('.NS')) {
      return `NSE:${s.replace('.NS', '')}`;
    }
    if (s.endsWith('.BO')) {
      return `BSE:${s.replace('.BO', '')}`;
    }

    // US Equities list check
    const usStocks = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOG', 'META', 'NVDA', 'NFLX'];
    if (usStocks.includes(s)) {
      return `NASDAQ:${s}`;
    }

    return `NSE:${s}`;
  };

  // 1. Render TradingView Widget (Official Script version)
  useEffect(() => {
    if (activeTab !== 'tradingview') return;

    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId);

    const initTVWidget = () => {
      if (tvContainerRef.current && window.TradingView) {
        const tvSymbol = resolveTVSymbol(symbol);
        tvContainerRef.current.innerHTML = '';
        new window.TradingView.widget({
          container_id: tvContainerRef.current.id,
          symbol: tvSymbol,
          interval: interval === 'D' ? 'D' : interval === 'W' ? 'W' : interval === 'M' ? 'M' : '240',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#101427',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          width: '100%',
          height: 540,
          studies: ['Volume@tv-basicstudies']
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initTVWidget;
      document.head.appendChild(script);
    } else {
      if (window.TradingView) {
        initTVWidget();
      } else {
        script.onload = initTVWidget;
      }
    }
  }, [symbol, interval, activeTab, chartKey]);

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
        background: { color: '#0a0e27' },
        textColor: '#9b9eaf',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
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

    let markers = [];
    if (activeIndicators.rsi) {
      markers = markers.concat(calculateRSISignals(formattedCandles));
    }
    if (activeIndicators.macd) {
      markers = markers.concat(calculateMACDSignals(formattedCandles));
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

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ paddingBottom: '32px', display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, backgroundImage: 'linear-gradient(135deg, #00ff88, #00bcd4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
            Live Market Charting
          </h1>
          <p style={{ color: '#9b9eac', margin: '4px 0 0 0', fontSize: '14px' }}>
            Advanced charting — Indian stocks, Crypto, Forex, US markets & more
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-badge">LIVE</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', padding: '5px 14px', borderRadius: '20px' }}>
            {displayLabel}
          </span>
        </div>
      </div>

      {/* Controls Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>

        {/* Symbol Search */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSearch(v => !v)}
            style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <Search size={16} /> Search Symbol
          </button>

          {showSearch && (
            <div style={{ position: 'absolute', top: '44px', left: 0, width: '340px', background: '#0d1128', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '10px' }}>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks, crypto, forex..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Category Tabs */}
              {!searchQuery && (
                <div style={{ display: 'flex', gap: '4px', padding: '0 10px 10px', flexWrap: 'wrap' }}>
                  {allowedCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{ padding: '4px 10px', background: activeCategory === cat ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeCategory === cat ? '#00ff88' : 'rgba(255,255,255,0.08)'}`, color: activeCategory === cat ? '#00ff88' : '#9b9eac', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Symbol List */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredSymbols.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#9b9eac', fontSize: '13px' }}>No symbols found</div>
                ) : filteredSymbols.map(s => (
                  <div
                    key={s.value}
                    onClick={() => selectSymbol(s.value)}
                    style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(0,255,136,0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px' }}>{s.label}</span>
                    <span style={{ color: '#9b9eac', fontSize: '11px', fontFamily: 'monospace' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interval Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {INTERVALS.map(iv => (
            <button
              key={iv.value}
              onClick={() => { setInterval(iv.value); setChartKey(k => k + 1); }}
              style={{ padding: '7px 14px', background: interval === iv.value ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${interval === iv.value ? '#00ff88' : 'rgba(255,255,255,0.08)'}`, color: interval === iv.value ? '#00ff88' : '#e1e3e6', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {iv.label}
            </button>
          ))}
        </div>

        {/* Quick-jump category row */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {Object.entries(SYMBOL_CATEGORIES)
            .filter(([cat]) => allowedCategories.includes(cat))
            .map(([cat, syms]) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setShowSearch(true); }}
                style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#9b9eac', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.color = '#00bcd4'; e.currentTarget.style.borderColor = '#00bcd4'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#9b9eac'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {cat}
              </button>
            ))}
        </div>
      </div>

      {/* Workspace Chart Card */}
      <div style={{ flex: 1, background: '#0a0e27', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', overflow: 'hidden', minHeight: '620px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Workspace Tab Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#10142d', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', padding: '0 20px', flexWrap: 'wrap', gap: '8px', height: '48px' }}>
          <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
            <button
              onClick={() => setActiveTab('tradingview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'tradingview' ? '2px solid #00bcd4' : '2px solid transparent',
                color: activeTab === 'tradingview' ? '#ffffff' : '#9b9eac',
                padding: '0 8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                transition: 'all 0.2s',
                height: '100%'
              }}
            >
              <BarChart2 size={15} style={{ color: activeTab === 'tradingview' ? '#00bcd4' : '#9b9eac' }} />
              TradingView Widget
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'custom' ? '2px solid #00ff88' : '2px solid transparent',
                color: activeTab === 'custom' ? '#ffffff' : '#9b9eac',
                padding: '0 8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                transition: 'all 0.2s',
                height: '100%'
              }}
            >
              <Activity size={15} style={{ color: activeTab === 'custom' ? '#00ff88' : '#9b9eac' }} />
              NonStock Live Chart
              {isIndianStock && (
                <span style={{ fontSize: '9px', background: 'rgba(0, 255, 136, 0.15)', color: '#00ff88', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                  Recommended
                </span>
              )}
            </button>
          </div>
          
          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: activeTab === 'custom' ? '#00ff88' : '#00bcd4',
              boxShadow: activeTab === 'custom' ? '0 0 8px #00ff88' : '0 0 8px #00bcd4'
            }} />
            <span style={{ color: '#9b9eac', fontSize: '11px', fontWeight: 600 }}>
              {activeTab === 'custom' ? 'NonStock Live (Indian Stocks)' : 'TradingView Widget (Intl Only)'}
            </span>
          </div>
        </div>

        {/* Indicators Overlay Sub-Header for Custom Chart */}
        {activeTab === 'custom' && (
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            background: 'rgba(14, 18, 43, 0.7)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            padding: '8px 20px',
            flexWrap: 'wrap',
            zIndex: 6
          }}>
            <span style={{ fontSize: '10px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Standard:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'sma20', label: 'SMA 20', color: '#00bcd4' },
                { id: 'ema50', label: 'EMA 50', color: '#ff9800' },
                { id: 'rsi', label: 'RSI Signals', color: '#e040fb' },
                { id: 'macd', label: 'MACD Signals', color: '#00e676' }
              ].map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndicators(prev => ({ ...prev, [ind.id]: !prev[ind.id] }))}
                  style={{
                    background: activeIndicators[ind.id] ? ind.color : 'rgba(255,255,255,0.02)',
                    color: activeIndicators[ind.id] ? '#0a0e27' : '#9b9eac',
                    border: activeIndicators[ind.id] ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {ind.label}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '10px', color: '#ffb300', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              👑 Pro Overlay:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'bollinger', label: 'Bollinger Bands', color: '#ffeb3b' },
                { id: 'vwap', label: 'VWAP', color: '#3f51b5' }
              ].map(ind => (
                <button
                  key={ind.id}
                  onClick={() => {
                    if (!isPro) {
                      toast.error(`👑 ${ind.label} is a NonStock Pro exclusive strategy. Upgrade to unlock!`);
                      return;
                    }
                    setActiveIndicators(prev => ({ ...prev, [ind.id]: !prev[ind.id] }));
                  }}
                  style={{
                    background: activeIndicators[ind.id] ? ind.color : 'rgba(255,255,255,0.02)',
                    color: activeIndicators[ind.id] ? '#0a0e27' : '#ffb300',
                    border: activeIndicators[ind.id] ? 'none' : '1px solid rgba(255,179,0,0.15)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: isPro ? 1 : 0.65,
                    transition: 'all 0.2s'
                  }}
                >
                  {!isPro && <span style={{ marginRight: '4px' }}>🔒</span>}
                  {ind.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart Viewport */}
        <div style={{ flex: 1, position: 'relative', minHeight: '540px', background: '#0a0e27', display: 'flex', flexDirection: 'column' }}>
          
          {/* TradingView Container */}
          <div style={{ display: activeTab === 'tradingview' ? 'block' : 'none', width: '100%', height: '540px' }}>
            <div id="tradingview_chart_container" ref={tvContainerRef} style={{ width: '100%', height: '540px' }} />
          </div>

          {/* Custom NonStock Chart Container */}
          <div style={{ display: activeTab === 'custom' ? 'block' : 'none', width: '100%', height: '540px', position: 'relative' }}>
            {customLoading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 14, 39, 0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                <div className="spinner" style={{ border: '3px solid rgba(255,255,255,0.05)', borderTop: '3px solid #00ff88', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>Fetching live historical data...</span>
              </div>
            )}
            {customError && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 14, 39, 0.95)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10, padding: '24px', textAlign: 'center' }}>
                <span style={{ color: '#ff4444', fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>{customError}</span>
                <button onClick={() => setChartKey(k => k + 1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Retry connection</button>
              </div>
            )}
            
            {/* Live Info Bar inside chart */}
            {liveInfo && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5, background: 'rgba(16, 20, 45, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', display: 'flex', gap: '20px', alignItems: 'center', pointerEvents: 'none' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#9b9eac', fontWeight: 700 }}>LAST PRICE</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                    {isIndianStock ? '₹' : '$'}{parseFloat(liveInfo.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#9b9eac', fontWeight: 700 }}>CHANGE</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: parseFloat(liveInfo.change) >= 0 ? '#00ff88' : '#ff4444', fontFamily: 'monospace' }}>
                    {parseFloat(liveInfo.change) >= 0 ? '+' : ''}{parseFloat(liveInfo.change).toFixed(2)} ({parseFloat(liveInfo.changePercent) >= 0 ? '+' : ''}{parseFloat(liveInfo.changePercent).toFixed(2)}%)
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '10px', color: '#9b9eac', fontWeight: 700 }}>DAY HIGH</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', fontFamily: 'monospace' }}>
                    {isIndianStock ? '₹' : '$'}{parseFloat(liveInfo.dayHigh || liveInfo.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#9b9eac', fontWeight: 700 }}>DAY LOW</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', fontFamily: 'monospace' }}>
                    {isIndianStock ? '₹' : '$'}{parseFloat(liveInfo.dayLow || liveInfo.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
            
            <div id="nonstock_chart_container" ref={customChartContainerRef} style={{ width: '100%', height: '540px' }} />
          </div>
        </div>

      </div>

      <p style={{ color: '#9b9eac', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
        Charts powered by <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00bcd4', textDecoration: 'none' }}>TradingView</a> and Yahoo Finance. Data is for informational purposes only.
      </p>
    </div>
  );
}