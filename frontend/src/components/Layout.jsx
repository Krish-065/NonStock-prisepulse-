import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Sun, Moon, User, Zap, Search, Bot, 
  FlaskConical, Clock, Coins, LogOut, Globe, Sparkles, X, ChevronRight, ShieldCheck,
  Calculator, LayoutDashboard, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTrading } from '../contexts/TradingContext';
import Logo from './Logo';
import TickerTape from './TickerTape';
import StockActionModal from './StockActionModal';
import WarningModal from './WarningModal';
import CelestialEngine from './CelestialEngine';
import DeleteAccountModal from './DeleteAccountModal';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { badge, coins, unlockedTools, isFreeGraceActive, trialDaysRemaining } = useTrading();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('stocksoperator_user_avatar') : null;

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
      background: 'radial-gradient(ellipse at top, #FFF7ED 0%, #F8FAFC 50%, #FFFFFF 100%)', 
      color: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* ─── DYNAMIC CELESTIAL BACKGROUND: ROTATING EARTH & ORBITING SUN ─── */}
      <CelestialEngine mode="ambient" style={{ opacity: 0.14, zIndex: 0, pointerEvents: 'none' }} />

      {/* Crisp White & Emerald Glassmorphic Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '66px',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 24px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Left: Brand Logo (Navigates directly to /dashboard - No Dashboard word needed) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '24px', flexShrink: 0 }}>
          <div 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.15s ease'
            }}
            title="Stocks Operator Dashboard (Verified Proving Ground)"
          >
            <Logo size={isMobile ? 32 : 42} showName={true} showTagline={false} nameSize={isMobile ? "19px" : "24px"} color="#0F172A" />
          </div>

          {/* Desktop Navigation Links */}
          {user && !isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            ? 'linear-gradient(135deg, #EA580C, #C2410C)'
                            : '#FFF7ED')
                        : 'transparent',
                      color: item.active
                        ? (item.highlight ? '#FFFFFF' : '#EA580C')
                        : '#334155',
                      border: item.active && !item.highlight
                        ? '1px solid #FFEDD5'
                        : '1px solid transparent',
                      borderRadius: '10px',
                      padding: item.highlight ? '8px 18px' : '8px 14px',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                      boxShadow: item.active && item.highlight 
                        ? '0 4px 14px rgba(234, 88, 12, 0.28)' 
                        : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.color = '#0F172A';
                        e.currentTarget.style.background = '#F1F5F9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon size={15} color={item.active ? (item.highlight ? '#FFFFFF' : '#EA580C') : '#64748B'} />
                    <span>{item.name}</span>
                    {item.tag && (
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: '#EA580C',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px' }}>
              {/* 60-Day Free All-Tools Grace Period Banner Badge (Desktop Only) */}
              {isFreeGraceActive && (
                <div 
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: isMobile ? 'none' : 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    background: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    color: '#C2410C',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    transition: 'all 0.15s ease'
                  }}
                  title="2-Month Free Introductory Access: All tools are 100% unlocked for your account!"
                >
                  <Sparkles size={13} color="#EA580C" />
                  <span>60D Free Pass ({trialDaysRemaining}d)</span>
                </div>
              )}

              {/* Gold Coins Count in Navbar */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '6px',
                  padding: isMobile ? '4px 8px' : '5px 12px',
                  borderRadius: '999px',
                  background: '#FEF9C3',
                  border: '1.5px solid #FDE047',
                  color: '#854D0E',
                  fontWeight: 800,
                  fontSize: isMobile ? '11px' : '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  flexShrink: 0
                }}
                title="Your Gold Coins Vault (Click to view Badges & Tools)"
              >
                <Coins size={isMobile ? 12 : 14} color="#D97706" />
                <span>{coins || 0}</span>
              </div>

              {/* User Rank Tier Badge (Hidden on Mobile to save space for Menu) */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  display: isMobile ? 'none' : 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  color: '#0F172A',
                  fontWeight: 800,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`Rank: ${badge?.name || 'CONTENDER'}`}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: badge?.name === 'Contender' ? '#EA580C' : (badge?.color || '#EA580C')
                }} />
                <span>{badge?.name || 'CONTENDER'}</span>
              </div>

              {/* Profile Pill: Compact Avatar on Mobile, Full Name on Desktop */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0px' : '8px',
                  padding: isMobile ? '4px' : '5px 12px',
                  borderRadius: isMobile ? '50%' : '8px',
                  background: isMobile ? 'transparent' : '#F8FAFC',
                  border: isMobile ? 'none' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                title="Account & Badges Dashboard"
              >
                {savedAvatar ? (
                  <img 
                    src={savedAvatar} 
                    alt="Profile" 
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800
                  }}>
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                {!isMobile && (
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: 800, 
                    color: '#0F172A',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.name || user.email?.split('@')[0]}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#EA580C',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          )}

          {/* Desktop Logout Button */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              background: 'transparent',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '7px 12px',
              cursor: 'pointer',
              color: '#64748B',
              fontWeight: 700,
              fontSize: '12px',
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Log out from Stocks Operator"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Burger - ALWAYS Visible & Positioned Prominently on Right */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{
                background: mobileMenuOpen ? '#F1F5F9' : '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '7px 9px',
                color: '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} color="#0F172A" /> : <Menu size={20} color="#0F172A" />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '66px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#FFFFFF',
          zIndex: 999,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          overflowY: 'auto'
        }}>
          {isFreeGraceActive && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              color: '#C2410C',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={16} color="#EA580C" />
              <span>60-Day Free Tool Access Active ({trialDaysRemaining} days remaining)</span>
            </div>
          )}

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748B', fontWeight: 800, marginTop: '4px' }}>
            Navigation
          </div>

          {/* Primary Dashboard Link */}
          <button
            onClick={() => {
              navigate('/dashboard');
              setMobileMenuOpen(false);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              background: (location.pathname === '/dashboard' && (!location.search || location.search.includes('tab=overview'))) ? '#FFF7ED' : '#F8FAFC',
              border: (location.pathname === '/dashboard' && (!location.search || location.search.includes('tab=overview'))) ? '1px solid #EA580C' : '1px solid #E2E8F0',
              color: (location.pathname === '/dashboard' && (!location.search || location.search.includes('tab=overview'))) ? '#C2410C' : '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LayoutDashboard size={18} color="#C2410C" />
              <span>Dashboard & Proving Ground</span>
            </div>
            <ChevronRight size={16} color="#64748B" />
          </button>

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
                  background: item.active ? '#FFF7ED' : '#F8FAFC',
                  border: item.active ? '1px solid #EA580C' : '1px solid #E2E8F0',
                  color: item.active ? '#C2410C' : '#0F172A',
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

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748B', fontWeight: 800, marginTop: '8px' }}>
            Live Market Tools
          </div>

          <button
            onClick={() => {
              navigate('/dashboard?tab=hours');
              setMobileMenuOpen(false);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="#C2410C" />
              <span>Global Market Hours (NY, LDN, TYO, SYD)</span>
            </div>
            <ChevronRight size={16} color="#64748B" />
          </button>

          <button
            onClick={() => {
              navigate('/dashboard?tab=calculator');
              setMobileMenuOpen(false);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calculator size={18} color="#C2410C" />
              <span>Position Size & Risk Calculator</span>
            </div>
            <ChevronRight size={16} color="#64748B" />
          </button>

          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontWeight: 800,
                fontSize: '13px',
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

            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowDeleteModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Trash2 size={16} />
                <span>Delete Account</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        position: 'relative',
        zIndex: 1,
        marginTop: '66px', 
        padding: '24px 20px',
        paddingBottom: isMobile ? '88px' : '24px',
        maxWidth: '1600px',
        width: '100%',
        margin: '66px auto 0 auto',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>

      {/* ─── SLEEK MOBILE BOTTOM NAVIGATION BAR (WHITE & ORANGE APP FEEL) ─── */}
      {isMobile && user && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderTop: '1.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 1000,
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
          padding: '0 8px'
        }}>
          {[
            {
              label: 'Portfolio',
              path: '/dashboard',
              tab: 'overview',
              icon: LayoutDashboard,
              active: location.pathname === '/dashboard' && (!location.search || location.search.includes('tab=overview'))
            },
            {
              label: 'Hours',
              path: '/dashboard?tab=hours',
              tab: 'hours',
              icon: Clock,
              active: location.pathname === '/dashboard' && location.search.includes('tab=hours')
            },
            {
              label: 'Arena',
              path: '/trading',
              icon: Zap,
              highlight: true,
              active: location.pathname === '/trading'
            },
            {
              label: 'Risk Calc',
              path: '/dashboard?tab=calculator',
              tab: 'calculator',
              icon: Calculator,
              active: location.pathname === '/dashboard' && location.search.includes('tab=calculator')
            },
            {
              label: 'Radar',
              path: '/global-markets',
              icon: Globe,
              active: location.pathname === '/global-markets'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            if (item.highlight) {
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  style={{
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
                    marginTop: '-16px',
                    transition: 'transform 0.15s ease'
                  }}
                  title="Enter Trading Arena"
                >
                  <Icon size={22} color="#FFFFFF" />
                </button>
              );
            }

            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer',
                  color: item.active ? '#EA580C' : '#64748B',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  transition: 'color 0.15s ease'
                }}
              >
                <Icon size={18} color={item.active ? '#EA580C' : '#64748B'} />
                <span style={{ fontSize: '10px', fontWeight: item.active ? 900 : 700 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {selectedTicker && (
        <StockActionModal 
          symbol={selectedTicker} 
          onClose={() => setSelectedTicker(null)} 
        />
      )}

      <WarningModal />
      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
}