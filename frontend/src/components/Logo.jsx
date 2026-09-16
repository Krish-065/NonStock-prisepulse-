import React from 'react';

export default function Logo({ 
  size = 40, 
  showName = true, 
  showTagline = true, 
  alignment = 'row', 
  nameSize = '22px' 
}) {
  const isRow = alignment === 'row';

  return (
    <div style={{ 
      display: 'inline-flex', 
      flexDirection: isRow ? 'row' : 'column', 
      alignItems: 'center', 
      justifyContent: isRow ? 'flex-start' : 'center',
      gap: isRow ? '12px' : '8px',
      textAlign: isRow ? 'left' : 'center',
      userSelect: 'none'
    }}>
      {/* High-Tech Futuristic Dynamic Geometric N + Trading Pulse Brandmark */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ 
          flexShrink: 0,
          borderRadius: '22%',
          background: 'linear-gradient(145deg, #090e1a 0%, #030712 100%)',
          padding: '4px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 16px rgba(0, 240, 255, 0.15), 0 0 20px rgba(0, 255, 136, 0.15)',
          border: '1px solid rgba(0, 240, 255, 0.25)'
        }}
      >
        <defs>
          {/* Glowing Gradients */}
          <linearGradient id="n-pulse-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#7928ca" />
          </linearGradient>

          <linearGradient id="candle-up" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="100%" stopColor="#00f2fe" />
          </linearGradient>

          <linearGradient id="candle-pulse" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#38ef7d" />
          </linearGradient>

          <filter id="neon-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid Accent */}
        <line x1="20" y1="50" x2="80" y2="50" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="2 3" />
        <line x1="50" y1="20" x2="50" y2="80" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="2 3" />

        {/* Geometric Stylized Modern N constructed with Dynamic Trading Pulse */}
        <g filter="url(#neon-glow-filter)">
          {/* Left Vertical Pillar / Candlestick */}
          <line x1="28" y1="16" x2="28" y2="84" stroke="url(#candle-up)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <rect x="23" y="32" width="10" height="42" rx="4" fill="url(#candle-up)" />

          {/* Dynamic Diagonal Pulse connecting the N */}
          <path 
            d="M28 34 L50 62 L72 26" 
            stroke="url(#n-pulse-grad)" 
            strokeWidth="7" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Right Vertical Pillar / Bullish Momentum Candlestick */}
          <line x1="72" y1="14" x2="72" y2="84" stroke="url(#candle-pulse)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <rect x="67" y="24" width="10" height="46" rx="4" fill="url(#candle-pulse)" />

          {/* Dynamic Upward Breakout Arrowhead */}
          <path 
            d="M58 26 H72 V40" 
            stroke="url(#n-pulse-grad)" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Core Pulse Dot */}
          <circle cx="50" cy="62" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 6px #00f2fe)" />
        </g>
      </svg>

      {/* Brand Name and Tagline */}
      {(showName || showTagline) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {showName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                fontSize: nameSize, 
                fontWeight: 900, 
                background: 'linear-gradient(135deg, #00ff88 0%, #00f2fe 50%, #ffffff 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.4px',
                lineHeight: '1.1',
                textShadow: '0 0 20px rgba(0, 242, 254, 0.3)'
              }}>
                NonStock
              </span>
              <span style={{
                fontSize: '9px',
                padding: '1.5px 5px',
                borderRadius: '4px',
                background: 'rgba(0, 242, 254, 0.12)',
                color: '#00f2fe',
                fontWeight: 800,
                border: '1px solid rgba(0, 242, 254, 0.3)',
                letterSpacing: '0.8px'
              }}>
                GLOBAL
              </span>
            </div>
          )}
          {showTagline && (
            <span style={{ 
              fontSize: '10.5px', 
              fontWeight: 800, 
              background: 'linear-gradient(90deg, #00ff88 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase', 
              letterSpacing: '0.9px',
              marginTop: '2px'
            }}>
              Be Nonstop with NonStock
            </span>
          )}
        </div>
      )}
    </div>
  );
}

