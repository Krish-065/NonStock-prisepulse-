import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export default function Crypto() {
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await apiClient.get('/market/crypto');
        setCrypto(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCrypto();
    const interval = setInterval(fetchCrypto, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading crypto...</div>;

  return (
    <div>
      <h1>Cryptocurrency</h1>
      <div className="crypto-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {crypto.map(coin => (
          <div key={coin.symbol} className="crypto-item">
            <div className="crypto-symbol">{coin.symbol}</div>
            <div className="crypto-name">{coin.name}</div>
            <div className="crypto-price">₹{coin.price}</div>
            <div className={`crypto-change ${coin.up ? 'positive' : 'negative'}`}>{coin.change}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}