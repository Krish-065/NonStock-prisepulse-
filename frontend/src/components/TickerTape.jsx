import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const scrollLeft = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const scrollRight = keyframes`
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
`;

const TickerWrapper = styled.div`
  width: 100%;
  background: ${props => props.isLight ? '#ffffff' : '#0b0d19'};
  border-bottom: 1px solid ${props => props.isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.1)'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 998;
`;

const TickerRow = styled.div`
  display: flex;
  white-space: nowrap;
  padding: 8px 0;
  border-bottom: ${props => props.isBottom ? 'none' : (props.isLight ? '1px solid #f3f4f6' : '1px solid rgba(255, 255, 255, 0.05)')};
`;

const TickerTrack = styled.div`
  display: flex;
  width: max-content;
  animation: ${props => props.direction === 'right' ? scrollRight : scrollLeft} ${props => props.speed}s linear infinite;
  
  &:hover {
    animation-play-state: paused;
  }
`;

const TickerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 40px;
  cursor: pointer;
  border-right: 1px solid ${props => props.isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isLight ? 'rgba(0,176,96,0.05)' : 'rgba(255,255,255,0.05)'};
  }
`;

const SymbolName = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.isLight ? '#4b5563' : '#94a3b8'};
`;

const Price = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: ${props => props.isLight ? '#111827' : '#f8fafc'};
`;

const Change = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.isUp ? '#00b060' : '#dc2626'};
  display: flex;
  align-items: center;
  gap: 2px;
`;

// Initial mock data
const initialIndian = [
  { symbol: 'NIFTY 50', price: 24852.10, change: 184.20, percent: 0.75 },
  { symbol: 'SENSEX', price: 81215.45, change: 520.10, percent: 0.64 },
  { symbol: 'BANKNIFTY', price: 51480.30, change: 610.40, percent: 1.20 },
  { symbol: 'RELIANCE', price: 2980.50, change: 45.20, percent: 1.54 },
  { symbol: 'HDFCBANK', price: 1640.25, change: -12.30, percent: -0.74 },
  { symbol: 'TCS', price: 4210.80, change: 85.10, percent: 2.06 },
  { symbol: 'INFY', price: 1850.40, change: 22.15, percent: 1.21 },
  { symbol: 'ICICIBANK', price: 1180.90, change: 18.50, percent: 1.59 }
];

const initialGlobal = [
  { symbol: 'S&P 500', price: 5620.85, change: 45.20, percent: 0.81 },
  { symbol: 'NASDAQ', price: 19850.40, change: 210.60, percent: 1.07 },
  { symbol: 'XAU/USD', price: 2450.30, change: -15.40, percent: -0.62 },
  { symbol: 'BTC/USD', price: 64210.50, change: 1250.00, percent: 1.98 },
  { symbol: 'GBP/USD', price: 1.3120, change: 0.0045, percent: 0.34 },
  { symbol: 'EUR/USD', price: 1.1050, change: -0.0020, percent: -0.18 },
  { symbol: 'DOW JONES', price: 41250.20, change: 150.30, percent: 0.36 },
  { symbol: 'CRUDE OIL', price: 78.40, change: 1.20, percent: 1.55 }
];

export default function TickerTape({ onStockClick }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [indianData, setIndianData] = useState(initialIndian);
  const [globalData, setGlobalData] = useState(initialGlobal);

  // Simulate live market ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setIndianData(prev => prev.map(item => {
        const volatility = item.price * 0.0002; // 0.02% volatility tick
        const tick = (Math.random() - 0.5) * volatility;
        const newPrice = item.price + tick;
        const newChange = item.change + tick;
        return { ...item, price: newPrice, change: newChange, percent: (newChange / (newPrice - newChange)) * 100 };
      }));
      setGlobalData(prev => prev.map(item => {
        const volatility = item.price * 0.0003;
        const tick = (Math.random() - 0.5) * volatility;
        const newPrice = item.price + tick;
        const newChange = item.change + tick;
        return { ...item, price: newPrice, change: newChange, percent: (newChange / (newPrice - newChange)) * 100 };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price, symbol) => {
    if (symbol.includes('USD')) {
      return price < 10 ? price.toFixed(4) : price.toFixed(2);
    }
    return price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderTrack = (data, speed, direction) => {
    // Duplicate data to create seamless infinite scroll loop
    const loopData = [...data, ...data, ...data, ...data];
    
    return (
      <TickerTrack speed={speed} direction={direction}>
        {loopData.map((item, i) => (
          <TickerItem key={i} isLight={isLight} onClick={() => onStockClick(item.symbol)}>
            <SymbolName isLight={isLight}>{item.symbol}</SymbolName>
            <Price isLight={isLight}>
              {item.symbol.includes('USD') || item.symbol.includes('S&P') || item.symbol.includes('NASDAQ') || item.symbol.includes('DOW') || item.symbol.includes('OIL') ? '$' : '₹'}
              {formatPrice(item.price, item.symbol)}
            </Price>
            <Change isUp={item.change >= 0}>
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.percent).toFixed(2)}%
            </Change>
          </TickerItem>
        ))}
      </TickerTrack>
    );
  };

  return (
    <TickerWrapper isLight={isLight}>
      <TickerRow isLight={isLight}>
        {renderTrack(indianData, 60, 'left')}
      </TickerRow>
      <TickerRow isLight={isLight} isBottom={true}>
        {renderTrack(globalData, 55, 'right')}
      </TickerRow>
    </TickerWrapper>
  );
}
