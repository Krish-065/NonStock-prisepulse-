import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  TrendingUp, TrendingDown, Search, RefreshCw, Star,
  Activity, Zap, Globe, Filter, ExternalLink, BarChart2
} from 'lucide-react';

const CATEGORIES = ['All', 'Layer 1', 'DeFi', 'Stablecoins', 'Meme', 'Exchange', 'Privacy'];

const COINGECKO_IDS = [
  'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'dogecoin',
  'cardano', 'avalanche-2', 'tron', 'shiba-inu', 'polkadot', 'chainlink',
  'uniswap', 'litecoin', 'stellar', 'cosmos', 'monero', 'algorand',
  'vechain', 'filecoin', 'the-graph', 'aave', 'maker', 'compound',
  'fantom', 'hedera-hashgraph', 'elrond-erd-2', 'theta-token', 'eos',
  'zcash', 'decentraland', 'sandbox', 'axie-infinity', 'render-token',
  'injective-protocol', 'sui', 'aptos', 'arbitrum', 'optimism', 'sei-network',
  'pepe', 'bonk', 'floki', 'worldcoin', 'blur-token', 'lido-dao', 'rocket-pool',
  'frax-share', 'curve-dao-token', 'pancakeswap-token'
];

const CATEGORY_MAP = {
  'bitcoin': 'Layer 1', 'ethereum': 'Layer 1', 'solana': 'Layer 1', 'cardano': 'Layer 1',
  'avalanche-2': 'Layer 1', 'polkadot': 'Layer 1', 'cosmos': 'Layer 1', 'algorand': 'Layer 1',
  'fantom': 'Layer 1', 'aptos': 'Layer 1', 'sui': 'Layer 1', 'sei-network': 'Layer 1',
  'uniswap': 'DeFi', 'aave': 'DeFi', 'maker': 'DeFi', 'compound': 'DeFi',
  'curve-dao-token': 'DeFi', 'pancakeswap-token': 'DeFi', 'lido-dao': 'DeFi',
  'rocket-pool': 'DeFi', 'frax-share': 'DeFi', 'the-graph': 'DeFi',
  'dogecoin': 'Meme', 'shiba-inu': 'Meme', 'pepe': 'Meme', 'bonk': 'Meme', 'floki': 'Meme',
  'binancecoin': 'Exchange', 'render-token': 'Exchange', 'blur-token': 'Exchange',
  'monero': 'Privacy', 'zcash': 'Privacy',
};

export default function Crypto() {
  const navigate = useNavigate();
  const [coins, setCoins]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [sortBy, setSortBy]       = useState('market_cap');
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crypto_watchlist') || '[]'); }
    catch { return []; }
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCoins = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);
    try {
      const ids = COINGECKO_IDS.slice(0, 50).join(',');
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
      const data = await res.json();
      setCoins(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Live data temporarily unavailable. CoinGecko may be rate-limiting. Try again in 60 seconds.');
      if (isManual) toast.error('Failed to refresh. Try again in a moment.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(() => fetchCoins(), 60000); // 60s refresh (respect free tier)
    return () => clearInterval(interval);
  }, [fetchCoins]);

  const toggleWatchlist = (coinId) => {
    setWatchlist(prev => {
      const next = prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId];
      localStorage.setItem('crypto_watchlist', JSON.stringify(next));
      toast.success(prev.includes(coinId) ? 'Removed from watchlist' : 'Added to watchlist');
      return next;
    });
  };

  const filtered = coins
    .filter(c => {
      const q = search.toLowerCase();
      return (
        (!search || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)) &&
        (category === 'All' || (CATEGORY_MAP[c.id] || 'Layer 1') === category)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price_change_24h') return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
      if (sortBy === 'volume') return (b.total_volume || 0) - (a.total_volume || 0);
      return (b.market_cap || 0) - (a.market_cap || 0);
    });

  const fmtPrice = (p) => {
    if (!p && p !== 0) return '—';
    if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (p >= 1) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    return `$${p.toFixed(6)}`;
  };
  const fmtBig = (n) => {
    if (!n) return '—';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };
  const fmtPct = (p) => {
    if (p === null || p === undefined) return '—';
    return `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-primary)' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{
              fontSize: '28px', fontWeight: '900', margin: 0,
              background: 'linear-gradient(135deg, #f7931a 0%, #00f2fe 60%, #7928ca 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              ₿ Crypto Markets
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
              Live prices for top 50 cryptocurrencies via CoinGecko · Refreshes every 60s
              {lastUpdated && <span style={{ marginLeft: '8px', opacity: 0.6 }}>
                · Last updated: {lastUpdated.toLocaleTimeString()}
              </span>}
            </p>
          </div>
          <button
            onClick={() => fetchCoins(true)}
            disabled={isRefreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(0, 242, 254, 0.25)',
              background: 'rgba(0, 242, 254, 0.08)', color: '#00f2fe',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats row */}
        {coins.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Market Cap', value: fmtBig(coins.reduce((s, c) => s + (c.market_cap || 0), 0)), icon: <Globe size={14} /> },
              { label: '24h Volume', value: fmtBig(coins.reduce((s, c) => s + (c.total_volume || 0), 0)), icon: <Activity size={14} /> },
              { label: 'Gainers 24h', value: coins.filter(c => (c.price_change_percentage_24h || 0) > 0).length, icon: <TrendingUp size={14} /> },
              { label: 'Losers 24h', value: coins.filter(c => (c.price_change_percentage_24h || 0) < 0).length, icon: <TrendingDown size={14} /> },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--bg-card-glass)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-color)', borderRadius: '12px',
                padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ color: '#00f2fe' }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{stat.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: '800' }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search Bitcoin, ETH, SOL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 34px', background: 'var(--bg-card-glass)',
              border: '1px solid var(--border-color)', borderRadius: '10px',
              color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                border: category === cat ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid var(--border-color)',
                background: category === cat ? 'rgba(0, 242, 254, 0.12)' : 'var(--bg-card-glass)',
                color: category === cat ? '#00f2fe' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={13} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '7px 12px', background: 'var(--bg-card-glass)',
              border: '1px solid var(--border-color)', borderRadius: '8px',
              color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer',
              outline: 'none', backdropFilter: 'blur(10px)'
            }}
          >
            <option value="market_cap">Market Cap</option>
            <option value="price_change_24h">24h Gainers</option>
            <option value="volume">Volume</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
          color: '#f59e0b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Zap size={14} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              height: '160px', background: 'var(--bg-card-glass)', borderRadius: '16px',
              border: '1px solid var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 0.6
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} } @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Coins Grid */}
      {!loading && (
        <>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {filtered.map((coin, idx) => {
              const change24h = coin.price_change_percentage_24h || 0;
              const change1h  = coin.price_change_percentage_1h_in_currency || 0;
              const isUp24 = change24h >= 0;
              const inWatchlist = watchlist.includes(coin.id);
              const cat = CATEGORY_MAP[coin.id] || 'Layer 1';

              return (
                <div
                  key={coin.id}
                  onClick={() => navigate(`/stock/${coin.symbol.toUpperCase()}-USD`)}
                  style={{
                    background: 'var(--bg-card-glass)', backdropFilter: 'blur(16px)',
                    border: `1px solid ${isUp24 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 0, 128, 0.15)'}`,
                    borderRadius: '18px', padding: '18px', cursor: 'pointer',
                    transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = isUp24 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 0, 128, 0.4)';
                    e.currentTarget.style.boxShadow = isUp24
                      ? '0 12px 32px rgba(16, 185, 129, 0.15)' : '0 12px 32px rgba(255, 0, 128, 0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = isUp24 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 0, 128, 0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Rank badge */}
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px', padding: '2px 7px', fontSize: '10px',
                    color: 'var(--text-secondary)', fontWeight: '700'
                  }}>
                    #{coin.market_cap_rank}
                  </div>

                  {/* Coin header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <img src={coin.image} alt={coin.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {coin.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                          {coin.symbol}
                        </span>
                        <span style={{
                          fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px',
                          background: 'rgba(121, 40, 202, 0.15)', color: '#9b72d4', border: '1px solid rgba(121,40,202,0.25)'
                        }}>
                          {cat}
                        </span>
                      </div>
                    </div>

                    {/* Watchlist star */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleWatchlist(coin.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                    >
                      <Star size={14} fill={inWatchlist ? '#f5d020' : 'none'} style={{ color: inWatchlist ? '#f5d020' : 'var(--text-secondary)' }} />
                    </button>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                      {fmtPrice(coin.current_price)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: '700',
                        color: isUp24 ? '#10b981' : '#ff0080',
                        display: 'flex', alignItems: 'center', gap: '3px'
                      }}>
                        {isUp24 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {fmtPct(change24h)} 24h
                      </span>
                      <span style={{ fontSize: '11px', color: change1h >= 0 ? '#10b981' : '#ff0080', fontWeight: '600' }}>
                        {fmtPct(change1h)} 1h
                      </span>
                    </div>
                  </div>

                  {/* Sparkline mini chart */}
                  {coin.sparkline_in_7d?.price?.length > 0 && (() => {
                    const prices = coin.sparkline_in_7d.price;
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const range = max - min || 1;
                    const w = 220, h = 40;
                    const pts = prices.map((p, i) => {
                      const x = (i / (prices.length - 1)) * w;
                      const y = h - ((p - min) / range) * h;
                      return `${x},${y}`;
                    }).join(' ');
                    const color = prices[prices.length - 1] >= prices[0] ? '#10b981' : '#ff0080';
                    return (
                      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ marginBottom: '10px', display: 'block' }}>
                        <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} opacity="0.85" />
                      </svg>
                    );
                  })()}

                  {/* Stats row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>Market Cap</div>
                      <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '12px' }}>{fmtBig(coin.market_cap)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600' }}>24h Volume</div>
                      <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '12px' }}>{fmtBig(coin.total_volume)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && !loading && (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: 'var(--text-secondary)', fontSize: '14px'
            }}>
              <BarChart2 size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontWeight: '700' }}>No coins match your filters</div>
              <div style={{ marginTop: '6px', opacity: 0.7 }}>Try clearing the search or changing category</div>
            </div>
          )}
        </>
      )}

      {/* CoinGecko attribution */}
      <div style={{
        marginTop: '32px', textAlign: 'center', fontSize: '11px',
        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
      }}>
        <Globe size={11} />
        Market data provided by CoinGecko API · Free public tier · Updates every 60 seconds
        <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '3px' }}>
          coingecko.com <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}