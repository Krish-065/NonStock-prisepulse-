import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldAlert, Award, ChevronRight, CheckCircle2, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#0F172A', fontFamily: 'var(--font-sans)' }}>
      {/* Hero Section */}
      <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.04em' }}>
          Think You're a Profitable Trader?<br />
          <span style={{ color: '#10B981' }}>Prove It.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#475569', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Stop hiding behind fake screenshots and demo sandboxes. Trade live markets with realistic margin, strict liquidation, and un-fakeable global rankings. Find out where you actually rank.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: '#10B981', color: '#FFFFFF', padding: '16px 32px', borderRadius: '8px', 
              fontSize: '1.125rem', fontWeight: '700', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            Claim $1,000 Proving Capital <ChevronRight size={20} />
          </button>
          <button 
            onClick={() => navigate('/community')}
            style={{ 
              background: '#F8FAFC', color: '#0F172A', padding: '16px 32px', borderRadius: '8px', 
              fontSize: '1.125rem', fontWeight: '600', border: '1px solid #E2E8F0', cursor: 'pointer'
            }}
          >
            Explore Live Leaderboard
          </button>
        </div>

        {/* Hero Visual Preview */}
        <div style={{ marginTop: '64px', position: 'relative' }}>
          <div style={{ 
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', 
            padding: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
            display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap'
          }}>
            {/* Dashboard Mock Card 1 */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '250px', textAlign: 'left' }}>
              <div style={{ color: '#475569', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Global Rank</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award color="#F59E0B" /> #42
              </div>
              <div style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: '600', marginTop: '8px' }}>Top 0.5% worldwide</div>
            </div>
            {/* Dashboard Mock Card 2 */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '250px', textAlign: 'left' }}>
              <div style={{ color: '#475569', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Active Order</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>LONG BTC/USDT</div>
              <div style={{ color: '#10B981', fontSize: '1.5rem', fontWeight: '800', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>+$142.50</div>
            </div>
            {/* Dashboard Mock Card 3 */}
            <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '250px', textAlign: 'left' }}>
              <div style={{ color: '#475569', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Trading Streak</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap color="#3B82F6" /> 5 Days
              </div>
              <div style={{ color: '#475569', fontSize: '0.875rem', fontWeight: '600', marginTop: '8px' }}>+15 Gold Coins</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Minor Leagues of Real Trading */}
      <section style={{ background: '#F8FAFC', padding: '100px 24px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '64px' }}>The Minor Leagues of Real Trading</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ background: '#FEE2E2', color: '#EF4444', padding: '8px 16px', borderRadius: '999px', display: 'inline-block', fontWeight: '700', marginBottom: '24px', fontSize: '0.875rem' }}>Standard Demo Accounts</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '1.125rem' }}>❌ $100,000 monopoly money</li>
                <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '1.125rem' }}>❌ Zero emotional attachment</li>
                <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '1.125rem' }}>❌ No liquidation consequences</li>
                <li style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '1.125rem' }}>❌ Unrealistic margin</li>
              </ul>
            </div>
            
            <div style={{ background: '#1E293B', padding: '40px', borderRadius: '16px', border: '1px solid #0F172A', color: '#FFFFFF', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '8px 16px', borderRadius: '999px', display: 'inline-block', fontWeight: '700', marginBottom: '24px', fontSize: '0.875rem' }}>NonStock Proving Ground</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', fontSize: '1.125rem', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Strict $1,000 disciplined balance</li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '1.125rem', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Lose it? Face a 24-hour lockout</li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '1.125rem', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Real margin & liquidation math</li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '1.125rem', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Un-fakeable public track record</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Global Proof Ladder */}
      <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>The Global Proof Ladder</h2>
          <p style={{ fontSize: '1.25rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
            Rankings aren't based on pure luck. Our Composite Performance Ranking (CPR) algorithm proves true skill.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {[
            { title: 'Win Rate %', desc: 'Consistency over volume. Stop gambling.', weight: '15%' },
            { title: 'Profit Factor', desc: 'Gross Profit / Gross Loss. Measure edge.', weight: '25%' },
            { title: 'Risk-Adjusted ROI', desc: 'Returns relative to capital exposure.', weight: '35%' },
            { title: 'Max Drawdown Penalty', desc: 'Blowups destroy your ranking score.', weight: '-25%' },
          ].map((item, idx) => (
            <div key={idx} style={{ padding: '32px', border: '1px solid #E2E8F0', borderRadius: '16px', background: '#FFFFFF' }}>
              <div style={{ color: '#10B981', fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>{item.weight}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: '#475569' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The NonStock Pass (Plans) */}
      <section style={{ background: '#0F172A', padding: '100px 24px', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>The NonStock Pass</h2>
            <p style={{ fontSize: '1.25rem', color: '#94A3B8' }}>Start proving yourself today.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Free Tier */}
            <div style={{ flex: '1 1 400px', background: '#1E293B', borderRadius: '16px', padding: '40px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Free Contender</h3>
              <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px' }}>₹0<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: '500' }}>/forever</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> $1,000 Virtual Capital</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> 100 Initial Gold Coins</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Live Leaderboard Access</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><ShieldAlert color="#F59E0B" /> 24h lockout on liquidation</li>
              </ul>
              <button 
                onClick={() => navigate('/register')}
                style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px solid #E2E8F0', color: '#FFFFFF', borderRadius: '8px', fontSize: '1.125rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Start Free
              </button>
            </div>
            
            {/* Pro Tier */}
            <div style={{ flex: '1 1 400px', background: '#FFFFFF', borderRadius: '16px', padding: '40px', color: '#0F172A', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: '#FFFFFF', padding: '4px 12px', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '700' }}>RECOMMENDED</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>NonStock Pro</h3>
              <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px' }}>₹99<span style={{ fontSize: '1rem', color: '#475569', fontWeight: '500' }}>/month</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Instant Reset on Liquidation (No wait)</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Advanced Pro Screeners</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Trade Replay Mode</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Deep Performance Analytics</li>
              </ul>
              <button 
                onClick={() => navigate('/register')}
                style={{ width: '100%', padding: '16px', background: '#10B981', border: 'none', color: '#FFFFFF', borderRadius: '8px', fontSize: '1.125rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E2E8F0', padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
        <div style={{ fontWeight: '800', fontSize: '1.5rem', color: '#0F172A', marginBottom: '16px' }}>NonStock</div>
        <p style={{ maxWidth: '600px', margin: '0 auto 24px', fontSize: '0.875rem' }}>
          Disclaimer: NonStock is a simulated paper trading platform. Virtual capital and Gold Coins have no real-world monetary value. Past performance on NonStock does not guarantee future results in real live markets. Trade responsibly.
        </p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '0.875rem' }}>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
