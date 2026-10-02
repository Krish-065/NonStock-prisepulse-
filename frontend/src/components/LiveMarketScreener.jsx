import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, ArrowRight, Zap, RefreshCw, 
  Search, SlidersHorizontal, Eye, BarChart2, Globe, Shield, Sparkles
} from 'lucide-react';
import { apiClient } from '../services/api';

// Initial realistic baseline data for Screener instruments
const INITIAL_ASSETS = [
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    category: 'crypto',
    categoryLabel: 'Crypto',
    badge: 'BTC',
    price: 64450.25,
    change: 1120.50,
    changePercent: 1.77,
    dayHigh: 65200.00,
    dayLow: 63150.00,
    volume: '24.2B',
    digits: 2,
    prefix: '$',
    sparkline: [63200, 63350, 63150, 63400, 63800, 63650, 63900, 64100, 63950, 64200, 64050, 64300, 64150, 64400, 64250, 64350, 64500, 64380, 64420, 64450.25]
  },
  {
    symbol: 'GC=F',
    name: 'Gold Spot / Futures (XAU/USD)',
    category: 'commodities',
    categoryLabel: 'Gold & Metals',
    badge: 'XAU',
    price: 2518.40,
    change: 18.60,
    changePercent: 0.74,
    dayHigh: 2526.80,
    dayLow: 2496.20,
    volume: '14.8B',
    digits: 2,
    prefix: '$',
    sparkline: [2498, 2501, 2499, 2504, 2508, 2505, 2510, 2512, 2509, 2514, 2511, 2515, 2513, 2516, 2514, 2517, 2519, 2516, 2517.5, 2518.40]
  },
  {
    symbol: 'EURUSD=X',
    name: 'Euro / US Dollar',
    category: 'forex',
    categoryLabel: 'Forex Major',
    badge: 'EUR/USD',
    price: 1.0848,
    change: 0.0024,
    changePercent: 0.22,
    dayHigh: 1.0875,
    dayLow: 1.0815,
    volume: '88.4B',
    digits: 4,
    prefix: '$',
    sparkline: [1.0818, 1.0822, 1.0820, 1.0826, 1.0831, 1.0829, 1.0835, 1.0838, 1.0834, 1.0840, 1.0837, 1.0842, 1.0839, 1.0844, 1.0842, 1.0845, 1.0849, 1.0846, 1.0847, 1.0848]
  },
  {
    symbol: 'GBPUSD=X',
    name: 'British Pound / US Dollar',
    category: 'forex',
    categoryLabel: 'Forex Major',
    badge: 'GBP/USD',
    price: 1.3032,
    change: -0.0016,
    changePercent: -0.12,
    dayHigh: 1.3072,
    dayLow: 1.2995,
    volume: '62.1B',
    digits: 4,
    prefix: '$',
    sparkline: [1.3060, 1.3055, 1.3058, 1.3050, 1.3045, 1.3048, 1.3040, 1.3036, 1.3039, 1.3033, 1.3037, 1.3030, 1.3034, 1.3028, 1.3032, 1.3029, 1.3031, 1.3030, 1.3033, 1.3032]
  },
  {
    symbol: 'USDJPY=X',
    name: 'US Dollar / Japanese Yen',
    category: 'forex',
    categoryLabel: 'Forex Major',
    badge: 'USD/JPY',
    price: 148.82,
    change: 0.54,
    changePercent: 0.36,
    dayHigh: 149.35,
    dayLow: 148.10,
    volume: '71.5B',
    digits: 2,
    prefix: '¥',
    sparkline: [148.15, 148.25, 148.20, 148.35, 148.45, 148.40, 148.55, 148.60, 148.52, 148.68, 148.62, 148.74, 148.70, 148.80, 148.75, 148.85, 148.88, 148.80, 148.81, 148.82]
  },
  {
    symbol: 'AUDUSD=X',
    name: 'Australian Dollar / US Dollar',
    category: 'forex',
    categoryLabel: 'Forex Major',
    badge: 'AUD/USD',
    price: 0.6724,
    change: 0.0018,
    changePercent: 0.27,
    dayHigh: 0.6748,
    dayLow: 0.6690,
    volume: '34.6B',
    digits: 4,
    prefix: '$',
    sparkline: [0.6695, 0.6702, 0.6698, 0.6706, 0.6712, 0.6709, 0.6715, 0.6718, 0.6714, 0.6720, 0.6717, 0.6722, 0.6719, 0.6724, 0.6721, 0.6723, 0.6726, 0.6722, 0.6723, 0.6724]
  },
  {
    symbol: 'USDCAD=X',
    name: 'US Dollar / Canadian Dollar',
    category: 'forex',
    categoryLabel: 'Forex Cross',
    badge: 'USD/CAD',
    price: 1.3538,
    change: -0.0014,
    changePercent: -0.10,
    dayHigh: 1.3575,
    dayLow: 1.3512,
    volume: '29.3B',
    digits: 4,
    prefix: '$',
    sparkline: [1.3562, 1.3558, 1.3560, 1.3552, 1.3548, 1.3550, 1.3545, 1.3542, 1.3544, 1.3539, 1.3542, 1.3536, 1.3540, 1.3535, 1.3538, 1.3537, 1.3539, 1.3536, 1.3537, 1.3538]
  }
];

// Interactive SVG Sparkline Renderer
function MiniSparkline({ data, isPositive, height = 54, width = 180, showGlow = true }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 5;
  const usableHeight = height - padding * 2;
  const step = width / (data.length - 1);

  // Generate path points
  const points = data.map((val, idx) => {
    const x = idx * step;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const lastPt = points[points.length - 1];
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const strokeColor = isPositive ? '#00a854' : '#ef4444';
  const fillGradientId = `spark-grad-${isPositive ? 'green' : 'red'}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${height}px`, overflow: 'hidden' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={isPositive ? "0.28" : "0.22"} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill underneath the line */}
        <path d={areaD} fill={`url(#${fillGradientId})`} />

        {/* The main price trajectory line */}
        <path 
          d={pathD} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Glowing Head Dot for live update position */}
        {showGlow && (
          <g>
            <circle cx={lastPt.x} cy={lastPt.y} r="5" fill={strokeColor} opacity="0.3">
              <animate attributeName="r" values="4;8;4" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.05;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx={lastPt.x} cy={lastPt.y} r="3" fill={strokeColor} />
            <circle cx={lastPt.x} cy={lastPt.y} r="1.5" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
}

export default function LiveMarketScreener({ onSelectAsset }) {
  const navigate = useNavigate();
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [activeTab, setActiveTab] = useState('all'); // all, crypto, commodities, forex
  const [viewMode, setViewMode] = useState('grid'); // grid, table
  const [searchFilter, setSearchFilter] = useState('');
  const [flashing, setFlashing] = useState({}); // { [symbol]: 'up' | 'down' }
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Attempt to sync realistic initial prices from backend if available
  const fetchBackendQuotes = async () => {
    setIsRefreshing(true);
    try {
      const symbolsToFetch = ['BTC-USD', 'GC=F', 'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD=X', 'USDCAD=X'];
      const responses = await Promise.allSettled(
        symbolsToFetch.map(sym => apiClient.get(`/market/stock/${sym}`))
      );

      setAssets(prevAssets => {
        return prevAssets.map((asset, idx) => {
          const res = responses[idx];
          if (res.status === 'fulfilled' && res.value?.data?.price) {
            const data = res.value.data;
            const newPrice = parseFloat(data.price);
            const newChange = parseFloat(data.change || 0);
            const newPct = parseFloat(data.changePercent || 0);
            const newHigh = parseFloat(data.dayHigh || asset.dayHigh);
            const newLow = parseFloat(data.dayLow || asset.dayLow);

            // Append to sparkline if changed
            const updatedSparkline = [...asset.sparkline.slice(-24), newPrice];

            return {
              ...asset,
              price: newPrice,
              change: newChange,
              changePercent: newPct,
              dayHigh: newHigh,
              dayLow: newLow,
              sparkline: updatedSparkline
            };
          }
          return asset;
        });
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Live screener backend quote fetch fallback:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBackendQuotes();
  }, []);

  // Real-time Live Micro-Tick Engine: mimics real exchange order flow every 2.2 seconds
  useEffect(() => {
    const tickInterval = setInterval(() => {
      // Pick 2-3 random assets to simulate streaming ticks
      setAssets(prevAssets => {
        const nextAssets = [...prevAssets];
        const countToUpdate = Math.floor(Math.random() * 2) + 2; // 2 or 3 assets update per tick

        for (let i = 0; i < countToUpdate; i++) {
          const targetIndex = Math.floor(Math.random() * nextAssets.length);
          const current = nextAssets[targetIndex];

          // Compute realistic micro-tick variance depending on asset category
          let delta = 0;
          if (current.category === 'crypto') {
            // BTC ticks ±$8 to ±$32
            delta = (Math.random() - 0.49) * 28;
          } else if (current.category === 'commodities') {
            // Gold ticks ±$0.30 to ±$1.20
            delta = (Math.random() - 0.49) * 0.95;
          } else if (current.symbol === 'USDJPY=X') {
            // JPY ticks ±0.03 to ±0.08
            delta = (Math.random() - 0.49) * 0.06;
          } else {
            // Standard Forex ticks ±0.0001 to ±0.0003
            delta = (Math.random() - 0.49) * 0.00025;
          }

          const rawNewPrice = current.price + delta;
          const newPrice = parseFloat(rawNewPrice.toFixed(current.digits));
          const priceDiff = newPrice - current.price;

          if (Math.abs(priceDiff) > 0) {
            const direction = priceDiff > 0 ? 'up' : 'down';
            
            // Trigger temporary visual flash
            setFlashing(prev => ({ ...prev, [current.symbol]: direction }));
            setTimeout(() => {
              setFlashing(prev => {
                const copy = { ...prev };
                delete copy[current.symbol];
                return copy;
              });
            }, 650);

            // Update sparkline trajectory (keep last 25 points)
            const updatedSparkline = [...current.sparkline.slice(-24), newPrice];
            const newDayHigh = Math.max(current.dayHigh, newPrice);
            const newDayLow = Math.min(current.dayLow, newPrice);
            const updatedChange = current.change + delta;
            const updatedChangePct = (updatedChange / (newPrice - updatedChange)) * 100;

            nextAssets[targetIndex] = {
              ...current,
              price: newPrice,
              change: updatedChange,
              changePercent: updatedChangePct,
              dayHigh: newDayHigh,
              dayLow: newDayLow,
              sparkline: updatedSparkline
            };
          }
        }

        return nextAssets;
      });
      setLastUpdated(new Date());
    }, 2200);

    return () => clearInterval(tickInterval);
  }, []);

  // Filtered Assets based on tabs & search input
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      const matchesCategory = 
        activeTab === 'all' ? true :
        activeTab === 'crypto' ? item.category === 'crypto' :
        activeTab === 'commodities' ? item.category === 'commodities' :
        activeTab === 'forex' ? item.category === 'forex' : true;

      const q = searchFilter.trim().toLowerCase();
      const matchesSearch = !q || 
        item.symbol.toLowerCase().includes(q) || 
        item.name.toLowerCase().includes(q) || 
        item.badge.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [assets, activeTab, searchFilter]);

  const handleTradeAsset = (asset) => {
    let sym = 'BTCUSDT';
    if (asset.symbol === 'BTC-USD') sym = 'BTCUSDT';
    else if (asset.symbol === 'GC=F') sym = 'XAUUSD';
    else if (asset.symbol === 'EURUSD=X') sym = 'EURUSD';
    else if (asset.symbol === 'GBPUSD=X') sym = 'GBPUSD';
    else if (asset.symbol === 'USDJPY=X') sym = 'USDJPY';
    else if (asset.symbol === 'AUDUSD=X') sym = 'AUDUSD';
    else if (asset.symbol === 'USDCAD=X') sym = 'USDCAD';
    else sym = (asset.badge || asset.symbol).replace(/[\/\-=]/g, '');

    localStorage.setItem('nonstock_active_symbol', sym);

    if (onSelectAsset) {
      onSelectAsset(asset);
    } else {
      navigate('/trading');
    }
  };

  const formatPriceValue = (val, digits, prefix = '$') => {
    if (val === undefined || val === null) return '0.00';
    return `${prefix}${val.toLocaleString(undefined, { 
      minimumFractionDigits: digits, 
      maximumFractionDigits: digits 
    })}`;
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
      marginBottom: '40px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* ─── SCREENER HEADER ─── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        borderBottom: '2px solid #f0fdf4',
        paddingBottom: '20px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {/* Pulsing Live Radar Indicator */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.8px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#00a854',
                boxShadow: '0 0 10px #00a854',
                display: 'inline-block',
                animation: 'pulse 1.5s infinite'
              }} />
              LIVE TICK STREAM
            </span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={24} color="#00a854" /> Global Market Screener & Price Radar
          </h2>
          <p style={{ fontSize: '14px', color: '#475569', margin: '4px 0 0 0', fontWeight: 500 }}>
            Live updating prices, dynamic line charts, and direct execution tickets for BTC, Gold, and Forex pairs.
          </p>
        </div>

        {/* Screener Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Search ticker / currency..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                padding: '8px 12px 8px 34px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                background: '#f8fafc',
                width: '190px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#00a854'; e.target.style.background = '#ffffff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
            />
          </div>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: viewMode === 'grid' ? '#000000' : '#64748b',
                cursor: 'pointer',
                boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              Cards
            </button>
            <button 
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: viewMode === 'table' ? '#000000' : '#64748b',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              Table View
            </button>
          </div>

          {/* Manual Re-sync button */}
          <button 
            onClick={fetchBackendQuotes}
            disabled={isRefreshing}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '8px 12px',
              borderRadius: '10px',
              color: '#334155',
              cursor: isRefreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
            title="Refresh prices"
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00a854'; e.currentTarget.style.color = '#00a854'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ─── CATEGORY FILTER TABS ─── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Instruments', count: assets.length },
          { id: 'crypto', label: 'Crypto (BTC)', count: assets.filter(a => a.category === 'crypto').length },
          { id: 'commodities', label: 'Gold & Metals (XAU)', count: assets.filter(a => a.category === 'commodities').length },
          { id: 'forex', label: 'Forex Majors', count: assets.filter(a => a.category === 'forex').length }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? '#00a854' : '#f8fafc',
                color: isActive ? '#ffffff' : '#475569',
                border: `1px solid ${isActive ? '#00a854' : '#e2e8f0'}`,
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 12px rgba(0, 168, 84, 0.25)' : 'none'
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
                color: isActive ? '#ffffff' : '#64748b',
                padding: '2px 7px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 800
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── VIEW MODE: GRID OF CARDS (VISUAL SPARKLINE FOCUS) ─── */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredAssets.map(asset => {
            const isPos = asset.change >= 0;
            const flashState = flashing[asset.symbol];
            const flashBg = flashState === 'up' 
              ? 'rgba(0, 168, 84, 0.12)' 
              : flashState === 'down' 
              ? 'rgba(239, 68, 68, 0.12)' 
              : '#ffffff';
            const flashBorder = flashState === 'up'
              ? '1px solid #00a854'
              : flashState === 'down'
              ? '1px solid #ef4444'
              : '1px solid #e5e7eb';

            // Calculate Day Range position percentage
            const rangeWidth = asset.dayHigh - asset.dayLow || 1;
            const rangePos = Math.min(100, Math.max(0, ((asset.price - asset.dayLow) / rangeWidth) * 100));

            return (
              <div 
                key={asset.symbol}
                style={{
                  background: flashBg,
                  border: flashBorder,
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 168, 84, 0.12)';
                  e.currentTarget.style.borderColor = '#00a854';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                {/* Card Top: Asset Identification */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: asset.category === 'crypto' ? '#fef3c7' : asset.category === 'commodities' ? '#fef08a' : '#dcfce7',
                        border: `1px solid ${asset.category === 'crypto' ? '#fde047' : asset.category === 'commodities' ? '#facc15' : '#86efac'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '13px',
                        color: asset.category === 'crypto' ? '#b45309' : asset.category === 'commodities' ? '#a16207' : '#15803d'
                      }}>
                        {asset.badge.split('/')[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 900, color: '#000000', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {asset.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          {asset.symbol} • {asset.categoryLabel}
                        </div>
                      </div>
                    </div>

                    {/* 24h Change Pill */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: isPos ? '#f0fdf4' : '#fef2f2',
                      color: isPos ? '#00a854' : '#ef4444',
                      border: `1px solid ${isPos ? '#bbf7d0' : '#fecaca'}`,
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800
                    }}>
                      {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Price & Sparkline Row */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-end', 
                    margin: '12px 0 16px 0',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>
                        LIVE PRICE
                      </div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 900,
                        color: flashState === 'up' ? '#00a854' : flashState === 'down' ? '#ef4444' : '#000000',
                        letterSpacing: '-0.5px',
                        transition: 'color 0.2s'
                      }}>
                        {formatPriceValue(asset.price, asset.digits, asset.prefix)}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: isPos ? '#00a854' : '#ef4444', 
                        fontWeight: 700, 
                        marginTop: '2px' 
                      }}>
                        {isPos ? '+' : ''}{asset.change > 0 ? '+' : ''}{asset.change.toFixed(asset.digits)} 24h
                      </div>
                    </div>

                    {/* Smooth Live Sparkline SVG */}
                    <div style={{ flexShrink: 0 }}>
                      <MiniSparkline 
                        data={asset.sparkline} 
                        isPositive={isPos} 
                        height={54} 
                        width={130} 
                      />
                    </div>
                  </div>

                  {/* 24h High/Low Range Bar */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                      <span>Low: {formatPriceValue(asset.dayLow, asset.digits, asset.prefix)}</span>
                      <span>High: {formatPriceValue(asset.dayHigh, asset.digits, asset.prefix)}</span>
                    </div>
                    {/* Track */}
                    <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '10px', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        width: `${rangePos}%`,
                        height: '100%',
                        background: '#00a854',
                        borderRadius: '10px'
                      }} />
                      {/* Current Point Indicator */}
                      <div style={{
                        position: 'absolute',
                        left: `calc(${rangePos}% - 4px)`,
                        top: '-3px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#00a854',
                        border: '2px solid #ffffff',
                        boxShadow: '0 0 4px rgba(0,0,0,0.3)'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Card Action: Direct Paper Trade */}
                <button
                  onClick={() => handleTradeAsset(asset)}
                  style={{
                    background: '#f0fdf4',
                    color: '#00a854',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#00a854';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#00a854';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f0fdf4';
                    e.currentTarget.style.color = '#00a854';
                    e.currentTarget.style.borderColor = '#bbf7d0';
                  }}
                >
                  <span>Trade {asset.badge} Now</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── VIEW MODE: STREAMLINED TABLE VIEW ─── */}
      {viewMode === 'table' && (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>INSTRUMENT</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>MARKET</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#64748b', textAlign: 'right' }}>LIVE PRICE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#64748b', textAlign: 'right' }}>24H CHANGE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>24H RANGE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#64748b', textAlign: 'center' }}>LIVE TREND</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#64748b', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, idx) => {
                const isPos = asset.change >= 0;
                const flashState = flashing[asset.symbol];

                return (
                  <tr 
                    key={asset.symbol}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: flashState === 'up' ? 'rgba(0, 168, 84, 0.08)' : flashState === 'down' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!flashState) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseOut={(e) => {
                      if (!flashState) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          fontWeight: 800,
                          fontSize: '11px',
                          color: '#0f172a'
                        }}>
                          {asset.badge}
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#000000', display: 'block' }}>{asset.name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{asset.symbol}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f0fdf4',
                        color: '#166534'
                      }}>
                        {asset.categoryLabel}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, fontSize: '15px', color: '#000000' }}>
                      {formatPriceValue(asset.price, asset.digits, asset.prefix)}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: isPos ? '#00a854' : '#ef4444',
                        fontWeight: 800,
                        fontSize: '13px'
                      }}>
                        {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                      <div>L: {formatPriceValue(asset.dayLow, asset.digits, asset.prefix)}</div>
                      <div>H: {formatPriceValue(asset.dayHigh, asset.digits, asset.prefix)}</div>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <MiniSparkline 
                          data={asset.sparkline} 
                          isPositive={isPos} 
                          height={40} 
                          width={110} 
                        />
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleTradeAsset(asset)}
                        style={{
                          background: '#00a854',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <span>Trade</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Pro Tip Bar */}
      <div style={{
        marginTop: '20px',
        padding: '12px 16px',
        background: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#00a854" />
          <span style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>
            <strong>Edge Proving Tip:</strong> High DER traders prioritize high-liquidity pairs like EUR/USD & BTC/USD during New York and London session crossovers to minimize spread impact.
          </span>
        </div>
        <button 
          onClick={() => navigate('/trading')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#00a854',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          Open Trading Terminal <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
