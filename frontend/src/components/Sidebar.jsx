import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Search, 
  Star, 
  Briefcase, 
  LineChart, 
  Coins, 
  Newspaper, 
  Calculator, 
  User, 
  Sun, 
  Moon, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/markets', label: 'Markets', icon: <TrendingUp size={18} /> },
    { path: '/screener', label: 'Screener', icon: <Search size={18} /> },
    { path: '/watchlist', label: 'Watchlist', icon: <Star size={18} /> },
    { path: '/portfolio', label: 'Portfolio', icon: <Briefcase size={18} /> },
    { path: '/ipos', label: 'IPOs', icon: <LineChart size={18} /> },
    { path: '/crypto', label: 'Crypto', icon: <Coins size={18} /> },
    { path: '/news', label: 'News', icon: <Newspaper size={18} /> },
    { path: '/tools', label: 'Tools', icon: <Calculator size={18} /> },
    { path: '/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '260px',
      height: '100vh',
      background: 'rgba(19, 23, 34, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(0, 255, 136, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      <div style={{ padding: '24px 20px', fontSize: '20px', fontWeight: 700, borderBottom: '1px solid rgba(0, 255, 136, 0.2)' }}>
        <span style={{ background: 'linear-gradient(135deg, #00ff88, #00bcd4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>PricePulse</span>
      </div>
      <nav style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              color: isActive ? '#00ff88' : '#9b9eac',
              textDecoration: 'none',
              background: isActive ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              borderRight: isActive ? '3px solid #00ff88' : 'none'
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '20px', borderTop: '1px solid rgba(0, 255, 136, 0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={toggleTheme} 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        >
          {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
        </button>
        <button 
          onClick={logout} 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '8px', color: '#ff4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}
          onMouseOver={(e) => { e.target.style.background = 'rgba(255,68,68,0.2)'; }}
          onMouseOut={(e) => { e.target.style.background = 'rgba(255,68,68,0.1)'; }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}