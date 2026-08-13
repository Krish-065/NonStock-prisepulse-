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
            {/* Commodity icon — SVG symbol with image overlay */}
            {(() => {
              const svgIcons = {
                'GC=F': ( // Gold — stacked bar
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                    <rect x="6" y="18" width="36" height="10" rx="3" fill="#FFB300" stroke="#FF8F00" strokeWidth="1.5"/>
                    <rect x="10" y="26" width="28" height="8" rx="2" fill="#FFC107" stroke="#FF8F00" strokeWidth="1.2"/>
                    <rect x="8" y="12" width="32" height="8" rx="2" fill="#FFD54F" stroke="#FF8F00" strokeWidth="1.2"/>
                    <text x="24" y="24.5" textAnchor="middle" fill="#7B4F00" fontSize="7" fontWeight="bold" fontFamily="sans-serif">GOLD</text>
                  </svg>
                ),
                'SI=F': ( // Silver — bar ingot
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                    <rect x="6" y="16" width="36" height="16" rx="4" fill="#B0BEC5" stroke="#78909C" strokeWidth="1.5"/>
                    <rect x="10" y="20" width="28" height="8" rx="2" fill="#CFD8DC" stroke="#90A4AE" strokeWidth="1"/>
                    <text x="24" y="25.5" textAnchor="middle" fill="#455A64" fontSize="7" fontWeight="bold" fontFamily="sans-serif">SILVER</text>
                  </svg>
                ),
                'CL=F': ( // Crude Oil — barrel
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                    <ellipse cx="24" cy="14" rx="14" ry="5" fill="#4A4A4A" stroke="#222" strokeWidth="1.2"/>
                    <rect x="10" y="14" width="28" height="22" fill="#333" stroke="#222" strokeWidth="1.2"/>
                    <ellipse cx="24" cy="36" rx="14" ry="5" fill="#3D3D3D" stroke="#222" strokeWidth="1.2"/>
                    <line x1="10" y1="22" x2="38" y2="22" stroke="#555" strokeWidth="1.5"/>
                    <line x1="10" y1="28" x2="38" y2="28" stroke="#555" strokeWidth="1.5"/>
                    <text x="24" y="26.5" textAnchor="middle" fill="#FFB300" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">OIL</text>
                  </svg>
                ),
                'BZ=F': ( // Brent Crude — refinery tower
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                    <rect x="20" y="10" width="8" height="28" rx="1" fill="#546E7A" stroke="#37474F" strokeWidth="1.2"/>
                    <rect x="14" y="20" width="20" height="14" rx="2" fill="#607D8B" stroke="#455A64" strokeWidth="1.2"/>
                    <rect x="10" y="34" width="28" height="5" rx="1" fill="#78909C" stroke="#455A64" strokeWidth="1"/>
                    <rect x="22" y="6" width="4" height="6" rx="1" fill="#FF7043"/>
                    <ellipse cx="24" cy="6" rx="3" ry="2" fill="#FF5722"/>
                    <text x="24" y="30" textAnchor="middle" fill="#FFB300" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">BRENT</text>
                  </svg>
                ),
                'NG=F': ( // Natural Gas — flame
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                    <path d="M24 40 C14 36 10 28 14 20 C16 14 20 10 24 8 C22 16 26 18 26 18 C26 18 30 12 28 8 C34 14 36 22 34 30 C32 36 28 40 24 40Z" fill="#FF6D00"/>
                    <path d="M24 40 C18 36 16 30 18 24 C20 20 22 18 24 16 C23 20 25 22 25 22 C26 18 28 16 28 16 C31 20 32 26 30 32 C28 37 26 40 24 40Z" fill="#FFD600"/>
                    <path d="M24 40 C20 38 19 34 20 30 C21 27 23 26 24 24 C24 27 25 28 26 28 C26 32 25 37 24 40Z" fill="#FFF9C4"/>
                  </svg>
                ),
                'HG=F': ( // Copper — coil/wire
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                    <circle cx="24" cy="24" r="14" fill="none" stroke="#B84A00" strokeWidth="4"/>
                    <circle cx="24" cy="24" r="9" fill="none" stroke="#E65100" strokeWidth="3"/>
                    <circle cx="24" cy="24" r="4" fill="none" stroke="#BF360C" strokeWidth="2.5"/>
                    <circle cx="24" cy="24" r="2" fill="#FF7043"/>
                    <line x1="24" y1="10" x2="38" y2="10" stroke="#B84A00" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                )
              };
              const icon = svgIcons[item.symbol];
              return (
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid rgba(255,179,0,0.25)',
                  background: 'rgba(20,22,40,0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        // Show SVG wrapper div if image fails
                        e.currentTarget.parentNode.style.background = 'rgba(20,22,40,0.8)';
                      }}
                    />
                  ) : icon ? icon : null}
                </div>
              );
            })()}
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
