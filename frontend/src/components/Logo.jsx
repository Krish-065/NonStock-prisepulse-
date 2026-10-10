import React from 'react';

export default function Logo({ 
  size = 42, 
  height,
  className = '',
  style = {}
}) {
  const logoHeight = height || size;

  return (
    <div 
      className={`stocks-operator-logo-wrap ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        userSelect: 'none',
        ...style
      }}
    >
      <img 
        src="/assets/stocks_operator_logo.png" 
        alt="Stocks Operator - The Trader's Proving Ground" 
        style={{ 
          height: `${logoHeight}px`, 
          width: 'auto', 
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
          borderRadius: '4px'
        }}
        onError={(e) => {
          // Fallback if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
