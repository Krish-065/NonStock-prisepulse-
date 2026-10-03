import React, { useState, useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { 
  Play, Pause, RotateCcw, FastForward, SkipForward, Rewind,
  Calendar, Clock, DollarSign, TrendingUp, TrendingDown, Activity, ShieldCheck, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTrading } from '../contexts/TradingContext';

const REPLAY_ASSETS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 420.50, volatility: 0.015 },
  { symbol: 'BTCUSDT', name: 'Bitcoin / USDT', basePrice: 58000, volatility: 0.02 },
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 175.20, volatility: 0.01 },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 215.00, volatility: 0.025 },
  { symbol: 'EURUSD', name: 'EUR / USD', basePrice: 1.0820, volatility: 0.004 },
  { symbol: 'XAUUSD', name: 'Gold Spot', basePrice: 2350.00, volatility: 0.008 }
];

export default function MarketReplay() {
  const { balance } = useTrading();

  const [selectedAsset, setSelectedAsset] = useState(REPLAY_ASSETS[0]);
  const [candles, setCandles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(30); // show initial 30 candles
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 5x
  const [orderSide, setOrderSide] = useState('BUY');
  const [orderUnits, setOrderUnits] = useState(10);
  const [replayTrades, setReplayTrades] = useState([]);
  const [replayBalance, setReplayBalance] = useState(100000);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const playTimerRef = useRef(null);

  // Generate 120 historical candles for the asset
  useEffect(() => {
    let p = selectedAsset.basePrice;
    const history = [];
    const baseTime = Math.floor(Date.now() / 1000) - 120 * 60 * 60; // 120 hours ago

    for (let i = 0; i < 120; i++) {
      const change = (Math.random() - 0.485) * (p * selectedAsset.volatility);
      const open = p;
      const close = p + change;
      const high = Math.max(open, close) + Math.random() * (p * selectedAsset.volatility * 0.5);
      const low = Math.min(open, close) - Math.random() * (p * selectedAsset.volatility * 0.5);
      p = close;

      history.push({
        time: baseTime + i * 3600,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });
    }

    setCandles(history);
    setCurrentIndex(35);
    setIsPlaying(false);
    setReplayTrades([]);
    setReplayBalance(100000);
  }, [selectedAsset]);

  // Init chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#0B0F19' },
        textColor: '#94A3B8',
        fontFamily: 'Inter, sans-serif'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: { mode: 1 },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: 'rgba(255, 255, 255, 0.08)' },
      rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.08)' }
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444'
    });

    chartRef.current = chart;
    seriesRef.current = series;

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

  // Update chart data as index moves
  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      const slice = candles.slice(0, currentIndex);
      seriesRef.current.setData(slice);
    }
  }, [candles, currentIndex]);

  // Replay playback loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(200, 1000 / speed);
      playTimerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= candles.length) {
            setIsPlaying(false);
            toast.success('Historical replay session complete!');
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, speed, candles.length]);

  const currentCandle = candles[currentIndex - 1] || { close: selectedAsset.basePrice };

  const handleExecuteReplayOrder = () => {
    const cost = currentCandle.close * orderUnits;
    if (orderSide === 'BUY' && cost > replayBalance) {
      toast.error('Insufficient simulation capital');
      return;
    }

    const trade = {
      id: Date.now(),
      symbol: selectedAsset.symbol,
      side: orderSide,
      price: currentCandle.close,
      units: orderUnits,
      time: new Date().toLocaleTimeString(),
      barIndex: currentIndex
    };

    if (orderSide === 'BUY') {
      setReplayBalance(prev => prev - cost);
    } else {
      setReplayBalance(prev => prev + cost);
    }

    setReplayTrades(prev => [trade, ...prev]);
    toast.success(`Simulated ${orderSide} ${orderUnits} ${selectedAsset.symbol} @ $${currentCandle.close.toFixed(2)}`);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentIndex < candles.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRewind = () => {
    setIsPlaying(false);
    setCurrentIndex(30);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#F8FAFC' }}>
      
      {/* ─── 1. TOP HEADER BANNER ─── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(6, 95, 70, 0.95) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        padding: '24px 32px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ background: '#10B981', color: '#042F2E', fontSize: '11px', fontWeight: '900', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.8px' }}>
              PRO ENGINE
            </span>
            <span style={{ fontSize: '13px', color: '#A7F3D0', fontWeight: '700' }}>
              Module 02 // 24/7 Market Replay
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            The Time Machine: Bar-by-Bar Historical Replay Engine
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#D1FAE5', maxWidth: '720px', lineHeight: 1.5 }}>
            Practice 50+ trade setups anytime on evenings & weekends without waiting for live market hours. Future candles remain blacked out until you step forward.
          </p>
        </div>

        {/* Asset Selector */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 16px', borderRadius: '12px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#A7F3D0' }}>SESSION:</span>
          <select 
            value={selectedAsset.symbol} 
            onChange={(e) => {
              const found = REPLAY_ASSETS.find(a => a.symbol === e.target.value);
              if (found) setSelectedAsset(found);
            }}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {REPLAY_ASSETS.map(a => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol} - {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── 2. REPLAY WORKSPACE ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px', alignItems: 'start' }}>
        
        {/* Left: Replay Chart & Controls */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(16px)'
        }}>
          {/* Top Bar of Chart */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF' }}>
                {selectedAsset.symbol}
              </span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#10B981' }}>
                ${currentCandle.close?.toFixed(2)}
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#10B981" />
              Bar {currentIndex} of {candles.length} ({Math.round((currentIndex / candles.length) * 100)}% Replayed)
            </div>
          </div>

          {/* Chart Canvas */}
          <div ref={chartContainerRef} style={{ width: '100%', height: '480px' }} />

          {/* Replay Control Scrub Bar */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Play/Pause & Step Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background: isPlaying ? '#EF4444' : '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                {isPlaying ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Play Replay</>}
              </button>

              <button
                onClick={handleStepForward}
                title="Step forward 1 candle"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#FFFFFF'
                }}
              >
                <SkipForward size={14} /> Next Bar
              </button>

              <button
                onClick={handleRewind}
                title="Rewind to start"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#94A3B8'
                }}
              >
                <RotateCcw size={14} /> Rewind
              </button>
            </div>

            {/* Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8' }}>SPEED:</span>
              {[1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    background: speed === s ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                    color: speed === s ? '#042F2E' : '#94A3B8',
                    border: speed === s ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Timeline Slider */}
            <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range"
                min="10"
                max={candles.length}
                value={currentIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentIndex(parseInt(e.target.value));
                }}
                style={{ flex: 1, accentColor: '#10B981', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Right: Simulated Trade Execution Desk */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Order Ticket */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#FFFFFF' }}>
                Replay Trade Desk
              </h3>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                LIVE BAR
              </span>
            </div>

            {/* Side Switch */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => setOrderSide('BUY')}
                style={{
                  padding: '9px 0',
                  borderRadius: '8px',
                  border: 'none',
                  background: orderSide === 'BUY' ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                  color: orderSide === 'BUY' ? '#FFFFFF' : '#94A3B8',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Buy / Long
              </button>
              <button
                onClick={() => setOrderSide('SELL')}
                style={{
                  padding: '9px 0',
                  borderRadius: '8px',
                  border: 'none',
                  background: orderSide === 'SELL' ? '#EF4444' : 'rgba(255, 255, 255, 0.05)',
                  color: orderSide === 'SELL' ? '#FFFFFF' : '#94A3B8',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Sell / Short
              </button>
            </div>

            {/* Units Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Position Size (Units)
              </label>
              <input
                type="number"
                min="1"
                value={orderUnits}
                onChange={(e) => setOrderUnits(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Financial Summary */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Order Value:</span>
                <span style={{ fontWeight: '800', color: '#FFFFFF' }}>
                  ${(currentCandle.close * orderUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Sim Balance:</span>
                <span style={{ fontWeight: '800', color: '#10B981' }}>
                  ${replayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleExecuteReplayOrder}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: orderSide === 'BUY' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#FFFFFF',
                fontWeight: '900',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              Place {orderSide} @ Bar {currentIndex}
            </button>
          </div>

          {/* Replay History */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(16px)'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 10px 0', color: '#FFFFFF' }}>
              Session Trades ({replayTrades.length})
            </h4>
            {replayTrades.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                No trades taken in this replay session yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {replayTrades.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', fontSize: '11px' }}>
                    <span style={{ fontWeight: '800', color: t.side === 'BUY' ? '#10B981' : '#EF4444' }}>
                      {t.side} {t.units} {t.symbol}
                    </span>
                    <span style={{ color: '#CBD5E1' }}>
                      ${t.price.toFixed(2)} (Bar {t.barIndex})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
