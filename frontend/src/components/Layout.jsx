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
  const { badge } = useTrading();
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
        {/* Left: Brand Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div 
            onClick={() => navigate('/')} 
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Logo size={36} showName={true} showTagline={false} nameSize="20px" />
          </div>
        </div>

        {/* Right: Actions (Theme Toggle & Profile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: 'rgba(15, 23, 42, 0.05)',
                  border: `1px solid ${badge.color}`,
                  color: badge.color,
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: badge.glow !== 'none' ? badge.glow : 'none',
                  textShadow: badge.glow !== 'none' ? badge.glow : 'none',
                }}
              >
                {badge.name}
              </div>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}
              >
                <User size={16} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{user.name || user.email?.split('@')[0]}</span>
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