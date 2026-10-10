import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, ArrowRight, Zap, Bell, Menu, 
  Coins, Flame, ShieldCheck, ChevronDown, CheckCircle2 
} from 'lucide-react';
import GoldCoin1K from './GoldCoin1K';

export default function MobilePortfolioHub({
  balance = 1000,
  netPnL = 0,
  netRoi = 0,
  coins = 0,
  streakDays = 1,
  derScore = 92,
  tierName = 'CONTENDER',
  className = '',
  style = {}
}) {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('6M');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Timeframe simulated historical curve points (relative to $1,000 baseline)
  const TIMEFRAME_DATA = {
    '1D': [1000, 1002, 998, 1005, 1004, 1008, 1000 + netPnL],
    '1W': [1000, 995, 1010, 1015, 1008, 1022, 1000 + netPnL],
    '1M': [1000, 1015, 990, 1030, 1045, 1040, 1000 + netPnL],
    '6M': [1000, 1050, 1030, 1120, 1180, 1260, 1000 + netPnL],
    '1Y': [1000, 1100, 1250, 1400, 1600, 1850, 1000 + netPnL],
    'ALL': [1000, 1080, 1220, 1450, 1720, 2000, 1000 + netPnL]
  };

  const points = TIMEFRAME_DATA[selectedTimeframe] || TIMEFRAME_DATA['6M'];
  const minVal = Math.min(...points) * 0.98;
  const maxVal = Math.max(...points) * 1.02;
  const range = maxVal - minVal || 1;

  const svgWidth = 340;
  const svgHeight = 160;

  // Convert data points to SVG coordinates
  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * (svgWidth - 20) + 10;
    const y = svgHeight - 20 - ((val - minVal) / range) * (svgHeight - 40);
    return { x, y, val };
  });

  // Construct smooth SVG path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${svgHeight} L ${coords[0].x} ${svgHeight} Z`;

  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : coords[coords.length - 1];

  return (
    <div 
      className={`mobile-portfolio-hub ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: '24px',
        padding: '24px 20px',
        boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: '#0F172A',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Top Mini Summary Pills (Horizontally scrollable, directly matching Screen 2) */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {/* Baseline Pod */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Baseline
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
              $1,000.00
            </div>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 900, color: '#C2410C', background: '#FFF7ED', padding: '2px 6px', borderRadius: '4px' }}>
            EQUAL
          </span>
        </div>

        {/* 1K Gold Coins Pod */}
        <div style={{
          background: '#FFFDF5',
          border: '1px solid #FDE047',
          borderRadius: '12px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          <GoldCoin1K size={22} showRings={false} animated={false} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#854D0E', textTransform: 'uppercase' }}>
              Gold Coins
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#713F12' }}>
              {coins}
            </div>
          </div>
        </div>

        {/* DER Score Pod */}
        <div style={{
          background: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: '12px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase' }}>
              DER Rating
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#C2410C' }}>
              {derScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* ─── TIME FRAME SELECTOR & HERO BALANCE ─── */}
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        {/* Timeframe pill selector */}
        <div style={{
          display: 'inline-flex',
          padding: '3px',
          borderRadius: '999px',
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          marginBottom: '14px'
        }}>
          {['1D', '1W', '1M', '6M', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setSelectedTimeframe(tf)}
              style={{
                background: selectedTimeframe === tf ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                color: selectedTimeframe === tf ? '#0F172A' : '#64748B',
                cursor: 'pointer',
                boxShadow: selectedTimeframe === tf ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Monumental Balance Number */}
        <div style={{
          fontSize: '38px',
          fontWeight: 900,
          color: '#0F172A',
          letterSpacing: '-1px',
          lineHeight: 1
        }}>
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        {/* Change Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          marginTop: '8px',
          padding: '4px 10px',
          borderRadius: '999px',
          background: netPnL >= 0 ? '#FFF7ED' : '#FEF2F2',
          color: netPnL >= 0 ? '#C2410C' : '#DC2626',
          fontSize: '12px',
          fontWeight: 800
        }}>
          {netPnL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>
            {netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)} ({netRoi >= 0 ? '+' : ''}{netRoi.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* ─── INTERACTIVE DARK DULL ORANGE PERFORMANCE GRAPH (MATCHING SCREEN 2) ─── */}
      <div style={{ position: 'relative', width: '100%', height: `${svgHeight}px` }}>
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="mobileCurveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill under the curve */}
          <path d={fillD} fill="url(#mobileCurveGrad)" />

          {/* Neon curve path */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#EA580C" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Interactive Node Point */}
          {activePoint && (
            <g>
              {/* Vertical Guide Dash */}
              <line 
                x1={activePoint.x} 
                y1={0} 
                x2={activePoint.x} 
                y2={svgHeight} 
                stroke="rgba(234, 88, 12, 0.4)" 
                strokeDasharray="3 3" 
                strokeWidth="1.2" 
              />

              {/* Glowing Outer Ripple */}
              <circle 
                cx={activePoint.x} 
                cy={activePoint.y} 
                r="10" 
                fill="rgba(234, 88, 12, 0.25)" 
              />
              {/* Solid White Center with Orange Rim */}
              <circle 
                cx={activePoint.x} 
                cy={activePoint.y} 
                r="5" 
                fill="#FFFFFF" 
                stroke="#EA580C" 
                strokeWidth="2.5" 
              />
            </g>
          )}
        </svg>

        {/* Hover / Touch Value Tooltip (Directly matching Screen 2!) */}
        {activePoint && (
          <div style={{
            position: 'absolute',
            left: `${Math.min(Math.max(activePoint.x, 60), svgWidth - 60)}px`,
            top: `${Math.max(activePoint.y - 48, 0)}px`,
            transform: 'translateX(-50%)',
            background: '#FFFFFF',
            border: '1.5px solid #EA580C',
            borderRadius: '10px',
            padding: '4px 10px',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#0F172A', whiteSpace: 'nowrap' }}>
              Total: ${activePoint.val.toFixed(2)}
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>
              {selectedTimeframe} Horizon
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button (Matching Bottom Button on Screen 2) */}
      <button
        type="button"
        onClick={() => navigate('/trading')}
        style={{
          width: '100%',
          padding: '16px 24px',
          borderRadius: '999px',
          background: '#EA580C',
          color: '#FFFFFF',
          border: 'none',
          fontSize: '16px',
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(234, 88, 12, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#C2410C';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#EA580C';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Zap size={18} />
        <span>Enter Trading Arena ($1,000 Baseline)</span>
      </button>
    </div>
  );
}
