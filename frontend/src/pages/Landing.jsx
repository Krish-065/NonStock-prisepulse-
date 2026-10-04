import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import CelestialEngine from '../components/CelestialEngine';
import GoldCoin1K from '../components/GoldCoin1K';
import { 
  ShieldCheck, Trophy, Medal, Award, Target, Coins, 
  Crown, ArrowRight, CheckCircle2, Zap,
  ChevronDown, ChevronUp, Lock, Sparkles, TrendingUp,
  BarChart3, Activity, Layers, Compass, Check, AlertCircle, Eye,
  SlidersHorizontal, RefreshCw, FileCheck2, Share2, ExternalLink,
  Clock, Smartphone, Cpu, Users, Flame, ChevronRight
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  // Ensure body background is pure clean white while on Landing page
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

  // Interactive Edge & Tier Calculator State
  const [winRate, setWinRate] = useState(58); // 58%
  const [riskReward, setRiskReward] = useState(2.2); // 1:2.2 R:R
  const [weeklyTrades, setWeeklyTrades] = useState(12); // 12 trades/week

  // Interactive Partnership tier tab
  const [partnerTier, setPartnerTier] = useState('50k'); // '10k' | '25k' | '50k'

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
    let tierBg = '#F8FAFC';
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
      tierColor = '#E11D48';
      tierBg = '#FFF1F2';
      tierBorder = '#FDA4AF';
      tierIcon = Trophy;
    } else if (projectedBalance >= 4000) {
      tierName = 'Gold Sovereign';
      tierColor = '#EAB308';
      tierBg = '#FFFBEB';
      tierBorder = '#FCD34D';
      tierIcon = Award;
    } else if (projectedBalance >= 2000) {
      tierName = 'Silver Prover';
      tierColor = '#94A3B8';
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

  // FAQ Accordion State (0 opens first by default)
  const [openFaq, setOpenFaq] = useState(0);

  // Smooth scroll helper
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
        background: 'rgba(255, 255, 255, 0.96)',
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
            <button onClick={() => scrollTo('how-it-works')} style={navLinkStyle}>Overview</button>
            <button onClick={() => scrollTo('decagon-protocol')} style={navLinkStyle}>Proving Tiers</button>
            <button onClick={() => scrollTo('ib-partnership')} style={navLinkStyle}>Partnership</button>
            <button onClick={() => scrollTo('execution-engine')} style={navLinkStyle}>Platforms</button>
            <button onClick={() => scrollTo('the-crisis')} style={navLinkStyle}>Philosophy</button>
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
              fontWeight: 900,
              color: '#052e16',
              textDecoration: 'none',
              background: '#00DF81',
              boxShadow: '0 4px 16px rgba(0, 223, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <span>Start Proving ($1,000 Baseline)</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ─── 2. HERO SECTION: MONUMENTAL WIDE CELESTIAL HORIZON & MANIFESTO ─── */}
      <section style={{
        position: 'relative',
        padding: '54px 0 0 0',
        width: '100%',
        margin: '0',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Soft Ambient Ethereal Glow behind Header */}
        <div style={{
          position: 'absolute',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '980px',
          height: '460px',
          background: 'radial-gradient(circle, rgba(0, 223, 129, 0.18) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          {/* Trustpilot Style Verified Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: '#F0FDF4',
            border: '1.5px solid #00DF81',
            color: '#047857',
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            marginBottom: '18px',
            boxShadow: '0 2px 14px rgba(0, 223, 129, 0.2)',
            maxWidth: '100%'
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} style={{ color: '#00DF81', fontSize: '13px' }}>{star}</span>
              ))}
            </div>
            <span>NONSTOCK // MATHEMATICAL PROVING PROTOCOL</span>
          </div>

          {/* Monumental Headline Inspired by JCTRADER */}
          <h1 style={{
            fontSize: 'clamp(32px, 5.8vw, 84px)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-1.5px',
            color: '#0F172A',
            maxWidth: '1180px',
            margin: '0 auto 18px auto',
            wordBreak: 'break-word'
          }}>
            Redefining the Future of Trading. <br />
            <span style={{
              background: 'linear-gradient(135deg, #047857 0%, #00DF81 50%, #05CD77 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Prove Your True Market Edge.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 1.35vw, 21px)',
            color: '#475569',
            lineHeight: 1.65,
            maxWidth: '920px',
            margin: '0 auto 28px auto',
            fontWeight: 500
          }}>
            Every trader starts with an identical <strong>$1,000 verified baseline capital</strong>. 0 Tips, 0 Fake Screenshot PnL. Access Forex, Indices, Commodities, Metals, Equities, and Cryptos backed by undeniable mathematical proof.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <Link
              to="/register"
              style={{
                padding: '16px 42px',
                borderRadius: '999px',
                background: '#00DF81',
                color: '#052e16',
                fontSize: '16px',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(0, 223, 129, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 223, 129, 0.6)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 223, 129, 0.45)'; }}
            >
              <span>Start Proving ($1,000 Baseline)</span>
              <ArrowRight size={18} />
            </Link>

            <button
              onClick={() => scrollTo('decagon-protocol')}
              style={{
                padding: '16px 28px',
                borderRadius: '999px',
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#0F172A',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00DF81'; e.currentTarget.style.color = '#047857'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
            >
              <Trophy size={16} color="#05CD77" />
              <span>Explore Decagon Tiers</span>
            </button>
          </div>
        </div>

        {/* ─── MONUMENTAL WIDE CELESTIAL HORIZON (MATCHING JCTRADER SCREENSHOT 1 & 2!) ─── */}
        <div style={{
          position: 'relative',
          width: '100%',
          marginTop: '-16px',
          overflow: 'hidden'
        }}>
          {/* Real-Time Celestial Projection Spanning the Screen Width */}
          <CelestialEngine mode="hero" style={{ height: '640px', width: '100%' }} />

          {/* Bottom Floating Stats Bar (Matching JCTRADER screenshot 1 & 2!) */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px 32px',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 45%, #FFFFFF 100%)',
            borderTop: '1px solid rgba(226, 232, 240, 0.7)'
          }}>
            <div style={{
              maxWidth: '1320px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.8px' }}>
                    $1,000
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
                    Universal Proving Baseline
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '30px', fontWeight: 900, color: '#00DF81', letterSpacing: '-0.8px' }}>
                    1:50
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
                    Trading Leverage Cap
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.8px' }}>
                    0.0 SPREAD
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
                    Raw Institutional Execution
                  </div>
                </div>
              </div>

              <div 
                onClick={() => scrollTo('how-it-works')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#047857',
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                <span>SCROLL DOWN</span>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  border: '1.5px solid #00DF81',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ChevronDown size={17} color="#047857" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SECTION 2: YOUR FUNDING STARTS HERE / YOUR PROVING JOURNEY STARTS HERE (MATCHING SCREENSHOT 2) ─── */}
      <section id="how-it-works" style={{
        padding: '90px 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 56px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 18px',
              borderRadius: '999px',
              background: '#F0FDF4',
              border: '1.5px solid #00DF81',
              color: '#047857',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <span>EVALUATION PROTOCOL</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(34px, 4.2vw, 52px)',
              fontWeight: 900,
              letterSpacing: '-1.4px',
              color: '#0F172A',
              margin: '0 0 16px 0',
              lineHeight: 1.15
            }}>
              Your Funding Starts Here
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.65 }}>
              Go through our straightforward evaluation steps to prove your trading edge and unlock institutional capital allocation.
            </p>
          </div>

          {/* 3 Horizontal High-Impact Step Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                step: '01',
                title: 'Sign Up & Claim $1,000 Baseline',
                desc: 'Instant zero-fee registration. Receive $1,000 in mathematically verified proving capital with zero personal capital risked.',
                icon: ShieldCheck,
                color: '#00DF81',
                badgeBg: '#F0FDF4'
              },
              {
                step: '02',
                title: 'Execute with Strict Risk Discipline',
                desc: 'Execute real-time trades across crypto, metals, forex, and equities. Maintain Stop-Loss compliance to earn Gold Coins.',
                icon: Zap,
                color: '#05CD77',
                badgeBg: '#F0FDF4'
              },
              {
                step: '03',
                title: 'Scale Decagon Tiers & Receive Allocation',
                desc: 'Advance from Contender to Apex Operator, earn rare bounties, and qualify for up to 90% institutional profit splits.',
                icon: Trophy,
                color: '#047857',
                badgeBg: '#ECFDF5'
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '24px',
                    padding: '36px 30px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00DF81'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 223, 129, 0.15)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.02)'; }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: step.badgeBg,
                        border: `1.5px solid ${step.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: step.color
                      }}>
                        <Icon size={24} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px' }}>
                        STEP {step.step}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4. SECTION 3: CHOOSE YOUR ACCOUNT / CHOOSE YOUR PROVING TIER (MATCHING SCREENSHOT 2) ─── */}
      <section id="decagon-protocol" style={{
        padding: '100px 24px',
        background: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 60px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 18px',
              borderRadius: '999px',
              background: '#F0FDF4',
              border: '1.5px solid #00DF81',
              color: '#047857',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <span>START YOUR CHALLENGE</span>
            </div>

            <h2 style={{ fontSize: 'clamp(36px, 4.4vw, 56px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '0 0 16px 0', lineHeight: 1.1 }}>
              Choose Your Account
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.7, fontWeight: 400 }}>
              No time limits on the challenge. Select an account that matches your trading style and prove your mathematical edge.
            </p>
          </div>

          {/* Grid of Challenge Accounts Matching Screenshot 2 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              {
                badge: 'Instant Funding',
                targetTitle: '$1,000 Capital Baseline',
                badgeColor: '#00DF81',
                badgeBg: '#F0FDF4',
                borderColor: '#00DF81',
                features: [
                  'Up to 90% Profit Split',
                  '0 Weeks Duration',
                  'Available Assets: All',
                  '1:50 Institutional Cap',
                  'Instant Access / Full Refund'
                ],
                recommended: true
              },
              {
                badge: '1 Step Prover',
                targetTitle: '$2,000 Capital Tier',
                badgeColor: '#64748B',
                badgeBg: '#F8FAFC',
                borderColor: '#CBD5E1',
                features: [
                  'Up to 90% Profit Split',
                  '6% Proving Profit Target',
                  '4% Max Daily Loss',
                  '8% Max Total Loss',
                  '24-Hour Evaluation'
                ],
                recommended: false
              },
              {
                badge: '2 Step Sovereign',
                targetTitle: '$5,000 Capital Tier',
                badgeColor: '#EAB308',
                badgeBg: '#FEF9C3',
                borderColor: '#FACC15',
                features: [
                  'Up to 90% Profit Split',
                  'Phase 1: 8% Target / Phase 2: 5%',
                  '5% Max Daily Drawdown',
                  '10% Overall Max Loss',
                  'Bi-Weekly Payouts'
                ],
                recommended: false
              },
              {
                badge: 'Elite Master Titan',
                targetTitle: '$10,000 Capital Tier',
                badgeColor: '#E11D48',
                badgeBg: '#FFE4E6',
                borderColor: '#FDA4AF',
                features: [
                  'Up to 90% Profit Split',
                  'Phase 1: 8% Target / Phase 2: 5%',
                  'Expert Advisor / Algo Friendly',
                  '10% Max Drawdown Cap',
                  'High Volume Execution'
                ],
                recommended: false
              }
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: card.recommended ? '2px solid #00DF81' : '1.5px solid #E2E8F0',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: card.recommended ? '0 12px 35px rgba(0, 223, 129, 0.16)' : '0 4px 20px rgba(0,0,0,0.02)',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#00DF81'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = card.recommended ? '#00DF81' : '#E2E8F0'; }}
              >
                {card.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#00DF81',
                    color: '#052e16',
                    fontSize: '10px',
                    fontWeight: 900,
                    letterSpacing: '0.8px',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    textTransform: 'uppercase'
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: card.badgeBg,
                      border: `1.5px solid ${card.badgeColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.badgeColor
                    }}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                        {card.badge}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
                        {card.targetTitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: '#F1F5F9', margin: '20px 0' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {card.features.map((feat, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#F0FDF4',
                          border: '1.5px solid #00DF81',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={11} color="#047857" />
                        </div>
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '28px' }}>
                  <Link
                    to="/register"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '13px',
                      borderRadius: '12px',
                      background: '#00DF81',
                      color: '#052e16',
                      fontWeight: 900,
                      fontSize: '14px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 16px rgba(0, 223, 129, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 223, 129, 0.5)'}
                    onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 223, 129, 0.3)'}
                  >
                    <span>Start Challenge</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 5. SECTION 4: IB & PARTNERSHIP PROGRAM (MATCHING SCREENSHOT 2) ─── */}
      <section id="ib-partnership" style={{
        padding: '100px 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 60px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 18px',
              borderRadius: '999px',
              background: '#F0FDF4',
              border: '1.5px solid #00DF81',
              color: '#047857',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <span>PARTNERSHIP</span>
            </div>

            <h2 style={{ fontSize: 'clamp(36px, 4.4vw, 54px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '0 0 16px 0', lineHeight: 1.15 }}>
              IB & Partnership Program
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.65 }}>
              Earn with our high-paying multi-tier affiliate and institutional partner program designed to reward performance and trading network growth.
            </p>
          </div>

          {/* 3 High-Tech Bento Partner Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {/* Card 1: Tiered Commissions */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {['10k', '25k', '50k'].map(t => (
                    <button
                      key={t}
                      onClick={() => setPartnerTier(t)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: partnerTier === t ? '1.5px solid #00DF81' : '1px solid #CBD5E1',
                        background: partnerTier === t ? '#F0FDF4' : '#FFFFFF',
                        color: partnerTier === t ? '#047857' : '#64748B',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      ${t === '10k' ? '10,000' : t === '25k' ? '25,000' : '50,000'}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: '11px', fontWeight: 800, color: '#00DF81', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  COMMISSION STRUCTURE
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '4px 0 10px 0' }}>
                  Tiered Commissions & Rebate Payouts
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                  Earn up to 20% on every qualified prover entry. Automatic daily settlement via crypto or bank wire with zero holdbacks.
                </p>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                  <span>Estimated Monthly Payout</span>
                  <strong style={{ color: '#00DF81', fontSize: '16px' }}>
                    {partnerTier === '50k' ? '$4,800.00' : partnerTier === '25k' ? '$2,250.00' : '$950.00'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Card 2: Balance & Payout Analytics */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}>
              <div>
                {/* Visual SVG Spline Curve in Bright Green */}
                <div style={{ height: '90px', width: '100%', marginBottom: '16px' }}>
                  <svg viewBox="0 0 300 80" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00DF81" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#00DF81" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 65 Q 60 55, 110 40 T 210 25 T 300 8 L 300 80 L 0 80 Z" fill="url(#chartGrad)" />
                    <path d="M 0 65 Q 60 55, 110 40 T 210 25 T 300 8" fill="none" stroke="#00DF81" strokeWidth="3" />
                  </svg>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 800, color: '#00DF81', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  ANALYTICS MIRROR
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '4px 0 10px 0' }}>
                  Balance & Payout Analytics
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                  Real-time reporting on partner volume, conversion rates, click-through attribution, and net payout trajectories.
                </p>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#047857', fontWeight: 800 }}>LIVE DATA STREAM</span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Updated Every 60s</span>
              </div>
            </div>

            {/* Card 3: Real-Time Earnings Tracking */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ padding: '8px 12px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Apex-Prover Mirror</span>
                    <strong style={{ color: '#00DF81' }}>+$1,420.00</strong>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>Sovereign-Desk IB</span>
                    <strong style={{ color: '#00DF81' }}>+$850.00</strong>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 800, color: '#00DF81', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  INSTANT SETTLEMENT
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '4px 0 10px 0' }}>
                  Real-Time Earnings Tracking
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                  Automated payout smart contracts ensure you never have to wait weeks for commissions. One-click instant withdrawal.
                </p>
              </div>

              <div style={{ marginTop: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, background: '#F0FDF4', color: '#047857', border: '1px solid #00DF81', padding: '4px 10px', borderRadius: '6px' }}>
                  100% UNTETHERED COMMISSION
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '15px 36px',
                borderRadius: '999px',
                background: '#00DF81',
                color: '#052e16',
                fontSize: '15px',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(0, 223, 129, 0.4)'
              }}
            >
              <span>Become an Institutional Partner</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── 6. SECTION 5: EXECUTION ENGINE & MINTED GOLD COIN (MATCHING SCREENSHOT 2) ─── */}
      <section id="execution-engine" style={{
        padding: '110px 24px',
        background: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 60px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 18px',
              borderRadius: '999px',
              background: '#F0FDF4',
              border: '1.5px solid #00DF81',
              color: '#047857',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              <span>EXECUTION PROTOCOL</span>
            </div>

            <h2 style={{ fontSize: 'clamp(36px, 4.4vw, 56px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '0 0 16px 0', lineHeight: 1.15 }}>
              NonStock Execution Engine — Unmatched Reliability Across The Industry
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.7 }}>
              Sub-millisecond order routing against tier-1 interbank liquidity. No slippage, zero broker conflict of interest, and full MT5 terminal compatibility.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}>
            {/* Left Column: 4 Feature Blocks with Bright Green Checkmark Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                {
                  title: 'Ultra-Fast Order Execution',
                  desc: 'Sub-12ms latency order execution with direct access to Tier-1 multi-asset liquidity pools.'
                },
                {
                  title: 'Advanced Charting & Technical Analysis Tools',
                  desc: 'Complete TradingView technical suite with 100+ native indicators, drawing sets, and multi-timeframe candle sync.'
                },
                {
                  title: 'Multi-Device Compatibility',
                  desc: 'Seamless execution across web terminal, desktop, tablet, and mobile browsers with continuous portfolio synchronization.'
                },
                {
                  title: 'Support for Automated Trading & Expert Advisors',
                  desc: 'Execute algorithmic scripts, Python quantitative models, and MT5 Expert Advisors via open NonStock websocket APIs.'
                }
              ].map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid #E2E8F0',
                    padding: '24px 28px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '18px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00DF81'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#F0FDF4',
                    border: '1.5px solid #00DF81',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#047857',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <CheckCircle2 size={18} color="#00DF81" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                      {feat.title}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Minted 1K Gold Coin with Concentric Neon Green HUD Rings */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              background: 'radial-gradient(circle, #F0FDF4 0%, #FFFFFF 70%)',
              borderRadius: '28px',
              border: '1.5px solid #00DF81',
              boxShadow: '0 20px 50px -10px rgba(0, 223, 129, 0.25)',
              position: 'relative'
            }}>
              <div style={{ position: 'relative' }}>
                <GoldCoin1K size={320} showRings={true} animated={true} />
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                  OFFICIAL NONSTOCK PROTOCOL MINT
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                  The 1K Sovereign Gold Coin
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', maxWidth: '340px' }}>
                  Representing universal baseline equity and earned through verified daily operational discipline.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. SECTION 6: THE CRISIS & PHILOSOPHY (KNOW YOURSELF // SETTLE WHO IS BETTER) ─── */}
      <section id="the-crisis" style={{
        padding: '100px 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ maxWidth: '880px', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: '#F0FDF4',
              border: '1px solid #00DF81',
              color: '#047857',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <span>INDUSTRY INTEGRITY AUDIT // THE PROVING IMPERATIVE</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(34px, 4.2vw, 54px)',
              fontWeight: 900,
              letterSpacing: '-1.4px',
              color: '#0F172A',
              margin: '0 0 20px 0',
              lineHeight: 1.15
            }}>
              The Collapse of Trust in Trading: Why 95% Are Deceived by Optical Illusions.
            </h2>
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: 1.8, fontWeight: 400 }}>
              Look at any social trading feed today. You will find thousands of accounts claiming 90% win rates, showing six-figure PnL screenshots, and selling private signal access. Yet over 95% of retail accounts lose money consistently. How does this deception persist?
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '30px',
            lineHeight: 1.7
          }}>
            <div style={{
              background: '#F8FAFC',
              padding: '36px',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                SYSTEMIC FLAW 01 // RETROACTIVE EDITING
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>
                The Asymmetric Deletion Game
              </h3>
              <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>
                Signal channels routinely post 10 different speculative calls in both directions. When the market moves, they silently delete or edit the losing calls while blasting celebratory alerts on the single winner. Followers remember the winning post, while their real trading accounts bleed to zero.
              </p>
            </div>

            <div style={{
              background: '#F8FAFC',
              padding: '36px',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                SYSTEMIC FLAW 02 // INSPECT-ELEMENT WEALTH
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>
                Faked HTML and Photoshop Slips
              </h3>
              <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>
                Modern browser developer tools make it trivial to change a $20 balance into $200,000 in three keystrokes. Fake brokers and cracked trading terminals generate synthetic account statements designed solely to deceive prospective students into buying expensive courses.
              </p>
            </div>

            <div style={{
              background: '#F8FAFC',
              padding: '36px',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                SYSTEMIC FLAW 03 // SURVIVORSHIP BIAS
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>
                Blind Leverage Disguised as Genius
              </h3>
              <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>
                A trader who opens a 50x leverage position with zero stop-loss will appear to be a prodigy during a strong trend. But mathematically, their expected value is strictly negative. When the inevitable mean-reversion arrives, the account is vaporized in a single candle.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 8. SECTION 7: GENERAL QUESTIONS (FAQ) (MATCHING SCREENSHOT 2 TWO-COLUMN LAYOUT) ─── */}
      <section id="faq" style={{
        padding: '100px 24px',
        background: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
            gap: '60px',
            alignItems: 'flex-start'
          }}>
            {/* Left Column: FAQ Badge + Title + Subtitle + Bright Green Action Button */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '999px',
                background: '#F0FDF4',
                border: '1.5px solid #00DF81',
                color: '#047857',
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                <span>FAQ</span>
              </div>

              <h2 style={{
                fontSize: 'clamp(36px, 4.4vw, 54px)',
                fontWeight: 900,
                letterSpacing: '-1.4px',
                color: '#0F172A',
                margin: '0 0 18px 0',
                lineHeight: 1.12
              }}>
                General Questions
              </h2>

              <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.7, marginBottom: '32px' }}>
                Everything you need to know about NonStock, proving rules, baseline capital, and tier progression. Have a custom question?
              </p>

              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 30px',
                  borderRadius: '12px',
                  background: '#00DF81',
                  color: '#052e16',
                  fontSize: '15px',
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(0, 223, 129, 0.35)'
                }}
              >
                <span>Ask A Question / Help Desk</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Column: Clean Accordion Questions with Plus/Minus Expand */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                {
                  q: "Already have an account with NonStock?",
                  a: "Existing account holders can simply sign in via the 'Sign In' button on the navbar. You will be routed directly to your personal executive proving desk, performance tracking hub, and live trading arena with active market sessions."
                },
                {
                  q: "What assets can I trade on NonStock?",
                  a: "You have real-time access to Forex major pairs, Spot Gold & Silver, WTI Crude Oil, Bitcoin, Ethereum, Solana, and top US Equities (Apple, Nvidia, Tesla, SPY). All tick feeds are streamed directly from live institutional liquidity."
                },
                {
                  q: "How fast are deposits or withdrawals calculated?",
                  a: "Simulated baseline equity updates instantly on every market tick. Payout vouchers and tier advancement certificates are mathematically audited and issued within 24 hours of target completion."
                },
                {
                  q: "Is NonStock regulated and secure?",
                  a: "NonStock operates strictly as a skill verification simulator and mathematical proving sandbox. We do not accept real-money customer deposits or pool investment funds, ensuring 100% compliance with global regulatory regimes while keeping your personal capital completely safe."
                },
                {
                  q: "What trading platform or terminal is used?",
                  a: "NonStock provides a proprietary browser-based Trading Arena featuring full TradingView charting, real-time depth order book, stop-loss protection metrics, and cross-platform mobile compatibility."
                }
              ].map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: isOpen ? '1.5px solid #00DF81' : '1px solid #E2E8F0',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                      boxShadow: isOpen ? '0 4px 20px rgba(0, 223, 129, 0.1)' : '0 2px 8px rgba(0,0,0,0.02)'
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
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                        {item.q}
                      </span>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isOpen ? '#F0FDF4' : '#F8FAFC',
                        border: isOpen ? '1.5px solid #00DF81' : '1px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isOpen ? '#047857' : '#64748B',
                        flexShrink: 0
                      }}>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 24px 20px 24px', fontSize: '14px', color: '#475569', lineHeight: 1.7, borderTop: '1px solid #F1F5F9' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ─── 9. SECTION 8: TEST YOUR SKILLS IN FREE ENTRY COMPETITIONS (MATCHING SCREENSHOT 2) ─── */}
      <section style={{
        padding: '60px 24px 100px 24px',
        background: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00DF81 0%, #05CD77 50%, #047857 100%)',
            borderRadius: '32px',
            padding: '54px 50px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 223, 129, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '32px'
          }}>
            {/* Ambient Background Decorative Grid Lines */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.5,
              pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(8px)',
                color: '#052e16',
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                <Trophy size={14} color="#052e16" />
                <span>GET CHANCE TO WIN // FREE ADMISSION</span>
              </div>

              <h2 style={{
                fontSize: 'clamp(32px, 4.2vw, 48px)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-1.4px',
                margin: '0 0 16px 0',
                color: '#052e16'
              }}>
                Test Your Skills in Free Entry Competitions
              </h2>

              <p style={{
                fontSize: '16px',
                color: '#052e16',
                lineHeight: 1.6,
                marginBottom: '28px',
                fontWeight: 600,
                opacity: 0.9
              }}>
                Compete against thousands of global market operators on an equal $1,000 baseline. Top ranked performers receive funded capital tiers and physical minted Gold Coins.
              </p>

              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 36px',
                  borderRadius: '999px',
                  background: '#052e16',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(5, 46, 22, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>Register Free / Join Cup</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Graphic: Crown & Trophy Symbol */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(16px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
              }}>
                <Crown size={96} color="#052e16" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. HIGH-PROFILE INSTITUTIONAL FOOTER ─── */}
      <footer style={{
        background: '#0B0F19',
        color: '#64748B',
        padding: '60px 24px 30px 24px',
        borderTop: '1px solid #1E293B',
        fontSize: '13px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px', marginBottom: '40px' }}>
          <div>
            <Logo size={32} showName={true} showTagline={false} nameSize="20px" />
            <p style={{ marginTop: '12px', maxWidth: '340px', lineHeight: 1.6 }}>
              The global verifiable proving protocol. Transforming trading discipline into certified, mathematically auditable credentials without real monetary risk.
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

        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            © {new Date().getFullYear()} NonStock Protocol. Built for true market discipline.
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            Educational and skill verification simulator. No real money deposits or investments accepted.
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
