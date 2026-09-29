import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { 
  TrendingUp, TrendingDown, Search, Activity, PieChart, 
  Calculator, ArrowUpRight, ArrowDownRight, RefreshCw, Landmark,
  Layers, Shield, Calendar, DollarSign, CheckCircle, Info, ExternalLink,
  Sparkles, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';
import MutualFunds from './MutualFunds';

const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE', sector: 'Energy & Retail' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE', sector: 'IT Services' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', exchange: 'NSE', sector: 'Auto' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecom' },
  { symbol: 'ITC.NS', name: 'ITC Limited', exchange: 'NSE', sector: 'FMCG' },
  { symbol: 'ZOMATO.NS', name: 'Zomato Limited', exchange: 'NSE', sector: 'Tech / Delivery' },
  { symbol: 'SUZLON.NS', name: 'Suzlon Energy Limited', exchange: 'NSE', sector: 'Clean Energy' },
  { symbol: 'JIOFIN.NS', name: 'Jio Financial Services', exchange: 'NSE', sector: 'FinTech' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Limited', exchange: 'NSE', sector: 'Metals' },
  { symbol: 'HAL.NS', name: 'Hindustan Aeronautics Limited', exchange: 'NSE', sector: 'Defence' },
  { symbol: 'IRCTC.NS', name: 'IRCTC Limited', exchange: 'NSE', sector: 'Railways' }
];

export default function IndianMarket() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks' or 'mutual-funds'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockQuote, setStockQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const searchContainerRef = useRef(null);

  const [indices, setIndices] = useState({
    nifty: { price: 24982.50, change: 142.30, changePercent: 0.57 },
    sensex: { price: 81845.20, change: 420.80, changePercent: 0.52 },
    banknifty: { price: 51240.10, change: -85.40, changePercent: -0.17 },
    vix: { price: 12.85, change: -0.45, changePercent: -3.38 }
  });

  const [movers, setMovers] = useState({
    gainers: [],
    losers: []
  });
  const [loadingMovers, setLoadingMovers] = useState(true);

  // Fetch initial indices & movers with ?market=indian
  const fetchMarketData = async () => {
    try {
      setLoadingMovers(true);
      const [indicesRes, moversRes] = await Promise.allSettled([
        apiClient.get('/market/indices'),
        apiClient.get('/market/movers?market=indian')
      ]);

      if (indicesRes.status === 'fulfilled' && indicesRes.value.data) {
        const d = indicesRes.value.data;
        setIndices({
          nifty: d['^NSEI'] || d.nifty || indices.nifty,
          sensex: d['^BSESN'] || d.sensex || indices.sensex,
          banknifty: d['^NSEBANK'] || d.banknifty || indices.banknifty,
          vix: d.vix || indices.vix
        });
      }

      if (moversRes.status === 'fulfilled' && moversRes.value.data) {
        setMovers({
          gainers: moversRes.value.data.gainers || [],
          losers: moversRes.value.data.losers || []
        });
      }
    } catch (err) {
      console.warn('Failed to load Indian market movers:', err);
    } finally {
      setLoadingMovers(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Search Indian stocks with instant local match + backend fallback
  useEffect(() => {
    const query = searchQuery.trim().toUpperCase();
    if (!query) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    // Immediate 0ms local match so suggestions appear instantly
    const localMatches = POPULAR_INDIAN_STOCKS.filter(item => 
      item.symbol.toUpperCase().includes(query) || 
      item.name.toUpperCase().includes(query)
    );
    setSearchResults(localMatches);

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient.get(`/market/search/indian/${encodeURIComponent(searchQuery)}`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const seen = new Set();
          const combined = [];
          for (const item of [...res.data, ...localMatches]) {
            const sym = item.symbol.toUpperCase();
            if (!seen.has(sym)) {
              seen.add(sym);
              combined.push(item);
            }
          }
          setSearchResults(combined);
        }
      } catch (err) {
        console.error('Indian stock search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch detailed quote when stock is selected
  const handleSelectStock = async (stock) => {
    setSelectedStock(stock);
    setSearchQuery(stock.symbol);
    setShowDropdown(false);
    setLoadingQuote(true);
    try {
      const cleanSym = stock.symbol.endsWith('.NS') || stock.symbol.endsWith('.BO') ? stock.symbol : `${stock.symbol}.NS`;
      const res = await apiClient.get(`/market/stock/${encodeURIComponent(cleanSym)}`);
      setStockQuote(res.data);
    } catch (err) {
      toast.error('Failed to fetch live quote for ' + stock.symbol);
    } finally {
      setLoadingQuote(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Header */}
      <div style={{
        background: isDark 
          ? 'linear-gradient(135deg, rgba(16, 24, 40, 0.9) 0%, rgba(11, 15, 25, 0.95) 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: 'rgba(255, 153, 51, 0.15)',
              border: '1px solid rgba(255, 153, 51, 0.4)',
              color: '#ff9933',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              🇮🇳 NSE & BSE Desk
            </span>
            <span style={{ fontSize: '12px', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
              Live Pricing Feed
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '8px 0 4px 0', color: 'var(--text-primary)' }}>
            Indian Market & Mutual Funds Hub
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Live real-time quotes for Indian stocks, Top Gainers/Losers, and official Mutual Fund SIP explorer.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('stocks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'stocks' ? '#00b060' : 'transparent',
              color: activeTab === 'stocks' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Activity size={16} />
            Indian Stocks & Movers
          </button>
          <button
            onClick={() => setActiveTab('mutual-funds')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'mutual-funds' ? '#00b060' : 'transparent',
              color: activeTab === 'mutual-funds' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <PieChart size={16} />
            Mutual Funds Desk
          </button>
        </div>
      </div>

      {activeTab === 'mutual-funds' ? (
        <MutualFunds />
      ) : (
        <>
          {/* Major Indian Indices Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {[
              { name: 'NIFTY 50', key: 'nifty', ticker: 'NSE:NIFTY' },
              { name: 'BSE SENSEX', key: 'sensex', ticker: 'BSE:SENSEX' },
              { name: 'BANK NIFTY', key: 'banknifty', ticker: 'NSE:BANKNIFTY' },
              { name: 'INDIA VIX', key: 'vix', ticker: 'NSE:INDIAVIX' }
            ].map(idx => {
              const item = indices[idx.key] || { price: 0, change: 0, changePercent: 0 };
              const isUp = item.change >= 0;
              return (
                <div key={idx.name} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {idx.name}
                    </span>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {idx.key === 'vix' ? item.price.toFixed(2) : `₹${item.price.toLocaleString('en-IN')}`}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: isUp ? 'rgba(0, 176, 96, 0.12)' : 'rgba(255, 68, 68, 0.12)',
                    color: isUp ? '#00b060' : '#ff4444',
                    fontWeight: 800,
                    fontSize: '13px'
                  }}>
                    {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {isUp ? '+' : ''}{item.changePercent?.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dedicated Indian Stock Live Search Bar */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} style={{ color: '#ff9933' }} />
              Live Indian Stock Search (NSE / BSE)
            </h3>
            <div ref={searchContainerRef} style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search any Indian stock e.g. RELIANCE, TCS, INFY, HDFCBANK, ZOMATO..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 44px',
                  borderRadius: '10px',
                  background: isDark ? 'rgba(0, 0, 0, 0.25)' : '#ffffff',
                  border: showDropdown ? '1px solid #ff9933' : '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#ff9933' }} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setShowDropdown(true); }}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '14px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '2px'
                  }}
                >
                  ✕
                </button>
              )}

              {/* Instant Recommendations Dropdown */}
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: isDark ? '#13192b' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 153, 51, 0.35)' : '1px solid #fed7aa',
                  borderRadius: '12px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  zIndex: 9999,
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35)',
                  backdropFilter: 'blur(12px)'
                }}>
                  {/* Header Label */}
                  <div style={{
                    padding: '10px 16px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#ff9933',
                    background: isDark ? 'rgba(255, 153, 51, 0.08)' : 'rgba(255, 153, 51, 0.08)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flame size={13} style={{ color: '#ff9933' }} />
                      {!searchQuery.trim() ? 'Popular Indian Equities (NSE/BSE)' : `Matches for "${searchQuery}"`}
                    </span>
                    {searching && (
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Updating...
                      </span>
                    )}
                  </div>

                  {/* List of items */}
                  {(!searchQuery.trim() ? POPULAR_INDIAN_STOCKS : searchResults).map((item) => (
                    <div
                      key={item.symbol}
                      onClick={() => handleSelectStock(item)}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(255, 153, 51, 0.12)' : 'rgba(255, 153, 51, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#ff9933', fontSize: '14px', fontWeight: 800 }}>
                            {item.symbol.replace('.NS', '').replace('.BO', '')}
                          </strong>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(0, 176, 96, 0.12)',
                            color: '#00b060'
                          }}>
                            {item.exchange || 'NSE'}
                          </span>
                          {item.sector && (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              • {item.sector}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {item.name}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff9933', fontSize: '12px', fontWeight: 700 }}>
                        Select <ArrowUpRight size={14} />
                      </div>
                    </div>
                  ))}

                  {searchQuery.trim() && searchResults.length === 0 && !searching && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      No Indian stocks found matching "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active Selected Stock Live Detail Card */}
            {selectedStock && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: '12px',
                background: isDark ? 'rgba(255, 153, 51, 0.04)' : '#fdf8f4',
                border: '1px solid rgba(255, 153, 51, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {selectedStock.symbol}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {selectedStock.name}
                    </span>
                  </div>
                  {loadingQuote ? (
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>Fetching live ticker price...</div>
                  ) : stockQuote ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '6px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
                        ₹{stockQuote.price?.toLocaleString('en-IN')}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: stockQuote.change >= 0 ? '#00b060' : '#ff4444'
                      }}>
                        {stockQuote.change >= 0 ? '+' : ''}{stockQuote.change?.toFixed(2)} ({stockQuote.changePercent?.toFixed(2)}%)
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Live quote unavailable</div>
                  )}
                </div>

                {stockQuote && (
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>Day High</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{stockQuote.dayHigh?.toLocaleString('en-IN') || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>Day Low</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{stockQuote.dayLow?.toLocaleString('en-IN') || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>Volume</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{stockQuote.volume ? (stockQuote.volume / 100000).toFixed(2) + ' Lakh' : '—'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top Gainers & Losers Tables */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '24px'
          }}>
            {/* Top Gainers */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0, color: '#00b060', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} />
                  Top Indian Gainers
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>NSE Equity</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {movers.gainers.slice(0, 8).map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(0, 176, 96, 0.08)' : 'rgba(0, 176, 96, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'}
                  >
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{stock.symbol}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{parseFloat(stock.price).toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#00b060' }}>+{stock.changePercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0, color: '#ff4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingDown size={20} />
                  Top Indian Losers
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>NSE Equity</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {movers.losers.slice(0, 8).map((stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 68, 68, 0.08)' : 'rgba(255, 68, 68, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'}
                  >
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{stock.symbol}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{parseFloat(stock.price).toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#ff4444' }}>{stock.changePercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
