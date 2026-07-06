import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Activity, BarChart2 } from 'lucide-react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { apiClient } from '../services/api';

// Symbol categories with popular options
const SYMBOL_CATEGORIES = {
  'Indian Stocks': [
    { label: 'SENSEX',     value: 'BSE:SENSEX' },
    { label: 'NIFTY 50',   value: 'NSE:NIFTY' },
    { label: 'RELIANCE',   value: 'NSE:RELIANCE' },
    { label: 'TCS',        value: 'NSE:TCS' },
    { label: 'HDFC Bank',  value: 'NSE:HDFCBANK' },
    { label: 'INFOSYS',    value: 'NSE:INFY' },
    { label: 'ICICI Bank', value: 'NSE:ICICIBANK' },
    { label: 'SBI',        value: 'NSE:SBIN' },
    { label: 'ADANI ENT',  value: 'NSE:ADANIENT' },
    { label: 'ZOMATO',     value: 'NSE:ZOMATO' },
    { label: 'WIPRO',      value: 'NSE:WIPRO' },
    { label: 'HCLTECH',    value: 'NSE:HCLTECH' },
    { label: 'MARUTI',     value: 'NSE:MARUTI' },
    { label: 'TATAMOTORS', value: 'NSE:TATAMOTORS' },
    { label: 'BAJFINANCE', value: 'NSE:BAJFINANCE' },
    { label: 'TITAN',      value: 'NSE:TITAN' },
    { label: 'SUNPHARMA',  value: 'NSE:SUNPHARMA' },
    { label: 'DRREDDY',    value: 'NSE:DRREDDY' },
    { label: 'IRCTC',      value: 'NSE:IRCTC' },
    { label: 'HAL',        value: 'NSE:HAL' },
  ],
  'Crypto': [
    { label: 'Bitcoin',    value: 'BINANCE:BTCUSDT' },
    { label: 'Ethereum',   value: 'BINANCE:ETHUSDT' },
    { label: 'BNB',        value: 'BINANCE:BNBUSDT' },
    { label: 'Solana',     value: 'BINANCE:SOLUSDT' },
    { label: 'XRP',        value: 'BINANCE:XRPUSDT' },
    { label: 'DOGE',       value: 'BINAGE:DOGEUSDT' },
    { label: 'ADA',        value: 'BINANCE:ADAUSDT' },
    { label: 'AVAX',       value: 'BINANCE:AVAXUSDT' },
    { label: 'MATIC',      value: 'BINANCE:MATICUSDT' },
    { label: 'LINK',       value: 'BINANCE:LINKUSDT' },
  ],
  'Forex': [
    { label: 'USD/INR',  value: 'FX_IDC:USDINR' },
    { label: 'EUR/INR',  value: 'FX_IDC:EURINR' },
    { label: 'GBP/INR',  value: 'FX_IDC:GBPINR' },
    { label: 'EUR/USD',  value: 'FX:EURUSD' },
    { label: 'GBP/USD',  value: 'FX:GBPUSD' },
    { label: 'USD/JPY',  value: 'FX:USDJPY' },
    { label: 'AUD/USD',  value: 'FX:AUDUSD' },
  ],
  'US Stocks': [
    { label: 'Apple',      value: 'NASDAQ:AAPL' },
    { label: 'Microsoft',  value: 'NASDAQ:MSFT' },
    { label: 'Tesla',      value: 'NASDAQ:TSLA' },
    { label: 'NVIDIA',     value: 'NASDAQ:NVDA' },
    { label: 'Google',     value: 'NASDAQ:GOOGL' },
    { label: 'Amazon',     value: 'NASDAQ:AMZN' },
    { label: 'Meta',       value: 'NASDAQ:META' },
    { label: 'Netflix',    value: 'NASDAQ:NFLX' },
    { label: 'S&P 500',    value: 'SP:SPX' },
    { label: 'NASDAQ',     value: 'NASDAQ:NDX' },
  ],
  'Commodities': [
    { label: 'Gold',       value: 'TVC:GOLD' },
    { label: 'Silver',     value: 'TVC:SILVER' },
    { label: 'Crude Oil',  value: 'TVC:USOIL' },
    { label: 'Brent',      value: 'TVC:UKOIL' },
    { label: 'Natural Gas',value: 'TVC:NATURALGAS' },
    { label: 'Copper',     value: 'TVC:COPPER' },
  ],
};

const INTERVALS = [
  { label: '1m',  value: '1' },
  { label: '5m',  value: '5' },
  { label: '15m', value: '15' },
  { label: '1H',  value: '60' },
  { label: '4H',  value: '240' },
  { label: '1D',  value: 'D' },
  { label: '1W',  value: 'W' },
  { label: '1M',  value: 'M' },
];

const ALL_SYMBOLS = Object.values(SYMBOL_CATEGORIES).flat();

export default function Markets() {
  const [symbol, setSymbol] = useState('NSE:NIFTY');
  const [interval, setInterval] = useState('D');
  const [activeCategory, setActiveCategory] = useState('Indian Stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const searchRef = useRef();

  // Dual mode tab: 'pro' (Lightweight Charts + Yahoo) or 'tradingview' (Official Script Widget)
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('marketActiveTab') || 'tradingview');

  // Pro Chart history & UI states
  const [history, setHistory] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const tvContainerRef = useRef(null);

  const filteredSymbols = searchQuery.length > 0
    ? ALL_SYMBOLS.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SYMBOL_CATEGORIES[activeCategory] || [];

  const selectSymbol = useCallback((val) => {
    setSymbol(val);
    setChartKey(k => k + 1);
    setShowSearch(false);
    setSearchQuery('');
  }, []);

  const displayLabel = ALL_SYMBOLS.find(s => s.value === symbol)?.label || symbol;

  // Smart TV symbol resolver
  const resolveTVSymbol = (rawSymbol) => {
    const s = rawSymbol.toUpperCase();
    if (s.startsWith('NSE:') || s.startsWith('BSE:')) return s;
    if (s === 'BSE:SENSEX') return 'BSE:SENSEX';
    if (s === 'NSE:NIFTY') return 'NSE:NIFTY';
    const clean = s.replace('.NS', '').replace('.BO', '');
    if (s.includes(':')) return s;
    return `NSE:${clean}`;
  };

  // Smart Backend symbol resolver (extract prefix and clean details)
  const resolveBackendSymbol = (rawSymbol) => {
    let clean = rawSymbol.toUpperCase();
    if (clean.includes(':')) {
      clean = clean.split(':')[1];
    }
    if (clean.endsWith('USDT')) {
      clean = clean.replace('USDT', '');
    }
    return clean;
  };

  const getBackendInterval = (iv) => {
    if (iv === '1') return '1m';
    if (iv === '5') return '5m';
    if (iv === '15') return '15m';
    if (iv === '60') return '60m';
    if (iv === '240') return '60m';
    if (iv === 'D') return '1d';
    if (iv === 'W') return '1wk';
    if (iv === 'M') return '1mo';
    return '1d';
  };

  const getBackendRange = (iv) => {
    if (iv === '1') return '7d';
    if (iv === '5') return '1mo';
    if (iv === '15') return '1mo';
    if (iv === '60' || iv === '240') return '1y';
    if (iv === 'D') return '2y';
    if (iv === 'W') return '5y';
    if (iv === 'M') return '10y';
    return '2y';
  };

  // 2. Fetch history for the Pro Chart
  useEffect(() => {
    if (activeTab !== 'pro') return;

    let isMounted = true;
    const fetchHistory = async (isSilent = false) => {
      if (!isSilent) {
        setChartLoading(true);
        setChartError(null);
      }
      try {
        const backendSym = resolveBackendSymbol(symbol);
        const backendInterval = getBackendInterval(interval);
        const range = getBackendRange(interval);
        
        const res = await apiClient.get(`/market/stock-history/${backendSym}?interval=${backendInterval}&range=${range}`);
        
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setHistory(res.data);
          } else {
            setChartError('No historical data returned from server.');
          }
        }
      } catch (err) {
        console.error('Failed to load history for chart:', err);
        if (isMounted && !isSilent) {
          setChartError('Failed to fetch historical market data.');
        }
      } finally {
        if (isMounted) setChartLoading(false);
      }
    };

    fetchHistory();

    // Silent background poll for updates every 10 seconds
    const intervalId = setInterval(() => {
      fetchHistory(true);
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [symbol, interval, activeTab, chartKey]);

  // 3. Render Pro Chart using lightweight-charts
  useEffect(() => {
    if (activeTab !== 'pro' || history.length === 0 || !chartContainerRef.current) {
      return;
    }

    if (chartRef.current) {
      try { chartRef.current.remove(); } catch (e) {}
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0a0e27' },
        textColor: '#9b9eaf',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: interval !== 'D' && interval !== 'W' && interval !== 'M',
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      height: 540,
      width: chartContainerRef.current.clientWidth || 800,
    });
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff88',
      downColor: '#ff4444',
      borderVisible: false,
      wickUpColor: '#00ff88',
      wickDownColor: '#ff4444',
    });

    const sma20Series = chart.addSeries(LineSeries, {
      color: '#00bcd4',
      lineWidth: 1.5,
      priceLineVisible: false,
    });

    const sma50Series = chart.addSeries(LineSeries, {
      color: '#ffb300',
      lineWidth: 1.5,
      priceLineVisible: false,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Populate data
    const sma20Data = [];
    const sma50Data = [];
    const volData = [];
    const candleData = [];
    const seenTimes = new Set();

    for (let i = 0; i < history.length; i++) {
      const bar = history[i];
      const timeSec = Math.floor(bar.time / 1000);
      if (seenTimes.has(timeSec)) continue;
      seenTimes.add(timeSec);

      candleData.push({
        time: timeSec,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      });

      volData.push({
        time: timeSec,
        value: bar.volume,
        color: bar.close >= bar.open ? 'rgba(0, 255, 136, 0.25)' : 'rgba(255, 68, 68, 0.25)',
      });

      // SMA 20
      if (i >= 19) {
        let sum = 0;
        for (let j = 0; j < 20; j++) sum += history[i - j].close;
        sma20Data.push({ time: timeSec, value: parseFloat((sum / 20).toFixed(2)) });
      }

      // SMA 50
      if (i >= 49) {
        let sum = 0;
        for (let j = 0; j < 50; j++) sum += history[i - j].close;
        sma50Data.push({ time: timeSec, value: parseFloat((sum / 50).toFixed(2)) });
      }
    }

    candlestickSeries.setData(candleData);
    volumeSeries.setData(volData);
    sma20Series.setData(sma20Data);
    sma50Series.setData(sma50Data);

    chart.timeScale().fitContent();

    const legend = document.getElementById('pro-chart-legend');
    
    // Set default/latest text on initialization
    if (legend && history.length > 0) {
      const latestBar = history[history.length - 1];
      const dateStr = new Date(latestBar.time).toLocaleDateString('en-IN');
      legend.innerHTML = `<span style="color: #00ff88; font-weight: 700;">LATEST</span> | Date: ${dateStr} | O: <span style="color: #ffffff">${latestBar.open?.toFixed(2) || 'N/A'}</span> | H: <span style="color: #00ff88">${latestBar.high?.toFixed(2) || 'N/A'}</span> | L: <span style="color: #ff4444">${latestBar.low?.toFixed(2) || 'N/A'}</span> | C: <span style="color: #ffffff">${latestBar.close?.toFixed(2) || 'N/A'}</span> | V: <span style="color: #00bcd4">${latestBar.volume?.toLocaleString('en-IN') || 0}</span>`;
    }

    chart.subscribeCrosshairMove(param => {
      if (!legend) return;
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > (chartContainerRef.current?.clientWidth || 800) ||
        param.point.y < 0 ||
        param.point.y > 540
      ) {
        // Show latest data point when not hovering
        const latestBar = history[history.length - 1];
        if (latestBar) {
          const dateStr = new Date(latestBar.time).toLocaleDateString('en-IN');
          legend.innerHTML = `<span style="color: #00ff88; font-weight: 700;">LATEST</span> | Date: ${dateStr} | O: <span style="color: #ffffff">${latestBar.open?.toFixed(2) || 'N/A'}</span> | H: <span style="color: #00ff88">${latestBar.high?.toFixed(2) || 'N/A'}</span> | L: <span style="color: #ff4444">${latestBar.low?.toFixed(2) || 'N/A'}</span> | C: <span style="color: #ffffff">${latestBar.close?.toFixed(2) || 'N/A'}</span> | V: <span style="color: #00bcd4">${latestBar.volume?.toLocaleString('en-IN') || 0}</span>`;
        }
      } else {
        const candleData = param.seriesData.get(candlestickSeries);
        const volDataVal = param.seriesData.get(volumeSeries);
        if (candleData) {
          let timeVal = param.time;
          let dateStr = '';
          if (typeof timeVal === 'number') {
            const dateObj = new Date(timeVal * 1000);
            const isIntraday = interval !== 'D' && interval !== 'W' && interval !== 'M';
            dateStr = isIntraday 
              ? dateObj.toLocaleDateString('en-IN') + ' ' + dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              : dateObj.toLocaleDateString('en-IN');
          } else {
            dateStr = JSON.stringify(timeVal);
          }
          
          legend.innerHTML = `Date: ${dateStr} | O: <span style="color: #ffffff">${candleData.open?.toFixed(2) || 'N/A'}</span> | H: <span style="color: #00ff88">${candleData.high?.toFixed(2) || 'N/A'}</span> | L: <span style="color: #ff4444">${candleData.low?.toFixed(2) || 'N/A'}</span> | C: <span style="color: #ffffff">${candleData.close?.toFixed(2) || 'N/A'}</span> | V: <span style="color: #00bcd4">${volDataVal?.value?.toLocaleString('en-IN') || 0}</span>`;
        }
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try { chartRef.current.remove(); } catch (e) {}
        chartRef.current = null;
      }
    };
  }, [history, activeTab]);

  // 4. Render TradingView Widget (Official Script version)
  useEffect(() => {
    if (activeTab !== 'tradingview') return;

    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId);

    const initTVWidget = () => {
      if (tvContainerRef.current && window.TradingView) {
        const tvSymbol = resolveTVSymbol(symbol);
        tvContainerRef.current.innerHTML = '';
        new window.TradingView.widget({
          container_id: tvContainerRef.current.id,
          symbol: tvSymbol,
          interval: interval === 'D' ? 'D' : interval === 'W' ? 'W' : interval === 'M' ? 'M' : '240',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#101427',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          width: '100%',
          height: 540,
          studies: ['Volume@tv-basicstudies']
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initTVWidget;
      document.head.appendChild(script);
    } else {
      if (window.TradingView) {
        initTVWidget();
      } else {
        script.onload = initTVWidget;
      }
    }
  }, [symbol, interval, activeTab]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ paddingBottom: '32px', display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, backgroundImage: 'linear-gradient(135deg, #00ff88, #00bcd4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
            Live Market Charting
          </h1>
          <p style={{ color: '#9b9eac', margin: '4px 0 0 0', fontSize: '14px' }}>
            Advanced charting — Indian stocks, Crypto, Forex, US markets & more
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-badge">LIVE</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', padding: '5px 14px', borderRadius: '20px' }}>
            {displayLabel}
          </span>
        </div>
      </div>

      {/* Controls Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>

        {/* Symbol Search */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSearch(v => !v)}
            style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <Search size={16} /> Search Symbol
          </button>

          {showSearch && (
            <div style={{ position: 'absolute', top: '44px', left: 0, width: '340px', background: '#0d1128', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '10px' }}>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks, crypto, forex..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Category Tabs */}
              {!searchQuery && (
                <div style={{ display: 'flex', gap: '4px', padding: '0 10px 10px', flexWrap: 'wrap' }}>
                  {Object.keys(SYMBOL_CATEGORIES).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{ padding: '4px 10px', background: activeCategory === cat ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeCategory === cat ? '#00ff88' : 'rgba(255,255,255,0.08)'}`, color: activeCategory === cat ? '#00ff88' : '#9b9eac', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Symbol List */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredSymbols.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#9b9eac', fontSize: '13px' }}>No symbols found</div>
                ) : filteredSymbols.map(s => (
                  <div
                    key={s.value}
                    onClick={() => selectSymbol(s.value)}
                    style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(0,255,136,0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px' }}>{s.label}</span>
                    <span style={{ color: '#9b9eac', fontSize: '11px', fontFamily: 'monospace' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interval Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {INTERVALS.map(iv => (
            <button
              key={iv.value}
              onClick={() => { setInterval(iv.value); setChartKey(k => k + 1); }}
              style={{ padding: '7px 14px', background: interval === iv.value ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${interval === iv.value ? '#00ff88' : 'rgba(255,255,255,0.08)'}`, color: interval === iv.value ? '#00ff88' : '#e1e3e6', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {iv.label}
            </button>
          ))}
        </div>

        {/* Quick-jump category row */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {Object.entries(SYMBOL_CATEGORIES).map(([cat, syms]) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setShowSearch(true); }}
              style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#9b9eac', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.color = '#00bcd4'; e.currentTarget.style.borderColor = '#00bcd4'; }}
              onMouseOut={e => { e.currentTarget.style.color = '#9b9eac'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Chart Card */}
      <div style={{ flex: 1, background: '#0a0e27', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', overflow: 'hidden', minHeight: '620px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Workspace Tab Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#10142d', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px 20px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => { setActiveTab('pro'); localStorage.setItem('marketActiveTab', 'pro'); }}
              style={{
                padding: '8px 16px',
                background: activeTab === 'pro' ? 'rgba(0, 255, 136, 0.12)' : 'transparent',
                border: `1px solid ${activeTab === 'pro' ? '#00ff88' : 'transparent'}`,
                borderRadius: '6px',
                color: activeTab === 'pro' ? '#00ff88' : '#9b9eac',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Activity size={14} /> Pro Chart (Yahoo Live)
            </button>
            <button
              onClick={() => { setActiveTab('tradingview'); localStorage.setItem('marketActiveTab', 'tradingview'); }}
              style={{
                padding: '8px 16px',
                background: activeTab === 'tradingview' ? 'rgba(0, 188, 212, 0.12)' : 'transparent',
                border: `1px solid ${activeTab === 'tradingview' ? '#00bcd4' : 'transparent'}`,
                borderRadius: '6px',
                color: activeTab === 'tradingview' ? '#00bcd4' : '#9b9eac',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <BarChart2 size={14} /> TradingView (Advanced)
            </button>
          </div>
          
          {/* Overlay key showing indicators and dynamic HUD on the Pro chart */}
          {activeTab === 'pro' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div id="pro-chart-legend" style={{ fontSize: '12px', color: '#9b9eac', fontFamily: 'monospace', background: 'rgba(0, 0, 0, 0.2)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                Move mouse over chart to inspect points
              </div>
              <div style={{ display: 'flex', gap: '14px', fontSize: '11px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00bcd4' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00bcd4' }} /> SMA 20
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffb300' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffb300' }} /> SMA 50
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(38, 166, 154, 0.6)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#26a69a' }} /> Volume
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart Viewport */}
        <div style={{ flex: 1, position: 'relative', minHeight: '540px', background: '#0a0e27', display: 'flex', flexDirection: 'column' }}>
          
          {activeTab === 'pro' ? (
            <div style={{ position: 'relative', width: '100%', height: '540px' }}>
              {/* Loader */}
              {chartLoading && history.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0e27', zIndex: 10, color: '#00ff88', gap: '12px' }}>
                  <div style={{ border: '3px solid rgba(0, 255, 136, 0.1)', borderLeftColor: '#00ff88', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Loading Pro chart data...</div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              
              {/* Error */}
              {chartError && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0e27', zIndex: 10, color: '#ff4444', gap: '8px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>Chart Load Error</div>
                  <div style={{ fontSize: '12px', color: '#9b9eac' }}>{chartError}</div>
                  <button onClick={() => { setChartKey(k => k + 1); }} style={{ marginTop: '8px', padding: '6px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Retry Connection</button>
                </div>
              )}

              {/* Chart Target Div */}
              <div ref={chartContainerRef} style={{ width: '100%', height: '540px' }} />
            </div>
          ) : (
            <div id="tradingview_chart_container" ref={tvContainerRef} style={{ width: '100%', height: '540px' }} />
          )}

        </div>
      </div>

      <p style={{ color: '#9b9eac', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
        Charts powered by <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00bcd4', textDecoration: 'none' }}>TradingView</a> and Yahoo Finance. Data is for informational purposes only.
      </p>
    </div>
  );
}