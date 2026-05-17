import { useState, useEffect } from 'react';
import axios from 'axios';

export default function IPOs() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIPOs = async () => {
      try {
        // Upcoming IPOs from Chittorgarh API (public, free)
        const res = await axios.get('https://api.chittorgarh.com/api/v1/ipos/upcoming');
        if (res.data && Array.isArray(res.data)) {
          setUpcoming(res.data.slice(0, 12).map(ipo => ({
            name: ipo.company_name,
            openDate: ipo.open_date,
            closeDate: ipo.close_date,
            priceBand: `₹${ipo.price_band_lower} - ₹${ipo.price_band_upper}`,
            lotSize: ipo.lot_size,
            gmp: ipo.gmp ? `+${ipo.gmp}%` : 'N/A',
            subscription: ipo.subscription || '0x',
          })));
        } else {
          // fallback data
          setUpcoming([
            { name: 'Tata Technologies', openDate: 'Nov 22, 2024', closeDate: 'Nov 24, 2024', priceBand: '₹475-500', lotSize: '30', gmp: '+65%', subscription: '45.2x' },
            { name: 'IREDA', openDate: 'Nov 21, 2024', closeDate: 'Nov 23, 2024', priceBand: '₹30-32', lotSize: '400', gmp: '+45%', subscription: '38.5x' },
          ]);
        }

        // Past IPOs (mock data – you can replace with real API if available)
        setPast([
          { name: 'Tata Technologies', listingDate: 'Nov 28, 2024', issuePrice: '500', listingPrice: '825', gain: '+65%' },
          { name: 'IREDA', listingDate: 'Nov 25, 2024', issuePrice: '32', listingPrice: '46', gain: '+43.75%' },
          { name: 'Gandhar Oil', listingDate: 'Nov 24, 2024', issuePrice: '169', listingPrice: '215', gain: '+27.2%' },
          { name: 'Fedbank Financial', listingDate: 'Nov 22, 2024', issuePrice: '140', listingPrice: '168', gain: '+20%' },
        ]);
      } catch (error) {
        console.error('IPO fetch error:', error);
        // fallback on error
        setUpcoming([
          { name: 'Sample IPO', openDate: 'TBD', closeDate: 'TBD', priceBand: '₹100-120', lotSize: '100', gmp: 'N/A', subscription: '0x' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchIPOs();
  }, []);

  if (loading) {
    return <div className="loading">Loading IPO data...</div>;
  }

  return (
    <div>
      <h1>IPO Tracker</h1>
      <div className="section-card">
        <h2>📈 Upcoming IPOs</h2>
        <div className="screener-table">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Open Date</th>
                <th>Close Date</th>
                <th>Price Band</th>
                <th>Lot Size</th>
                <th>GMP</th>
                <th>Subscription</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((ipo, idx) => (
                <tr key={idx}>
                  <td><strong>{ipo.name}</strong></td>
                  <td>{ipo.openDate}</td>
                  <td>{ipo.closeDate}</td>
                  <td>{ipo.priceBand}</td>
                  <td>{ipo.lotSize}</td>
                  <td className="positive">{ipo.gmp}</td>
                  <td className="positive">{ipo.subscription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card">
        <h2>✅ Recently Listed IPOs (Listing Gains)</h2>
        <div className="screener-table">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Listing Date</th>
                <th>Issue Price</th>
                <th>Listing Price</th>
                <th>Gain %</th>
              </tr>
            </thead>
            <tbody>
              {past.map((ipo, idx) => (
                <tr key={idx}>
                  <td><strong>{ipo.name}</strong></td>
                  <td>{ipo.listingDate}</td>
                  <td>₹{ipo.issuePrice}</td>
                  <td>₹{ipo.listingPrice}</td>
                  <td className="positive">{ipo.gain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}