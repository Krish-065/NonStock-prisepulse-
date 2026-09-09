import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { TrendingUp, TrendingDown, Search, BarChart3, FolderClosed, Activity, Sparkles, MessageSquare, Bell } from 'lucide-react';
import { apiClient } from '../services/api';

const defaultGlobalIndices = {
  '^GSPC': { name: 'S&P 500', currency: '$', price: 5626.02, change: 42.15, changePercent: 0.76 },
  '^IXIC': { name: 'NASDAQ', currency: '$', price: 17825.40, change: 198.50, changePercent: 1.13 },
  '^DJI': { name: 'DOW JONES', currency: '$', price: 41250.20, change: 155.30, changePercent: 0.38 },
  '^FTSE': { name: 'FTSE 100', currency: '£', price: 8281.60, change: 35.40, changePercent: 0.43 },
  '^N225': { name: 'NIKKEI 225', currency: '¥', price: 36820.50, change: -145.20, changePercent: -0.39 },
  '^GDAXI': { name: 'DAX 40', currency: '€', price: 18412.30, change: 88.60, changePercent: 0.48 },
  'GC=F': { name: 'GOLD', currency: '$', price: 2512.40, change: 14.80, changePercent: 0.59 },
  'BTC-USD': { name: 'BITCOIN', currency: '$', price: 64210.50, change: 1250.00, changePercent: 1.98 },
  'CL=F': { name: 'CRUDE OIL', currency: '$', price: 78.45, change: 1.25, changePercent: 1.62 },
  'EURUSD=X': { name: 'EUR / USD', currency: '$', price: 1.1052, change: 0.0022, changePercent: 0.20 }
};

const internationalIndexList = [
  { key: '^GSPC', name: 'S&P 500', currency: '$' },
  { key: '^IXIC', name: 'NASDAQ', currency: '$' },
  { key: '^DJI', name: 'DOW JONES', currency: '$' },
  { key: '^FTSE', name: 'FTSE 100', currency: '£' },
  { key: '^N225', name: 'NIKKEI 225', currency: '¥' },
  { key: '^GDAXI', name: 'DAX 40', currency: '€' },
  { key: 'GC=F', name: 'GOLD', currency: '$' },
  { key: 'BTC-USD', name: 'BITCOIN', currency: '$' },
  { key: 'CL=F', name: 'CRUDE OIL', currency: '$' },
  { key: 'EURUSD=X', name: 'EUR / USD', currency: '$' }
];

export default function Landing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: '10K+',
    dailyVolume: '₹2.4T',
    stocksListed: '2,156',
    uptime: '99.9%'
  });

  const [indices, setIndices] = useState(defaultGlobalIndices);
  const [movers, setMovers] = useState({ gainers: [], losers: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Fetch Public Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/market/public-stats');
        setStats({
          activeUsers: res.data.activeUsers + '+',
          dailyVolume: res.data.dailyVolume,
          stocksListed: res.data.stocksListed.toLocaleString('en-IN'),
          uptime: res.data.uptime
        });
      } catch (err) {
        console.error('Failed to fetch public stats:', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Market Data (Indices & Movers) - Public APIs
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const [indicesRes, moversRes] = await Promise.all([
          apiClient.get('/market/indices'),
          apiClient.get('/market/movers')
        ]);
        if (indicesRes.data) {
          setIndices(prev => ({ ...prev, ...indicesRes.data }));
        }
        setMovers({
          gainers: (moversRes.data?.gainers || []).slice(0, 5),
          losers: (moversRes.data?.losers || []).slice(0, 5)
        });
      } catch (err) {
        console.error('Failed to fetch market data for landing page:', err);
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Continuous subtle live tick animation for international markets
  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => {
        const next = { ...prev };
        internationalIndexList.forEach(idx => {
          const item = next[idx.key];
          if (item && item.price) {
            const variance = (Math.random() - 0.49) * (item.price * 0.0003);
            const newPrice = Number((item.price + variance).toFixed(idx.key === 'EURUSD=X' ? 4 : 2));
            const newChange = Number(((item.change || 0) + variance).toFixed(idx.key === 'EURUSD=X' ? 4 : 2));
            const newPercent = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
            next[idx.key] = { ...item, price: newPrice, change: newChange, changePercent: newPercent };
          }
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Handle Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await apiClient.get(`/market/search/${encodeURIComponent(searchQuery)}`);
          setSearchResults(res.data.slice(0, 6));
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="market-bg"></div>
      <div className="animated-bg"></div>
      <div className="particle-bg">{Array(40).fill().map((_, i) => <div key={i} className="particle"></div>)}</div>
      <div className="grid-overlay"></div>

      <div className="landing-container">
        {/* International Market Ticker Tape */}
        <div className="ticker-wrap">
          <div className="ticker">
            {[...internationalIndexList, ...internationalIndexList, ...internationalIndexList].map((idx, i) => {
              const data = indices[idx.key] || defaultGlobalIndices[idx.key];
              if (!data || !data.price) return null;
              const isUp = Number(data.change) >= 0;
              const formattedPrice = idx.key === 'EURUSD=X'
                ? Number(data.price).toFixed(4)
                : Number(data.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              const formattedChange = Math.abs(Number(data.change) || 0).toFixed(idx.key === 'EURUSD=X' ? 4 : 2);
              const formattedPercent = Math.abs(Number(data.changePercent) || 0).toFixed(2);

              return (
                <div key={i} className="ticker-item" onClick={() => navigate(idx.key === 'BTC-USD' ? '/crypto' : '/markets')} style={{ cursor: 'pointer' }}>
                  <span className="ticker-name">{idx.name}</span>
                  <span className="ticker-price">{idx.currency}{formattedPrice}</span>
                  <span className={`ticker-change ${isUp ? 'positive' : 'negative'}`}>
                    {isUp ? '▲' : '▼'} {formattedChange} ({formattedPercent}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="landing-content">
          <div className="hero-section fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }} className="float-anim">
              <Logo size={120} showName={false} showTagline={false} />
            </div>
            <h1 className="hero-title">Trade Smarter with <span className="gradient-text">NonStock</span></h1>
            <p className="hero-subtitle" style={{ fontSize: '22px', fontWeight: '800', color: '#00ff88', textShadow: '0 0 15px rgba(0, 255, 136, 0.4)', letterSpacing: '0.5px', marginBottom: '16px' }}>Be Nonstop with NonStock.</p>
            
            <div className="search-container fade-in-up" style={{ animationDelay: '0.2s' }} ref={searchRef}>
              <div className="search-box">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search stocks, indices, crypto... (Try 'Reliance' or 'BTC')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((item, idx) => (
                    <div key={idx} className="search-result-item" onClick={() => navigate(`/stock/${item.symbol}`)}>
                      <div className="result-main">
                        <span className="result-symbol">{item.symbol}</span>
                        <span className="result-name">{item.name}</span>
                      </div>
                      <span className="result-type">{item.exchange}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hero-buttons fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/register" className="btn-primary-hero">Get Started →</Link>
              <Link to="/login" className="btn-secondary-hero">Sign In</Link>
            </div>
          </div>

          {/* Market Movers Section */}
          <div className="movers-section fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="section-title" style={{ fontSize: '24px', marginBottom: '24px' }}>Live Market Pulse</h2>
            <div className="movers-grid">
              <div className="mover-card">
                <h3 style={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} /> Top Gainers</h3>
                <div className="mover-list">
                  {movers.gainers.map((s, i) => (
                    <div key={i} className="mover-item" onClick={() => navigate(`/stock/${s.symbol}-EQ`)}>
                      <span className="mover-symbol">{s.symbol}</span>
                      <div className="mover-price-box">
                        <span className="mover-price">₹{s.price}</span>
                        <span className="mover-change positive">+{s.changePercent}%</span>
                      </div>
                    </div>
                  ))}
                  {movers.gainers.length === 0 && <div className="mover-empty">Loading market data...</div>}
                </div>
              </div>
              <div className="mover-card">
                <h3 style={{ color: '#ff4444', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingDown size={20} /> Top Losers</h3>
                <div className="mover-list">
                  {movers.losers.map((s, i) => (
                    <div key={i} className="mover-item" onClick={() => navigate(`/stock/${s.symbol}-EQ`)}>
                      <span className="mover-symbol">{s.symbol}</span>
                      <div className="mover-price-box">
                        <span className="mover-price">₹{s.price}</span>
                        <span className="mover-change negative">{s.changePercent}%</span>
                      </div>
                    </div>
                  ))}
                  {movers.losers.length === 0 && <div className="mover-empty">Loading market data...</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="features-section fade-in-up" style={{ animationDelay: '0.8s' }}>
            <h2 className="section-title">Everything you need in one platform</h2>
            <div className="features-grid">
              {[
                { icon: <TrendingUp size={36} style={{ color: '#00ff88' }} />, title: 'Live Market Data', desc: 'Real-time NSE/BSE indices, global cryptos, and commodities' },
                { icon: <BarChart3 size={36} style={{ color: '#00bcd4' }} />, title: 'Advanced Charts', desc: 'Interactive candlestick charts with multiple indicator layouts' },
                { icon: <Search size={36} style={{ color: '#00ff88' }} />, title: 'Stock Screener', desc: 'Filter stocks dynamically by performance, metrics and sectors' },
                { icon: <FolderClosed size={36} style={{ color: '#00bcd4' }} />, title: 'Paper Trading Simulator', desc: 'Practice placing orders without any real capital risk' },
                { icon: <Activity size={36} style={{ color: '#ffb300' }} />, title: 'Option Chain Greeks (PRO)', desc: 'Analyze real-time Open Interest build-up and option Greeks (Delta/Theta)' },
                { icon: <Sparkles size={36} style={{ color: '#ffb300' }} />, title: 'Strategy Lab & Bots (PRO)', desc: 'Design strategies and deploy sandbox automated execution bots' },
                { icon: <MessageSquare size={36} style={{ color: '#ffb300' }} />, title: 'Pro AI Mentor (PRO)', desc: 'Institutional quantitative tutor with advanced derivative expertise' },
                { icon: <Bell size={36} style={{ color: '#ffb300' }} />, title: 'Multi-Channel Alert Hub (PRO)', desc: 'Instant strategy notifications directly to your Email, WhatsApp, and SMS' }
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon float-anim" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', animationDelay: `${i * 0.1}s` }}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            {[
              { number: stats.activeUsers, label: 'Active Users' },
              { number: stats.dailyVolume, label: 'Daily Volume' },
              { number: stats.stocksListed, label: 'Stocks Listed' },
              { number: stats.uptime, label: 'Uptime' }
            ].map((s, i) => (
              <div key={i} className="stat-item pulse-anim">
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="cta-section">
            <h2>Ready to start trading?</h2>
            <p>Join NonStock today and take control of your financial future</p>
            <Link to="/register" className="btn-cta">Create Free Account →</Link>
          </div>
        </div>
      </div>

      <style>{`
        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .float-anim {
          animation: float 4s ease-in-out infinite;
        }
        .pulse-anim {
          animation: pulse 4s ease-in-out infinite;
        }

        /* Ticker Tape */
        .ticker-wrap {
          width: 100%;
          overflow: hidden;
          background: rgba(10, 14, 39, 0.8);
          border-bottom: 1px solid rgba(0, 255, 136, 0.15);
          backdrop-filter: blur(10px);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1000;
          height: 40px;
          display: flex;
          align-items: center;
        }
        .ticker {
          display: inline-flex;
          white-space: nowrap;
          padding-right: 100%;
          box-sizing: content-box;
          animation: ticker 30s linear infinite;
        }
        .ticker:hover {
          animation-play-state: paused;
        }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          padding: 0 24px;
          gap: 12px;
          font-size: 13px;
          font-weight: 700;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ticker-name { color: #ffffff; }
        .ticker-price { color: #9b9eac; }
        .ticker-change.positive { color: #00ff88; }
        .ticker-change.negative { color: #ff4444; }

        /* Search Box */
        .search-container {
          position: relative;
          max-width: 600px;
          margin: 0 auto 40px auto;
          z-index: 50;
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 30px;
          padding: 6px 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.1);
        }
        .search-box:focus-within {
          background: rgba(255, 255, 255, 0.1);
          border-color: #00ff88;
          box-shadow: 0 8px 30px rgba(0, 255, 136, 0.2);
        }
        .search-icon {
          color: #00ff88;
          margin-right: 12px;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 16px;
          padding: 12px 0;
          outline: none;
        }
        .search-input::placeholder {
          color: #9b9eac;
        }
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          background: rgba(10, 14, 39, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        .search-result-item {
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s;
        }
        .search-result-item:hover {
          background: rgba(0, 255, 136, 0.1);
        }
        .result-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .result-symbol {
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
        }
        .result-name {
          color: #9b9eac;
          font-size: 12px;
        }
        .result-type {
          font-size: 11px;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #ffffff;
          font-weight: 600;
        }

        /* Market Movers */
        .movers-section {
          margin: 60px 0;
        }
        .movers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .mover-card {
          background: rgba(19, 23, 34, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
        }
        .mover-list {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mover-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mover-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(5px);
        }
        .mover-symbol {
          font-weight: 700;
          color: #ffffff;
          font-size: 15px;
        }
        .mover-price-box {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mover-price {
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
        }
        .mover-change {
          font-size: 12px;
          font-weight: 800;
        }
        .mover-change.positive { color: #00ff88; }
        .mover-change.negative { color: #ff4444; }
        .mover-empty { color: #9b9eac; font-size: 13px; text-align: center; padding: 20px; }

        /* General Layout */
        .landing-container {
          min-height: 100vh;
          padding-top: 100px;
          position: relative;
          z-index: 1;
        }
        .landing-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .hero-section {
          text-align: center;
          padding: 40px 0;
        }
        .hero-title {
          font-size: 56px;
          font-weight: 800;
          margin-bottom: 24px;
          line-height: 1.2;
        }
        .gradient-text {
          background: linear-gradient(135deg, #00ff88, #00bcd4);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero-subtitle {
          font-size: 18px;
          color: #9b9eac;
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        .btn-primary-hero {
          background: linear-gradient(135deg, #00ff88, #00bcd4);
          color: #0a0e27;
          padding: 14px 36px;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 800;
          font-size: 15px;
          transition: 0.2s;
        }
        .btn-primary-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,255,136,0.3);
        }
        .btn-secondary-hero {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 14px 36px;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          transition: 0.2s;
        }
        .btn-secondary-hero:hover {
          background: rgba(255,255,255,0.2);
        }
        .features-section {
          padding: 60px 0;
        }
        .section-title {
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 48px;
          background: linear-gradient(135deg, #ffffff, #9b9eac);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .feature-card {
          background: rgba(19, 23, 34, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 255, 136, 0.1);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feature-card:hover {
          border-color: #00ff88;
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.1);
        }
        .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #ffffff; }
        .feature-card p { font-size: 13px; color: #9b9eac; line-height: 1.5; }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          padding: 80px 0;
          text-align: center;
        }
        .stat-number {
          font-size: 42px;
          font-weight: 800;
          color: #00ff88;
          margin-bottom: 8px;
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }
        .stat-label {
          font-size: 15px;
          font-weight: 600;
          color: #9b9eac;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .cta-section {
          text-align: center;
          padding: 80px 0;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 188, 212, 0.05));
          border: 1px solid rgba(0, 255, 136, 0.1);
          border-radius: 32px;
          margin: 40px 0 80px 0;
        }
        .cta-section h2 { font-size: 36px; font-weight: 800; margin-bottom: 16px; color: #ffffff; }
        .cta-section p { color: #9b9eac; font-size: 18px; margin-bottom: 32px; }
        .btn-cta {
          display: inline-block;
          background: linear-gradient(135deg, #00ff88, #00bcd4);
          color: #0a0e27;
          padding: 16px 48px;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 800;
          font-size: 16px;
          transition: 0.3s;
        }
        .btn-cta:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0, 255, 136, 0.4); }
        
        @media (max-width: 992px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .movers-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 40px; }
          .stats-section { grid-template-columns: repeat(2, 1fr); }
          .hero-buttons { flex-direction: column; align-items: stretch; gap: 12px; }
          .btn-primary-hero, .btn-secondary-hero { width: 100%; box-sizing: border-box; }
          .search-input { font-size: 14px; }
        }
      `}</style>
    </>
  );
}
