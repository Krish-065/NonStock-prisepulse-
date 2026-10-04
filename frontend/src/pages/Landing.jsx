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
  SlidersHorizontal, RefreshCw, FileCheck2, Share2, ExternalLink
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
      tierColor = '#A855F7'; // Neon bright purple
      tierBg = '#FAF5FF';
      tierBorder = '#C084FC';
      tierIcon = Crown;
    } else if (projectedBalance >= 8000) {
      tierName = 'Master Titan';
      tierColor = '#E11D48'; // Ruby bright red
      tierBg = '#FFF1F2';
      tierBorder = '#FDA4AF';
      tierIcon = Trophy;
    } else if (projectedBalance >= 4000) {
      tierName = 'Gold Sovereign';
      tierColor = '#EAB308'; // Yellow gold bright
      tierBg = '#FFFBEB';
      tierBorder = '#FCD34D';
      tierIcon = Award;
    } else if (projectedBalance >= 2000) {
      tierName = 'Silver Prover';
      tierColor = '#94A3B8'; // Silver color
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
            <button onClick={() => scrollTo('the-crisis')} style={navLinkStyle}>The Problem</button>
            <button onClick={() => scrollTo('philosophy')} style={navLinkStyle}>The Philosophy</button>
            <button onClick={() => scrollTo('tipsters-educators')} style={navLinkStyle}>For Tipsters & Mentors</button>
            <button onClick={() => scrollTo('execution-engine')} style={navLinkStyle}>Execution Engine</button>
            <button onClick={() => scrollTo('decagon-protocol')} style={navLinkStyle}>Decagon Tiers</button>
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
              background: '#00D26A',
              boxShadow: '0 4px 14px rgba(0, 210, 106, 0.35)',
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

      {/* ─── 2. HERO SECTION: WIDE PANORAMIC CELESTIAL EARTH & OVERLAID MANIFESTO ─── */}
      <section style={{
        position: 'relative',
        minHeight: '94vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '50px 24px 0 24px',
        boxSizing: 'border-box',
        background: 'radial-gradient(ellipse at top, #F0FDF4 0%, #FFFFFF 65%)'
      }}>
        {/* Full-Width Panoramic Celestial Earth & Real-Time Revolving Sun Engine */}
        <CelestialEngine mode="hero" />

        {/* Soft Ambient Ethereal Glow behind Header & Sun Horizon */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(0, 210, 106, 0.16) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Hero Content Overlaid Directly Over the Majestic Earth Crest */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: '20px',
          pointerEvents: 'auto'
        }}>
          {/* Trustpilot Style Verified Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 22px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #86EFAC',
            color: '#008736',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '22px',
            boxShadow: '0 4px 18px rgba(0, 210, 106, 0.22)'
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} style={{ color: '#00D26A', fontSize: '13px' }}>{star}</span>
              ))}
            </div>
            <span>NONSTOCK // 100% UNALTERABLE MATHEMATICAL PROVING PROTOCOL</span>
          </div>

          {/* Monumental Headline Centered Over The Earth Dome */}
          <h1 style={{
            fontSize: 'clamp(44px, 5.8vw, 84px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            color: '#0F172A',
            maxWidth: '1160px',
            margin: '0 auto 20px auto'
          }}>
            Redefining the Future of Trading. <br />
            <span style={{
              background: 'linear-gradient(135deg, #00A843 0%, #00D26A 50%, #00E676 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 24px rgba(0, 210, 106, 0.28)'
            }}>
              Prove Your True Market Edge.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 1.35vw, 21px)',
            color: '#0F172A',
            lineHeight: 1.65,
            maxWidth: '920px',
            margin: '0 auto 36px auto',
            fontWeight: 600,
            textShadow: '0 1px 8px rgba(255, 255, 255, 0.95), 0 2px 18px #FFFFFF'
          }}>
            Every trader starts with an identical <strong style={{ color: '#008736' }}>$1,000 verified baseline capital</strong>. 0 Tips, 0 Fake Screenshot PnL. Access Forex, Indices, Commodities, Metals, Equities, and Cryptos backed by undeniable mathematical proof.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Link
              to="/register"
              style={{
                padding: '16px 40px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #00D26A 0%, #00C853 100%)',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(0, 210, 106, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 210, 106, 0.6)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 210, 106, 0.45)'; }}
            >
              <span>Start Proving ($1,000 Baseline)</span>
              <ArrowRight size={17} />
            </Link>

            <button
              onClick={() => scrollTo('decagon-protocol')}
              style={{
                padding: '16px 30px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid #CBD5E1',
                color: '#0F172A',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00D26A'; e.currentTarget.style.color = '#009E47'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
            >
              <Trophy size={16} color="#00D26A" />
              <span>Explore Decagon Tiers</span>
            </button>
          </div>
        </div>

        {/* ─── DOCKED STATS BAR ALONG THE BASE OF THE EARTH & TRADING PILLARS ─── */}
        <div style={{
          position: 'relative',
          zIndex: 15,
          width: '100%',
          maxWidth: '1380px',
          margin: '0 auto',
          padding: '24px 36px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.96) 45%, #FFFFFF 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
          borderTop: '1px solid rgba(0, 210, 106, 0.2)'
        }}>
          <div style={{ display: 'flex', gap: '44px', flexWrap: 'wrap', textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                $1,000
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
                Universal Proving Baseline
              </div>
            </div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#00D26A', letterSpacing: '-0.5px' }}>
                100+
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
                Live Global Tickers
              </div>
            </div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                0.0 SPREAD
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
                Raw Institutional Execution
              </div>
            </div>
          </div>

          <div 
            onClick={() => scrollTo('your-proving-starts-here')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#009E47',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            <span>SCROLL DOWN</span>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#F0FDF4',
              border: '1.5px solid #00D26A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 210, 106, 0.25)'
            }}>
              <ChevronDown size={17} color="#00D26A" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2B. SECTION: YOUR PROVING STARTS HERE (MATCHING JCTRADER "YOUR FUNDING STARTS HERE" IMAGE 2) ─── */}
      <section id="your-proving-starts-here" style={{
        padding: '70px 24px 60px 24px',
        maxWidth: '1380px',
        margin: '0 auto',
        background: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            color: '#008736',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}>
            <span>EQUAL FOOTING FOR ALL TRADERS</span>
          </div>

          <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 48px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#0F172A', margin: '0 0 14px 0', lineHeight: 1.15 }}>
            Your Proving Ground Starts Here
          </h2>
          <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.6, fontWeight: 500 }}>
            Every tool, rule, and liquidity stream is built for undeniable mathematical proof of real trading ability.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1: 100% Unalterable Proof */}
          <div style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
            padding: '36px 30px',
            borderRadius: '24px',
            border: '1.5px solid #86EFAC',
            boxShadow: '0 8px 30px rgba(0, 210, 106, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: '#00D26A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 6px 18px rgba(0, 210, 106, 0.35)'
            }}>
              <ShieldCheck size={28} color="#FFFFFF" />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#008736', textTransform: 'uppercase', letterSpacing: '1px' }}>
              PILLAR 01 // ANTI-FRAUD STANDARD
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '8px 0 12px 0' }}>
              100% Unalterable Proof
            </h3>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              Zero inspect-element fakes. Every trade, execution price, and drawdown is immutably recorded against live exchange tick feeds with verified cryptographic hashes.
            </p>
          </div>

          {/* Card 2: Identical $1,000 Baseline */}
          <div style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
            padding: '36px 30px',
            borderRadius: '24px',
            border: '1.5px solid #86EFAC',
            boxShadow: '0 8px 30px rgba(0, 210, 106, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: '#00D26A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 6px 18px rgba(0, 210, 106, 0.35)'
            }}>
              <Target size={28} color="#FFFFFF" />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#008736', textTransform: 'uppercase', letterSpacing: '1px' }}>
              PILLAR 02 // UNIVERSAL BENCHMARK
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '8px 0 12px 0' }}>
              Identical $1,000 Baseline
            </h3>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              No billionaire advantages or pay-to-win tricks. Everyone starts with the exact same verified $1,000 capital. True skill is measured by percentage edge and drawdown control.
            </p>
          </div>

          {/* Card 3: Institutional Zero-Spread Execution */}
          <div style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
            padding: '36px 30px',
            borderRadius: '24px',
            border: '1.5px solid #86EFAC',
            boxShadow: '0 8px 30px rgba(0, 210, 106, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: '#00D26A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 6px 18px rgba(0, 210, 106, 0.35)'
            }}>
              <Zap size={28} color="#FFFFFF" />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#008736', textTransform: 'uppercase', letterSpacing: '1px' }}>
              PILLAR 03 // INSTITUTIONAL LIQUIDITY
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '8px 0 12px 0' }}>
              Raw Institutional Execution
            </h3>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              Sub-millisecond order routing with raw inter-bank liquidity across Forex, Indices, Commodities, and Crypto. 0 synthetic lag, 0 broker manipulation.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. SECTION: THE PROBLEM IN MODERN TRADING (CLEAN WHITE & GREEN THEME) ─── */}
      <section id="the-crisis" style={{
        padding: '100px 24px',
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
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
              border: '1px solid #86EFAC',
              color: '#006C2E',
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
              background: '#FFFFFF',
              padding: '36px',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#009E47', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
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
              background: '#FFFFFF',
              padding: '36px',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#009E47', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
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
              background: '#FFFFFF',
              padding: '36px',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#009E47', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
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

          <div style={{
            marginTop: '44px',
            padding: '24px 32px',
            background: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#009E47', letterSpacing: '1px', textTransform: 'uppercase' }}>
                THE NONSTOCK VERIFICATION STANDARD
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                An un-fakeable proving ledger where every order, stop-loss, and drawdown is mathematically locked against live exchange feeds.
              </div>
            </div>

            <Link
              to="/register"
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                background: '#00D26A',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 210, 106, 0.3)'
              }}
            >
              Start Proving On Equal $1,000 Baseline
            </Link>
          </div>

        </div>
      </section>

      {/* ─── 4. SECTION: THE PHILOSOPHY (KNOW YOURSELF // SETTLE WHO IS BETTER) ─── */}
      <section id="philosophy" style={{
        padding: '110px 24px',
        background: '#FFFFFF',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Sub-Section 1: Know Yourself paired with Performance Telemetry Image */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '56px',
          alignItems: 'center',
          marginBottom: '110px'
        }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#00D26A', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              THE PSYCHOLOGICAL DIAGNOSTIC
            </span>
            <h2 style={{ fontSize: 'clamp(34px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '12px 0 24px 0', lineHeight: 1.15 }}>
              Know Yourself: The Quantitative Diagnostic Mirror.
            </h2>
            
            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '20px' }}>
              Most unprofitable traders believe they need a better indicator or a secret entry formula. In reality, they are destroyed by undisciplined risk: widening stop losses during drawdowns, revenge trading after a red morning, and closing winning runners prematurely out of anxiety.
            </p>

            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '24px' }}>
              <strong>NonStock is your psychological diagnostic mirror.</strong> Every participant begins with an identical $1,000 baseline. NonStock calculates your real-time Discipline and Edge Rating (DER Score), measuring your positive mathematical expectancy, your risk-to-reward ratio, and your drawdown velocity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={20} color="#00D26A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block' }}>Objective Mathematical Self-Discovery</strong>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Discover whether your strategy possesses genuine statistical edge or merely fleeting luck before risking real life savings.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={20} color="#00D26A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block' }}>Drawdown Velocity Monitoring</strong>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Expose emotional revenge trading and over-leveraged sizing before capital is irreparably destroyed.</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <span>Diagnose Your True Edge ($1,000 Free Baseline)</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.12)',
            border: '2px solid #E2E8F0',
            background: '#0F172A'
          }}>
            <img 
              src="/assets/performance_analysis.jpg" 
              alt="NonStock Quantitative Performance and Equity Telemetry Analysis" 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px 24px', background: '#0F172A', color: '#FFFFFF' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#00D26A', letterSpacing: '1px', textTransform: 'uppercase' }}>
                QUANTITATIVE TELEMETRY // DER SCORE ENGINE
              </div>
              <div style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                Mathematical analysis of Sharpe-derived expectancy, win/loss ratio, and peak drawdown containment.
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Section 2: Settle Who Is Truly Better paired with Decagon Protocol Crest */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '56px',
          alignItems: 'center'
        }}>
          <div style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.18)',
            border: '2px solid #E2E8F0',
            background: '#0F172A',
            order: 2
          }}>
            <img 
              src="/decagon_crest_aesthetic.jpg" 
              alt="NonStock Institutional Discipline Decagon Crest" 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px 24px', background: '#0F172A', color: '#FFFFFF', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#FACC15', letterSpacing: '1px', textTransform: 'uppercase' }}>
                THE UNFORGEABLE DECAGON CREST
              </div>
              <div style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                Earned strictly through positive expectancy and verified capital compounding from the $1,000 baseline.
              </div>
            </div>
          </div>

          <div style={{ order: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#00D26A', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              THE MERITOCRATIC ARENA
            </span>
            <h2 style={{ fontSize: 'clamp(34px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '12px 0 24px 0', lineHeight: 1.15 }}>
              Settle Who Is Truly Better: The Prover's Crucible.
            </h2>
            
            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '20px' }}>
              In traditional trading communities, comparisons are completely distorted by capital disparity. A wealthy trader can risk $50,000 per trade and make huge dollar profits while trading terribly, whereas a disciplined scalper with a $500 balance compounds consistently but remains ignored.
            </p>

            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '24px' }}>
              <strong>NonStock levels the playing field completely.</strong> Everyone starts on the exact same $1,000 capital baseline. There are no billionaire account advantages, no paid boost perks, and no shortcuts. The only metric that matters is how skillfully you compound capital and protect downside risk.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={20} color="#00D26A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block' }}>Zero Capital Favoritism</strong>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Skill is measured in percentage return, Sharpe stability, and risk-adjusted efficiency rather than brute account size.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={20} color="#00D26A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block' }}>Public Auditable Hall of Fame</strong>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>A public ledger where every trade, entry candle, and liquidation is open for verification.</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <span>Prove Your Skill On Equal $1,000 Footing</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </section>

      {/* ─── 5. SECTION: THE AUTHORITY WEAPON FOR TIPSTERS & EDUCATORS (REPLACED DASHBOARD IMAGE) ─── */}
      <section id="tipsters-educators" style={{
        padding: '110px 24px',
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '56px',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#009E47', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                THE PROFESSIONAL CREDIBILITY BREAKTHROUGH
              </span>
              <h2 style={{ fontSize: 'clamp(34px, 4vw, 50px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '12px 0 24px 0', lineHeight: 1.15 }}>
                The Ultimate Authority Weapon For Tipsters, Advisors & Trading Academies.
              </h2>
              
              <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '20px' }}>
                If you run a Telegram signal channel, a YouTube trading academy, or a financial advisory community, you are constantly fighting public skepticism. The internet assumes every signal provider is a charlatan who blows accounts in secret and cherry-picks winners.
              </p>

              <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '28px' }}>
                <strong>NonStock is your most powerful credibility engine.</strong> Instead of posting MT4/MT5 screenshots that smart followers distrust, you link your verified NonStock Prover ID in your bio. Show your audience that you execute your own setups on live exchange feeds with strict stop losses on an equal $1,000 baseline.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                  <strong style={{ fontSize: '16px', color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                    1. Silence Cynics With Cryptographic Proof
                  </strong>
                  <span style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                    Every setup you execute on NonStock is permanently time-stamped. No retroactive editing, no deleted losing trades. When doubters question your record, point them to your live NonStock ledger.
                  </span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                  <strong style={{ fontSize: '16px', color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                    2. Decagon Badges That Supercharge Subscriptions
                  </strong>
                  <span style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                    Displaying a verified Gold Sovereign, Master Titan, or Apex Operator Decagon crest on your social profile instantly establishes elite status, converting skeptical prospects into loyal paid subscribers.
                  </span>
                </div>

                <div style={{ background: '#FFFFFF', padding: '22px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                  <strong style={{ fontSize: '16px', color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                    3. Student Replication Benchmark
                  </strong>
                  <span style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                    Have your students trade your methodology on identical $1,000 NonStock accounts. When your students earn Decagon Silver and Gold badges, you possess indisputable proof that your mentorship actually produces winners.
                  </span>
                </div>
              </div>

              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  background: '#00D26A',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0, 210, 106, 0.3)'
                }}
              >
                <span>Claim Prover ID & Verify Your Credibility</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* BESPOKE NONSTOCK VERIFIED PROVER CREDENTIAL CARD (REPLACED GENERIC DASHBOARD) */}
            <div style={{
              background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
              borderRadius: '24px',
              padding: '36px',
              border: '2px solid #334155',
              boxShadow: '0 30px 70px -15px rgba(15, 23, 42, 0.35)',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top Accent Glow */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '260px',
                height: '260px',
                background: 'radial-gradient(circle, rgba(0, 210, 106, 0.18) 0%, rgba(15, 23, 42, 0) 70%)',
                pointerEvents: 'none'
              }} />

              {/* Verified Credential Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#00D26A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 210, 106, 0.4)'
                  }}>
                    <ShieldCheck size={26} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#00D26A', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      OFFICIAL NONSTOCK CREDENTIAL
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#FFFFFF' }}>
                      NonStock Verified Prover
                    </div>
                  </div>
                </div>

                {/* Decagon Gold Sovereign Badge */}
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1.5px solid #F59E0B',
                  color: '#FACC15',
                  fontSize: '12px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Award size={16} />
                  <span>Gold Sovereign Tier</span>
                </div>
              </div>

              {/* Verified Trade Setup Showcase */}
              <div style={{ background: '#0F172A', borderRadius: '16px', padding: '22px', border: '1px solid #334155', marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>XAU / USD</span>
                    <span style={{ fontSize: '11px', background: '#064E3B', color: '#6EE7B7', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>LONG EXECUTION</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#00D26A', fontFamily: 'var(--font-mono)' }}>
                    +3.80 R Realized
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', padding: '12px', background: '#1E293B', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>ENTRY TICK</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>$2,648.50</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>AUDITED SL</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FDA4AF', marginTop: '2px' }}>$2,636.00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>EXIT FILL</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#00D26A', marginTop: '2px' }}>$2,696.00</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '11px', color: '#94A3B8' }}>
                  <span>Tick Ledger Hash: <code style={{ color: '#00D26A', background: 'rgba(0, 210, 106, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>0x9e4f...72ac</code></span>
                  <span style={{ color: '#00D26A', fontWeight: 800 }}>Live Feed Verified</span>
                </div>
              </div>

              {/* Statistical Proof Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div style={{ background: '#0F172A', padding: '16px', borderRadius: '14px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>DER DISCIPLINE SCORE</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#00D26A', marginTop: '2px' }}>96.4 <span style={{ fontSize: '12px', color: '#64748B' }}>/ 100</span></div>
                  <div style={{ fontSize: '11px', color: '#00D26A', marginTop: '2px' }}>Top 0.5% Global Hierarchy</div>
                </div>

                <div style={{ background: '#0F172A', padding: '16px', borderRadius: '14px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>COMPOUNDED BASELINE</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>$4,380.00</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Started At $1,000 Equal Baseline</div>
                </div>
              </div>

              {/* Social Bio Integration Bar */}
              <div style={{
                padding: '12px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px dashed #475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1' }}>
                  <FileCheck2 size={16} color="#00D26A" />
                  <span>Public Proof Link: <strong>nonstock.io/p/NS-7429</strong></span>
                </div>
                <div style={{ color: '#00D26A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Verified On-Chain</span>
                  <Check size={14} />
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. SECTION: INSTITUTIONAL EXECUTION ENGINE & LIVE DATA ─── */}
      <section id="execution-engine" style={{
        padding: '110px 24px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Row 1: Real-Time Screener & Market Discovery */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '56px',
          alignItems: 'center',
          marginBottom: '100px'
        }}>
          <div style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.12)',
            border: '2px solid #E2E8F0',
            background: '#0B0F19',
            order: 2
          }}>
            <img 
              src="/assets/pro_screener.jpg" 
              alt="NonStock Institutional Real-Time Multi-Asset Screener" 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px 24px', background: '#0F172A', color: '#FFFFFF' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#00D26A', letterSpacing: '1px', textTransform: 'uppercase' }}>
                HIGH VELOCITY RADAR // 50+ LIVE PAIRS
              </div>
              <div style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                Scanning volatility, RSI divergence, 24h volume spikes, and breakout levels in real time.
              </div>
            </div>
          </div>

          <div style={{ order: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#00D26A', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              INTELLIGENCE & DISCOVERY
            </span>
            <h2 style={{ fontSize: 'clamp(34px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '12px 0 24px 0', lineHeight: 1.15 }}>
              Institutional Market Screener: Spot Momentum Before It Unfolds.
            </h2>
            
            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '20px' }}>
              True market operators do not blindly guess which chart to trade. NonStock equips you with a real-time institutional screener that monitors over 50 global pairs across crypto majors, foreign exchange, spot gold/silver, and premier tech equities.
            </p>

            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '24px' }}>
              Filter by 24h percentage delta, high/low ranges, and momentum triggers. One click transitions you directly into the NonStock trading arena with the selected asset loaded and ready for precision execution.
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>LIVE FEEDS</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>Sub-Second Ticks</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '14px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>ASSET CLASSES</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>Crypto • FX • Metals</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '14px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>INTEGRATION</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#00D26A' }}>Direct Trade Link</div>
              </div>
            </div>

            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '10px',
                background: '#00D26A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <span>Access Pro Screener With 100 Free Gold Coins</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Row 2: Tick-by-Tick Replay & Forensic Auditing */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '56px',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#009E47', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              FORENSIC TRADE POST-MORTEM
            </span>
            <h2 style={{ fontSize: 'clamp(34px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '12px 0 24px 0', lineHeight: 1.15 }}>
              Market Replay Simulator: Relive Every Candle In Strict Isolation.
            </h2>
            
            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '20px' }}>
              The hallmark of professional proprietary trading desks is post-trade forensic analysis. Knowing why a setup succeeded or failed allows you to refine your edge without burning capital.
            </p>

            <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, marginBottom: '28px' }}>
              The NonStock Replay Engine enables you to travel back to historic market conditions, pause time, and replay candle-by-candle price action at variable speeds. Test your stop-loss placement, validate breakout confirmations, and master emotional discipline.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={20} color="#00D26A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block' }}>Zero Forward-Looking Bias</strong>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Candles unfold organically exactly as they did in real market hours.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={20} color="#00D26A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block' }}>Instant Execution Simulation</strong>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Take simulated entries during replay and review your fills against tick history.</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '10px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              <span>Unlock Replay Engine In The Proving Arena</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.12)',
            border: '2px solid #E2E8F0',
            background: '#0B0F19'
          }}>
            <img 
              src="/assets/trade_replay.jpg" 
              alt="NonStock Forensic Candle Replay Simulator Engine" 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px 24px', background: '#0F172A', color: '#FFFFFF' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#00D26A', letterSpacing: '1px', textTransform: 'uppercase' }}>
                FORENSIC ENGINE // VARIABLE SPEED TIMELINE
              </div>
              <div style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                Tick-by-tick market playback across volatile historic macro releases.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6B. SECTION: METATRADER & PROVING ENGINE RELIABILITY WITH 1K GOLD COIN (MATCHING JCTRADER IMAGE 3) ─── */}
      <section style={{
        padding: '100px 24px',
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
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
              border: '1.5px solid #00D26A',
              color: '#006C2E',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <span>NONSTOCK PROVING PROTOCOL</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(34px, 4.2vw, 52px)',
              fontWeight: 900,
              letterSpacing: '-1.4px',
              color: '#0F172A',
              margin: '0 0 16px 0',
              lineHeight: 1.15
            }}>
              NonStock Engine — Unmatched Mathematical Reliability Across The Industry
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.65 }}>
              Engineered with sub-second execution latency, strict stop-loss validation, and the universal $1,000 baseline economy.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '50px',
            alignItems: 'center'
          }}>
            {/* Left Column: 4 Feature Blocks with Checkmarks (Matching Reference Image 3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                {
                  title: 'Ultra-Fast Order Execution',
                  desc: 'Leveraging our low-latency websocket infrastructure across crypto, forex, commodities, and equities.'
                },
                {
                  title: 'Universal $1,000 Baseline Capital',
                  desc: 'Every account is anchored to the exact same baseline. Zero pay-to-win mechanics. Only real trading edge.'
                },
                {
                  title: 'Discipline Execution Rating (DER 0–100)',
                  desc: 'Continuous algorithmic scoring measuring stop-loss discipline, win consistency, and downside preservation.'
                },
                {
                  title: 'Decoupled 1K Gold Coins Economy',
                  desc: '15 rare protocol bounties and daily discipline tasks award minted 1K Gold Coins, preserving market integrity.'
                }
              ].map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00D26A'; e.currentTarget.style.background = '#FFFFFF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#F0FDF4',
                    border: '1.5px solid #00D26A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#009E47',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <CheckCircle2 size={18} />
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

            {/* Right Column: The Minted "1K" Sovereign Gold Coin with Concentric Emerald HUD Rings */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              background: 'radial-gradient(circle, #F0FDF4 0%, #FFFFFF 70%)',
              borderRadius: '28px',
              border: '1.5px solid #86EFAC',
              boxShadow: '0 20px 50px -10px rgba(0, 210, 106, 0.12)',
              position: 'relative'
            }}>
              <div style={{ position: 'relative' }}>
                <GoldCoin1K size={320} showRings={true} animated={true} />
              </div>

              <div style={{
                marginTop: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#006C2E', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
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

      {/* ─── 6C. SECTION: HOW IT WORKS / YOUR PROVING JOURNEY STARTS HERE (MATCHING JCTRADER IMAGE 4) ─── */}
      <section style={{
        padding: '100px 24px',
        background: '#F8FAFC',
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
              border: '1.5px solid #00D26A',
              color: '#006C2E',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <span>HOW IT WORKS</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(34px, 4.2vw, 52px)',
              fontWeight: 900,
              letterSpacing: '-1.4px',
              color: '#0F172A',
              margin: '0 0 16px 0',
              lineHeight: 1.15
            }}>
              Your Proving Journey Starts Here
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.65 }}>
              Our streamlined mathematical protocol connects you with tailored financial proofs, guiding you every step of the way.
            </p>
          </div>

          {/* 3 Horizontal Pill Cards with Dotted Gradients */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                step: '01',
                title: 'Sign Up & Claim $1,000 Baseline',
                desc: 'Quick and easy registration. Receive $1,000 in verified proving capital with zero personal funds required.',
                icon: ShieldCheck,
                color: '#00D26A',
                badgeBg: '#F0FDF4'
              },
              {
                step: '02',
                title: 'Execute with Risk Discipline',
                desc: 'Place trades across crypto, gold, forex, and equities. Maintain Stop-Loss orders to earn 1K Gold Coins.',
                icon: Zap,
                color: '#D97706',
                badgeBg: '#FFFBEB'
              },
              {
                step: '03',
                title: 'Prove True Edge & Climb Ranks',
                desc: 'Ascend Decagon tiers, earn rare protocol bounties, and share your unalterable proof ID with prop firms.',
                icon: Trophy,
                color: '#009E47',
                badgeBg: '#F0FDF4'
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
                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.03)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00D26A'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
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

      {/* ─── 7. SECTION: THE 5 DECAGON TIERS (MATCHING JCTRADER "CHOOSE YOUR ACCOUNT" IMAGE 2) ─── */}
      <section id="decagon-protocol" style={{
        padding: '110px 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 64px auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 18px',
              borderRadius: '999px',
              background: '#F0FDF4',
              border: '1.5px solid #00D26A',
              color: '#006C2E',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <span>START YOUR CHALLENGE</span>
            </div>

            <h2 style={{ fontSize: 'clamp(36px, 4.4vw, 56px)', fontWeight: 900, letterSpacing: '-1.4px', color: '#0F172A', margin: '0 0 16px 0', lineHeight: 1.1 }}>
              Choose Your Proving Tier
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.7, fontWeight: 400 }}>
              You have five decagon proving tiers to progress through, all governed by mathematical edge and strict drawdown rules.
            </p>
          </div>

          {/* 5 Decagon Tiers Showcase (Clean Luxury Light Theme) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '22px', marginBottom: '70px' }}>
            
            {/* Tier 1: Contender */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px 22px', border: '1.5px solid #CBD5E1', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 18px auto',
                background: '#F1F5F9',
                border: '2px solid #64748B',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={32} color="#475569" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>TIER 1 BASELINE</div>
              <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '6px 0 8px 0' }}>Contender</h4>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#009E47', fontFamily: 'var(--font-mono)' }}>$1,000 Baseline</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '10px 0 0 0', lineHeight: 1.6 }}>
                The entry proving ground. 50x leverage cap with liquidation protection.
              </p>
            </div>

            {/* Tier 2: Silver Prover */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px 22px', border: '1.5px solid #94A3B8', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 18px auto',
                background: '#F8FAFC',
                border: '2px solid #64748B',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Medal size={32} color="#475569" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>TIER 2 VERIFIED</div>
              <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '6px 0 8px 0' }}>Silver Prover</h4>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#334155', fontFamily: 'var(--font-mono)' }}>$2,000+ Capital</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '10px 0 0 0', lineHeight: 1.6 }}>
                Doubled baseline through disciplined execution and strict stop-loss adherence.
              </p>
            </div>

            {/* Tier 3: Gold Sovereign */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px 22px', border: '1.5px solid #F59E0B', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.08)', textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 18px auto',
                background: '#FEF3C7',
                border: '2px solid #D97706',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={32} color="#D97706" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>TIER 3 SOVEREIGN</div>
              <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '6px 0 8px 0' }}>Gold Sovereign</h4>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#D97706', fontFamily: 'var(--font-mono)' }}>$4,000+ Capital</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '10px 0 0 0', lineHeight: 1.6 }}>
                Top 8% globally. Quadrupled baseline across shifting market regimes.
              </p>
            </div>

            {/* Tier 4: Master Titan */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px 22px', border: '1.5px solid #FDA4AF', boxShadow: '0 4px 20px rgba(190, 18, 60, 0.06)', textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 18px auto',
                background: '#FFF1F2',
                border: '2px solid #BE123C',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trophy size={32} color="#BE123C" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>TIER 4 TITAN</div>
              <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '6px 0 8px 0' }}>Master Titan</h4>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#BE123C', fontFamily: 'var(--font-mono)' }}>$8,000+ Capital</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '10px 0 0 0', lineHeight: 1.6 }}>
                8x compounder with minimal drawdowns and multi-week winning streaks.
              </p>
            </div>

            {/* Tier 5: Apex Operator */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '32px 22px', border: '1.5px solid #D8B4FE', boxShadow: '0 4px 20px rgba(126, 34, 206, 0.08)', textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 18px auto',
                background: '#FAF5FF',
                border: '2px solid #7E22CE',
                clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Crown size={32} color="#7E22CE" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#7E22CE', textTransform: 'uppercase' }}>TIER 5 APEX</div>
              <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '6px 0 8px 0' }}>Apex Operator</h4>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#7E22CE', fontFamily: 'var(--font-mono)' }}>$15,000+ Capital</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '10px 0 0 0', lineHeight: 1.6 }}>
                The elite 0.1% global echelon. Recognized institutional risk manager.
              </p>
            </div>

          </div>

          {/* Deep Explanation of The Discipline Economy */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '44px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Coins size={28} color="#D97706" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  THE DISCIPLINE ECONOMY & GOLD COINS VAULT
                </span>
              </div>
              <h3 style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', margin: '0 0 16px 0', lineHeight: 1.2 }}>
                How Discipline Is Quantified And Enforced: Second Chances Must Be Earned.
              </h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '16px' }}>
                Unlike casual demo platforms where traders recklessly click 'Reset Account' after blowing their balance, NonStock treats capital preservation with utmost seriousness through the <strong>Gold Coins Economy</strong>.
              </p>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                Every participant starts with 100 Gold Coins. You earn +25 coins strictly once per calendar day by maintaining your daily check-in streak, and +5 coins on every trade placed with an active Stop Loss. If you blow your $1,000 baseline, resetting requires a mandatory 100 Gold Coins fee. If your coin vault hits zero, you face an un-bypassable 24-hour lockout to reflect on your risk errors.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '22px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>DAILY STREAK BONUS</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#009E47', marginTop: '4px' }}>+25 Coins</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Once per calendar day</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '22px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>SL PROTECTION</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#009E47', marginTop: '4px' }}>+5 Coins</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>On every protected order</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '22px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>LIQUIDATION PENALTY</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#BE123C', marginTop: '4px' }}>-100 Coins</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Cost to reset blown baseline</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '22px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>FEATURE UNLOCKS</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>Edge Tools</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Unlock Screener & Replay</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 8. SECTION: INTERACTIVE EXPECTED VALUE & TIER SIMULATOR ─── */}
      <section id="calculator" style={{
        padding: '110px 24px',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 56px auto' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#00D26A', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            MATHEMATICAL SIMULATION
          </span>
          <h2 style={{ fontSize: 'clamp(34px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#0F172A', margin: '12px 0 18px 0' }}>
            Interactive Edge Simulator: Test Your Strategy Expectancy.
          </h2>
          <p style={{ fontSize: '17px', color: '#64748B', fontWeight: 500 }}>
            Adjust your historical win-rate, risk-to-reward ratio, and weekly frequency to project your compounded capital growth from the $1,000 baseline and see your earned Decagon Tier.
          </p>
        </div>

        <div style={{
          background: '#F8FAFC',
          borderRadius: '24px',
          padding: '44px',
          border: '1.5px solid #E2E8F0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '44px',
          alignItems: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
        }}>
          {/* Sliders Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Slider 1: Win Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Estimated Win-Rate (%)</label>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#00D26A', fontFamily: 'var(--font-mono)' }}>{winRate}%</span>
              </div>
              <input 
                type="range" 
                min="35" 
                max="85" 
                value={winRate} 
                onChange={(e) => setWinRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00D26A', cursor: 'pointer', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                <span>35% (Trend Surfer)</span>
                <span>85% (High Precision Scalper)</span>
              </div>
            </div>

            {/* Slider 2: Risk to Reward */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Risk-to-Reward Ratio (R:R)</label>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#00D26A', fontFamily: 'var(--font-mono)' }}>1:{riskReward}</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="4.0" 
                step="0.1" 
                value={riskReward} 
                onChange={(e) => setRiskReward(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00D26A', cursor: 'pointer', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                <span>1:1.0 (Even Payoff)</span>
                <span>1:4.0 (Asymmetric Macro Run)</span>
              </div>
            </div>

            {/* Slider 3: Weekly Frequency */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Disciplined Trades Per Week</label>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#00D26A', fontFamily: 'var(--font-mono)' }}>{weeklyTrades} Trades</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="30" 
                value={weeklyTrades} 
                onChange={(e) => setWeeklyTrades(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00D26A', cursor: 'pointer', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                <span>3 (Selective Swing)</span>
                <span>30 (Active Intraday)</span>
              </div>
            </div>

          </div>

          {/* Results Projection Card */}
          <div style={{
            background: calculatedEdge.tierBg,
            borderRadius: '24px',
            padding: '38px',
            border: `2.5px solid ${calculatedEdge.tierBorder}`,
            textAlign: 'center'
          }}>
            <div style={{
              width: '84px',
              height: '84px',
              margin: '0 auto 16px auto',
              background: '#FFFFFF',
              border: `3px solid ${calculatedEdge.tierColor}`,
              clipPath: 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
            }}>
              <calculatedEdge.tierIcon size={40} color={calculatedEdge.tierColor} />
            </div>

            <div style={{ fontSize: '11px', fontWeight: 800, color: calculatedEdge.tierColor, textTransform: 'uppercase', letterSpacing: '1px' }}>
              PROJECTED PROVING TIER
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 900, color: calculatedEdge.tierColor, margin: '6px 0 16px 0' }}>
              {calculatedEdge.tierName}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', textAlign: 'left', background: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '22px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>COMPOUNDED CAPITAL</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                  ${calculatedEdge.projectedBalance.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 800 }}>ESTIMATED DER SCORE</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#00D26A', fontFamily: 'var(--font-mono)' }}>
                  {calculatedEdge.derScore} <span style={{ fontSize: '12px', color: '#64748B' }}>/ 100</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              style={{
                display: 'block',
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                background: calculatedEdge.tierColor,
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '15px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}
            >
              Prove This Edge In Live Arena ($1,000 Baseline)
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 9. SECTION: VERIFIED GLOBAL NONSTOCK LEADERBOARD PREVIEW (NO USER NAMES) ─── */}
      <section id="hall-of-fame" style={{
        padding: '110px 24px',
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 52px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#00D26A', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              PUBLIC AUDITABLE LEDGER
            </span>
            <h2 style={{ fontSize: 'clamp(34px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#0F172A', margin: '12px 0 18px 0' }}>
              The Global Hall of Fame: NonStock Provers.
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', fontWeight: 500 }}>
              All records are verified mathematically with zero manual overrides. The public ledger sorts provers strictly by DER Score and capital compounded from the $1,000 baseline.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #CBD5E1', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 24px' }}>RANK</th>
                  <th style={{ padding: '16px 24px' }}>VERIFIED DESK</th>
                  <th style={{ padding: '16px 24px' }}>TIER CREST</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>DER SCORE</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>PROVING CAPITAL</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, desk: 'NonStock', tag: 'Apex Operator', color: '#A855F7', der: '94.2', balance: '$15,820.00', status: 'VERIFIED PRO' },
                  { rank: 2, desk: 'NonStock', tag: 'Master Titan', color: '#E11D48', der: '91.8', balance: '$8,450.50', status: 'VERIFIED PRO' },
                  { rank: 3, desk: 'NonStock', tag: 'Gold Sovereign', color: '#EAB308', der: '88.5', balance: '$4,120.00', status: 'VERIFIED PRO' },
                  { rank: 4, desk: 'NonStock', tag: 'Silver Prover', color: '#94A3B8', der: '84.0', balance: '$2,380.00', status: 'ACTIVE' },
                  { rank: 5, desk: 'NonStock', tag: 'Contender', color: '#0F172A', der: '75.0', balance: '$1,000.00', status: 'ACTIVE' }
                ].map((item, idx) => (
                  <tr key={item.rank} style={{ borderBottom: '1px solid #F1F5F9', background: idx === 0 ? '#FAF5FF' : '#FFFFFF' }}>
                    <td style={{ padding: '18px 24px', fontWeight: 900, color: item.rank === 1 ? '#A855F7' : '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>#{item.rank}</span>
                        {item.rank === 1 && <Trophy size={14} color="#A855F7" />}
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px', fontWeight: 800 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          color: item.color,
                          fontWeight: 900,
                          fontSize: '15px',
                          textShadow: item.tag.includes('Silver') ? '0 1px 2px rgba(148, 163, 184, 0.4)'
                            : item.tag.includes('Gold') ? '0 1px 8px rgba(234, 179, 8, 0.35)'
                            : item.tag.includes('Master') ? '0 1px 8px rgba(225, 29, 72, 0.35)'
                            : item.tag.includes('Operator') ? '0 1px 10px rgba(168, 85, 247, 0.4)'
                            : 'none'
                        }}>
                          {item.desk}
                        </span>
                        <span style={{ fontSize: '10px', background: item.status.includes('PRO') ? '#FEF3C7' : '#F1F5F9', color: item.status.includes('PRO') ? '#B45309' : '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{
                        background: '#F8FAFC',
                        color: item.color,
                        border: `1.5px solid ${item.color}`,
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 900,
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase'
                      }}>
                        {item.tag}
                      </span>
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 900, color: '#009E47', fontFamily: 'var(--font-mono)' }}>
                      {item.der}
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                      {item.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link
              to="/dashboard"
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#009E47',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>View Full Real-Time Global Proving Rankings</span>
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── 10. SECTION: FREQUENTLY ASKED QUESTIONS ─── */}
      <section id="faq" style={{ padding: '110px 24px', maxWidth: '880px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#00D26A', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            RULES & CLARITY
          </span>
          <h2 style={{ fontSize: 'clamp(34px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#0F172A', margin: '12px 0 18px 0' }}>
            Frequently Asked Questions.
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', fontWeight: 500 }}>
            Everything you need to know about the Proving Arena, verification protocols, and coin mechanics.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              q: "Is real money deposited or risked on NonStock?",
              a: "No. NonStock is 100% simulated capital powered by real live exchange tick data. Every trader starts with $1,000 in virtual proving capital. You never risk your personal life savings, but you are held accountable to institutional execution, margin rules, and drawdown penalties."
            },
            {
              q: "How do tipsters and educators verify their track record to followers?",
              a: "Every trader and educator receives an unforgeable public proving ID. When you share this link on Twitter, YouTube, or Telegram, your audience can view your verified DER Score, un-tampered trade ledger, and decagon rank badge. It is impossible to fake, edit, or photoshop."
            },
            {
              q: "Can anyone cheat, inspect-element, or reset stats without penalty?",
              a: "No. All trades, orders, entry prices, and exits are committed to our secure backend database connected to live exchange tick feeds. If an account is liquidated, a 100 Gold Coins fee is extracted. If you run out of coins, you face a mandatory 24-hour lockout."
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
                  borderRadius: '16px',
                  border: isOpen ? '1.5px solid #00D26A' : '1px solid #E2E8F0',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  boxShadow: isOpen ? '0 4px 20px rgba(0, 210, 106, 0.08)' : 'none'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '22px 26px',
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
                  {isOpen ? <ChevronUp size={20} color="#00D26A" /> : <ChevronDown size={20} color="#94A3B8" />}
                </button>

                {isOpen && (
                  <div style={{ padding: '0 26px 22px 26px', fontSize: '15px', color: '#475569', lineHeight: 1.7, borderTop: '1px solid #F1F5F9' }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ─── 11. MASSIVE FINAL CALL TO ACTION ─── */}
      <section style={{
        padding: '110px 24px',
        background: 'linear-gradient(135deg, #0F172A 0%, #064E3B 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: 'rgba(0, 210, 106, 0.2)',
            border: '1px solid rgba(0, 210, 106, 0.4)',
            color: '#86EFAC',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '24px'
          }}>
            <ShieldCheck size={16} />
            <span>JOIN THE UNTOUCHABLE NONSTOCK PROVING ARENA</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(40px, 5.4vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-1.6px',
            margin: '0 0 24px 0',
            color: '#FFFFFF'
          }}>
            Stop Guessing. <br />
            Enter The Proving Arena Today.
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#D1D5DB',
            maxWidth: '680px',
            margin: '0 auto 38px auto',
            lineHeight: 1.65
          }}>
            Claim your $1,000 baseline capital, execute across real live exchange ticks, and prove your true mathematical standing before the global trading community. 100% free forever.
          </p>

          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '20px 46px',
              borderRadius: '14px',
              background: '#00D26A',
              color: '#FFFFFF',
              fontSize: '17px',
              fontWeight: 900,
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(0, 210, 106, 0.4)',
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

      {/* ─── 12. HIGH-PROFILE INSTITUTIONAL FOOTER ─── */}
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
