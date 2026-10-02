import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  ShieldCheck, Cpu, Zap, Sparkles, Clock, ArrowRight, 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Bot, 
  Activity, Target, Lock, AlertTriangle, Compass, Layers,
  BarChart3, RefreshCw, Coins, Crown, Play, Flame, Award,
  Sliders, Check, TrendingUp, Key, Terminal, ExternalLink
} from 'lucide-react';

export default function Landing() {
  // Ensure body background is pure white while on Landing page
  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#0f172a';
    return () => {
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
    };
  }, []);

  // Active rule for the animated rules engine
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);
  const [isAutoPlayingRules, setIsAutoPlayingRules] = useState(true);

  // Interactive tier simulation state for Rule 3
  const [simulatedEquity, setSimulatedEquity] = useState(1000);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ─── 6 COMPREHENSIVE ZIG-ZAG MODULES ───
  const zigZagFeatures = [
    {
      id: 'trading-arena',
      align: 'left', // image on left, text on right
      badge: 'CORE ARENA • $1,000 PROVING CAPITAL',
      badgeColor: '#10B981',
      title: 'Real-Time Global Market Arena & Execution Desk',
      subtitle: 'Institutional Speed with Zero Brokerage or Personal Capital Risk',
      description: 'Step into a competitive trading terminal built for true skill validation. Connect to live exchange feeds across global crypto (BTC, ETH), commodities (Gold XAUUSD), forex (EURUSD), and leading global tech stocks (NVDA, AAPL). Execute Market, Limit, and Stop orders with dynamic position sizing and automated stop-loss protection.',
      image: '/landing-dashboard-preview.png',
      imageCaption: 'Live NVDA $895.42 candlestick chart with execution ticket, replay controls, and real-time indicators.',
      tagText: 'Real-Time Terminal',
      bulletPoints: [
        'Instant order execution ticket with Market/Limit/Stop order types and % balance sizing',
        'Built-in stop-loss and take-profit risk calculator enforcing strict risk-to-reward ratios',
        'Real-time position tracking, live unrealized P&L calculations, and margin metrics',
        '100% verified trades recorded in the engine — zero fake photoshop screenshots possible'
      ],
      edgeBox: 'Trade real market volatility with institutional precision. Prove your edge without risking your hard-earned savings.',
      ctaText: 'Enter Trading Arena',
      ctaRoute: '/trading'
    },
    {
      id: 'ai-mentor',
      align: 'right', // text on left, image on right
      badge: 'GROQ LLaMA 3.3 70B • 24/7 RISK AUDITOR',
      badgeColor: '#059669',
      title: 'AI Trading Mentor: Pre-Trade Risk & Trap Auditor',
      subtitle: 'Get Every Trade Setup Audited in Real-Time Before You Hit Execute',
      description: 'Over 90% of retail traders blow their accounts due to emotional revenge trading and oversized positions. Powered by LLaMA 3.3 (70B) via Groq API, our AI Mentor scans live chart indicators, flags institutional liquidity sweeps and retail fakeouts, and evaluates your risk-to-reward ratio before you place an order.',
      image: '/feature-ai-mentor.jpg',
      imageCaption: 'Groq AI Mentor analyzing AAPL chart patterns, identifying liquidity traps, and verifying risk/reward ratio.',
      tagText: 'Groq AI Engine',
      bulletPoints: [
        'Live technical ingestion: scans RSI, MACD crosses, support/resistance floors, and trend momentum',
        'Identifies retail traps: warns against buying into liquidity fakeouts and selling the absolute floor',
        'Conversational strategy backtester: ask "What if I buy when RSI < 30?" to generate backtests',
        'Live AI Mentor Insight card directly below your order execution ticket on the trading desk'
      ],
      edgeBox: 'An unemotional, quantitative Wall Street risk officer watching your trades to prevent catastrophic drawdowns.',
      ctaText: 'Consult AI Mentor',
      ctaRoute: '/ai-mentor'
    },
    {
      id: 'market-replay',
      align: 'left', // image on left, text on right
      badge: 'PRO EXCLUSIVE • 24/7 TIME MACHINE',
      badgeColor: '#0284C7',
      title: 'The Time Machine: Bar-by-Bar Historical Replay Engine',
      subtitle: 'Trade Any Historical Market Session on Evenings & Weekends',
      description: 'Stock exchanges close at 3:30 PM and stay shut all weekend — the exact time when retail traders have time to practice. The 24/7 Market Replay Engine lets you rewind the tape to any historical date, black out future candles, and replay candlesticks bar-by-bar at 1x to 5x speed with a full simulated trading desk.',
      image: '/landing-replay-preview.png',
      imageCaption: 'Historical candlestick replay simulator with play/pause, 1x-5x speed pills, and scrubber.',
      tagText: 'Bar-by-Bar Replay',
      bulletPoints: [
        'Complete future candle blackout ensures honest, un-cheated pattern recognition practice',
        'Variable replay speeds (1x, 2x, 5x) with instant pause, rewind, and bar-by-bar step controls',
        'Execute simulated practice orders directly while the historical tape rolls forward',
        'Compress months of chart screen time into a single focused weekend session'
      ],
      edgeBox: 'Accelerate your learning curve by 10x. Practice 50+ real price action setups before Monday morning opens.',
      ctaText: 'Launch Replay Engine',
      ctaRoute: '/replay'
    },
    {
      id: 'coins-vault',
      align: 'right', // text on left, image on right
      badge: 'MERITOCRACY • DISCIPLINE STREAKS',
      badgeColor: '#D97706',
      title: 'Gold Coins Vault & Dynamic Navbar Arrival',
      subtitle: 'Earn Coins on Discipline Streaks. Unlock Pro Edge-Building Tools.',
      description: 'NonStock turns risk discipline into a game of mastery. Trade with strict risk management, log in daily, and maintain trade discipline to stack Gold Coins in your vault. Use your earned coins to unlock advanced edge-building tools — which directly arrive in your top navigation bar the moment you unlock them.',
      image: '/landing-vault-badge-preview.png',
      imageCaption: 'Gold Coins Vault with 4-Day Discipline Streak counter and verified Non-Tipster proving account badge.',
      tagText: 'Utility Sink Economy',
      bulletPoints: [
        'Daily discipline streak rewards: earn +25 Gold Coins daily for consistent adherence to rules',
        'Unlock edge-building tools: Screener (150c), AI Mentor (200c), Strategy Lab (300c), Replay (500c)',
        'Zero-delay navbar arrival: unlocked tools instantly dock right into your top navigation bar',
        'Pro accounts automatically unlock all 4 premium tools with unlimited permanent access'
      ],
      edgeBox: 'Coins cannot be bought with cheap shortcuts. They are proof of psychological consistency and patience.',
      ctaText: 'View Dashboard & Vault',
      ctaRoute: '/dashboard'
    },
    {
      id: 'bailout-shop',
      align: 'left', // image on left, text on right
      badge: 'STRICT 1:3 RATIO • BANKRUPTCY LOCK',
      badgeColor: '#EF4444',
      title: 'The Capital Bailout Shop: Real Consequence Recapitalization',
      subtitle: 'Bankrupt? Refuel with 1:3 Ratio Virtual Capital to Keep Skin in the Game',
      description: 'Broke your paper trading account? In the real world, reckless over-leveraging leads to bankruptcy. If your virtual portfolio balance drops to $0.00, your terminal locks and the Bailout Shop activates. Purchase fresh virtual capital with real money starting at a strict 1:3 ratio ($1,000 capital for $333.33) up to $1,000,000.',
      image: '/feature-paper-trading.jpg',
      imageCaption: 'Bailout Shop showing 1:3 conversion ratios, bankruptcy status check, and recapitalization tiers.',
      tagText: 'Skin in the Game',
      bulletPoints: [
        'Strict bankruptcy requirement: the shop only unlocks when your equity hits exactly $0.00',
        '1:3 real-to-virtual conversion ratio maintains emotional stakes and stops careless click-festing',
        'Tiered capital sizes from $1,000 up to $1,000,000 with progressive volume bonuses',
        'Full audit trail logging records every bailout, ensuring leaderboard transparency'
      ],
      edgeBox: 'Treat your simulation like real wealth. Blowing up has consequences; staying disciplined keeps you in the game.',
      ctaText: 'Visit Bailout Shop',
      ctaRoute: '/shop'
    },
    {
      id: 'strategy-builder',
      align: 'right', // text on left, image on right
      badge: 'NO-CODE LOGIC • PINE SCRIPT EXPORT',
      badgeColor: '#8B5CF6',
      title: 'No-Code Strategy Builder & Quantitative Backtester',
      subtitle: 'Turn Discretionary Gut Feelings Into Mathematically Tested Rules',
      description: 'Stop executing based on random Telegram tips. Visually construct algorithmic trading rules connecting indicators like EMA crossovers, RSI extremes, and stop-loss rules. Instantly run 1-year historical backtests to evaluate win rates, profit factors, Sharpe ratios, and equity curves before you trade.',
      image: '/feature-strategy-lab.jpg',
      imageCaption: 'Drag-and-drop indicator conditions with 1-year backtest report and Pine Script generator.',
      tagText: 'Quantitative Lab',
      bulletPoints: [
        'Visual logic builder: combine RSI, EMA, MACD, and Price action triggers without coding',
        'Comprehensive quantitative reports: total return, win rate, profit factor, and Sharpe ratio',
        'Visual equity curve with historical buy and sell execution markers across past bull & bear cycles',
        '1-click Pine Script code generation ready to deploy directly onto TradingView charts'
      ],
      edgeBox: 'Rule-based quantitative setups eliminate hesitation and fear. Validate your expectancy before risking capital.',
      ctaText: 'Launch Strategy Lab',
      ctaRoute: '/strategy-builder'
    }
  ];

  // ─── 6 ANIMATED PROVING RULES ───
  const provingRules = [
    {
      step: 'RULE 01',
      title: 'The $1,000 Proving Account',
      subtitle: 'Equal Ground. Zero Pay-to-Win Cheats.',
      desc: 'Every trader begins with exactly $1,000 in proving equity. There are no artificial balance inflations or rigged starting points. Whether you are an experienced prop trader or an ambitious beginner, your rank is determined solely by your percentage return and risk discipline.',
      icon: <Target size={24} color="#10B981" />,
      color: '#10B981',
      stats: 'Initial Balance: $1,000.00'
    },
    {
      step: 'RULE 02',
      title: '100% Cryptographic Trade Ledger',
      subtitle: 'Eliminating Photoshopped P&L Forever.',
      desc: 'Every order ticket, fill price, timestamp, stop-loss adjustment, and exit is permanently committed to our database. If a trader claims a 90% win rate or massive gains, our system calculates their true Discipline & Execution Rating (DER). Scammers cannot fake their track record here.',
      icon: <ShieldCheck size={24} color="#059669" />,
      color: '#059669',
      stats: 'Verification: NS-c141ad16 Verified Non-Tipster'
    },
    {
      step: 'RULE 03',
      title: 'Prestige Badge Tier Progression',
      subtitle: 'Grow Your Equity to Ascend the Hall of Fame.',
      desc: 'As your verified account balance grows through disciplined risk management, you unlock prestigious status badges that glow on your profile and appear on the Global Hall of Fame:',
      icon: <Award size={24} color="#8B5CF6" />,
      color: '#8B5CF6',
      stats: 'Tiers: Contender → Silver → Gold → Master → Operator'
    },
    {
      step: 'RULE 04',
      title: 'Gold Coins & Discipline Streaks',
      subtitle: 'Patience & Risk Consistency are Generously Rewarded.',
      desc: 'Maintain daily discipline to earn +25 Gold Coins every day in your vault. Consecutive winning sessions and clean risk-to-reward ratios add streak multipliers. Careless over-leveraging burns coins and halts your streak.',
      icon: <Flame size={24} color="#F59E0B" />,
      color: '#F59E0B',
      stats: 'Streak: +25 Daily Coins • 4-Day Discipline Fire'
    },
    {
      step: 'RULE 05',
      title: 'Feature Gating: Direct Navbar Arrival',
      subtitle: 'Earn Platform Superpowers with Gold Coins.',
      desc: 'Advanced tools are not handed out for free — they are earned through proven discipline. Spend 150 coins for the Screener, 200 for Groq AI Mentor, 300 for Strategy Lab, or 500 for Replay. The second you unlock a tool, it dynamically arrives as an active button in your top navbar.',
      icon: <Compass size={24} color="#0284C7" />,
      color: '#0284C7',
      stats: 'Unlocked Tools: Screener, AI Mentor, Strategy Lab, Replay'
    },
    {
      step: 'RULE 06',
      title: 'The Zero-Coin & 1:3 Bailout Rule',
      subtitle: 'Real Stakes: Bankruptcy Freezes Your Desk.',
      desc: 'Blowing your account to $0.00 has real psychological weight. The platform locks your trading desk and redirects you to the Bailout Shop. You can only resume trading by purchasing a disciplined 1:3 bailout with real funds, ensuring traders never treat simulation like a mindless video game.',
      icon: <Coins size={24} color="#EF4444" />,
      color: '#EF4444',
      stats: 'Bailout Ratio: 1:3 ($1k to $1M)'
    }
  ];

  // Auto-cycle through rules if auto-play is enabled
  useEffect(() => {
    if (!isAutoPlayingRules) return;
    const interval = setInterval(() => {
      setActiveRuleIndex((prev) => (prev + 1) % provingRules.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlayingRules, provingRules.length]);

  // Dynamic Tier Badge calculation based on simulated equity
  const getSimulatedBadge = (eq) => {
    if (eq >= 15000) return { name: 'OPERATOR', color: '#A855F7', glow: '0 0 20px rgba(168, 85, 247, 0.7)' };
    if (eq >= 8000) return { name: 'MASTER', color: '#EF4444', glow: '0 0 16px rgba(239, 68, 68, 0.5)' };
    if (eq >= 4000) return { name: 'GOLD', color: '#F59E0B', glow: '0 0 16px rgba(245, 158, 11, 0.5)' };
    if (eq >= 2000) return { name: 'SILVER', color: '#94A3B8', glow: '0 0 12px rgba(148, 163, 184, 0.4)' };
    return { name: 'CONTENDER', color: '#64748B', glow: 'none' };
  };

  const currentBadge = getSimulatedBadge(simulatedEquity);

  const faqs = [
    {
      q: 'What is NonStock and what problem does it solve?',
      a: 'NonStock is the #1 verified competitive paper trading and skill proving platform. We solve the epidemic of fake profits and photoshopped P&L screenshots. On NonStock, every trade is cryptographically recorded in our engine. You start with a $1,000 proving balance, trade real market data, earn Gold Coins, and prove your true mathematical edge.'
    },
    {
      q: 'How does the feature unlocking and navbar arrival work?',
      a: 'As you trade with disciplined risk and maintain daily streaks, you accumulate Gold Coins in your vault. You can spend these coins in the Feature Vault to unlock tools like the Real-Time Screener (150 coins), Groq AI Mentor (200 coins), Strategy Lab (300 coins), and 24/7 Market Replay (500 coins). As soon as a tool is unlocked, it directly arrives in your top navigation bar for instant access!'
    },
    {
      q: 'What powers the AI Trading Mentor?',
      a: 'The AI Mentor is powered by LLaMA 3.3 (70B) via the ultra-fast Groq API. It operates both on its dedicated analysis page and live directly below the order execution ticket in the trading arena. It evaluates support/resistance levels, scans for bull/bear traps and liquidity sweeps, and checks your risk-to-reward ratio before you place an order.'
    },
    {
      q: 'Can I practice trading when markets are closed on weekends?',
      a: 'Yes! Our 24/7 Market Replay Engine allows you to trade historical market sessions bar-by-bar at 1x to 5x speed even when exchanges are closed. With future candle blackout, it provides the most authentic price action practice experience available.'
    },
    {
      q: 'What is the 1:3 Bailout Shop?',
      a: 'If you gamble carelessly and your virtual portfolio drops to $0.00, your terminal locks into bankruptcy mode. The Bailout Shop unlocks, allowing you to recapitalize your paper trading balance using real money at a strict 1:3 conversion ratio. This introduces real consequences to simulation and forces serious risk discipline.'
    },
    {
      q: 'Do I need a broker or Demat account to use NonStock?',
      a: 'No Demat or brokerage account is needed. NonStock operates with real-time global live feeds and our independent verified matching engine, allowing anyone in the world to prove their trading acumen completely risk-free.'
    }
  ];

  return (
    <div className="landing-root">
      {/* ─── 1. TOP STICKY NAVBAR ─── */}
      <nav className="landing-navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <Logo size={36} showName={true} showTagline={true} />
          </Link>

          <div className="navbar-links">
            <button onClick={() => scrollToSection('features-zigzag')} className="navbar-link-btn">
              <Compass size={16} className="text-green" />
              <span>Features Showcase</span>
            </button>
            <button onClick={() => scrollToSection('animated-rules')} className="navbar-link-btn">
              <Award size={16} className="text-green" />
              <span>The Proving Rules</span>
            </button>
            <button onClick={() => scrollToSection('faq')} className="navbar-link-btn">
              <Clock size={16} className="text-green" />
              <span>FAQ</span>
            </button>
          </div>

          <div className="navbar-actions">
            <Link to="/login" className="btn-nav-login">Sign In</Link>
            <Link to="/register" className="btn-nav-cta">
              <span>Start Proving</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── 2. HERO SECTION ─── */}
      <header className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="badge-pulse-dot"></span>
            <span className="badge-text">THE #1 VERIFIED COMPETITIVE TRADING ARENA</span>
          </div>

          <h1 className="hero-title">
            Prove Your Trading Skills. <br />
            <span className="hero-gradient-text">Expose Fake Tipsters.</span>
          </h1>

          <p className="hero-description">
            The era of fake screenshots and paper gurus is officially over. NonStock is the first competitive trading arena where every trade, rank, and badge is 100% mathematically verified. Start with a <strong className="text-highlight">$1,000 proving account</strong>, earn Gold Coins on discipline streaks, unlock pro tools that arrive in your navbar, and rise to the prestigious Operator status.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">
              <span>Enter The Proving Arena</span>
              <ArrowRight size={18} />
            </Link>
            <button onClick={() => scrollToSection('features-zigzag')} className="btn-hero-secondary">
              <Compass size={18} className="text-green" />
              <span>Explore The Platform</span>
            </button>
          </div>

          {/* Quick Trust Highlights */}
          <div className="hero-trust-row">
            <div className="trust-pill">
              <ShieldCheck size={16} className="text-green" />
              <span>100% Cryptographically Verified Trades</span>
            </div>
            <div className="trust-dot">•</div>
            <div className="trust-pill">
              <Bot size={16} className="text-green" />
              <span>Groq LLaMA 3.3 AI Mentor</span>
            </div>
            <div className="trust-dot">•</div>
            <div className="trust-pill">
              <Clock size={16} className="text-green" />
              <span>24/7 Bar-by-Bar Historical Replay</span>
            </div>
            <div className="trust-dot">•</div>
            <div className="trust-pill">
              <Coins size={16} className="text-green" />
              <span>Gold Coins Vault & Tier Badges</span>
            </div>
          </div>

          {/* Hero Window Mockup with Actual Live Interface */}
          <div className="hero-preview-wrapper">
            <div className="hero-preview-card">
              <div className="preview-window-bar">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="window-address">
                  nonstock.trade // verified competitive dashboard
                </div>
                <div className="window-tag">Verified Platform</div>
              </div>
              <img 
                src="/landing-dashboard-preview.png" 
                alt="NonStock Live Competitive Trading Desk and Analytics Interface" 
                className="hero-preview-img"
              />
            </div>
            <p className="preview-caption">
              Actual interface: Real-time global market charts, verifiable skill ranking (DER Score), and unlockable badges.
            </p>
          </div>
        </div>
      </header>

      {/* ─── 3. SECTION: THE PROVING RULES (ANIMATED FORM) ─── */}
      <section id="animated-rules" className="section rules-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Award size={16} className="text-green" />
              <span>THE NONSTOCK CODE OF DISCIPLINE</span>
            </div>
            <h2 className="section-heading">
              How The Platform Works: <br />
              <span className="text-green">Rules Explained in Animated Form.</span>
            </h2>
            <p className="section-subheading">
              Our verified competitive framework eliminates luck and gambling. Click any rule below to see how our engine enforces discipline, calculates DER skill score, and unlocks badges.
            </p>
          </div>

          {/* Interactive Animated Rule Engine Container */}
          <div className="rules-engine-card">
            {/* Top Interactive Progress Tabs */}
            <div className="rules-tabs-nav">
              {provingRules.map((rule, idx) => {
                const isActive = activeRuleIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveRuleIndex(idx);
                      setIsAutoPlayingRules(false);
                    }}
                    className={`rule-tab-btn ${isActive ? 'active' : ''}`}
                    style={{
                      borderColor: isActive ? rule.color : '#E2E8F0'
                    }}
                  >
                    <div className="rule-tab-step">{rule.step}</div>
                    <div className="rule-tab-label">{rule.title.split(':')[0]}</div>
                    {isActive && <div className="rule-tab-indicator" style={{ background: rule.color }}></div>}
                  </button>
                );
              })}
            </div>

            {/* Main Animated Rule Stage */}
            <div className="rule-stage-content">
              <div className="rule-stage-left">
                <div className="rule-badge-pill" style={{ background: `${provingRules[activeRuleIndex].color}15`, color: provingRules[activeRuleIndex].color }}>
                  <span>{provingRules[activeRuleIndex].step}</span>
                  <span className="rule-dot">•</span>
                  <span>MANDATORY PROTOCOL</span>
                </div>

                <h3 className="rule-stage-title" style={{ color: '#0F172A' }}>
                  {provingRules[activeRuleIndex].title}
                </h3>
                <h4 className="rule-stage-subtitle" style={{ color: provingRules[activeRuleIndex].color }}>
                  {provingRules[activeRuleIndex].subtitle}
                </h4>

                <p className="rule-stage-desc">
                  {provingRules[activeRuleIndex].desc}
                </p>

                <div className="rule-stage-stats-box">
                  <div className="stats-box-icon" style={{ background: `${provingRules[activeRuleIndex].color}15` }}>
                    {provingRules[activeRuleIndex].icon}
                  </div>
                  <div>
                    <div className="stats-box-label">ENGINE CONSTRAINT</div>
                    <div className="stats-box-value">{provingRules[activeRuleIndex].stats}</div>
                  </div>
                </div>

                <div className="rule-stage-controls">
                  <button
                    onClick={() => setIsAutoPlayingRules(!isAutoPlayingRules)}
                    className="btn-rule-autoplay"
                  >
                    {isAutoPlayingRules ? (
                      <><span>Pause Animation</span> <span className="pulse-circle"></span></>
                    ) : (
                      <><span>Auto-Play Rules</span> <Play size={14} /></>
                    )}
                  </button>
                  <span className="rule-counter-text">
                    Step {activeRuleIndex + 1} of {provingRules.length}
                  </span>
                </div>
              </div>

              {/* Right: Live Interactive Rule Simulation Visualizer */}
              <div className="rule-stage-right">
                {activeRuleIndex === 2 ? (
                  /* Interactive Tier Simulation Visualizer */
                  <div className="simulated-tier-card">
                    <div className="tier-sim-header">
                      <span className="sim-title">Live Tier & Badge Simulator</span>
                      <span className="sim-live-tag">Interactive</span>
                    </div>

                    <div className="tier-badge-showcase" style={{ boxShadow: currentBadge.glow }}>
                      <div className="tier-badge-icon" style={{ borderColor: currentBadge.color, color: currentBadge.color }}>
                        {currentBadge.name[0]}
                      </div>
                      <div className="tier-badge-details">
                        <div className="tier-user-name">Trader Admin</div>
                        <div className="tier-badge-name" style={{ color: currentBadge.color }}>
                          {currentBadge.name} TIER
                        </div>
                      </div>
                    </div>

                    <div className="tier-slider-group">
                      <div className="slider-label-row">
                        <span>Simulated Account Equity:</span>
                        <strong style={{ color: '#10B981', fontSize: '18px' }}>
                          ${simulatedEquity.toLocaleString()}
                        </strong>
                      </div>
                      <input 
                        type="range" 
                        min="1000" 
                        max="20000" 
                        step="500" 
                        value={simulatedEquity}
                        onChange={(e) => {
                          setSimulatedEquity(Number(e.target.value));
                          setIsAutoPlayingRules(false);
                        }}
                        className="equity-slider"
                      />
                      <div className="slider-ticks">
                        <span>$1K (Contender)</span>
                        <span>$4K (Gold)</span>
                        <span>$8K (Master)</span>
                        <span>$15K+ (Operator)</span>
                      </div>
                    </div>

                    <div className="tier-milestone-pills">
                      <div className={`milestone-pill ${simulatedEquity >= 1000 ? 'done' : ''}`}>
                        Contender $1K
                      </div>
                      <div className={`milestone-pill ${simulatedEquity >= 2000 ? 'done' : ''}`}>
                        Silver $2K
                      </div>
                      <div className={`milestone-pill ${simulatedEquity >= 4000 ? 'done' : ''}`}>
                        Gold $4K
                      </div>
                      <div className={`milestone-pill ${simulatedEquity >= 8000 ? 'done' : ''}`}>
                        Master $8K
                      </div>
                      <div className={`milestone-pill ${simulatedEquity >= 15000 ? 'done neon' : ''}`}>
                        Operator $15K ✨
                      </div>
                    </div>
                  </div>
                ) : activeRuleIndex === 3 ? (
                  /* Animated Coins & Discipline Streak Visualizer */
                  <div className="simulated-vault-card">
                    <div className="vault-glow-header">
                      <div className="vault-coin-icon">
                        <Coins size={36} color="#D97706" />
                      </div>
                      <div>
                        <div className="vault-title">GOLD COINS VAULT</div>
                        <div className="vault-amount">100 <span className="vault-sub">Coins</span></div>
                      </div>
                    </div>

                    <div className="streak-fire-box">
                      <div className="fire-icon-wrap">
                        <Flame size={24} className="flame-animated" />
                      </div>
                      <div>
                        <div className="streak-title">4-Day Discipline Streak</div>
                        <div className="streak-desc">+25 Gold Coins awarded every 24h of rule-compliant trading</div>
                      </div>
                    </div>

                    <div className="streak-progress-bar">
                      <div className="streak-fill" style={{ width: '80%' }}></div>
                    </div>

                    <div className="vault-perks-list">
                      <div className="perk-item">✓ Zero leverage breaches logged</div>
                      <div className="perk-item">✓ Mandatory stop-loss placed on 100% of trades</div>
                      <div className="perk-item">✓ 150 Coins ready to unlock Real-Time Screener</div>
                    </div>
                  </div>
                ) : (
                  /* Default Animated Protocol Card */
                  <div className="simulated-protocol-card">
                    <div className="protocol-pulse-circle" style={{ borderColor: provingRules[activeRuleIndex].color }}>
                      {provingRules[activeRuleIndex].icon}
                    </div>
                    <div className="protocol-title">{provingRules[activeRuleIndex].title}</div>
                    <div className="protocol-subtitle">{provingRules[activeRuleIndex].subtitle}</div>
                    <div className="protocol-terminal-box">
                      <div className="terminal-header">
                        <Terminal size={14} color="#10B981" />
                        <span>nonstock-engine // verified-discipline</span>
                      </div>
                      <div className="terminal-body">
                        <div>&gt; verifying account id: NS-c141ad16... [OK]</div>
                        <div>&gt; checking trade execution ledger... 0 violations</div>
                        <div>&gt; risk-to-reward ratio: 1:2.8 [VERIFIED]</div>
                        <div>&gt; status: 100% AUTHENTIC NON-TIPSTER ACCOUNT</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. SECTION: ZIG-ZAG FEATURE SHOWCASE ─── */}
      <section id="features-zigzag" className="section zigzag-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Compass size={16} className="text-green" />
              <span>THE COMPLETE PLATFORM ARSENAL</span>
            </div>
            <h2 className="section-heading">
              Engineered For Institutional Precision. <br />
              <span className="text-green">Built For Real Market Mastery.</span>
            </h2>
            <p className="section-subheading">
              Scroll down to explore each core module of NonStock in full detail. Every tool is interconnected with real-time exchange data, AI auditing, and verifiable risk rankings.
            </p>
          </div>

          {/* Alternating Zig-Zag Grid */}
          <div className="zigzag-container">
            {zigZagFeatures.map((feat, index) => {
              const isEven = index % 2 === 1; // Alternating zig-zag
              return (
                <div 
                  key={feat.id} 
                  id={feat.id}
                  className={`zigzag-item ${isEven ? 'reverse' : ''}`}
                >
                  {/* Visual / Screenshot Column */}
                  <div className="zigzag-visual-col">
                    <div className="zigzag-window-card">
                      <div className="window-header-bar">
                        <div className="window-dots">
                          <span className="dot red"></span>
                          <span className="dot yellow"></span>
                          <span className="dot green"></span>
                        </div>
                        <span className="window-title-text">
                          NonStock // {feat.tagText}
                        </span>
                        <span className="window-status-pill">Implemented</span>
                      </div>

                      <div className="window-image-wrapper">
                        <img 
                          src={feat.image} 
                          alt={feat.title} 
                          className="window-img"
                        />
                      </div>

                      <div className="window-footer-bar">
                        <span className="caption-icon">📸</span>
                        <span className="caption-text">{feat.imageCaption}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description / Content Column */}
                  <div className="zigzag-text-col">
                    <div className="zigzag-badge-row">
                      <span className="zigzag-pill" style={{ color: feat.badgeColor, background: `${feat.badgeColor}12`, borderColor: `${feat.badgeColor}30` }}>
                        {feat.badge}
                      </span>
                      <span className="zigzag-index">FEATURE 0{index + 1}</span>
                    </div>

                    <h3 className="zigzag-title">{feat.title}</h3>
                    <p className="zigzag-subtitle">{feat.subtitle}</p>
                    <p className="zigzag-desc">{feat.description}</p>

                    {/* Bullet Points */}
                    <div className="zigzag-bullets-box">
                      <h4 className="bullets-title">
                        <Layers size={15} className="text-green" />
                        <span>CORE CAPABILITIES INCLUDED:</span>
                      </h4>
                      <ul className="bullets-list">
                        {feat.bulletPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="bullet-item">
                            <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Trader Edge Takeaway */}
                    <div className="zigzag-edge-takeaway">
                      <Zap size={18} className="text-green flex-shrink-0" />
                      <p className="edge-takeaway-text">{feat.edgeBox}</p>
                    </div>

                    {/* Action CTA */}
                    <div className="zigzag-cta-row">
                      <Link to={feat.ctaRoute} className="btn-zigzag-cta">
                        <span>{feat.ctaText}</span>
                        <ArrowRight size={16} />
                      </Link>
                      <div className="zigzag-note">
                        <ShieldCheck size={16} className="text-green" />
                        <span>Direct Terminal Integration</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. SECTION: FAQ ACCORDION ─── */}
      <section id="faq" className="section faq-section">
        <div className="section-container faq-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Clock size={16} className="text-green" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="section-heading">Everything You Need To Know.</h2>
            <p className="section-subheading">
              Transparent answers regarding virtual balances, Groq AI calculations, and verified leaderboard integrity.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                >
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-green" /> : <ChevronDown size={18} />}
                  </div>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 6. SECTION: BOTTOM CALL TO ACTION ─── */}
      <section className="section cta-section">
        <div className="section-container">
          <div className="cta-card">
            <span className="cta-badge">JOIN THE VERIFIED ARENA TODAY</span>
            <h2 className="cta-heading">
              Ready To Prove Your True Market Edge?
            </h2>
            <p className="cta-subheading">
              Create your account in 30 seconds. Start with your $1,000 disciplined proving balance, earn Gold Coins, consult the Groq AI Mentor, and earn your place in the Global Hall of Fame.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-cta-giant">
                <span>Create Free Proving Account</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="cta-guarantees">
              <span>✓ 100% Free Forever</span>
              <span>✓ $1,000 Proving Capital</span>
              <span>✓ Groq LLaMA 3.3 AI Mentor</span>
              <span>✓ Zero Real Money At Risk</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. CLEAN FOOTER ─── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <Logo size={36} showName={true} showTagline={true} />
            <p className="footer-bio">
              NonStock is the #1 verified competitive paper trading and skill proving platform. 
              Master the markets with disciplined proving accounts, 24/7 historical replay, and Groq-powered AI coaching.
            </p>
            <div className="footer-status-pill">
              <span className="status-indicator"></span>
              <span>All Systems Operational • Real-Time Feeds Active</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <Link to="/trading">Trading Arena</Link>
            <Link to="/ai-mentor">Groq AI Mentor</Link>
            <Link to="/replay">24/7 Market Replay</Link>
            <Link to="/screener">Market Screener</Link>
            <Link to="/strategy-builder">Strategy Builder</Link>
            <Link to="/dashboard">Gold Coins Vault</Link>
          </div>

          <div className="footer-links-col">
            <h4>Account</h4>
            <Link to="/register">Create Free Account</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/dashboard">Trader Dashboard</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="disclaimer-text">
            <strong>Educational Disclaimer:</strong> NonStock is strictly a trading education, backtesting, and skill proving simulation platform. 
            All capital and margins displayed are virtual. NonStock is not a SEBI or SEC registered financial advisor or broker. 
            Past simulation performance does not guarantee future live market results.
          </p>
          <div className="copyright-text">
            © {new Date().getFullYear()} NonStock. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ─── COMPREHENSIVE WHITE & EMERALD STYLES ─── */}
      <style>{`
        .landing-root {
          min-height: 100vh;
          background: #ffffff !important;
          color: #0f172a !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Utilities */
        .text-green { color: #10B981 !important; }
        .text-highlight { color: #0F172A; font-weight: 800; }
        .flex-shrink-0 { flex-shrink: 0; }

        /* 1. Navbar */
        .landing-navbar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #E2E8F0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }
        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .navbar-link-btn {
          background: transparent;
          border: none;
          color: #475569;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .navbar-link-btn:hover {
          color: #10B981;
          background: #F0FDF4;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-nav-login {
          color: #475569;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .btn-nav-login:hover {
          color: #0F172A;
          background: #F1F5F9;
        }
        .btn-nav-cta {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #10B981;
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          padding: 9px 18px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          transition: all 0.2s;
        }
        .btn-nav-cta:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        /* 2. Hero Section */
        .hero-section {
          padding: 70px 24px 80px;
          text-align: center;
          background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
        }
        .hero-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          padding: 6px 14px;
          border-radius: 9999px;
          margin-bottom: 24px;
        }
        .badge-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 10px #10B981;
          animation: pulseGreen 2s infinite;
        }
        @keyframes pulseGreen {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .badge-text {
          font-size: 12px;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.8px;
        }
        .hero-title {
          font-size: 54px;
          font-weight: 950;
          line-height: 1.15;
          color: #0F172A;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-description {
          font-size: 18px;
          line-height: 1.6;
          color: #475569;
          max-width: 840px;
          margin: 0 auto 36px;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #10B981;
          color: #ffffff;
          text-decoration: none;
          font-size: 16px;
          font-weight: 800;
          padding: 14px 28px;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
          transition: all 0.2s ease;
        }
        .btn-hero-primary:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
        }
        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #0F172A;
          border: 1.5px solid #E2E8F0;
          font-size: 16px;
          font-weight: 800;
          padding: 14px 28px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-hero-secondary:hover {
          border-color: #10B981;
          background: #F0FDF4;
        }
        .hero-trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .trust-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }
        .trust-dot {
          color: #CBD5E1;
        }

        /* Hero Preview Window */
        .hero-preview-wrapper {
          max-width: 1060px;
          margin: 0 auto;
        }
        .hero-preview-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #E2E8F0;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }
        .hero-preview-card:hover {
          transform: translateY(-3px);
        }
        .preview-window-bar {
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .window-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }
        .dot.red { background: #EF4444; }
        .dot.yellow { background: #F59E0B; }
        .dot.green { background: #10B981; }
        .window-address {
          font-family: monospace;
          font-size: 12px;
          color: #64748B;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 4px 16px;
          border-radius: 6px;
        }
        .window-tag {
          font-size: 11px;
          font-weight: 800;
          color: #10B981;
          background: #ECFDF5;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .hero-preview-img {
          width: 100%;
          height: auto;
          display: block;
        }
        .preview-caption {
          font-size: 13px;
          color: #64748B;
          margin-top: 14px;
          font-style: italic;
        }

        /* Common Section Layout */
        .section {
          padding: 90px 24px;
        }
        .section-container {
          max-width: 1240px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 60px;
        }
        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 900;
          color: #10B981;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        .section-heading {
          font-size: 38px;
          font-weight: 950;
          line-height: 1.25;
          color: #0F172A;
          letter-spacing: -0.8px;
          margin-bottom: 16px;
        }
        .section-subheading {
          font-size: 16px;
          line-height: 1.6;
          color: #64748B;
        }

        /* ─── 3. ANIMATED PROVING RULES ENGINE ─── */
        .rules-section {
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          border-bottom: 1px solid #E2E8F0;
        }
        .rules-engine-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        .rules-tabs-nav {
          display: flex;
          border-bottom: 1.5px solid #E2E8F0;
          background: #F8FAFC;
          overflow-x: auto;
        }
        .rule-tab-btn {
          flex: 1;
          min-width: 150px;
          padding: 16px 14px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          text-align: center;
          position: relative;
          transition: all 0.2s;
        }
        .rule-tab-btn:hover {
          background: #FFFFFF;
        }
        .rule-tab-btn.active {
          background: #FFFFFF;
        }
        .rule-tab-step {
          font-size: 11px;
          font-weight: 900;
          color: #64748B;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .rule-tab-btn.active .rule-tab-step {
          color: #10B981;
        }
        .rule-tab-label {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          white-space: nowrap;
        }
        .rule-tab-indicator {
          position: absolute;
          bottom: -3px;
          left: 0;
          right: 0;
          height: 3px;
        }
        .rule-stage-content {
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .rule-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 14px;
          letter-spacing: 0.5px;
        }
        .rule-dot { opacity: 0.5; }
        .rule-stage-title {
          font-size: 28px;
          font-weight: 900;
          margin: 0 0 6px 0;
        }
        .rule-stage-subtitle {
          font-size: 15px;
          font-weight: 800;
          margin: 0 0 16px 0;
        }
        .rule-stage-desc {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }
        .rule-stage-stats-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .stats-box-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stats-box-label {
          font-size: 10px;
          font-weight: 900;
          color: #64748B;
          letter-spacing: 0.8px;
          margin-bottom: 2px;
        }
        .stats-box-value {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          font-family: monospace;
        }
        .rule-stage-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .btn-rule-autoplay {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          color: #0F172A;
          font-size: 13px;
          font-weight: 800;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-rule-autoplay:hover {
          border-color: #10B981;
          background: #F0FDF4;
        }
        .pulse-circle {
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
          animation: pulseGreen 1.5s infinite;
        }
        .rule-counter-text {
          font-size: 13px;
          font-weight: 700;
          color: #94A3B8;
        }

        /* Right Side Rule Visualizers */
        .simulated-tier-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .tier-sim-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .sim-title {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
        }
        .sim-live-tag {
          font-size: 11px;
          font-weight: 800;
          color: #10B981;
          background: #ECFDF5;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .tier-badge-showcase {
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }
        .tier-badge-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 900;
          background: #FFFFFF;
        }
        .tier-user-name {
          font-size: 18px;
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 4px;
        }
        .tier-badge-name {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .tier-slider-group {
          margin-bottom: 20px;
        }
        .slider-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }
        .equity-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #E2E8F0;
          outline: none;
          accent-color: #10B981;
          cursor: pointer;
        }
        .slider-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          color: #94A3B8;
          margin-top: 6px;
        }
        .tier-milestone-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .milestone-pill {
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 6px;
          background: #F1F5F9;
          color: #94A3B8;
          transition: all 0.2s;
        }
        .milestone-pill.done {
          background: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
        }
        .milestone-pill.done.neon {
          background: #FAF5FF;
          color: #9333EA;
          border: 1px solid #D8B4FE;
        }

        /* Vault Visualizer */
        .simulated-vault-card {
          background: #FFFFFF;
          border: 1.5px solid #FDE68A;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.08);
        }
        .vault-glow-header {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 18px;
        }
        .vault-coin-icon {
          width: 52px;
          height: 52px;
          background: #FDE68A;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vault-title {
          font-size: 11px;
          font-weight: 900;
          color: #B45309;
          letter-spacing: 0.8px;
        }
        .vault-amount {
          font-size: 32px;
          font-weight: 950;
          color: #92400E;
          line-height: 1;
        }
        .vault-sub {
          font-size: 14px;
          font-weight: 800;
          color: #B45309;
        }
        .streak-fire-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 14px;
        }
        .fire-icon-wrap {
          color: #EA580C;
        }
        .flame-animated {
          animation: flamePulse 1.5s infinite alternate;
        }
        @keyframes flamePulse {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px #F97316); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 8px #EA580C); }
        }
        .streak-title {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
        }
        .streak-desc {
          font-size: 11px;
          color: #64748B;
        }
        .streak-progress-bar {
          height: 8px;
          background: #E2E8F0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 18px;
        }
        .streak-fill {
          height: 100%;
          background: linear-gradient(90deg, #F59E0B, #EA580C);
          border-radius: 4px;
        }
        .vault-perks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .perk-item {
          font-size: 12px;
          font-weight: 700;
          color: #059669;
        }

        /* Simulated Protocol Card */
        .simulated-protocol-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 16px;
          padding: 28px;
          text-align: center;
        }
        .protocol-pulse-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 3px solid;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8FAFC;
        }
        .protocol-title {
          font-size: 20px;
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 4px;
        }
        .protocol-subtitle {
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
          margin-bottom: 20px;
        }
        .protocol-terminal-box {
          background: #0F172A;
          border-radius: 10px;
          padding: 14px;
          text-align: left;
          font-family: monospace;
        }
        .terminal-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #94A3B8;
          border-bottom: 1px solid #1E293B;
          padding-bottom: 8px;
          margin-bottom: 10px;
        }
        .terminal-body {
          font-size: 12px;
          color: #A7F3D0;
          line-height: 1.6;
        }

        /* ─── 4. ZIG-ZAG SHOWCASE SECTION ─── */
        .zigzag-section {
          background: #FFFFFF;
        }
        .zigzag-container {
          display: flex;
          flex-direction: column;
          gap: 100px;
        }
        .zigzag-item {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .zigzag-item.reverse {
          grid-template-columns: 1fr 1.15fr;
        }
        .zigzag-item.reverse .zigzag-visual-col {
          order: 2;
        }
        .zigzag-item.reverse .zigzag-text-col {
          order: 1;
        }

        /* Zig-Zag Window Mockup */
        .zigzag-window-card {
          background: #FFFFFF;
          border-radius: 18px;
          border: 1.5px solid #E2E8F0;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }
        .zigzag-window-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.09);
        }
        .window-header-bar {
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .window-title-text {
          font-family: monospace;
          font-size: 12px;
          color: #475569;
          font-weight: 700;
        }
        .window-status-pill {
          font-size: 11px;
          font-weight: 800;
          color: #10B981;
          background: #ECFDF5;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .window-image-wrapper {
          background: #F1F5F9;
          overflow: hidden;
          max-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .window-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
        }
        .window-footer-bar {
          background: #FFFFFF;
          border-top: 1px solid #F1F5F9;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #64748B;
        }
        .caption-icon { font-size: 14px; }
        .caption-text { font-style: italic; }

        /* Zig-Zag Content */
        .zigzag-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .zigzag-pill {
          font-size: 11px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid;
          letter-spacing: 0.6px;
        }
        .zigzag-index {
          font-size: 12px;
          font-weight: 800;
          color: #94A3B8;
        }
        .zigzag-title {
          font-size: 32px;
          font-weight: 950;
          color: #0F172A;
          line-height: 1.25;
          margin: 0 0 10px 0;
          letter-spacing: -0.5px;
        }
        .zigzag-subtitle {
          font-size: 16px;
          font-weight: 800;
          color: #10B981;
          margin: 0 0 16px 0;
        }
        .zigzag-desc {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin: 0 0 24px 0;
        }
        .zigzag-bullets-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .bullets-title {
          font-size: 11px;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: 0.8px;
          margin: 0 0 14px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bullets-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bullet-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: #334155;
          line-height: 1.5;
        }
        .zigzag-edge-takeaway {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .edge-takeaway-text {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: #065F46;
          line-height: 1.45;
        }
        .zigzag-cta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .btn-zigzag-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #10B981;
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          padding: 11px 22px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
          transition: all 0.2s;
        }
        .btn-zigzag-cta:hover {
          background: #059669;
          transform: translateY(-1px);
        }
        .zigzag-note {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
        }

        /* ─── 5. FAQ SECTION ─── */
        .faq-section {
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
        }
        .faq-container {
          max-width: 860px;
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .faq-item {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }
        .faq-item:hover {
          border-color: #CBD5E1;
        }
        .faq-item.open {
          border-color: #10B981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
        }
        .faq-question {
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
        }
        .faq-answer {
          padding: 0 22px 18px;
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
          border-top: 1px solid #F1F5F9;
          padding-top: 14px;
        }
        .faq-answer p { margin: 0; }

        /* ─── 6. BOTTOM CTA ─── */
        .cta-section {
          background: #FFFFFF;
          padding: 80px 24px;
        }
        .cta-card {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          color: #FFFFFF;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
        }
        .cta-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #10B981;
          background: rgba(16, 185, 129, 0.15);
          padding: 5px 12px;
          border-radius: 9999px;
          margin-bottom: 20px;
        }
        .cta-heading {
          font-size: 42px;
          font-weight: 950;
          color: #FFFFFF;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }
        .cta-subheading {
          font-size: 17px;
          color: #94A3B8;
          max-width: 640px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }
        .btn-cta-giant {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #10B981;
          color: #FFFFFF;
          text-decoration: none;
          font-size: 16px;
          font-weight: 800;
          padding: 15px 32px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
          transition: all 0.2s;
        }
        .btn-cta-giant:hover {
          background: #059669;
          transform: translateY(-2px);
        }
        .cta-guarantees {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 32px;
          flex-wrap: wrap;
          font-size: 13px;
          font-weight: 700;
          color: #A7F3D0;
        }

        /* ─── 7. FOOTER ─── */
        .landing-footer {
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          padding: 70px 24px 30px;
        }
        .footer-inner {
          max-width: 1240px;
          margin: 0 auto 50px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 50px;
        }
        .footer-bio {
          font-size: 13.5px;
          line-height: 1.6;
          color: #64748B;
          margin: 16px 0 20px;
          max-width: 400px;
        }
        .footer-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #059669;
          background: #ECFDF5;
          padding: 5px 12px;
          border-radius: 9999px;
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
        }
        .footer-links-col h4 {
          font-size: 13px;
          font-weight: 900;
          color: #0F172A;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 16px 0;
        }
        .footer-links-col a {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: #64748B;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.15s;
        }
        .footer-links-col a:hover {
          color: #10B981;
        }
        .footer-bottom {
          max-width: 1240px;
          margin: 0 auto;
          border-top: 1px solid #E2E8F0;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .disclaimer-text {
          font-size: 11.5px;
          line-height: 1.5;
          color: #94A3B8;
          max-width: 800px;
          margin: 0;
        }
        .copyright-text {
          font-size: 12px;
          font-weight: 700;
          color: #64748B;
        }

        /* ─── RESPONSIVE BREAKPOINTS ─── */
        @media (max-width: 1024px) {
          .rule-stage-content {
            grid-template-columns: 1fr;
          }
          .zigzag-item, .zigzag-item.reverse {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .zigzag-item.reverse .zigzag-visual-col {
            order: 1;
          }
          .zigzag-item.reverse .zigzag-text-col {
            order: 2;
          }
          .footer-inner {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 38px;
          }
          .section-heading {
            font-size: 28px;
          }
          .navbar-links {
            display: none;
          }
          .rules-tabs-nav {
            overflow-x: scroll;
          }
          .rule-stage-content {
            padding: 24px 16px;
          }
          .zigzag-container {
            gap: 60px;
          }
          .cta-heading {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
