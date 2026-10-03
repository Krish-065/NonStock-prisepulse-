import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Sun, Moon, User, Zap, Search, Bot, 
  FlaskConical, Clock, Coins, LogOut, Globe, Sparkles, X, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTrading } from '../contexts/TradingContext';
import Logo from './Logo';
import TickerTape from './TickerTape';
import StockActionModal from './StockActionModal';
import WarningModal from './WarningModal';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { badge, coins, unlockedTools, isFreeGraceActive, trialDaysRemaining } = useTrading();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('nonstock_user_avatar') : null;

  const navItems = [
    {
      name: 'Trading Arena',
      path: '/trading',
      icon: Zap,
      active: location.pathname === '/trading',
      show: true,
      highlight: true
    },
    {
      name: 'Global Markets',
      path: '/global-markets',
      icon: Globe,
      active: location.pathname === '/global-markets' || location.pathname === '/foreign-markets',
      show: true,
      tag: 'NEW'
    },
    {
      name: 'Screener',
      path: '/screener',
      icon: Search,
      active: location.pathname === '/screener',
      show: Boolean(unlockedTools?.screener)
    },
    {
      name: 'AI Mentor',
      path: '/ai-mentor',
      icon: Bot,
      active: location.pathname === '/ai-mentor',
      show: true
    },
    {
      name: 'Strategy Lab',
      path: '/strategy-builder',
      icon: FlaskConical,
      active: location.pathname === '/strategy-builder',
      show: Boolean(unlockedTools?.strategyLab)
    },
    {
      name: 'Replay Engine',
      path: '/replay',
      icon: Clock,
      active: location.pathname === '/replay',
      show: Boolean(unlockedTools?.replay)
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary, #0B0F19)', 
      color: 'var(--text-primary, #F8FAFC)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Executive Obsidian Glass Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: isDark 
          ? 'rgba(11, 15, 25, 0.88)' 
          : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isDark 
          ? '1px solid rgba(255, 255, 255, 0.08)' 
          : '1px solid rgba(226, 232, 240, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: isDark
          ? '0 4px 24px rgba(0, 0, 0, 0.4)'
          : '0 2px 14px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Left: Brand Logo (Navigates directly to /dashboard - No Dashboard word needed) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
          <div 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.15s ease'
            }}
            title="NonStock Dashboard"
          >
            <Logo size={34} showName={true} showTagline={false} nameSize="20px" color={isDark ? '#F8FAFC' : '#0F172A'} />
          </div>

          {/* Desktop Navigation Links */}
          {user && !isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {navItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      position: 'relative',
                      background: item.active
                        ? (item.highlight 
                            ? 'linear-gradient(135deg, #10B981, #059669)'
                            : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FDF4'))
                        : 'transparent',
                      color: item.active
                        ? (item.highlight ? '#FFFFFF' : '#10B981')
                        : (isDark ? '#94A3B8' : '#475569'),
                      border: item.active && !item.highlight
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : '1px solid transparent',
                      borderRadius: '8px',
                      padding: item.highlight ? '6px 14px' : '6px 12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: item.active && item.highlight 
                        ? '0 2px 10px rgba(16, 185, 129, 0.35)' 
                        : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.color = isDark ? '#FFFFFF' : '#0F172A';
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.color = isDark ? '#94A3B8' : '#475569';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon size={15} />
                    <span>{item.name}</span>
                    {item.tag && (
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: '#3B82F6',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        letterSpacing: '0.5px'
                      }}>
                        {item.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: Actions, Badges & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* 60-Day Free All-Tools Grace Period Banner Badge */}
              {isFreeGraceActive && (
                <div 
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: isMobile ? 'none' : 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10B981',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    transition: 'all 0.15s ease'
                  }}
                  title="2-Month Free Introductory Access: All tools are 100% unlocked for your account!"
                >
                  <Sparkles size={12} color="#10B981" />
                  <span>60D Free Pass ({trialDaysRemaining}d)</span>
                </div>
              )}

              {/* Gold Coins Count in Navbar */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  background: isDark ? 'rgba(234, 179, 8, 0.12)' : '#FEF9C3',
                  border: isDark ? '1px solid rgba(234, 179, 8, 0.35)' : '1.5px solid #FACC15',
                  color: isDark ? '#FACC15' : '#854D0E',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                title="Your Gold Coins Vault (Click to view Badges & Tools)"
              >
                <Coins size={14} color={isDark ? '#FACC15' : '#D97706'} />
                <span>{coins || 0}</span>
              </div>

              {/* User Rank Tier Badge */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '4px 11px',
                  borderRadius: '999px',
                  background: isDark ? '#111827' : '#0F172A',
                  border: `1.5px solid ${badge?.color || '#64748B'}`,
                  color: badge?.color || '#64748B',
                  fontWeight: 900,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  cursor: 'pointer',
                  boxShadow: badge?.glow && badge.glow !== 'none' ? badge.glow : 'none',
                  textShadow: badge?.glow && badge.glow !== 'none' ? badge.glow : 'none',
                }}
                title={`Rank: ${badge?.name || 'CONTENDER'}`}
              >
                {badge?.name || 'CONTENDER'}
              </div>

              {/* Profile Pill with User Name */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Account & Badges Dashboard"
              >
                {savedAvatar ? (
                  <img 
                    src={savedAvatar} 
                    alt="Profile" 
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 800, 
                  color: isDark ? '#E2E8F0' : '#0F172A',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.name || user.email?.split('@')[0]}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#10B981',
                color: '#ffffff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              color: isDark ? '#94A3B8' : '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={15} color="#FACC15" /> : <Moon size={15} color="#475569" />}
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              background: 'transparent',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '7px 11px',
              cursor: 'pointer',
              color: isDark ? '#94A3B8' : '#64748B',
              fontWeight: 700,
              fontSize: '12px',
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Log out from NonStock"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Burger */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{
                background: 'transparent',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7px',
                color: isDark ? '#F8FAFC' : '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark ? 'rgba(11, 15, 25, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 999,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0'
        }}>
          {isFreeGraceActive && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={16} />
              <span>60-Day Free Tool Access Active ({trialDaysRemaining} days remaining)</span>
            </div>
          )}

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748B', fontWeight: 800, marginTop: '8px' }}>
            Platform Tools
          </div>

          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: item.active ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FDF4') : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC'),
                  border: item.active ? '1px solid #10B981' : (isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #E2E8F0'),
                  color: item.active ? '#10B981' : (isDark ? '#F8FAFC' : '#0F172A'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  <span>{item.name}</span>
                </div>
                <ChevronRight size={16} color="#64748B" />
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0' }}>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        marginTop: '64px', 
        padding: '24px 20px',
        maxWidth: '1600px',
        width: '100%',
        margin: '64px auto 0 auto',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>

      {selectedTicker && (
        <StockActionModal 
          symbol={selectedTicker} 
          onClose={() => setSelectedTicker(null)} 
        />
      )}

      <WarningModal />
    </div>
  );
}