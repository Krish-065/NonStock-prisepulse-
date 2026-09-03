import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { Globe, TrendingUp, TrendingDown, RefreshCw, BarChart2, ShieldAlert, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Sparkline = ({ points, color = '#00b060' }) => (
  <svg width="90" height="28" viewBox="0 0 100 32" style={{ overflow: 'visible' }}>
    <path
      d={points}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Commodities() {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const forexPairs = [
    { symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', price: '83.88', change: '-0.05%', up: false, high: '83.95', low: '83.82', sparkline: 'M 0,15 Q 30,18 60,12 T 100,16' },
    { symbol: 'EUR/INR', name: 'Euro / Indian Rupee', price: '92.45', change: '+0.32%', up: true, high: '92.60', low: '92.10', sparkline: 'M 0,25 Q 30,12 60,18 T 100,6' },
    { symbol: 'GBP/INR', name: 'British Pound / Indian Rupee', price: '109.80', change: '+0.45%', up: true, high: '110.15', low: '109.30', sparkline: 'M 0,22 Q 25,28 50,12 T 100,4' },
    { symbol: 'JPY/INR', name: 'Japanese Yen / Indian Rupee', price: '0.575', change: '+0.80%', up: true, high: '0.580', low: '0.571', sparkline: 'M 0,26 Q 30,8 60,15 T 100,2' },
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: '1.1025', change: '+0.18%', up: true, high: '1.1045', low: '1.1002', sparkline: 'M 0,20 Q 30,12 60,16 T 100,8' },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: '1.3090', change: '+0.25%', up: true, high: '1.3120', low: '1.3060', sparkline: 'M 0,24 Q 30,10 60,14 T 100,5' },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: '145.80', change: '-0.65%', up: false, high: '146.50', low: '145.20', sparkline: 'M 0,5 Q 30,18 60,12 T 100,28' },
  ];

  const macroInsights = [
    { label: 'Gold / Silver Ratio', value: '85.33', desc: 'Metals valuation equilibrium' },
    { label: 'US Crude Inventory', value: '-2.4M bbl', desc: 'Weekly drawdown supporting oil prices' },
    { label: 'DXY Dollar Index', value: '101.42', desc: 'Weaker dollar boosting commodity spots' },
    { label: 'RBI Repo Rate', value: '6.50%', desc: 'Monetary policy stability' }
  ];

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const res = await apiClient.get('/market/commodities');
        setCommodities(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommodities();
    const interval = setInterval(fetchCommodities, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredCommodities = commodities.filter(c => {
    if (activeTab === 'precious') return ['GC=F', 'SI=F', 'PL=F', 'PA=F'].includes(c.symbol) || c.name.toLowerCase().includes('gold') || c.name.toLowerCase().includes('silver');
    if (activeTab === 'energy') return ['CL=F', 'BZ=F', 'NG=F'].includes(c.symbol) || c.name.toLowerCase().includes('oil') || c.name.toLowerCase().includes('gas');
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Commodities & Forex Desk
            <span style={{ fontSize: '11px', background: 'rgba(0, 176, 96, 0.1)', color: '#00b060', padding: '3px 10px', borderRadius: '20px', fontWeight: 800 }}>
              LIVE GLOBAL SPOTS
            </span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Real-time Energy, Precious Metals, Industrial Materials & Currency Derivatives Feed
          </p>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'All Commodities' },
            { id: 'precious', label: 'Precious Metals' },
            { id: 'energy', label: 'Energy Desk' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#00b060' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Macro Insight Barometer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {macroInsights.map((item, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{item.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#00b060', margin: '4px 0' }}>{item.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Commodities Grid */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Commodity Spot & Futures Contracts
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {filteredCommodities.map(item => (
            <div
              key={item.symbol}
              onClick={() => navigate('/markets', { state: { selectSymbol: item.symbol } })}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#00b060'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{item.symbol}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>${item.price}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: item.up ? '#00b060' : '#dc2626', marginTop: '2px' }}>
                  {item.up ? '+' : ''}{item.change}%
                </div>
              </div>
              <Sparkline points={item.up ? 'M 0,25 Q 30,10 60,18 T 100,4' : 'M 0,5 Q 30,18 60,12 T 100,28'} color={item.up ? '#00b060' : '#dc2626'} />
            </div>
          ))}
        </div>
      </div>

      {/* Global Forex Currency Desk */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} style={{ color: '#2563eb' }} /> Global Currency & Forex Desk
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Currency Pair</th>
                <th style={{ padding: '12px' }}>Spot Price</th>
                <th style={{ padding: '12px' }}>24h Change</th>
                <th style={{ padding: '12px' }}>Day Range (Low - High)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Trend Chart</th>
              </tr>
            </thead>
            <tbody>
              {forexPairs.map((pair, i) => (
                <tr 
                  key={i} 
                  onClick={() => navigate('/markets', { state: { selectSymbol: pair.symbol } })}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{pair.symbol}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{pair.name}</div>
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: 800, color: 'var(--text-primary)' }}>{pair.price}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 700, color: pair.up ? '#00b060' : '#dc2626' }}>{pair.change}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>{pair.low} - {pair.high}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <Sparkline points={pair.sparkline} color={pair.up ? '#00b060' : '#dc2626'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
