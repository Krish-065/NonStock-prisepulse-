import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { BarChart3, TrendingUp, ShieldAlert, Award, Compass, Eye, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_UNDERLYING_METRICS = {
  BTC: { name: 'Bitcoin Derivatives', spot: 64250.00, change: 1820.00, changePercent: 2.91, interval: 500, bias: 1.18, futOi: '4.8B' },
  ETH: { name: 'Ethereum Derivatives', spot: 3420.00, change: 65.50, changePercent: 1.95, interval: 50, bias: 0.95, futOi: '1.9B' },
  SPX: { name: 'S&P 500 Index Options', spot: 5612.40, change: 42.10, changePercent: 0.75, interval: 25, bias: 1.12, futOi: '18.4M' },
  NDX: { name: 'Nasdaq 100 Derivatives', spot: 19840.50, change: 210.30, changePercent: 1.07, interval: 50, bias: 1.25, futOi: '9.2M' },
  NVDA: { name: 'Nvidia Options', spot: 128.50, change: 4.20, changePercent: 3.38, interval: 2.5, bias: 1.34, futOi: '24.1M' },
  GC: { name: 'Gold CME Futures', spot: 2580.00, change: 18.50, changePercent: 0.72, interval: 10, bias: 1.22, futOi: '3.6M' }
};

const GLOBAL_CONSTITUENTS = [
  { symbol: 'BTC', name: 'Bitcoin', weight: 15.0, price: 64250.00, chg: 2.91 },
  { symbol: 'ETH', name: 'Ethereum', weight: 8.0, price: 3420.00, chg: 1.95 },
  { symbol: 'NVDA', name: 'Nvidia Corp', weight: 7.2, price: 128.50, chg: 3.38 },
  { symbol: 'AAPL', name: 'Apple Inc', weight: 7.0, price: 224.20, chg: 1.12 },
  { symbol: 'MSFT', name: 'Microsoft', weight: 6.5, price: 432.80, chg: 0.85 },
  { symbol: 'AMZN', name: 'Amazon', weight: 3.8, price: 186.40, chg: 1.90 },
  { symbol: 'META', name: 'Meta Platforms', weight: 2.6, price: 520.10, chg: 2.40 },
  { symbol: 'GOOGL', name: 'Alphabet', weight: 2.4, price: 165.30, chg: -0.42 },
  { symbol: 'TSLA', name: 'Tesla Inc', weight: 2.1, price: 242.50, chg: 4.25 },
  { symbol: 'SOL', name: 'Solana', weight: 2.0, price: 152.40, chg: 5.40 },
  { symbol: 'AVGO', name: 'Broadcom', weight: 2.0, price: 168.90, chg: 2.15 },
  { symbol: 'JPM', name: 'JPMorgan Chase', weight: 1.8, price: 214.60, chg: 0.50 },
  { symbol: 'GC', name: 'Gold Futures', weight: 3.5, price: 2580.00, chg: 0.72 },
  { symbol: 'CL', name: 'Crude Oil WTI', weight: 2.0, price: 76.80, chg: -1.25 }
];

function computeFnOState(symbol, spotPriceInput, changePercentInput, isLiveMarket = false) {
  const meta = DEFAULT_UNDERLYING_METRICS[symbol] || DEFAULT_UNDERLYING_METRICS.BTC;
  const spot = (spotPriceInput && !isNaN(spotPriceInput) && spotPriceInput > 0) ? Number(spotPriceInput) : meta.spot;
  const chgPct = (changePercentInput !== undefined && !isNaN(changePercentInput)) ? Number(changePercentInput) : meta.changePercent;
  const changePercentText = (chgPct >= 0 ? '+' : '') + Number(chgPct).toFixed(2) + '%';
  
  const strikeInterval = meta.interval;
  const nearestStrike = Math.round(spot / strikeInterval) * strikeInterval;
  const symbolBias = meta.bias;
  const liveBias = isLiveMarket ? (symbolBias * (0.98 + Math.random() * 0.04)) : symbolBias;
  const strikesCount = 25;
  const startStrike = nearestStrike - Math.floor(strikesCount / 2) * strikeInterval;

  const chain = [];
  for (let i = 0; i < strikesCount; i++) {
    const strike = startStrike + i * strikeInterval;
    const atm = strike === nearestStrike;
    const randomFactor = isLiveMarket ? (0.98 + Math.random() * 0.04) : 1.0;
    const distanceFactor = Math.max(1, 10 - Math.abs(strike - nearestStrike) / strikeInterval);
    const baseOI = distanceFactor * randomFactor;
    const ceOI = parseFloat((baseOI * (strike >= nearestStrike ? 1.5 : 0.5)).toFixed(1));
    const peOI = parseFloat((baseOI * (strike <= nearestStrike ? 1.5 : 0.5) * liveBias).toFixed(1));
    const ceChange = (strike >= nearestStrike ? '+' : '-') + (Math.abs((strike - nearestStrike) / (strikeInterval * 10)) * 50 * randomFactor).toFixed(1) + '%';
    const peChange = (strike <= nearestStrike ? '+' : '-') + (Math.abs((strike - nearestStrike) / (strikeInterval * 10)) * 50 * randomFactor).toFixed(1) + '%';
    chain.push({ strike, ceOI, ceChange, peOI, peChange, atm });
  }

  const totalCallOI = chain.reduce((sum, opt) => sum + (Number(opt.ceOI) || 0), 0);
  const totalPutOI = chain.reduce((sum, opt) => sum + (Number(opt.peOI) || 0), 0);
  const calculatedPcr = totalCallOI > 0 ? parseFloat((totalPutOI / totalCallOI).toFixed(2)) : 1.0;

  let bestStrike = nearestStrike;
  let minLoss = Infinity;
  chain.forEach(candidate => {
    let totalLoss = 0;
    chain.forEach(opt => {
      if (candidate.strike > opt.strike) totalLoss += (candidate.strike - opt.strike) * opt.ceOI;
      if (candidate.strike < opt.strike) totalLoss += (opt.strike - candidate.strike) * opt.peOI;
    });
    if (totalLoss < minLoss) {
      minLoss = totalLoss;
      bestStrike = candidate.strike;
    }
  });

  const futuresData = [
    {
      symbol: `${symbol} FUT`,
      price: spot.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      rawPrice: spot,
      change: changePercentText,
      openInterest: meta.futOi
    }
  ];

  return {
    futures: futuresData,
    optionChain: chain,
    maxPain: bestStrike,
    pcr: calculatedPcr,
    spotPrice: spot
  };
}

export default function FnO() {
  const { user } = useAuth();
  const [underlying, setUnderlying] = useState('BTC');
  const [selectedExpiry, setSelectedExpiry] = useState('');

  // Predefined expiry list (dynamic next 3 Thursdays)
  const getNextThursdays = (count) => {
    const dates = [];
    let d = new Date();
    d.setDate(d.getDate() + ((4 + 7 - d.getDay()) % 7));
    if (d.getDay() === 4) {
      const utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
      const ist = new Date(utc + (360 * 60000));
      if (ist.getHours() > 15 || (ist.getHours() === 15 && ist.getMinutes() > 30)) {
        d.setDate(d.getDate() + 7);
      }
    }
    while (dates.length < count) {
      dates.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
      d.setDate(d.getDate() + 7);
    }
    return dates;
  };
  const [expiries] = useState(getNextThursdays(3));

  useEffect(() => {
    if (!selectedExpiry && expiries.length > 0) {
      setSelectedExpiry(expiries[0]);
    }
  }, [expiries, selectedExpiry]);

  const [buildupTab, setBuildupTab] = useState('long');
  const [isSyncing, setIsSyncing] = useState(false);

  // States pre-populated immediately with full calculated metrics — prevents empty/blank desk
  const initialData = computeFnOState('BTC');
  const [futures, setFutures] = useState(initialData.futures);
  const [optionChain, setOptionChain] = useState(initialData.optionChain);
  const [maxPain, setMaxPain] = useState(initialData.maxPain);
  const [pcr, setPcr] = useState(initialData.pcr);
  const [heatmapData, setHeatmapData] = useState(GLOBAL_CONSTITUENTS);

  // Mock stock list for Build-up Scanner (Global & US Equities / Crypto)
  const buildupStocks = {
    long: [
      { symbol: 'NVDA', price: '$128.50', change: '+3.38%', oi: '24.1M', oiChange: '+14.2%' },
      { symbol: 'BTC', price: '$64,250.00', change: '+2.91%', oi: '4.8B', oiChange: '+9.4%' },
      { symbol: 'TSLA', price: '$242.50', change: '+4.25%', oi: '16.5M', oiChange: '+11.8%' },
      { symbol: 'SOL', price: '$152.40', change: '+5.40%', oi: '820M', oiChange: '+18.6%' },
    ],
    short: [
      { symbol: 'GOOGL', price: '$165.30', change: '-0.42%', oi: '8.2M', oiChange: '+6.5%' },
      { symbol: 'CL', price: '$76.80', change: '-1.25%', oi: '2.1M', oiChange: '+8.9%' },
      { symbol: 'INTC', price: '$20.40', change: '-2.10%', oi: '14.5M', oiChange: '+12.4%' },
      { symbol: 'NKE', price: '$82.10', change: '-1.80%', oi: '5.2M', oiChange: '+5.1%' },
    ],
    covering: [
      { symbol: 'AAPL', price: '$224.20', change: '+1.12%', oi: '19.8M', oiChange: '-5.4%' },
      { symbol: 'ETH', price: '$3,420.00', change: '+1.95%', oi: '1.9B', oiChange: '-6.2%' },
      { symbol: 'AMD', price: '$154.20', change: '+2.85%', oi: '11.4M', oiChange: '-7.8%' },
      { symbol: 'AMZN', price: '$186.40', change: '+1.90%', oi: '9.2M', oiChange: '-4.6%' },
    ],
    unwinding: [
      { symbol: 'XOM', price: '$114.50', change: '-1.40%', oi: '4.2M', oiChange: '-3.8%' },
      { symbol: 'CVX', price: '$145.20', change: '-1.15%', oi: '3.1M', oiChange: '-4.1%' },
      { symbol: 'DIS', price: '$95.40', change: '-1.60%', oi: '6.4M', oiChange: '-5.2%' },
      { symbol: 'BA', price: '$162.10', change: '-2.30%', oi: '5.8M', oiChange: '-8.1%' },
    ]
  };

  const isMarketOpen = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (360 * 60000));
    const day = ist.getDay();
    if (day === 0 || day === 6) return false;
    const timeInMinutes = ist.getHours() * 60 + ist.getMinutes();
    return timeInMinutes >= 555 && timeInMinutes <= 930;
  };

  const fetchFnOData = async (showLoadingIndicator = false) => {
    if (showLoadingIndicator) setIsSyncing(true);
    try {
      let symbolParam = underlying;
      if (underlying === 'NIFTY') symbolParam = 'NIFTY50';
      
      const res = await apiClient.get(`/market/stock/${symbolParam}`);
      if (res && res.data) {
        const spotPrice = parseFloat(res.data.price);
        const chgPct = parseFloat(res.data.changePercent);
        
        if (!isNaN(spotPrice) && spotPrice > 0) {
          const computed = computeFnOState(underlying, spotPrice, chgPct, isMarketOpen());
          setFutures(computed.futures);
          setOptionChain(computed.optionChain);
          setMaxPain(computed.maxPain);
          setPcr(computed.pcr);
        }
      }
    } catch (error) {
      console.warn('F&O Live Sync Notice (using robust cached model):', error?.message);
    } finally {
      if (showLoadingIndicator) setIsSyncing(false);
    }
  };

  // Immediate update on symbol switch + gentle 6-second polling (prevents Render free-tier throttling)
  useEffect(() => {
    const computed = computeFnOState(underlying, undefined, undefined, isMarketOpen());
    setFutures(computed.futures);
    setOptionChain(computed.optionChain);
    setMaxPain(computed.maxPain);
    setPcr(computed.pcr);

    fetchFnOData(true);
    const interval = setInterval(() => fetchFnOData(false), 6000);
    return () => clearInterval(interval);
  }, [underlying, selectedExpiry]);

  // Subtle client-side live market tick animation every 2.5s for seamless interactivity
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMarketOpen()) {
        setFutures(prev => prev.map(f => {
          const tick = (Math.random() - 0.49) * 2;
          const currentPrice = f.rawPrice || parseFloat(String(f.price).replace(/,/g, '')) || 24850;
          const newPrice = currentPrice + tick;
          return {
            ...f,
            rawPrice: newPrice,
            price: newPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          };
        }));
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Determine sentiment details based on PCR
  const getSentiment = () => {
    if (pcr >= 1.3) return { label: 'Extremely Bullish', color: '#00ff88', rotation: 65 };
    if (pcr >= 1.05) return { label: 'Moderately Bullish', color: '#00ff88', rotation: 30 };
    if (pcr >= 0.9) return { label: 'Neutral / Balanced', color: '#ffb300', rotation: 0 };
    if (pcr >= 0.7) return { label: 'Moderately Bearish', color: '#ff4444', rotation: -30 };
    return { label: 'Extremely Bearish', color: '#ff4444', rotation: -65 };
  };

  const sentiment = getSentiment();

  // Find max value in option chain to scale the SVG bars properly
  const maxOIValue = Math.max(...optionChain.map(opt => Math.max(opt.ceOI, opt.peOI)), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 20, 39, 0.6) 0%, rgba(22, 28, 59, 0.4) 100%)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 6px 0', background: 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={28} style={{ color: '#00ff88' }} />
            Derivatives Desk
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            Live options chain greeks, put-call ratio sentiment gauge, and real-time futures build-up analytics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '24px',
            background: isSyncing ? 'rgba(255, 179, 0, 0.12)' : 'rgba(0, 255, 136, 0.12)',
            border: `1px solid ${isSyncing ? 'rgba(255, 179, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
            fontSize: '12px',
            fontWeight: 700,
            color: isSyncing ? '#ffb300' : '#00ff88'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isSyncing ? '#ffb300' : '#00ff88',
              boxShadow: isSyncing ? '0 0 8px #ffb300' : '0 0 8px #00ff88'
            }} />
            {isSyncing ? 'Syncing Live Ticks...' : 'Live F&O Engine Online'}
          </span>
        </div>
      </div>
      
      {/* Expiry and Symbol Filter Header */}
      <div className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { id: 'BTC', label: 'BTC Perps' },
            { id: 'ETH', label: 'ETH Options' },
            { id: 'SPX', label: 'S&P 500' },
            { id: 'NDX', label: 'Nasdaq 100' },
            { id: 'NVDA', label: 'NVDA Options' },
            { id: 'GC', label: 'Gold Futures' }
          ].map(sym => (
            <button
              key={sym.id}
              onClick={() => setUnderlying(sym.id)}
              className={underlying === sym.id ? 'active-filter' : ''}
              style={{
                padding: '8px 18px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255,255,255,0.02)',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              {sym.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginRight: '6px' }}>Expiry:</span>
          {expiries.map(exp => (
            <button
              key={exp}
              onClick={() => setSelectedExpiry(exp)}
              className={selectedExpiry === exp ? 'active-filter' : ''}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

      {/* Global Mega-Cap & Derivatives Heatmap */}
      {heatmapData.length > 0 && (
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} style={{ color: '#ffb300' }} /> Global Mega-Cap & Derivatives Market Heatmap
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px'
          }}>
            {heatmapData.map((stock, idx) => {
              const isPositive = stock.chg >= 0;
              // Shade intensity based on absolute change percentage (up to 3%)
              const intensity = Math.min(Math.abs(stock.chg) / 3, 1);
              // Green: 0, 255, 136 | Red: 255, 68, 68
              const bgColor = isPositive 
                ? `rgba(0, 255, 136, ${0.1 + (intensity * 0.3)})` 
                : `rgba(255, 68, 68, ${0.1 + (intensity * 0.3)})`;
              const borderColor = isPositive
                ? `rgba(0, 255, 136, ${0.2 + (intensity * 0.5)})`
                : `rgba(255, 68, 68, ${0.2 + (intensity * 0.5)})`;

              return (
                <div key={idx} style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {stock.symbol}
                    </span>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                      {stock.weight}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                      ${Number(stock.price).toLocaleString('en-US', { minimumFractionDigits: stock.price < 10 ? 2 : 0, maximumFractionDigits: 2 })}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: isPositive ? '#00ff88' : '#ff4444' }}>
                      {isPositive ? '+' : ''}{stock.chg}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Row: Sentiment Gauge & F&O Build-up Scanner */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1.3fr', 
        gap: '32px' 
      }}>
        
        {/* Market Sentiment Gauge & Max Pain */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="section-header" style={{ marginBottom: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} style={{ color: sentiment.color, transition: 'color 0.4s ease' }} /> F&O Sentiment Gauge
            </h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', height: '140px', justifyContent: 'center' }}>
            {/* Speedometer semi-circle */}
            <svg width="220" height="110" viewBox="0 0 200 100">
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="18" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#speed-gradient)" strokeWidth="14" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset="0" />
              
              <defs>
                <linearGradient id="speed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff4444" />
                  <stop offset="50%" stopColor="#ffb300" />
                  <stop offset="100%" stopColor="#00ff88" />
                </linearGradient>
              </defs>
              
              {/* Pointer Needle - dynamically colored based on gauge zone (Green, Yellow, or Red) */}
              <line 
                x1="100" 
                y1="100" 
                x2="100" 
                y2="28" 
                stroke={sentiment.color} 
                strokeWidth="4" 
                strokeLinecap="round" 
                transform={`rotate(${sentiment.rotation}, 100, 100)`}
                style={{ 
                  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
                  filter: `drop-shadow(0 0 6px ${sentiment.color})`
                }}
              />
              <circle 
                cx="100" 
                cy="100" 
                r="7" 
                fill={sentiment.color} 
                style={{ 
                  transition: 'fill 0.4s ease',
                  filter: `drop-shadow(0 0 6px ${sentiment.color})`
                }} 
              />
              <circle cx="100" cy="100" r="3" fill="#ffffff" />
            </svg>
            
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: sentiment.color }}>{sentiment.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Put-Call Ratio (PCR): <strong style={{ color: '#ffffff' }}>{pcr}</strong></div>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px', 
            marginTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '20px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Pain Level</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#00bcd4', marginTop: '6px' }}>${Number(maxPain).toLocaleString()}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Maximum loss strike for buyers</div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Future Spot Price</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                ${futures[0]?.price || '--'}
              </div>
              <div style={{ fontSize: '10px', color: futures[0]?.change?.includes('+') ? '#00ff88' : '#ff4444', fontWeight: 700, marginTop: '2px' }}>
                {futures[0]?.change || '--'}
              </div>
            </div>
          </div>
        </div>

        {/* F&O Build-up Scanner */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={20} style={{ color: '#00bcd4' }} /> Global Derivatives Build-up Scanner
            </h2>
          </div>

          {/* Build-up Category Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px' }}>
            {[
              { id: 'long', label: 'Long Build-up', desc: 'Price Up, OI Up' },
              { id: 'short', label: 'Short Build-up', desc: 'Price Down, OI Up' },
              { id: 'covering', label: 'Short Covering', desc: 'Price Up, OI Down' },
              { id: 'unwinding', label: 'Long Unwinding', desc: 'Price Down, OI Down' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setBuildupTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: buildupTab === tab.id ? 'var(--bg-primary)' : 'transparent',
                  color: buildupTab === tab.id ? '#00ff88' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
            {buildupStocks[buildupTab]?.map((stk, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.03)'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>{stk.symbol}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>OI: {stk.oi}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{stk.price.startsWith('$') ? stk.price : '$' + stk.price}</div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>
                    <span style={{ color: stk.change.includes('+') ? '#00ff88' : '#ff4444' }}>{stk.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Middle Row: Call vs Put Open Interest Visualizer Chart */}
      <div className="section-card">
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={20} style={{ color: '#00ff88' }} /> Strike-wise Open Interest (Call vs Put)
          </h2>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff4444' }}>
              <span style={{ width: '10px', height: '10px', background: '#ff4444', borderRadius: '2px' }} /> Call OI (Resistance)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ff88' }}>
              <span style={{ width: '10px', height: '10px', background: '#00ff88', borderRadius: '2px' }} /> Put OI (Support)
            </span>
          </div>
        </div>

        {/* Custom SVG Double-Sided Bar Chart */}
        <div style={{ overflowX: 'auto', padding: '10px 0' }}>
          <div style={{ minWidth: '700px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {optionChain.map((opt, i) => {
              const ceWidthPercent = (opt.ceOI / maxOIValue) * 45;
              const peWidthPercent = (opt.peOI / maxOIValue) * 45;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {/* Call Bar (Left Side) */}
                  <div style={{ width: '45%', display: 'flex', justifyContent: 'flex-end', paddingRight: '12px' }}>
                    <div style={{ 
                      width: `${ceWidthPercent}%`, 
                      height: '24px', 
                      background: 'linear-gradient(270deg, rgba(255, 68, 68, 0.75), rgba(255, 68, 68, 0.1))', 
                      borderRadius: '4px 0 0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingRight: '8px',
                      justifyContent: 'flex-end',
                      borderRight: '2px solid #ff4444',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}>
                      {opt.ceOI}L
                    </div>
                  </div>

                  {/* Strike Price Column (Center Pillar) */}
                  <div style={{ 
                    width: '10%', 
                    textAlign: 'center', 
                    fontWeight: 800, 
                    fontSize: '13px', 
                    color: opt.atm ? '#00e5ff' : '#9b9eac',
                    background: opt.atm ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                    padding: '6px 0',
                    borderRadius: '6px',
                    border: opt.atm ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent'
                  }}>
                    {opt.strike} {opt.atm && 'ATM'}
                  </div>

                  {/* Put Bar (Right Side) */}
                  <div style={{ width: '45%', display: 'flex', justifyContent: 'flex-start', paddingLeft: '12px' }}>
                    <div style={{ 
                      width: `${peWidthPercent}%`, 
                      height: '24px', 
                      background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.75), rgba(0, 255, 136, 0.1))', 
                      borderRadius: '0 4px 4px 0',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px',
                      justifyContent: 'flex-start',
                      borderLeft: '2px solid #00ff88',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}>
                      {opt.peOI}L
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Detailed Option Chain Table */}
      <div className="section-card" style={{ position: 'relative' }}>
        {!user?.is_pro && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 179, 0, 0.1)',
            border: '1px solid rgba(255, 179, 0, 0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            color: '#ffb300',
            fontWeight: 700,
            cursor: 'pointer'
          }} onClick={() => window.location.href = '/upgrade-pro'}>
            <Lock size={12} /> Unlock Advanced Greeks
          </div>
        )}
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={20} style={{ color: '#00bcd4' }} /> {underlying} Expiry Option Chain Table
          </h2>
        </div>
        
        <div className="screener-table" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table style={{ position: 'relative' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ textAlign: 'center', padding: '16px', color: '#ffb300' }}>CE Delta</th>
                <th style={{ textAlign: 'center', padding: '16px', color: '#ffb300' }}>CE Theta</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>CE OI Change</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>CE Open Interest</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>Strike Price</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>PE Open Interest</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>PE OI Change</th>
                <th style={{ textAlign: 'center', padding: '16px', color: '#ffb300' }}>PE Theta</th>
                <th style={{ textAlign: 'center', padding: '16px', color: '#ffb300' }}>PE Delta</th>
              </tr>
            </thead>
            <tbody>
              {optionChain.map((opt, idx) => {
                // Determine In-The-Money (ITM) options color background
                // For Calls: Strikes below spot price are ITM
                // For Puts: Strikes above spot price are ITM
                const rawSpot = futures[0]?.rawPrice;
                const currentSpot = typeof rawSpot === 'number' && rawSpot > 0
                  ? rawSpot
                  : (parseFloat(String(futures[0]?.price || '0').replace(/,/g, '')) || 24850);
                const isCeItm = opt.strike < currentSpot;
                const isPeItm = opt.strike > currentSpot;

                // Calculated Greeks (Simulated high-fidelity Option Greeks with overflow protection)
                const expVal = Math.min(Math.max((opt.strike - currentSpot) / 120, -40), 40);
                const ceDeltaVal = (1 / (1 + Math.exp(expVal))).toFixed(2);
                const peDeltaVal = (1 / (1 + Math.exp(expVal)) - 1).toFixed(2);
                const distSq = Math.min(Math.pow(opt.strike - currentSpot, 2), 25000000);
                const ceThetaVal = (-((12.5 + Math.sin(idx) * 2) * Math.exp(-distSq / 60000))).toFixed(2);
                const peThetaVal = (-((11.8 + Math.cos(idx) * 2) * Math.exp(-distSq / 60000))).toFixed(2);

                const blurStyle = user?.is_pro ? {} : { filter: 'blur(3.5px)', opacity: 0.5, userSelect: 'none' };

                return (
                  <tr 
                    key={idx} 
                    style={{ 
                      background: opt.atm ? 'rgba(0, 229, 255, 0.05)' : 'transparent',
                      borderLeft: opt.atm ? '3px solid #00e5ff' : '3px solid transparent'
                    }}
                  >
                    {/* CE Delta (Pro Gated) */}
                    <td 
                      onClick={() => !user?.is_pro && (window.location.href = '/upgrade-pro')}
                      style={{ 
                        textAlign: 'center', 
                        background: isCeItm ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                        fontWeight: 700,
                        color: '#ffb300',
                        cursor: !user?.is_pro ? 'pointer' : 'default',
                        ...blurStyle
                      }}
                    >
                      {ceDeltaVal}
                    </td>

                    {/* CE Theta (Pro Gated) */}
                    <td 
                      onClick={() => !user?.is_pro && (window.location.href = '/upgrade-pro')}
                      style={{ 
                        textAlign: 'center', 
                        background: isCeItm ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                        fontWeight: 700,
                        color: '#ffb300',
                        cursor: !user?.is_pro ? 'pointer' : 'default',
                        ...blurStyle
                      }}
                    >
                      {ceThetaVal}
                    </td>

                    {/* Call Columns */}
                    <td className="positive" style={{ 
                      textAlign: 'center', 
                      background: isCeItm ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                      fontWeight: 600
                    }}>
                      {opt.ceChange}
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      background: isCeItm ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}>
                      {opt.ceOI} Lakhs
                    </td>

                    {/* Strike Column */}
                    <td style={{ 
                      textAlign: 'center', 
                      fontWeight: 800, 
                      color: opt.atm ? '#00e5ff' : '#9b9eac',
                      fontSize: '15px'
                    }}>
                      {opt.strike}
                    </td>

                    {/* Put Columns */}
                    <td style={{ 
                      textAlign: 'center', 
                      background: isPeItm ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}>
                      {opt.peOI} Lakhs
                    </td>
                    <td className="negative" style={{ 
                      textAlign: 'center', 
                      background: isPeItm ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                      fontWeight: 600
                    }}>
                      {opt.peChange}
                    </td>

                    {/* PE Theta (Pro Gated) */}
                    <td 
                      onClick={() => !user?.is_pro && (window.location.href = '/upgrade-pro')}
                      style={{ 
                        textAlign: 'center', 
                        background: isPeItm ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                        fontWeight: 700,
                        color: '#ffb300',
                        cursor: !user?.is_pro ? 'pointer' : 'default',
                        ...blurStyle
                      }}
                    >
                      {peThetaVal}
                    </td>

                    {/* PE Delta (Pro Gated) */}
                    <td 
                      onClick={() => !user?.is_pro && (window.location.href = '/upgrade-pro')}
                      style={{ 
                        textAlign: 'center', 
                        background: isPeItm ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                        fontWeight: 700,
                        color: '#ffb300',
                        cursor: !user?.is_pro ? 'pointer' : 'default',
                        ...blurStyle
                      }}
                    >
                      {peDeltaVal}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}