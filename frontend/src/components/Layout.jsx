import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Star, Briefcase, Coins, LineChart, Award, Search, 
  Newspaper, Activity, TrendingUp, LayoutDashboard, MessageSquare,
  ChevronDown, Sun, Moon, User, Zap, Shield, PieChart, Users
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SearchWithSuggestions from './SearchWithSuggestions';
import OnboardingTour from './OnboardingTour';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indices, setIndices] = useState({
    nifty: { value: '24,852.10', change: '+184.20', percent: '+0.75', up: true },
    sensex: { value: '81,215.45', change: '+520.10', percent: '+0.64', up: true },
    banknifty: { value: '51,480.30', change: '+610.40', percent: '+1.20', up: true },
  });
  const [marketStatus, setMarketStatus] = useState({ status: 'Open', label: 'Equity & F&O Markets Live', color: '#00b060' });

  const navLinks = [
    { path: '/community', label: 'Community Hub', icon: <Users size={15} /> },
    { path: '/markets', label: 'Markets', icon: <TrendingUp size={15} /> },
    { path: '/paper-trading', label: 'Trade Desk', icon: <LineChart size={15} /> },
    { path: '/fno', label: 'F&O Desk', icon: <Activity size={15} /> },
    { path: '/screener', label: 'Screener', icon: <Search size={15} /> },
    { path: '/mutual-funds', label: 'Mutual Funds', icon: <PieChart size={15} /> },
    { path: '/watchlist', label: 'Watchlist', icon: <Star size={15} /> },
    { path: '/portfolio', label: 'Portfolio', icon: <Briefcase size={15} /> },
    { path: '/news', label: 'News', icon: <Newspaper size={15} /> },
    { path: '/ai-mentor', label: 'AI Mentor', icon: <MessageSquare size={15} /> },
  ];

  const fetchIndices = async () => {
    try {
      const res = await apiClient.get('/market/indices');
      if (res.data && res.data['^NSEI']) {
        const d = res.data;
        setIndices({
          nifty: { 
            value: d['^NSEI']?.price ? d['^NSEI'].price.toLocaleString('en-IN') : '24,852.10', 
            change: d['^NSEI']?.change ? (d['^NSEI'].change >= 0 ? `+${d['^NSEI'].change.toFixed(2)}` : d['^NSEI'].change.toFixed(2)) : '+184.20',
            percent: d['^NSEI']?.changePercent ? (d['^NSEI'].changePercent >= 0 ? `+${d['^NSEI'].changePercent.toFixed(2)}` : d['^NSEI'].changePercent.toFixed(2)) : '+0.75', 
            up: (d['^NSEI']?.change || 0) >= 0 
          },
          sensex: { 
            value: d['^BSESN']?.price ? d['^BSESN'].price.toLocaleString('en-IN') : '81,215.45', 
            change: d['^BSESN']?.change ? (d['^BSESN'].change >= 0 ? `+${d['^BSESN'].change.toFixed(2)}` : d['^BSESN'].change.toFixed(2)) : '+520.10',
            percent: d['^BSESN']?.changePercent ? (d['^BSESN'].changePercent >= 0 ? `+${d['^BSESN'].changePercent.toFixed(2)}` : d['^BSESN'].changePercent.toFixed(2)) : '+0.64', 
            up: (d['^BSESN']?.change || 0) >= 0 
          },
          banknifty: { 
            value: d['^NSEBANK']?.price ? d['^NSEBANK'].price.toLocaleString('en-IN') : '51,480.30', 
            change: d['^NSEBANK']?.change ? (d['^NSEBANK'].change >= 0 ? `+${d['^NSEBANK'].change.toFixed(2)}` : d['^NSEBANK'].change.toFixed(2)) : '+610.40',
            percent: d['^NSEBANK']?.changePercent ? (d['^NSEBANK'].changePercent >= 0 ? `+${d['^NSEBANK'].changePercent.toFixed(2)}` : d['^NSEBANK'].changePercent.toFixed(2)) : '+1.20', 
            up: (d['^NSEBANK']?.change || 0) >= 0 
          },
        });
      }
    } catch (err) {
      console.error('Error fetching layout indices:', err);
    }
  };

  useEffect(() => {
    fetchIndices();
    const interval = setInterval(fetchIndices, 5000);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Sleek Top Angel One Unified Header Navigation */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: isLight ? '#ffffff' : '#0f172a',
        borderBottom: isLight ? '1px solid #e5e7eb' : '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: isLight ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none'
      }}>
        {/* Left: Brand Logo & Clickable Indices */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div 
            onClick={() => navigate('/')} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '20px',
              color: isLight ? '#111827' : '#ffffff',
              letterSpacing: '-0.5px'
            }}
          >
            <span style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: '#00b060', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '18px'
            }}>
              N
            </span>
            <span>NonStock</span>
            {user?.is_pro && (
              <span style={{ 
                fontSize: '10px', 
                background: '#ffb300', 
                color: '#000000', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontWeight: 800
              }}>
                PRO
              </span>
            )}
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: isLight ? '1px solid #e5e7eb' : '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>
              <div 
                onClick={() => navigate('/stock/^NSEI')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '6px' }}
                title="View NIFTY 50 Live Chart"
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>NIFTY</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{indices.nifty.value}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: indices.nifty.up ? '#00b060' : '#dc2626' }}>
                  {indices.nifty.percent}%
                </span>
              </div>

              <div style={{ width: '1px', height: '16px', background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }} />

              <div 
                onClick={() => navigate('/stock/^BSESN')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '6px' }}
                title="View SENSEX Live Chart"
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>SENSEX</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{indices.sensex.value}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: indices.sensex.up ? '#00b060' : '#dc2626' }}>
                  {indices.sensex.percent}%
                </span>
              </div>

              <div style={{ width: '1px', height: '16px', background: isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }} />

              <div 
                onClick={() => navigate('/stock/^NSEBANK')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '6px' }}
                title="View BANKNIFTY Live Chart"
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>BANKNIFTY</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{indices.banknifty.value}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: indices.banknifty.up ? '#00b060' : '#dc2626' }}>
                  {indices.banknifty.percent}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Middle: Desktop Navigation Links */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#00b060' : 'var(--text-secondary)',
                    background: isActive ? (isLight ? 'rgba(0, 176, 96, 0.08)' : 'rgba(0, 176, 96, 0.15)') : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        )}

        {/* Right: Actions (Theme Toggle & Profile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: isLight ? '#f3f4f6' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Light / Dark Theme"
          >
            {isLight ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div 
              onClick={() => navigate('/profile')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: isLight ? '#f3f4f6' : 'rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
            >
              <User size={16} style={{ color: '#00b060' }} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{user.name || user.email?.split('@')[0]}</span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#00b060',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Log In
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <Menu size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-primary)',
          zIndex: 999,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto'
        }}>
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                color: location.pathname === link.path ? '#00b060' : 'var(--text-primary)',
                background: location.pathname === link.path ? 'rgba(0, 176, 96, 0.1)' : 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                textDecoration: 'none'
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        marginTop: '64px', 
        padding: '24px 32px 40px 32px',
        maxWidth: '1500px',
        width: '100%',
        margin: '64px auto 0 auto'
      }}>
        {children}
      </main>

      <OnboardingTour />
    </div>
  );
}