import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Sun, Moon, User
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Sleek Top Unified Header Navigation */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000,
      }}>
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
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
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: location.pathname === '/dashboard' ? '#F0FDF4' : 'transparent',
                  color: location.pathname === '/dashboard' ? '#10B981' : '#475569',
                  border: location.pathname === '/dashboard' ? '1px solid #BBF7D0' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate('/trading')}
                style={{
                  background: location.pathname === '/trading' ? '#10B981' : '#F8FAFC',
                  color: location.pathname === '/trading' ? '#FFFFFF' : '#0F172A',
                  border: location.pathname === '/trading' ? '1px solid #10B981' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '6px 16px',
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
                <span>⚡ Trading Arena</span>
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
                    gap: '5px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>🔍</span>
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
                    gap: '5px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>🤖</span>
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
                    gap: '5px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>🧪</span>
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
                    gap: '5px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>⏳</span>
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
                <span>🪙</span>
                <span>{coins || 0} Coins</span>
              </div>

              {/* Tag Badge */}
              <div 
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: '#0F172A',
                  border: `1.5px solid ${badge.color}`,
                  color: badge.color,
                  fontWeight: 900,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: badge.glow !== 'none' ? badge.glow : 'none',
                  textShadow: badge.glow !== 'none' ? badge.glow : 'none',
                }}
              >
                {badge.name}
              </div>

              {/* Profile Pill with User Name in Tag Color */}
              <div 
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}
              >
                <User size={15} style={{ color: badge.color }} />
                <span style={{ fontSize: '13px', fontWeight: 800, color: badge.color }}>
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
              navigate('/login');
            }}
            style={{
              background: 'transparent',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#475569',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Logout
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