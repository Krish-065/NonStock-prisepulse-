import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

export default function Commodities() {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const res = await apiClient.get('/market/commodities');
        setCommodities(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommodities();
    const interval = setInterval(fetchCommodities, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(0, 255, 136, 0.1)',
          borderTop: '4px solid #00ff88',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ color: '#ffffff' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(90deg, #ffb300, #fffae0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Commodities Market
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Live global commodities spot pricing and futures charts.
        </p>
      </div>

      <div className="crypto-grid" style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '20px' 
      }}>
        {commodities.map(item => (
          <div 
            key={item.symbol} 
            className="index-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '12px', 
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              padding: '24px 16px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(8px)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.transform = 'none';
            }}
            onClick={() => navigate('/markets', { state: { selectSymbol: item.symbol } })}
          >
            {item.image && (
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#ffffff' }}>{item.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px', fontWeight: 600 }}>{item.symbol}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>${item.price}</div>
              <div 
                style={{ 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: item.up ? '#00ff88' : '#ff4444',
                  background: item.up ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 68, 68, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: item.up ? '1px solid rgba(0, 255, 136, 0.15)' : '1px solid rgba(255, 68, 68, 0.15)'
                }}
              >
                {item.up ? '+' : ''}{item.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
