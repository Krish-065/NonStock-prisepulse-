import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { useTrading } from '../contexts/TradingContext';
import { 
  Sliders, RotateCcw, TrendingUp, TrendingDown, ArrowRight, Zap, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import LiveMarketScreener from '../components/LiveMarketScreener';

const ASSETS = {
  Crypto: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  Forex: ['EURUSD', 'GBPUSD', 'USDJPY'],
  Commodities: ['XAUUSD', 'WTIUSD', 'XAGUSD'],
  Equities: ['AAPL', 'NVDA', 'TSLA', 'SPY']
};

const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    sma.push({ time: data[i].time, value: sum / period });
  }
  return sma;
};

const calculateEMA = (data, period) => {
  const ema = [];
  if (data.length === 0) return ema;
  const k = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < Math.min(period, data.length); i++) sum += data[i].close;
  let prevEma = sum / Math.min(period, data.length);
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    if (i === period - 1) {
      ema.push({ time: data[i].time, value: prevEma });
    } else {
      const val = data[i].close * k + prevEma * (1 - k);
      ema.push({ time: data[i].time, value: val });
      prevEma = val;
    }
  }
  return ema;
};

const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
  const upper = [];
  const lower = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    const mean = sum / period;
    let varianceSum = 0;
    for (let j = 0; j < period; j++) varianceSum += Math.pow(data[i - j].close - mean, 2);
    const sd = Math.sqrt(varianceSum / period);
    upper.push({ time: data[i].time, value: mean + multiplier * sd });
    lower.push({ time: data[i].time, value: mean - multiplier * sd });
  }
  return { upper, lower };
};

export default function TradingPage() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const smaSeriesRef = useRef(null);
  const emaSeriesRef = useRef(null);
  const bbUpperRef = useRef(null);
  const bbLowerRef = useRef(null);
  const wsRef = useRef(null);
  const rawCandlesRef = useRef([]);

  const { balance, positions, placeOrder, closePosition, resetAccount } = useTrading();

  const [category, setCategory] = useState('Crypto');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(65000);

  const [activeIndicators, setActiveIndicators] = useState({
    sma20: false,
    ema50: false,
    bollinger: false
  });

  const [side, setSide] = useState('LONG');
  const [orderType, setOrderType] = useState('Market');
  const [size, setSize] = useState(0.1);
  const [leverage, setLeverage] = useState(10);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const positionValue = size * currentPrice;
  const marginReq = positionValue / leverage;
  const isHighLeverage = leverage > 20;

  let dollarRiskAtSL = 0;
  if (sl) dollarRiskAtSL = Math.abs(currentPrice - parseFloat(sl)) * size;
  let dollarRewardAtTP = 0;
  if (tp) dollarRewardAtTP = Math.abs(parseFloat(tp) - currentPrice) * size;
  const rrr = dollarRiskAtSL > 0 && dollarRewardAtTP > 0 ? (dollarRewardAtTP / dollarRiskAtSL).toFixed(2) : 'N/A';
  
  const liqDistance = marginReq / size;
  const liqPrice = side === 'LONG' ? currentPrice - liqDistance : currentPrice + liqDistance;

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#ffffff' },
        textColor: '#0F172A',
        fontFamily: 'Inter, sans-serif'
      },
      grid: {
        vertLines: { color: '#E2E8F0' },
        horzLines: { color: '#E2E8F0' },
      },
      crosshair: { mode: 1 },
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: '#E2E8F0' }
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444'
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  const updateIndicatorsOnChart = (candles) => {
    if (!chartRef.current || !candles || candles.length === 0) return;

    if (activeIndicators.sma20) {
      if (!smaSeriesRef.current) {
        smaSeriesRef.current = chartRef.current.addSeries(LineSeries, { color: '#0284c7', lineWidth: 2, title: 'SMA 20' });
      }
      smaSeriesRef.current.setData(calculateSMA(candles, 20));
    } else if (smaSeriesRef.current) {
      chartRef.current.removeSeries(smaSeriesRef.current);
      smaSeriesRef.current = null;
    }

    if (activeIndicators.ema50) {
      if (!emaSeriesRef.current) {
        emaSeriesRef.current = chartRef.current.addSeries(LineSeries, { color: '#f97316', lineWidth: 2, title: 'EMA 50' });
      }
      emaSeriesRef.current.setData(calculateEMA(candles, 50));
    } else if (emaSeriesRef.current) {
      chartRef.current.removeSeries(emaSeriesRef.current);
      emaSeriesRef.current = null;
    }

    if (activeIndicators.bollinger) {
      if (!bbUpperRef.current) {
        bbUpperRef.current = chartRef.current.addSeries(LineSeries, { color: 'rgba(234, 179, 8, 0.7)', lineWidth: 1, lineStyle: 1, title: 'BB Upper' });
        bbLowerRef.current = chartRef.current.addSeries(LineSeries, { color: 'rgba(234, 179, 8, 0.7)', lineWidth: 1, lineStyle: 1, title: 'BB Lower' });
      }
      const { upper, lower } = calculateBollingerBands(candles, 20, 2);
      bbUpperRef.current.setData(upper);
      bbLowerRef.current.setData(lower);
    } else {
      if (bbUpperRef.current) {
        chartRef.current.removeSeries(bbUpperRef.current);
        bbUpperRef.current = null;
      }
      if (bbLowerRef.current) {
        chartRef.current.removeSeries(bbLowerRef.current);
        bbLowerRef.current = null;
      }
    }
  };

  useEffect(() => {
    updateIndicatorsOnChart(rawCandlesRef.current);
  }, [activeIndicators]);

  useEffect(() => {
    if (!candlestickSeriesRef.current) return;
    const isBinanceSymbol = category === 'Crypto';
    
    if (isBinanceSymbol) {
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`)
        .then(res => res.json())
        .then(data => {
          const formattedData = data.map(d => ({
            time: d[0] / 1000,
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4])
          }));
          rawCandlesRef.current = formattedData;
          candlestickSeriesRef.current.setData(formattedData);
          setCurrentPrice(formattedData[formattedData.length - 1].close);
          updateIndicatorsOnChart(formattedData);
        })
        .catch(err => console.error(err));

      if (wsRef.current) wsRef.current.close();
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.e === 'kline') {
          const k = msg.k;
          const tick = {
            time: k.t / 1000,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c)
          };
          candlestickSeriesRef.current.update(tick);
          setCurrentPrice(tick.close);
        }
      };
      wsRef.current = ws;
    } else {
      let mockPrice = category === 'Forex' ? 1.0845 : category === 'Commodities' ? 2518.00 : 185;
      const data = [];
      let time = Math.floor(Date.now() / 1000) - 100 * 60;
      for (let i = 0; i < 100; i++) {
        data.push({
          time: time + i * 60,
          open: mockPrice,
          high: mockPrice + Math.random() * (mockPrice * 0.002),
          low: mockPrice - Math.random() * (mockPrice * 0.002),
          close: mockPrice + (Math.random() - 0.49) * (mockPrice * 0.002)
        });
        mockPrice = data[i].close;
      }
      rawCandlesRef.current = data;
      candlestickSeriesRef.current.setData(data);
      setCurrentPrice(mockPrice);
      updateIndicatorsOnChart(data);

      if (wsRef.current) wsRef.current.close();
      const interval = setInterval(() => {
        mockPrice = mockPrice + (Math.random() - 0.49) * (mockPrice * 0.0008);
        candlestickSeriesRef.current.update({
          time: Math.floor(Date.now() / 1000),
          open: mockPrice,
          high: mockPrice + (mockPrice * 0.0004),
          low: mockPrice - (mockPrice * 0.0004),
          close: mockPrice
        });
        setCurrentPrice(mockPrice);
      }, 2000);
      wsRef.current = { close: () => clearInterval(interval) };
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [symbol, category]);

  const handlePlaceOrder = () => {
    if (marginReq > balance) {
      toast.error('Insufficient Free Margin');
      return;
    }
    placeOrder({
      asset: symbol,
      side,
      size,
      leverage,
      entryPrice: currentPrice,
      margin: marginReq,
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null
    });
    setShowConfirmModal(false);
    toast.success(`${side} order filled for ${size} ${symbol}`);
  };

  const handleScreenerTradeSelect = (asset) => {
    if (asset.symbol === 'BTC-USD') {
      setCategory('Crypto');
      setSymbol('BTCUSDT');
    } else if (asset.symbol === 'GC=F') {
      setCategory('Commodities');
      setSymbol('XAUUSD');
    } else if (asset.symbol === 'EURUSD=X') {
      setCategory('Forex');
      setSymbol('EURUSD');
    } else if (asset.symbol === 'GBPUSD=X') {
      setCategory('Forex');
      setSymbol('GBPUSD');
    } else if (asset.symbol === 'USDJPY=X') {
      setCategory('Forex');
      setSymbol('USDJPY');
    } else {
      setCategory('Forex');
      setSymbol(asset.badge.replace('/', ''));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(`Loaded ${asset.name} onto Chart Terminal`, { icon: '📈' });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. TOP ACCOUNT BAR */}
      <div style={{ background: '#FFFFFF', padding: '16px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.5px' }}>PROVING CAPITAL</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.5px' }}>MAX LEVERAGE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981' }}>50x Unlocked</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.5px' }}>FREE MARGIN</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', letterSpacing: '0.5px' }}>OPEN POSITIONS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>{positions.length}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => {
              if (window.confirm('Reset virtual portfolio back to $1,000 baseline?')) resetAccount(false);
            }}
            style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Reset Capital
          </button>
        </div>
      </div>

      {/* 2. MAIN TRADING TERMINAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px' }}>
        
        {/* Left: Terminal Chart */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          
          {/* Chart Header Bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select 
                value={category} 
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSymbol(ASSETS[e.target.value][0]);
                }}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontWeight: '700', background: '#F8FAFC' }}
              >
                {Object.keys(ASSETS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontWeight: '800', background: '#FFFFFF' }}
              >
                {ASSETS[category].map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Technical Indicators Toggle Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sliders size={13} color="#10B981" /> Indicators:
              </span>
              {[
                { id: 'sma20', label: 'SMA 20', color: '#0284c7' },
                { id: 'ema50', label: 'EMA 50', color: '#f97316' },
                { id: 'bollinger', label: 'Bollinger Bands', color: '#eab308' }
              ].map(ind => {
                const isAct = activeIndicators[ind.id];
                return (
                  <button
                    key={ind.id}
                    onClick={() => setActiveIndicators(prev => ({ ...prev, [ind.id]: !prev[ind.id] }))}
                    style={{
                      background: isAct ? ind.color : '#F1F5F9',
                      color: isAct ? '#FFFFFF' : '#475569',
                      border: `1px solid ${isAct ? ind.color : '#CBD5E1'}`,
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {ind.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={chartContainerRef} style={{ width: '100%', height: '480px' }} />
        </div>

        {/* Right: Order Ticket */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>Execution Ticket</h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setSide('LONG')}
              style={{ flex: 1, padding: '10px', background: side === 'LONG' ? '#10B981' : '#F1F5F9', color: side === 'LONG' ? '#FFF' : '#64748B', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}
            >
              Buy / Long
            </button>
            <button 
              onClick={() => setSide('SHORT')}
              style={{ flex: 1, padding: '10px', background: side === 'SHORT' ? '#EF4444' : '#F1F5F9', color: side === 'SHORT' ? '#FFF' : '#64748B', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}
            >
              Sell / Short
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>Position Size (Units)</label>
            <input 
              type="number" 
              value={size} 
              onChange={(e) => setSize(Math.max(0.001, parseFloat(e.target.value) || 0))} 
              className="terminal-input"
              step="0.1"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Leverage ({leverage}x)</label>
              {isHighLeverage && <span style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: '800' }}>⚠️ High Risk</span>}
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))} 
              style={{ width: '100%', accentColor: isHighLeverage ? '#EF4444' : '#10B981' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Take Profit</label>
              <input type="number" value={tp} onChange={(e) => setTp(e.target.value)} className="terminal-input" placeholder="Price" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>Stop Loss</label>
              <input type="number" value={sl} onChange={(e) => setSl(e.target.value)} className="terminal-input" placeholder="Price" />
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>Required Margin:</span>
              <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>${marginReq.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#475569' }}>Est. Liq Price:</span>
              <span style={{ fontWeight: '700', color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>${liqPrice.toFixed(2)}</span>
            </div>
            {sl && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Risk at SL:</span>
                <span style={{ fontWeight: '700', color: '#EF4444', fontFamily: 'var(--font-mono)' }}>-${dollarRiskAtSL.toFixed(2)}</span>
              </div>
            )}
            {tp && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Reward at TP:</span>
                <span style={{ fontWeight: '700', color: '#10B981', fontFamily: 'var(--font-mono)' }}>+${dollarRewardAtTP.toFixed(2)}</span>
              </div>
            )}
            {sl && tp && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Risk:Reward:</span>
                <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>1 : {rrr}</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowConfirmModal(true)}
            style={{ padding: '12px', background: side === 'LONG' ? '#10B981' : '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', marginTop: 'auto' }}
          >
            Place {side} Order
          </button>
        </div>
      </div>

      {/* 3. ACTIVE POSITIONS */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '16px' }}>Active Positions</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#475569', fontSize: '0.875rem', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ paddingBottom: '8px' }}>Asset</th>
              <th style={{ paddingBottom: '8px' }}>Side</th>
              <th style={{ paddingBottom: '8px' }}>Size / Lev</th>
              <th style={{ paddingBottom: '8px' }}>Entry</th>
              <th style={{ paddingBottom: '8px' }}>Mark</th>
              <th style={{ paddingBottom: '8px' }}>Liq. Price</th>
              <th style={{ paddingBottom: '8px' }}>PnL</th>
              <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>No active positions</td>
              </tr>
            ) : positions.map(pos => {
              const posMark = pos.asset === symbol ? currentPrice : pos.entryPrice;
              const isLong = pos.side === 'LONG';
              const pnl = isLong ? (posMark - pos.entryPrice) * pos.size : (pos.entryPrice - posMark) * pos.size;
              const pnlColor = pnl >= 0 ? '#10B981' : '#EF4444';
              
              const posLiqDistance = pos.margin / pos.size;
              const posLiq = isLong ? pos.entryPrice - posLiqDistance : pos.entryPrice + posLiqDistance;

              return (
                <tr key={pos.id} style={{ borderBottom: '1px solid #F1F5F9', fontFamily: 'var(--font-mono)' }}>
                  <td style={{ padding: '12px 0', fontWeight: '700' }}>{pos.asset}</td>
                  <td style={{ padding: '12px 0', color: isLong ? '#10B981' : '#EF4444', fontWeight: '700' }}>{pos.side}</td>
                  <td style={{ padding: '12px 0' }}>{pos.size} ({pos.leverage}x)</td>
                  <td style={{ padding: '12px 0' }}>${pos.entryPrice.toFixed(2)}</td>
                  <td style={{ padding: '12px 0' }}>${posMark.toFixed(2)}</td>
                  <td style={{ padding: '12px 0', color: '#F59E0B' }}>${posLiq.toFixed(2)}</td>
                  <td style={{ padding: '12px 0', color: pnlColor, fontWeight: '700' }}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 0', textAlign: 'right' }}>
                    <button 
                      onClick={() => closePosition(pos.id, posMark)}
                      style={{ padding: '4px 8px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Market Close
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. LIVE MARKET SCREENER (BTC, GOLD, FOREX WITH REAL-TIME LINE CHARTS) */}
      <LiveMarketScreener onSelectAsset={handleScreenerTradeSelect} />

      {/* 5. CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#FFFFFF', padding: '32px', borderRadius: '12px', maxWidth: '400px', width: '100%',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', color: '#0F172A'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px' }}>Confirm Execution</h3>
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
              <div><strong>Order:</strong> {side} {size} {symbol} @ {orderType}</div>
              <div><strong>Margin Allocated:</strong> ${marginReq.toFixed(2)}</div>
              <div><strong>Leverage:</strong> {leverage}x</div>
              <div style={{ marginTop: '8px', color: '#EF4444' }}>Max Loss (Liq): -${marginReq.toFixed(2)}</div>
              {tp && <div style={{ color: '#10B981' }}>Max Profit (TP): +${dollarRewardAtTP.toFixed(2)}</div>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handlePlaceOrder}
                style={{ flex: 1, padding: '12px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
