import { useState, useMemo } from 'react';
import { 
  X, Search, Sliders, Check, Lock, Sparkles, 
  TrendingUp, Activity, BarChart2, Layers, HelpCircle, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

export const INDICATOR_DEFINITIONS = [
  {
    id: 'sma20',
    name: 'Simple Moving Average (SMA 20)',
    shortName: 'SMA',
    category: 'trend',
    categoryLabel: 'Trend Following',
    color: '#00bcd4',
    isPro: false,
    defaultParams: 'Period: 20 • Source: Close',
    description: 'Smooths price fluctuations over the last 20 periods to highlight the primary short-to-medium trend trajectory.'
  },
  {
    id: 'ema50',
    name: 'Exponential Moving Average (EMA 50)',
    shortName: 'EMA',
    category: 'trend',
    categoryLabel: 'Trend Following',
    color: '#ff9800',
    isPro: false,
    defaultParams: 'Period: 50 • Multiplier: 2/(50+1)',
    description: 'Places higher mathematical weighting on recent candle closes, reacting faster to market reversals than an SMA.'
  },
  {
    id: 'rsi',
    name: 'Relative Strength Index (RSI 14)',
    shortName: 'RSI',
    category: 'momentum',
    categoryLabel: 'Momentum & Oscillators',
    color: '#e040fb',
    isPro: false,
    defaultParams: 'Period: 14 • Overbought: 70 • Oversold: 30',
    description: 'Momentum oscillator (0-100) measuring velocity of price changes. Flags overbought conditions above 70 and oversold below 30.'
  },
  {
    id: 'macd',
    name: 'MACD (12, 26, 9)',
    shortName: 'MACD',
    category: 'momentum',
    categoryLabel: 'Momentum & Oscillators',
    color: '#00e676',
    isPro: false,
    defaultParams: 'Fast: 12 • Slow: 26 • Signal: 9',
    description: 'Calculates the difference between 12-period and 26-period EMAs, overlaid with a 9-period signal trigger line.'
  },
  {
    id: 'bollinger',
    name: 'Bollinger Bands (20, 2)',
    shortName: 'BB',
    category: 'volatility',
    categoryLabel: 'Volatility & Envelopes',
    color: '#ffeb3b',
    isPro: true,
    defaultParams: 'Length: 20 • StdDev Multiplier: 2.0',
    description: 'Envelopes price between statistical upper and lower standard deviation bands around a 20-period moving average.'
  },
  {
    id: 'vwap',
    name: 'Volume Weighted Average Price (VWAP)',
    shortName: 'VWAP',
    category: 'trend',
    categoryLabel: 'Trend & Volume',
    color: '#3f51b5',
    isPro: true,
    defaultParams: 'Anchor: Daily Session • Source: Typical Price',
    description: 'The definitive institutional benchmark representing the average transaction price weighted across aggregate traded volume.'
  },
  {
    id: 'stochRsi',
    name: 'Stochastic RSI (14, 14, 3, 3)',
    shortName: 'Stoch RSI',
    category: 'momentum',
    categoryLabel: 'Momentum & Oscillators',
    color: '#ff5722',
    isPro: true,
    defaultParams: 'RSI Length: 14 • Stoch Length: 14 • %K: 3 • %D: 3',
    description: 'Applies the Stochastic formula directly to RSI values, creating an ultra-sensitive oscillator for high-frequency reversals.'
  },
  {
    id: 'ichimoku',
    name: 'Ichimoku Cloud (9, 26, 52)',
    shortName: 'Ichimoku',
    category: 'trend',
    categoryLabel: 'Comprehensive Cloud',
    color: '#e91e63',
    isPro: true,
    defaultParams: 'Tenkan: 9 • Kijun: 26 • Senkou B: 52',
    description: 'Japanese multi-line system projecting future support, resistance, trend direction, and momentum at a single glance.'
  },
  {
    id: 'pivotPoints',
    name: 'Standard Pivot Points (P, R1, S1, R2, S2)',
    shortName: 'Pivots',
    category: 'levels',
    categoryLabel: 'Support & Resistance',
    color: '#9c27b0',
    isPro: true,
    defaultParams: 'Method: Classical Floor Trader',
    description: 'Calculates mathematical support (S1, S2) and resistance (R1, R2) pivot levels derived from previous session high, low, and close.'
  },
  {
    id: 'sar',
    name: 'Parabolic SAR (0.02, 0.20)',
    shortName: 'PSAR',
    category: 'trend',
    categoryLabel: 'Trend & Exits',
    color: '#009688',
    isPro: true,
    defaultParams: 'Step: 0.02 • Max Step: 0.20',
    description: 'Stop-and-Reverse trailing indicator plotting dots above or below candles, pinpointing dynamic trailing stop loss levels.'
  }
];

export default function ChartIndicatorsModal({
  isOpen,
  onClose,
  activeIndicators,
  onToggleIndicator,
  isPro = false,
  onUpgradePro
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIndicators = useMemo(() => {
    return INDICATOR_DEFINITIONS.filter(ind => {
      const matchesCat = selectedCategory === 'all' || ind.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || 
        ind.name.toLowerCase().includes(q) || 
        ind.shortName.toLowerCase().includes(q) || 
        ind.description.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [search, selectedCategory]);

  const activeCount = Object.values(activeIndicators || {}).filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              color: '#EA580C',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '15px'
            }}>
              fx
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#000000' }}>
                Technical Indicators & Studies
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: 500 }}>
                {activeCount} active indicator{activeCount === 1 ? '' : 's'} plotted on chart
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#000000'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Search indicators by name or keyword (e.g. RSI, Moving Average, Bollinger)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                color: '#0f172a',
                fontWeight: 500,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onFocus={(e) => e.target.style.borderColor = '#EA580C'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'All (10)' },
              { id: 'trend', label: 'Trend & Averages' },
              { id: 'momentum', label: 'Momentum & Oscillators' },
              { id: 'volatility', label: 'Volatility' },
              { id: 'levels', label: 'Support & Pivots' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: selectedCategory === cat.id ? '#EA580C' : '#ffffff',
                  color: selectedCategory === cat.id ? '#ffffff' : '#64748b',
                  border: `1px solid ${selectedCategory === cat.id ? '#EA580C' : '#e2e8f0'}`,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Indicators List */}
        <div style={{
          padding: '16px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1
        }}>
          {filteredIndicators.map(ind => {
            const isActive = !!activeIndicators[ind.id];
            const isLocked = ind.isPro && !isPro;

            return (
              <div
                key={ind.id}
                style={{
                  background: isActive ? '#FFF7ED' : '#ffffff',
                  border: `1px solid ${isActive ? '#FED7AA' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '16px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? '0 2px 8px rgba(234, 88, 12, 0.08)' : 'none'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: ind.color
                    }} />
                    <strong style={{ fontSize: '14px', fontWeight: 800, color: '#000000' }}>
                      {ind.name}
                    </strong>

                    {ind.isPro && (
                      <span style={{
                        background: '#fef3c7',
                        color: '#b45309',
                        border: '1px solid #fde047',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        PRO
                      </span>
                    )}

                    <span style={{
                      fontSize: '11px',
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}>
                      {ind.categoryLabel}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    {ind.description}
                  </p>

                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Parameters: {ind.defaultParams}
                  </div>
                </div>

                {/* Toggle Action */}
                <div style={{ flexShrink: 0 }}>
                  {isLocked ? (
                    <button
                      onClick={() => {
                        toast.error(`${ind.shortName} requires a Pro Account. Upgrade to unlock!`);
                        if (onUpgradePro) onUpgradePro();
                      }}
                      style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde047',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Lock size={12} /> Unlock
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleIndicator(ind.id)}
                      style={{
                        background: isActive ? '#EA580C' : '#f8fafc',
                        color: isActive ? '#ffffff' : '#475569',
                        border: `1px solid ${isActive ? '#EA580C' : '#cbd5e1'}`,
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s'
                      }}
                    >
                      {isActive && <Check size={14} />}
                      <span>{isActive ? 'Active' : 'Apply'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Indicators render directly onto both Native and TradingView chart engines.
          </span>

          <button
            onClick={onClose}
            style={{
              background: '#EA580C',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
