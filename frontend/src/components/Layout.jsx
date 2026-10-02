import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Sun, Moon, User, Zap, Search, Bot, 
  FlaskConical, Clock, Coins, LayoutDashboard, LogOut
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
  const { badge, coins, unlockedTools } = useTrading();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('nonstock_user_avatar') : null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary, #F8FAFC)', 
      color: 'var(--text-primary, #0F172A)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* High-Profile Competitive Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '62px',
        background: '#FFFFFF',
        borderBottom: '1.5px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <div 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Logo size={34} showName={true} showTagline={false} nameSize="19px" />
          </div>

          {/* Navigation Links */}
          {user && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: location.pathname === '/dashboard' ? '#F0FDF4' : 'transparent',
                  color: location.pathname === '/dashboard' ? '#10B981' : '#475569',
                  border: location.pathname === '/dashboard' ? '1px solid #BBF7D0' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigate('/trading')}
                style={{
                  background: location.pathname === '/trading' ? '#10B981' : '#F8FAFC',
                  color: location.pathname === '/trading' ? '#FFFFFF' : '#0F172A',
                  border: location.pathname === '/trading' ? '1px solid #10B981' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: location.pathname === '/trading' ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                <Zap size={14} />
                <span>Trading Arena</span>
              </button>

              {/* Dynamically Arrived Unlocked Features */}
              {unlockedTools?.screener && (
                <button
                  onClick={() => navigate('/screener')}
                  style={{
                    background: location.pathname === '/screener' ? '#F0FDF4' : 'transparent',
                    color: location.pathname === '/screener' ? '#10B981' : '#475569',
                    border: location.pathname === '/screener' ? '1px solid #BBF7D0' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Search size={14} />
                  <span>Screener</span>
                </button>
              )}

              {unlockedTools?.aiMentor && (
                <button
                  onClick={() => navigate('/ai-mentor')}
                  style={{
                    background: location.pathname === '/ai-mentor' ? '#F0FDF4' : 'transparent',
                    color: location.pathname === '/ai-mentor' ? '#10B981' : '#475569',
                    border: location.pathname === '/ai-mentor' ? '1px solid #BBF7D0' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Bot size={14} />
                  <span>AI Mentor</span>
                </button>
              )}

              {unlockedTools?.strategyLab && (
                <button
                  onClick={() => navigate('/strategy-builder')}
                  style={{
                    background: location.pathname === '/strategy-builder' ? '#F0FDF4' : 'transparent',
                    color: location.pathname === '/strategy-builder' ? '#10B981' : '#475569',
                    border: location.pathname === '/strategy-builder' ? '1px solid #BBF7D0' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <FlaskConical size={14} />
                  <span>Strategy Lab</span>
                </button>
              )}

              {unlockedTools?.replay && (
                <button
                  onClick={() => navigate('/replay')}
                  style={{
                    background: location.pathname === '/replay' ? '#F0FDF4' : 'transparent',
                    color: location.pathname === '/replay' ? '#10B981' : '#475569',
                    border: location.pathname === '/replay' ? '1px solid #BBF7D0' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Clock size={14} />
                  <span>Replay Engine</span>
                </button>
              )}
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Gold Coins Count in Navbar */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  background: '#FEF9C3',
                  border: '1.5px solid #FACC15',
                  color: '#713F12',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                title="Your Gold Coins Vault (Click to view analysis & unlock tools)"
              >
                <Coins size={14} color="#D97706" />
                <span>{coins || 0} Coins</span>
              </div>

              {/* Tag Badge */}
              <div 
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: '#0F172A',
                  border: `1.5px solid ${badge?.color || '#64748B'}`,
                  color: badge?.color || '#64748B',
                  fontWeight: 900,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: badge?.glow && badge.glow !== 'none' ? badge.glow : 'none',
                  textShadow: badge?.glow && badge.glow !== 'none' ? badge.glow : 'none',
                }}
              >
                {badge?.name || 'CONTENDER'}
              </div>

              {/* Profile Pill with User Name in Tag Color */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}
              >
                {savedAvatar ? (
                  <img 
                    src={savedAvatar} 
                    alt="Profile" 
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <User size={15} style={{ color: badge?.color || '#0F172A' }} />
                )}
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 900, 
                  color: badge?.color || '#0F172A',
                  textShadow: badge?.name === 'Silver' ? '0 1px 2px rgba(148, 163, 184, 0.4)'
                    : badge?.name === 'Gold' ? '0 1px 6px rgba(234, 179, 8, 0.35)'
                    : badge?.name === 'Master' ? '0 1px 6px rgba(225, 29, 72, 0.35)'
                    : badge?.name === 'Operator' ? '0 1px 8px rgba(168, 85, 247, 0.4)'
                    : 'none'
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

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              background: 'transparent',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '7px 14px',
              cursor: 'pointer',
              color: '#475569',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        marginTop: '60px', 
        padding: '24px',
        maxWidth: '1600px',
        width: '100%',
        margin: '60px auto 0 auto'
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