import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, ArrowLeftRight, Check, AlertCircle, 
  LayoutGrid, MoreHorizontal, X, ShieldAlert, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExecutionTicket({ 
  symbol = 'ETHUSD',
  currentPrice = 2746.66,
  balance = 1000,
  onPlaceOrder,
  onClose,
  onReset
}) {
  // Mode: 'ORDER' or 'DOM'
  const [tabMode, setTabMode] = useState('ORDER');

  // Trade side: 'BUY' (Long) or 'SELL' (Short)
  const [side, setSide] = useState('BUY');

  // Order type: 'Market', 'Limit', 'Stop'
  const [orderType, setOrderType] = useState('Market');

  // Price for Limit/Stop
  const [limitPrice, setLimitPrice] = useState(currentPrice);

  // Sizing Mode: '% balance' | 'Units' | 'USD risk'
  const [sizingMode, setSizingMode] = useState('% balance');
  const [percentSlider, setPercentSlider] = useState(25); // 25% default
  const [units, setUnits] = useState(0.1);
  const [leverage, setLeverage] = useState(10);

  // Exits section
  const [tpEnabled, setTpEnabled] = useState(false);
  const [tpPrice, setTpPrice] = useState('');
  const [slEnabled, setSlEnabled] = useState(false);
  const [slPrice, setSlPrice] = useState('');

  // Accordions
  const [exitsOpen, setExitsOpen] = useState(true);
  const [extraSettingsOpen, setExtraSettingsOpen] = useState(false);
  const [timeInForce, setTimeInForce] = useState('GTC');

  // Sync limit price when current price first loads if not set
  useEffect(() => {
    if (!limitPrice || limitPrice === 0) {
      setLimitPrice(currentPrice);
    }
  }, [currentPrice]);

  // Calculate units based on percentage of balance
  useEffect(() => {
    if (sizingMode === '% balance') {
      const allocatedCapital = (balance * (percentSlider / 100));
      const notionalCapacity = allocatedCapital * leverage;
      const calculatedUnits = notionalCapacity / (currentPrice || 1);
      setUnits(parseFloat(calculatedUnits.toFixed(4)));
    }
  }, [percentSlider, sizingMode, balance, leverage, currentPrice]);

  // Derived financial metrics
  const activeExecutionPrice = orderType === 'Market' ? currentPrice : parseFloat(limitPrice || currentPrice);
  const tradeValue = (units * activeExecutionPrice);
  const requiredMargin = tradeValue / leverage;
  const spread = (currentPrice * 0.00015).toFixed(2); // Institutional 1.5 bps spread

  // Liquidation calculation
  const liqDistance = requiredMargin / (units || 0.0001);
  const liqPrice = side === 'BUY' 
    ? Math.max(0, activeExecutionPrice - liqDistance) 
    : activeExecutionPrice + liqDistance;

  // Stop Loss & Take Profit calculations
  const parsedSL = slEnabled && slPrice ? parseFloat(slPrice) : null;
  const parsedTP = tpEnabled && tpPrice ? parseFloat(tpPrice) : null;

  const dollarRiskAtSL = parsedSL 
    ? Math.abs(activeExecutionPrice - parsedSL) * units 
    : 0;
  const percentRiskAtSL = parsedSL 
    ? ((Math.abs(activeExecutionPrice - parsedSL) / activeExecutionPrice) * 100).toFixed(2)
    : '0.00';

  const dollarRewardAtTP = parsedTP 
    ? Math.abs(parsedTP - activeExecutionPrice) * units 
    : 0;
  const percentRewardAtTP = parsedTP 
    ? ((Math.abs(parsedTP - activeExecutionPrice) / activeExecutionPrice) * 100).toFixed(2)
    : '0.00';

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setPercentSlider(val);
    if (sizingMode !== '% balance') setSizingMode('% balance');
  };

  const handleUnitInputChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setUnits(val);
    setSizingMode('Units');
  };

  const handleExecute = () => {
    if (requiredMargin > balance) {
      toast.error('Insufficient Free Margin for this position size');
      return;
    }
    if (units <= 0) {
      toast.error('Position size must be greater than zero');
      return;
    }

    onPlaceOrder({
      asset: symbol,
      side: side === 'BUY' ? 'LONG' : 'SHORT',
      orderType,
      size: units,
      leverage,
      entryPrice: activeExecutionPrice,
      margin: requiredMargin,
      sl: parsedSL,
      tp: parsedTP,
      timeInForce
    });

    toast.success(`${side === 'BUY' ? 'Buy / Long' : 'Sell / Short'} order executed: ${units} ${symbol}`);
  };

  // Mock DOM (Depth of Market) ladder for Level 2 view
  const renderDOMLadder = () => {
    const step = currentPrice * 0.0003;
    const asks = [
      { price: currentPrice + step * 4, size: 2.84, total: 9.82 },
      { price: currentPrice + step * 3, size: 1.95, total: 6.98 },
      { price: currentPrice + step * 2, size: 3.12, total: 5.03 },
      { price: currentPrice + step * 1, size: 1.91, total: 1.91 },
    ];
    const bids = [
      { price: currentPrice - step * 1, size: 2.45, total: 2.45 },
      { price: currentPrice - step * 2, size: 3.60, total: 6.05 },
      { price: currentPrice - step * 3, size: 1.82, total: 7.87 },
      { price: currentPrice - step * 4, size: 4.10, total: 11.97 },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '700', padding: '0 4px' }}>
          <span>Price (USD)</span>
          <span>Size</span>
          <span>Total</span>
        </div>

        {/* Asks (Sells - Red depth) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {asks.map((a, i) => (
            <div 
              key={`ask-${i}`} 
              onClick={() => { setLimitPrice(a.price); setSide('SELL'); }}
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 6px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(a.total / 12) * 100}%`, background: 'rgba(239, 68, 68, 0.12)', borderRadius: '4px', zIndex: 0 }} />
              <span style={{ color: '#EF4444', fontWeight: '700', zIndex: 1 }}>{a.price.toFixed(2)}</span>
              <span style={{ color: '#0F172A', zIndex: 1 }}>{a.size.toFixed(2)}</span>
              <span style={{ color: '#64748B', zIndex: 1 }}>{a.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Current Mid Spread Banner */}
        <div style={{ background: '#F8FAFC', padding: '6px 8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #E2E8F0', fontWeight: '800', color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
          <span>Mid Spread</span>
          <span style={{ color: '#EA580C', fontFamily: 'var(--font-mono)' }}>${currentPrice.toFixed(2)}</span>
          <span style={{ color: '#64748B' }}>±{spread}</span>
        </div>

        {/* Bids (Buys - Orange depth) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {bids.map((b, i) => (
            <div 
              key={`bid-${i}`} 
              onClick={() => { setLimitPrice(b.price); setSide('BUY'); }}
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4px 6px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(b.total / 12) * 100}%`, background: 'rgba(234, 88, 12, 0.12)', borderRadius: '4px', zIndex: 0 }} />
              <span style={{ color: '#EA580C', fontWeight: '700', zIndex: 1 }}>{b.price.toFixed(2)}</span>
              <span style={{ color: '#0F172A', zIndex: 1 }}>{b.size.toFixed(2)}</span>
              <span style={{ color: '#64748B', zIndex: 1 }}>{b.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E2E8F0',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      fontFamily: 'Inter, sans-serif',
      color: '#0F172A',
      width: '100%',
      maxWidth: '360px',
      boxSizing: 'border-box'
    }}>

      {/* 1. TOP HEADER (No TradingView Logo - Clean Sleek Asset Badge) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#0F172A',
            color: '#FFFFFF',
            fontWeight: '900',
            fontSize: '0.85rem',
            padding: '5px 10px',
            borderRadius: '8px',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EA580C', display: 'inline-block' }} />
            {symbol}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' }}>
          <button 
            title="DOM / Grid View" 
            onClick={() => setTabMode(prev => prev === 'ORDER' ? 'DOM' : 'ORDER')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', borderRadius: '6px' }}
          >
            <LayoutGrid size={17} />
          </button>
          <button 
            title="Options"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', borderRadius: '6px' }}
          >
            <MoreHorizontal size={17} />
          </button>
          <button 
            title="Close Trade Panel"
            onClick={onClose || onReset}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', borderRadius: '6px' }}
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* 2. ORDER / DOM PILL TOGGLE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#F1F5F9',
        padding: '3px',
        borderRadius: '10px'
      }}>
        <button
          onClick={() => setTabMode('ORDER')}
          style={{
            background: tabMode === 'ORDER' ? '#FFFFFF' : 'transparent',
            color: tabMode === 'ORDER' ? '#0F172A' : '#64748B',
            fontWeight: '800',
            fontSize: '0.85rem',
            padding: '7px 0',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: tabMode === 'ORDER' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          Order
        </button>
        <button
          onClick={() => setTabMode('DOM')}
          style={{
            background: tabMode === 'DOM' ? '#FFFFFF' : 'transparent',
            color: tabMode === 'DOM' ? '#0F172A' : '#64748B',
            fontWeight: '800',
            fontSize: '0.85rem',
            padding: '7px 0',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: tabMode === 'DOM' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          DOM
        </button>
      </div>

      {tabMode === 'DOM' ? (
        renderDOMLadder()
      ) : (
        <>
          {/* 3. DUAL SELL / BUY SPREAD BOX */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            background: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            {/* SELL SIDE */}
            <div 
              onClick={() => setSide('SELL')}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                background: side === 'SELL' ? '#FEF2F2' : 'transparent',
                borderRight: '1px solid #E2E8F0',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: side === 'SELL' ? '#EF4444' : '#64748B', marginBottom: '2px' }}>
                Sell
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: side === 'SELL' ? '#DC2626' : '#0F172A', fontFamily: 'var(--font-mono)' }}>
                {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* SPREAD PILL */}
            <div style={{
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: '#64748B',
              background: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              margin: '0 4px',
              whiteSpace: 'nowrap'
            }}>
              {spread}
            </div>

            {/* BUY SIDE */}
            <div 
              onClick={() => setSide('BUY')}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                textAlign: 'right',
                background: side === 'BUY' ? '#FFF7ED' : 'transparent',
                borderLeft: '1px solid #E2E8F0',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: side === 'BUY' ? '#EA580C' : '#64748B', marginBottom: '2px' }}>
                Buy
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: side === 'BUY' ? '#C2410C' : '#0F172A', fontFamily: 'var(--font-mono)' }}>
                {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* 4. ORDER TYPE TABS (Underline style) */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            gap: '16px',
            paddingBottom: '2px'
          }}>
            {['Market', 'Limit', 'Stop'].map((type) => {
              const active = orderType === type;
              return (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: active ? '2px solid #0F172A' : '2px solid transparent',
                    padding: '6px 8px',
                    fontWeight: active ? '800' : '600',
                    color: active ? '#0F172A' : '#64748B',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {/* 5. PRICE INPUT ROW (For Limit & Stop) */}
          {orderType !== 'Market' && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
                Price
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '4px 8px',
                gap: '8px'
              }}>
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#0F172A'
                  }}
                  placeholder="0.00"
                />
                <button
                  onClick={() => setLimitPrice(currentPrice)}
                  title="Snap to Current Price"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
                >
                  <ArrowLeftRight size={14} />
                </button>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => setLimitPrice(currentPrice - 0.05)}
                    style={{ background: '#F1F5F9', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
                  >
                    Bid
                  </button>
                  <button 
                    onClick={() => setLimitPrice(currentPrice + 0.05)}
                    style={{ background: '#F1F5F9', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
                  >
                    Ask
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. POSITION SIZING & % BALANCE SLIDER */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <select
                value={sizingMode}
                onChange={(e) => setSizingMode(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#475569',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: 0
                }}
              >
                <option value="% balance">% balance ▾</option>
                <option value="Units">Units ▾</option>
                <option value="USD risk">USD risk ▾</option>
              </select>

              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                Ø USD risk: ${(tradeValue * 0.02).toFixed(2)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '6px 10px',
              gap: '8px'
            }}>
              {sizingMode === '% balance' ? (
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={percentSlider}
                  onChange={(e) => setPercentSlider(Math.min(100, Math.max(1, Number(e.target.value))))}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontWeight: '800',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              ) : (
                <input
                  type="number"
                  step="0.01"
                  value={units}
                  onChange={handleUnitInputChange}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontWeight: '800',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              )}

              <button
                onClick={() => setSizingMode(prev => prev === '% balance' ? 'Units' : '% balance')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
                title="Swap Unit / % Mode"
              >
                <ArrowLeftRight size={14} />
              </button>

              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>
                {sizingMode === '% balance' ? '%' : symbol.replace(/USD|USDT/g, '')}
              </span>
            </div>

            {/* Slider with snap points */}
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range"
                min="1"
                max="100"
                value={percentSlider}
                onChange={handleSliderChange}
                style={{
                  flex: 1,
                  accentColor: side === 'BUY' ? '#EA580C' : '#EF4444',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                background: '#F1F5F9',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '800',
                color: '#0F172A',
                fontFamily: 'var(--font-mono)',
                minWidth: '38px',
                textAlign: 'center'
              }}>
                {percentSlider}%
              </span>
            </div>

            {/* Snap point tags */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', fontSize: '0.65rem', color: '#94A3B8', fontWeight: '700' }}>
              <span onClick={() => setPercentSlider(25)} style={{ cursor: 'pointer' }}>25%</span>
              <span onClick={() => setPercentSlider(50)} style={{ cursor: 'pointer' }}>50%</span>
              <span onClick={() => setPercentSlider(75)} style={{ cursor: 'pointer' }}>75%</span>
              <span onClick={() => setPercentSlider(100)} style={{ cursor: 'pointer' }}>100%</span>
            </div>

            {/* Summary lines */}
            <div style={{ marginTop: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Trade value ({leverage}x):</span>
                <span style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#0F172A' }}>
                  ${tradeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Available margin:</span>
                <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: '#0F172A' }}>
                  ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Required margin:</span>
                <span style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: requiredMargin > balance ? '#EF4444' : '#EA580C' }}>
                  ${requiredMargin.toFixed(2)} USD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Est. Liq Price:</span>
                <span style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>
                  ${liqPrice.toFixed(2)}
                </span>
              </div>

              {/* Leverage Pills */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #CBD5E1' }}>
                <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700' }}>Leverage:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[5, 10, 20, 50].map((lev) => (
                    <button
                      key={lev}
                      onClick={() => setLeverage(lev)}
                      style={{
                        background: leverage === lev ? '#0F172A' : '#FFFFFF',
                        color: leverage === lev ? '#FFFFFF' : '#475569',
                        border: '1px solid #CBD5E1',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 7. EXITS ACCORDION (Take Profit & Stop Loss) */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
            <div 
              onClick={() => setExitsOpen(!exitsOpen)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Exits</span>
              {exitsOpen ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
            </div>

            {exitsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                
                {/* Take Profit Toggle & Field */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Take profit, price ▾</span>
                    {/* iOS style toggle */}
                    <div 
                      onClick={() => setTpEnabled(!tpEnabled)}
                      style={{
                        width: '36px',
                        height: '20px',
                        background: tpEnabled ? '#EA580C' : '#CBD5E1',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: '#FFFFFF',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: tpEnabled ? '18px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>

                  {tpEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '4px 8px' }}>
                        <input
                          type="number"
                          step="any"
                          value={tpPrice}
                          onChange={(e) => setTpPrice(e.target.value)}
                          placeholder={(currentPrice * 1.02).toFixed(2)}
                          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                        />
                        <button 
                          onClick={() => setTpPrice((currentPrice * 1.02).toFixed(2))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                        >
                          <ArrowLeftRight size={13} />
                        </button>
                      </div>
                      <span style={{ background: '#FFF7ED', color: '#C2410C', fontSize: '0.7rem', fontWeight: '800', padding: '6px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                        +{percentRewardAtTP}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Stop Loss Toggle & Field */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Stop loss, price ▾</span>
                    {/* iOS style toggle */}
                    <div 
                      onClick={() => setSlEnabled(!slEnabled)}
                      style={{
                        width: '36px',
                        height: '20px',
                        background: slEnabled ? '#EF4444' : '#CBD5E1',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: '#FFFFFF',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: slEnabled ? '18px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>

                  {slEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '4px 8px' }}>
                        <input
                          type="number"
                          step="any"
                          value={slPrice}
                          onChange={(e) => setSlPrice(e.target.value)}
                          placeholder={(currentPrice * 0.98).toFixed(2)}
                          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                        />
                        <button 
                          onClick={() => setSlPrice((currentPrice * 0.98).toFixed(2))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                        >
                          <ArrowLeftRight size={13} />
                        </button>
                      </div>
                      <span style={{ background: '#FEF2F2', color: '#DC2626', fontSize: '0.7rem', fontWeight: '800', padding: '6px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                        -{percentRiskAtSL}%
                      </span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* 8. EXTRA SETTINGS ACCORDION */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
            <div 
              onClick={() => setExtraSettingsOpen(!extraSettingsOpen)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>Extra settings</span>
              {extraSettingsOpen ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
            </div>

            {extraSettingsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>Time in force</span>
                  <select 
                    value={timeInForce} 
                    onChange={(e) => setTimeInForce(e.target.value)}
                    style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', padding: '2px 8px' }}
                  >
                    <option value="GTC">GTC (Good 'Til Cancelled)</option>
                    <option value="IOC">IOC (Immediate Or Cancel)</option>
                    <option value="Day">Day Order</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>Execution Mode</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#EA580C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} /> Instant (&lt;10ms)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 9. PRIMARY ACTION BUTTON */}
          <button
            onClick={handleExecute}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              background: side === 'BUY' 
                ? 'linear-gradient(135deg, #EA580C, #C2410C)' 
                : 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#FFFFFF',
              fontWeight: '900',
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: side === 'BUY' 
                ? '0 4px 14px rgba(234, 88, 12, 0.35)' 
                : '0 4px 14px rgba(239, 68, 68, 0.35)',
              transition: 'transform 0.1s, box-shadow 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px'
            }}
          >
            <span>{`Place ${side} Order`}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.88, fontWeight: '600' }}>
              {units} {symbol} • Margin: ${requiredMargin.toFixed(2)}
            </span>
          </button>
        </>
      )}

    </div>
  );
}
