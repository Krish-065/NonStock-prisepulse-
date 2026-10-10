import React from 'react';

export default function Logo({ 
  size = 40, 
  showName = true, 
  nameSize = '22px',
  color
}) {
  return (
    <div style={{ 
      display: 'inline-flex', 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'flex-start',
      gap: '12px',
      userSelect: 'none'
    }}>
      {/* Bespoke Stocks Operator Emblem: Institutional Reticle, Candlesticks & Bullish Impulse Vector */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logoOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>

        {/* Sleek rounded foundation */}
        <rect width="100" height="100" rx="22" fill="#0F172A"/>

        {/* Outer Operator border accent */}
        <rect x="2" y="2" width="96" height="96" rx="20" stroke="#EA580C" strokeWidth="2" strokeOpacity="0.45" fill="none" />

        {/* Operator Targeting Radar Arc */}
        <circle cx="50" cy="50" r="34" stroke="#EA580C" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.6" />

        {/* Candlestick 1 - Base (Deep Orange) */}
        <line x1="32" y1="36" x2="32" y2="66" stroke="#EA580C" strokeWidth="2" />
        <rect x="28" y="44" width="8" height="16" rx="2" fill="url(#logoOrangeGrad)" />

        {/* Candlestick 2 - Ascent (Deep Orange) */}
        <line x1="50" y1="26" x2="50" y2="58" stroke="#EA580C" strokeWidth="2" />
        <rect x="46" y="32" width="8" height="20" rx="2" fill="url(#logoOrangeGrad)" />

        {/* Candlestick 3 - Apex Signal (Crisp White contrast) */}
        <line x1="68" y1="20" x2="68" y2="52" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.95" />
        <rect x="64" y="24" width="8" height="16" rx="2" fill="#FFFFFF" />

        {/* Operator Trend Dynamic Beam */}
        <path d="M22 66 L42 50 L52 56 L76 28" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="76,28 66,29 73,37" fill="#FFFFFF" />

        {/* Target Reticle Crosshair Markers */}
        <line x1="50" y1="12" x2="50" y2="18" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="82" x2="50" y2="88" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {showName && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ 
            fontFamily: "'Syne', sans-serif",
            fontSize: nameSize, 
            fontWeight: 900, 
            color: color || '#0F172A',
            letterSpacing: '-0.3px',
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '4px',
            textTransform: 'uppercase'
          }}>
            <span style={{ letterSpacing: '0.5px' }}>Stocks</span>
            <span style={{ 
              color: '#EA580C', 
              letterSpacing: '1px',
              textShadow: '0 0 12px rgba(234, 88, 12, 0.35)'
            }}>Operator</span>
          </span>
        </div>
      )}
    </div>
  );
}
