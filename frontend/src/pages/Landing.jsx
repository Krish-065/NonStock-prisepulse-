import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#0F172A', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ padding: '120px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.04em' }}>
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
        </div>
      </section>

      {/* Feature Walkthrough (Zigzag) */}
      <section style={{ background: '#0F172A', color: '#FFFFFF', padding: '120px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '120px' }}>
          
          {/* Feature 1: Pro Screener */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px' }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ color: '#10B981', fontWeight: '700', marginBottom: '16px', letterSpacing: '1px' }}>MARKET SCANNER</div>
              <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px', lineHeight: '1.2' }}>Advanced Pro Screener</h2>
              <p style={{ fontSize: '1.25rem', color: '#94A3B8', marginBottom: '32px', lineHeight: '1.6' }}>
                Filter through thousands of global assets in milliseconds. Set custom parameters for RSI, Volume, and moving averages to find the perfect setup before the breakout happens.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 24px', borderRadius: '8px' }}>
                <span style={{ fontWeight: '700', color: '#10B981' }}>Unlock Cost:</span>
                <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '1.125rem' }}>300 Gold Coins</span>
              </div>
            </div>
            <div style={{ flex: '1 1 500px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #10B981, transparent)', filter: 'blur(60px)', opacity: 0.3, zIndex: 0 }}></div>
              <img src="/assets/pro_screener.jpg" alt="Pro Screener Interface" style={{ width: '100%', borderRadius: '16px', border: '1px solid #1E293B', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
            </div>
          </div>

          {/* Feature 2: Trade Replay (Reversed) */}
          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '60px' }}>
            <div style={{ flex: '1 1 500px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #3B82F6, transparent)', filter: 'blur(60px)', opacity: 0.3, zIndex: 0 }}></div>
              <img src="/assets/trade_replay.jpg" alt="Trade Replay Interface" style={{ width: '100%', borderRadius: '16px', border: '1px solid #1E293B', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ color: '#3B82F6', fontWeight: '700', marginBottom: '16px', letterSpacing: '1px' }}>SIMULATOR</div>
              <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px', lineHeight: '1.2' }}>Trade Replay Mode</h2>
              <p style={{ fontSize: '1.25rem', color: '#94A3B8', marginBottom: '32px', lineHeight: '1.6' }}>
                Missed a critical market session? Jump into our time machine. Replay historical price action candle-by-candle to backtest your strategies with zero risk.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '12px 24px', borderRadius: '8px' }}>
                <span style={{ fontWeight: '700', color: '#3B82F6' }}>Unlock Cost:</span>
                <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '1.125rem' }}>400 Gold Coins</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Performance Analysis */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px' }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ color: '#F59E0B', fontWeight: '700', marginBottom: '16px', letterSpacing: '1px' }}>ANALYTICS</div>
              <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px', lineHeight: '1.2' }}>Deep Performance Analysis</h2>
              <p style={{ fontSize: '1.25rem', color: '#94A3B8', marginBottom: '32px', lineHeight: '1.6' }}>
                Stop trading blindly. Our institutional-grade dashboard dissects your win rate, profit factor, max drawdown, and risk-adjusted ROI to expose your weaknesses.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 24px', borderRadius: '8px' }}>
                <span style={{ fontWeight: '700', color: '#F59E0B' }}>Unlock Cost:</span>
                <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '1.125rem' }}>500 Gold Coins</span>
              </div>
            </div>
            <div style={{ flex: '1 1 500px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #F59E0B, transparent)', filter: 'blur(60px)', opacity: 0.3, zIndex: 0 }}></div>
              <img src="/assets/performance_analysis.jpg" alt="Performance Analysis Dashboard" style={{ width: '100%', borderRadius: '16px', border: '1px solid #1E293B', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
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
                <li style={{ display: 'flex', gap: '12px', fontSize: '1.125rem', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Earn badges: Silver, Gold, Master & Operator</li>
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
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Monthly 1,000 Gold Coins drops</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Unlock Advanced Pro Screeners instantly</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Unlock Trade Replay Mode instantly</li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><CheckCircle2 color="#10B981" /> Exclusive Custom Badges</li>
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
