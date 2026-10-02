import React from 'react';

export default function Logo({ 
  size = 40, 
  showName = true, 
  nameSize = '22px' 
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
      {/* Modern Sharp SVG Icon: Geometric N intersecting a candlestick */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="100" height="100" rx="20" fill="#0F172A"/>
        
        {/* Pulse Line */}
        <path d="M15 55 L35 55 L50 25 L65 75 L85 55" stroke="#10B981" strokeWidth="6" strokeLinejoin="miter" />
        
        {/* Geometric 'N' overlay */}
        <path d="M25 80 L25 20 L75 80 L75 20" stroke="#FFFFFF" strokeWidth="8" strokeLinejoin="miter" strokeLinecap="square" opacity="0.9" />

        {/* Candlestick Wicks */}
        <line x1="50" y1="15" x2="50" y2="25" stroke="#10B981" strokeWidth="3" />
        <line x1="65" y1="75" x2="65" y2="85" stroke="#10B981" strokeWidth="3" />
      </svg>

      {showName && (
        <span style={{ 
          fontSize: nameSize, 
          fontWeight: 800, 
          color: '#0F172A',
          letterSpacing: '-0.5px',
          lineHeight: '1.1'
        }}>
          NonStock
        </span>
      )}
    </div>
  );
}
