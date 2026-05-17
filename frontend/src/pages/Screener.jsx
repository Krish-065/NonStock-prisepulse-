import { useState, useEffect } from 'react';
import SearchWithSuggestions from '../components/SearchWithSuggestions';

export default function Screener() {
  const [stocks, setStocks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS'); // dummy
        // For simplicity, we'll use a predefined list of NIFTY 50 stocks
        const symbols = ['RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','HINDUNILVR','ITC','SBIN','BHARTIARTL','KOTAKBANK','AXISBANK','LT','WIPRO','ASIANPAINT','HCLTECH','TITAN','SUNPHARMA','MARUTI','BAJFINANCE','NESTLEIND'];
        const results = [];
        for (const sym of symbols) {
          const quote = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}.NS`).then(r=>r.json());
          const meta = quote.chart.result[0]?.meta;
          if (meta) {
            const price = meta.regularMarketPrice;
            const prevClose = meta.previousClose;
            const change = price - prevClose;
            const changePercent = (change / prevClose) * 100;
            results.push({ symbol: sym, price: price.toFixed(2), change: change.toFixed(2), changePercent: changePercent.toFixed(2) });
          }
          await new Promise(r => setTimeout(r, 150));
        }
        setStocks(results);
        setFiltered(results);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    let filteredStocks = stocks;
    if (search) filteredStocks = filteredStocks.filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'gainers') filteredStocks = filteredStocks.filter(s => parseFloat(s.changePercent) > 1);
    if (filter === 'losers') filteredStocks = filteredStocks.filter(s => parseFloat(s.changePercent) < -1);
    setFiltered(filteredStocks);
  }, [search, filter, stocks]);

  if (loading) return <div>Loading screener...</div>;

  return (
    <div>
      <h1>Stock Screener</h1>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <SearchWithSuggestions onSelect={(stock) => setSearch(stock.symbol)} placeholder="Search symbol..." className="global-search" style={{ maxWidth: '300px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active-filter' : ''}>All</button>
          <button onClick={() => setFilter('gainers')} className={filter === 'gainers' ? 'active-filter' : ''}>Top Gainers</button>
          <button onClick={() => setFilter('losers')} className={filter === 'losers' ? 'active-filter' : ''}>Top Losers</button>
        </div>
      </div>
      <div className="screener-table">
        <table>
          <thead><tr><th>Symbol</th><th>Price (₹)</th><th>Change (₹)</th><th>Change %</th></tr></thead>
          <tbody>{filtered.map(s => <tr key={s.symbol}><td>{s.symbol}</td><td>₹{s.price}</td><td className={s.change>=0?'positive':'negative'}>{s.change}</td><td className={s.changePercent>=0?'positive':'negative'}>{s.changePercent}%</td></tr>)}</tbody>
        </table>
      </div>
      <style>{`.active-filter { background: #00ff88; color: #0a0e27; border-color: transparent; } button { background: #1e222d; border: 1px solid #2a2e39; padding: 6px 12px; border-radius: 8px; cursor: pointer; }`}</style>
    </div>
  );
}