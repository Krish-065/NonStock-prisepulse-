import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/api';
import { Search } from 'lucide-react';

export default function SearchWithSuggestions({ 
  onSelect, 
  placeholder, 
  className, 
  style, 
  inputStyle, 
  showSearchIcon = false,
  rightElement = null 
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShow(false);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/market/search/${encodeURIComponent(query)}`);
        setSuggestions(res.data || []);
        setShow(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock) => {
    setQuery(stock.symbol);
    setShow(false);
    if (onSelect) onSelect(stock);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', ...style }}>
      {showSearchIcon && (
        <span style={{ 
          position: 'absolute', 
          left: '18px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: '#10b981', 
          display: 'flex', 
          alignItems: 'center', 
          pointerEvents: 'none', 
          zIndex: 2 
        }}>
          <Search size={18} />
        </span>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={className}
        style={inputStyle}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {rightElement && (
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          {rightElement}
        </div>
      )}

      {show && (suggestions.length > 0 || loading) && (
        <div className="search-dropdown">
          {loading && <div className="search-loading">Searching global universe...</div>}
          {!loading && suggestions.length === 0 && <div className="search-no-results">No global assets match "{query}"</div>}
          {!loading && suggestions.map((item) => (
            <div key={item.symbol} className="search-suggestion" onClick={() => handleSelect(item)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: '#10b981', fontWeight: 800 }}>{item.symbol}</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.name}</span>
              </div>
              <small style={{ 
                color: 'var(--text-secondary)', 
                background: 'var(--bg-glass-light, rgba(255,255,255,0.06))', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700 
              }}>
                {item.exchange || 'GLOBAL'}
              </small>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: var(--bg-card, #1e222d);
          border: 1px solid var(--border-color, #2a2e39);
          border-radius: 14px;
          max-height: 320px;
          overflow-y: auto;
          z-index: 9999;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(16px);
        }
        .search-suggestion {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color, #2a2e39);
          display: flex;
          justifyContent: space-between;
          align-items: center;
          transition: background 0.15s ease;
        }
        .search-suggestion:last-child {
          border-bottom: none;
        }
        .search-suggestion:hover { 
          background: rgba(16, 185, 129, 0.1); 
        }
        .search-loading, .search-no-results { 
          padding: 16px; 
          text-align: center; 
          color: var(--text-secondary, #787b86); 
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}