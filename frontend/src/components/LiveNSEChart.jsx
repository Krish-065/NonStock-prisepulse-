import { useState, useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { io } from 'socket.io-client';
import { apiClient } from '../services/api';
import { 
  TrendingUp, TrendingDown, Maximize2, RefreshCw, Layers, 
  Activity, Zap, Clock, ShieldCheck 
} from 'lucide-react';

export default function LiveNSEChart({ symbol = 'RELIANCE', height = 450 }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ema20SeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);

  const [timeframe, setTimeframe] = useState('5m');
  const [showEMA, setShowEMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [loading, setLoading] = useState(true);

  // Live state details
  const [livePrice, setLivePrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [priceChangePercent, setPriceChangePercent] = useState(null);
  const [tickFlash, setTickFlash] = useState(null); // 'up' | 'down' | null
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const currentCandleRef = useRef(null);

  // 1. Initialize Chart Engine
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)', style: 1 },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)', style: 1 },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#00f2fe', width: 1, style: 2, labelBackgroundColor: '#00f2fe' },
        horzLine: { color: '#00f2fe', width: 1, style: 2, labelBackgroundColor: '#00f2fe' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Volume Histogram Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    // EMA Indicators
    const ema20Series = chart.addLineSeries({ color: '#00f2fe', lineWidth: 1.5, title: 'EMA 20' });
    const ema50Series = chart.addLineSeries({ color: '#8b5cf6', lineWidth: 1.5, title: 'EMA 50' });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;

    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height]);

  // 2. Fetch Historical Candles & Setup Data
  const loadChartData = async () => {
    setLoading(true);
    try {
      // Map ticker for NSE
      let cleanSym = symbol.toUpperCase();
      if (!cleanSym.endsWith('.NS') && !cleanSym.endsWith('.BO') && !cleanSym.startsWith('^')) {
        cleanSym = `${cleanSym}.NS`;
      }

      const res = await apiClient.get(`/market/history/${cleanSym}?interval=${timeframe}`);
      const rawBars = res.data || [];

      if (rawBars.length > 0) {
        const candles = [];
        const volumes = [];
        const ema20Data = [];
        const ema50Data = [];

        let ema20Acc = 0;
        let ema50Acc = 0;

        rawBars.forEach((bar, idx) => {
          const timestamp = Math.floor(new Date(bar.time || bar.date).getTime() / 1000);
          const open = parseFloat(bar.open);
          const high = parseFloat(bar.high);
          const low = parseFloat(bar.low);
          const close = parseFloat(bar.close);
          const vol = parseFloat(bar.volume || 1000);

          candles.push({ time: timestamp, open, high, low, close });
          volumes.push({
            time: timestamp,
            value: vol,
            color: close >= open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
          });

          // Calculate Simple EMA approximations
          if (idx === 0) {
            ema20Acc = close;
            ema50Acc = close;
          } else {
            const k20 = 2 / (20 + 1);
            const k50 = 2 / (50 + 1);
            ema20Acc = close * k20 + ema20Acc * (1 - k20);
            ema50Acc = close * k50 + ema50Acc * (1 - k50);
          }

          ema20Data.push({ time: timestamp, value: parseFloat(ema20Acc.toFixed(2)) });
          ema50Data.push({ time: timestamp, value: parseFloat(ema50Acc.toFixed(2)) });
        });

        candleSeriesRef.current.setData(candles);
        volumeSeriesRef.current.setData(volumes);
        if (showEMA) {
          ema20SeriesRef.current.setData(ema20Data);
          ema50SeriesRef.current.setData(ema50Data);
        }

        const lastBar = candles[candles.length - 1];
        currentCandleRef.current = { ...lastBar };
        setLivePrice(lastBar.close);
        const firstBar = candles[0];
        const change = lastBar.close - firstBar.open;
        setPriceChange(change.toFixed(2));
        setPriceChangePercent(((change / firstBar.open) * 100).toFixed(2));
      }
    } catch (err) {
      console.error('Failed to load NSE chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [symbol, timeframe]);

  // Toggle EMA Visibility
  useEffect(() => {
    if (ema20SeriesRef.current && ema50SeriesRef.current) {
      ema20SeriesRef.current.applyOptions({ visible: showEMA });
      ema50SeriesRef.current.applyOptions({ visible: showEMA });
    }
  }, [showEMA]);

  // Toggle Volume Visibility
  useEffect(() => {
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({ visible: showVolume });
    }
  }, [showVolume]);

  // 3. Connect Socket.io Live Streaming Engine
  useEffect(() => {
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
    const token = localStorage.getItem('token');

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '').toUpperCase();

    socket.on('connect', () => {
      socket.emit('subscribe', [cleanSymbol]);
    });

    socket.on('tick', (tick) => {
      if (tick.symbol.toUpperCase() !== cleanSymbol) return;

      const newPrice = parseFloat(tick.price);
      setLivePrice((prev) => {
        if (prev) {
          if (newPrice > prev) {
            setTickFlash('up');
            setTimeout(() => setTickFlash(null), 400);
          } else if (newPrice < prev) {
            setTickFlash('down');
            setTimeout(() => setTickFlash(null), 400);
          }
        }
        return newPrice;
      });

      if (tick.change !== undefined) setPriceChange(tick.change);
      if (tick.changePercent !== undefined) setPriceChangePercent(tick.changePercent);
      setLastUpdated(new Date());

      // Update current 1m candle live
      if (candleSeriesRef.current && currentCandleRef.current) {
        const nowSec = Math.floor(Date.now() / 1000);
        const candleInterval = timeframe === '1m' ? 60 : timeframe === '5m' ? 300 : 900;
        const currentCandleTime = Math.floor(nowSec / candleInterval) * candleInterval;

        let curBar = currentCandleRef.current;
        if (!curBar || curBar.time !== currentCandleTime) {
          curBar = {
            time: currentCandleTime,
            open: newPrice,
            high: newPrice,
            low: newPrice,
            close: newPrice,
          };
        } else {
          curBar.high = Math.max(curBar.high, newPrice);
          curBar.low = Math.min(curBar.low, newPrice);
          curBar.close = newPrice;
        }

        currentCandleRef.current = curBar;
        candleSeriesRef.current.update(curBar);

        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.update({
            time: currentCandleTime,
            value: tick.volume || 5000,
            color: curBar.close >= curBar.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
          });
        }
      }
    });

    return () => {
      socket.emit('unsubscribe', [cleanSymbol]);
      socket.disconnect();
    };
  }, [symbol, timeframe]);

  const isPositive = parseFloat(priceChangePercent || 0) >= 0;

  return (
    <div className="relative w-full rounded-2xl bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-5 shadow-2xl overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm">
            NSE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">{symbol}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE WS
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-slate-500" />
              NSE India Realtime Tick • {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Live Price & Flash Indicator */}
        <div className="flex items-center gap-6">
          <div className={`transition-all duration-300 ${tickFlash === 'up' ? 'scale-105 text-emerald-400' : tickFlash === 'down' ? 'scale-105 text-red-400' : ''}`}>
            <div className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-end gap-2">
              ₹{livePrice ? livePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '---'}
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className={`text-xs font-bold text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{priceChange} ({isPositive ? '+' : ''}{priceChangePercent}%)
            </div>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10">
            {['1m', '5m', '15m', '1h', '1d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Indicators & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showEMA
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
              title="Toggle EMA 20 & 50"
            >
              <Layers className="w-4 h-4" />
              EMA
            </button>

            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showVolume
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
              title="Toggle Volume Histogram"
            >
              <Activity className="w-4 h-4" />
              VOL
            </button>

            <button
              onClick={loadChartData}
              className="p-2 rounded-xl bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5 transition-all"
              title="Refresh Chart Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative mt-4">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-xl">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-400 font-semibold shadow-xl">
              <Zap className="w-5 h-5 animate-bounce text-cyan-400" />
              Streaming NSE Market Feed...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden" />
      </div>

      {/* Footer Info Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe]"></span>
            <span>EMA 20</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
            <span>EMA 50</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Bullish Candle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Bearish Candle</span>
          </div>
        </div>
        {/* Simulated Feed Disclaimer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '8px',
          padding: '4px 10px',
          color: '#f59e0b',
          fontSize: '10px',
          fontWeight: '700',
        }}>
          <Zap style={{ width: '11px', height: '11px' }} />
          <span>⚡ Simulated Price Feed — For Educational Purposes Only · Not Real Market Data</span>
        </div>
      </div>
    </div>
  );
}
