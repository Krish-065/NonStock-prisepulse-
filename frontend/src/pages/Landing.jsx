import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  ShieldCheck, Zap, Trophy, Medal, Award, Target, Flame, Coins, 
  Crown, ArrowRight, CheckCircle2, XCircle, Search, Activity, 
  Bot, Clock, FlaskConical, SlidersHorizontal, BarChart3, Users, 
  ChevronDown, ChevronUp, Lock, Sparkles, TrendingUp, TrendingDown,
  Layers, Compass, Check, AlertCircle, Eye, ExternalLink, HelpCircle
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  // Ensure body background is clean white while on Landing page
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    document.body.style.backgroundColor = '#FFFFFF';
    document.body.style.color = '#0F172A';
    return () => {
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
    };
  }, []);

  // Persona Switcher State
  const [activePersona, setActivePersona] = useState('educators'); // 'traders', 'educators', 'tipsters', 'propfirms'

  // Interactive Edge & Tier Calculator State
  const [winRate, setWinRate] = useState(58); // 58%
  const [riskReward, setRiskReward] = useState(2.2); // 1:2.2 R:R
  const [weeklyTrades, setWeeklyTrades] = useState(12); // 12 trades/week

  // Calculate projected tier from user inputs
  const calculatedEdge = useMemo(() => {
    const expectedValuePerTrade = (winRate / 100) * riskReward - (1 - winRate / 100) * 1.0;
    const monthlyTrades = weeklyTrades * 4;
    const monthlyReturnPct = Math.max(0, expectedValuePerTrade * monthlyTrades * 1.5);
    const projectedBalance = Math.round(1000 * (1 + monthlyReturnPct / 100));
    
    // Dynamic DER Score calculation
    const derScore = Math.min(99.4, Math.max(50.0, 50 + (winRate - 40) * 0.8 + (riskReward - 1) * 12)).toFixed(1);
    
    let tierName = 'Contender';
    let tierColor = '#0F172A';
    let tierBg = '#F1F5F9';
    let tierBorder = '#94A3B8';
    let tierIcon = ShieldCheck;

    if (projectedBalance >= 15000) {
      tierName = 'Apex Operator';
      tierColor = '#A855F7';
      tierBg = '#FAF5FF';
      tierBorder = '#C084FC';
      tierIcon = Crown;
    } else if (projectedBalance >= 8000) {
      tierName = 'Master Titan';
      tierColor = '#EF4444';
      tierBg = '#FEF2F2';
      tierBorder = '#FCA5A5';
      tierIcon = Trophy;
    } else if (projectedBalance >= 4000) {
      tierName = 'Gold Sovereign';
      tierColor = '#F59E0B';
      tierBg = '#FFFBEB';
      tierBorder = '#FCD34D';
      tierIcon = Award;
    } else if (projectedBalance >= 2000) {
      tierName = 'Silver Prover';
      tierColor = '#64748B';
      tierBg = '#F8FAFC';
      tierBorder = '#CBD5E1';
      tierIcon = Medal;
    }

    return {
      expectedValue: expectedValuePerTrade.toFixed(2),
      monthlyReturn: monthlyReturnPct.toFixed(1),
      projectedBalance,
      derScore,
      tierName,
      tierColor,
      tierBg,
      tierBorder,
      tierIcon
    };
  }, [winRate, riskReward, weeklyTrades]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Smooth scroll
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      
      {/* ─── 1. TOP GLOBAL NAVIGATION ─── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 32px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
            <Logo size={36} showName={true} showTagline={false} nameSize="22px" />
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <button onClick={() => scrollTo('why-nonstock')} style={navLinkStyle}>Why NonStock</button>
            <button onClick={() => scrollTo('the-arena')} style={navLinkStyle}>The Arena</button>
            <button onClick={() => scrollTo('personas')} style={navLinkStyle}>For Tipsters & Educators</button>
            <button onClick={() => scrollTo('calculator')} style={navLinkStyle}>Edge Simulator</button>
            <button onClick={() => scrollTo('hall-of-fame')} style={navLinkStyle}>Leaderboard</button>
            <button onClick={() => scrollTo('faq')} style={navLinkStyle}>FAQ</button>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link 
            to="/login"
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#334155',
              textDecoration: 'none',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              transition: 'all 0.15s'
            }}
          >
            Sign In
          </Link>

          <Link
            to="/register"
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#FFFFFF',
              textDecoration: 'none',
              background: '#10B981',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <span>Start Proving ($1,000 Free)</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ─── 2. HERO SECTION: MONUMENTAL BIG TEXT THEME ─── */}
      <section style={{
        position: 'relative',
        padding: '80px 24px 70px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Glow Accent Circles */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            color: '#15803D',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '28px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
          }}>
            <ShieldCheck size={16} color="#10B981" />
            <span>The World's First Verifiable Trading Proving Protocol</span>
          </div>

          {/* Monumental Headline */}
          <h1 style={{
            fontSize: 'clamp(42px, 6.2vw, 76px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-1.8px',
            color: '#0F172A',
            maxWidth: '1050px',
            margin: '0 auto 24px auto'
          }}>
            Stop Flexing Fake Screenshots. <br />
            <span style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #0284C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Prove Your True Market Edge.
            </span>
          </h1>

          {/* Deep Explanatory Description */}
          <p style={{
            fontSize: 'clamp(16px, 1.4vw, 20px)',
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: '820px',
            margin: '0 auto 40px auto',
            fontWeight: 500
          }}>
            The financial internet is plagued by photoshopped MT4 profits, cherry-picked trades, and reckless Telegram tipsters who hide their real blowups. <strong>NonStock</strong> is the transparent, mathematical proving ground. Every order, stop loss, and drawdown is verified on an unalterable ledger. 
            <strong> Know yourself, prove who is truly better, and stand out in the global arena.</strong>
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Link
              to="/register"
              style={{
                padding: '16px 36px',
                borderRadius: '12px',
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'transform 0.15s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>Enter The Proving Arena ($1,000 Free)</span>
              <ArrowRight size={18} />
            </Link>

            <button
              onClick={() => scrollTo('the-arena')}
              style={{
                padding: '16px 30px',
                borderRadius: '12px',
                background: '#F8FAFC',
                border: '1.5px solid #CBD5E1',
                color: '#334155',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#94A3B8'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            >
              <Trophy size={18} color="#D97706" />
              <span>Explore The Rules & Tiers</span>
            </button>
          </div>

          {/* Trust Value Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '28px',
            flexWrap: 'wrap',
            fontSize: '13px',
            fontWeight: 700,
            color: '#64748B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Equal $1,000 Starting Baseline</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Zero Personal Capital At Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Mathematical DER Edge Score</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>100% Anti-Fake Verified Ledger</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Terminal Display Card */}
        <div style={{
          marginTop: '60px',
          background: '#0F172A',
          borderRadius: '24px',
          padding: '16px',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
          border: '2px solid #1E293B',
          textAlign: 'left'
        }}>
          {/* Window Control Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 14px 16px', borderBottom: '1px solid #1E293B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginLeft: '12px' }}>
                nonstock-terminal // live-proving-engine v2.4
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Activity size={12} />
                <span>EXCHANGE TICKS ACTIVE</span>
              </span>
            </div>
          </div>

          {/* Terminal Mock Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', padding: '20px 8px 8px 8px' }}>
            
            {/* Box 1: Prover Status */}
            <div style={{ background: '#1E293B', borderRadius: '14px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                VERIFIED PROVER
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Alex_Quant</span>
                <span style={{ background: '#0F172A', color: '#10B981', border: '1.5px solid #10B981', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 900 }}>
                  GOLD PROVER
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '6px' }}>
                Proving Capital: <strong style={{ color: '#10B981' }}>$4,410.25</strong> (+$3,410.25 Profit)
              </div>
              <div style={{ height: '6px', background: '#334155', borderRadius: '6px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ width: '74%', height: '100%', background: '#F59E0B', borderRadius: '6px' }} />
              </div>
            </div>

            {/* Box 2: DER Score */}
            <div style={{ background: '#1E293B', borderRadius: '14px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                DISCIPLINE & EDGE RATING
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>
                88.5 <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 700 }}>/ 100</span>
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                Risk Invalidation: <strong>100% SL Protected</strong> • Max DD: <strong>3.8%</strong>
              </div>
            </div>

            {/* Box 3: Coins & Streak */}
            <div style={{ background: '#1E293B', borderRadius: '14px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                GOLD COIN VAULT & STREAK
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#FACC15', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={24} color="#FACC15" />
                <span>375 Coins</span>
              </div>
              <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Flame size={14} color="#EA580C" /> 7-Day Discipline Streak (+25 daily)
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. SECTION: WHY NONSTOCK? KNOW YOURSELF. KNOW WHO IS BETTER ─── */}
      <section id="why-nonstock" style={{
        padding: '90px 24px',
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 60px auto' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              THE CORE PURPOSE
            </span>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1px', color: '#0F172A', margin: '10px 0 18px 0' }}>
              Why NonStock Exists: The Antidote to Trading Delusion.
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.6, fontWeight: 500 }}>
              Trading without verified discipline is just gambling with a financial dictionary. NonStock was engineered to solve the three greatest dysfunctions in modern retail finance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            
            {/* Pillar 1: Know Yourself */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 32px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Target size={28} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>
                  1. Know Yourself First
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  Do you actually possess a positive mathematical edge, or are you surviving on random winning streaks before the inevitable blowup? NonStock strips away emotional bias. Track your true win-rate, risk-to-reward ratio, and drawdown velocity on a 100% safe, verified proving ground before risking real family savings.
                </p>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', fontSize: '13px', fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Objective Mathematical Self-Discovery
              </div>
            </div>

            {/* Pillar 2: Know Who is Better */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 32px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Trophy size={28} color="#3B82F6" />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>
                  2. Settle Who is Truly Better
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  Anyone can talk theory, quote candlestick patterns, and argue in comment sections. But talk is free. In NonStock, everyone begins with the exact same <strong>$1,000 capital baseline</strong>. Rankings are determined purely by disciplined execution, mathematical returns, and risk control. No pay-to-win. No inspect-element cheating.
                </p>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', fontSize: '13px', fontWeight: 800, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Public Tamper-Proof Leaderboard
              </div>
            </div>

            {/* Pillar 3: Tipsters & Educators */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 32px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#FEF9C3',
                  border: '1px solid #FDE047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Crown size={28} color="#D97706" />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>
                  3. The Ultimate Asset For Educators & Tipsters
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  Legitimate financial educators and tipsters face constant skepticism from online audiences burned by scammers. NonStock is your ultimate badge of honour. Link your verified NonStock track record in your bio to prove to your followers that you trade with genuine, audited mathematical discipline.
                </p>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', fontSize: '13px', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Unforgeable Professional Credibility
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. SECTION: PERSONA SHOWCASE (WHO NONSTOCK IS BUILT FOR) ─── */}
      <section id="personas" style={{ padding: '90px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 48px auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            TAILORED ADVANTAGES
          </span>
          <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 46px)', fontWeight: 900, letterSpacing: '-1px', color: '#0F172A', margin: '10px 0 16px 0' }}>
            Built For Anyone Who Takes Market Skill Seriously.
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', fontWeight: 500 }}>
            Select your profile to discover how NonStock elevates your market presence and skill.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {[
            { id: 'educators', label: 'Trading Mentors & Educators', icon: Crown },
            { id: 'tipsters', label: 'Telegram Analysts & Tipsters', icon: Zap },
            { id: 'traders', label: 'Retail & Aspiring Traders', icon: Target },
            { id: 'propfirms', label: 'Capital Allocators & Prop Firms', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activePersona === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePersona(tab.id)}
                style={{
                  padding: '12px 22px',
                  borderRadius: '12px',
                  border: isActive ? '2px solid #10B981' : '1px solid #CBD5E1',
                  background: isActive ? '#F0FDF4' : '#FFFFFF',
                  color: isActive ? '#059669' : '#475569',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Persona Active Card Display */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: '24px',
          padding: '44px 36px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 12px 35px rgba(0,0,0,0.04)'
        }}>
          {activePersona === 'educators' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '36px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  FOR EDUCATORS & CONTENT CREATORS
                </span>
                <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', margin: '8px 0 16px 0' }}>
                  Prove Your Value With Public Mathematical Verification.
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  Stop being lumped together with scammers who sell courses without ever placing a trade. When you maintain a public NonStock profile with a Master or Operator Decagon badge, your audience sees every verifiable trade tick, your Sharpe ratio, and zero liquidation marks.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Embed your verified NonStock badge in YouTube/Twitter bios</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Prove live students can reproduce your edge on equal $1,000 accounts</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Permanent anti-photoshop verification protects your reputation</li>
                </ul>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '28px', border: '1.5px solid #CBD5E1' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>PUBLIC PROFILE PREVIEW</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 900, fontSize: '20px' }}>E</div>
                  <div>
                    <strong style={{ fontSize: '18px', color: '#0F172A' }}>Sarah_FX_Academy</strong>
                    <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 800 }}>Master Operator • Top 2% Globally</div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155' }}>
                  "My students used to question if I actually made money. Now I show them my live NonStock ID with a 1:2.4 R:R ledger and 92.1 DER score. Trust is instant."
                </div>
              </div>
            </div>
          )}

          {activePersona === 'tipsters' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '36px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  FOR TELEGRAM ANALYSTS & SIGNAL PROVIDERS
                </span>
                <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', margin: '8px 0 16px 0' }}>
                  Transform Skeptical Followers Into Lifelong Subscribers.
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  The signal market is saturated with anonymous channels posting cropped PnL screenshots from demo accounts. With NonStock, you execute every signal in the Arena with strict Stop-Loss timestamps. When your community sees consistent capital progression on an immutable ledger, your subscription retention skyrockets.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> No more "Show your real ledger" accusations in comments</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Highlight your rank in the Global Hall of Fame as proof of edge</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Strict stop-loss logging verifies you protect client capital</li>
                </ul>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '28px', border: '1.5px solid #CBD5E1' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>CREDIBILITY AUDIT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontWeight: 900, fontSize: '20px' }}>T</div>
                  <div>
                    <strong style={{ fontSize: '18px', color: '#0F172A' }}>CryptoAlpha_VIP</strong>
                    <div style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 800 }}>Gold Sovereign • 78 Trades Logged</div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155' }}>
                  "My channel conversion tripled once I replaced cropped broker screenshots with my verified NonStock URL. Real traders respect mathematical accountability."
                </div>
              </div>
            </div>
          )}

          {activePersona === 'traders' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '36px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  FOR RETAIL & ASPIRING TRADERS
                </span>
                <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', margin: '8px 0 16px 0' }}>
                  Stop Blowing Real Savings. Master Execution Here First.
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  Most traders lose their first $5,000 in real cash within 90 days because they never practiced strict risk discipline. NonStock gives you an identical starting capital of $1,000, 50x leverage, and real exchange data. If you can grow $1,000 to $4,000 here, you are ready for real capital.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> 100% free with identical $1,000 starting proves true ability</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> 24-hour timeout penalty on account blowout forces genuine care</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Groq AI Mentor flags emotional trap entries before execution</li>
                </ul>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '28px', border: '1.5px solid #CBD5E1' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>PROVEN MILESTONES</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontWeight: 900, fontSize: '20px' }}>R</div>
                  <div>
                    <strong style={{ fontSize: '18px', color: '#0F172A' }}>Karan_Trader</strong>
                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 800 }}>Silver Prover • $2,240 Proving Equity</div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155' }}>
                  "I blew 3 real broker accounts before joining NonStock. The Gold Coins penalty system finally taught me how to honor my stop losses. Now I am in Silver tier."
                </div>
              </div>
            </div>
          )}

          {activePersona === 'propfirms' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '36px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  FOR CAPITAL ALLOCATORS & PROP FIRMS
                </span>
                <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', margin: '8px 0 16px 0' }}>
                  Scout Verified Trading Talent Backed By Hard Math.
                </h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  Stop sorting through doctored PDF account statements. The NonStock Hall of Fame sorts global traders strictly by Discipline and Edge Rating (DER). Review bar-by-bar execution history, maximum drawdowns, and trade consistency on verified exchange ticks.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Full historical trade ledger auditable to the millisecond</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Zero survivorship bias: every failed account and reset is recorded</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color="#10B981" /> Direct talent scouting channel for proprietary trading desks</li>
                </ul>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '28px', border: '1.5px solid #CBD5E1' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>INSTITUTIONAL METRICS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7', fontWeight: 900, fontSize: '20px' }}>P</div>
                  <div>
                    <strong style={{ fontSize: '18px', color: '#0F172A' }}>Apex Capital Scout</strong>
                    <div style={{ fontSize: '12px', color: '#A855F7', fontWeight: 800 }}>Institutional Allocator</div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155' }}>
                  "We look for traders with DER scores above 85.0 and minimum 50 closed trades. NonStock is the cleanest pipeline for finding real risk managers."
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── 5. SECTION: THE PROVING ARENA RULES & DECAGON TIERS ─── */}
      <section id="the-arena" style={{
        padding: '90px 24px',
        background: '#0F172A',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px auto' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              THE COMPETITIVE FRAMEWORK
            </span>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1px', color: '#FFFFFF', margin: '10px 0 18px 0' }}>
              The 5 Decagon Tiers: From Contender to Apex Operator.
            </h2>
            <p style={{ fontSize: '17px', color: '#94A3B8', lineHeight: 1.6, fontWeight: 500 }}>
              Everyone starts as a Contender with $1,000. Each rank is earned mathematically. Advance by compounding your proving capital and locking down drawdowns.
            </p>
          </div>

          {/* 5 Tiers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            
            {/* Tier 1: Contender */}
            <div style={{ background: '#1E293B', borderRadius: '18px', padding: '24px', border: '1.5px solid #334155', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px auto',
                background: '#0F172A',
                border: '2px solid #64748B',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={28} color="#94A3B8" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>TIER 1 BASELINE</div>
              <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 8px 0' }}>Contender</h4>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>$1,000 Proving Capital</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                The starting proving arena. Test your risk management.
              </p>
            </div>

            {/* Tier 2: Silver */}
            <div style={{ background: '#1E293B', borderRadius: '18px', padding: '24px', border: '1.5px solid #94A3B8', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px auto',
                background: '#334155',
                border: '2px solid #E2E8F0',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Medal size={28} color="#E2E8F0" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>TIER 2 VERIFIED</div>
              <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 8px 0' }}>Silver Prover</h4>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#E2E8F0', fontFamily: 'var(--font-mono)' }}>$2,000+ Capital</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                Doubled your capital baseline with consistent risk control.
              </p>
            </div>

            {/* Tier 3: Gold */}
            <div style={{ background: '#1E293B', borderRadius: '18px', padding: '24px', border: '1.5px solid #F59E0B', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px auto',
                background: '#78350F',
                border: '2px solid #FDE047',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={28} color="#FDE047" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase' }}>TIER 3 SOVEREIGN</div>
              <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 8px 0' }}>Gold Sovereign</h4>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FACC15', fontFamily: 'var(--font-mono)' }}>$4,000+ Capital</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                Top 8% globally. Verified edge across multiple market regimes.
              </p>
            </div>

            {/* Tier 4: Master */}
            <div style={{ background: '#1E293B', borderRadius: '18px', padding: '24px', border: '1.5px solid #EF4444', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px auto',
                background: '#7F1D1D',
                border: '2px solid #FCA5A5',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trophy size={28} color="#FCA5A5" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase' }}>TIER 4 ELITE</div>
              <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 8px 0' }}>Master Titan</h4>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>$8,000+ Capital</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                8x baseline compounder with tight drawdowns and strict stops.
              </p>
            </div>

            {/* Tier 5: Operator */}
            <div style={{ background: '#1E293B', borderRadius: '18px', padding: '24px', border: '1.5px solid #A855F7', textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px auto',
                background: '#581C87',
                border: '2px solid #D8B4FE',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Crown size={28} color="#D8B4FE" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#A855F7', textTransform: 'uppercase' }}>TIER 5 APEX</div>
              <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 8px 0' }}>Apex Operator</h4>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#D8B4FE', fontFamily: 'var(--font-mono)' }}>$15,000+ Capital</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                The top 0.1% of verified traders. Institutional caliber.
              </p>
            </div>

          </div>

          {/* Discipline Economy Spotlight (The 100 Gold Coins Vault) */}
          <div style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            borderRadius: '24px',
            padding: '36px',
            border: '2px solid #334155',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Coins size={28} color="#FACC15" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FACC15', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  THE DISCIPLINE ECONOMY (GOLD COINS)
                </span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px 0' }}>
                Coins Reward Discipline. Blowouts Extract Penalties.
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                Every participant begins with 100 Gold Coins. Earn +25 coins daily by maintaining your streak, and +5 coins on every protected order. If you blow your $1,000 balance, you must spend 100 coins to reset. Run out of coins, and you enter a mandatory 24-hour timeout.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>DAILY STREAK BONUS</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>+25 Coins / 24h</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Once per calendar day</div>
              </div>

              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>STOP-LOSS PROTECTION</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>+5 Coins / Trade</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Rewarding planned exits</div>
              </div>

              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>ACCOUNT BLOWOUT COST</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#EF4444', marginTop: '2px' }}>-100 Coins Reset</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Punishing reckless leverage</div>
              </div>

              <div style={{ background: '#0F172A', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>TOOL UTILITY SINK</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#FACC15', marginTop: '2px' }}>Unlock Edge Tools</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Screener, Replay, AI Mentor</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 6. SECTION: INTERACTIVE EDGE & TIER SIMULATOR ─── */}
      <section id="calculator" style={{
        padding: '90px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 48px auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            INTERACTIVE MATHEMATICAL CALCULATOR
          </span>
          <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 46px)', fontWeight: 900, letterSpacing: '-1px', color: '#0F172A', margin: '10px 0 16px 0' }}>
            Simulate Your Edge: Project Your Rank & Tier.
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', fontWeight: 500 }}>
            Adjust your win-rate, risk-to-reward ratio, and weekly frequency to calculate your projected proving capital from the $1,000 baseline.
          </p>
        </div>

        <div style={{
          background: '#F8FAFC',
          borderRadius: '24px',
          padding: '40px',
          border: '1.5px solid #E2E8F0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
        }}>
          {/* Sliders Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Slider 1: Win Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Historical Win-Rate (%)</label>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>{winRate}%</span>
              </div>
              <input 
                type="range" 
                min="35" 
                max="85" 
                value={winRate} 
                onChange={(e) => setWinRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                <span>35% (Trend Follower)</span>
                <span>85% (High Accuracy Sniper)</span>
              </div>
            </div>

            {/* Slider 2: Risk to Reward */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Risk-to-Reward Ratio (R:R)</label>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>1:{riskReward}</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="4.0" 
                step="0.1" 
                value={riskReward} 
                onChange={(e) => setRiskReward(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                <span>1:1.0 (Scalper)</span>
                <span>1:4.0 (Macro Runner)</span>
              </div>
            </div>

            {/* Slider 3: Weekly Frequency */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Disciplined Trades per Week</label>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>{weeklyTrades} Trades</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="30" 
                value={weeklyTrades} 
                onChange={(e) => setWeeklyTrades(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                <span>3 (Selective Swing)</span>
                <span>30 (Active Intraday)</span>
              </div>
            </div>

          </div>

          {/* Results Projection Card */}
          <div style={{
            background: calculatedEdge.tierBg,
            borderRadius: '20px',
            padding: '32px',
            border: `2px solid ${calculatedEdge.tierBorder}`,
            textAlign: 'center'
          }}>
            <div style={{
              width: '76px',
              height: '76px',
              margin: '0 auto 16px auto',
              background: '#0F172A',
              border: `2.5px solid ${calculatedEdge.tierColor}`,
              clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <calculatedEdge.tierIcon size={34} color={calculatedEdge.tierColor} />
            </div>

            <div style={{ fontSize: '11px', fontWeight: 800, color: calculatedEdge.tierColor, textTransform: 'uppercase', letterSpacing: '1px' }}>
              PROJECTED PROVING TIER
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 900, color: calculatedEdge.tierColor, margin: '4px 0 14px 0' }}>
              {calculatedEdge.tierName}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left', background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>PROJECTED CAPITAL</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                  ${calculatedEdge.projectedBalance.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>ESTIMATED DER SCORE</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  {calculatedEdge.derScore} <span style={{ fontSize: '11px', color: '#64748B' }}>/ 100</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: calculatedEdge.tierColor,
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              Prove This Edge Now ($1,000 Capital)
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 7. SECTION: VERIFIED GLOBAL HALL OF FAME PREVIEW ─── */}
      <section id="hall-of-fame" style={{
        padding: '90px 24px',
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              PUBLIC LEADERBOARD
            </span>
            <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 46px)', fontWeight: 900, letterSpacing: '-1px', color: '#0F172A', margin: '10px 0 16px 0' }}>
              The Global Hall of Fame: 100% Anti-Fake.
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B', fontWeight: 500 }}>
              Rankings are based strictly on DER Score and verifiable proving returns. No manual overrides, no fake bots.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #CBD5E1', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>RANK</th>
                  <th style={{ padding: '14px 20px' }}>TRADER & VERIFICATION</th>
                  <th style={{ padding: '14px 20px' }}>TIER BADGE</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>DER SCORE</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>PROVING CAPITAL</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: 'Satyarajsinh Rathod', tag: 'Operator', color: '#A855F7', der: '94.2', balance: '$15,820.00', isPro: true },
                  { rank: 2, name: 'Ashish Katira', tag: 'Master', color: '#EF4444', der: '91.8', balance: '$8,450.50', isPro: true },
                  { rank: 3, name: 'Admin', tag: 'Gold', color: '#F59E0B', der: '88.5', balance: '$4,120.00', isPro: true },
                  { rank: 4, name: 'Krish Shah', tag: 'Silver', color: '#64748B', der: '84.0', balance: '$2,380.00', isPro: false },
                  { rank: 5, name: 'Test Trader', tag: 'Contender', color: '#0F172A', der: '75.0', balance: '$1,000.00', isPro: false }
                ].map((item, idx) => (
                  <tr key={item.rank} style={{ borderBottom: '1px solid #F1F5F9', background: idx === 0 ? '#FAF5FF' : '#FFFFFF' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 900, color: item.rank === 1 ? '#A855F7' : '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>#{item.rank}</span>
                        {item.rank === 1 && <Trophy size={14} color="#A855F7" />}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{item.name}</span>
                        {item.isPro && (
                          <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>
                            PRO
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: '#0F172A',
                        color: item.color,
                        border: `1px solid ${item.color}`,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 900,
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase'
                      }}>
                        {item.tag}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                      {item.der}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                      {item.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link
              to="/dashboard"
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: '#10B981',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>View Complete 50-Trader Global Leaderboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── 8. SECTION: FREQUENTLY ASKED QUESTIONS ─── */}
      <section id="faq" style={{ padding: '90px 24px', maxWidth: '850px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            CLARITY & RULES
          </span>
          <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 44px)', fontWeight: 900, letterSpacing: '-1px', color: '#0F172A', margin: '10px 0 16px 0' }}>
            Frequently Asked Questions.
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', fontWeight: 500 }}>
            Everything you need to know about the Proving Arena, verification badges, and coin rules.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            {
              q: "Is real money deposited or risked on NonStock?",
              a: "No. NonStock is 100% simulated capital with real live exchange tick data. Every trader starts with $1,000 in virtual proving capital. You never risk your real life savings, but you are held accountable to identical institutional execution and liquidation rules."
            },
            {
              q: "How do tipsters and educators prove their track record to followers?",
              a: "Every trader and educator gets a unique public ID (e.g. NS-c141ad16). When you share this link on Twitter, YouTube, or Telegram, your audience can view your verified DER Score, un-tampered trade ledger, and decagon rank badge. It is impossible to fake or edit."
            },
            {
              q: "Can anyone cheat, inspect-element, or reset stats without penalty?",
              a: "No. All trades, orders, entry prices, and exits are committed to our secure backend database connected to live exchange tick feeds. If an account is liquidated, a 100 Gold Coins fee is extracted. If you run out of coins, you face a 24-hour lockout."
            },
            {
              q: "What is the Discipline & Edge Rating (DER Score)?",
              a: "DER Score is NonStock's proprietary mathematical rating (0 to 100). It measures positive expectancy, risk-to-reward consistency (requiring active Stop-Loss orders), and maximum drawdown suppression. It is designed to expose lucky gamblers and highlight real risk managers."
            },
            {
              q: "How do Gold Coins work and how are they earned?",
              a: "Gold Coins are your Second Life and edge tool sink. You start with 100 coins. You earn +25 coins strictly once per calendar day by logging in and keeping your streak alive, and +5 coins on every trade placed with an active Stop Loss. You can spend coins to unlock the Real-Time Screener, Strategy Lab, AI Mentor, and Replay Simulator."
            }
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: isOpen ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  boxShadow: isOpen ? '0 4px 20px rgba(16, 185, 129, 0.08)' : 'none'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {item.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} color="#10B981" /> : <ChevronDown size={18} color="#94A3B8" />}
                </button>

                {isOpen && (
                  <div style={{ padding: '0 24px 20px 24px', fontSize: '14px', color: '#475569', lineHeight: 1.6, borderTop: '1px solid #F1F5F9' }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ─── 9. MASSIVE FINAL CALL TO ACTION ─── */}
      <section style={{
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #0F172A 0%, #064E3B 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#A7F3D0',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '24px'
          }}>
            <ShieldCheck size={16} />
            <span>JOIN THE UNTOUCHABLE GLOBAL PROVERS</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(38px, 5.2vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            margin: '0 0 20px 0'
          }}>
            Stop Guessing. <br />
            Enter The Proving Arena Today.
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#D1D5DB',
            maxWidth: '650px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            Claim your $1,000 baseline, execute with live ticks, and prove your real standing in front of the global trading community. 100% free forever.
          </p>

          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '18px 42px',
              borderRadius: '12px',
              background: '#10B981',
              color: '#FFFFFF',
              fontSize: '17px',
              fontWeight: 900,
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.15s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>Claim $1,000 Baseline & Start Proving</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── 10. HIGH-PROFILE FOOTER ─── */}
      <footer style={{
        background: '#0B0F19',
        color: '#64748B',
        padding: '60px 24px 30px 24px',
        borderTop: '1px solid #1E293B',
        fontSize: '13px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px', marginBottom: '40px' }}>
          <div>
            <Logo size={32} showName={true} showTagline={false} nameSize="20px" />
            <p style={{ marginTop: '12px', maxWidth: '320px', lineHeight: 1.6 }}>
              The global verifiable proving protocol. Transforming trading discipline into certified, mathematically auditable credentials.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 800, marginBottom: '12px' }}>PLATFORM</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/trading" style={{ color: '#94A3B8', textDecoration: 'none' }}>Trading Arena</Link>
                <Link to="/dashboard" style={{ color: '#94A3B8', textDecoration: 'none' }}>Leaderboard</Link>
                <Link to="/screener" style={{ color: '#94A3B8', textDecoration: 'none' }}>Market Screener</Link>
                <Link to="/ai-mentor" style={{ color: '#94A3B8', textDecoration: 'none' }}>AI Mentor</Link>
              </div>
            </div>

            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 800, marginBottom: '12px' }}>PROVING RULES</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ color: '#94A3B8' }}>$1,000 Equal Baseline</span>
                <span style={{ color: '#94A3B8' }}>5 Decagon Tiers</span>
                <span style={{ color: '#94A3B8' }}>Discipline Gold Coins</span>
                <span style={{ color: '#94A3B8' }}>DER Score Math</span>
              </div>
            </div>

            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 800, marginBottom: '12px' }}>ACCOUNT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>Sign In</Link>
                <Link to="/register" style={{ color: '#94A3B8', textDecoration: 'none' }}>Create Free Account</Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            © {new Date().getFullYear()} NonStock Protocol. Built for true market discipline.
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            Educational and skill verification simulator. No real money or financial deposits accepted.
          </div>
        </div>
      </footer>

    </div>
  );
}

const navLinkStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: '13px',
  fontWeight: 700,
  color: '#475569',
  cursor: 'pointer',
  transition: 'color 0.15s'
};
