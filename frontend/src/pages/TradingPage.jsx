import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTrading } from '../contexts/TradingContext';
import { 
  Search, RotateCcw, TrendingUp, TrendingDown, ArrowRight, Zap, 
  Shield, Sparkles, Activity, Check, X, SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import ExecutionTicket from '../components/ExecutionTicket';
import LiveMarketScreener from '../components/LiveMarketScreener';

// Full Master Tradable Assets Catalog
const ALL_ASSETS = [
  // Crypto
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Crypto', tvSymbol: 'BINANCE:BTCUSDT', defaultPrice: 86502.00 },
  { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Crypto', tvSymbol: 'BINANCE:ETHUSDT', defaultPrice: 2748.41 },
  { symbol: 'SOLUSDT', name: 'Solana', category: 'Crypto', tvSymbol: 'BINANCE:SOLUSDT', defaultPrice: 154.20 },
  { symbol: 'BNBUSDT', name: 'BNB', category: 'Crypto', tvSymbol: 'BINANCE:BNBUSDT', defaultPrice: 585.50 },
  { symbol: 'XRPUSDT', name: 'Ripple', category: 'Crypto', tvSymbol: 'BINANCE:XRPUSDT', defaultPrice: 0.585 },
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold Spot / USD', category: 'Commodities', tvSymbol: 'OANDA:XAUUSD', defaultPrice: 2518.40 },
  { symbol: 'WTIUSD', name: 'Crude Oil WTI', category: 'Commodities', tvSymbol: 'TVC:USOIL', defaultPrice: 71.85 },
  { symbol: 'XAGUSD', name: 'Silver Spot / USD', category: 'Commodities', tvSymbol: 'OANDA:XAGUSD', defaultPrice: 31.80 },
  // Forex
  { symbol: 'EURUSD', name: 'EUR / USD Forex Major', category: 'Forex', tvSymbol: 'FX:EURUSD', defaultPrice: 1.0848 },
  { symbol: 'GBPUSD', name: 'GBP / USD Forex Major', category: 'Forex', tvSymbol: 'FX:GBPUSD', defaultPrice: 1.3032 },
  { symbol: 'USDJPY', name: 'USD / JPY Forex Major', category: 'Forex', tvSymbol: 'FX:USDJPY', defaultPrice: 148.82 },
  { symbol: 'AUDUSD', name: 'AUD / USD Forex Major', category: 'Forex', tvSymbol: 'FX:AUDUSD', defaultPrice: 0.6724 },
  { symbol: 'USDCAD', name: 'USD / CAD Forex Cross', category: 'Forex', tvSymbol: 'FX:USDCAD', defaultPrice: 1.3540 },
  // Equities
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Equities', tvSymbol: 'NASDAQ:AAPL', defaultPrice: 228.50 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Equities', tvSymbol: 'NASDAQ:NVDA', defaultPrice: 124.60 },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Equities', tvSymbol: 'NASDAQ:TSLA', defaultPrice: 254.20 },
  { symbol: 'SPY', name: 'S&P 500 ETF Trust', category: 'Equities', tvSymbol: 'AMEX:SPY', defaultPrice: 574.80 }
];

export default function TradingPage() {
  const { balance, positions, placeOrder, closePosition, resetAccount } = useTrading();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Persistent Active Symbol Selection
  const [symbol, setSymbol] = useState(() => {
    const urlSym = searchParams.get('symbol');
    if (urlSym) return urlSym.toUpperCase();
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nonstock_active_symbol') || 'BTCUSDT';
    }
    return 'BTCUSDT';
  });

  const [currentPrice, setCurrentPrice] = useState(86502.00);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const [aiInsightText, setAiInsightText] = useState('Institutional order flow indicates key support consolidation. Maintain strict Stop Loss invalidation levels.');
  const [aiInsightLoading, setAiInsightLoading] = useState(false);

  // Active asset match
  const activeAsset = useMemo(() => {
    return ALL_ASSETS.find(a => a.symbol === symbol) || ALL_ASSETS[0];
  }, [symbol]);

  // Persist symbol selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nonstock_active_symbol', symbol);
    }
  }, [symbol]);

  // Handle URL param changes
  useEffect(() => {
    const urlSym = searchParams.get('symbol');
    if (urlSym && urlSym.toUpperCase() !== symbol) {
      setSymbol(urlSym.toUpperCase());
    }
  }, [searchParams]);

  // Filter assets for search dropdown
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return ALL_ASSETS;
    const q = searchQuery.toLowerCase().trim();
    return ALL_ASSETS.filter(a => 
      a.symbol.toLowerCase().includes(q) || 
      a.name.toLowerCase().includes(q) || 
      a.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Click outside search dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update default price & query AI insight when symbol changes
  useEffect(() => {
    if (activeAsset) {
      setCurrentPrice(activeAsset.defaultPrice);
    }

    const token = localStorage.getItem('token');
    if (token) {
      setAiInsightLoading(true);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `Provide a 2-sentence institutional trade insight for ${symbol} at current price $${currentPrice}. State key momentum, immediate risk invalidation, and trailing stop tip.`,
          marketData: {
            symbol,
            currentPrice: activeAsset?.defaultPrice || currentPrice,
            timeframe: '15m'
          }
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.response) {
            const cleanText = data.response.replace(/###/g, '').replace(/\*\*/g, '').replace(/Disclaimer:[\s\S]*/i, '').trim();
            setAiInsightText(cleanText.slice(0, 180));
          }
        })
        .catch(() => {
          setAiInsightText(`Institutional liquidity on ${symbol} shows high participation near $${currentPrice.toFixed(2)}. Invalidate setups beyond nearest support.`);
        })
        .finally(() => setAiInsightLoading(false));
    }
  }, [symbol, activeAsset]);

  // Official TradingView Widget Integration (Self-Fetching Live Feed & Saved Tools/Drawings)
  useEffect(() => {
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
          timezone: 'exchange',
          theme: 'light',
          style: '1',
          locale: 'en',
          toolbar_bg: '#ffffff',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: true,
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
  }, [symbol, activeAsset.tvSymbol]);

  // Select asset handler
  const handleSelectAsset = (asset) => {
    setSymbol(asset.symbol);
    setCurrentPrice(asset.defaultPrice);
    setIsSearchOpen(false);
    setSearchQuery('');
    toast.success(`Active Chart: ${asset.symbol} (${asset.name})`);
  };

  // Screener 1-click select
  const handleSelectScreenerAsset = (asset) => {
    let targetSym = 'BTCUSDT';
    if (asset.symbol === 'BTC-USD') targetSym = 'BTCUSDT';
    else if (asset.symbol === 'GC=F') targetSym = 'XAUUSD';
    else if (asset.symbol === 'EURUSD=X') targetSym = 'EURUSD';
    else if (asset.symbol === 'GBPUSD=X') targetSym = 'GBPUSD';
    else if (asset.symbol === 'USDJPY=X') targetSym = 'USDJPY';
    else if (asset.symbol === 'AUDUSD=X') targetSym = 'AUDUSD';
    else if (asset.symbol === 'USDCAD=X') targetSym = 'USDCAD';
    else targetSym = (asset.badge || asset.symbol).replace(/[\/\-=]/g, '');

    const found = ALL_ASSETS.find(a => a.symbol === targetSym) || {
      symbol: targetSym,
      name: asset.name,
      category: 'Market',
      tvSymbol: `BINANCE:${targetSym}`,
      defaultPrice: asset.price
    };

    handleSelectAsset(found);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              ${Number(balance || 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>MAX LEVERAGE</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#10B981' }}>50x Unlocked</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.8px' }}>FREE MARGIN</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
              ${Number(balance || 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              if (window.confirm('Reset virtual portfolio back to $1,000 proving baseline?')) resetAccount(false);
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
          
          {/* Chart Header Bar: Unified Instant Search */}
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
            
            {/* Single Unified Search Bar with Autocomplete Dropdown */}
            <div ref={searchContainerRef} style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
              <div 
                onClick={() => setIsSearchOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  border: isSearchOpen ? '2px solid #10B981' : '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.2s'
                }}
              >
                <Search size={16} color="#64748B" style={{ marginRight: '10px', flexShrink: 0 }} />
                
                {isSearchOpen ? (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search asset (e.g. BTC, ETH, Gold, EURUSD, AAPL)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0F172A',
                      background: 'transparent'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '11px',
                        padding: '2px 7px',
                        borderRadius: '4px'
                      }}>
                        {activeAsset.symbol}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {activeAsset.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      {activeAsset.category}
                    </span>
                  </div>
                )}

                {isSearchOpen && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#94A3B8' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Autocomplete Search Dropdown */}
              {isSearchOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  zIndex: 200,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {filteredAssets.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                      No matching tradable instruments found.
                    </div>
                  ) : (
                    filteredAssets.map(asset => (
                      <div
                        key={asset.symbol}
                        onClick={() => handleSelectAsset(asset)}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderBottom: '1px solid #F1F5F9',
                          background: asset.symbol === symbol ? '#F0FDF4' : '#FFFFFF',
                          transition: 'background 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseOut={(e) => e.currentTarget.style.background = asset.symbol === symbol ? '#F0FDF4' : '#FFFFFF'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            fontWeight: 900,
                            fontSize: '11px',
                            color: '#0F172A'
                          }}>
                            {asset.symbol}
                          </span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              {asset.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {asset.category}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981' }}>
                            View Chart
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* TradingView Verified Feed Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#F0FDF4',
              borderRadius: '8px',
              border: '1px solid #BBF7D0',
              fontSize: '12px',
              fontWeight: 800,
              color: '#15803D'
            }}>
              <Activity size={14} color="#15803D" />
              <span>Original TradingView Pro Feed</span>
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div style={{ position: 'relative', width: '100%', height: '580px', background: '#FFFFFF' }}>
            <div 
              id="tv_chart_container" 
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* AI Mentor Trade Insight Bar */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#10B981" />
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  AI MENTOR TRADING INSIGHT
                </span>
              </div>
              <span style={{ fontSize: '10px', background: '#ECFDF5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                GROQ LLaMA 3.3
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
              {aiInsightLoading ? (
                <span style={{ color: '#94A3B8' }}>Consulting Groq Quant Engine for {symbol}...</span>
              ) : (
                aiInsightText
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
                Risk Level: <span style={{ color: '#10B981', fontWeight: '800' }}>Low / Disciplined</span>
              </div>
              <button
                onClick={() => navigate(`/ai-mentor?symbol=${symbol}`)}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Full Chat</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Institutional Order Ticket */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <ExecutionTicket 
            symbol={symbol}
            currentPrice={currentPrice}
            balance={balance}
            onPlaceOrder={placeOrder}
            onReset={resetAccount}
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
