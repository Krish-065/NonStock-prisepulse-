import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import SearchWithSuggestions from '../components/SearchWithSuggestions';
import { 
  TrendingUp, TrendingDown, Newspaper, Search, Activity, 
  Briefcase, Award, Sparkles, PieChart, ShieldCheck, ArrowRight,
  Zap, Layers, BarChart2, Flame, LineChart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MiniSparkline = ({ points, isPositive }) => {
  const color = isPositive ? '#00b060' : '#dc2626';
  return (
    <svg width="90" height="30" viewBox="0 0 90 30" style={{ overflow: 'visible' }}>
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
};

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
  const [activeMoverTab, setActiveMoverTab] = useState('gainers');

  useEffect(() => {
    fetchMovers();
    fetchNews();
    
    const interval = setInterval(() => {
      fetchMovers();
    }, 3000);
    
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

  const indicesList = [
    { name: 'NIFTY 50', symbol: 'NIFTY', value: '24,852.10', change: '+184.20', percent: '+0.75%', isPositive: true, sparkline: 'M 0,25 Q 22,10 45,18 T 90,5' },
    { name: 'SENSEX', symbol: 'SENSEX', value: '81,215.45', change: '+520.10', percent: '+0.64%', isPositive: true, sparkline: 'M 0,22 Q 25,28 50,12 T 90,4' },
    { name: 'BANK NIFTY', symbol: 'BANKNIFTY', value: '51,480.30', change: '+610.40', percent: '+1.20%', isPositive: true, sparkline: 'M 0,26 Q 30,8 60,15 T 90,2' },
    { name: 'FINNIFTY', symbol: 'FINNIFTY', value: '23,675.80', change: '+142.90', percent: '+0.61%', isPositive: true, sparkline: 'M 0,20 Q 20,24 55,10 T 90,6' }
  ];

  const sectorList = [
    { name: 'NIFTY IT', change: '+1.45%', isPositive: true, topStock: 'TCS (+2.1%)' },
    { name: 'NIFTY BANK', change: '+1.20%', isPositive: true, topStock: 'HDFCBANK (+1.8%)' },
    { name: 'NIFTY AUTO', change: '+0.88%', isPositive: true, topStock: 'TATAMOTORS (+1.5%)' },
    { name: 'NIFTY PHARMA', change: '-0.35%', isPositive: false, topStock: 'SUNPHARMA (-0.8%)' },
    { name: 'NIFTY FMCG', change: '+0.25%', isPositive: true, topStock: 'ITC (+0.5%)' },
    { name: 'NIFTY METAL', change: '-0.62%', isPositive: false, topStock: 'TATASTEEL (-1.1%)' },
  ];

  const activeMoversList = activeMoverTab === 'gainers' ? topGainers : topLosers;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Market Command Center
            <span style={{ 
              fontSize: '11px', 
              background: 'rgba(0, 176, 96, 0.12)', 
              color: '#00b060', 
              padding: '3px 10px', 
              borderRadius: '20px', 
              fontWeight: 800,
              border: '1px solid rgba(0, 176, 96, 0.3)'
            }}>
              LIVE MARKET
            </span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Real-time Indian Equity & Derivative Analytics • {currentTime.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} | {currentTime.toLocaleTimeString()} IST
          </p>
        </div>

        <SearchWithSuggestions 
          onSelect={(stock) => navigate(`/stock/${stock.symbol}`)} 
          placeholder="Search stocks, F&O or indices (e.g. Reliance, TCS)..." 
          className="global-search" 
        />
      </div>

      {/* Live Market Indices Cards */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LineChart size={18} style={{ color: '#00b060' }} /> Benchmark Indices
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          {indicesList.map((idx, i) => (
            <div 
              key={i}
              onClick={() => navigate(`/stock/${idx.symbol}`)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
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
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>{idx.name}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>₹{idx.value}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: idx.isPositive ? '#00b060' : '#dc2626' }}>
                  {idx.change} ({idx.percent})
                </div>
              </div>
              <MiniSparkline points={idx.sparkline} isPositive={idx.isPositive} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Portals */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: '#2563eb' }} /> Quick Trading Portals
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div 
            onClick={() => navigate('/screener')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0, 176, 96, 0.1)', color: '#00b060' }}>
              <Search size={20} />
            </span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Stock Screener</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Filter NSE Equities</div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/fno')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ padding: '10px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
              <Activity size={20} />
            </span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>F&O Option Desk</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Live Option Chain</div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/mutual-funds')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ padding: '10px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <PieChart size={20} />
            </span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Mutual Funds</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SIP & Fund Analysis</div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/paper-trading')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ padding: '10px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
              <Briefcase size={20} />
            </span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Paper Trading</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Risk-Free Simulator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        {/* Left Column: Market Movers & Sectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Market Movers Tabbed Card */}
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
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{s.symbol}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '10px' }}>NSE</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>₹{s.price}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: activeMoverTab === 'gainers' ? '#00b060' : '#dc2626' }}>
                      {activeMoverTab === 'gainers' ? '+' : ''}{s.changePercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Heatmap Grid */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#00b060' }} /> Sector Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {sectorList.map((sec, i) => (
                <div 
                  key={i}
                  style={{
                    background: sec.isPositive ? 'rgba(0, 176, 96, 0.06)' : 'rgba(220, 38, 38, 0.06)',
                    border: sec.isPositive ? '1px solid rgba(0, 176, 96, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{sec.name}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: sec.isPositive ? '#00b060' : '#dc2626', margin: '4px 0' }}>
                    {sec.change}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{sec.topStock}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live News Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Newspaper size={18} style={{ color: '#0284c7' }} /> Live Market News
              </h3>
              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 }}>
                FEED
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto' }}>
              {news.map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'var(--bg-glass-light)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>{n.time}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: '1.4' }}>{n.title}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}