import React from 'react';
import { useTrading } from '../contexts/TradingContext';
import { ShieldAlert } from 'lucide-react';

export default function WarningModal() {
  const { hasSeenModal, acknowledgeModal } = useTrading();

  if (hasSeenModal) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#FFFFFF', padding: '40px', borderRadius: '16px', maxWidth: '500px', width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', color: '#0F172A', textAlign: 'center'
      }}>
        <ShieldAlert size={64} color="#F59E0B" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', color: '#1E293B' }}>
          ATTENTION TRADER: Protect Your 100 Gold Coins
        </h2>
        <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '32px', lineHeight: '1.6', textAlign: 'left' }}>
          These 100 Gold Coins are your <strong>Second Life</strong>, not spending money. 
          If your $1,000 balance gets liquidated, you can spend these 100 coins for an instant account reset. 
          If you waste them on cosmetic passes and blow your account, you will face a mandatory 24-hour lockout. 
          Trade responsibly.
        </p>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', marginBottom: '24px', cursor: 'pointer', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <input type="checkbox" id="understand-rules" style={{ width: '20px', height: '20px', accentColor: '#EA580C' }} />
          <span style={{ fontWeight: '600' }}>I understand my capital rules</span>
        </label>
        
        <button 
          onClick={() => {
            const cb = document.getElementById('understand-rules');
            if (cb && cb.checked) {
              acknowledgeModal();
            } else {
              alert("You must check the box to proceed.");
            }
          }}
          style={{ width: '100%', padding: '16px', background: '#EA580C', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '1.125rem', fontWeight: '700', cursor: 'pointer' }}
        >
          Enter Trading Floor
        </button>
      </div>
    </div>
  );
}
