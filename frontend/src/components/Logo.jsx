import React from 'react';

export default function Logo({ size = 48, showName = true, showTagline = true, alignment = 'row', nameSize = '24px', glowColor = 'rgba(0, 240, 255, 0.4)' }) {
  const isRow = alignment === 'row';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isRow ? 'row' : 'column', 
      alignItems: 'center', 
      justifyContent: isRow ? 'flex-start' : 'center',
      gap: isRow ? '14px' : '10px',
      textAlign: isRow ? 'left' : 'center'
    }}>
      {/* SVG Neon Candlestick Logo with Background */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ 
          flexShrink: 0,
          borderRadius: '16%',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(0, 240, 255, 0.1)'
        }}
      >
        <defs>
          {/* Background Gradient */}
          <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a0f26" />
            <stop offset="100%" stop-color="#030510" />
          </linearGradient>
          
          {/* Glowing Gradients */}
          <linearGradient id="logo-arrow-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#00ff88" />
            <stop offset="50%" stop-color="#00f0ff" />
            <stop offset="100%" stop-color="#00f0ff" />
          </linearGradient>

          {/* Neon Glow Filter */}
          <filter id="logo-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Grid Pattern */}
          <pattern id="logo-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* 1. Dark Theme Card Background */}
        <rect width="100" height="100" fill="url(#logo-bg-grad)" />
        <rect width="100" height="100" fill="url(#logo-grid)" />
        
        {/* 2. Faint Background Chart Elements */}
        <g opacity="0.08">
          <line x1="88" y1="15" x2="88" y2="65" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="85" y="28" width="6" height="24" fill="#ffffff" />
          
          <line x1="12" y1="35" x2="12" y2="85" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="9" y="48" width="6" height="24" fill="#ffffff" />
        </g>

        {/* 3. Main Glowing Logo Elements */}
        <g filter="url(#logo-neon-glow)">
          {/* Left Green Candlestick Wick */}
          <line 
            x1="36" 
            y1="16" 
            x2="36" 
            y2="84" 
            stroke="#00ff88" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          
          {/* Left Green Candlestick Body */}
          <path 
            d="M30 26 H42 V60 L30 72 Z" 
            fill="#00ff88" 
          />

          {/* Right Cyan Candlestick Wick */}
          <line 
            x1="64" 
            y1="16" 
            x2="64" 
            y2="84" 
            stroke="#00f0ff" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          
          {/* Right Cyan Candlestick Body */}
          <path 
            d="M58 40 L70 28 V72 H58 Z" 
            fill="#00f0ff" 
          />

          {/* Diagonal Trendline Zig-Zag Arrow */}
          <path 
            d="M25 72 L47 46 L55 54 L76 28" 
            stroke="url(#logo-arrow-grad)" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Glowing Arrowhead */}
          <path 
            d="M60 28 H76 V44" 
            stroke="url(#logo-arrow-grad)" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </g>
      </svg>

      {/* Name and Tagline Container */}
      {(showName || showTagline) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {showName && (
            <span style={{ 
              fontSize: nameSize, 
              fontWeight: 900, 
              background: 'linear-gradient(135deg, #00ff88 0%, #00f0ff 100%)', 
              WebkitBackgroundClip: 'text', 
              backgroundClip: 'text', 
              color: 'transparent',
              letterSpacing: '0.8px',
              lineHeight: '1.1',
              textShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
            }}>
              NonStock
            </span>
          )}
          {showTagline && (
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              color: '#00ff88', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              opacity: 0.95,
              textShadow: '0 0 8px rgba(0, 255, 136, 0.4)'
            }}>
              Be Nonstop with NonStock
            </span>
          )}
        </div>
      )}
    </div>
  );
}
