import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useTrading } from '../contexts/TradingContext';
import { Settings, Maximize2, DollarSign, PieChart, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ASSETS = {
  Crypto: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  Forex: ['EURUSD', 'GBPUSD', 'USDJPY'], // Simulated/Static for now if Binance doesn't provide
  Commodities: ['XAUUSD', 'WTIUSD', 'XAGUSD'],
  Equities: ['AAPL', 'NVDA', 'TSLA', 'SPY']
};

export default function Terminal() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const { balance, positions, placeOrder, closePosition } = useTrading();

  const [category, setCategory] = useState('Crypto');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(65000); // Default placeholder
  const [historicalData, setHistoricalData] = useState([]);

  // Order Ticket State
  const [side, setSide] = useState('LONG');
  const [orderType, setOrderType] = useState('Market');
  const [size, setSize] = useState(0.1);
  const [leverage, setLeverage] = useState(10);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Derived Calc
  const positionValue = size * currentPrice;
  const marginReq = positionValue / leverage;
  const isHighLeverage = leverage > 20;

  let dollarRiskAtSL = 0;
  if (sl) {
    dollarRiskAtSL = Math.abs(currentPrice - parseFloat(sl)) * size;
  }
  let dollarRewardAtTP = 0;
  if (tp) {
    dollarRewardAtTP = Math.abs(parseFloat(tp) - currentPrice) * size;
  }
  const rrr = dollarRiskAtSL > 0 && dollarRewardAtTP > 0 ? (dollarRewardAtTP / dollarRiskAtSL).toFixed(2) : 'N/A';
  
  // Liquidation Price Calc
  // Margin = Loss at liquidation
  // Loss = |Current - Liq| * size => Liq = Current +/- (Margin / size)
  const liqDistance = marginReq / size;
  const liqPrice = side === 'LONG' ? currentPrice - liqDistance : currentPrice + liqDistance;

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#ffffff' },
        textColor: '#0F172A',
      },
      grid: {
        vertLines: { color: '#E2E8F0' },
        horzLines: { color: '#E2E8F0' },
      },
      crosshair: {
        mode: 1, // Magnet
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#E2E8F0',
      }
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
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch Data & Connect WebSocket
  useEffect(() => {
    if (!candlestickSeriesRef.current) return;

    // We use binance klines for crypto. For others, we might mock it if they aren't available on binance.
    const isBinanceSymbol = category === 'Crypto';
    
    if (isBinanceSymbol) {
      // Fetch Historical Data
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
          candlestickSeriesRef.current.setData(formattedData);
          setCurrentPrice(formattedData[formattedData.length - 1].close);
        })
        .catch(err => console.error(err));

      // Connect WS
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
      // Mock Data for non-crypto
      let mockPrice = category === 'Forex' ? 1.10 : category === 'Commodities' ? 2000 : 150;
      const data = [];
      let time = Math.floor(Date.now() / 1000) - 100 * 60;
      for (let i = 0; i < 100; i++) {
        data.push({
          time: time + i * 60,
          open: mockPrice,
          high: mockPrice + Math.random() * 2,
          low: mockPrice - Math.random() * 2,
          close: mockPrice + (Math.random() - 0.5) * 2
        });
        mockPrice = data[i].close;
      }
      candlestickSeriesRef.current.setData(data);
      setCurrentPrice(mockPrice);

      if (wsRef.current) wsRef.current.close();
      const interval = setInterval(() => {
        mockPrice = mockPrice + (Math.random() - 0.5) * 1;
        candlestickSeriesRef.current.update({
          time: Math.floor(Date.now() / 1000),
          open: mockPrice,
          high: mockPrice + 0.5,
          low: mockPrice - 0.5,
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
    placeOrder({
      asset: symbol,
      side,
      type: orderType,
      size: parseFloat(size),
      leverage: parseInt(leverage),
      entryPrice: currentPrice,
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null,
      margin: marginReq
    });
    setShowConfirmModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 100px)' }}>
      
      {/* Top Bar: Asset Selector & Balance Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '16px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setSymbol(ASSETS[e.target.value][0]); }}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontWeight: '600', color: '#0F172A' }}
          >
            {Object.keys(ASSETS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontWeight: '600', color: '#0F172A' }}
          >
            {ASSETS[category].map(sym => <option key={sym} value={sym}>{sym}</option>)}
          </select>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#0F172A' }}>
            ${currentPrice.toFixed(2)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>Available Margin</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#10B981' }}>${balance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Chart Area */}
        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: '700' }}>{symbol} / USD</div>
            <Maximize2 size={16} color="#475569" style={{ cursor: 'pointer' }} />
          </div>
          <div ref={chartContainerRef} style={{ flex: 1, width: '100%' }} />
        </div>

        {/* Order Ticket Panel */}
        <div style={{ width: '350px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', fontWeight: '800', fontSize: '1.125rem' }}>Order Ticket</div>
          
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Side Toggle */}
            <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: '8px', padding: '4px', border: '1px solid #E2E8F0' }}>
              <button 
                onClick={() => setSide('LONG')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: side === 'LONG' ? '#10B981' : 'transparent', color: side === 'LONG' ? '#FFF' : '#475569', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}
              >LONG</button>
              <button 
                onClick={() => setSide('SHORT')}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: side === 'SHORT' ? '#EF4444' : 'transparent', color: side === 'SHORT' ? '#FFF' : '#475569', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}
              >SHORT</button>
            </div>

            {/* Inputs */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Size (Units)</label>
              <input type="number" step="0.01" value={size} onChange={(e) => setSize(e.target.value)} className="terminal-input" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Leverage: {leverage}x</label>
                {isHighLeverage && <AlertTriangle size={14} color="#F59E0B" />}
              </div>
              <input type="range" min="1" max="50" value={leverage} onChange={(e) => setLeverage(e.target.value)} style={{ width: '100%', accentColor: isHighLeverage ? '#F59E0B' : '#3B82F6' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Take Profit</label>
                <input type="number" value={tp} onChange={(e) => setTp(e.target.value)} className="terminal-input" placeholder="Price" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>Stop Loss</label>
                <input type="number" value={sl} onChange={(e) => setSl(e.target.value)} className="terminal-input" placeholder="Price" />
              </div>
            </div>

            {/* Live Calcs */}
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
      </div>

      {/* Active Positions Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', overflowX: 'auto' }}>
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
              <th style={{ paddingBottom: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>No active positions</td>
              </tr>
            ) : positions.map(pos => {
              // Simulating live mark price if it's the current asset, otherwise static entry
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
                  <td style={{ padding: '12px 0' }}>
                    <button 
                      onClick={() => closePosition(pos.id, posMark)}
                      style={{ padding: '4px 8px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Market Close
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
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
