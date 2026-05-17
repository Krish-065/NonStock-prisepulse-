import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import SearchWithSuggestions from '../components/SearchWithSuggestions';

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const fetchPortfolio = async () => {
    try {
      const res = await apiClient.get('/portfolio');
      const items = res.data.portfolio || [];
      const enriched = [];
      let value = 0, profit = 0;
      for (const item of items) {
        try {
          const quote = await apiClient.get(`/market/stock/${item.symbol}`);
          const currentPrice = parseFloat(quote.data.price);
          const invested = item.quantity * item.buy_price;
          const currentValue = item.quantity * currentPrice;
          const pnl = currentValue - invested;
          enriched.push({
            symbol: item.symbol,
            quantity: item.quantity,
            buyPrice: item.buy_price,
            currentPrice,
            invested,
            currentValue,
            pnl,
            pnlPercent: (pnl / invested) * 100,
          });
          value += currentValue;
          profit += pnl;
        } catch {
          enriched.push({
            symbol: item.symbol,
            quantity: item.quantity,
            buyPrice: item.buy_price,
            currentPrice: '--',
            invested: item.quantity * item.buy_price,
            currentValue: '--',
            pnl: '--',
          });
        }
      }
      setHoldings(enriched);
      setTotalValue(value);
      setTotalProfit(profit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addHolding = async (symbol, quantity, buyPrice) => {
    try {
      await apiClient.post('/portfolio', { symbol, quantity, buyPrice });
      fetchPortfolio();
    } catch (err) {
      alert('Failed to add holding');
    }
  };

  const removeHolding = async (symbol) => {
    try {
      await apiClient.delete(`/portfolio/${symbol}`);
      fetchPortfolio();
    } catch (err) {
      alert('Failed to remove');
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <div>
      <h1>Portfolio</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="index-card"><div>Total Value</div><div className="index-value">₹{totalValue.toLocaleString()}</div></div>
        <div className="index-card"><div>Total P&L</div><div className={`index-value ${totalProfit >= 0 ? 'positive' : 'negative'}`}>₹{totalProfit.toLocaleString()}</div></div>
        <div className="index-card"><div>Holdings</div><div className="index-value">{holdings.length}</div></div>
      </div>
      <SearchWithSuggestions
        onSelect={async (stock) => {
          const qty = prompt('Enter quantity');
          const price = prompt('Enter buy price');
          if (qty && price) addHolding(stock.symbol, parseFloat(qty), parseFloat(price));
        }}
        placeholder="Add stock to portfolio..."
        className="global-search"
      />
      {loading ? (
        <div>Loading portfolio...</div>
      ) : holdings.length === 0 ? (
        <div className="empty-watchlist">No holdings yet. Add stocks above.</div>
      ) : (
        <div className="screener-table">
          <table>
            <thead>
              <tr><th>Symbol</th><th>Quantity</th><th>Buy Price</th><th>Current Price</th><th>Invested</th><th>Current Value</th><th>P&L</th><th>Action</th></tr>
            </thead>
            <tbody>
              {holdings.map((h, idx) => (
                <tr key={idx}>
                  <td>{h.symbol}</td>
                  <td>{h.quantity}</td>
                  <td>₹{h.buyPrice}</td>
                  <td>{h.currentPrice !== '--' ? `₹${h.currentPrice}` : '--'}</td>
                  <td>₹{h.invested?.toLocaleString()}</td>
                  <td>{h.currentValue !== '--' ? `₹${h.currentValue?.toLocaleString()}` : '--'}</td>
                  <td className={h.pnl >= 0 ? 'positive' : 'negative'}>{h.pnl !== '--' ? `₹${h.pnl.toFixed(2)} (${h.pnlPercent?.toFixed(2)}%)` : '--'}</td>
                  <td><button className="remove-btn" onClick={() => removeHolding(h.symbol)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}