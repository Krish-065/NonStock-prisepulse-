import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/api';
import SearchWithSuggestions from '../components/SearchWithSuggestions';
import { 
  TrendingUp, TrendingDown, Newspaper, Search, Activity, 
  Sparkles, PieChart, ArrowRight, Zap, Layers, BarChart2, 
  Flame, LineChart, Globe, DollarSign, Clock, ChevronRight,
  ArrowUpRight, ArrowDownRight, Coins, Cpu, RefreshCw,
  Gauge, ExternalLink, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Smooth SVG Sparkline component
const Sparkline = ({ points, color = '#10b981', height = 34, width = 110 }) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
    <defs>
      <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
        <stop offset="100%" stopColor={color} stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <path
      d={points}
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Fallback baseline international benchmark data
const DEFAULT_GLOBAL_INDICES = {
  '^GSPC': { name: 'S&P 500', region: 'US', price: 5635.80, change: 48.20, changePercent: 0.86, spark: 'M 0,26 Q 25,18 55,20 T 110,6' },
  '^IXIC': { name: 'NASDAQ 100', region: 'US', price: 17892.40, change: 215.30, changePercent: 1.22, spark: 'M 0,28 Q 30,14 60,16 T 110,4' },
  '^DJI': { name: 'DOW JONES', region: 'US', price: 41320.10, change: 165.40, changePercent: 0.40, spark: 'M 0,22 Q 35,24 70,12 T 110,8' },
  'BTC-USD': { name: 'BITCOIN', region: 'Global', price: 64850.00, change: 1420.00, changePercent: 2.24, spark: 'M 0,30 Q 30,12 65,18 T 110,5' },
  'ETH-USD': { name: 'ETHEREUM', region: 'Global', price: 3485.50, change: 95.20, changePercent: 2.81, spark: 'M 0,29 Q 28,15 62,20 T 110,6' },
  'SOL-USD': { name: 'SOLANA', region: 'Global', price: 158.40, change: 6.80, changePercent: 4.49, spark: 'M 0,31 Q 30,10 65,14 T 110,3' },
  'GC=F': { name: 'GOLD COMEX', region: 'Commodity', price: 2518.60, change: 16.40, changePercent: 0.65, spark: 'M 0,24 Q 30,16 60,18 T 110,8' },
  'CL=F': { name: 'CRUDE OIL WTI', region: 'Commodity', price: 78.65, change: -0.85, changePercent: -1.07, spark: 'M 0,8 Q 30,20 65,16 T 110,28' },
  'EURUSD=X': { name: 'EUR / USD', region: 'Forex', price: 1.1062, change: 0.0024, changePercent: 0.22, spark: 'M 0,18 Q 35,22 70,14 T 110,12' },
};

// Curated Wall Street & International Quant Research Insights
const INTERNATIONAL_QUANT_SIGNALS = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    assetClass: 'US Tech Titan',
    score: '96/100',
    signal: 'Strong Bullish',
    price: '$128.40',
    change: '+4.25%',
    isPositive: true,
    target: '$148.00',
    stoploss: '$119.50',
    institutionalFlow: '+$1.85B Net Inflow (Block Trades)',
    technicalPattern: 'Golden Crossover & Blackwell AI Supercycle',
    category: 'macd',
    spark: 'M 0,28 Q 30,10 60,16 T 110,4'
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetClass: 'US Mega Cap',
    score: '92/100',
    signal: 'Bullish Breakout',
    price: '$228.30',
    change: '+1.40%',
    isPositive: true,
    target: '$246.00',
    stoploss: '$219.00',
    institutionalFlow: '+$940M Institutional Accumulation',
    technicalPattern: 'Multi-week Cup & Handle Breakout',
    category: 'sma',
    spark: 'M 0,24 Q 30,18 60,12 T 110,6'
  },
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin Digital Gold',
    assetClass: 'Cryptocurrency',
    score: '94/100',
    signal: 'Accumulation Surge',
    price: '$64,850.00',
    change: '+2.80%',
    isPositive: true,
    target: '$72,500.00',
    stoploss: '$61,200.00',
    institutionalFlow: '+$1.20B Spot ETF Net Weekly Intake',
    technicalPattern: 'Wyckoff Spring & 200d SMA Bounce',
    category: 'rsi',
    spark: 'M 0,30 Q 25,12 65,16 T 110,4'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    assetClass: 'Auto / AI Robotics',
    score: '88/100',
    signal: 'Momentum Reversal',
    price: '$224.60',
    change: '+2.45%',
    isPositive: true,
    target: '$255.00',
    stoploss: '$208.00',
    institutionalFlow: '+$680M Options Gamma Squeeze',
    technicalPattern: 'Inverted Head & Shoulders Neckline Test',
    category: 'volume',
    spark: 'M 0,26 Q 30,12 60,18 T 110,6'
  },
  {
    symbol: 'SOL-USD',
    name: 'Solana Layer 1',
    assetClass: 'High-Beta Crypto',
    score: '91/100',
    signal: 'High Velocity Breakout',
    price: '$158.80',
    change: '+3.90%',
    isPositive: true,
    target: '$190.00',
    stoploss: '$142.00',
    institutionalFlow: '+$420M DEX Volume & TVL Record',
    technicalPattern: 'Ascending Triangle Breakout with Volume Surge',
    category: 'volume',
    spark: 'M 0,32 Q 35,14 65,18 T 110,3'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp',
    assetClass: 'Cloud & AI Enterprise',
    score: '90/100',
    signal: 'Steady Accumulation',
    price: '$432.80',
    change: '+1.20%',
    isPositive: true,
    target: '$465.00',
    stoploss: '$418.00',
    institutionalFlow: '+$780M Azure Enterprise Cloud Flow',
    technicalPattern: '50-Day EMA Dynamic Support Rebound',
    category: 'sma',
    spark: 'M 0,22 Q 30,16 65,14 T 110,8'
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  // Live state
  const [indices, setIndices] = useState(DEFAULT_GLOBAL_INDICES);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Interactive UI Filters
  const [activeMoverTab, setActiveMoverTab] = useState('gainers'); // 'gainers' | 'losers' | 'active'
  const [activeTechFilter, setActiveTechFilter] = useState('all'); // 'all' | 'rsi' | 'macd' | 'sma' | 'volume'

  // Global Sector Performance Heatmap state
  const [globalSectors, setGlobalSectors] = useState([
    { name: 'Technology (XLK)', etf: 'XLK', change: 2.34, isPositive: true },
    { name: 'Consumer Disc. (XLY)', etf: 'XLY', change: 1.58, isPositive: true },
    { name: 'Crypto & Digital Assets', etf: 'BITO', change: 3.85, isPositive: true },
    { name: 'Comm. Services (XLC)', etf: 'XLC', change: 1.25, isPositive: true },
    { name: 'Financials (XLF)', etf: 'XLF', change: 0.82, isPositive: true },
    { name: 'Industrials (XLI)', etf: 'XLI', change: 0.45, isPositive: true },
    { name: 'Materials (XLB)', etf: 'XLB', change: -0.25, isPositive: false },
    { name: 'Healthcare (XLV)', etf: 'XLV', change: -0.42, isPositive: false },
    { name: 'Real Estate (XLRE)', etf: 'XLRE', change: -0.68, isPositive: false },
    { name: 'Energy (XLE)', etf: 'XLE', change: -1.15, isPositive: false },
  ]);

  // Initial Fetch & Intervals
  useEffect(() => {
    fetchGlobalMarketData();
    fetchNews();

    // Regular API polling every 6 seconds
    const pollInterval = setInterval(() => {
      fetchGlobalMarketData();
    }, 6000);

    // High frequency micro-tick simulation to make live charts feel alive
    const tickInterval = setInterval(() => {
      setIndices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const item = next[key];
          if (item && item.price) {
            const varianceRatio = (Math.random() - 0.49) * 0.0004; // 0.04% variance
            const variance = item.price * varianceRatio;
            const newPrice = Number((item.price + variance).toFixed(key === 'EURUSD=X' ? 4 : 2));
            const newChange = Number(((item.change || 0) + variance).toFixed(key === 'EURUSD=X' ? 4 : 2));
            const newPercent = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
            next[key] = { ...item, price: newPrice, change: newChange, changePercent: newPercent };
          }
        });
        return next;
      });

      // Subtle sector drift
      setGlobalSectors(prev => prev.map(sec => {
        const drift = (Math.random() - 0.5) * 0.03;
        const newChange = Number((sec.change + drift).toFixed(2));
        return { ...sec, change: newChange, isPositive: newChange >= 0 };
      }));
    }, 2000);

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(tickInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const fetchGlobalMarketData = async () => {
    try {
      const [indicesRes, moversRes] = await Promise.all([
        apiClient.get('/market/indices'),
        apiClient.get('/market/movers')
      ]);

      if (indicesRes.data) {
        setIndices(prev => {
          const updated = { ...prev };
          Object.keys(DEFAULT_GLOBAL_INDICES).forEach(key => {
            if (indicesRes.data[key]) {
              updated[key] = {
                ...DEFAULT_GLOBAL_INDICES[key],
                ...indicesRes.data[key],
                name: DEFAULT_GLOBAL_INDICES[key].name,
                region: DEFAULT_GLOBAL_INDICES[key].region,
                spark: DEFAULT_GLOBAL_INDICES[key].spark
              };
            }
          });
          return updated;
        });
      }

      if (moversRes.data) {
        setTopGainers(moversRes.data.gainers || []);
        setTopLosers(moversRes.data.losers || []);
      }
    } catch (err) {
      console.error('Error fetching global market data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await apiClient.get('/market/news');
      setNews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setNews([]);
    }
  };

  // Global Market Sessions Status calculation
  const marketSessions = useMemo(() => {
    // Current UTC hours and minutes
    const nowUtc = new Date(currentTime.getTime() + currentTime.getTimezoneOffset() * 60000);
    const utcHour = nowUtc.getHours() + nowUtc.getMinutes() / 60;

    // NY (EDT is UTC-4): 09:30 to 16:00 EDT -> 13:30 to 20:00 UTC
    const isNyOpen = utcHour >= 13.5 && utcHour < 20.0;
    // London (BST is UTC+1): 08:00 to 16:30 BST -> 07:00 to 15:30 UTC
    const isLondonOpen = utcHour >= 7.0 && utcHour < 15.5;
    // Tokyo (JST is UTC+9): 09:00 to 15:00 JST -> 00:00 to 06:00 UTC
    const isTokyoOpen = utcHour >= 0.0 && utcHour < 6.0;
    // Sydney (AEST is UTC+10): 10:00 to 16:00 AEST -> 00:00 to 06:00 UTC
    const isSydneyOpen = utcHour >= 0.0 && utcHour < 6.0;

    return [
      { name: 'New York (NYSE / NASDAQ)', status: isNyOpen ? 'OPEN' : 'CLOSED', time: currentTime.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' EDT', isOpen: isNyOpen },
      { name: 'London (LSE)', status: isLondonOpen ? 'OPEN' : 'CLOSED', time: currentTime.toLocaleTimeString('en-US', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' BST', isOpen: isLondonOpen },
      { name: 'Tokyo (TSE)', status: isTokyoOpen ? 'OPEN' : 'CLOSED', time: currentTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' JST', isOpen: isTokyoOpen },
      { name: 'Crypto 24/7', status: 'LIVE', time: 'Non-stop global liquidity', isOpen: true }
    ];
  }, [currentTime]);

  // Quick Discovery Navigation Hub
  const quickDiscoveryPills = [
    { label: 'US Tech Titans', path: '/stock/NVDA', icon: <Cpu size={16} />, badge: 'Mega Cap' },
    { label: 'Crypto Desk', path: '/stock/BTC-USD', icon: <Coins size={16} />, badge: '24/7' },
    { label: 'Global Screener', path: '/screener', icon: <Search size={16} />, badge: 'Multimarket' },
    { label: 'AI Strategy Lab', path: '/strategy-lab', icon: <Zap size={16} />, badge: 'Quant' },
    { label: 'Commodities & Forex', path: '/stock/GC=F', icon: <Globe size={16} />, badge: 'Futures' },
    { label: 'Global Macro News', path: '/news', icon: <Newspaper size={16} />, badge: 'Live Feed' },
  ];

  // Curated Most Active Global Assets
  const mostActiveGlobal = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: '128.40', changePercent: '4.25', volume: '64.8M', isPositive: true },
    { symbol: 'TSLA', name: 'Tesla Inc', price: '224.60', changePercent: '2.45', volume: '51.2M', isPositive: true },
    { symbol: 'BTC-USD', name: 'Bitcoin USD', price: '64850.00', changePercent: '2.80', volume: '$34.2B', isPositive: true },
    { symbol: 'AAPL', name: 'Apple Inc', price: '228.30', changePercent: '1.40', volume: '42.6M', isPositive: true },
    { symbol: 'PLTR', name: 'Palantir Tech', price: '32.15', changePercent: '3.65', volume: '38.4M', isPositive: true },
    { symbol: 'AMD', name: 'Advanced Micro', price: '151.20', changePercent: '-0.95', volume: '28.1M', isPositive: false },
  ];

  const activeMoversList = useMemo(() => {
    if (activeMoverTab === 'gainers') return topGainers.length ? topGainers : INTERNATIONAL_QUANT_SIGNALS.slice(0, 6);
    if (activeMoverTab === 'losers') return topLosers.length ? topLosers : [];
    return mostActiveGlobal;
  }, [activeMoverTab, topGainers, topLosers]);

  const filteredQuantSignals = useMemo(() => {
    if (activeTechFilter === 'all') return INTERNATIONAL_QUANT_SIGNALS;
    return INTERNATIONAL_QUANT_SIGNALS.filter(s => s.category === activeTechFilter);
  }, [activeTechFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', paddingBottom: '32px' }}>
      
      {/* 1. Header Banner & Universal International Search */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        padding: '24px 28px',
        borderRadius: '20px',
        background: isLight 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.7) 100%)' 
          : 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.7) 100%)',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
        boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.04)' : '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px', 
              letterSpacing: '0.06em',
              background: 'rgba(16, 185, 129, 0.12)', 
              color: '#10b981', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontWeight: 800,
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              LIVE GLOBAL DESK
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {currentTime.toUTCString().slice(0, 22)} UTC
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Trader'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: 500 }}>
            Real-time streaming US Equities, Crypto, Global Indices, Forex & Quantitative Wall Street Insights
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '440px' }}>
          <SearchWithSuggestions 
            onSelect={(stock) => navigate(`/stock/${stock.symbol}`)} 
            placeholder="Search US Equities, Crypto, Indices (e.g. NVDA, BTC, AAPL, EUR/USD)..." 
            className="global-search" 
          />
        </div>
      </div>

      {/* 2. Global Financial Sessions & Risk Sentiment Ticker Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '12px'
      }}>
        {marketSessions.map((session, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {session.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'monospace' }}>
                {session.time}
              </div>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              background: session.isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
              color: session.isOpen ? '#10b981' : 'var(--text-secondary)',
              border: session.isOpen ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)'
            }}>
              {session.status}
            </span>
          </div>
        ))}
      </div>

      {/* 3. Hero Benchmark Ticker Cards (S&P 500, NASDAQ, Bitcoin, Gold, etc.) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: '#3b82f6' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Major International Benchmarks & Commodities
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Real-time Yahoo Finance / Spot Stream
          </span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
          gap: '14px' 
        }}>
          {Object.keys(DEFAULT_GLOBAL_INDICES).map((key) => {
            const item = indices[key] || DEFAULT_GLOBAL_INDICES[key];
            const isPos = (item.change ?? 0) >= 0;
            return (
              <div
                key={key}
                onClick={() => navigate(`/stock/${key}`)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = isPos ? '#10b981' : '#ef4444';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.name}
                    </span>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {key} • {item.region}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    background: isPos ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: isPos ? '#10b981' : '#ef4444'
                  }}>
                    {isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {isPos ? '+' : ''}{(item.changePercent ?? 0).toFixed(2)}%
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                  <div>
                    <div style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      ${key === 'EURUSD=X' ? Number(item.price).toFixed(4) : Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isPos ? '#10b981' : '#ef4444', marginTop: '1px' }}>
                      {isPos ? '+' : ''}{key === 'EURUSD=X' ? Number(item.change).toFixed(4) : Number(item.change).toFixed(2)} USD
                    </div>
                  </div>
                  <Sparkline points={item.spark} color={isPos ? '#10b981' : '#ef4444'} width={75} height={28} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Quick Action Category Discovery Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {quickDiscoveryPills.map((pill, i) => (
          <div
            key={i}
            onClick={() => navigate(pill.path)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '14px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                width: '34px', 
                height: '34px', 
                borderRadius: '10px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {pill.icon}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {pill.label}
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--bg-glass-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              {pill.badge}
            </span>
          </div>
        ))}
      </div>

      {/* 5. International Market Movers (Gainers, Losers, High Volume) & Global Sector Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '22px' }}>
        
        {/* Left: Top Movers Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'gainers', label: 'Top Gainers', color: '#10b981' },
                { id: 'losers', label: 'Top Losers', color: '#ef4444' },
                { id: 'active', label: 'Most Active', color: '#3b82f6' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMoverTab(tab.id)}
                  style={{
                    background: activeMoverTab === tab.id ? `${tab.color}18` : 'transparent',
                    border: activeMoverTab === tab.id ? `1px solid ${tab.color}` : '1px solid var(--border-color)',
                    color: activeMoverTab === tab.id ? tab.color : 'var(--text-secondary)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              GLOBAL REAL-TIME (USD)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeMoversList.slice(0, 6).map((item, i) => {
              const isPos = parseFloat(item.changePercent) >= 0;
              return (
                <div 
                  key={i} 
                  onClick={() => navigate(`/stock/${item.symbol}`)}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px 16px', 
                    background: 'var(--bg-glass-light)', 
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = isPos ? '#10b981' : '#ef4444'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isLight ? '#f1f5f9' : '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '12px',
                      color: 'var(--text-primary)'
                    }}>
                      {item.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{item.symbol}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '1px 5px', borderRadius: '4px' }}>
                          {item.symbol.includes('-USD') ? 'CRYPTO' : 'US'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.name || item.symbol}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
                      ${parseFloat(item.price).toLocaleString()}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: isPos ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '2px'
                    }}>
                      {isPos ? '+' : ''}{item.changePercent}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Global Sector Rotation Heatmap */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} style={{ color: '#f59e0b' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Wall Street Sector Heatmap
              </h2>
            </div>
            <button 
              onClick={() => navigate('/screener')} 
              style={{ background: 'transparent', border: 'none', color: '#10b981', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              SCREENER <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {globalSectors.map((sec, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/stock/${sec.etf}`)}
                style={{ 
                  padding: '12px 14px', 
                  borderRadius: '10px', 
                  background: sec.isPositive 
                    ? (isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)') 
                    : (isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)'),
                  border: `1px solid ${sec.isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{sec.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ETF: {sec.etf}</div>
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 800, 
                  color: sec.isPositive ? '#10b981' : '#ef4444' 
                }}>
                  {sec.change >= 0 ? '+' : ''}{sec.change.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>

          {/* Macro Gauge Card */}
          <div style={{
            marginTop: '16px',
            padding: '14px',
            borderRadius: '12px',
            background: 'var(--bg-glass-light)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gauge size={22} style={{ color: '#10b981' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>GLOBAL SENTIMENT</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Greed Index (68 / 100)</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>CBOE VIX VOLATILITY</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>15.20 (-3.4%)</div>
            </div>
          </div>
        </div>

      </div>

      {/* 6. Section: Wall Street Quantitative Barometers & Institutional Setups */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: '#8b5cf6' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Quantitative Barometers & Institutional Flow Models
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
              Algorithmic momentum scoring, dark-pool block flow, and technical pattern recognition
            </p>
          </div>

          {/* Scanner Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Models' },
              { id: 'macd', label: 'MACD Golden Cross' },
              { id: 'rsi', label: 'RSI Momentum' },
              { id: 'sma', label: '200d SMA Breakout' },
              { id: 'volume', label: 'Institutional Surge' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTechFilter(tab.id)}
                style={{
                  background: activeTechFilter === tab.id ? '#8b5cf6' : 'transparent',
                  color: activeTechFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  border: activeTechFilter === tab.id ? 'none' : '1px solid var(--border-color)',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quant Insight Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredQuantSignals.map((stock, i) => (
            <div
              key={i}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              style={{
                padding: '18px',
                borderRadius: '14px',
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{stock.symbol}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stock.name}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase' }}>
                    {stock.assetClass}
                  </span>
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 800, 
                  background: 'rgba(139, 92, 246, 0.15)', 
                  color: '#8b5cf6', 
                  padding: '3px 8px', 
                  borderRadius: '6px',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  SCORE: {stock.score}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{stock.price}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>{stock.change}</span>
              </div>

              <div style={{ 
                padding: '10px 12px', 
                borderRadius: '8px', 
                background: isLight ? '#f8fafc' : '#0f172a', 
                border: '1px solid var(--border-color)', 
                marginBottom: '12px' 
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>
                  SETUP: {stock.technicalPattern}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Institutional: {stock.institutionalFlow}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span>Wall St. Target: <strong style={{ color: '#10b981' }}>{stock.target}</strong></span>
                <span>Tactical Stop: <strong style={{ color: '#ef4444' }}>{stock.stoploss}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Live International Macro & Financial News Stream */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={18} style={{ color: '#0ea5e9' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Live Global Intelligence & Macroeconomic Feed
            </h2>
          </div>
          <button 
            onClick={() => navigate('/news')} 
            style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            TERMINAL NEWS FEED <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {news.slice(0, 6).map((n, i) => (
            <a 
              key={i} 
              href={n.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-color)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#0ea5e9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {n.source} • {n.time}
                    </span>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      background: n.sentiment === 'Bullish' ? 'rgba(16, 185, 129, 0.15)' : (n.sentiment === 'Bearish' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)'), 
                      color: n.sentiment === 'Bullish' ? '#10b981' : (n.sentiment === 'Bearish' ? '#ef4444' : 'var(--text-secondary)')
                    }}>
                      {n.sentiment ? n.sentiment.toUpperCase() : 'MARKET INTEL'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700, lineHeight: '1.45', marginBottom: '8px' }}>
                    {n.title}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {n.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#0ea5e9', fontWeight: 700, marginTop: '12px' }}>
                  Read Full Wire <ExternalLink size={12} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}