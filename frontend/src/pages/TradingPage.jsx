import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTrading } from '../contexts/TradingContext';
import { 
  Search, RotateCcw, TrendingUp, TrendingDown, ArrowRight, Zap, 
  Shield, Sparkles, Activity, Check, X, SlidersHorizontal, Maximize2, Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import ExecutionTicket from '../components/ExecutionTicket';
import LiveMarketScreener from '../components/LiveMarketScreener';

// Helper to dynamically resolve TradingView symbol for any user-entered ticker
export function resolveTradingViewSymbol(rawSym) {
  if (!rawSym) return 'BINANCE:BTCUSDT';
  const s = rawSym.toUpperCase().trim();
  if (s.includes(':')) return s;
  
  const map = {
    'BTCUSD': 'COINBASE:BTCUSD',
    'BTCUSDT': 'BINANCE:BTCUSDT',
    'ETHUSD': 'COINBASE:ETHUSD',
    'ETHUSDT': 'BINANCE:ETHUSDT',
    'SOLUSD': 'COINBASE:SOLUSD',
    'SOLUSDT': 'BINANCE:SOLUSDT',
    'BNBUSD': 'BINANCE:BNBUSD',
    'BNBUSDT': 'BINANCE:BNBUSDT',
    'XRPUSD': 'BITSTAMP:XRPUSD',
    'XRPUSDT': 'BINANCE:XRPUSDT',
    'DOGEUSD': 'COINBASE:DOGEUSD',
    'DOGEUSDT': 'BINANCE:DOGEUSDT',
    'ADAUSD': 'COINBASE:ADAUSD',
    'ADAUSDT': 'BINANCE:ADAUSDT',
    'AVAXUSD': 'COINBASE:AVAXUSD',
    'AVAXUSDT': 'BINANCE:AVAXUSDT',
    'LINKUSD': 'COINBASE:LINKUSD',
    'LINKUSDT': 'BINANCE:LINKUSDT',
    'SUIUSDT': 'BINANCE:SUIUSDT',
    'PEPEUSDT': 'BINANCE:PEPEUSDT',
    'NEARUSDT': 'BINANCE:NEARUSDT',
    'XAUUSD': 'OANDA:XAUUSD',
    'GOLD': 'OANDA:XAUUSD',
    'XAGUSD': 'OANDA:XAGUSD',
    'SILVER': 'OANDA:XAGUSD',
    'WTIUSD': 'TVC:USOIL',
    'USOIL': 'TVC:USOIL',
    'CRUDE': 'TVC:USOIL',
    'BRENT': 'TVC:UKOIL',
    'UKOIL': 'TVC:UKOIL',
    'NATGAS': 'TVC:NATGAS',
    'COPPER': 'COMEX:HG1!',
    'PLATINUM': 'TVC:PLATINUM',
    'EURUSD': 'FX:EURUSD',
    'GBPUSD': 'FX:GBPUSD',
    'USDJPY': 'FX:USDJPY',
    'AUDUSD': 'FX:AUDUSD',
    'USDCAD': 'FX:USDCAD',
    'USDCHF': 'FX:USDCHF',
    'NZDUSD': 'FX:NZDUSD',
    'EURGBP': 'FX:EURGBP',
    'EURJPY': 'FX:EURJPY',
    'GBPJPY': 'FX:GBPJPY',
    'SPX': 'FOREXCOM:SPXUSD',
    'US500': 'FOREXCOM:SPXUSD',
    'SPY': 'AMEX:SPY',
    'NDX': 'FOREXCOM:NSXUSD',
    'US100': 'FOREXCOM:NSXUSD',
    'QQQ': 'NASDAQ:QQQ',
    'DJI': 'FOREXCOM:DJI',
    'US30': 'FOREXCOM:DJI',
    'DIA': 'AMEX:DIA',
    'AAPL': 'NASDAQ:AAPL',
    'NVDA': 'NASDAQ:NVDA',
    'TSLA': 'NASDAQ:TSLA',
    'MSFT': 'NASDAQ:MSFT',
    'GOOGL': 'NASDAQ:GOOGL',
    'AMZN': 'NASDAQ:AMZN',
    'META': 'NASDAQ:META',
    'AMD': 'NASDAQ:AMD',
    'MSTR': 'NASDAQ:MSTR',
    'COIN': 'NASDAQ:COIN'
  };
  
  if (map[s]) return map[s];
  if (s.endsWith('USDT') || s.endsWith('PERP')) return `BINANCE:${s}`;
  if (s.endsWith('USD')) return `COINBASE:${s}`;
  if (s.length === 6 && (s.endsWith('JPY') || s.endsWith('CHF') || s.endsWith('CAD') || s.endsWith('GBP') || s.endsWith('AUD'))) return `FX:${s}`;
  return `BINANCE:${s}USDT`;
}

// Full Master Tradable Assets Catalog
const ALL_ASSETS = [
  // Crypto Spot USD (Coinbase / Bitstamp) & Crypto Futures USDT (Binance)
  { symbol: 'BTCUSD', name: 'Bitcoin Spot USD', category: 'Crypto', tvSymbol: 'COINBASE:BTCUSD', defaultPrice: 86502.00 },
  { symbol: 'BTCUSDT', name: 'Bitcoin / TetherUS', category: 'Crypto', tvSymbol: 'BINANCE:BTCUSDT', defaultPrice: 86502.00 },
  { symbol: 'ETHUSD', name: 'Ethereum Spot USD', category: 'Crypto', tvSymbol: 'COINBASE:ETHUSD', defaultPrice: 2748.41 },
  { symbol: 'ETHUSDT', name: 'Ethereum / TetherUS', category: 'Crypto', tvSymbol: 'BINANCE:ETHUSDT', defaultPrice: 2748.41 },
  { symbol: 'SOLUSD', name: 'Solana Spot USD', category: 'Crypto', tvSymbol: 'COINBASE:SOLUSD', defaultPrice: 154.20 },
  { symbol: 'SOLUSDT', name: 'Solana / TetherUS', category: 'Crypto', tvSymbol: 'BINANCE:SOLUSDT', defaultPrice: 154.20 },
  { symbol: 'BNBUSDT', name: 'BNB / TetherUS', category: 'Crypto', tvSymbol: 'BINANCE:BNBUSDT', defaultPrice: 585.50 },
  { symbol: 'XRPUSD', name: 'Ripple Spot USD', category: 'Crypto', tvSymbol: 'BITSTAMP:XRPUSD', defaultPrice: 0.585 },
  { symbol: 'XRPUSDT', name: 'Ripple / TetherUS', category: 'Crypto', tvSymbol: 'BINANCE:XRPUSDT', defaultPrice: 0.585 },
  { symbol: 'DOGEUSD', name: 'Dogecoin Spot USD', category: 'Crypto', tvSymbol: 'COINBASE:DOGEUSD', defaultPrice: 0.125 },
  { symbol: 'ADAUSD', name: 'Cardano Spot USD', category: 'Crypto', tvSymbol: 'COINBASE:ADAUSD', defaultPrice: 0.354 },
  { symbol: 'AVAXUSD', name: 'Avalanche Spot USD', category: 'Crypto', tvSymbol: 'COINBASE:AVAXUSD', defaultPrice: 28.40 },
  { symbol: 'LINKUSD', name: 'Chainlink Spot USD', category: 'Crypto', tvSymbol: 'COINBASE:LINKUSD', defaultPrice: 12.10 },
  { symbol: 'SUIUSDT', name: 'Sui / TetherUS', category: 'Crypto', tvSymbol: 'BINANCE:SUIUSDT', defaultPrice: 1.82 },
  { symbol: 'PEPEUSDT', name: 'Pepe / TetherUS', category: 'Crypto', tvSymbol: 'BINANCE:PEPEUSDT', defaultPrice: 0.000010 },

  // Commodities (Spot & Futures)
  { symbol: 'XAUUSD', name: 'Gold Spot / USD', category: 'Commodities', tvSymbol: 'OANDA:XAUUSD', defaultPrice: 2654.40 },
  { symbol: 'GOLD', name: 'Gold Continuous Contract', category: 'Commodities', tvSymbol: 'OANDA:XAUUSD', defaultPrice: 2654.40 },
  { symbol: 'XAGUSD', name: 'Silver Spot / USD', category: 'Commodities', tvSymbol: 'OANDA:XAGUSD', defaultPrice: 31.80 },
  { symbol: 'SILVER', name: 'Silver Continuous', category: 'Commodities', tvSymbol: 'OANDA:XAGUSD', defaultPrice: 31.80 },
  { symbol: 'WTIUSD', name: 'Crude Oil WTI Spot', category: 'Commodities', tvSymbol: 'TVC:USOIL', defaultPrice: 71.85 },
  { symbol: 'BRENT', name: 'Brent Crude Oil Spot', category: 'Commodities', tvSymbol: 'TVC:UKOIL', defaultPrice: 75.40 },
  { symbol: 'NATGAS', name: 'Natural Gas Spot', category: 'Commodities', tvSymbol: 'TVC:NATGAS', defaultPrice: 2.85 },
  { symbol: 'COPPER', name: 'High Grade Copper', category: 'Commodities', tvSymbol: 'COMEX:HG1!', defaultPrice: 4.52 },
  { symbol: 'PLATINUM', name: 'Platinum Spot / USD', category: 'Commodities', tvSymbol: 'TVC:PLATINUM', defaultPrice: 980.50 },

  // Forex Major & Crosses
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'Forex', tvSymbol: 'FX:EURUSD', defaultPrice: 1.0848 },
  { symbol: 'GBPUSD', name: 'British Pound / USD', category: 'Forex', tvSymbol: 'FX:GBPUSD', defaultPrice: 1.3032 },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'Forex', tvSymbol: 'FX:USDJPY', defaultPrice: 148.82 },
  { symbol: 'AUDUSD', name: 'Australian Dollar / USD', category: 'Forex', tvSymbol: 'FX:AUDUSD', defaultPrice: 0.6724 },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'Forex', tvSymbol: 'FX:USDCAD', defaultPrice: 1.3540 },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'Forex', tvSymbol: 'FX:USDCHF', defaultPrice: 0.8650 },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / USD', category: 'Forex', tvSymbol: 'FX:NZDUSD', defaultPrice: 0.6080 },
  { symbol: 'EURJPY', name: 'Euro / Japanese Yen', category: 'Forex', tvSymbol: 'FX:EURJPY', defaultPrice: 161.40 },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', category: 'Forex', tvSymbol: 'FX:GBPJPY', defaultPrice: 194.10 },

  // Global Indices & Benchmark ETFs
  { symbol: 'SPX', name: 'S&P 500 Index', category: 'Indices', tvSymbol: 'FOREXCOM:SPXUSD', defaultPrice: 5750.20 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'Indices', tvSymbol: 'AMEX:SPY', defaultPrice: 574.80 },
  { symbol: 'NDX', name: 'Nasdaq 100 Index', category: 'Indices', tvSymbol: 'FOREXCOM:NSXUSD', defaultPrice: 20050.40 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)', category: 'Indices', tvSymbol: 'NASDAQ:QQQ', defaultPrice: 488.60 },
  { symbol: 'DJI', name: 'Dow Jones Industrial Average', category: 'Indices', tvSymbol: 'FOREXCOM:DJI', defaultPrice: 42350.00 },

  // Equities & Tech Megacaps
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Equities', tvSymbol: 'NASDAQ:NVDA', defaultPrice: 124.60 },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Equities', tvSymbol: 'NASDAQ:AAPL', defaultPrice: 228.50 },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Equities', tvSymbol: 'NASDAQ:TSLA', defaultPrice: 254.20 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Equities', tvSymbol: 'NASDAQ:MSFT', defaultPrice: 418.00 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', category: 'Equities', tvSymbol: 'NASDAQ:GOOGL', defaultPrice: 168.40 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Equities', tvSymbol: 'NASDAQ:AMZN', defaultPrice: 186.50 },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Equities', tvSymbol: 'NASDAQ:META', defaultPrice: 585.00 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Equities', tvSymbol: 'NASDAQ:AMD', defaultPrice: 156.20 },
  { symbol: 'MSTR', name: 'MicroStrategy Inc.', category: 'Equities', tvSymbol: 'NASDAQ:MSTR', defaultPrice: 190.50 },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', category: 'Equities', tvSymbol: 'NASDAQ:COIN', defaultPrice: 182.40 }
];

export default function TradingPage() {
  const { balance, positions, placeOrder, closePosition, resetAccount } = useTrading();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Persistent Active Symbol Selection
  const [symbol, setSymbol] = useState(() => {
    const urlSym = searchParams.get('symbol');
    if (urlSym) return urlSym.toUpperCase();
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stocksoperator_active_symbol') || 'BTCUSDT';
    }
    return 'BTCUSDT';
  });

  const [currentPrice, setCurrentPrice] = useState(86502.00);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const [showTradeTicket, setShowTradeTicket] = useState(true);
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);
  const chartTerminalRef = useRef(null);

  // Responsive mobile detection
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 900 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // References for TradingView widget and symbol change tracking
  const widgetRef = useRef(null);
  const skipNextWidgetReloadRef = useRef(false);
  const symbolRef = useRef(symbol);

  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  const toggleChartFullscreen = () => {
    setIsChartFullscreen(prev => {
      const next = !prev;
      if (next && !isMobile && chartTerminalRef.current?.requestFullscreen) {
        chartTerminalRef.current.requestFullscreen().catch(() => {});
      } else if (!next && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      return next;
    });
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isMobile) {
        setIsChartFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isMobile]);

  const [aiInsightText, setAiInsightText] = useState('Institutional order flow indicates key support consolidation. Maintain strict Stop Loss invalidation levels.');
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  // Active asset match (falls back to dynamic asset so any symbol e.g. BTCUSD, custom tickers work)
  const activeAsset = useMemo(() => {
    const found = ALL_ASSETS.find(a => a.symbol === symbol);
    if (found) return found;
    return {
      symbol: symbol,
      name: `${symbol} Spot/Perp`,
      category: ['EURUSD','GBPUSD','USDJPY','AUDUSD','USDCAD','USDCHF','NZDUSD'].includes(symbol) ? 'Forex' : (symbol.startsWith('XAU') || symbol.startsWith('XAG') || symbol.startsWith('WTI') ? 'Commodities' : 'Crypto'),
      tvSymbol: resolveTradingViewSymbol(symbol),
      defaultPrice: currentPrice || 100.00
    };
  }, [symbol, currentPrice]);

  // Clean raw TradingView symbol string (e.g. "BINANCE:BTCUSDT", "COINBASE:BTCUSD", "OANDA:XAUUSD", "BTCUSD1") into standard app symbol
  function cleanTVSymbolToAppSymbol(raw) {
    if (!raw || typeof raw !== 'string') return null;
    let s = raw.trim();
    if (s.includes(':')) {
      s = s.split(':')[1];
    }
    s = s.replace(/\s+/g, '').toUpperCase();
    
    // Specific mappings
    if (s === 'USOIL' || s === 'CRUDE') return 'WTIUSD';
    if (s === 'UKOIL') return 'BRENT';
    if (s === 'GC=F' || s === 'XAU' || s === 'GOLD') return 'XAUUSD';
    if (s === 'SI=F' || s === 'XAG' || s === 'SILVER') return 'XAGUSD';
    if (s === 'BTCUSD1' || s === 'BTCUSD') return 'BTCUSD';
    if (s === 'BTCUSDT' || s === 'BTCUSDT.P') return 'BTCUSDT';
    if (s === 'ETHUSD1' || s === 'ETHUSD') return 'ETHUSD';

    // Exact match from master asset catalog
    const found = ALL_ASSETS.find(a => a.symbol.toUpperCase() === s);
    if (found) return found.symbol;

    return s;
  }

  // Persist symbol selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stocksoperator_active_symbol', symbol);
    }
  }, [symbol]);

  // Handle URL param changes
  useEffect(() => {
    const urlSym = searchParams.get('symbol');
    if (urlSym && urlSym.toUpperCase() !== symbol) {
      setSymbol(urlSym.toUpperCase());
    }
  }, [searchParams]);

  // Filter assets for search dropdown
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return ALL_ASSETS;
    const q = searchQuery.toLowerCase().trim();
    return ALL_ASSETS.filter(a => 
      a.symbol.toLowerCase().includes(q) || 
      a.name.toLowerCase().includes(q) || 
      a.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Click outside search dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── 1. REAL-TIME ONGOING PRICE ENGINE (Every 1.5s for Active Asset) ───
  useEffect(() => {
    let isMounted = true;

    async function fetchLiveOngoingPrice() {
      try {
        const clean = symbol.toUpperCase().trim();

        // 1. If Crypto, query Binance public ticker for instant sub-second real-time quotes matching chart
        const isCrypto = clean.endsWith('USDT') || clean.endsWith('USD') || 
          ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'SUI', 'PEPE'].some(c => clean.startsWith(c));
        
        if (isCrypto && !clean.startsWith('XAU') && !clean.startsWith('XAG') && !clean.startsWith('WTI')) {
          let binanceSym = clean;
          if (binanceSym.endsWith('USD') && !binanceSym.endsWith('USDT')) {
            binanceSym = `${binanceSym}T`; // e.g. BTCUSD -> BTCUSDT
          }
          if (!binanceSym.endsWith('USDT')) {
            binanceSym = `${binanceSym}USDT`;
          }

          try {
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSym}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.price && isMounted) {
                const parsed = parseFloat(data.price);
                if (!isNaN(parsed) && parsed > 0) {
                  setCurrentPrice(parsed);
                  return;
                }
              }
            }
          } catch (bErr) {
            // fallback to backend
          }
        }

        // 2. Query backend live quote endpoint for commodities (Gold, Silver, Oil), forex & equities
        const apiUrl = (
          import.meta.env.VITE_API_URL ||
          (import.meta.env.DEV
            ? 'http://localhost:3000'
            : window.location.origin)
        ).replace(/\/$/, '').replace(/\/api$/, '');
        const res = await fetch(`${apiUrl}/api/market/quote/${clean}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.price && isMounted) {
            const parsed = parseFloat(data.price);
            if (!isNaN(parsed) && parsed > 0) {
              setCurrentPrice(parsed);
              return;
            }
          }
        }
      } catch (err) {
        // preserve current price
      }
    }

    fetchLiveOngoingPrice();
    const priceInterval = setInterval(fetchLiveOngoingPrice, 1500);

    return () => {
      isMounted = false;
      clearInterval(priceInterval);
    };
  }, [symbol]);

  // Query AI insight when symbol changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAiInsightLoading(true);
      const apiOrigin = (
        import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV
          ? 'http://localhost:3000'
          : window.location.origin)
      ).replace(/\/$/, '').replace(/\/api$/, '');

      fetch(`${apiOrigin}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `Provide a 2-sentence institutional trade insight for ${symbol} at current price $${currentPrice}. State key momentum, immediate risk invalidation, and trailing stop tip.`,
          marketData: {
            symbol,
            currentPrice: activeAsset?.defaultPrice || currentPrice,
            timeframe: '15m'
          },
          isBackground: true,
          isTickerInsight: true,
          skipHistory: true
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.response) {
            const cleanText = data.response.replace(/###/g, '').replace(/\*\*/g, '').replace(/Disclaimer:[\s\S]*/i, '').trim();
            setAiInsightText(cleanText.slice(0, 180));
          }
        })
        .catch(() => {
          setAiInsightText(`Institutional liquidity on ${symbol} shows high participation near $${currentPrice.toFixed(2)}. Invalidate setups beyond nearest support.`);
        })
        .finally(() => setAiInsightLoading(false));
    }
  }, [symbol]);

  // ─── 2. BI-DIRECTIONAL TRADINGVIEW CHART SYNC ───
  // Detects when user changes asset from inside TradingView chart search modal
  useEffect(() => {
    // A. Listen for window postMessages from TradingView iframe
    const handleTVMessage = (e) => {
      try {
        let data = e.data;
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (err) {}
        }
        if (!data) return;

        // Quote update from TV
        if (data.name === 'quoteUpdate' && data.data) {
          const q = data.data;
          const p = parseFloat(q.last_price || q.price || q.bid || q.ask);
          if (!isNaN(p) && p > 0) {
            setCurrentPrice(p);
          }
        }

        // Symbol change event
        if (data.name === 'symbolChange' || data.name === 'onSymbolChange' || data.name === 'headerSymbolChange' || data.event === 'symbolChange' || data.type === 'symbol_change') {
          const raw = data.data?.symbol || data.data?.ticker || data.symbol || data.ticker;
          if (raw && typeof raw === 'string') {
            const clean = cleanTVSymbolToAppSymbol(raw);
            if (clean && clean !== symbolRef.current) {
              skipNextWidgetReloadRef.current = true;
              setSymbol(clean);
              toast.success(`Chart Synced: ${clean}`);
            }
          }
        }
      } catch (err) {}
    };

    window.addEventListener('message', handleTVMessage);

    // B. Poll widget.getSymbolInfo every 1.5 seconds
    const symInterval = setInterval(() => {
      if (widgetRef.current && widgetRef.current.getSymbolInfo) {
        try {
          widgetRef.current.getSymbolInfo((info) => {
            if (info && (info.ticker || info.name || info.symbol)) {
              const raw = info.ticker || info.name || info.symbol;
              const clean = cleanTVSymbolToAppSymbol(raw);
              if (clean && clean !== symbolRef.current) {
                skipNextWidgetReloadRef.current = true;
                setSymbol(clean);
                toast.success(`Chart Synced: ${clean}`);
              }
            }
          });
        } catch (e) {}
      }
    }, 1500);

    return () => {
      window.removeEventListener('message', handleTVMessage);
      clearInterval(symInterval);
    };
  }, []);

  // Official TradingView Widget Integration (Self-Fetching Live Feed & Saved Tools/Drawings)
  useEffect(() => {
    // If the symbol change was initiated from inside TradingView chart, skip re-instantiating the widget!
    if (skipNextWidgetReloadRef.current) {
      skipNextWidgetReloadRef.current = false;
      return;
    }

    const containerId = 'tv_chart_container';
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        const tvWidget = new window.TradingView.widget({
          autosize: true,
          symbol: activeAsset.tvSymbol,
          interval: '15',
          timezone: 'exchange',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#ffffff',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: true,
          container_id: containerId,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies'
          ]
        });

        widgetRef.current = tvWidget;

        if (tvWidget.subscribeToQuote) {
          try {
            tvWidget.subscribeToQuote((quote) => {
              if (quote && (quote.last_price || quote.price || quote.bid)) {
                const p = parseFloat(quote.last_price || quote.price || quote.bid);
                if (!isNaN(p) && p > 0) setCurrentPrice(p);
              }
            });
          } catch(e) {}
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script tag if needed
    };
  }, [symbol, activeAsset.tvSymbol]);

  // Select asset handler
  const handleSelectAsset = (asset) => {
    setSymbol(asset.symbol);
    setCurrentPrice(asset.defaultPrice);
    setIsSearchOpen(false);
    setSearchQuery('');
    toast.success(`Active Chart: ${asset.symbol} (${asset.name})`);
  };

  // Screener 1-click select
  const handleSelectScreenerAsset = (asset) => {
    let targetSym = 'BTCUSDT';
    if (asset.symbol === 'BTC-USD') targetSym = 'BTCUSDT';
    else if (asset.symbol === 'GC=F') targetSym = 'XAUUSD';
    else if (asset.symbol === 'EURUSD=X') targetSym = 'EURUSD';
    else if (asset.symbol === 'GBPUSD=X') targetSym = 'GBPUSD';
    else if (asset.symbol === 'USDJPY=X') targetSym = 'USDJPY';
    else if (asset.symbol === 'AUDUSD=X') targetSym = 'AUDUSD';
    else if (asset.symbol === 'USDCAD=X') targetSym = 'USDCAD';
    else targetSym = (asset.badge || asset.symbol).replace(/[\/\-=]/g, '');

    const found = ALL_ASSETS.find(a => a.symbol === targetSym) || {
      symbol: targetSym,
      name: asset.name,
      category: 'Market',
      tvSymbol: `BINANCE:${targetSym}`,
      defaultPrice: asset.price
    };

    handleSelectAsset(found);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      padding: isMobile ? '12px 8px' : '24px', 
      maxWidth: '1440px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '16px' : '28px', 
      fontFamily: 'Inter, sans-serif' 
    }}>
      
      {/* ─── 1. TOP ACCOUNT BAR ─── */}
      <div style={{
        background: '#FFFFFF',
        padding: isMobile ? '14px 16px' : '18px 28px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: isMobile ? '12px' : '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', gap: isMobile ? '14px 20px' : '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>PROVING CAPITAL</div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '900', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
              ${Number(balance || 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>MAX LEVERAGE</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '800', color: '#EA580C' }}>50x Unlocked</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>FREE MARGIN</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
              ${Number(balance || 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>OPEN POSITIONS</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '800', color: '#0F172A' }}>{positions.length}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => {
              if (window.confirm('Reset virtual portfolio back to $1,000 proving baseline?')) resetAccount(false);
            }}
            style={{
              padding: '8px 14px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#334155'
            }}
          >
            <RotateCcw size={13} /> Reset Capital
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN TRADING TERMINAL ─── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : (showTradeTicket ? 'minmax(0, 1fr) 350px' : '1fr'), 
        gap: isMobile ? '16px' : '24px', 
        alignItems: 'start' 
      }}>
        
        {/* Left: Terminal Chart Container (Vertical Full Screen Mobile Support) */}
        <div 
          ref={chartTerminalRef}
          style={{
            position: isChartFullscreen ? 'fixed' : 'relative',
            top: isChartFullscreen ? 0 : 'auto',
            left: isChartFullscreen ? 0 : 'auto',
            right: isChartFullscreen ? 0 : 'auto',
            bottom: isChartFullscreen ? 0 : 'auto',
            width: isChartFullscreen ? '100vw' : '100%',
            height: isChartFullscreen ? '100vh' : 'auto',
            zIndex: isChartFullscreen ? 99999 : 1,
            background: '#FFFFFF',
            borderRadius: isChartFullscreen ? 0 : '16px',
            border: isChartFullscreen ? 'none' : '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: isChartFullscreen ? 'none' : '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          
          {/* Chart Header Bar: Unified Instant Search */}
          <div style={{
            padding: isMobile ? '10px 12px' : '14px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: isMobile ? '10px' : '14px',
            background: '#FAFAFA'
          }}>
            
            {/* Single Unified Search Bar with Autocomplete Dropdown */}
            <div ref={searchContainerRef} style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
              <div 
                onClick={() => setIsSearchOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  border: isSearchOpen ? '2px solid #EA580C' : '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.2s'
                }}
              >
                <Search size={16} color="#64748B" style={{ marginRight: '10px', flexShrink: 0 }} />
                
                {isSearchOpen ? (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search asset (e.g. BTC, ETH, Gold, EURUSD, AAPL)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      background: 'transparent'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '11px',
                        padding: '2px 7px',
                        borderRadius: '4px'
                      }}>
                        {activeAsset.symbol}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {activeAsset.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      {activeAsset.category}
                    </span>
                  </div>
                )}

                {isSearchOpen && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#94A3B8' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Autocomplete Search Dropdown */}
              {isSearchOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  zIndex: 200,
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}>
                  {/* Dynamic Custom Ticker Option */}
                  {searchQuery.trim() && !filteredAssets.some(a => a.symbol.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                    <div
                      onClick={() => {
                        const clean = searchQuery.trim().toUpperCase();
                        const customAsset = {
                          symbol: clean,
                          name: `${clean} (TradingView Asset)`,
                          category: 'Custom Asset',
                          tvSymbol: resolveTradingViewSymbol(clean),
                          defaultPrice: currentPrice || 100.00
                        };
                        handleSelectAsset(customAsset);
                      }}
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: '#FFF7ED',
                        borderBottom: '1.5px solid #FED7AA',
                        transition: 'background 0.15s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#FFEDD5'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#FFF7ED'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} color="#C2410C" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#7C2D12' }}>
                            Open "{searchQuery.trim().toUpperCase()}" in Arena & Chart
                          </div>
                          <div style={{ fontSize: '11px', color: '#9A3412' }}>
                            Live institutional TradingView feed ({resolveTradingViewSymbol(searchQuery.trim().toUpperCase())})
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#EA580C', color: '#fff', padding: '4px 10px', borderRadius: '6px' }}>
                        TRADE
                      </span>
                    </div>
                  )}

                  {filteredAssets.length === 0 && !searchQuery.trim() ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                      No matching tradable instruments found.
                    </div>
                  ) : (
                    filteredAssets.map(asset => (
                      <div
                        key={asset.symbol}
                        onClick={() => handleSelectAsset(asset)}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderBottom: '1px solid #F1F5F9',
                          background: asset.symbol === symbol ? '#FFF7ED' : '#FFFFFF',
                          transition: 'background 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = asset.symbol === symbol ? '#FFF7ED' : '#FFFFFF'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            fontWeight: 900,
                            fontSize: '11px',
                            color: '#0F172A'
                          }}>
                            {asset.symbol}
                          </span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              {asset.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {asset.category}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C' }}>
                            View Chart
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Chart Control Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowTradeTicket(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: '#EA580C',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
                  transition: 'all 0.15s'
                }}
              >
                <Zap size={14} />
                <span>{showTradeTicket ? 'Hide Ticket' : `Trade ${symbol}`}</span>
              </button>

              {/* Fullscreen Chart Button (TradingView Mobile App Vertical Fullscreen Mode) */}
              <button
                onClick={toggleChartFullscreen}
                title={isChartFullscreen ? 'Exit Full Screen' : 'Full Screen Chart (TradingView App Mode)'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: isChartFullscreen ? '#0F172A' : '#FFFFFF',
                  color: isChartFullscreen ? '#FFFFFF' : '#0F172A',
                  borderRadius: '8px',
                  border: isChartFullscreen ? '1px solid #0F172A' : '1px solid #CBD5E1',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s'
                }}
              >
                {isChartFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>{isChartFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
              </button>

              {/* TradingView Verified Feed Badge */}
              <div style={{
                display: isMobile && isChartFullscreen ? 'none' : 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#FFF7ED',
                borderRadius: '8px',
                border: '1px solid #FED7AA',
                fontSize: '12px',
                fontWeight: 800,
                color: '#9A3412'
              }}>
                <Activity size={14} color="#9A3412" />
                <span>TradingView Pro Feed</span>
              </div>
            </div>
          </div>

          {/* Chart Canvas Area - Expands vertically like TradingView Mobile App */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: isChartFullscreen 
              ? (isMobile ? 'calc(100vh - 64px)' : 'calc(100vh - 120px)') 
              : (isMobile ? '500px' : '580px'), 
            background: '#FFFFFF' 
          }}>
            <div 
              id="tv_chart_container" 
              style={{ width: '100%', height: '100%' }}
            />

            {/* In-Chart Floating Trade Modal for Fullscreen View */}
            {isChartFullscreen && showTradeTicket && (
              <div style={{
                position: 'absolute',
                bottom: isMobile ? '10px' : '20px',
                right: isMobile ? '10px' : '20px',
                left: isMobile ? '10px' : 'auto',
                width: isMobile ? 'auto' : '360px',
                maxHeight: isMobile ? '75vh' : '85vh',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                borderRadius: '16px'
              }}>
                <ExecutionTicket 
                  symbol={symbol}
                  currentPrice={currentPrice}
                  balance={balance}
                  onPlaceOrder={placeOrder}
                  onClose={() => setShowTradeTicket(false)}
                />
              </div>
            )}
          </div>

          {/* AI Mentor Trade Insight Bar */}
          <div style={{
            padding: isMobile ? '12px 14px' : '16px 20px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#EA580C" />
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  AI MENTOR TRADING INSIGHT
                </span>
              </div>
              <span style={{ fontSize: '10px', background: '#FFF7ED', color: '#C2410C', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                GROQ LLaMA 3.3
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
              {aiInsightLoading ? (
                <span style={{ color: '#94A3B8' }}>Consulting Groq Quant Engine for {symbol}...</span>
              ) : (
                aiInsightText
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
                Risk Level: <span style={{ color: '#EA580C', fontWeight: '800' }}>Low / Disciplined</span>
              </div>
              <button
                onClick={() => navigate(`/ai-mentor?symbol=${symbol}`)}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Full Chat</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right / Below on Mobile: Institutional Order Ticket */}
        {showTradeTicket && !isChartFullscreen && (
          <div style={{ 
            position: isMobile ? 'relative' : 'sticky', 
            top: isMobile ? 'auto' : '80px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '350px'
          }}>
            <ExecutionTicket 
              symbol={symbol}
              currentPrice={currentPrice}
              balance={balance}
              onPlaceOrder={placeOrder}
              onClose={() => setShowTradeTicket(false)}
            />
          </div>
        )}
      </div>

      {/* ─── 3. ACTIVE WORKING TRADES & OPEN POSITIONS ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#EA580C" /> Current Working Trades ({positions.length})
          </h3>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
            Live Unrealized PnL Updated in Real-Time
          </span>
        </div>

        {positions.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600', margin: '0 0 10px 0' }}>
              No active trades working right now.
            </p>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              Select an asset above and configure your ticket to execute your next proving trade.
            </span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 14px' }}>ASSET</th>
                  <th style={{ padding: '12px 14px' }}>SIDE</th>
                  <th style={{ padding: '12px 14px' }}>SIZE</th>
                  <th style={{ padding: '12px 14px' }}>ENTRY PRICE</th>
                  <th style={{ padding: '12px 14px' }}>MARK PRICE</th>
                  <th style={{ padding: '12px 14px' }}>LEVERAGE</th>
                  <th style={{ padding: '12px 14px' }}>STOP LOSS</th>
                  <th style={{ padding: '12px 14px' }}>TAKE PROFIT</th>
                  <th style={{ padding: '12px 14px' }}>UNREALIZED PNL</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(p => {
                  const mark = currentPrice;
                  const isLong = p.side === 'LONG';
                  const priceDiff = isLong ? (mark - p.entryPrice) : (p.entryPrice - mark);
                  const pnl = priceDiff * p.size;
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px', fontWeight: '800', color: '#0F172A' }}>{p.asset}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: p.side === 'LONG' ? '#FFF7ED' : '#FEF2F2',
                          color: p.side === 'LONG' ? '#C2410C' : '#DC2626'
                        }}>
                          {p.side}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{p.size}</td>
                      <td style={{ padding: '14px', fontFamily: 'var(--font-mono)' }}>${p.entryPrice?.toFixed(2)}</td>
                      <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>${mark.toFixed(2)}</td>
                      <td style={{ padding: '14px', fontWeight: '800', color: '#64748B' }}>{p.leverage}x</td>
                      <td style={{ padding: '14px', color: p.sl ? '#EF4444' : '#94A3B8', fontWeight: '700' }}>
                        {p.sl ? `$${p.sl}` : 'None'}
                      </td>
                      <td style={{ padding: '14px', color: p.tp ? '#EA580C' : '#94A3B8', fontWeight: '700' }}>
                        {p.tp ? `$${p.tp}` : 'None'}
                      </td>
                      <td style={{ padding: '14px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: isProfit ? '#EA580C' : '#EF4444' }}>
                        {isProfit ? '+' : ''}${pnl.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          onClick={() => closePosition(p.id, mark)}
                          style={{
                            padding: '6px 14px',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontWeight: '800',
                            fontSize: '12px',
                            color: '#0F172A',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 4. LIVE MARKET SCREENER (1-CLICK DIRECT LOAD) ─── */}
      <LiveMarketScreener onSelectAsset={handleSelectScreenerAsset} />

    </div>
  );
}
