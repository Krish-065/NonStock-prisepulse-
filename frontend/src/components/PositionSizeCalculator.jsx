import React, { useState } from 'react';
import { 
  Calculator, ShieldAlert, ArrowRight, TrendingUp, TrendingDown, 
  HelpCircle, RefreshCw, CheckCircle2, DollarSign, Sliders 
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_MARKETS = [
  { symbol: 'BTCUSDT', name: 'BTC/USDT', price: 86420.00, change: '+2.45%', positive: true, icon: '₿' },
  { symbol: 'ETHUSDT', name: 'ETH/USDT', price: 3418.50, change: '-0.85%', positive: false, icon: 'Ξ' },
  { symbol: 'XAUUSD', name: 'XAU/USD (Gold)', price: 2518.40, change: '+0.74%', positive: true, icon: '🪙' },
  { symbol: 'GBPUSD', name: 'GBP/USD', price: 1.3465, change: '+0.33%', positive: true, icon: '💷' },
  { symbol: 'EURUSD', name: 'EUR/USD', price: 1.0920, change: '-0.18%', positive: false, icon: '💶' },
  { symbol: 'NVDA', name: 'NVDA (Equity)', price: 128.60, change: '+3.15%', positive: true, icon: '⚡' }
];

export default function PositionSizeCalculator({ 
  userBalance = 1000, 
  compact = false,
  className = '',
  style = {}
}) {
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');
  const [accountBalance, setAccountBalance] = useState(userBalance || 1000);
  const [riskPercent, setRiskPercent] = useState(2); // 2% standard institutional prop risk
  const [entryPrice, setEntryPrice] = useState(86420.00);
  const [stopLossPrice, setStopLossPrice] = useState(85120.00);
  
  // Results
  const [units, setUnits] = useState(null);
  const [amountAtRisk, setAmountAtRisk] = useState(null);
  const [positionValue, setPositionValue] = useState(null);

  const calculatePosition = () => {
    const bal = parseFloat(accountBalance);
    const risk = parseFloat(riskPercent);
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLossPrice);

    if (!bal || bal <= 0) {
      toast.error('Please enter a valid account balance');
      return;
    }
    if (!entry || entry <= 0) {
      toast.error('Please enter a valid opening price');
      return;
    }
    if (!sl || sl <= 0) {
      toast.error('Please enter a valid stop-loss price');
      return;
    }

    const priceDiff = Math.abs(entry - sl);
    if (priceDiff === 0) {
      toast.error('Opening price and Stop Loss cannot be identical');
      return;
    }

    // Amount at risk ($) = Account Balance * (Risk % / 100)
    const riskDollar = bal * (risk / 100);
    // Deal size (Units) = Amount at Risk / Per-unit stop distance
    const calculatedUnits = riskDollar / priceDiff;
    const totalPosValue = calculatedUnits * entry;

    setAmountAtRisk(riskDollar);
    setUnits(calculatedUnits);
    setPositionValue(totalPosValue);

    toast.success(`Position calculated: $${riskDollar.toFixed(2)} risk on ${calculatedUnits.toFixed(4)} units`);
  };

  const selectMarket = (market) => {
    setSelectedAsset(market.symbol);
    setEntryPrice(market.price);
    // Set a sensible default 1.5% SL below/above entry
    const slDist = market.price * 0.015;
    setStopLossPrice(parseFloat((market.price - slDist).toFixed(4)));
  };

  return (
    <div 
      className={`position-size-calculator ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: '24px',
        padding: compact ? '20px' : '26px',
        boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: '#0F172A',
        ...style
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: '#FFF7ED',
            border: '1.5px solid #EA580C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C2410C'
          }}>
            <Calculator size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              Position Size Calculator
            </h3>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
              Institutional risk allocation for $1,000 baseline
            </div>
          </div>
        </div>

        <div style={{
          padding: '4px 10px',
          borderRadius: '999px',
          background: '#FEF9C3',
          border: '1px solid #FDE047',
          color: '#854D0E',
          fontSize: '11px',
          fontWeight: 800
        }}>
          MAX RISK: 2%
        </div>
      </div>

      {/* Form Fields (2-Column Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: '14px' }}>
        {/* Asset / Funds */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
            Instrument / Symbol
          </label>
          <select
            value={selectedAsset}
            onChange={(e) => {
              const m = DEFAULT_MARKETS.find(item => item.symbol === e.target.value);
              if (m) selectMarket(m);
            }}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              fontSize: '14px',
              fontWeight: 800,
              color: '#0F172A',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {DEFAULT_MARKETS.map(m => (
              <option key={m.symbol} value={m.symbol}>
                {m.name} (${m.price.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Account Capital */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
            Account Balance ($)
          </label>
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              fontSize: '14px',
              fontWeight: 800,
              color: '#0F172A',
              outline: 'none'
            }}
          />
        </div>

        {/* Opening Price */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
            Opening Price ($)
          </label>
          <input
            type="number"
            step="any"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              fontSize: '14px',
              fontWeight: 800,
              color: '#0F172A',
              outline: 'none'
            }}
          />
        </div>

        {/* Stop Loss Price */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
            Stop Loss Price ($)
          </label>
          <input
            type="number"
            step="any"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              fontSize: '14px',
              fontWeight: 800,
              color: '#0F172A',
              outline: 'none'
            }}
          />
        </div>

        {/* Risk % Quick Selectors */}
        <div style={{ gridColumn: compact ? 'auto' : '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Allowable Risk Ratio
            </label>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#C2410C' }}>
              {riskPercent}% of Equity (${((accountBalance * riskPercent) / 100).toFixed(2)})
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[0.5, 1, 1.5, 2, 2.5, 3].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setRiskPercent(pct)}
                style={{
                  flex: 1,
                  minWidth: '45px',
                  padding: '7px 0',
                  borderRadius: '8px',
                  border: riskPercent === pct ? '2px solid #EA580C' : '1px solid #CBD5E1',
                  background: riskPercent === pct ? '#FFF7ED' : '#FFFFFF',
                  color: riskPercent === pct ? '#9A3412' : '#475569',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculate Button (Dark Dull Orange) */}
      <button
        type="button"
        onClick={calculatePosition}
        style={{
          width: '100%',
          padding: '14px 20px',
          borderRadius: '14px',
          background: '#EA580C',
          color: '#FFFFFF',
          border: 'none',
          fontSize: '15px',
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.15s ease'
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
        <Calculator size={17} />
        <span>Calculate Position Size</span>
      </button>

      {/* Calculated Results Pods (Directly matching Screen 3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{
          background: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Units (Deal Size)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginTop: '4px', letterSpacing: '-0.5px' }}>
            {units !== null ? units.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '—'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            {positionValue ? `Total Value: $${positionValue.toFixed(2)}` : 'Calculated lot allocation'}
          </div>
        </div>

        <div style={{
          background: '#FFF7ED',
          border: '1.5px solid #FDBA74',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Amount At Risk
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#C2410C', marginTop: '4px', letterSpacing: '-0.5px' }}>
            {amountAtRisk !== null ? `$${amountAtRisk.toFixed(2)}` : '—'}
          </div>
          <div style={{ fontSize: '11px', color: '#9A3412', marginTop: '2px' }}>
            {riskPercent}% max drawdown loss
          </div>
        </div>
      </div>

      {/* ─── QUICK MARKETS LIST (MATCHING SCREEN 3) ─── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Markets Quick Pick
          </h4>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
            Tap to load live price
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DEFAULT_MARKETS.map((m) => (
            <div
              key={m.symbol}
              onClick={() => selectMarket(m)}
              style={{
                background: selectedAsset === m.symbol ? '#FFF7ED' : '#FFFFFF',
                border: selectedAsset === m.symbol ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                if (selectedAsset !== m.symbol) e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseOut={(e) => {
                if (selectedAsset !== m.symbol) e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>{m.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>
                  {m.name}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>
                  ${m.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: m.positive ? '#C2410C' : '#DC2626'
                }}>
                  {m.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
