import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  Search, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Briefcase, 
  History, 
  Award,
  ChevronRight,
  MousePointer,
  PenTool,
  Grid,
  Activity,
  Plus,
  Play,
  X,
  Layers,
  ArrowDownCircle,
  HelpCircle,
  AlertTriangle,
  Lock,
  Crown,
  Zap,
  MessageSquare,
  Newspaper,
  Maximize2,
  Minimize2,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Share2,
  Camera,
  PenTool as Pen,
  Rewind,
  PlayCircle,
  PauseCircle,
  FastForward,
  SkipForward,
  Calendar
} from 'lucide-react';
import html2canvas from 'html2canvas';

const POPULAR_WATCHLIST = [
  // Global Indices & ETFs
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', category: 'Index / ETF' },
  { symbol: '^GSPC', name: 'S&P 500 Index', category: 'Index / ETF' },
  { symbol: '^IXIC', name: 'Nasdaq Composite', category: 'Index / ETF' },
  { symbol: 'SPY', name: 'S&P 500 ETF Trust', category: 'Index / ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'Index / ETF' },
  // Crypto
  { symbol: 'BTC-USD', name: 'Bitcoin / USD', category: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum / USD', category: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana / USD', category: 'Crypto' },
  { symbol: 'XRP-USD', name: 'Ripple / USD', category: 'Crypto' },
  // US Equities
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'US Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'US Stock' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', category: 'US Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'US Stock' },
  // Forex
  { symbol: 'EURUSD=X', name: 'EUR / USD', category: 'Forex' },
  { symbol: 'GBPUSD=X', name: 'GBP / USD', category: 'Forex' },
  // Commodities
  { symbol: 'GC=F', name: 'Gold Futures', category: 'Commodity' },
  { symbol: 'CL=F', name: 'Crude Oil Futures', category: 'Commodity' }
];

const isIndianSymbol = (sym) => {
  if (!sym) return false;
  const s = sym.toUpperCase().trim();
  const isCrypto = s.endsWith('-USD') || s.endsWith('-USDT') || ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA'].includes(s);
  const isForex = s.endsWith('=X') || (s.includes('USD') && s.includes('INR')) || s.includes('EURUSD') || s.includes('GBPUSD');
  const isCommodity = s.endsWith('=F');
  const isGlobalIndex = ['^DJI', 'DJI', 'DOW', 'DOW JONES', 'DOWJONES', '^GSPC', 'GSPC', 'SPX', 'S&P 500', 'S&P500', 'SP500', '^IXIC', 'IXIC', 'NDX', 'NASDAQ', 'SPY', 'QQQ', 'DIA', 'IWM'].includes(s);
  if (isCrypto || isForex || isCommodity || isGlobalIndex) return false;
  return s.endsWith('.NS') || s.endsWith('.BO') || ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'NIFTY', 'SENSEX', 'BANKNIFTY', 'NSEI', 'BSESN'].includes(s);
};

const cleanSymbolName = (sym) => {
  if (!sym) return '';
  const s = sym.toUpperCase().trim();
  if (s === '^DJI' || s === 'DJI' || s === 'DOW JONES' || s === 'DOW') return 'DOW JONES';
  if (s === '^GSPC' || s === 'GSPC' || s === 'SPX' || s === 'S&P 500') return 'S&P 500';
  if (s === '^IXIC' || s === 'IXIC' || s === 'NASDAQ' || s === 'NDX') return 'NASDAQ';
  return sym.replace('.NS', '').replace('-USD', '').replace('=X', '').replace('=F', '');
};

const getLotMultiplier = (sym) => {
  if (!sym) return 1;
  const s = sym.toUpperCase();
  const isCrypto = s.endsWith('-USD') || s.endsWith('-USDT') || ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA'].includes(s);
  const isForex = s.endsWith('=X') || (s.includes('USD') && s.includes('INR')) || s.includes('EURUSD') || s.includes('GBPUSD');
  const isCommodity = s.endsWith('=F');
  
  if (isCrypto) return 1; // Crypto: 1 coin
  if (isForex) return 100000; // Forex: 100,000 units (Standard Lot)
  if (isCommodity) return 100; // Commodities: 100 units
  return 100; // Stocks: 100 shares (Standard Lot)
};

const resolveTVSymbol = (rawSymbol) => {
  if (!rawSymbol) return 'BINANCE:BTCUSDT';
  const s = rawSymbol.toUpperCase().trim();

  // If already prefixed with exchange
  if (s.includes(':')) return s;

  // Global Indices & Overrides (Free 24/5 live quotes without TradingView subscription restriction)
  if (s === 'DJ:DJI' || s === 'DJI' || s === '^DJI' || s === 'DOW' || s === 'DOW JONES' || s === 'DOWJONES' || s === 'DOW & JONES') {
    return 'FOREXCOM:DJI';
  }
  if (s === 'SP:SPX' || s === 'SPX' || s === '^GSPC' || s === 'GSPC' || s === 'INDEX:SPX' || s === 'S&P 500' || s === 'S&P500' || s === 'SP500') {
    return 'FOREXCOM:SPXUSD';
  }
  if (s === 'NASDAQ:NDX' || s === 'NDX' || s === '^NDX' || s === '^IXIC' || s === 'IXIC' || s === 'NASDAQ' || s === 'NASDAQ 100' || s === 'NASDAQ100') {
    return 'FOREXCOM:NAS100USD';
  }
  if (s === '^FTSE' || s === 'FTSE' || s === 'FTSE 100') return 'INDEX:FTSE';
  if (s === '^N225' || s === 'N225' || s === 'NIKKEI' || s === 'NIKKEI 225') return 'TVC:NI225';
  if (s === '^HSI' || s === 'HSI' || s === 'HANG SENG') return 'HSI:HSI';
  if (s === '^DAX' || s === 'DAX') return 'XETR:DAX';

  // Major ETFs
  if (s === 'SPY') return 'AMEX:SPY';
  if (s === 'QQQ') return 'NASDAQ:QQQ';
  if (s === 'DIA') return 'AMEX:DIA';
  if (s === 'IWM') return 'AMEX:IWM';

  // Indian Indices
  if (s === '^NSEI' || s === 'NSEI' || s === 'NIFTY' || s === 'NIFTY50') return 'NSE:NIFTY';
  if (s === '^BSESN' || s === 'BSESN' || s === 'SENSEX') return 'BSE:SENSEX';
  if (s === '^NSEBANK' || s === 'NSEBANK' || s === 'BANKNIFTY') return 'NSE:BANKNIFTY';
  if (s === '^CNXIT' || s === 'CNXIT' || s === 'NIFTYIT') return 'NSE:CNXIT';

  // Commodities (TVC free live feeds)
  if (s === 'GC=F' || s === 'GC' || s === 'GOLD' || s === 'XAU/USD' || s === 'XAUUSD') return 'TVC:GOLD';
  if (s === 'SI=F' || s === 'SI' || s === 'SILVER' || s === 'XAG/USD' || s === 'XAGUSD') return 'TVC:SILVER';
  if (s === 'CL=F' || s === 'CL' || s === 'CRUDE OIL' || s === 'OIL' || s === 'USOIL') return 'TVC:USOIL';
  if (s === 'BZ=F' || s === 'UKOIL') return 'TVC:UKOIL';
  if (s === 'NG=F' || s === 'NG' || s === 'NATURALGAS') return 'TVC:NATURALGAS';
  if (s === 'HG=F' || s === 'HG' || s === 'COPPER') return 'TVC:COPPER';

  // Crypto
  const isCrypto = s.includes('-USD') || s.includes('-USDT') || s.endsWith('USD') || s.endsWith('USDT') || ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'TRX', 'SHIB', 'AVAX', 'DOT', 'LINK', 'MATIC'].includes(s);
  if (isCrypto) {
    let cryptoBase = s.replace('-USD', '').replace('-USDT', '').replace('USD', '').replace('USDT', '');
    if (cryptoBase === 'BITCOIN') cryptoBase = 'BTC';
    if (cryptoBase === 'ETHEREUM') cryptoBase = 'ETH';
    return `BINANCE:${cryptoBase}USDT`;
  }

  // Forex
  if (s.endsWith('=X')) {
    return `FX:${s.replace('=X', '')}`;
  }
  const cleanForex = s.replace('/', '').replace('-', '');
  if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF'].includes(cleanForex)) {
    return `FX:${cleanForex}`;
  }

  // Indian equities
  if (s.endsWith('.NS')) return `NSE:${s.replace('.NS', '')}`;
  if (s.endsWith('.BO')) return `BSE:${s.replace('.BO', '')}`;

  // US Equities
  const nyseStocks = ['BABA', 'DIS', 'BA', 'JPM', 'NKE', 'WMT', 'V', 'MA', 'PFE', 'KO', 'UNH', 'HD', 'PG', 'XOM', 'CVX'];
  const cleanSym = s.replace('^', '').replace('.NS', '').replace('.BO', '');
  if (nyseStocks.includes(cleanSym)) return `NYSE:${cleanSym}`;

  // Default: NASDAQ for international tickers
  return `NASDAQ:${cleanSym}`;
};

export default function PaperTrading() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isPro = user?.is_pro || false;
  const location = useLocation();
  
  // Phase 2: Share Idea State
  const [isSharing, setIsSharing] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Phase 1: Drawing Tool State for custom charts
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnLines, setDrawnLines] = useState([]);
  
  // Market Replay Engine State
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [showReplaySetup, setShowReplaySetup] = useState(false);
  const [replayStartDate, setReplayStartDate] = useState('');
  const [replayStatus, setReplayStatus] = useState('paused'); // 'playing', 'paused'
  const [replaySpeed, setReplaySpeed] = useState(1000); // ms per candle (1000 = 1x, 200 = 5x)
  const [replayIndex, setReplayIndex] = useState(0);
  
  // Navigation & Page State (Persisted across sessions)
  const [selectedSymbol, setSelectedSymbol] = useState(() => {
    if (location.state && location.state.selectSymbol) {
      return location.state.selectSymbol;
    }
    return localStorage.getItem('nonstock_paper_symbol') || '^DJI';
  });
  const [chartInterval, setChartInterval] = useState(() => {
    return localStorage.getItem('nonstock_paper_interval') || '1d';
  });
  const [activeConsoleTab, setActiveConsoleTab] = useState('positions');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const selectedMarket = 'All';

  useEffect(() => {
    if (location.state && location.state.selectSymbol) {
      setSelectedSymbol(location.state.selectSymbol);
      localStorage.setItem('nonstock_paper_symbol', location.state.selectSymbol);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedSymbol) {
      localStorage.setItem('nonstock_paper_symbol', selectedSymbol);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    if (chartInterval) {
      localStorage.setItem('nonstock_paper_interval', chartInterval);
    }
  }, [chartInterval]);

  const filteredPopularWatchlist = POPULAR_WATCHLIST.filter(item => {
    const isIndian = isIndianSymbol(item.symbol);
    if (selectedMarket === 'Indian') return isIndian;
    if (selectedMarket === 'International') return !isIndian;
    return true;
  });

  const filteredSearchResults = searchResults.filter(res => {
    const isIndian = isIndianSymbol(res.symbol);
    if (selectedMarket === 'Indian') return isIndian;
    if (selectedMarket === 'International') return !isIndian;
    return true;
  });
  
  // Virtual Portfolio State
  const [virtualBalance, setVirtualBalance] = useState(50000);
  const [refillCount, setRefillCount] = useState(1);
  const [consecutiveSlHits, setConsecutiveSlHits] = useState(0);
  const [totalHoldingsValue, setTotalHoldingsValue] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardStandard, setLeaderboardStandard] = useState([]);
  const [leaderboardPro, setLeaderboardPro] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('standard'); // 'standard' or 'pro'
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [bots, setBots] = useState([]);
  const [selectedAdvisoryBot, setSelectedAdvisoryBot] = useState(null);

  // AI & News State
  const [aiChatMessages, setAiChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Trading Mentor. Ask me to analyze the current chart, identify support/resistance, or explain trading concepts.' }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  
  // Form State
  const [isBuy, setIsBuy] = useState(true);
  const [orderType, setOrderType] = useState('market'); // market, limit, stop
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [tradeMode, setTradeMode] = useState('units'); // units, lots
  const [formStopLoss, setFormStopLoss] = useState('');
  const [formTakeProfit, setFormTakeProfit] = useState('');
  
  // Position SL/TP inputs state
  const [slInputs, setSlInputs] = useState({});
  const [tpInputs, setTpInputs] = useState({});
  
  // Fullscreen Trading Desk & Exits Panel State
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);
  const [showTradePanel, setShowTradePanel] = useState(true);
  const [tpActive, setTpActive] = useState(false);
  const [slActive, setSlActive] = useState(false);
  const [panelTpPrice, setPanelTpPrice] = useState('');
  const [panelSlPrice, setPanelSlPrice] = useState('');
  const [panelPositionSide, setPanelPositionSide] = useState('LONG'); // SHORT or LONG
  const [panelQuantity, setPanelQuantity] = useState(1);
  
  // Live Price & FX State
  const [livePrice, setLivePrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [usdInrRate, setUsdInrRate] = useState(83.5);
  
  // Chart Drawings & Indicators State (Persisted across sessions)
  const [activeIndicators, setActiveIndicators] = useState(() => {
    try {
      const saved = localStorage.getItem('nonstock_paper_indicators');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
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
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('nonstock_paper_indicators', JSON.stringify(activeIndicators));
    } catch (e) {}
  }, [activeIndicators]);
  
  // Chart Refs
  const chartContainerRef = useRef(null);
  const chartWrapperRef = useRef(null);
  const tvPaperWidgetRef = useRef(null);
  const isTvPaperReadyRef = useRef(false);
  const prevPaperSymbolRef = useRef(null);
  const prevPaperIntervalRef = useRef(null);
  
  // Custom Chart States & Refs
  const [chartType, setChartType] = useState('tradingview'); // 'tradingview' or 'custom'
  const [customHistory, setCustomHistory] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');
  const customChartContainerRef = useRef(null);
  const customChartInstanceRef = useRef(null);
  const candlestickSeriesRef = useRef(null);

  // Live Tick Simulation Ref
  const livePriceRef = useRef(0);
  const pendingOrdersRef = useRef([]);
  const holdingsRef = useRef([]);

  const lastDraggedPriceRef = useRef(0);
  const isDraggingRef = useRef(false);
  const saveSlTpTimeoutRef = useRef({});
  const slInputsRef = useRef({});
  const tpInputsRef = useRef({});

  useEffect(() => {
    slInputsRef.current = slInputs;
  }, [slInputs]);

  useEffect(() => {
    tpInputsRef.current = tpInputs;
  }, [tpInputs]);

  const [rulerRangeMultiplier, setRulerRangeMultiplier] = useState(1);

  useEffect(() => {
    setFormStopLoss('');
    setFormTakeProfit('');
    setRulerRangeMultiplier(1);
  }, [selectedSymbol]);

  // Sync refs to access inside simulated tick loop
  useEffect(() => {
    pendingOrdersRef.current = pendingOrders;
  }, [pendingOrders]);

  useEffect(() => {
    holdingsRef.current = holdings;
  }, [holdings]);

  const getRulerRange = (symbol) => {
    let baseRange = 0.05;
    if (symbol) {
      const s = symbol.toUpperCase();
      if (s.endsWith('=X') || (s.includes('USD') && s.includes('INR')) || s.includes('EUR') || s.includes('GBP') || s.includes('JPY')) {
        baseRange = 0.01; // 1% range for Forex
      } else if (['NIFTY', 'SENSEX', 'BANKNIFTY', '^NSEI', '^BSESN', '^NSEBANK', 'NSEI', 'BSESN'].includes(s)) {
        baseRange = 0.03; // 3% range for Indices
      } else if (s.endsWith('-USD') || s.endsWith('-USDT') || ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'].includes(s)) {
        baseRange = 0.10; // 10% range for Crypto
      } else if (s.endsWith('=F')) {
        baseRange = 0.05; // 5% range for Commodities
      }
    }
    return baseRange * rulerRangeMultiplier;
  };

  const getPriceYPercent = (price, basePrice) => {
    if (!basePrice || !price) return 50;
    const range = getRulerRange(selectedSymbol);
    const pctDiff = (price - basePrice) / basePrice;
    const clampedDiff = Math.max(-range, Math.min(range, pctDiff));
    // map +range to 12% (top portion) and -range to 88% (bottom portion)
    return 50 - (clampedDiff / range) * 38;
  };

  const getYPercentPrice = (yPercent, basePrice) => {
    if (!basePrice) return 0;
    const range = getRulerRange(selectedSymbol);
    const pctDiff = ((50 - yPercent) / 38) * range;
    return basePrice * (1 + pctDiff);
  };

  const handleDragStart = (e, type, activeHolding) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    
    // Measure against chartWrapperRef for full chart dragging
    const trackElement = chartWrapperRef.current || e.currentTarget.parentElement;
    const rect = trackElement.getBoundingClientRect();
    
    // Initialize lastDraggedPriceRef to current value to prevent resetting if user just clicks without moving
    if (activeHolding) {
      lastDraggedPriceRef.current = type === 'sl' 
        ? (slInputsRef.current[selectedSymbol] || activeHolding.stopLoss) 
        : (tpInputsRef.current[selectedSymbol] || activeHolding.takeProfit);
    } else {
      lastDraggedPriceRef.current = type === 'sl' ? (formStopLoss || panelSlPrice) : (formTakeProfit || panelTpPrice);
    }
    
    const handleMouseMove = (moveEvent) => {
      const y = moveEvent.clientY - rect.top;
      const clampedY = Math.max(rect.height * 0.08, Math.min(rect.height * 0.92, y));
      const yPercent = (clampedY / rect.height) * 100;
      
      const basePrice = activeHolding ? parseFloat(activeHolding.buyPrice) : (livePriceRef.current || 100);
      if (!basePrice) return;
      
      const range = getRulerRange(selectedSymbol);
      const diff = ((50 - yPercent) / 38) * range;
      const step = basePrice > 1000 ? 5 : basePrice > 100 ? 0.5 : 0.01;
      const rawPrice = basePrice * (1 + diff);
      const draggedPrice = parseFloat((Math.round(rawPrice / step) * step).toFixed(selectedSymbol.toUpperCase().endsWith('=X') ? 4 : 2));
      lastDraggedPriceRef.current = draggedPrice;
      
      if (activeHolding) {
        if (type === 'sl') {
          setSlInputs(prev => ({ ...prev, [selectedSymbol]: draggedPrice }));
        } else {
          setTpInputs(prev => ({ ...prev, [selectedSymbol]: draggedPrice }));
        }
      } else {
        if (type === 'sl') {
          setFormStopLoss(draggedPrice);
          setPanelSlPrice(draggedPrice.toString());
        } else {
          setFormTakeProfit(draggedPrice);
          setPanelTpPrice(draggedPrice.toString());
        }
      }
    };
    
    const handleMouseUp = async () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      isDraggingRef.current = false;
      
      const finalPrice = lastDraggedPriceRef.current;
      if (activeHolding) {
        if (type === 'sl') {
          await handleSaveSlTp(selectedSymbol, finalPrice, tpInputsRef.current[selectedSymbol]);
          toast.success(`Stop Loss moved to $${finalPrice.toLocaleString()}`);
        } else {
          await handleSaveSlTp(selectedSymbol, slInputsRef.current[selectedSymbol], finalPrice);
          toast.success(`Take Profit moved to $${finalPrice.toLocaleString()}`);
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleWheelRulerRange = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.95 : 1.05; // 5% steps for smooth zooming
    setRulerRangeMultiplier(prev => Math.max(0.1, Math.min(10, prev * factor)));
  };

  // Format price based on symbol context
  const formatPrice = (val, symbol) => {
    const isIndian = isIndianSymbol(symbol);
    return `${isIndian ? '₹' : '$'}${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await apiClient.get('/market/stock/INR=X');
        if (res.data && res.data.price) {
          setUsdInrRate(parseFloat(res.data.price));
        }
      } catch (err) {
        console.warn('Failed to load USD/INR rate, using fallback:', err);
      }
    };
    fetchExchangeRate();
  }, []);

  // Fetch virtual balance and history
  const fetchPaperPortfolio = async () => {
    try {
      const res = await apiClient.get('/paper/portfolio');
      setVirtualBalance(parseFloat(res.data.virtualBalance));
      setTotalHoldingsValue(parseFloat(res.data.totalHoldingsValue));
      const freshHoldings = res.data.holdings || [];
      setHoldings(freshHoldings);
      holdingsRef.current = freshHoldings;
      setRefillCount(parseInt(res.data.refillCount || 1));
      setConsecutiveSlHits(parseInt(res.data.consecutiveSlHits || 0));

      // Preset SL/TP inputs (skip if actively dragging or modifying to prevent resetting values)
      if (!isDraggingRef.current) {
        const sls = {};
        const tps = {};
        freshHoldings.forEach(h => {
          sls[h.symbol] = h.stopLoss || '';
          tps[h.symbol] = h.takeProfit || '';
        });
        setSlInputs(sls);
        setTpInputs(tps);
      }

      // Check SL/TP levels across all holdings
      checkSlTpLevels();
    } catch (err) {
      console.error('Failed to fetch paper portfolio:', err);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const res = await apiClient.get('/paper/history');
      setOrderHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to fetch order history:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await apiClient.get('/paper/leaderboard');
      setLeaderboard(res.data.leaderboard || []);
      setLeaderboardStandard(res.data.standard || []);
      setLeaderboardPro(res.data.pro || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await apiClient.get('/paper/orders');
      setPendingOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch pending orders:', err);
    }
  };

  const fetchBalanceHistory = async () => {
    try {
      const res = await apiClient.get('/paper/balance-history');
      setBalanceHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to fetch balance history:', err);
    }
  };

  const fetchBots = async () => {
    try {
      const res = await apiClient.get('/strategy/bots');
      setBots(res.data || []);
    } catch (err) {
      console.error('Failed to fetch deployed bots:', err);
    }
  };

  const handleToggleBotStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const res = await apiClient.patch(`/strategy/bots/${id}/status`, { status: newStatus });
      toast.success(res.data.message);
      fetchBots();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to toggle bot status');
    }
  };

  const handleRemoveBot = async (id) => {
    if (!window.confirm('Are you sure you want to stop and remove this trading bot?')) {
      return;
    }
    try {
      const res = await apiClient.delete(`/strategy/bots/${id}`);
      toast.success(res.data.message);
      fetchBots();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove bot');
    }
  };

  const handleBindBotSymbol = async (botId, newSymbol) => {
    try {
      const res = await apiClient.patch(`/strategy/bots/${botId}/symbol`, { symbol: newSymbol });
      toast.success(res.data.message);
      setSelectedAdvisoryBot(prev => prev && prev.id === botId ? { ...prev, symbol: newSymbol } : prev);
      fetchBots();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update bot symbol');
    }
  };

  const handleResetPortfolio = async () => {
    if (!window.confirm('Are you sure you want to reset your simulated portfolio? All holdings and trade history will be deleted.')) {
      return;
    }
    try {
      const res = await apiClient.post('/paper/reset');
      toast.success(res.data.message);
      fetchPaperPortfolio();
      fetchOrderHistory();
      fetchPendingOrders();
      fetchBalanceHistory();
    } catch (err) {
      toast.error('Failed to reset portfolio');
    }
  };

  const handleRefillAccount = async () => {
    try {
      const res = await apiClient.post('/paper/refill');
      if (res.data.success) {
        toast.success(res.data.message, { duration: 8000 });
        fetchPaperPortfolio();
        fetchBalanceHistory();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Refill failed';
      toast.error(errorMsg);
    }
  };

  const handleSaveSlTp = async (symbol, slVal, tpVal) => {
    try {
      const res = await apiClient.post('/paper/set-sltp', {
        symbol,
        stopLoss: slVal ? parseFloat(slVal) : null,
        takeProfit: tpVal ? parseFloat(tpVal) : null
      });
      if (res.data.success) {
        toast.success(`SL/TP levels updated for ${symbol}`);
        fetchPaperPortfolio();
      }
    } catch (err) {
      toast.error('Failed to update SL/TP levels');
    }
  };

  const debouncedSaveSlTp = (symbol, slVal, tpVal) => {
    isDraggingRef.current = true;
    if (saveSlTpTimeoutRef.current[symbol]) {
      clearTimeout(saveSlTpTimeoutRef.current[symbol]);
    }
    saveSlTpTimeoutRef.current[symbol] = setTimeout(async () => {
      try {
        const res = await apiClient.post('/paper/set-sltp', {
          symbol,
          stopLoss: slVal ? parseFloat(slVal) : null,
          takeProfit: tpVal ? parseFloat(tpVal) : null
        });
        if (res.data.success) {
          toast.success(`SL/TP updated for ${symbol}`);
        }
      } catch (err) {
        toast.error('Failed to update SL/TP levels');
      } finally {
        isDraggingRef.current = false;
        fetchPaperPortfolio();
      }
    }, 1000);
  };

  const handleWheelPriceInput = (e, symbol, type, currentVal) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const parsedVal = parseFloat(currentVal) || parseFloat(livePriceRef.current || 0);
    
    // Choose step dynamically based on asset price magnitude
    let step = 1;
    if (parsedVal > 10000) step = 50;     // e.g. BTC
    else if (parsedVal > 1000) step = 5;  // e.g. NIFTY
    else if (parsedVal > 100) step = 1;
    else if (parsedVal > 10) step = 0.5;
    else if (parsedVal > 1) step = 0.05;
    else step = 0.005;

    const newVal = parseFloat((parsedVal + direction * step).toFixed(4));
    const finalVal = Math.max(0, newVal);

    if (type === 'sl') {
      setSlInputs(prev => ({ ...prev, [symbol]: finalVal }));
      debouncedSaveSlTp(symbol, finalVal, tpInputs[symbol]);
    } else if (type === 'tp') {
      setTpInputs(prev => ({ ...prev, [symbol]: finalVal }));
      debouncedSaveSlTp(symbol, slInputs[symbol], finalVal);
    }
  };

  const modifySlTpViaButton = (type, direction) => {
    const symbol = selectedSymbol;
    const currentVal = type === 'sl' ? slInputs[symbol] : tpInputs[symbol];
    const parsedVal = parseFloat(currentVal) || parseFloat(livePriceRef.current || 0);

    let step = 1;
    if (parsedVal > 10000) step = 50;
    else if (parsedVal > 1000) step = 5;
    else if (parsedVal > 100) step = 1;
    else if (parsedVal > 10) step = 0.5;
    else if (parsedVal > 1) step = 0.05;
    else step = 0.005;

    const newVal = parseFloat((parsedVal + direction * step).toFixed(4));
    const finalVal = Math.max(0, newVal);

    if (type === 'sl') {
      setSlInputs(prev => ({ ...prev, [symbol]: finalVal }));
      debouncedSaveSlTp(symbol, finalVal, tpInputs[symbol]);
    } else if (type === 'tp') {
      setTpInputs(prev => ({ ...prev, [symbol]: finalVal }));
      debouncedSaveSlTp(symbol, slInputs[symbol], finalVal);
    }
  };

  const handleWheelQtyInput = (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const parsedVal = parseFloat(quantity) || 0;
    
    let step = 1;
    if (tradeMode === 'lots') {
      step = 1; // 1 lot step
    } else {
      const lotMult = getLotMultiplier(selectedSymbol);
      if (lotMult > 1000) step = 1000;
      else if (lotMult >= 100) step = 100;
      else step = 10;
    }

    const newVal = Math.max(0, parsedVal + direction * step);
    setQuantity(newVal);
  };

  const handleWheelFormSlInput = (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const parsedVal = parseFloat(formStopLoss) || parseFloat(livePriceRef.current || 0);
    
    let step = 1;
    if (parsedVal > 10000) step = 50;
    else if (parsedVal > 1000) step = 5;
    else if (parsedVal > 100) step = 1;
    else if (parsedVal > 10) step = 0.5;
    else if (parsedVal > 1) step = 0.05;
    else step = 0.005;

    const newVal = parseFloat((parsedVal + direction * step).toFixed(4));
    setFormStopLoss(Math.max(0, newVal));
  };

  const handleWheelFormTpInput = (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const parsedVal = parseFloat(formTakeProfit) || parseFloat(livePriceRef.current || 0);
    
    let step = 1;
    if (parsedVal > 10000) step = 50;
    else if (parsedVal > 1000) step = 5;
    else if (parsedVal > 100) step = 1;
    else if (parsedVal > 10) step = 0.5;
    else if (parsedVal > 1) step = 0.05;
    else step = 0.005;

    const newVal = parseFloat((parsedVal + direction * step).toFixed(4));
    setFormTakeProfit(Math.max(0, newVal));
  };

  // Search symbols
  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (!val) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await apiClient.get(`/market/search/${val}`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Error searching symbols:', err);
    }
  };  // Fetch history & setup chart
  const fetchLivePrice = async () => {
    try {
      const res = await apiClient.get(`/market/stock/${selectedSymbol}`);
      if (res.data && res.data.price) {
        const realPrice = parseFloat(res.data.price);
        
        setLivePrice(realPrice);
        livePriceRef.current = realPrice;

        checkPendingOrders(realPrice);
        checkSlTpLevels(realPrice);

        if (res.data.change !== undefined) {
          setPriceChange(parseFloat(res.data.change));
        }
        if (res.data.changePercent !== undefined) {
          setPriceChangePercent(parseFloat(res.data.changePercent));
        }
      }
    } catch (err) {
      console.warn('Live price polling error:', err.message);
    }
  };

  // Initial account data fetch on mount only (eliminates redundant multi-endpoint latency)
  useEffect(() => {
    fetchPaperPortfolio();
    fetchOrderHistory();
    fetchLeaderboard();
    fetchPendingOrders();
    fetchBalanceHistory();
    fetchBots();
  }, []);

  // Poll live price and active portfolio for the selected symbol
  useEffect(() => {
    // Disable live polling if we are in Replay Mode
    if (isReplayMode) return;

    fetchLivePrice();

    const intervalId = window.setInterval(() => {
      fetchLivePrice();
      fetchPaperPortfolio();
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [selectedSymbol, isReplayMode]);

  useEffect(() => {
    const isInd = isIndianSymbol(selectedSymbol);
    setChartType(isInd ? 'custom' : 'tradingview');
  }, [selectedSymbol]);

  // TradingView Widget Loader & Fast Dynamic Update Effect
  useEffect(() => {
    if (chartType !== 'tradingview') return;
    let script = document.getElementById('tradingview-widget-script');
    const tvSymbol = resolveTVSymbol(selectedSymbol);
    
    let tvInterval = 'D';
    if (chartInterval === '1m') tvInterval = '1';
    else if (chartInterval === '5m') tvInterval = '5';
    else if (chartInterval === '15m') tvInterval = '15';
    else if (chartInterval === '60m') tvInterval = '60';

    // ─── INSTANT SWITCH: If widget is alive & ready, switch symbol without reloading iframe! ───
    if (tvPaperWidgetRef.current && isTvPaperReadyRef.current && typeof tvPaperWidgetRef.current.chart === 'function') {
      try {
        let changed = false;
        if (prevPaperSymbolRef.current !== tvSymbol) {
          prevPaperSymbolRef.current = tvSymbol;
          tvPaperWidgetRef.current.chart().setSymbol(tvSymbol);
          changed = true;
        }
        if (prevPaperIntervalRef.current !== tvInterval) {
          prevPaperIntervalRef.current = tvInterval;
          tvPaperWidgetRef.current.chart().setResolution(tvInterval);
          changed = true;
        }
        if (changed) return;
      } catch (err) {
        console.warn('Paper trading dynamic symbol switch fallback:', err);
      }
    }
    
    const initWidget = () => {
      if (!chartContainerRef.current) return;
      
      chartContainerRef.current.innerHTML = '';
      isTvPaperReadyRef.current = false;
      prevPaperSymbolRef.current = tvSymbol;
      prevPaperIntervalRef.current = tvInterval;
      
      const studies = [];
      if (activeIndicators.sma20) studies.push("MASimple@tv-basicstudies");
      if (activeIndicators.ema50) studies.push("MAExponential@tv-basicstudies");
      if (activeIndicators.rsi) studies.push("RSI@tv-basicstudies");
      if (activeIndicators.macd) studies.push("MACD@tv-basicstudies");
      
      // Pro indicators & strategies
      if (activeIndicators.bollinger) studies.push("BB@tv-basicstudies");
      if (activeIndicators.stochRsi) studies.push("StochasticRSI@tv-basicstudies");
      if (activeIndicators.ichimoku) studies.push("IchimokuCloud@tv-basicstudies");
      if (activeIndicators.pivotPoints) studies.push("PivotPointsStandard@tv-basicstudies");
      if (activeIndicators.vwap) studies.push("VWAP@tv-basicstudies");
      if (activeIndicators.sar) studies.push("PSAR@tv-basicstudies");

      if (window.TradingView) {
        const widget = new window.TradingView.widget({
          container_id: chartContainerRef.current.id,
          symbol: tvSymbol,
          interval: tvInterval,
          timezone: 'Etc/UTC',
          theme: theme === 'dark' ? 'dark' : 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#101427' : '#ffffff',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          withdateranges: true,
          save_image: true,
          details: true,
          hotlist: true,
          calendar: true,
          auto_save_delay: 5,
          client_id: 'nonstock.vercel.app',
          user_id: user?.id || 'nonstock_trader',
          charts_storage_url: 'https://saveload.tradingview.com',
          charts_storage_api_version: '1.1',
          width: '100%',
          height: isChartFullscreen ? '100%' : 620,
          studies: studies
        });

        if (widget && typeof widget.onChartReady === 'function') {
          widget.onChartReady(() => {
            isTvPaperReadyRef.current = true;
            try {
              const chart = widget.chart();
              if (chart && typeof chart.onSymbolChanged === 'function') {
                chart.onSymbolChanged().subscribe(null, (symbolInfo) => {
                  if (symbolInfo && symbolInfo.name) {
                    localStorage.setItem('nonstock_paper_symbol', symbolInfo.name);
                  }
                });
              }
              if (chart && typeof chart.onIntervalChanged === 'function') {
                chart.onIntervalChanged().subscribe(null, (interval) => {
                  let mapped = '1d';
                  if (interval === '1') mapped = '1m';
                  else if (interval === '5') mapped = '5m';
                  else if (interval === '15') mapped = '15m';
                  else if (interval === '60') mapped = '60m';
                  else if (interval === 'D') mapped = '1d';
                  localStorage.setItem('nonstock_paper_interval', mapped);
                });
              }
            } catch (e) {
              // Ignore subscription errors if unsupported in basic widget
            }
          });
        }

        tvPaperWidgetRef.current = widget;
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      if (window.TradingView) {
        initWidget();
      } else {
        script.addEventListener('load', initWidget);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initWidget);
      }
    };
  }, [selectedSymbol, chartInterval, activeIndicators, chartType, isChartFullscreen]);

  // ─── Custom Lightweight Charts Helpers & Effects ───
  const resolveYahooSymbol = (sym) => {
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
  };

  const mapIntervalForApi = (v) => {
    switch (v) {
      case '1m': return '1m';
      case '5m': return '5m';
      case '15m': return '15m';
      case '60m': return '60m';
      case '1d': return '1d';
      default: return '1d';
    }
  };

  const getRangeForInterval = (v) => {
    switch (v) {
      case '1m': return '7d';
      case '5m': return '1mo';
      case '15m': return '3mo';
      case '60m': return '2y';
      case '1d': return '5y';
      default: return '5y';
    }
  };

  // Heuristic indicator computation helpers for lightweight-charts
  const chartCalculateSMA = (data, period) => {
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

  const chartCalculateEMA = (data, period) => {
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

  const chartCalculateBollingerBands = (data, period = 20, multiplier = 2) => {
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

  const chartCalculateVWAP = (data) => {
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

  const chartCalculateRSISignals = (data) => {
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

  const chartCalculateMACDSignals = (data) => {
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

  const initCustomChart = (historyData) => {
    if (!customChartContainerRef.current) return;

    if (customChartInstanceRef.current) {
      try {
        customChartInstanceRef.current.remove();
      } catch (e) {
        console.error(e);
      }
      customChartInstanceRef.current = null;
    }

    const chart = createChart(customChartContainerRef.current, {
      width: customChartContainerRef.current.clientWidth,
      height: 520,
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
      const smaData = chartCalculateSMA(formattedCandles, 20).filter(d => d.value !== undefined);
      smaSeries.setData(smaData);
    }

    if (activeIndicators.ema50) {
      const emaSeries = chart.addSeries(LineSeries, {
        color: '#ff9800',
        lineWidth: 1.5,
        title: 'EMA 50',
      });
      const emaData = chartCalculateEMA(formattedCandles, 50).filter(d => d.value !== undefined);
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

      const { upper, lower, middle } = chartCalculateBollingerBands(formattedCandles);
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
      const vwapData = chartCalculateVWAP(formattedCandles).filter(d => d.value !== undefined);
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
      markers = markers.concat(chartCalculateRSISignals(formattedCandles));
    }
    if (activeIndicators.macd) {
      markers = markers.concat(chartCalculateMACDSignals(formattedCandles));
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

    customChartInstanceRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    chart.timeScale().fitContent();

    // Handle responsive resize
    const handleResize = () => {
      if (customChartContainerRef.current && customChartInstanceRef.current) {
        customChartInstanceRef.current.resize(customChartContainerRef.current.clientWidth, 520);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      try {
        chart.remove();
      } catch (e) {}
      if (customChartInstanceRef.current === chart) {
        customChartInstanceRef.current = null;
        candlestickSeriesRef.current = null;
      }
    };
  };

  // Fetch stock history for custom chart
  useEffect(() => {
    if (chartType !== 'custom') return;

    let active = true;
    const fetchHistory = async () => {
      setCustomLoading(true);
      setCustomError('');
      try {
        const apiInterval = mapIntervalForApi(chartInterval);
        const apiRange = getRangeForInterval(chartInterval);
        const cleanSymbol = resolveYahooSymbol(selectedSymbol);
        const res = await apiClient.get(`/market/stock-history/${cleanSymbol}?range=${apiRange}&interval=${apiInterval}`);
        if (active) {
          setCustomHistory(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch stock history:', err);
        if (active) {
          setCustomError('Failed to load historical chart data.');
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
  }, [selectedSymbol, chartInterval, chartType]);

  // Render custom chart on data change (or Replay start)
  useEffect(() => {
    if (chartType !== 'custom' || customHistory.length === 0 || !customChartContainerRef.current) return;
    
    let renderData = customHistory;
    
    if (isReplayMode) {
      if (replayIndex === 0) return; // Wait for initial index to be set
      renderData = customHistory.slice(0, replayIndex);
    }
    
    const cleanup = initCustomChart(renderData);
    return () => {
      if (cleanup) cleanup();
    };
  }, [customHistory, chartType, activeIndicators, isReplayMode]); // Exclude replayIndex here to prevent full redraws during playback

  // Replay Engine Execution Loop
  useEffect(() => {
    if (!isReplayMode || replayStatus !== 'playing' || chartType !== 'custom') return;

    const interval = setInterval(() => {
      setReplayIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        // Replay Finished (Caught up to present)
        if (nextIndex >= customHistory.length) {
          setIsReplayMode(false);
          setReplayStatus('paused');
          toast.success('Replay complete! Resuming live market data.');
          return prevIndex;
        }

        // Push new candle to chart incrementally (without full redraw)
        const nextCandle = customHistory[nextIndex];
        if (candlestickSeriesRef.current && nextCandle) {
          const timeSec = Math.floor(nextCandle.time / 1000);
          candlestickSeriesRef.current.update({
            time: timeSec,
            open: nextCandle.open,
            high: nextCandle.high,
            low: nextCandle.low,
            close: nextCandle.close
          });
          
          // Update simulated live price for the order panel
          livePriceRef.current = nextCandle.close;
          setLivePrice(nextCandle.close);
          
          // Execute pending orders & SL/TP based on the new historical candle price
          checkPendingOrders(nextCandle.close);
          checkSlTpLevels(nextCandle.close);
        }

        return nextIndex;
      });
    }, replaySpeed);

    return () => clearInterval(interval);
  }, [isReplayMode, replayStatus, replaySpeed, customHistory, chartType]);

  // Update last candle in custom chart on live price updates (Only if NOT in replay mode)
  useEffect(() => {
    if (!isReplayMode && chartType === 'custom' && customChartInstanceRef.current && livePrice && customHistory.length > 0) {
      const lastBar = customHistory[customHistory.length - 1];
      if (lastBar && candlestickSeriesRef.current) {
        const timeSec = Math.floor(lastBar.time / 1000);
        const updatedHigh = Math.max(lastBar.high, livePrice);
        const updatedLow = Math.min(lastBar.low, livePrice);
        candlestickSeriesRef.current.update({
          time: timeSec,
          open: lastBar.open,
          high: updatedHigh,
          low: updatedLow,
          close: livePrice
        });
      }
    }
  }, [livePrice, chartType, customHistory]);

  // Check Limit/Stop Loss pending orders
  const checkPendingOrders = (currentPrice) => {
    const activePending = [...pendingOrdersRef.current];
    if (activePending.length === 0) return;

    const remaining = [];
    let stateChanged = false;

    for (const order of activePending) {
      let triggered = false;

      if (order.symbol !== selectedSymbol) {
        remaining.push(order);
        continue;
      }

      if (order.type === 'limit') {
        if (order.action === 'BUY' && currentPrice <= order.price) {
          triggered = true;
        } else if (order.action === 'SELL' && currentPrice >= order.price) {
          triggered = true;
        }
      } else if (order.type === 'stop') {
        if (order.action === 'BUY' && currentPrice >= order.triggerPrice) {
          triggered = true;
        } else if (order.action === 'SELL' && currentPrice <= order.triggerPrice) {
          triggered = true;
        }
      }

      if (triggered) {
        stateChanged = true;
        executeSimulatedOrder(order.symbol, order.action, order.quantity, currentPrice, order.type, null, order.id);
      } else {
        remaining.push(order);
      }
    }

    if (stateChanged) {
      setPendingOrders(remaining);
    }
  };

  // Check Stop Loss & Take Profit limits of current holdings
  const checkSlTpLevels = (currentPrice = null) => {
    const activeHoldings = [...holdingsRef.current];
    if (activeHoldings.length === 0) return;

    for (const holding of activeHoldings) {
      const priceToUse = holding.symbol === selectedSymbol 
        ? (currentPrice || livePriceRef.current || holding.livePrice) 
        : holding.livePrice;

      if (!priceToUse) continue;

      // 1. Stop Loss check (exiting at loss)
      if (holding.stopLoss && priceToUse <= holding.stopLoss) {
        executeSimulatedOrder(
          holding.symbol, 
          'SELL', 
          holding.quantity, 
          holding.stopLoss, 
          'Stop Loss Auto-Trigger', 
          'stop_loss'
        );
      }
      
      // 2. Take Profit check (exiting at profit)
      if (holding.takeProfit && priceToUse >= holding.takeProfit) {
        executeSimulatedOrder(
          holding.symbol, 
          'SELL', 
          holding.quantity, 
          holding.takeProfit, 
          'Take Profit Auto-Trigger', 
          'take_profit'
        );
      }
    }
  };

  // Execute Simulated Order
  const executeSimulatedOrder = async (symbol, action, qty, executionPrice, typeLabel, triggerReason = null, pendingOrderId = null, stopLoss = null, takeProfit = null) => {
    try {
      const res = await apiClient.post('/paper/trade', {
        symbol,
        action,
        quantity: qty,
        price: executionPrice,
        triggerReason,
        pendingOrderId,
        stopLoss,
        takeProfit
      });
      if (res.data.success) {
        toast.success(`Filled: ${typeLabel.toUpperCase()} ${action} ${qty} units of ${symbol} at ${formatPrice(executionPrice, symbol)}`);
        fetchPaperPortfolio();
        fetchOrderHistory();
        fetchPendingOrders();
        fetchBalanceHistory();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Order execution failed';
      toast.error(`Order Failed: ${errorMsg}`);
    }
  };

  // Order Submit Form
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    let qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Invalid quantity');
      return;
    }

    // Apply lot multiplier if Lot size mode is active
    if (tradeMode === 'lots') {
      const multiplier = getLotMultiplier(selectedSymbol);
      qty = qty * multiplier;
    }

    const action = isBuy ? 'BUY' : 'SELL';

    if (orderType === 'limit') {
      const limit = parseFloat(limitPrice);
      if (isNaN(limit) || limit <= 0) {
        toast.error('Invalid Limit Price');
        return;
      }
      
      try {
        const res = await apiClient.post('/paper/orders', {
          symbol: selectedSymbol,
          action,
          type: 'limit',
          quantity: qty,
          price: limit,
          stopLoss: formStopLoss ? parseFloat(formStopLoss) : null,
          takeProfit: formTakeProfit ? parseFloat(formTakeProfit) : null
        });
        if (res.data.success) {
          toast.success(`Limit ${action} order placed at ${formatPrice(limit, selectedSymbol)}`);
          fetchPendingOrders();
          fetchPaperPortfolio();
          fetchBalanceHistory();
          setLimitPrice('');
          setFormStopLoss('');
          setFormTakeProfit('');
        }
      } catch (err) {
        toast.error(`Order Failed: ${err.response?.data?.error || 'Unknown error'}`);
      }
      return;
    }

    if (orderType === 'stop') {
      const stop = parseFloat(triggerPrice);
      const limit = parseFloat(limitPrice) || livePriceRef.current;
      if (isNaN(stop) || stop <= 0) {
        toast.error('Invalid Trigger Price');
        return;
      }

      try {
        const res = await apiClient.post('/paper/orders', {
          symbol: selectedSymbol,
          action,
          type: 'stop',
          quantity: qty,
          price: limit,
          triggerPrice: stop,
          stopLoss: formStopLoss ? parseFloat(formStopLoss) : null,
          takeProfit: formTakeProfit ? parseFloat(formTakeProfit) : null
        });
        if (res.data.success) {
          toast.success(`Stop ${action} order placed (Trigger: ${formatPrice(stop, selectedSymbol)})`);
          fetchPendingOrders();
          fetchPaperPortfolio();
          fetchBalanceHistory();
          setTriggerPrice('');
          setLimitPrice('');
          setFormStopLoss('');
          setFormTakeProfit('');
        }
      } catch (err) {
        toast.error(`Order Failed: ${err.response?.data?.error || 'Unknown error'}`);
      }
      return;
    }

    // Market Order
    const executionPrice = livePriceRef.current;
    await executeSimulatedOrder(
      selectedSymbol, 
      action, 
      qty, 
      executionPrice, 
      'market', 
      null, 
      null,
      formStopLoss ? parseFloat(formStopLoss) : null,
      formTakeProfit ? parseFloat(formTakeProfit) : null
    );
    setFormStopLoss('');
    setFormTakeProfit('');
  };

  const handleCancelPendingOrder = async (id) => {
    try {
      const res = await apiClient.delete(`/paper/orders/${id}`);
      if (res.data.success) {
        toast.success('Pending order cancelled');
        fetchPendingOrders();
        fetchPaperPortfolio();
        fetchBalanceHistory();
      }
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const handleClosePosition = async (holding) => {
    const executionPrice = livePriceRef.current;
    await executeSimulatedOrder(holding.symbol, 'SELL', holding.quantity, executionPrice, 'Market Close');
  };

  const calculateSMA = (data, count) => {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < count - 1) continue;
      let sum = 0;
      for (let j = 0; j < count; j++) sum += data[i - j].close;
      sma.push({ time: data[i].time, value: sum / count });
    }
    return sma;
  };

  const calculateEMA = (data, count) => {
    const ema = [];
    const k = 2 / (count + 1);
    let emaVal = data[0].close;
    ema.push({ time: data[0].time, value: emaVal });
    for (let i = 1; i < data.length; i++) {
      emaVal = data[i].close * k + emaVal * (1 - k);
      ema.push({ time: data[i].time, value: emaVal });
    }
    return ema;
  };

  const calculateBollingerBands = (data, count, stdDevs) => {
    const basis = [];
    const upper = [];
    const lower = [];

    for (let i = 0; i < data.length; i++) {
      if (i < count - 1) continue;
      let sum = 0;
      for (let j = 0; j < count; j++) sum += data[i - j].close;
      const mean = sum / count;
      basis.push({ time: data[i].time, value: mean });

      let sumSqDiff = 0;
      for (let j = 0; j < count; j++) sumSqDiff += Math.pow(data[i - j].close - mean, 2);
      const std = Math.sqrt(sumSqDiff / count);
      upper.push({ time: data[i].time, value: mean + stdDevs * std });
      lower.push({ time: data[i].time, value: mean - stdDevs * std });
    }
    return { basis, upper, lower };
  };

  const calculateRSI = (data, period) => {
    const rsi = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = data[i].close - data[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    let rs = avgLoss !== 0 ? avgGain / avgLoss : 0;
    rsi.push({ time: data[period].time, value: 100 - (100 / (1 + rs)) });

    for (let i = period + 1; i < data.length; i++) {
      const diff = data[i].close - data[i - 1].close;
      const gain = diff >= 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      rs = avgLoss !== 0 ? avgGain / avgLoss : 0;
      rsi.push({ time: data[i].time, value: 100 - (100 / (1 + rs)) });
    }
    return rsi;
  };

  const clearDrawings = () => {
    if (chartRef.current) {
      for (const line of drawnLinesRef.current) chartRef.current.removeSeries(line);
      drawnLinesRef.current = [];
      toast.success('Clear drawings');
    }
  };

  // UI Calculations
  const isIndian = isIndianSymbol(selectedSymbol);
  const rawQty = parseFloat(quantity) || 0;
  const lotMultiplier = getLotMultiplier(selectedSymbol);
  const finalQuantity = tradeMode === 'lots' ? rawQty * lotMultiplier : rawQty;
  const currentTargetPrice = orderType === 'market' ? livePrice : (parseFloat(limitPrice) || livePrice);
  const estimatedCostNative = finalQuantity * currentTargetPrice;
  const estimatedCostUsd = isIndian ? estimatedCostNative / usdInrRate : estimatedCostNative;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', paddingBottom: '40px' }}>
      
      {/* 1. Stop Loss consecutive warnings notification */}
      {consecutiveSlHits >= 3 && (
        <div style={{
          background: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid rgba(255, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#ff4444',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '13px',
          lineHeight: '1.6',
          boxShadow: '0 8px 32px rgba(255, 68, 68, 0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} /> Mindful Trading Break Recommended (Consecutive SL Hits: {consecutiveSlHits})
          </strong>
          <span>
            You have hit your Stop Loss {consecutiveSlHits} times consecutively. To prevent emotional trading and revenge losses, we strongly advise taking a break from the charts for a few days. Clear your mind, empty your emotions, and return when you are calm and refreshed!
          </span>
        </div>
      )}

      {/* Title & Stats Ribbon */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        padding: '16px 24px',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity style={{ color: '#00ff88' }} size={24} /> Arena Mode
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Real-time multi-market virtual trading arena
            </p>
          </div>
        </div>

        {/* Portfolio Stats Summary */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>Virtual Balance</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#00ff88' }}>
              ${virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.08)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>Invested Capital</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
              ${totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.08)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>Total Equity</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#00bcd4' }}>
              ${(virtualBalance + totalHoldingsValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Refill Button */}
            <button
              onClick={handleRefillAccount}
              disabled={!isPro && refillCount >= 2}
              style={{
                background: (!isPro && refillCount >= 2) ? 'rgba(255,255,255,0.02)' : 'rgba(0, 255, 136, 0.08)',
                border: `1px solid ${(!isPro && refillCount >= 2) ? 'rgba(255,255,255,0.05)' : 'rgba(0, 255, 136, 0.25)'}`,
                borderRadius: '8px',
                color: (!isPro && refillCount >= 2) ? '#666' : '#00ff88',
                cursor: (!isPro && refillCount >= 2) ? 'not-allowed' : 'pointer',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { if (isPro || refillCount < 2) e.currentTarget.style.background = 'rgba(0, 255, 136, 0.16)'; }}
              onMouseOut={e => { if (isPro || refillCount < 2) e.currentTarget.style.background = 'rgba(0, 255, 136, 0.08)'; }}
            >
              <ArrowDownCircle size={14} /> 
              {(!isPro && refillCount >= 2) ? 'Refill Limit Reached' : isPro ? 'Refill ($1M)' : 'Refill ($50k)'}
            </button>
            
            {/* Reset Button */}
            <button 
              onClick={handleResetPortfolio}
              style={{ 
                background: 'rgba(255, 68, 68, 0.08)', 
                border: '1px solid rgba(255, 68, 68, 0.25)', 
                borderRadius: '8px', 
                color: '#ff4444', 
                cursor: 'pointer', 
                padding: '8px 12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '12px', 
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.16)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.08)'}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="responsive-grid-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>
        
        {/* Chart Window */}
        <div style={{
          background: 'rgba(10, 14, 39, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* Chart Header controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>


              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9b9eac' }} />
                <input 
                  type="text"
                  placeholder="Search Asset..."
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setSelectedSymbol(searchQuery.trim().toUpperCase());
                      setSearchQuery('');
                      setSearchResults([]);
                    }
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '8px 12px 8px 34px',
                    color: 'white',
                    fontSize: '13px',
                    width: '200px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0, 255, 136, 0.3)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                />
                
                {/* Search Results Dropdown */}
                {(filteredSearchResults.length > 0 || searchQuery.trim().length > 0) && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'rgba(10, 14, 39, 0.95)',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    borderRadius: '8px',
                    marginTop: '4px',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    zIndex: 100,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}>
                    {searchQuery.trim().length > 0 && (
                      <div 
                        onClick={() => {
                          setSelectedSymbol(searchQuery.trim().toUpperCase());
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px',
                          background: 'rgba(0, 255, 136, 0.05)'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)'}
                      >
                        <div>
                          <strong style={{ color: '#00ff88' }}>Load: "{searchQuery.trim().toUpperCase()}"</strong>
                          <span style={{ color: '#9b9eac', marginLeft: '6px' }}>Press enter to load custom ticker</span>
                        </div>
                      </div>
                    )}
                    {filteredSearchResults.map(res => (
                      <div 
                        key={res.symbol}
                        onClick={() => {
                          setSelectedSymbol(res.symbol);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <strong style={{ color: '#ffffff' }}>{cleanSymbolName(res.symbol)}</strong>
                          <span style={{ color: '#9b9eac', marginLeft: '6px' }}>{res.name}</span>
                        </div>
                        <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: '#9b9eac' }}>
                          {res.symbol.includes('.NS') ? 'NSE' : res.symbol.includes('-USD') ? 'Crypto' : 'Equity'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ticker Live info display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>{cleanSymbolName(selectedSymbol)}</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{formatPrice(livePrice, selectedSymbol)}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: priceChange >= 0 ? '#00ff88' : '#ff4444' }}>
                    {priceChange >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(priceChange || 0)).toFixed(2)} ({parseFloat(priceChangePercent || 0).toFixed(2)}%)
                  </span>
                </div>

                <Link
                  to={`/ai-mentor?symbol=${selectedSymbol}`}
                  style={{
                    background: theme === 'light' ? 'linear-gradient(135deg, rgba(0, 176, 96, 0.1) 0%, rgba(0, 150, 212, 0.1) 100%)' : 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)',
                    border: theme === 'light' ? '1px solid rgba(0, 176, 96, 0.3)' : '1px solid rgba(0, 255, 136, 0.3)',
                    boxShadow: theme === 'light' ? '0 0 5px rgba(0, 176, 96, 0.1)' : '0 0 8px rgba(0, 255, 136, 0.1)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    color: theme === 'light' ? '#00b060' : '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textShadow: theme === 'light' ? 'none' : '0 0 3px rgba(0, 255, 136, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 188, 212, 0.2) 100%)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)';
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 255, 136, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Zap size={12} />
                  <span>Ask AI Mentor</span>
                </Link>
              </div>
            </div>

            {/* Controls Toggles */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Standard Indicators Group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '9px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Standard Indicators</span>
                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', gap: '4px' }}>
                  {[
                    { id: 'sma20', label: 'SMA', color: '#00bcd4' },
                    { id: 'ema50', label: 'EMA', color: '#ff9800' },
                    { id: 'rsi', label: 'RSI', color: '#e040fb' },
                    { id: 'macd', label: 'MACD', color: '#00e676' }
                  ].map(ind => (
                    <button
                      key={ind.id}
                      onClick={() => setActiveIndicators({ ...activeIndicators, [ind.id]: !activeIndicators[ind.id] })}
                      style={{
                        background: activeIndicators[ind.id] ? ind.color : 'transparent',
                        color: activeIndicators[ind.id] ? '#0a0e27' : '#9b9eac',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pro Exclusive Strategies/Indicators Group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '9px', color: '#ffb300', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Crown size={11} style={{ color: '#ffb300' }} /> Pro Strategies
                </span>
                <div style={{ display: 'flex', background: 'rgba(255, 179, 0, 0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 179, 0, 0.1)', gap: '4px' }}>
                  {[
                    { id: 'bollinger', label: 'BB', color: '#ffeb3b' },
                    { id: 'stochRsi', label: 'Stoch RSI', color: '#ff5722' },
                    { id: 'ichimoku', label: 'Ichimoku', color: '#e91e63' },
                    { id: 'pivotPoints', label: 'Pivot Points', color: '#9c27b0' },
                    { id: 'vwap', color: '#3f51b5', label: 'VWAP' },
                    { id: 'sar', label: 'Parabolic SAR', color: '#009688' }
                  ].map(ind => {
                    const isActivated = activeIndicators[ind.id];
                    return (
                      <button
                        key={ind.id}
                        onClick={() => {
                          if (!isPro) {
                            toast.error(`${ind.label} is a NonStock Pro exclusive strategy. Upgrade to unlock!`);
                            return;
                          }
                          setActiveIndicators({ ...activeIndicators, [ind.id]: !activeIndicators[ind.id] });
                        }}
                        style={{
                          background: isActivated ? ind.color : 'transparent',
                          color: isActivated ? '#0a0e27' : '#ffb300',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          opacity: isPro ? 1 : 0.65,
                          transition: 'all 0.2s'
                        }}
                      >
                        {!isPro && <Lock size={10} style={{ flexShrink: 0 }} />}
                        {ind.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fullscreen & Trade Panel Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowTradePanel(!showTradePanel)}
                  style={{
                    background: showTradePanel ? '#00ff88' : 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #00ff88',
                    color: '#000000',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    boxShadow: showTradePanel ? '0 0 10px rgba(0, 255, 136, 0.4)' : 'none'
                  }}
                >
                  <Sliders size={13} />
                  <span>{showTradePanel ? 'Hide Order Panel' : 'Show Order Panel'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChartFullscreen(!isChartFullscreen)}
                  style={{
                    background: isChartFullscreen ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #00ff88',
                    color: '#000000',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isChartFullscreen ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {isChartFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  <span>{isChartFullscreen ? 'Exit Full Screen' : 'Full Screen Terminal'}</span>
                </button>

                {/* Market Replay Button */}
                {chartType === 'custom' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isReplayMode) {
                        if(window.confirm('End Replay Mode and return to live market?')) {
                          setIsReplayMode(false);
                          setReplayStatus('paused');
                        }
                      } else {
                        setShowReplaySetup(true);
                      }
                    }}
                    style={{
                      background: isReplayMode ? '#ffffff' : '#00ff88',
                      border: '1px solid #00ff88',
                      color: '#000000',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      boxShadow: isReplayMode ? '0 0 10px rgba(255, 255, 255, 0.5)' : '0 0 10px rgba(0, 255, 136, 0.4)'
                    }}
                  >
                    <Rewind size={13} />
                    <span>{isReplayMode ? 'Exit Replay' : 'Replay Mode'}</span>
                  </button>
                )}

                {/* Phase 2: Share Idea Button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (chartType === 'tradingview') {
                      toast.info('For International Charts, please use the native Camera 📷 icon at the top right of the chart to take a snapshot!', { duration: 5000 });
                      return;
                    }
                    setIsSharing(true);
                    try {
                      const element = document.getElementById('arena-workspace');
                      if (element) {
                        const canvas = await html2canvas(element, { backgroundColor: theme === 'dark' ? '#0a0e27' : '#f8f9fa' });
                        setShareImageUrl(canvas.toDataURL('image/png'));
                        setShowShareModal(true);
                      }
                    } catch (e) {
                      toast.error('Failed to capture screen.');
                    } finally {
                      setIsSharing(false);
                    }
                  }}
                  disabled={isSharing}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #00ff88',
                    color: '#000000',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    opacity: isSharing ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#00ff88';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Camera size={13} />
                  <span>{isSharing ? 'Capturing...' : 'Share Idea'}</span>
                </button>
              </div>

              {/* Interval Toggles */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {['1m', '5m', '15m', '60m', '1d'].map(i => (
                  <button
                    key={i}
                    onClick={() => setChartInterval(i)}
                    style={{
                      background: chartInterval === i ? 'rgba(0, 255, 136, 0.08)' : 'transparent',
                      border: 'none',
                      color: chartInterval === i ? '#00ff88' : '#9b9eac',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drawings and Chart Wrapper (Supports 100vw x 100vh Full Screen Mode) */}
          <div id="arena-workspace" style={isChartFullscreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: '#090e1a',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden'
          } : { 
            display: 'flex', 
            position: 'relative', 
            width: '100%', 
            gap: '12px' 
          }}>
            <div 
              ref={chartWrapperRef}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: isChartFullscreen ? '100vh' : 'auto' }}
              onClick={(e) => {
                if (chartType === 'custom' && isDrawingMode && customChartInstanceRef.current && candlestickSeriesRef.current) {
                  const rect = chartWrapperRef.current.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const price = candlestickSeriesRef.current.coordinateToPrice(y);
                  if (price) {
                    setDrawnLines(prev => [...prev, { price, id: Date.now() }]);
                    candlestickSeriesRef.current.createPriceLine({
                      price: price,
                      color: '#d500f9',
                      lineWidth: 2,
                      lineStyle: 0,
                      axisLabelVisible: true,
                      title: 'Drawing',
                    });
                    toast.success('Drawn line on chart');
                  }
                }
              }}
            >
              {chartType === 'custom' && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 20 }}>
                  <button
                    onClick={() => {
                      setIsDrawingMode(!isDrawingMode);
                      if (!isDrawingMode) toast.success('Drawing Mode Enabled. Click on the chart to draw horizontal lines.');
                    }}
                    style={{
                      background: isDrawingMode ? '#00ff88' : 'rgba(10, 14, 39, 0.8)',
                      color: isDrawingMode ? '#000' : '#fff',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    <Pen size={12} /> {isDrawingMode ? 'Drawing On' : 'Draw (Phase 1)'}
                  </button>
                </div>
              )}

              {/* Fullscreen Exit Header Bar */}
              {isChartFullscreen && (
                <div style={{
                  height: '44px',
                  background: '#131722',
                  borderBottom: '1px solid #2a2e39',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  zIndex: 30
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#00ff88' }}>
                      {cleanSymbolName(selectedSymbol)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9b9eac' }}>
                      Live International Advanced Chart
                    </span>
                  </div>
                  <button
                    onClick={() => setIsChartFullscreen(false)}
                    style={{
                      background: '#ff4444',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Minimize2 size={12} />
                    Exit Full Screen
                  </button>
                </div>
              )}

              {/* Replay Mode Floating Controller */}
              {isReplayMode && (
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(10, 14, 39, 0.95)',
                  border: '1px solid rgba(255, 152, 0, 0.4)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(255, 152, 0, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  zIndex: 40,
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '16px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '10px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 700 }}>Market Replay</span>
                    <span style={{ fontSize: '12px', color: '#ff9800', fontWeight: 800 }}>
                      {customHistory[replayIndex] ? new Date(customHistory[replayIndex].time).toLocaleString() : 'Loading...'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => setReplayStatus(replayStatus === 'playing' ? 'paused' : 'playing')}
                      style={{ background: 'transparent', border: 'none', color: '#00ff88', cursor: 'pointer' }}
                    >
                      {replayStatus === 'playing' ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
                    </button>
                    
                    <button 
                      onClick={() => setReplayIndex(prev => Math.min(prev + 1, customHistory.length - 1))}
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                      title="Forward 1 Candle"
                    >
                      <SkipForward size={24} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 600 }}>Speed:</span>
                    {[
                      { label: '1x', ms: 1000 },
                      { label: '5x', ms: 200 },
                      { label: '10x', ms: 50 }
                    ].map(s => (
                      <button
                        key={s.label}
                        onClick={() => setReplaySpeed(s.ms)}
                        style={{
                          background: replaySpeed === s.ms ? 'rgba(255, 152, 0, 0.2)' : 'transparent',
                          color: replaySpeed === s.ms ? '#ff9800' : '#9b9eac',
                          border: `1px solid ${replaySpeed === s.ms ? '#ff9800' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TradingView Widget Container */}
              <div style={{ width: '100%', height: isChartFullscreen ? 'calc(100vh - 44px)' : '620px' }}>
                <div id="tradingview_paper_chart" ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
              </div>

              {/* Live Active Trade On-Chart Execution Overlay (Only displays when user has an active trade) */}
              {(() => {
                const activeHolding = holdings.find(h => h.symbol === selectedSymbol);
                if (!activeHolding) return null;

                const entryP = parseFloat(activeHolding.buyPrice || 0);
                const curP = livePrice || entryP;
                const posQty = parseFloat(activeHolding.quantity || 0);
                const isShort = activeHolding.side === 'SHORT' || posQty < 0;
                const absQty = Math.abs(posQty);

                const pnlUsd = isShort ? (entryP - curP) * absQty : (curP - entryP) * absQty;
                const pnlPct = entryP > 0 ? ((curP - entryP) / entryP) * 100 * (isShort ? -1 : 1) : 0;
                const isProfit = pnlUsd >= 0;

                return (
                  <div style={{
                    position: 'absolute',
                    top: isChartFullscreen ? '44px' : 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 20,
                    overflow: 'hidden'
                  }}>
                    {/* Active Trade Line & Floating Badge Across Chart */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      {/* Horizontal Active Position Guideline */}
                      <div style={{
                        flex: 1,
                        borderTop: isProfit ? '2px dashed #00ff88' : '2px dashed #ff4444',
                        opacity: 0.9,
                        filter: isProfit ? 'drop-shadow(0 0 6px rgba(0,255,136,0.6))' : 'drop-shadow(0 0 6px rgba(255,68,68,0.6))'
                      }} />

                      {/* Position Status Badge on Chart */}
                      <div style={{
                        background: 'rgba(19, 23, 34, 0.96)',
                        border: `1.5px solid ${isProfit ? '#00ff88' : '#ff4444'}`,
                        borderRadius: '6px',
                        padding: '6px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: isProfit ? '0 6px 24px rgba(0,255,136,0.3)' : '0 6px 24px rgba(255,68,68,0.3)',
                        pointerEvents: 'auto',
                        marginRight: '60px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        {/* Side & Qty */}
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          color: '#ffffff',
                          background: isShort ? '#ff4444' : '#00b060',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.5px'
                        }}>
                          {isShort ? 'SHORT' : 'BUY'} {absQty.toLocaleString()}
                        </span>

                        {/* Entry Price */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '9px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 600 }}>Entry</span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                            {formatPrice(entryP, selectedSymbol)}
                          </span>
                        </div>

                        {/* Live P&L */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '9px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 600 }}>Live P&L</span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: isProfit ? '#00ff88' : '#ff4444',
                            fontFamily: 'monospace'
                          }}>
                            {isProfit ? '+' : ''}${pnlUsd.toFixed(2)} ({isProfit ? '+' : ''}{pnlPct.toFixed(2)}%)
                          </span>
                        </div>

                        {/* Direct Close Position Button */}
                        <button
                          type="button"
                          onClick={() => handleClosePosition(activeHolding)}
                          style={{
                            background: 'rgba(255, 68, 68, 0.15)',
                            border: '1px solid rgba(255, 68, 68, 0.4)',
                            color: '#ff4444',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          title="Close Position at Market Price"
                          onMouseOver={e => {
                            e.currentTarget.style.background = '#ff4444';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(255, 68, 68, 0.15)';
                            e.currentTarget.style.color = '#ff4444';
                          }}
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>




            {/* Advisory Bot Panel */}
            {selectedAdvisoryBot && (() => {
              const activeHolding = holdings.find(h => h.symbol === selectedSymbol);
              const stopLossVal = parseFloat(selectedAdvisoryBot.stopLoss || 0);
              const takeProfitVal = parseFloat(selectedAdvisoryBot.takeProfit || 0);
              
              const getAdvisoryRecommendation = () => {
                if (activeHolding) {
                  const buyPrice = parseFloat(activeHolding.buyPrice || 0);
                  const curPrice = parseFloat(livePrice || 0);
                  const curChangePct = buyPrice > 0 ? ((curPrice - buyPrice) / buyPrice) * 100 : 0;
                  
                  if (stopLossVal > 0 && curChangePct <= -stopLossVal) {
                    return {
                      action: 'SELL / STOP LOSS ADVISED',
                      color: '#ff4444',
                      bg: 'rgba(255, 68, 68, 0.08)',
                      reason: `Critical: Asset has dropped ${curChangePct.toFixed(2)}%, crossing below your Stop Loss threshold of -${stopLossVal}%. Exit immediately to prevent capital erosion.`
                    };
                  }
                  if (takeProfitVal > 0 && curChangePct >= takeProfitVal) {
                    return {
                      action: 'SELL / TAKE PROFIT ADVISED',
                      color: '#00ff88',
                      bg: 'rgba(0, 255, 136, 0.08)',
                      reason: `Target Reached: Asset has gained +${curChangePct.toFixed(2)}%, exceeding your Take Profit threshold of +${takeProfitVal}%. Lock in profits now.`
                    };
                  }
                  
                  if (priceChangePercent < -1.0) {
                    return {
                      action: 'HOLD ADVISED',
                      color: '#ff9800',
                      bg: 'rgba(255, 152, 0, 0.08)',
                      reason: `The price is down ${priceChangePercent.toFixed(2)}% today. However, it remains above your SL limit (-${stopLossVal}%). Suggest holding for a recovery.`
                    };
                  }
                  return {
                    action: 'HOLD ADVISED',
                    color: '#ff9800',
                    bg: 'rgba(255, 152, 0, 0.08)',
                    reason: `Position is performing stable (+${curChangePct.toFixed(2)}%). Trend lines suggest maintaining current allocation. Re-evaluate if price approaches exit bands.`
                  };
                } else {
                  if (priceChangePercent < -2.0) {
                    return {
                      action: 'BUY / ACCUMULATE ADVISED',
                      color: '#00ff88',
                      bg: 'rgba(0, 255, 136, 0.08)',
                      reason: `Dip Opportunity: ${cleanSymbolName(selectedSymbol)} is down ${priceChangePercent.toFixed(2)}% today. Short-term indicators show oversold conditions. Recommend entering position.`
                    };
                  }
                  if (priceChangePercent > 2.0) {
                    return {
                      action: 'AVOID / WAIT ADVISED',
                      color: '#9b9eac',
                      bg: 'rgba(255, 255, 255, 0.03)',
                      reason: `Rallying: Asset is already up +${priceChangePercent.toFixed(2)}% today. Entering now risks buying at local resistance. Wait for a pullback before initiating buy orders.`
                    };
                  }
                  return {
                    action: 'HOLD / MONITOR ADVISED',
                    color: '#ff9800',
                    bg: 'rgba(255, 152, 0, 0.08)',
                    reason: `Neutral Trend: Consolidated range bound action. Relative Strength Index (RSI) is at 48. Wait for clear support breakouts before deploying capital.`
                  };
                }
              };
              
              const advice = getAdvisoryRecommendation();
              return (
                <div className="mobile-full-width-bot-panel" style={{
                  width: '340px',
                  background: 'rgba(10, 14, 39, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
                  color: '#ffffff',
                  height: '520px',
                  overflowY: 'auto'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="pulse-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
                        <span style={{ fontSize: '11px', color: '#00ff88', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Active Advisor</span>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 800 }}>{selectedAdvisoryBot.strategyName}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedAdvisoryBot(null)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: '#9b9eac',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.color = '#fff'}
                      onMouseOut={e => e.currentTarget.style.color = '#9b9eac'}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Symbol Binding & Alignment Alert */}
                  {selectedSymbol !== selectedAdvisoryBot.symbol ? (
                    <div style={{
                      background: 'rgba(255, 152, 0, 0.08)',
                      border: '1px solid rgba(255, 152, 0, 0.2)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '11px',
                      lineHeight: '1.4',
                      color: '#ffb300'
                    }}>
                      <strong>Symbol Mismatch:</strong> Advisor default is <strong>{cleanSymbolName(selectedAdvisoryBot.symbol)}</strong>, but chart is showing <strong>{cleanSymbolName(selectedSymbol)}</strong>.
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button 
                          onClick={() => handleBindBotSymbol(selectedAdvisoryBot.id, selectedSymbol)}
                          style={{
                            flex: 1,
                            background: 'rgba(255, 152, 0, 0.15)',
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            color: '#ffb300',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Bind to {cleanSymbolName(selectedSymbol)}
                        </button>
                        <button 
                          onClick={() => setSelectedSymbol(selectedAdvisoryBot.symbol)}
                          style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Go to {cleanSymbolName(selectedAdvisoryBot.symbol)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(0, 255, 136, 0.04)',
                      border: '1px solid rgba(0, 255, 136, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Target Ticker:</span>
                      <strong style={{ color: '#00ff88' }}>{cleanSymbolName(selectedSymbol)}</strong>
                    </div>
                  )}

                  {/* Strategy Settings Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', color: '#9b9eac', textTransform: 'uppercase', marginBottom: '2px' }}>Capital</div>
                      <div style={{ fontSize: '12px', fontWeight: 700 }}>${parseFloat(selectedAdvisoryBot.capital).toLocaleString()}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', color: '#ff4444', textTransform: 'uppercase', marginBottom: '2px' }}>Stop Loss</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff4444' }}>{stopLossVal > 0 ? `-${stopLossVal}%` : 'None'}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', color: '#00ff88', textTransform: 'uppercase', marginBottom: '2px' }}>Take Profit</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#00ff88' }}>{takeProfitVal > 0 ? `+${takeProfitVal}%` : 'None'}</div>
                    </div>
                  </div>

                  {/* Analysis Recommendation Box */}
                  <div style={{
                    background: advice.bg,
                    border: `1px solid ${advice.color}33`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#9b9eac', textTransform: 'uppercase', fontWeight: 700 }}>Advised Action</span>
                      <span style={{
                        color: advice.color,
                        fontSize: '13px',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                      }}>
                        {advice.action}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#d0d2dd', margin: 0 }}>
                      {advice.reason}
                    </p>
                  </div>

                  {/* Interactive Advisory Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                    {activeHolding ? (
                      <button
                        onClick={() => handleClosePosition(activeHolding)}
                        style={{
                          background: '#ff4444',
                          border: 'none',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '12px 0',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(255, 68, 68, 0.25)'
                        }}
                      >
                        Execute Advisor Exit Order
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsBuy(true);
                          setQuantity(Math.floor(parseFloat(selectedAdvisoryBot.capital) / livePrice));
                          const formElement = document.getElementById('paper-order-form');
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth' });
                          }
                          toast.success(`Pre-filled order form based on Bot parameters!`);
                        }}
                        style={{
                          background: '#00ff88',
                          border: 'none',
                          color: '#0a0e27',
                          borderRadius: '8px',
                          padding: '12px 0',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(0, 255, 136, 0.25)'
                        }}
                      >
                        Follow Advice: Open Order Form
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAdvisoryBot(null)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#d0d2dd',
                        borderRadius: '8px',
                        padding: '10px 0',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Close Advisor Panel
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick Watchlist Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            gap: '12px',
            overflowX: 'auto',
            background: 'rgba(10, 14, 39, 0.15)'
          }}>
            <span style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
              Quick Watchlist:
            </span>
            {filteredPopularWatchlist.map(item => (
              <button
                key={item.symbol}
                onClick={() => setSelectedSymbol(item.symbol)}
                style={{
                  background: selectedSymbol === item.symbol ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedSymbol === item.symbol ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '6px',
                  color: selectedSymbol === item.symbol ? '#00ff88' : '#ffffff',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                {cleanSymbolName(item.symbol)}
              </button>
            ))}
          </div>
        </div>

        {/* Trade Execution Sidebar */}
        <div style={{
          background: 'rgba(10, 14, 39, 0.4)',
          border: '1px solid rgba(0, 255, 136, 0.15)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setIsBuy(true)}
              style={{
                background: isBuy ? '#00ff88' : 'transparent',
                border: 'none',
                color: isBuy ? '#0a0e27' : '#9b9eac',
                padding: '10px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              BUY
            </button>
            <button
              onClick={() => setIsBuy(false)}
              style={{
                background: !isBuy ? '#ff4444' : 'transparent',
                border: 'none',
                color: !isBuy ? '#ffffff' : '#9b9eac',
                padding: '10px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              SELL
            </button>
          </div>

          <form id="paper-order-form" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Size Mode Selector (Units or Lots) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>Trading Size Mode</span>
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.02)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  type="button"
                  onClick={() => setTradeMode('units')}
                  style={{
                    background: tradeMode === 'units' ? 'rgba(0, 255, 136, 0.08)' : 'transparent',
                    border: 'none',
                    color: tradeMode === 'units' ? '#00ff88' : '#9b9eac',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Units
                </button>
                <button
                  type="button"
                  onClick={() => setTradeMode('lots')}
                  style={{
                    background: tradeMode === 'lots' ? 'rgba(0, 255, 136, 0.08)' : 'transparent',
                    border: 'none',
                    color: tradeMode === 'lots' ? '#00ff88' : '#9b9eac',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Lots
                </button>
              </div>
            </div>

            {/* Order Type Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>Order Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'rgba(255, 255, 255, 0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {['market', 'limit', 'stop'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    style={{
                      background: orderType === t ? 'rgba(255,255,255,0.06)' : 'transparent',
                      border: 'none',
                      color: orderType === t ? '#ffffff' : '#9b9eac',
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Input (Shows descriptive label if lots) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>
                  Quantity ({tradeMode === 'lots' ? 'Lots' : 'Units'})
                </label>
                {tradeMode === 'lots' && (
                  <span style={{ fontSize: '10px', color: '#00ff88', fontWeight: 600 }}>
                    1 Lot = {lotMultiplier.toLocaleString()} units
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0.0001"
                step="any"
                value={quantity}
                onChange={e => setQuantity(parseFloat(e.target.value) || '')}
                onWheel={handleWheelQtyInput}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Limit Price Input */}
            {orderType !== 'market' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>
                  Limit Price ({isIndian ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={limitPrice}
                  placeholder={parseFloat(livePrice || 0).toFixed(2)}
                  onChange={e => setLimitPrice(e.target.value)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            )}

            {/* Trigger Price Input */}
            {orderType === 'stop' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>
                  Trigger Price ({isIndian ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={triggerPrice}
                  placeholder={parseFloat(livePrice || 0).toFixed(2)}
                  onChange={e => setTriggerPrice(e.target.value)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            )}

            {/* Form Stop Loss Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>
                  Stop Loss (SL) ({isIndian ? '₹' : '$'})
                </label>
                <span style={{ fontSize: '9px', color: '#ff4444' }}>Scroll wheel to modify</span>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={formStopLoss}
                placeholder="Optional SL Price"
                onChange={e => setFormStopLoss(e.target.value)}
                onWheel={handleWheelFormSlInput}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Form Take Profit Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', color: '#9b9eac', fontWeight: 700, textTransform: 'uppercase' }}>
                  Take Profit (TP) ({isIndian ? '₹' : '$'})
                </label>
                <span style={{ fontSize: '9px', color: '#00ff88' }}>Scroll wheel to modify</span>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={formTakeProfit}
                placeholder="Optional TP Price"
                onChange={e => setFormTakeProfit(e.target.value)}
                onWheel={handleWheelFormTpInput}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Order Cost Estimate (Shows USD conversion if Indian) */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#9b9eac' }}>Total Position Size:</span>
                <strong style={{ fontSize: '12px', color: '#fff' }}>{finalQuantity.toLocaleString()} units</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#9b9eac' }}>Estimated Native Cost:</span>
                <strong style={{ fontSize: '13px', color: '#ffffff' }}>
                  {formatPrice(estimatedCostNative, selectedSymbol)}
                </strong>
              </div>
              {isIndian && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#00ff88' }}>Virtual Balance Cut:</span>
                  <strong style={{ fontSize: '13px', color: '#00ff88' }}>
                    ${estimatedCostUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              style={{
                background: isBuy ? '#00ff88' : '#ff4444',
                border: 'none',
                color: isBuy ? '#0a0e27' : '#ffffff',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${isBuy ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)'}`,
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}
            >
              Place {isBuy ? 'BUY' : 'SELL'} {orderType.toUpperCase()} Order
            </button>
          </form>
        </div>
      </div>

      {/* Trade Console */}
      <div style={{
        background: 'rgba(10, 14, 39, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        {/* Console Tab Headers */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(10, 14, 39, 0.15)'
        }}>
          {[
            { id: 'positions', label: 'Active Positions', icon: <Briefcase size={14} /> },
            { id: 'pending', label: `Pending Orders (${pendingOrders.length})`, icon: <Plus size={14} /> },
            { id: 'history', label: 'Order History', icon: <History size={14} /> },
            { id: 'balance', label: 'Balance History', icon: <TrendingUp size={14} /> },
            { id: 'bots', label: `Automated Bots (${bots.length})`, icon: <Activity size={14} /> },
            { id: 'leaderboard', label: 'Rankings', icon: <Award size={14} /> },
            { id: 'ai-chat', label: 'AI Mentor', icon: <MessageSquare size={14} /> },
            { id: 'news', label: 'Live News', icon: <Newspaper size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveConsoleTab(t.id)}
              style={{
                background: activeConsoleTab === t.id ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeConsoleTab === t.id ? '#00ff88' : 'transparent'}`,
                color: activeConsoleTab === t.id ? '#00ff88' : '#9b9eac',
                padding: '14px 20px',
                fontSize: '13px',
                fontWeight: activeConsoleTab === t.id ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ padding: '20px' }}>
          
          {/* Active Positions Tab */}
          {activeConsoleTab === 'positions' && (
            <div style={{ overflowX: 'auto' }}>
              {holdings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b9eac' }}>
                  No active virtual positions. Use the Trade Execution panel to purchase virtual shares.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9b9eac', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Symbol</th>
                      <th style={{ padding: '12px' }}>Qty</th>
                      <th style={{ padding: '12px' }}>Avg Price</th>
                      <th style={{ padding: '12px' }}>Live Price</th>
                      <th style={{ padding: '12px' }}>Stop Loss</th>
                      <th style={{ padding: '12px' }}>Take Profit</th>
                      <th style={{ padding: '12px' }}>Valuation</th>
                      <th style={{ padding: '12px' }}>Simulated PnL</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map(h => {
                      const curPrice = h.symbol === selectedSymbol ? livePrice : h.livePrice;
                      const isHoldingInd = isIndianSymbol(h.symbol);
                      
                      // Aggregates valuation in USD
                      const valuationUsd = parseFloat(h.quantity || 0) * (isHoldingInd ? parseFloat(curPrice || 0) / usdInrRate : parseFloat(curPrice || 0));
                      const costUsd = parseFloat(h.quantity || 0) * (isHoldingInd ? parseFloat(h.buyPrice || 0) / usdInrRate : parseFloat(h.buyPrice || 0));
                      const pnlUsd = valuationUsd - costUsd;
                      const pnlPct = costUsd > 0 ? (pnlUsd / costUsd) * 100 : 0;
                      
                      return (
                        <tr key={h.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: '#ffffff' }}>
                          <td style={{ padding: '12px', fontWeight: 700 }}>{h.symbol}</td>
                          <td style={{ padding: '12px' }}>{parseFloat(h.quantity).toLocaleString()}</td>
                          <td style={{ padding: '12px' }}>{formatPrice(h.buyPrice, h.symbol)}</td>
                          <td style={{ padding: '12px' }}>{formatPrice(curPrice, h.symbol)}</td>
                          
                          {/* Stop Loss Input Cell */}
                          <td style={{ padding: '8px' }}>
                            <input
                              type="number"
                              step="any"
                              value={slInputs[h.symbol] ?? ''}
                              placeholder="Set SL price"
                              onChange={e => setSlInputs({ ...slInputs, [h.symbol]: e.target.value })}
                              onWheel={e => handleWheelPriceInput(e, h.symbol, 'sl', slInputs[h.symbol])}
                              style={{
                                width: '100px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                            />
                          </td>

                          {/* Take Profit Input Cell */}
                          <td style={{ padding: '8px' }}>
                            <input
                              type="number"
                              step="any"
                              value={tpInputs[h.symbol] ?? ''}
                              placeholder="Set TP target"
                              onChange={e => setTpInputs({ ...tpInputs, [h.symbol]: e.target.value })}
                              onWheel={e => handleWheelPriceInput(e, h.symbol, 'tp', tpInputs[h.symbol])}
                              style={{
                                width: '100px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                            />
                          </td>

                          <td style={{ padding: '12px' }}>
                            ${valuationUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px', fontWeight: 700, color: pnlUsd >= 0 ? '#00ff88' : '#ff4444' }}>
                            ${pnlUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pnlPct.toFixed(2)}%)
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={() => handleSaveSlTp(h.symbol, slInputs[h.symbol], tpInputs[h.symbol])}
                              style={{
                                background: 'rgba(0, 188, 212, 0.08)',
                                border: '1px solid rgba(0, 188, 212, 0.25)',
                                color: '#00bcd4',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = 'rgba(0, 188, 212, 0.16)'}
                              onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 188, 212, 0.08)'}
                            >
                              Save SL/TP
                            </button>
                            <button
                              onClick={() => handleClosePosition(h)}
                              style={{
                                background: 'rgba(255, 68, 68, 0.08)',
                                border: '1px solid rgba(255, 68, 68, 0.25)',
                                color: '#ff4444',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.16)'}
                              onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.08)'}
                            >
                              Market Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pending Orders Tab */}
          {activeConsoleTab === 'pending' && (
            <div style={{ overflowX: 'auto' }}>
              {pendingOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b9eac' }}>
                  No pending Limit or Stop Loss orders active.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9b9eac', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Time</th>
                      <th style={{ padding: '12px' }}>Symbol</th>
                      <th style={{ padding: '12px' }}>Action</th>
                      <th style={{ padding: '12px' }}>Type</th>
                      <th style={{ padding: '12px' }}>Qty</th>
                      <th style={{ padding: '12px' }}>Limit Price</th>
                      <th style={{ padding: '12px' }}>Trigger Price</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: '#ffffff' }}>
                        <td style={{ padding: '12px', color: '#9b9eac' }}>{new Date(o.timestamp).toLocaleTimeString()}</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{o.symbol}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: o.action === 'BUY' ? '#00ff88' : '#ff4444' }}>{o.action}</td>
                        <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '11px' }}>{o.type}</td>
                        <td style={{ padding: '12px' }}>{o.quantity.toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>{formatPrice(o.price, o.symbol)}</td>
                        <td style={{ padding: '12px' }}>{o.triggerPrice ? formatPrice(o.triggerPrice, o.symbol) : '--'}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleCancelPendingOrder(o.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#9b9eac',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px'
                            }}
                            onMouseOver={e => e.currentTarget.style.color = '#ff4444'}
                            onMouseOut={e => e.currentTarget.style.color = '#9b9eac'}
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Order History Tab */}
          {activeConsoleTab === 'history' && (
            <div style={{ overflowX: 'auto' }}>
              {orderHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b9eac' }}>
                  No past executed trades found.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9b9eac', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Timestamp</th>
                      <th style={{ padding: '12px' }}>Symbol</th>
                      <th style={{ padding: '12px' }}>Action</th>
                      <th style={{ padding: '12px' }}>Qty</th>
                      <th style={{ padding: '12px' }}>Entry Price</th>
                      <th style={{ padding: '12px' }}>Exit Price</th>
                      <th style={{ padding: '12px' }}>Realized P&L (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map((trade, idx) => (
                      <tr key={trade.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: '#ffffff' }}>
                        <td style={{ padding: '12px', color: '#9b9eac' }}>{new Date(trade.timestamp).toLocaleString()}</td>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{trade.symbol}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: trade.action === 'BUY' ? '#00ff88' : '#ff4444' }}>{trade.action}</td>
                        <td style={{ padding: '12px' }}>{parseFloat(trade.quantity).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>
                          {trade.action === 'BUY' 
                            ? formatPrice(trade.price, trade.symbol) 
                            : (trade.buyPrice ? formatPrice(trade.buyPrice, trade.symbol) : '--')
                          }
                        </td>
                        <td style={{ padding: '12px' }}>
                          {trade.action === 'SELL' 
                            ? formatPrice(trade.price, trade.symbol) 
                            : '--'
                          }
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: parseFloat(trade.pnl) > 0 ? '#00ff88' : parseFloat(trade.pnl) < 0 ? '#ff4444' : '#ffffff' }}>
                          {trade.action === 'SELL' && parseFloat(trade.pnl) !== 0 
                            ? `$${parseFloat(trade.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : '--'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Balance History Tab */}
          {activeConsoleTab === 'balance' && (
            <div style={{ overflowX: 'auto' }}>
              {balanceHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b9eac' }}>
                  No balance events logged.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9b9eac', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Timestamp</th>
                      <th style={{ padding: '12px' }}>Event Type</th>
                      <th style={{ padding: '12px' }}>Change (USD)</th>
                      <th style={{ padding: '12px' }}>New Balance (USD)</th>
                      <th style={{ padding: '12px' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceHistory.map((item, idx) => {
                      const amount = parseFloat(item.amount);
                      const isNegative = amount < 0;
                      const isZero = amount === 0;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: '#ffffff' }}>
                          <td style={{ padding: '12px', color: '#9b9eac' }}>{new Date(item.timestamp).toLocaleString()}</td>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#00bcd4' }}>{item.type}</td>
                          <td style={{ padding: '12px', fontWeight: 700, color: isZero ? '#ffffff' : isNegative ? '#ff4444' : '#00ff88' }}>
                            {isZero ? '--' : `${isNegative ? '-' : '+'}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          </td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>
                            ${parseFloat(item.newBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px', color: '#e0e0e0' }}>{item.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Automated Bots Tab */}
          {activeConsoleTab === 'bots' && (
            <div style={{ overflowX: 'auto' }}>
              {!isPro ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'rgba(255, 179, 0, 0.03)',
                  border: '1px dashed rgba(255, 179, 0, 0.2)',
                  borderRadius: '12px',
                  color: '#9b9eac'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffb300', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Lock size={20} style={{ color: '#ffb300' }} /> Pro-Exclusive Simulator Feature
                  </div>
                  <div>Upgrade to NonStock Pro to deploy, pause, and remove automated algorithmic bots simulating trades in real-time.</div>
                  <button 
                    onClick={() => window.location.href = '/upgrade-pro'}
                    style={{
                      marginTop: '16px',
                      background: '#ffb300',
                      color: '#0a0e27',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Upgrade to NonStock Pro
                  </button>
                </div>
              ) : bots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b9eac' }}>
                  No automated trading bots deployed. Use the <strong style={{ color: '#00ff88', cursor: 'pointer' }} onClick={() => window.location.href = '/strategy-builder'}>Strategy Builder</strong> to design and deploy automated algorithmic bots.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9b9eac', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Bot Strategy</th>
                      <th style={{ padding: '12px' }}>Symbol</th>
                      <th style={{ padding: '12px' }}>Allocated Capital</th>
                      <th style={{ padding: '12px' }}>Stop Loss</th>
                      <th style={{ padding: '12px' }}>Take Profit</th>
                      <th style={{ padding: '12px' }}>Created At</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bots.map((bot) => (
                      <tr key={bot.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: '#ffffff' }}>
                        <td style={{ padding: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: bot.status === 'active' ? '#00ff88' : '#ff4444' }} />
                          {bot.strategy_name}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{bot.symbol}</td>
                        <td style={{ padding: '12px' }}>${parseFloat(bot.capital || 0).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>{bot.stop_loss ? `${bot.stop_loss}%` : 'None'}</td>
                        <td style={{ padding: '12px' }}>{bot.take_profit ? `${bot.take_profit}%` : 'None'}</td>
                        <td style={{ padding: '12px', color: '#9b9eac' }}>{new Date(bot.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: bot.status === 'active' ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 68, 68, 0.08)',
                            color: bot.status === 'active' ? '#00ff88' : '#ff4444',
                            border: `1px solid ${bot.status === 'active' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)'}`
                          }}>
                            {bot.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedSymbol(bot.symbol);
                              setSelectedAdvisoryBot(bot);
                              toast.success(`Active Advisor: ${bot.strategy_name} loaded for ${bot.symbol}`);
                            }}
                            style={{
                              background: selectedAdvisoryBot?.id === bot.id ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 188, 212, 0.08)',
                              border: `1px solid ${selectedAdvisoryBot?.id === bot.id ? '#00ff88' : 'rgba(0, 188, 212, 0.2)'}`,
                              color: selectedAdvisoryBot?.id === bot.id ? '#00ff88' : '#00bcd4',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 700,
                              marginRight: '8px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {selectedAdvisoryBot?.id === bot.id ? 'Advising...' : 'View Advisor'}
                          </button>
                          <button
                            onClick={() => handleToggleBotStatus(bot.id, bot.status)}
                            style={{
                              background: bot.status === 'active' ? 'rgba(255, 152, 0, 0.08)' : 'rgba(0, 255, 136, 0.08)',
                              border: `1px solid ${bot.status === 'active' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(0, 255, 136, 0.2)'}`,
                              color: bot.status === 'active' ? '#ff9800' : '#00ff88',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 700,
                              marginRight: '8px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {bot.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={() => handleRemoveBot(bot.id)}
                            style={{
                              background: 'rgba(255, 68, 68, 0.08)',
                              border: '1px solid rgba(255, 68, 68, 0.2)',
                              color: '#ff4444',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 700,
                              transition: 'all 0.2s'
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Rankings Leaderboard Tab */}
          {activeConsoleTab === 'leaderboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Leaderboard Type Toggle */}
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '8px', alignSelf: 'flex-start' }}>
                <button
                  onClick={() => setLeaderboardType('standard')}
                  style={{
                    background: leaderboardType === 'standard' ? 'rgba(0, 188, 212, 0.15)' : 'transparent',
                    border: leaderboardType === 'standard' ? '1px solid rgba(0, 188, 212, 0.3)' : '1px solid transparent',
                    color: leaderboardType === 'standard' ? '#00bcd4' : '#9b9eac',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Standard Accounts
                </button>
                <button
                  onClick={() => setLeaderboardType('pro')}
                  style={{
                    background: leaderboardType === 'pro' ? 'rgba(0, 255, 136, 0.12)' : 'transparent',
                    border: leaderboardType === 'pro' ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent',
                    color: leaderboardType === 'pro' ? '#00ff88' : '#9b9eac',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Crown size={14} style={{ color: '#ffb300', verticalAlign: 'middle', marginRight: '4px' }} /> Pro Accounts
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9b9eac', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px', width: '80px' }}>Rank</th>
                      <th style={{ padding: '12px' }}>Name</th>
                      <th style={{ padding: '12px' }}>Account Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Total Valuation (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(leaderboardType === 'pro' ? leaderboardPro : leaderboardStandard).map((user, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '13px', color: '#ffffff' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: idx === 0 ? '#ffb300' : idx === 1 ? '#e0e0e0' : idx === 2 ? '#cd7f32' : '#9b9eac' }}>
                          #{idx + 1}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{user.name}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: user.isPro ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                            color: user.isPro ? '#00ff88' : '#9b9eac',
                            border: `1px solid ${user.isPro ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
                          }}>
                            {user.isPro ? 'Pro' : 'Standard'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#00ff88' }}>
                          ${parseFloat(user.virtualBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {(leaderboardType === 'pro' ? leaderboardPro : leaderboardStandard).length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9b9eac' }}>
                          No users found in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase 2: Share Chart Modal */}
      {showShareModal && shareImageUrl && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--bg-secondary, #0a0e27)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                <Share2 style={{ color: '#00ff88' }} /> Share Your Idea
              </h2>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                border: '4px solid #1a1a2e', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
                position: 'relative'
              }}>
                <img src={shareImageUrl} alt="Chart Snapshot" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
                
                {/* Watermark */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(5px)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 255, 136, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Activity size={16} color="#00ff88" />
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>NON<span style={{ color: '#00ff88' }}>STOCK</span></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
                <a 
                  href={shareImageUrl} 
                  download={`PrisePulse-${selectedSymbol}-${new Date().getTime()}.png`}
                  style={{
                    background: '#00ff88',
                    color: '#0a0e27',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Camera size={18} /> Download High-Res Image
                </a>
                
                <button
                  onClick={() => {
                    const text = `Check out my live trade setup for $${selectedSymbol} on @NonStock! 🚀\n\nTrade risk-free at nonstock.vercel.app`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  style={{
                    background: '#1DA1F2',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Share2 size={18} /> Share to X
                </button>
              </div>
              <p style={{ color: '#9b9eac', fontSize: '12px', margin: 0, textAlign: 'center' }}>
                This image includes your current chart, drawings, and live P&L. Show off your skills!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Market Replay Setup Modal */}
      {showReplaySetup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--bg-secondary, #0a0e27)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '450px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 152, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Rewind color="#ff9800" /> Market Replay Mode
              </h2>
              <button onClick={() => setShowReplaySetup(false)} style={{ background: 'none', border: 'none', color: '#9b9eac', cursor: 'pointer' }}>
                <XCircle size={20} />
              </button>
            </div>
            
            <p style={{ color: '#9b9eac', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px' }}>
              Select a date in the past to start the replay. The chart will hide all future data and print candles one-by-one so you can practice trading historically!
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                Start Date (Available history: {customHistory.length > 0 ? new Date(customHistory[0].time).toLocaleDateString() : 'Loading...'})
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9b9eac' }} />
                <input 
                  type="date" 
                  value={replayStartDate}
                  onChange={(e) => setReplayStartDate(e.target.value)}
                  min={customHistory.length > 0 ? new Date(customHistory[0].time).toISOString().split('T')[0] : ''}
                  max={customHistory.length > 0 ? new Date(customHistory[customHistory.length - 1].time).toISOString().split('T')[0] : ''}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px 12px 12px 40px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#ff9800'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!replayStartDate) return toast.error('Please select a start date');
                const selectedTime = new Date(replayStartDate).getTime();
                // Find the closest index in customHistory
                let closestIndex = 0;
                for (let i = 0; i < customHistory.length; i++) {
                  if (customHistory[i].time >= selectedTime) {
                    closestIndex = i;
                    break;
                  }
                }
                
                if (closestIndex === 0 && customHistory.length > 0 && selectedTime < customHistory[0].time) {
                    toast.error('Date is too far in the past. Limited by available historical data.');
                    return;
                }

                setReplayIndex(closestIndex);
                setIsReplayMode(true);
                setReplayStatus('paused');
                setShowReplaySetup(false);
                toast.success('Time Machine ready! Hit Play in the controller to start.', { duration: 4000 });
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Start Replay Engine
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
