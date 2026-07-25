import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Scale, AlertTriangle, Info, FileText, ChevronLeft, Award, Users, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

export default function Terms() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate(-1);
    }
  };

  const content = (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: user ? '0' : '24px', color: '#ffffff' }}>
      
      {/* Go Back button */}
      <button
        onClick={handleBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#00ff88',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          marginBottom: '20px',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          background: 'rgba(0, 255, 136, 0.03)',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0, 255, 136, 0.08)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(0, 255, 136, 0.03)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <ChevronLeft size={16} />
        {user ? 'Back to Dashboard' : 'Go Back'}
      </button>


      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 20, 39, 0.6) 0%, rgba(22, 28, 59, 0.4) 100%)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '900', 
          margin: '0 0 10px 0', 
          background: 'linear-gradient(135deg, #00ff88 0%, #00bcd4 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Scale size={32} style={{ color: '#00ff88' }} />
          Terms, Conditions & Disclaimers
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
          Regulatory disclosures, data terms, and simulator guidelines for the NonStock ecosystem.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Section 1: SEBI Compliance & Educational Simulator */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#00ff88', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 12px 0' }}>
            <Award size={20} /> 1. Educational Simulator & SEBI Guidelines
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6', color: '#d0d2dd' }}>
            <p>
              NonStock is designed solely as an <strong>Educational Trading Simulator</strong>. It is built to foster financial literacy, practice strategic backtesting, and analyze technical setups in a completely risk-free virtual sandbox.
            </p>
            <p>
              In strict accordance with the rules of the **Securities and Exchange Board of India (SEBI)** regarding simulator platforms:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>All cash balances, portfolios, wins/losses, and virtual trades displayed on this platform are entirely virtual and have no real-world monetary value or currency equivalent.</li>
              <li>The Indian market charting data might be simulated, delayed, or subject to licensing parameters. It must never be used to guide live-market trading orders.</li>
              <li>NonStock does not offer execution links to live brokerage accounts.</li>
            </ul>
          </div>
        </div>

        {/* Section 2: No Investment Advisory / Professional Gating */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#00bcd4', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 12px 0' }}>
            <ShieldCheck size={20} /> 2. No Investment Advice or Solicitation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6', color: '#d0d2dd' }}>
            <p>
              The AI Mentor, Machine Learning signals, indicators (RSI, SMA, options greeks), and strategy backtester are automated tools for **technical analysis research** and **sandbox trial purposes**.
            </p>
            <p style={{ background: 'rgba(255, 179, 0, 0.05)', borderLeft: '4px solid #ffb300', padding: '12px', borderRadius: '4px', color: '#ffb300' }}>
              <strong>Important:</strong> None of the signals, technical scripts, backtest results, or chat replies generated by our tools represent financial advice, buying or selling recommendations, or portfolio management services. We do not act as SEBI-registered investment advisers. All trades simulated on the platform are at the user's sole discretion.
            </p>
          </div>
        </div>

        {/* Section 3: Data Feeds & Integration Limits */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 12px 0' }}>
            <AlertTriangle size={20} /> 3. Chart Data Limitations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6', color: '#d0d2dd' }}>
            <p>
              NonStock references public charts and feeds.
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li><strong>Indian Market Feeds:</strong> Provided through simulated integrations and historical logs. Due to licensing constraints of exchanges (NSE/BSE), third-party widgets may not load on standard public domains without customized enterprise licenses.</li>
              <li><strong>International Charts:</strong> Sourced via the TradingView Widget and restricted to global equities, forex, and indices.</li>
              <li><strong>System Latency:</strong> NonStock makes no representation of uptime, continuous streaming updates, or data completeness. Feeds may freeze, lag, or experience outages.</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Pro Gating & Fees */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffb300', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 12px 0' }}>
            <FileText size={20} /> 4. Membership Plans & Refund Policy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6', color: '#d0d2dd' }}>
            <p>
              NonStock offers custom educational tiers, including **NonStock Pro**. 
            </p>
            <p>
              Fees paid for advanced indicators, AI queries quota extensions, or custom alert configurations are strictly for **sandbox computing capacity**. NonStock does not support auto-renewals or store card details. All membership upgrades are finalized upon admin verification, and payments are non-refundable.
            </p>
          </div>
        </div>

        {/* Section 5: Community Hub, Coaches & User-Generated Content */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 12px 0' }}>
            <Users size={20} /> 5. Community Hub, Coaches & User-Generated Content
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6', color: '#d0d2dd' }}>
            <p>
              NonStock provides an open platform for creators, coaches, and users to host discussion groups, share market views, and publish strategies.
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li><strong>Third-Party Content:</strong> Views, signals, or strategies shared by coaches or community members belong solely to the author and do not reflect the views of NonStock.</li>
              <li><strong>No Endorsement:</strong> Hosting a channel on NonStock does not constitute an endorsement of a coach's SEBI registration status or trading expertise. Users are solely responsible for verifying the credentials of any third-party adviser.</li>
              <li><strong>Moderation & Termination:</strong> NonStock reserves the right to terminate accounts, remove channels, or ban users who post unauthorized financial advice, spam, or misleading stock tips without prior notice.</li>
            </ul>
          </div>
        </div>

        {/* Section 6: Limitation of Liability & "As-Is" Provision */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 12px 0' }}>
            <AlertTriangle size={20} /> 6. Limitation of Liability & "As-Is" Provision
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6', color: '#d0d2dd' }}>
            <p>
              The platform and all simulated utilities are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind.
            </p>
            <p style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '4px', color: '#f87171' }}>
              <strong>No Financial Liability:</strong> NonStock, its developers, and affiliated institutions shall not be held liable for any real-world financial losses, capital erosion, or decision-making outcomes resulting from the use of this platform, its AI Mentor, automated bots, or simulated data.
            </p>
          </div>
        </div>

        {/* Section 7: Algorithmic & Automated Bot Disclaimer */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 12px 0' }}>
            <Activity size={20} /> 7. Automated Simulation Bot Disclaimer
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6', color: '#d0d2dd' }}>
            <p>
              Users may deploy mock algorithmic bots within the paper trading sandbox.
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>All automated bot activities are simulated local scripts running inside a test environment.</li>
              <li>Past simulated performance of any bot strategy is not indicative of future results in live market conditions.</li>
              <li>Replicating mock bot setups in live brokerage accounts carries substantial risk, and users assume complete responsibility for any external algorithmic setups they configure.</li>
            </ul>
          </div>
        </div>

        {/* Section 8: User Accounts & Platform Security */}
        <div style={{
          background: 'var(--bg-card-glass)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 12px 0' }}>
            <ShieldCheck size={20} /> 8. Account Security & Responsible Usage
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6', color: '#d0d2dd' }}>
            <p>
              You are responsible for maintaining the confidentiality of your credentials (including passwords and verification proof).
            </p>
            <p>
              NonStock utilizes rate limiters and standard session management to protect user profiles. You agree not to perform scrapers, stress-tests, or DDOS requests on the public APIs. Any abuse of platform endpoints will lead to immediate account suspension.
            </p>
          </div>
        </div>

      </div>
    </div>
  );

  if (user) {
    return <Layout>{content}</Layout>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      backgroundImage: 'var(--gradient-bg)', 
      padding: '40px 16px',
      overflowY: 'auto'
    }}>
      {content}
    </div>
  );
}

