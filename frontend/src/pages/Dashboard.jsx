import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import SearchWithSuggestions from '../components/SearchWithSuggestions';
import { 
  TrendingUp, TrendingDown, Newspaper, Search, Activity, 
  Briefcase, Award, Sparkles, PieChart, ShieldCheck, ArrowRight,
  Zap, Layers, BarChart2, Flame, LineChart, Globe, DollarSign,
  Filter, CheckCircle, AlertTriangle, Clock, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Sparkline = ({ points, color = '#00b060' }) => (
  <svg width="100" height="32" viewBox="0 0 100 32" style={{ overflow: 'visible' }}>
    <path
      d={points}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Tab states
  const [activeMoverTab, setActiveMoverTab] = useState('gainers');
  const [activeTechFilter, setActiveTechFilter] = useState('rsi');

  useEffect(() => {
    fetchMovers();
    fetchNews();
    
    const interval = setInterval(fetchMovers, 3000);
    const timeInt = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timeInt);
    };
  }, []);

  const fetchMovers = async () => {
    try {
      const res = await apiClient.get('/market/movers');
      setTopGainers(res.data.gainers || []);
      setTopLosers(res.data.losers || []);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await apiClient.get('/market/news');
      setNews(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error(err); 
      setNews([]); 
    }
  };

  // Section Data
  const quickDiscoveryPills = [
    { label: 'Stock Discovery', path: '/screener', icon: <Search size={16} /> },
    { label: 'Mutual Funds', path: '/mutual-funds', icon: <PieChart size={16} /> },
    { label: 'Futures & Options', path: '/fno', icon: <Activity size={16} /> },
    { label: 'ETF Discovery', path: '/screener?type=etf', icon: <Layers size={16} /> },
    { label: 'News Discovery', path: '/news', icon: <Newspaper size={16} /> },
  ];

  const latestIPOs = [
    { name: 'Premier Energies Ltd', status: 'OPEN', closes: '04 Sep 2026', minInvest: '₹14,250', subscription: '74.3x', price: '₹427 - ₹450' },
    { name: 'Baazar Style Retail Ltd', status: 'UPCOMING', closes: '06 Sep 2026', minInvest: '₹14,896', subscription: '12.5x', price: '₹370 - ₹389' },
    { name: 'Kross Limited', status: 'ANNOUNCED', closes: '11 Sep 2026', minInvest: '₹14,400', subscription: '4.8x', price: '₹228 - ₹240' }
  ];

  const fnoSectors = [
    { name: 'IT', change: '+0.80%', isPositive: true },
    { name: 'Energy', change: '+0.65%', isPositive: true },
    { name: 'Metal', change: '+0.52%', isPositive: true },
    { name: 'Pharma', change: '+0.40%', isPositive: true },
    { name: 'Infra', change: '+0.35%', isPositive: true },
    { name: 'Services', change: '+0.25%', isPositive: true },
    { name: 'Finance', change: '+0.15%', isPositive: true },
    { name: 'Banking', change: '+0.10%', isPositive: true },
    { name: 'Auto', change: '-0.15%', isPositive: false },
    { name: 'Realty', change: '-0.45%', isPositive: false },
  ];

  const optionContracts = [
    { symbol: 'NIFTY 24800 CE', ltp: '₹142.50', change: '+24.50 (+20.7%)', pcr: '1.25 (Bullish)', isPositive: true },
    { symbol: 'NIFTY 24800 PE', ltp: '₹88.20', change: '-18.30 (-17.1%)', pcr: '0.85 (Neutral)', isPositive: false },
    { symbol: 'BANKNIFTY 51400 CE', ltp: '₹310.80', change: '+54.20 (+21.1%)', pcr: '1.40 (Strong Bull)', isPositive: true },
    { symbol: 'BANKNIFTY 51400 PE', ltp: '₹195.40', change: '-42.10 (-17.7%)', pcr: '0.70 (Bearish)', isPositive: false }
  ];

  const commoditiesCurrency = [
    { name: 'Gold 24K (10g)', price: '₹71,850', change: '+0.45%', isPositive: true, sparkline: 'M 0,25 Q 30,12 60,18 T 100,6' },
    { name: 'Silver (1kg)', price: '₹84,200', change: '+1.10%', isPositive: true, sparkline: 'M 0,22 Q 25,28 50,12 T 100,4' },
    { name: 'Crude Oil (bbl)', price: '₹5,820', change: '-0.85%', isPositive: false, sparkline: 'M 0,8 Q 30,22 60,15 T 100,28' },
    { name: 'Natural Gas', price: '₹185.40', change: '+2.40%', isPositive: true, sparkline: 'M 0,26 Q 30,8 60,15 T 100,2' },
    { name: 'USD / INR', price: '₹83.88', change: '-0.05%', isPositive: false, sparkline: 'M 0,15 Q 30,18 60,12 T 100,16' }
  ];

  const processedTechnicalInsights = [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries',
      score: '92/100',
      signal: 'Strong Bullish',
      ltp: '₹3,045.50',
      change: '+1.85%',
      target: '₹3,200',
      stoploss: '₹2,980',
      fiiFlow: '+₹1,420 Cr Net Buy',
      technicalPattern: 'MACD Golden Crossover & 50d SMA Breakout'
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      score: '88/100',
      signal: 'Bullish Breakout',
      ltp: '₹4,310.20',
      change: '+2.10%',
      target: '₹4,500',
      stoploss: '₹4,220',
      fiiFlow: '+₹890 Cr Net Buy',
      technicalPattern: 'Bullish Engulfing Candlestick'
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd',
      score: '85/100',
      signal: 'Accumulation',
      ltp: '₹1,920.80',
      change: '+1.45%',
      target: '₹2,050',
      stoploss: '₹1,870',
      fiiFlow: '+₹640 Cr Net Buy',
      technicalPattern: 'RSI Oversold Reversal (RSI 28 -> 42)'
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      score: '84/100',
      signal: 'Consolidation Breakout',
      ltp: '₹1,645.00',
      change: '+1.20%',
      target: '₹1,750',
      stoploss: '₹1,600',
      fiiFlow: '+₹1,150 Cr Net Buy',
      technicalPattern: 'Volume Surge (3.4x Average Volume)'
    }
  ];

  const trendingInternationalIndian = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹3,045.50', change: '+1.85%', isPositive: true, sparkline: 'M 0,25 Q 30,10 60,18 T 100,4' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: '₹4,310.20', change: '+2.10%', isPositive: true, sparkline: 'M 0,28 Q 25,12 60,20 T 100,5' },
    { symbol: 'NVDA', name: 'NVIDIA Corp (US)', price: '$124.50', change: '+3.45%', isPositive: true, sparkline: 'M 0,24 Q 30,8 60,14 T 100,2' },
    { symbol: 'AAPL', name: 'Apple Inc (US)', price: '$228.10', change: '+1.15%', isPositive: true, sparkline: 'M 0,20 Q 30,15 60,10 T 100,6' },
    { symbol: 'TSLA', name: 'Tesla Inc (US)', price: '$214.80', change: '-2.10%', isPositive: false, sparkline: 'M 0,5 Q 30,18 60,12 T 100,28' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', price: '₹1,085.40', change: '+2.80%', isPositive: true, sparkline: 'M 0,26 Q 25,10 60,16 T 100,3' },
  ];

  const activeMoversList = activeMoverTab === 'gainers' ? topGainers : topLosers;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Header Banner & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Trade Home
            <span style={{ 
              fontSize: '11px', 
              background: 'rgba(0, 176, 96, 0.1)', 
              color: '#00b060', 
              padding: '3px 10px', 
              borderRadius: '20px', 
              fontWeight: 800,
              border: '1px solid rgba(0, 176, 96, 0.25)'
            }}>
              LIVE NSE & US MARKETS
            </span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Real-time Equity, F&O, Commodities & Processed Quantitative Insights • {currentTime.toLocaleTimeString()} IST
          </p>
        </div>

        <div style={{ width: '380px' }}>
          <SearchWithSuggestions 
            onSelect={(stock) => navigate(`/stock/${stock.symbol}`)} 
            placeholder="Search by Stock, Symbol or F&O (e.g. Reliance, TCS)..." 
            className="global-search" 
          />
        </div>
      </div>

      {/* 2. Quick Action Category Discovery Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {quickDiscoveryPills.map((pill, i) => (
          <div
            key={i}
            onClick={() => navigate(pill.path)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
              boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#00b060';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              background: 'rgba(0, 176, 96, 0.1)', 
              color: '#00b060',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {pill.icon}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{pill.label}</span>
          </div>
        ))}
      </div>

      {/* 3. Section: Invest in Latest IPOs */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChart size={18} style={{ color: '#00b060' }} /> Invest in Latest IPOs
          </h2>
          <button onClick={() => navigate('/ipos')} style={{ background: 'transparent', border: 'none', color: '#00b060', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            VIEW ALL IPOS <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {latestIPOs.map((ipo, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-glass-light)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{ipo.name}</span>
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontWeight: 800,
                  background: ipo.status === 'OPEN' ? 'rgba(0, 176, 96, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: ipo.status === 'OPEN' ? '#00b060' : '#d97706'
                }}>
                  {ipo.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                <span>Min. Investment: <strong style={{ color: 'var(--text-primary)' }}>{ipo.minInvest}</strong></span>
                <span>Subscription: <strong style={{ color: '#00b060' }}>{ipo.subscription}</strong></span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Price Band: {ipo.price} • Closes {ipo.closes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Section: Trends in Futures & Options (F&O) & Option Chain */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left: Sector F&O Heatmap */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} style={{ color: '#00b060' }} /> Trends in Futures & Options
            </h2>
            <button onClick={() => navigate('/fno')} style={{ background: 'transparent', border: 'none', color: '#00b060', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
              OPTION CHAIN DESK →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {fnoSectors.map((sec, i) => (
              <div 
                key={i} 
                style={{ 
                  padding: '12px 8px', 
                  borderRadius: '10px', 
                  textAlign: 'center',
                  background: sec.isPositive ? '#00b060' : '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700
                }}
              >
                <div style={{ fontSize: '12px' }}>{sec.name}</div>
                <div style={{ fontSize: '11px', marginTop: '2px', opacity: 0.9 }}>{sec.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Option Contracts & PCR */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#2563eb' }} /> Active Strike Contracts (PCR)
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {optionContracts.map((opt, i) => (
              <div 
                key={i} 
                onClick={() => navigate('/fno')}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 14px', 
                  borderRadius: '10px', 
                  background: 'var(--bg-glass-light)', 
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{opt.symbol}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PCR: {opt.pcr}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{opt.ltp}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: opt.isPositive ? '#00b060' : '#dc2626' }}>{opt.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Commodities & Currency Desk Snapshot */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} style={{ color: '#d97706' }} /> Commodities & Currency Desk
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {commoditiesCurrency.map((item, i) => (
            <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-glass-light)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{item.name}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{item.price}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: item.isPositive ? '#00b060' : '#dc2626' }}>{item.change}</div>
              </div>
              <Sparkline points={item.sparkline} color={item.isPositive ? '#00b060' : '#dc2626'} />
            </div>
          ))}
        </div>
      </div>

      {/* 6. Section: Technical Barometers & Processed Data Insights (Moneycontrol Style) */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: '#7c3aed' }} /> Technical Barometers & Processed Quant Signals
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Automated Technical Pattern Recognition & FII/DII Institutional Flow Analysis</p>
          </div>

          {/* Technical Scanner Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'rsi', label: 'RSI Oversold' },
              { id: 'macd', label: 'MACD Crossover' },
              { id: 'sma', label: '50d SMA Breakout' },
              { id: 'volume', label: 'Volume Surge' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTechFilter(tab.id)}
                style={{
                  background: activeTechFilter === tab.id ? '#00b060' : 'transparent',
                  color: activeTechFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  border: activeTechFilter === tab.id ? 'none' : '1px solid var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Processed Stock Insights Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {processedTechnicalInsights.map((stock, i) => (
            <div
              key={i}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              style={{
                padding: '18px',
                borderRadius: '14px',
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#00b060'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{stock.symbol}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{stock.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, background: 'rgba(0, 176, 96, 0.15)', color: '#00b060', padding: '3px 8px', borderRadius: '6px' }}>
                  {stock.score}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{stock.ltp}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#00b060' }}>{stock.change}</span>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', background: isLight ? '#f8f9fa' : '#0f172a', border: '1px solid var(--border-color)', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#00b060' }}>PATTERN: {stock.technicalPattern}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>FII Net Flow: {stock.fiiFlow}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>Target: <strong style={{ color: '#00b060' }}>{stock.target}</strong></span>
                <span>Stop Loss: <strong style={{ color: '#dc2626' }}>{stock.stoploss}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Trending Indian & International Line Chart Sparkline Hub */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LineChart size={18} style={{ color: '#2563eb' }} /> Trending Indian & International Leaders
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {trendingInternationalIndian.map((stock, i) => (
            <div 
              key={i}
              onClick={() => navigate(`/stock/${stock.symbol}`)}
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--bg-glass-light)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{stock.symbol}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{stock.name}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>{stock.price}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: stock.isPositive ? '#00b060' : '#dc2626' }}>{stock.change}</div>
              </div>
              <Sparkline points={stock.sparkline} color={stock.isPositive ? '#00b060' : '#dc2626'} />
            </div>
          ))}
        </div>
      </div>

      {/* 8. Market Movers & Live News Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Market Movers Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setActiveMoverTab('gainers')}
                style={{
                  background: activeMoverTab === 'gainers' ? 'rgba(0, 176, 96, 0.12)' : 'transparent',
                  border: activeMoverTab === 'gainers' ? '1px solid #00b060' : 'none',
                  color: activeMoverTab === 'gainers' ? '#00b060' : 'var(--text-secondary)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Top Gainers
              </button>
              <button 
                onClick={() => setActiveMoverTab('losers')}
                style={{
                  background: activeMoverTab === 'losers' ? 'rgba(220, 38, 38, 0.12)' : 'transparent',
                  border: activeMoverTab === 'losers' ? '1px solid #dc2626' : 'none',
                  color: activeMoverTab === 'losers' ? '#dc2626' : 'var(--text-secondary)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Top Losers
              </button>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>NSE REALTIME</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeMoversList.slice(0, 6).map((s, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/stock/${s.symbol}`)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  background: 'var(--bg-glass-light)', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{s.symbol}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '10px' }}>NSE</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>₹{s.price}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: activeMoverTab === 'gainers' ? '#00b060' : '#dc2626' }}>
                    {activeMoverTab === 'gainers' ? '+' : ''}{s.changePercent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Financial News Stream attached with Sentiment Indicators */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Newspaper size={18} style={{ color: '#0284c7' }} /> Processed Market News Feed
            </h3>
            <button onClick={() => navigate('/news')} style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              ALL NEWS →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {news.map((n, i) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'var(--bg-glass-light)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{n.time}</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 176, 96, 0.15)', color: '#00b060' }}>
                      BULLISH
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: '1.4' }}>{n.title}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}