import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Coins, ShieldCheck, AlertTriangle, CheckCircle2, Lock, ArrowRight, 
  Sparkles, RefreshCw, Zap, TrendingUp, HelpCircle, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Shop() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [virtualBalance, setVirtualBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  // Fetch current user virtual balance
  const fetchBalance = async () => {
    try {
      const res = await apiClient.get('/paper/portfolio');
      if (res.data) {
        setVirtualBalance(parseFloat(res.data.virtualBalance || 0));
      }
    } catch (err) {
      console.error('Failed to load portfolio balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Bankrupt condition: Balance <= 0 or depleted
  const isBankrupt = virtualBalance <= 0;

  // Capital Bailout Packages: Ratio starts at 1:3 and volume discounts scale up to 1:6 for $1M
  const packages = [
    {
      id: 'pkg_1k',
      virtualAmount: 1000,
      realCostUsd: 333.33,
      realCostInr: 28000,
      ratio: '1 : 3.00',
      badge: 'STARTER BAILOUT',
      discountLabel: 'Base Ratio 1:3',
      description: 'Quick margin injection to test single-lot equity setups after bankruptcy.',
      features: ['Immediate +$1,000 margin credit', 'Unlocks order execution', '1:3 capital ratio']
    },
    {
      id: 'pkg_5k',
      virtualAmount: 5000,
      realCostUsd: 1500.00,
      realCostInr: 125000,
      ratio: '1 : 3.33',
      badge: 'POPULAR RECOVERY',
      discountLabel: '10% Capital Bonus',
      popular: true,
      description: 'Solid capital recovery to rebuild trading momentum across equities.',
      features: ['Immediate +$5,000 margin credit', 'Multi-position headroom', '1:3.33 capital ratio']
    },
    {
      id: 'pkg_10k',
      virtualAmount: 10000,
      realCostUsd: 2800.00,
      realCostInr: 235000,
      ratio: '1 : 3.57',
      badge: 'PRO BOOSTER',
      discountLabel: '16% Capital Bonus',
      description: 'Ideal margin for multi-chart swing trading and derivative options.',
      features: ['Immediate +$10,000 margin credit', 'F&O position sizing', '1:3.57 capital ratio']
    },
    {
      id: 'pkg_50k',
      virtualAmount: 50000,
      realCostUsd: 12500.00,
      realCostInr: 1040000,
      ratio: '1 : 4.00',
      badge: 'SERIOUS MARGIN',
      discountLabel: '25% Volume Bonus',
      description: 'Full standard account restoration. Allows comfortable risk per trade.',
      features: ['Immediate +$50,000 margin credit', 'Equivalent to new standard account', '1:4.00 capital ratio']
    },
    {
      id: 'pkg_100k',
      virtualAmount: 10000,
      realCostUsd: 22000.00,
      realCostInr: 1840000,
      ratio: '1 : 4.55',
      badge: 'INSTITUTIONAL DESK',
      discountLabel: '34% Volume Bonus',
      description: 'Substantial liquidity to deploy quantitative setups and sector baskets.',
      features: ['Immediate +$100,000 margin credit', 'Institutional risk sizing', '1:4.55 capital ratio']
    },
    {
      id: 'pkg_500k',
      virtualAmount: 500000,
      realCostUsd: 95000.00,
      realCostInr: 7950000,
      ratio: '1 : 5.26',
      badge: 'HEDGE FUND VAULT',
      discountLabel: '43% Volume Bonus',
      description: 'Heavy institutional volume allocation for portfolio hedge strategies.',
      features: ['Immediate +$500,000 margin credit', 'Large-block simulated fills', '1:5.26 capital ratio']
    },
    {
      id: 'pkg_1m',
      virtualAmount: 1000000,
      realCostUsd: 165000.00,
      realCostInr: 13800000,
      ratio: '1 : 6.06',
      badge: 'WHALE ALLOCATION',
      discountLabel: '50% Maximum Bonus (1:6 Ratio)',
      whale: true,
      description: 'Maximum allowable simulation margin. Test institutional fund allocations.',
      features: ['Immediate +$1,000,000 margin credit', 'Pro whale level margin', '1:6.06 maximum ratio']
    }
  ];

  // Handle purchasing bailout capital
  const handlePurchase = async () => {
    if (!selectedPackage) return;
    setIsProcessing(true);
    const toastId = toast.loading(`Processing emergency bailout purchase...`);

    try {
      const res = await apiClient.post('/paper/shop-purchase', {
        virtualAmount: selectedPackage.virtualAmount,
        realCost: `$${selectedPackage.realCostUsd.toLocaleString()}`,
        packageName: selectedPackage.badge
      });

      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Bailout capital approved!', { id: toastId });
        setVirtualBalance(res.data.newBalance);
        setPurchaseSuccess({
          amount: selectedPackage.virtualAmount,
          newBalance: res.data.newBalance
        });
        setSelectedPackage(null);
      } else {
        toast.error(res.data.error || 'Failed to complete bailout purchase', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process purchase. Ensure account is bankrupt ($0.00).', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // Test Mode: Simulate Bankruptcy ($0.00)
  const handleSimulateBankruptcy = async () => {
    try {
      const res = await apiClient.post('/paper/simulate-bankruptcy');
      if (res.data && res.data.success) {
        setVirtualBalance(0);
        toast.success('Account simulated as bankrupt ($0.00)! Bailout Store is now unlocked.', { icon: '🚨' });
      }
    } catch (err) {
      toast.error('Failed to simulate bankruptcy: ' + err.message);
    }
  };

  return (
    <div className="shop-page-root">
      <div className="shop-container">
        {/* Header */}
        <div className="shop-header">
          <div className="shop-badge">
            <Coins size={16} className="text-green" />
            <span>NONSTOCK CAPITAL SHOP • EMERGENCY BAILOUT DESK</span>
          </div>
          <h1 className="shop-title">Paper Trading Capital Shop</h1>
          <p className="shop-subtitle">
            Ran out of virtual margin? When your account is completely bankrupted ($0.00), 
            use our emergency bailout desk to inject fresh trading capital with a 1:3 ratio and progressive volume discounts up to 1:6.
          </p>
        </div>

        {/* Account Status Card */}
        <div className={`status-banner ${isBankrupt ? 'bankrupt' : 'active'}`}>
          <div className="status-left">
            <div className="status-icon-wrap">
              {isBankrupt ? (
                <AlertTriangle size={24} className="icon-red" />
              ) : (
                <CheckCircle2 size={24} className="text-green" />
              )}
            </div>
            <div>
              <div className="status-label-row">
                <span className="status-tag">
                  {isBankrupt ? 'ACCOUNT BANKRUPT' : 'ACCOUNT ACTIVE'}
                </span>
                <span className="balance-indicator">
                  Current Virtual Balance: <strong>${virtualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
              <p className="status-text">
                {isBankrupt ? (
                  <span className="text-danger font-bold">
                    Your virtual capital is fully depleted. The Emergency Bailout Store is UNLOCKED. Choose a package below to reload.
                  </span>
                ) : (
                  <span>
                    Emergency Bailout Store is locked while your account has positive capital. 
                    Bailout packages can only be purchased once your virtual margin hits $0.00.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="status-actions">
            {!isBankrupt && (
              <button onClick={handleSimulateBankruptcy} className="btn-simulate-bankrupt">
                <AlertTriangle size={14} />
                <span>Simulate Bankruptcy ($0) For Testing</span>
              </button>
            )}
            <button onClick={() => navigate('/paper-trading')} className="btn-trade-desk">
              <span>Go to Trade Desk</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Ratio Explanation Card */}
        <div className="ratio-info-card">
          <div className="ratio-info-col">
            <div className="ratio-circle">1 : 3</div>
            <div>
              <h4>Base 1:3 Exchange Ratio</h4>
              <p>For every $1 of real value, receive 3 virtual dollars to practice on exchange-grade execution.</p>
            </div>
          </div>
          <div className="ratio-divider"></div>
          <div className="ratio-info-col">
            <div className="ratio-circle green">1 : 6</div>
            <div>
              <h4>Volume Scaling Up To 1:6</h4>
              <p>As package size increases toward $1 Million, the ratio scales generously giving you up to 50% more virtual capital.</p>
            </div>
          </div>
          <div className="ratio-divider"></div>
          <div className="ratio-info-col">
            <div className="ratio-circle">✓</div>
            <div>
              <h4>Strict Bankruptcy Protection</h4>
              <p>Only usable when completely bankrupted ($0.00). Prevents reckless margin bloat while learning.</p>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="packages-grid">
          {packages.map((pkg) => {
            const isWhale = pkg.whale;
            const isPopular = pkg.popular;

            return (
              <div 
                key={pkg.id} 
                className={`pkg-card ${isWhale ? 'whale-card' : ''} ${isPopular ? 'popular-card' : ''} ${!isBankrupt ? 'card-disabled' : ''}`}
              >
                {isWhale && <div className="pkg-top-ribbon">MAXIMUM 50% SAVINGS</div>}
                {isPopular && <div className="pkg-top-ribbon popular">MOST POPULAR</div>}

                <div className="pkg-header">
                  <span className="pkg-badge">{pkg.badge}</span>
                  <h3 className="pkg-virtual-amount">${pkg.virtualAmount.toLocaleString()}</h3>
                  <span className="pkg-virtual-label">VIRTUAL CAPITAL</span>
                </div>

                <div className="pkg-price-row">
                  <div className="price-main">
                    <span className="currency">$</span>
                    <span className="price-val">{pkg.realCostUsd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    <span className="real-label">Real Cost</span>
                  </div>
                  <div className="price-ratio-chip">
                    <span className="ratio-text">{pkg.ratio}</span>
                  </div>
                </div>

                <div className="pkg-bonus-pill">
                  <Sparkles size={13} className="text-green" />
                  <span>{pkg.discountLabel}</span>
                </div>

                <p className="pkg-description">{pkg.description}</p>

                <div className="pkg-features">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="feat-item">
                      <CheckCircle2 size={14} className="text-green flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (!isBankrupt) {
                      toast.error('Store is locked! You can only buy bailout capital when your account is bankrupt ($0.00).');
                      return;
                    }
                    setSelectedPackage(pkg);
                  }}
                  disabled={!isBankrupt}
                  className={`btn-buy-pkg ${!isBankrupt ? 'disabled' : ''}`}
                >
                  {!isBankrupt ? (
                    <>
                      <Lock size={15} />
                      <span>Locked (Must Be Bankrupt)</span>
                    </>
                  ) : (
                    <>
                      <Coins size={15} />
                      <span>Buy Bailout Capital</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Purchase Confirmation Modal */}
        {selectedPackage && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <div className="m-title-wrap">
                  <Coins size={22} className="text-green" />
                  <h3>Confirm Bailout Purchase</h3>
                </div>
                <button onClick={() => setSelectedPackage(null)} className="btn-close-modal">
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <p className="modal-summary">
                  You are purchasing emergency virtual capital to reload your bankrupted trading account.
                </p>

                <div className="modal-calc-box">
                  <div className="calc-row">
                    <span>Virtual Capital Credit:</span>
                    <strong className="text-green">+${selectedPackage.virtualAmount.toLocaleString()}</strong>
                  </div>
                  <div className="calc-row">
                    <span>Real Money Cost:</span>
                    <strong>${selectedPackage.realCostUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="calc-row">
                    <span>Effective Ratio:</span>
                    <span className="badge-ratio-calc">{selectedPackage.ratio}</span>
                  </div>
                  <div className="calc-row highlight">
                    <span>Package Tier:</span>
                    <span>{selectedPackage.badge} ({selectedPackage.discountLabel})</span>
                  </div>
                </div>

                <div className="modal-guarantee">
                  <ShieldCheck size={16} className="text-green flex-shrink-0" />
                  <span>
                    Simulated / Instant Secure Checkout: Margin will be credited immediately to your paper portfolio.
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => setSelectedPackage(null)} className="btn-modal-cancel">
                  Cancel
                </button>
                <button 
                  onClick={handlePurchase} 
                  disabled={isProcessing}
                  className="btn-modal-confirm"
                >
                  {isProcessing ? 'Processing...' : `Confirm & Inject +$${selectedPackage.virtualAmount.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Success Modal */}
        {purchaseSuccess && (
          <div className="modal-backdrop">
            <div className="modal-card success-modal">
              <div className="success-icon-wrap">
                <CheckCircle2 size={48} className="text-green" />
              </div>
              <h3 className="success-heading">Bailout Approved!</h3>
              <p className="success-sub">
                Successfully credited <strong>+${purchaseSuccess.amount.toLocaleString()}</strong> virtual capital to your trading account.
              </p>
              <div className="success-balance-box">
                <span>New Available Virtual Margin:</span>
                <strong className="text-green">${purchaseSuccess.newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="success-actions">
                <button 
                  onClick={() => {
                    setPurchaseSuccess(null);
                    navigate('/paper-trading');
                  }} 
                  className="btn-success-trade"
                >
                  <span>Resume Trading on Trade Desk</span>
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => setPurchaseSuccess(null)} className="btn-success-close">
                  Stay in Shop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Pure White Theme with Emerald Green Highlights and Dark Text */
        .shop-page-root {
          min-height: calc(100vh - 64px);
          background: #ffffff;
          color: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 40px 24px 80px;
        }
        .shop-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .text-green { color: #00a854 !important; }
        .text-danger { color: #dc2626 !important; }
        .font-bold { font-weight: 800; }
        .flex-shrink-0 { flex-shrink: 0; }

        /* Header */
        .shop-header {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 40px;
        }
        .shop-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 30px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          font-size: 11.5px;
          font-weight: 800;
          color: #166534;
          letter-spacing: 0.8px;
          margin-bottom: 16px;
        }
        .shop-title {
          font-size: 40px;
          font-weight: 900;
          color: #090e17;
          letter-spacing: -0.8px;
          margin-bottom: 14px;
        }
        .shop-subtitle {
          font-size: 16px;
          color: #475569;
          line-height: 1.6;
        }

        /* Status Banner */
        .status-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px 28px;
          margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          flex-wrap: wrap;
        }
        .status-banner.bankrupt {
          border-color: #fecaca;
          background: #fff5f5;
        }
        .status-banner.active {
          border-color: #bbf7d0;
          background: #f0fdf4;
        }
        .status-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .status-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .icon-red { color: #dc2626; }
        .status-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .status-tag {
          font-size: 11px;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 8px;
          background: #090e17;
          color: #ffffff;
        }
        .balance-indicator {
          font-size: 14px;
          color: #475569;
        }
        .balance-indicator strong {
          color: #090e17;
          font-weight: 800;
        }
        .status-text {
          font-size: 13.5px;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }
        .status-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-simulate-bankrupt {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 9px 16px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-simulate-bankrupt:hover {
          background: #fef2f2;
        }
        .btn-trade-desk {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #00a854;
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-trade-desk:hover {
          background: #009147;
        }

        /* Ratio Info Card */
        .ratio-info-card {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px 32px;
          margin-bottom: 40px;
        }
        .ratio-info-col {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .ratio-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #00a854;
          color: #00a854;
          font-weight: 900;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ratio-circle.green {
          background: #00a854;
          color: #ffffff;
        }
        .ratio-info-col h4 {
          font-size: 15px;
          font-weight: 800;
          color: #090e17;
          margin-bottom: 4px;
        }
        .ratio-info-col p {
          font-size: 13px;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }
        .ratio-divider {
          width: 1px;
          background: #e2e8f0;
        }

        /* Packages Grid */
        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
        }
        .pkg-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.25s ease;
        }
        .pkg-card:hover {
          border-color: #00a854;
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(0, 168, 84, 0.08);
        }
        .pkg-card.popular-card {
          border-color: #00a854;
          box-shadow: 0 6px 25px rgba(0, 168, 84, 0.1);
        }
        .pkg-card.whale-card {
          border-color: #86efac;
          background: radial-gradient(circle at 50% 0%, #f0fdf4 0%, #ffffff 70%);
        }
        .pkg-card.card-disabled {
          opacity: 0.85;
        }
        .pkg-top-ribbon {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #00a854;
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          padding: 4px 14px;
          border-radius: 12px;
          letter-spacing: 0.5px;
        }
        .pkg-top-ribbon.popular {
          background: #090e17;
        }
        .pkg-header {
          margin-bottom: 16px;
        }
        .pkg-badge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 900;
          color: #00a854;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 3px 10px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .pkg-virtual-amount {
          font-size: 34px;
          font-weight: 900;
          color: #090e17;
          line-height: 1.1;
          margin-bottom: 2px;
        }
        .pkg-virtual-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 1px;
        }
        .pkg-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 16px;
        }
        .price-main {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .currency {
          font-size: 18px;
          font-weight: 800;
          color: #090e17;
        }
        .price-val {
          font-size: 26px;
          font-weight: 900;
          color: #090e17;
        }
        .real-label {
          font-size: 12px;
          color: #64748b;
          margin-left: 4px;
        }
        .price-ratio-chip {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 3px 10px;
          border-radius: 12px;
        }
        .ratio-text {
          font-size: 12px;
          font-weight: 900;
          color: #00a854;
        }
        .pkg-bonus-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 800;
          color: #166534;
          background: #f0fdf4;
          padding: 4px 12px;
          border-radius: 10px;
          margin-bottom: 14px;
          align-self: flex-start;
        }
        .pkg-description {
          font-size: 13.5px;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 20px;
          min-height: 40px;
        }
        .pkg-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
          flex-grow: 1;
        }
        .feat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #334155;
        }
        .btn-buy-pkg {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #00a854;
          color: #ffffff;
          border: none;
          padding: 13px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-buy-pkg:hover:not(.disabled) {
          background: #009147;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 168, 84, 0.3);
        }
        .btn-buy-pkg.disabled {
          background: #f1f5f9;
          color: #94a3b8;
          border: 1px solid #e2e8f0;
          cursor: not-allowed;
        }

        /* Modal Backdrop */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .modal-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 24px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: popModal 0.2s ease-out;
        }
        @keyframes popModal {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .m-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .m-title-wrap h3 {
          font-size: 18px;
          font-weight: 800;
          color: #090e17;
        }
        .btn-close-modal {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .btn-close-modal:hover { color: #090e17; }
        .modal-body {
          padding: 24px;
        }
        .modal-summary {
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .modal-calc-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .calc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #334155;
        }
        .calc-row.highlight {
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          font-size: 13px;
          color: #64748b;
        }
        .badge-ratio-calc {
          font-size: 12px;
          font-weight: 900;
          color: #00a854;
          background: #f0fdf4;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .modal-guarantee {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #166534;
          background: #f0fdf4;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }
        .modal-actions {
          padding: 16px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .btn-modal-cancel {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
        }
        .btn-modal-confirm {
          background: #00a854;
          color: #ffffff;
          border: none;
          padding: 10px 22px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-modal-confirm:hover { background: #009147; }

        /* Success Modal */
        .success-modal {
          text-align: center;
          padding: 40px 32px;
        }
        .success-icon-wrap {
          margin-bottom: 16px;
        }
        .success-heading {
          font-size: 26px;
          font-weight: 900;
          color: #090e17;
          margin-bottom: 10px;
        }
        .success-sub {
          font-size: 15px;
          color: #475569;
          margin-bottom: 24px;
        }
        .success-balance-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 28px;
        }
        .success-balance-box span { font-size: 12px; color: #166534; font-weight: 700; }
        .success-balance-box strong { font-size: 28px; font-weight: 900; }
        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .btn-success-trade {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #00a854;
          color: #ffffff;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
        }
        .btn-success-close {
          background: none;
          border: none;
          color: #64748b;
          font-size: 13px;
          cursor: pointer;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .ratio-info-card { grid-template-columns: 1fr; gap: 18px; }
          .ratio-divider { display: none; }
          .status-banner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
