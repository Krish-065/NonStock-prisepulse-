import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/api';
import { 
  Search, TrendingUp, TrendingDown, RefreshCw, Filter, Zap, Sliders, 
  CheckCircle, ArrowUpRight, Download, BarChart2, ShieldCheck, Flame, 
  ChevronRight, Sparkles, Layers, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import LiveMarketScreener from '../components/LiveMarketScreener';
import toast from 'react-hot-toast';

const SECTORS = ['All', 'IT', 'Banking', 'NBFC', 'Insurance', 'Oil & Gas', 'Auto', 'Pharma', 'FMCG', 'Metals', 'Power', 'Infra', 'Real Estate', 'Telecom'];

const TECHNICAL_PRESETS = [
  { id: 'all', label: 'All Equities', icon: Layers },
  { id: 'golden_cross', label: 'Golden Cross (20>50)', icon: Sparkles, badge: 'Bullish' },
  { id: 'volume_spike', label: 'Volume Surge (>1.8x)', icon: Flame, badge: 'High Flow' },
  { id: 'bb_squeeze', label: 'Bollinger Squeeze', icon: SlidersHorizontal, badge: 'Breakout Ready' },
  { id: 'rsi_oversold', label: 'RSI Oversold (<38)', icon: TrendingDown, badge: 'Dip Buy' },
  { id: 'rsi_overbought', label: 'RSI Overbought (>65)', icon: TrendingUp, badge: 'Overheated' },
  { id: 'near_52w_high', label: '52W High (<3%)', icon: ArrowUpRight, badge: 'ATH Test' },
  { id: 'strong_buy', label: 'Strong Buy Rating', icon: ShieldCheck, badge: 'Quant 80+' }
];

export default function Screener() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moverFilter, setMoverFilter] = useState('all'); // all, gainers, losers
  const [sectorFilter, setSectorFilter] = useState('All');
  const [technicalPreset, setTechnicalPreset] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('changePercent');
  const [sortDir, setSortDir] = useState('desc');

  // Custom technical filter panel
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [supertrendFilter, setSupertrendFilter] = useState('all'); // all, bullish, bearish
  const [minVolumeMultiple, setMinVolumeMultiple] = useState(0);

  const fetchStocks = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiClient.get('/market/stock-list');
      const data = res.data || [];
      setStocks(data);
      if (isManual) toast.success('Technical screener refreshed');
    } catch (err) {
      console.error('Error fetching screener stocks:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(() => fetchStocks(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Filtered stocks computation
  const filtered = useMemo(() => {
    let result = [...stocks];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(s => 
        (s.symbol || '').toLowerCase().includes(q) || 
        (s.name || '').toLowerCase().includes(q) || 
        (s.sector || '').toLowerCase().includes(q)
      );
    }

    if (sectorFilter !== 'All') {
      result = result.filter(s => s.sector === sectorFilter);
    }

    if (moverFilter === 'gainers') result = result.filter(s => parseFloat(s.changePercent) > 0);
    if (moverFilter === 'losers')  result = result.filter(s => parseFloat(s.changePercent) < 0);

    if (supertrendFilter !== 'all') {
      result = result.filter(s => (s.superTrend || '').toLowerCase() === supertrendFilter.toLowerCase());
    }

    if (minVolumeMultiple > 0) {
      result = result.filter(s => (s.volumeMultiple || 1) >= minVolumeMultiple);
    }

    if (technicalPreset === 'golden_cross') {
      result = result.filter(s => s.isGoldenCross);
    } else if (technicalPreset === 'volume_spike') {
      result = result.filter(s => s.isVolumeSpike || (s.volumeMultiple || 0) >= 1.8);
    } else if (technicalPreset === 'bb_squeeze') {
      result = result.filter(s => s.isBBSqueeze);
    } else if (technicalPreset === 'rsi_oversold') {
      result = result.filter(s => (s.rsi || 50) < 38);
    } else if (technicalPreset === 'rsi_overbought') {
      result = result.filter(s => (s.rsi || 50) > 65);
    } else if (technicalPreset === 'near_52w_high') {
      result = result.filter(s => (s.dist52WHigh || 10) <= 3.5);
    } else if (technicalPreset === 'strong_buy') {
      result = result.filter(s => s.technicalRating === 'STRONG_BUY' || (s.quantScore || 0) >= 78);
    }

    result.sort((a, b) => {
      const av = parseFloat(a[sortKey]) || 0;
      const bv = parseFloat(b[sortKey]) || 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return result;
  }, [stocks, search, sectorFilter, moverFilter, technicalPreset, supertrendFilter, minVolumeMultiple, sortKey, sortDir]);

  // Export CSV
  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No rows to export');
      return;
    }
    const headers = ['Symbol', 'Name', 'Sector', 'Price', 'Change%', 'RSI', 'EMA20', 'EMA50', 'VolumeMult', 'SuperTrend', 'Rating'];
    const rows = filtered.map(s => [
      s.symbol,
      `"${s.name || ''}"`,
      s.sector || '',
      s.price,
      s.changePercent,
      s.rsi,
      s.ema20,
      s.ema50,
      s.volumeMultiple,
      s.superTrend,
      s.technicalRating
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nonstock_technical_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Technical screener CSV exported');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#0F172A', background: '#F8FAFC' }}>
      {/* 1. Global Market Screener & Price Radar (Crypto, Metals, Forex) */}
      <LiveMarketScreener />

      {/* 2. Screener Header & Actions */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '20px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              Advanced Technical Screener & Quant Radar
            </h1>
            <span style={{
              fontSize: '11px',
              background: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0',
              padding: '3px 9px',
              borderRadius: '999px',
              fontWeight: 800
            }}>
              {filtered.length} SCREENED
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Multi-factor technical filters: EMA 20/50 Golden Crosses, Volume Spikes, Bollinger Squeeze, RSI Bands, & SuperTrend signals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fetchStocks(true)}
            disabled={refreshing}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            style={{
              background: showAdvancedFilters ? '#ECFDF5' : '#FFFFFF',
              border: showAdvancedFilters ? '1.5px solid #10B981' : '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: showAdvancedFilters ? '#059669' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sliders size={13} color={showAdvancedFilters ? '#059669' : '#64748B'} />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Technical Strategy Presets Chips */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {TECHNICAL_PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = technicalPreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setTechnicalPreset(preset.id)}
              style={{
                background: isActive ? '#ECFDF5' : '#FFFFFF',
                border: isActive ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                color: isActive ? '#059669' : '#64748B',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
              }}
            >
              <Icon size={14} color={isActive ? '#059669' : '#64748B'} />
              <span>{preset.label}</span>
              {preset.badge && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: 900,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: isActive ? '#10B981' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#64748B'
                }}>
                  {preset.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Advanced Filter Dropdowns */}
      {showAdvancedFilters && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '18px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              SuperTrend Direction
            </label>
            <select
              value={supertrendFilter}
              onChange={e => setSupertrendFilter(e.target.value)}
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px',
                color: '#0F172A',
                fontSize: '12px',
                outline: 'none',
                fontWeight: 600
              }}
            >
              <option value="all">All Directions</option>
              <option value="bullish">🟢 Bullish SuperTrend</option>
              <option value="bearish">🔴 Bearish SuperTrend</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Min Volume Spike Multiple: {minVolumeMultiple > 0 ? `${minVolumeMultiple}x` : 'Any'}
            </label>
            <input
              type="range"
              min="0"
              max="4"
              step="0.5"
              value={minVolumeMultiple}
              onChange={e => setMinVolumeMultiple(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#10B981' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setSupertrendFilter('all');
                setMinVolumeMultiple(0);
                setTechnicalPreset('all');
                setMoverFilter('all');
                setSectorFilter('All');
                setSearch('');
              }}
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* 5. Toolbar & Sector Selector */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Symbol, Company or Sector (e.g. RELIANCE, TCS, Banking)..."
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              color: '#0F172A',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* Gainers / Losers Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'gainers', 'losers'].map(m => (
            <button
              key={m}
              onClick={() => setMoverFilter(m)}
              style={{
                background: moverFilter === m ? '#ECFDF5' : '#F8FAFC',
                border: moverFilter === m ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                color: moverFilter === m ? '#059669' : '#64748B',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Sector Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SECTORS.map(sec => (
          <button
            key={sec}
            onClick={() => setSectorFilter(sec)}
            style={{
              padding: '5px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 700,
              background: sectorFilter === sec ? '#10B981' : '#FFFFFF',
              color: sectorFilter === sec ? '#FFFFFF' : '#64748B',
              border: sectorFilter === sec ? '1px solid #10B981' : '1px solid #E2E8F0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: sectorFilter === sec ? '0 2px 6px rgba(16, 185, 129, 0.2)' : 'none'
            }}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* 6. Technical Results Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        overflowX: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid #E2E8F0',
              textAlign: 'left',
              color: '#64748B',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              background: '#F8FAFC'
            }}>
              <th style={{ padding: '14px 16px' }}>Asset / Sector</th>
              <th style={{ padding: '14px 12px', cursor: 'pointer' }} onClick={() => handleSort('price')}>Price (₹)</th>
              <th style={{ padding: '14px 12px', cursor: 'pointer' }} onClick={() => handleSort('changePercent')}>1D Change</th>
              <th style={{ padding: '14px 12px', cursor: 'pointer' }} onClick={() => handleSort('rsi')}>RSI (14)</th>
              <th style={{ padding: '14px 12px' }}>Moving Avg Cross</th>
              <th style={{ padding: '14px 12px' }}>Volume Flow</th>
              <th style={{ padding: '14px 12px' }}>SuperTrend</th>
              <th style={{ padding: '14px 12px' }}>Quant Score</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Arena Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  No stocks match the selected technical filters and search query.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const chg = parseFloat(s.changePercent) || 0;
                const rsi = s.rsi || 50;
                const isCross = s.isGoldenCross;
                const isDeath = s.isDeathCross;
                const volMult = s.volumeMultiple || 1.0;
                const isSuperBull = (s.superTrend || '').toUpperCase() === 'BULLISH';

                return (
                  <tr
                    key={s.symbol}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Symbol & Sector in Solid Black Text */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{s.symbol}</span>
                        {s.isBBSqueeze && (
                          <span style={{ fontSize: '9px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>
                            SQUEEZE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{s.name || s.sector || 'Equity'}</div>
                    </td>

                    {/* Price in Bold Black */}
                    <td style={{ padding: '14px 12px', fontWeight: 800, color: '#0F172A' }}>
                      ₹{Number(s.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Change % */}
                    <td style={{ padding: '14px 12px', fontWeight: 800, color: chg >= 0 ? '#059669' : '#DC2626' }}>
                      {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                    </td>

                    {/* RSI */}
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 800,
                        background: rsi < 38 ? '#ECFDF5' : rsi > 65 ? '#FEF2F2' : '#F1F5F9',
                        color: rsi < 38 ? '#059669' : rsi > 65 ? '#DC2626' : '#0F172A'
                      }}>
                        <span>{rsi}</span>
                        <span style={{ fontSize: '10px', opacity: 0.8 }}>
                          {rsi < 38 ? 'OS' : rsi > 65 ? 'OB' : ''}
                        </span>
                      </div>
                    </td>

                    {/* Moving Avg Cross */}
                    <td style={{ padding: '14px 12px' }}>
                      {isCross ? (
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                          Golden Cross (20 &gt; 50)
                        </span>
                      ) : isDeath ? (
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #FECACA' }}>
                          Death Cross (20 &lt; 50)
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          Neutral Range
                        </span>
                      )}
                    </td>

                    {/* Volume Flow */}
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: volMult >= 1.8 ? '#D97706' : '#0F172A'
                        }}>
                          {volMult.toFixed(1)}x
                        </span>
                        {volMult >= 1.8 && <Flame size={12} color="#D97706" />}
                      </div>
                    </td>

                    {/* SuperTrend */}
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: isSuperBull ? '#ECFDF5' : '#FEF2F2',
                        color: isSuperBull ? '#059669' : '#DC2626'
                      }}>
                        {isSuperBull ? 'BULLISH' : 'BEARISH'}
                      </span>
                    </td>

                    {/* Quant Score */}
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 900,
                        background: '#F3E8FF',
                        color: '#7E22CE',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {s.quantScore || 72}/100
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate('/trading')}
                        style={{
                          background: '#10B981',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <span>Trade</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}