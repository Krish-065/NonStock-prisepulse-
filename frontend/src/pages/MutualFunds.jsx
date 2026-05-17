import { useState, useEffect } from 'react';

export default function MutualFunds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using free AMFI API (mfapi.in)
    const fetchFunds = async () => {
      try {
        const res = await fetch('https://api.mfapi.in/mf');
        const data = await res.json();
        if (data && data.length) {
          setFunds(data.slice(0, 20).map(f => ({ name: f.schemeName, nav: f.nav })));
        } else {
          // fallback
          setFunds([
            { name: 'SBI Bluechip Fund', nav: '85.23' },
            { name: 'HDFC Balanced Fund', nav: '62.10' },
            { name: 'ICICI Prudential Value Discovery', nav: '124.56' },
          ]);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchFunds();
  }, []);

  if (loading) return <div>Loading mutual funds...</div>;

  return (
    <div>
      <h1>Mutual Funds</h1>
      <div className="screener-table">
        <table>
          <thead><tr><th>Scheme Name</th><th>NAV (₹)</th></tr></thead>
          <tbody>{funds.map((f, i) => <tr key={i}><td>{f.name}</td><td>₹{f.nav}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}