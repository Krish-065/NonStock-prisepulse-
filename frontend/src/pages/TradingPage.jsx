import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { useTrading } from '../contexts/TradingContext';
import { 
  Sliders, RotateCcw, TrendingUp, TrendingDown, ArrowRight, Zap, Shield, Sparkles, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import ExecutionTicket from '../components/ExecutionTicket';
import LiveMarketScreener from '../components/LiveMarketScreener';

const ASSETS = {
  Crypto: [
    { symbol: 'BTCUSDT', name: 'Bitcoin', tvSymbol: 'BINANCE:BTCUSDT', defaultPrice: 65000 },
    { symbol: 'ETHUSDT', name: 'Ethereum', tvSymbol: 'BINANCE:ETHUSDT', defaultPrice: 2746.66 },
    { symbol: 'SOLUSDT', name: 'Solana', tvSymbol: 'BINANCE:SOLUSDT', defaultPrice: 152.40 }
  ],
  Forex: [
    { symbol: 'EURUSD', name: 'Euro / US Dollar', tvSymbol: 'FX:EURUSD', defaultPrice: 1.0845 },
    { symbol: 'GBPUSD', name: 'British Pound / USD', tvSymbol: 'FX:GBPUSD', defaultPrice: 1.2980 },
    { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', tvSymbol: 'FX:USDJPY', defaultPrice: 149.25 }
  ],
  Commodities: [
    { symbol: 'XAUUSD', name: 'Gold Spot', tvSymbol: 'OANDA:XAUUSD', defaultPrice: 2650.40 },
    { symbol: 'WTIUSD', name: 'Crude Oil', tvSymbol: 'TVC:USOIL', defaultPrice: 71.85 },
    { symbol: 'XAGUSD', name: 'Silver Spot', tvSymbol: 'OANDA:XAGUSD', defaultPrice: 31.80 }
  ],
  Equities: [
    { symbol: 'AAPL', name: 'Apple Inc.', tvSymbol: 'NASDAQ:AAPL', defaultPrice: 228.50 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', tvSymbol: 'NASDAQ:NVDA', defaultPrice: 124.60 },
    { symbol: 'TSLA', name: 'Tesla Inc.', tvSymbol: 'NASDAQ:TSLA', defaultPrice: 254.20 },
    { symbol: 'SPY', name: 'S&P 500 ETF', tvSymbol: 'AMEX:SPY', defaultPrice: 574.80 }
  ]
};

export default function TradingPage() {
  const { balance, positions, placeOrder, closePosition, resetAccount } = useTrading();

  const [category, setCategory] = useState('Crypto');
  const [symbol, setSymbol] = useState('ETHUSDT');
  const [chartEngine, setChartEngine] = useState('tradingview'); // 'tradingview' or 'lightweight'
  const [currentPrice, setCurrentPrice] = useState(2746.66);

  // Lightweight chart refs
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const rawCandlesRef = useRef([]);

  // Active TV widget tracking
  const tvContainerRef = useRef(null);

  const activeAsset = ASSETS[category]?.find(a => a.symbol === symbol) || ASSETS['Crypto'][0];

  // 1. Initial price sync on symbol change
  useEffect(() => {
    if (activeAsset) {
      setCurrentPrice(activeAsset.defaultPrice);
    }
  }, [symbol, category]);

  // 2. Official TradingView Embed Widget (Self-Fetching Original Data, No Backend Feed Needed)
  useEffect(() => {
    if (chartEngine !== 'tradingview') return;

    const containerId = 'tv_chart_container';
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: activeAsset.tvSymbol,
          interval: '15',
          timezone: 'Etc/UTC',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#ffffff',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          container_id: containerId,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies'
          ]
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script tag if needed
    };
  }, [chartEngine, symbol, category, activeAsset.tvSymbol]);

  // 3. Lightweight Canvas fallback chart
  useEffect(() => {
    if (chartEngine !== 'lightweight' || !chartContainerRef.current) return;

    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#ffffff' },
        textColor: '#0F172A',
        fontFamily: 'Inter, sans-serif'
      },
      grid: {
        vertLines: { color: '#F1F5F9' },
        horzLines: { color: '#F1F5F9' },
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

    // Fetch data for lightweight chart
    if (category === 'Crypto') {
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
          candlestickSeries.setData(formattedData);
          setCurrentPrice(formattedData[formattedData.length - 1].close);
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
          candlestickSeries.update(tick);
          setCurrentPrice(tick.close);
        }
      };
      wsRef.current = ws;
    } else {
      // Simulate price ticks for canvas
      let basePrice = activeAsset.defaultPrice;
      const data = [];
      let time = Math.floor(Date.now() / 1000) - 100 * 60;
      for (let i = 0; i < 100; i++) {
        data.push({
          time: time + i * 60,
          open: basePrice,
          high: basePrice + Math.random() * (basePrice * 0.002),
          low: basePrice - Math.random() * (basePrice * 0.002),
          close: basePrice + (Math.random() - 0.49) * (basePrice * 0.002)
        });
        basePrice = data[i].close;
      }
      candlestickSeries.setData(data);
      setCurrentPrice(basePrice);
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) wsRef.current.close();
      chart.remove();
    };
  }, [chartEngine, symbol, category, activeAsset]);

  // Handle asset select from Screener
  const handleSelectScreenerAsset = (asset) => {
    if (asset.symbol === 'BTCUSDT' || asset.symbol === 'ETHUSDT') {
      setCategory('Crypto');
      setSymbol(asset.symbol);
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
    toast.success(`Loaded ${asset.name} onto Pro Terminal`, { icon: '📈' });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ─── 1. TOP ACCOUNT BAR ─── */}
      <div style={{
        background: '#FFFFFF',
        padding: '18px 28px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>PROVING CAPITAL</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>MAX LEVERAGE</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981' }}>50x Unlocked</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>FREE MARGIN</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>OPEN POSITIONS</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>{positions.length}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => {
              if (window.confirm('Reset virtual portfolio back to $1,000 baseline?')) resetAccount(false);
            }}
            style={{
              padding: '9px 18px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#334155'
            }}
          >
            <RotateCcw size={14} /> Reset Capital
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN TRADING TERMINAL ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Terminal Chart Container */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
        }}>
          
          {/* Chart Header Bar */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            background: '#FAFAFA'
          }}>
            {/* Asset Selection */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select 
                value={category} 
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  setSymbol(ASSETS[newCat][0].symbol);
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontWeight: '800',
                  fontSize: '13px',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer'
                }}
              >
                {Object.keys(ASSETS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #10B981',
                  fontWeight: '900',
                  fontSize: '14px',
                  background: '#ECFDF5',
                  color: '#059669',
                  cursor: 'pointer'
                }}
              >
                {ASSETS[category].map(a => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} - {a.name}
                  </option>
                ))}
              </select>

              <div style={{
                fontSize: '1.35rem',
                fontWeight: '900',
                color: '#0F172A',
                fontFamily: 'var(--font-mono)',
                marginLeft: '8px'
              }}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Chart Engine Switcher */}
            <div style={{
              display: 'flex',
              background: '#F1F5F9',
              padding: '3px',
              borderRadius: '8px',
              gap: '2px'
            }}>
              <button
                onClick={() => setChartEngine('tradingview')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: chartEngine === 'tradingview' ? '#FFFFFF' : 'transparent',
                  color: chartEngine === 'tradingview' ? '#0F172A' : '#64748B',
                  boxShadow: chartEngine === 'tradingview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                📊 Original TradingView Feed
              </button>
              <button
                onClick={() => setChartEngine('lightweight')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: chartEngine === 'lightweight' ? '#FFFFFF' : 'transparent',
                  color: chartEngine === 'lightweight' ? '#0F172A' : '#64748B',
                  boxShadow: chartEngine === 'lightweight' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                ⚡ Lightweight Canvas
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div style={{ width: '100%', height: '540px', position: 'relative' }}>
            {chartEngine === 'tradingview' ? (
              <div 
                id="tv_chart_container" 
                ref={tvContainerRef} 
                style={{ width: '100%', height: '100%' }} 
              />
            ) : (
              <div 
                ref={chartContainerRef} 
                style={{ width: '100%', height: '100%' }} 
              />
            )}
          </div>
        </div>

        {/* Right: Clean Order Execution Ticket (No TradingView Logo, Order/DOM, Exits, Sliders) */}
        <div>
          <ExecutionTicket 
            symbol={symbol}
            currentPrice={currentPrice}
            balance={balance}
            onPlaceOrder={(orderData) => {
              placeOrder(orderData);
            }}
            onReset={() => {
              toast('Ticket reset to default', { icon: '🔄' });
            }}
          />
        </div>
      </div>

      {/* ─── 3. ACTIVE WORKING TRADES & OPEN POSITIONS ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#10B981" /> Current Working Trades ({positions.length})
          </h3>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
            Live Unrealized PnL Updated in Real-Time
          </span>
        </div>

        {positions.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600', margin: '0 0 10px 0' }}>
              No active trades working right now.
            </p>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              Select an asset above and configure your ticket to execute your next proving trade.
            </span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 14px' }}>ASSET</th>
                  <th style={{ padding: '12px 14px' }}>SIDE</th>
                  <th style={{ padding: '12px 14px' }}>SIZE</th>
                  <th style={{ padding: '12px 14px' }}>ENTRY PRICE</th>
                  <th style={{ padding: '12px 14px' }}>MARK PRICE</th>
                  <th style={{ padding: '12px 14px' }}>LEVERAGE</th>
                  <th style={{ padding: '12px 14px' }}>STOP LOSS</th>
                  <th style={{ padding: '12px 14px' }}>TAKE PROFIT</th>
                  <th style={{ padding: '12px 14px' }}>UNREALIZED PNL</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(p => {
                  const mark = currentPrice;
                  const isLong = p.side === 'LONG';
                  const priceDiff = isLong ? (mark - p.entryPrice) : (p.entryPrice - mark);
                  const pnl = priceDiff * p.size;
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px', fontWeight: '800', color: '#0F172A' }}>{p.asset}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: p.side === 'LONG' ? '#ECFDF5' : '#FEF2F2',
                          color: p.side === 'LONG' ? '#059669' : '#DC2626'
                        }}>
                          {p.side}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{p.size}</td>
                      <td style={{ padding: '14px', fontFamily: 'var(--font-mono)' }}>${p.entryPrice?.toFixed(2)}</td>
                      <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>${mark.toFixed(2)}</td>
                      <td style={{ padding: '14px', fontWeight: '800', color: '#64748B' }}>{p.leverage}x</td>
                      <td style={{ padding: '14px', color: p.sl ? '#EF4444' : '#94A3B8', fontWeight: '700' }}>
                        {p.sl ? `$${p.sl}` : 'None'}
                      </td>
                      <td style={{ padding: '14px', color: p.tp ? '#10B981' : '#94A3B8', fontWeight: '700' }}>
                        {p.tp ? `$${p.tp}` : 'None'}
                      </td>
                      <td style={{ padding: '14px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: isProfit ? '#10B981' : '#EF4444' }}>
                        {isProfit ? '+' : ''}${pnl.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          onClick={() => closePosition(p.id, mark)}
                          style={{
                            padding: '6px 14px',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontWeight: '800',
                            fontSize: '12px',
                            color: '#0F172A',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 4. LIVE MARKET SCREENER (1-CLICK DIRECT LOAD) ─── */}
      <LiveMarketScreener onSelectAsset={handleSelectScreenerAsset} />

    </div>
  );
}
