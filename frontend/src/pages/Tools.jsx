import { useState } from 'react';

export default function Tools() {
  const [calc, setCalc] = useState('sip');
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  const calculators = {
    sip: {
      name: 'SIP Calculator',
      fields: ['monthly', 'years', 'rate'],
      labels: ['Monthly Investment (₹)', 'Time (Years)', 'Expected Return (%)'],
      compute: (v) => {
        const r = v.rate / 12 / 100;
        const n = v.years * 12;
        const future = v.monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        return { futureValue: future.toFixed(2), invested: (v.monthly * n).toFixed(2), returns: (future - v.monthly * n).toFixed(2) };
      },
    },
    lumpsum: {
      name: 'Lumpsum Calculator',
      fields: ['amount', 'years', 'rate'],
      labels: ['Amount (₹)', 'Years', 'Rate (%)'],
      compute: (v) => {
        const amount = v.amount * Math.pow(1 + v.rate / 100, v.years);
        return { amount: amount.toFixed(2), profit: (amount - v.amount).toFixed(2) };
      },
    },
    emi: {
      name: 'EMI Calculator',
      fields: ['loan', 'years', 'rate'],
      labels: ['Loan Amount (₹)', 'Tenure (Years)', 'Interest Rate (%)'],
      compute: (v) => {
        const r = v.rate / 12 / 100;
        const n = v.years * 12;
        const emi = v.loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const total = emi * n;
        return { emi: emi.toFixed(2), total: total.toFixed(2), interest: (total - v.loan).toFixed(2) };
      },
    },
    brokerage: {
      name: 'Brokerage Calculator',
      fields: ['buy', 'sell', 'qty'],
      labels: ['Buy Price (₹)', 'Sell Price (₹)', 'Quantity'],
      compute: (v) => {
        const turnover = (v.buy + v.sell) * v.qty;
        const brokerage = turnover * 0.0003;
        const stt = v.sell * v.qty * 0.001;
        const total = brokerage + stt + brokerage * 0.18;
        const net = (v.sell - v.buy) * v.qty - total;
        return { brokerage: brokerage.toFixed(2), stt: stt.toFixed(2), totalCharges: total.toFixed(2), netProfit: net.toFixed(2) };
      },
    },
  };

  const handleCalculate = () => {
    const fn = calculators[calc].compute;
    const values = {};
    calculators[calc].fields.forEach(f => { values[f] = parseFloat(inputs[f]) || 0; });
    setResult(fn(values));
  };

  const update = (field, val) => setInputs({ ...inputs, [field]: parseFloat(val) || 0 });

  return (
    <div>
      <h1>Financial Tools</h1>
      <div className="two-column" style={{ gap: '12px', marginBottom: '20px' }}>
        {Object.keys(calculators).map(key => (
          <button key={key} className={calc === key ? 'active-filter' : ''} onClick={() => { setCalc(key); setResult(null); }} style={{ padding: '8px' }}>
            {calculators[key].name}
          </button>
        ))}
      </div>
      <div className="section-card">
        <h2>{calculators[calc].name}</h2>
        <div className="two-column" style={{ gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
          {calculators[calc].fields.map((f, i) => (
            <div key={f}><label>{calculators[calc].labels[i]}</label><input type="number" className="global-search" onChange={(e) => update(f, e.target.value)} /></div>
          ))}
        </div>
        <button onClick={handleCalculate} className="btn-premium" style={{ marginTop: '20px' }}>Calculate</button>
        {result && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #2a2e39', paddingTop: '16px' }}>
            {Object.entries(result).map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{k.toUpperCase()}:</span><strong>₹{v}</strong></div>)}
          </div>
        )}
      </div>
    </div>
  );
}