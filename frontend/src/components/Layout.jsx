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
import TickerTape from './TickerTape';
import StockActionModal from './StockActionModal';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState(null);
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => {
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
        {/* Left: Brand Logo */}
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

      {/* Dual Line Ticker Tape Wrapper */}
      <div style={{ marginTop: '64px' }}>
        <TickerTape onStockClick={(symbol) => setSelectedTicker(symbol)} />
      </div>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        marginTop: '0px', 
        padding: '24px 32px 40px 32px',
        maxWidth: '1500px',
        width: '100%',
        margin: '0 auto'
      }}>
        {children}
      </main>

      {selectedTicker && (
        <StockActionModal 
          symbol={selectedTicker} 
          onClose={() => setSelectedTicker(null)} 
        />
      )}

      <OnboardingTour />
    </div>
  );
}