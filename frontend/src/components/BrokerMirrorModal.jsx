import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, ArrowRight, CheckCircle2, AlertCircle, X, 
  ExternalLink, Globe, Layers, RefreshCw, Cpu, Server, Key
} from 'lucide-react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';

const SUPPORTED_BROKERS = [
  {
    id: 'Interactive Brokers',
    name: 'Interactive Brokers',
    category: 'Institutional Equities & Futures',
    authType: 'API Key / OAuth 2.0',
    minBalance: '$1,000+',
    badge: 'INSTITUTIONAL PRIME'
  },
  {
    id: 'Binance',
    name: 'Binance Global',
    category: 'Crypto Derivatives & Spot',
    authType: 'Read-Only API Key + Secret',
    minBalance: '$500+',
    badge: 'TIER-1 CRYPTO'
  },
  {
    id: 'Bybit',
    name: 'Bybit Derivatives',
    category: 'Futures & Perpetual Swaps',
    authType: 'Read-Only API v5',
    minBalance: '$500+',
    badge: 'DERIVATIVES DESK'
  },
  {
    id: 'MetaTrader 5',
    name: 'MetaTrader 5 / 4',
    category: 'Forex, Indices & CFDs',
    authType: 'Investor Read-Only Password',
    minBalance: '$1,000+',
    badge: 'GLOBAL FX'
  },
  {
    id: 'Exness',
    name: 'Exness Prime',
    category: 'Raw Spread Multi-Asset',
    authType: 'Read-Only Server Token',
    minBalance: '$1,000+',
    badge: 'RAW SPREAD'
  }
];

export default function BrokerMirrorModal({ isOpen, onClose, onSyncSuccess, currentBroker, isActive }) {
  const [selectedBroker, setSelectedBroker] = useState(currentBroker || 'Interactive Brokers');
  const [realBalance, setRealBalance] = useState('12480.00');
  const [riskPct, setRiskPct] = useState('2.0');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const realBalanceNum = parseFloat(realBalance) || 1000;
  const riskPctNum = parseFloat(riskPct) || 2;
  const realRiskAmount = (realBalanceNum * (riskPctNum / 100)).toFixed(2);
  const stocksoperatorRiskAmount = (1000 * (riskPctNum / 100)).toFixed(2);
  const ratio = (realBalanceNum / 1000).toFixed(2);

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/broker-mirror/connect', {
        broker: selectedBroker,
        realBalance: realBalanceNum,
        riskPct: riskPctNum,
        apiKey: apiKey || 'READ_ONLY_SIMULATED_KEY'
      });

      if (res.data?.success) {
        toast.success(`Connected to ${selectedBroker}! Live Equity Mirror active.`);
        if (onSyncSuccess) onSyncSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to connect broker mirror');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '20px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.15)',
        position: 'relative'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FAFBFC'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Server size={16} color="#059669" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                Broker Mirror • Real Account Equity Sync
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 36px', fontSize: '12px', color: '#64748B' }}>
              Prove real market edge by linking live trades directly to the verified $1,000 baseline ledger.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Security Audit Badge */}
        <div style={{
          margin: '20px 28px 0 28px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: '#F0FDF4',
          border: '1px solid #A7F3D0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', color: '#065F46', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 800 }}>Non-Custodial Architecture:</span> We only read execution and fill data. 
            Withdrawals and deposit controls are mathematically impossible. 
            All API communications are encrypted via TLS 1.3 with AES-256 field encryption.
          </div>
        </div>

        <form onSubmit={handleConnect} style={{ padding: '24px 28px' }}>
          {/* Step 1: Select Broker */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
              1. Select Supported Institutional Broker
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {SUPPORTED_BROKERS.map(b => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBroker(b.id)}
                  style={{
                    background: selectedBroker === b.id ? '#F0FDF4' : '#FFFFFF',
                    border: selectedBroker === b.id ? '2px solid #059669' : '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{b.name}</span>
                    {selectedBroker === b.id && <CheckCircle2 size={14} color="#059669" />}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{b.category}</div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '9px',
                    fontWeight: 800,
                    color: '#059669',
                    background: '#ECFDF5',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {b.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Proportional Equity Risk Model */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                2. Equity Scaling & Mathematical Mirroring
              </span>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                Scale Factor: {ratio}x
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Real Account Equity ($ USD)
                </label>
                <input
                  type="number"
                  step="100"
                  value={realBalance}
                  onChange={(e) => setRealBalance(e.target.value)}
                  placeholder="12480.00"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    outline: 'none',
                    background: '#FFFFFF'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Standard Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="10.0"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                  placeholder="2.0"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    outline: 'none',
                    background: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            {/* Visual 1:1 Mapping Comparison Card */}
            <div style={{
              background: '#FFFFFF',
              border: '1.5px dashed #A7F3D0',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Real Broker Account</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
                  ${Number(realBalanceNum).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>
                  {riskPctNum}% Risk = ${realRiskAmount}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  border: '1px solid #10B981',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontWeight: 900,
                  fontSize: '12px'
                }}>
                  =
                </div>
                <span style={{ fontSize: '10px', color: '#059669', fontWeight: 800 }}>PROPORTIONAL</span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Stocks Operator Proving Baseline</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#059669' }}>
                  $1,000.00
                </div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                  {riskPctNum}% Risk = ${stocksoperatorRiskAmount}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: API Credentials (Read-Only) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              3. Read-Only Credentials (Or Simulated Connect)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <input
                  type="text"
                  placeholder="Read-Only API Key / Account ID"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    color: '#0F172A',
                    outline: 'none',
                    background: '#FFFFFF'
                  }}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="API Secret / Investor Token (Optional)"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    color: '#0F172A',
                    outline: 'none',
                    background: '#FFFFFF'
                  }}
                />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
              Leave blank to initialize in Verified Sandbox Protocol Mode for instant testing.
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: '#059669',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Establishing Handshake...</span>
                </>
              ) : (
                <>
                  <span>Initialize Live Equity Sync</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
