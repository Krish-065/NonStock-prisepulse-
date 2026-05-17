import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import SearchWithSuggestions from '../components/SearchWithSuggestions';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const res = await apiClient.get('/watchlist');
      const items = res.data.watchlist || [];
      if (items.length === 0) {
        setWatchlist([]);
        setLoading(false);
        return;
      }
      // Enrich with live prices
      const enriched = [];
      for (const item of items) {
        try {
          const quote = await apiClient.get(`/market/stock/${item.symbol}`);
          enriched.push({
            symbol: item.symbol,
            price: quote.data.price,
            change: quote.data.change,
            changePercent: quote.data.changePercent,
            up: parseFloat(quote.data.change) >= 0,
          });
        } catch {
          enriched.push({ symbol: item.symbol, price: '--', change: '0', changePercent: '0', up: true });
        }
      }
      setWatchlist(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol) => {
    try {
      await apiClient.post('/watchlist', { symbol });
      fetchWatchlist();
    } catch (err) {
      alert('Failed to add');
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      await apiClient.delete(`/watchlist/${symbol}`);
      fetchWatchlist();
    } catch (err) {
      alert('Failed to remove');
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  return (
    <div>
      <h1>Your Watchlist</h1>
      <SearchWithSuggestions
        onSelect={(stock) => addToWatchlist(stock.symbol)}
        placeholder="Search stocks to add..."
        className="global-search"
      />
      {loading ? (
        <div>Loading...</div>
      ) : watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <div className="empty-icon">📋</div>
          <h3>Your watchlist is empty</h3>
          <p>Search and add stocks to track them here</p>
        </div>
      ) : (
        <div className="watchlist-table">
          <table>
            <thead>
              <tr><th>Symbol</th><th>LTP (₹)</th><th>Change (₹)</th><th>Change %</th><th>Action</th></tr>
            </thead>
            <tbody>
              {watchlist.map((stock, idx) => (
                <tr key={idx}>
                  <td>{stock.symbol}</td>
                  <td>₹{stock.price}</td>
                  <td className={stock.up ? 'positive' : 'negative'}>{stock.change >= 0 ? '+' : ''}{stock.change}</td>
                  <td className={stock.up ? 'positive' : 'negative'}>{stock.changePercent}%</td>
                  <td><button className="remove-btn" onClick={() => removeFromWatchlist(stock.symbol)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}