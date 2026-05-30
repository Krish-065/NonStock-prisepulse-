import { useState, useEffect } from 'react';
import styled from 'styled-components';

const PremiumTable = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  background: #0a0e27;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    white-space: nowrap;
  }

  th {
    background: rgba(255, 255, 255, 0.03);
    padding: 16px 14px;
    text-align: left;
    color: #9b9eac;
    font-weight: 600;
    border-bottom: 2px solid rgba(0, 255, 136, 0.2);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
  }

  td {
    padding: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    color: #e1e3e6;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .fund-name {
    font-weight: 700;
    font-size: 14px;
    color: #ffffff;
    display: block;
    margin-bottom: 4px;
  }

  .fund-category {
    font-size: 11px;
    color: #9b9eac;
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .risk-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .risk-high { background: rgba(255, 51, 102, 0.15); color: #ff3366; }
  .risk-moderate { background: rgba(255, 193, 7, 0.15); color: #ffc107; }
  .risk-low { background: rgba(0, 255, 136, 0.15); color: #00ff88; }

  .positive-return { color: #00ff88; font-weight: 600; }
  
  .btn-invest {
    background: transparent;
    border: 1px solid #00ff88;
    color: #00ff88;
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-invest:hover {
    background: #00ff88;
    color: #0a0e27;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
  }
`;

export default function MutualFunds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rich mock data for top mutual funds to demonstrate MNC-level capabilities
    const mockFunds = [
      {
        id: 1,
        name: 'Quant Small Cap Fund Direct-Growth',
        category: 'Equity: Small Cap',
        risk: 'high',
        nav: '264.45',
        aum: '15,600',
        ret1Y: '68.4%',
        ret3Y: '42.1%',
        ret5Y: '38.5%',
        rating: 5
      },
      {
        id: 2,
        name: 'Parag Parikh Flexi Cap Fund Direct-Growth',
        category: 'Equity: Flexi Cap',
        risk: 'high',
        nav: '78.20',
        aum: '58,400',
        ret1Y: '38.2%',
        ret3Y: '21.4%',
        ret5Y: '24.1%',
        rating: 5
      },
      {
        id: 3,
        name: 'Nippon India Small Cap Fund Direct-Growth',
        category: 'Equity: Small Cap',
        risk: 'high',
        nav: '172.90',
        aum: '46,200',
        ret1Y: '55.6%',
        ret3Y: '38.2%',
        ret5Y: '31.4%',
        rating: 4
      },
      {
        id: 4,
        name: 'SBI Equity Hybrid Fund Direct-Growth',
        category: 'Hybrid: Aggressive',
        risk: 'moderate',
        nav: '284.15',
        aum: '68,100',
        ret1Y: '24.5%',
        ret3Y: '14.8%',
        ret5Y: '15.2%',
        rating: 4
      },
      {
        id: 5,
        name: 'HDFC Liquid Direct Plan-Growth',
        category: 'Debt: Liquid',
        risk: 'low',
        nav: '4580.20',
        aum: '82,500',
        ret1Y: '7.2%',
        ret3Y: '5.8%',
        ret5Y: '5.5%',
        rating: 3
      }
    ];

    setTimeout(() => {
      setFunds(mockFunds);
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return <div className="loading" style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff88', fontSize: '20px' }}>Loading Premium MF Data...</div>;
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, backgroundImage: 'linear-gradient(135deg, #00ff88, #00bcd4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>Top Mutual Funds</h1>
          <p style={{ color: '#9b9eac', margin: '4px 0 0 0', fontSize: '14px' }}>Explore top-performing direct mutual funds based on historical returns</p>
        </div>
      </div>

      <PremiumTable>
        <table>
          <thead>
            <tr>
              <th>Fund Name</th>
              <th>Risk Profile</th>
              <th>Rating</th>
              <th>NAV (₹)</th>
              <th>AUM (Cr)</th>
              <th>1Y Return</th>
              <th>3Y Return</th>
              <th>5Y Return</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr key={fund.id}>
                <td>
                  <span className="fund-name">{fund.name}</span>
                  <span className="fund-category">{fund.category}</span>
                </td>
                <td>
                  <span className={`risk-badge risk-${fund.risk}`}>{fund.risk}</span>
                </td>
                <td style={{ color: '#ffc107', letterSpacing: '2px' }}>
                  {'★'.repeat(fund.rating)}{'☆'.repeat(5 - fund.rating)}
                </td>
                <td style={{ fontWeight: 600 }}>{fund.nav}</td>
                <td>₹{fund.aum}</td>
                <td className="positive-return">+{fund.ret1Y}</td>
                <td className="positive-return">+{fund.ret3Y}</td>
                <td className="positive-return">+{fund.ret5Y}</td>
                <td>
                  <button className="btn-invest">Invest SIP</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PremiumTable>
    </div>
  );
}