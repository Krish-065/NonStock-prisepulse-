import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  ShieldCheck, Cpu, Zap, Sparkles, Clock, ArrowRight, 
  CheckCircle2, XCircle, ChevronDown, 
  ChevronUp, Bot, Activity, Target,
  Lock, AlertTriangle, Compass, Layers,
  BarChart3, RefreshCw, Coins, Crown
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

  // Active module tab for the "Explore What's Included" section
  const [activeOptionTab, setActiveOptionTab] = useState('paper');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Implemented platform modules with their exact verified UI screenshots and detailed text
  const platformOptions = [
    {
      id: 'paper',
      label: 'Virtual Paper Trading',
      badge: '$50K FREE • $1M PRO',
      icon: <Target size={18} />,
      title: 'Institutional Paper Trading Desk',
      tagline: '$50,000 Virtual Margin for Standard Accounts • $1,000,000 for Pro',
      description: 'Practice real market execution without risking personal savings. Standard accounts immediately receive $50,000 in free virtual capital to learn the ropes, while Pro accounts unlock an institutional $1,000,000 ($1M) balance for high-volume portfolio simulations with realistic exchange fills, automatic stop-loss calculation, and comprehensive P&L accounting.',
      image: '/feature-paper-trading.jpg',
      imageCaption: 'Real-time order ticket, Reliance stock chart, open positions ledger, and virtual margin.',
      includes: [
        '$50,000 virtual trading margin for standard accounts with refill capability',
        'Pro tier upgrade to $1,000,000 ($1 Million) for institutional-scale simulations',
        'Realistic Market and Limit order tickets with live execution status',
        'Real-time P&L tracking, open positions monitor, and trade execution ledger'
      ],
      traderEdge: 'Start safely with $50,000 free virtual capital, hone your edge, and scale to $1,000,000 with Pro when you are ready to simulate institutional portfolio allocations.',
      route: '/paper-trading',
      btnLabel: 'Open Virtual Trading Desk'
    },
    {
      id: 'replay',
      label: '24/7 Market Replay',
      badge: 'PRO EXCLUSIVE',
      icon: <Clock size={18} />,
      title: 'The Time Machine: Bar-by-Bar Historical Replay Engine',
      tagline: 'Trade Any Historical Day On Evenings & Weekends (Exclusive to Pro)',
      description: 'Stock exchanges close at 3:30 PM and stay closed all weekend, but evenings and weekends are when retail traders actually have free time to learn. NonStock Pro accounts unlock the state-of-the-art historical replay engine: rewind the tape to any historical session and replay candlesticks bar-by-bar at 1x to 5x speed.',
      image: '/feature-replay.jpg',
      imageCaption: 'Historical candlestick chart with bar-by-bar replay, speed pills (1x, 2x, 5x), and timeline scrubber.',
      includes: [
        'Exclusive to Pro tier accounts with unlimited historical session access',
        'Bar-by-bar historical candlestick simulation with future candle blackout',
        'Variable replay speeds (1x, 2x, 5x) with instant pause and rewind controls',
        'Practice 50+ trade setups in a single weekend without waiting for live market hours'
      ],
      traderEdge: 'Accelerate your learning curve by 10x: experience months of price action setups in just a few focused practice sessions with Pro membership.',
      route: '/upgrade-pro',
      btnLabel: 'Unlock Replay with Pro'
    },
    {
      id: 'shop',
      label: 'Capital Bailout Shop',
      badge: '1:3 RATIO BAILOUT',
      icon: <Coins size={18} />,
      title: 'Emergency Bailout Shop: Real Money to Virtual Capital',
      tagline: 'Bankrupt? Refuel with 1:3 Ratio Virtual Capital from $1,000 to $1,000,000',
      description: 'Broke your paper trading account? In the real world, reckless risk leads to bankruptcy. If your virtual portfolio balance hits $0.00, our Bailout Shop unlocks. Purchase fresh virtual capital with real money starting at a generous 1:3 ratio ($1,000 capital for $333.33) with progressive volume discounts scaling up to $1,000,000.',
      image: '/feature-paper-trading.jpg',
      imageCaption: 'Capital Bailout Shop interface with tiered capital bundles ($1k to $1M), 1:3 conversion ratios, and bankruptcy locking.',
      includes: [
        'Strict bankruptcy requirement: store only unlocks when virtual balance is $0.00',
        'Base 1:3 real-to-virtual conversion ratio ($1,000 virtual balance for $333.33)',
        'Tiered capital sizes: $1,000, $5,000, $10,000, $50,000, $100,000, $500,000, and $1,000,000',
        'Progressive discounts: larger bailout bundles receive up to 50% bonus capital',
        'Instant virtual balance credit and audit trail logging to get you back into the arena'
      ],
      traderEdge: 'Build genuine risk discipline: blowing up an account has real consequences, with a structured institutional-style bailout to resume your journey.',
      route: '/shop',
      btnLabel: 'Visit Bailout Shop'
    },
    {
      id: 'mentor',
      label: 'AI Trading Mentor',
      badge: '24/7 RISK AUDITOR',
      icon: <Bot size={18} />,
      title: 'AI Trading Coach & Pre-Trade Risk Auditor',
      tagline: 'Get Every Trade Setup Audited Before Pressing Execute',
      description: 'Over 90% of beginners fail because of emotional revenge trading and oversized position sizes. The NonStock AI Mentor audits your potential entry, evaluates your mathematical risk-to-reward ratio, and measures your emotional discipline score before you enter.',
      image: '/feature-ai-mentor.jpg',
      imageCaption: 'AI Trading Coach auditing trade setup on AAPL, verifying 1:3 risk/reward ratio, and calculating 95% emotional score.',
      includes: [
        'Pre-trade risk-to-reward ratio validation with mathematical pass/fail checks',
        'Emotional discipline scoring to prevent revenge trading after losing streaks',
        'Personalized trade setup feedback with clear stop-loss and take-profit targets',
        '24/7 interactive trading assistant ready to explain complex market dynamics'
      ],
      traderEdge: 'Having an objective algorithmic risk manager watching your trades prevents catastrophic drawdowns and enforces professional discipline.',
      route: '/ai-mentor',
      btnLabel: 'Chat with AI Mentor'
    },
    {
      id: 'lab',
      label: 'Strategy Builder',
      badge: 'NO-CODE BACKTEST',
      icon: <Cpu size={18} />,
      title: 'Drag-and-Drop Strategy Builder & Backtester',
      tagline: 'Turn Discretionary Hunches Into Tested Quantitative Rules',
      description: 'Stop guessing based on gut feel. Build algorithmic trading rules using a visual workflow connecting indicators like EMA crossovers, RSI extremes, and profit targets. Instantly run historical backtests to view win rate percentages, Sharpe ratios, and equity curves.',
      image: '/feature-strategy-lab.jpg',
      imageCaption: 'Visual logic workflow (Conditions -> Indicators -> Orders) and backtest report showing 68% win rate and equity curve.',
      includes: [
        'Visual logic-based drag-and-drop workflow (Conditions, Indicators, Buy/Sell triggers)',
        'Comprehensive Backtest Reports: Total Return, Win Rate, Profit Factor, Sharpe Ratio',
        'Visual 1-Year Equity Curve with historical Buy/Sell signal markers',
        'Stress-test your setups across trending bull rallies and volatile sideways chop'
      ],
      traderEdge: 'Rule-based quantitative setups eliminate hesitation. Backtest your ideas on past data before committing time or capital.',
      route: '/strategy-lab',
      btnLabel: 'Launch Strategy Builder'
    },
    {
      id: 'options',
      label: 'Option Greeks & Chain',
      badge: 'DERIVATIVES MATRIX',
      icon: <Activity size={18} />,
      title: 'Options Chain, Greeks Matrix & Open Interest',
      tagline: 'Analyze Delta, Theta, Gamma, Vega & Institutional Open Interest',
      description: 'Over 85% of Indian market turnover occurs in index derivatives. NonStock provides full institutional option chains with live strike prices, real-time Greeks, open interest heatmaps, and Greek curve visualizations for Nifty and Bank Nifty.',
      image: '/feature-options.jpg',
      imageCaption: 'Live Options Chain for Calls & Puts with strike matrix, Open Interest, and visual Delta, Gamma & Theta curves.',
      includes: [
        'Real-time strike-by-strike Call and Put matrices with Bid, Ask, Vol, and OI',
        'Institutional Greeks matrix: Delta sensitivity, Gamma acceleration, Theta time-decay',
        'Visual Greek decay curves mapping options sensitivity over time to expiration',
        'Open Interest (OI) analysis to identify smart money support and resistance walls'
      ],
      traderEdge: 'Never buy options blindly based on price alone. Understand time decay (Theta) and implied volatility to protect your capital.',
      route: '/fno',
      btnLabel: 'Explore Option Greeks'
    }
  ];

  const currentOption = platformOptions.find(o => o.id === activeOptionTab) || platformOptions[0];

  const faqs = [
    {
      q: 'Is NonStock really free to use?',
      a: 'Yes, NonStock is completely free to start. Standard accounts immediately get $50,000 in free virtual capital upon signup, full access to the AI trading coach, the strategy backtester, and live options Greeks without any subscription fees or credit card requirements. Advanced modern capabilities like the 24/7 Market Replay Engine and a $1,000,000 virtual balance are exclusive to Pro accounts.'
    },
    {
      q: 'Do I need a broker or Demat account to use NonStock?',
      a: 'No Demat account or broker integration is needed. NonStock is an independent educational and simulation platform designed to help you practice and build confidence before you trade with real money.'
    },
    {
      q: 'Can I practice trading during weekends and evenings?',
      a: 'Yes! Pro accounts unlock the 24/7 Market Replay Engine, which allows you to rewind the tape and replay past market sessions bar-by-bar at variable speeds (1x to 5x) any time of the day or night, even when live exchanges are closed.'
    },
    {
      q: 'How does the AI Trading Mentor work?',
      a: 'The AI Mentor acts as your algorithmic risk officer. Before you execute a trade, it checks your entry logic, evaluates your risk-to-reward ratio, verifies your stop loss, and scores your emotional discipline to prevent revenge trading.'
    },
    {
      q: 'What assets and markets can I simulate on NonStock?',
      a: 'NonStock supports Indian equities (NSE & BSE Nifty 50, Bank Nifty, Midcaps), index futures and options with complete option chains, and major global commodities and crypto pairs.'
    },
    {
      q: 'What happens if my virtual balance is completely depleted?',
      a: 'Standard accounts receive $50,000 virtual refills, while Pro accounts get $1,000,000 refills. If you hit complete bankruptcy ($0.00 balance), you can visit the Bailout Shop to buy fresh paper trading funds with real money at a 1:3 ratio, with tiered options ranging from $1,000 up to $1,000,000 with volume bonuses.'
    }
  ];

  return (
    <div className="landing-root">
      {/* 1. CLEAN STICKY NAVBAR - Only brand, Explore What's Included, Problems We Solve, and Auth buttons */}
      <nav className="landing-navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <Logo size={36} showName={true} showTagline={true} />
          </Link>

          <div className="navbar-links">
            <button 
              onClick={() => scrollToSection('explore-options')} 
              className="navbar-link-btn"
            >
              <Compass size={16} className="link-icon" />
              <span>Explore What's Included</span>
            </button>
            <button 
              onClick={() => scrollToSection('problems')} 
              className="navbar-link-btn"
            >
              <AlertTriangle size={16} className="link-icon" />
              <span>Problems We Solve</span>
            </button>
          </div>

          <div className="navbar-actions">
            <Link to="/login" className="btn-nav-login">Sign In</Link>
            <Link to="/register" className="btn-nav-cta">
              <span>Start Free</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION - Clean White Background with Real UI Preview */}
      <header className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span className="badge-text">SMART TRADING SIMULATION PLATFORM • 100% FREE</span>
          </div>

          <h1 className="hero-title">
            Master The Stock Market With <br />
            <span className="hero-gradient-text">Zero Financial Risk.</span>
          </h1>

          <p className="hero-description">
            Practice real market execution with <strong className="text-highlight">$50,000 free virtual capital</strong> for standard accounts 
            (upgradeable to <strong className="text-highlight">$1,000,000 for Pro</strong>). 
            Replay historical trading sessions with Pro, build tested quantitative strategies, 
            and get coached 24/7 by an institutional AI mentor — completely free to start.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">
              <span>Start Free Trading</span>
              <ArrowRight size={18} />
            </Link>
            <button onClick={() => scrollToSection('explore-options')} className="btn-hero-secondary">
              <Compass size={18} className="text-green" />
              <span>Explore What's Included</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="hero-trust-row">
            <div className="trust-pill">
              <ShieldCheck size={16} className="text-green" />
              <span>$50,000 Free Virtual Capital ($1M Pro)</span>
            </div>
            <div className="trust-dot">•</div>
            <div className="trust-pill">
              <Zap size={16} className="text-green" />
              <span>Real-Time Market Execution</span>
            </div>
            <div className="trust-dot">•</div>
            <div className="trust-pill">
              <Clock size={16} className="text-green" />
              <span>24/7 Market Replay (Pro)</span>
            </div>
            <div className="trust-dot">•</div>
            <div className="trust-pill">
              <Lock size={16} className="text-green" />
              <span>Zero Brokerage & Zero Risk</span>
            </div>
          </div>

          {/* Real Implemented Platform Interface Preview */}
          <div className="hero-preview-wrapper">
            <div className="hero-preview-card">
              <div className="preview-window-bar">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="window-address">
                  nonstock.trade // live execution desk & market analytics
                </div>
                <div className="window-tag">Verified Platform</div>
              </div>
              <img 
                src="/hero-preview.jpg" 
                alt="NonStock Live Trading Desk and Analytics Interface" 
                className="hero-preview-img"
              />
            </div>
            <p className="preview-caption">
              Actual NonStock desktop interface: Real-time stock charting, active watchlist, live order execution ticket, and AI trading insights.
            </p>
          </div>
        </div>
      </header>

      {/* 3. SECTION: EXPLORE WHAT'S INCLUDED - Perfect Text Beside Verified Real Images */}
      <section id="explore-options" className="section explore-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Compass size={16} className="text-green" />
              <span>EXPLORE WHAT'S INCLUDED</span>
            </div>
            <h2 className="section-heading">
              Everything You Need To Master Trading. <br />
              <span className="text-green">Built Specifically For Serious Indian Traders.</span>
            </h2>
            <p className="section-subheading">
              Select any core module below to inspect its exact capabilities and see the real platform interface in action.
            </p>
          </div>

          {/* Module Selector Navigation Tabs */}
          <div className="module-tabs-nav">
            {platformOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveOptionTab(opt.id)}
                className={`module-tab-btn ${activeOptionTab === opt.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{opt.icon}</span>
                <span className="tab-label">{opt.label}</span>
                <span className="tab-badge">{opt.badge}</span>
              </button>
            ))}
          </div>

          {/* Interactive Feature Display Card: Text on Left, Verified Real Image on Right */}
          <div className="feature-detail-card">
            <div className="feature-detail-text">
              <div className="feature-badge-row">
                <span className="feature-pill">{currentOption.badge}</span>
                <span className="feature-index">
                  MODULE 0{platformOptions.findIndex(o => o.id === currentOption.id) + 1}
                </span>
              </div>

              <h3 className="feature-title">{currentOption.title}</h3>
              <p className="feature-tagline">{currentOption.tagline}</p>
              <p className="feature-description">{currentOption.description}</p>

              <div className="feature-includes-panel">
                <h4 className="panel-title">
                  <Layers size={16} className="text-green" />
                  <span>WHAT THIS MODULE INCLUDES:</span>
                </h4>
                <ul className="includes-list">
                  {currentOption.includes.map((inc, i) => (
                    <li key={i} className="includes-item">
                      <CheckCircle2 size={16} className="text-green flex-shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="feature-edge-box">
                <Zap size={18} className="text-green flex-shrink-0" />
                <p className="edge-text">{currentOption.traderEdge}</p>
              </div>

              <div className="feature-cta-row">
                <Link to={currentOption.route} className="btn-feature-cta">
                  <span>{currentOption.btnLabel}</span>
                  <ArrowRight size={16} />
                </Link>
                <div className="feature-free-note">
                  <ShieldCheck size={16} className="text-green" />
                  <span>
                    {currentOption.badge === 'PRO EXCLUSIVE' 
                      ? 'Exclusive to Pro Tier' 
                      : (currentOption.badge === '1:3 RATIO BAILOUT'
                          ? '1:3 Capital Ratio • On Bankruptcy'
                          : '100% Free • No Subscription')}
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Real Image Beside The Description */}
            <div className="feature-detail-visual">
              <div className="visual-frame">
                <div className="visual-top-bar">
                  <div className="visual-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <span className="visual-title">
                    NonStock // {currentOption.label}
                  </span>
                  <span className="visual-live-pill">Implemented</span>
                </div>

                <div className="visual-img-container">
                  <img 
                    src={currentOption.image} 
                    alt={currentOption.title} 
                    className="visual-actual-img"
                  />
                </div>

                <div className="visual-footer">
                  <p className="visual-caption-text">
                    <strong>Screenshot:</strong> {currentOption.imageCaption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: PROBLEMS WE SOLVE - Real Solutions For Retail Trader Traps */}
      <section id="problems" className="section problems-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <AlertTriangle size={16} className="text-green" />
              <span>THE HARSH TRUTH ABOUT RETAIL TRADING</span>
            </div>
            <h2 className="section-heading">
              91% of Beginners Lose Their Savings In The First 90 Days. <br />
              <span className="text-green">Here Is How NonStock Fixes Every Single Trap.</span>
            </h2>
            <p className="section-subheading">
              Most traders fail because real broker platforms provide zero safety nets, freeze over weekends, 
              and charge high brokerage fees while you are still learning. NonStock was engineered to solve every single failure point.
            </p>
          </div>

          <div className="problems-grid">
            {/* Trap 1 */}
            <div className="problem-card">
              <div className="trap-header error">
                <XCircle size={15} />
                <span>BRUTAL TRAP #1</span>
              </div>
              <h3 className="trap-title">Losing Your Savings While Just Learning</h3>
              <p className="trap-description">
                Beginners jump directly into broker apps with real capital, make rookie sizing errors on market orders, 
                and lose their hard-earned money before they ever understand how markets move.
              </p>
              <div className="solution-box">
                <div className="solution-tag">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>THE NONSTOCK FIX</span>
                </div>
                <h4 className="solution-title">$50,000 Free Virtual Capital (Up to $1,000,000 Pro)</h4>
                <p className="solution-description">
                  Trade with full virtual funds using real exchange depth, realistic execution, and live P&L accounting. 
                  Standard accounts get $50,000 completely free, and Pro users get $1,000,000 to test large-scale portfolio strategies.
                </p>
              </div>
            </div>

            {/* Trap 2 */}
            <div className="problem-card highlight">
              <div className="trap-header error">
                <XCircle size={15} />
                <span>BRUTAL TRAP #2</span>
              </div>
              <h3 className="trap-title">Markets Closed When You Have Free Time</h3>
              <p className="trap-description">
                Students and professionals only have free time during evenings and weekends, but live stock exchanges 
                are completely frozen. You cannot practice live decision-making when you actually have time.
              </p>
              <div className="solution-box highlight-solution">
                <div className="solution-tag">
                  <Sparkles size={16} className="text-green" />
                  <span>THE NONSTOCK FIX</span>
                </div>
                <h4 className="solution-title">The Time Machine: 24/7 Market Replay (Pro)</h4>
                <p className="solution-description">
                  Rewind the charts to any historical date (Budget days, election sessions, sharp breakouts) with Pro membership. 
                  Replay candles bar-by-bar at up to 5x speed and test 50 setups in one weekend.
                </p>
              </div>
            </div>

            {/* Trap 3 */}
            <div className="problem-card">
              <div className="trap-header error">
                <XCircle size={15} />
                <span>BRUTAL TRAP #3</span>
              </div>
              <h3 className="trap-title">Account Blowouts With Zero Second Chances</h3>
              <p className="trap-description">
                In real trading, blowing up an account ends your career. Typical paper apps offer infinite fake clicks that disconnect traders from reality and cultivate reckless habits.
              </p>
              <div className="solution-box">
                <div className="solution-tag">
                  <Coins size={16} className="text-green" />
                  <span>THE NONSTOCK FIX</span>
                </div>
                <h4 className="solution-title">1:3 Ratio Capital Bailout Shop</h4>
                <p className="solution-description">
                  When a virtual portfolio drops to $0.00, our Bailout Shop unlocks with a 1:3 real-to-virtual ratio ($1,000 up to $1,000,000). Traders maintain psychological stakes and a structured path to recapitalize.
                </p>
              </div>
            </div>

            {/* Trap 4 */}
            <div className="problem-card">
              <div className="trap-header error">
                <XCircle size={15} />
                <span>BRUTAL TRAP #4</span>
              </div>
              <h3 className="trap-title">Revenge Trading & Emotional Tilt</h3>
              <p className="trap-description">
                Without a senior trader watching over your shoulder, consecutive losses trigger anger, revenge trading, 
                and oversize betting that blows up accounts in a single afternoon.
              </p>
              <div className="solution-box">
                <div className="solution-tag">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>THE NONSTOCK FIX</span>
                </div>
                <h4 className="solution-title">24/7 AI Mentor & Risk Auditor</h4>
                <p className="solution-description">
                  Our integrated AI analyzes your potential entries, validates your risk-to-reward ratio, 
                  and flags emotional discipline scores before you hit execute.
                </p>
              </div>
            </div>

            {/* Trap 5 */}
            <div className="problem-card">
              <div className="trap-header error">
                <XCircle size={15} />
                <span>BRUTAL TRAP #5</span>
              </div>
              <h3 className="trap-title">Discretionary Guesswork Instead of Rules</h3>
              <p className="trap-description">
                Most traders execute randomly based on YouTube tips or gut feel, without ever knowing their strategy's 
                historical win rate or maximum drawdown percentage.
              </p>
              <div className="solution-box">
                <div className="solution-tag">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>THE NONSTOCK FIX</span>
                </div>
                <h4 className="solution-title">Visual Drag-and-Drop Strategy Lab</h4>
                <p className="solution-description">
                  Construct precise rule sets with indicators (EMA, RSI, MACD) and run instant 1-year backtests to verify 
                  win rates, Sharpe ratios, and equity curves before executing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: PLATFORM COMPARISON */}
      <section className="section comparison-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <ShieldCheck size={16} className="text-green" />
              <span>HOW WE COMPARE</span>
            </div>
            <h2 className="section-heading">
              Why Disciplined Traders Choose NonStock.
            </h2>
            <p className="section-subheading">
              See how NonStock stacks up against real money brokerages and expensive charting services.
            </p>
          </div>

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Platform Feature</th>
                  <th className="highlight-column">
                    <span className="table-brand">NonStock</span>
                    <small>The Free Smart Simulator</small>
                  </th>
                  <th>
                    <span>Traditional Brokers</span>
                    <small>Zerodha / Groww / Angel</small>
                  </th>
                  <th>
                    <span>Paid Charting</span>
                    <small>TradingView Pro</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Virtual Learning Margin</strong></td>
                  <td className="highlight-column text-green font-bold">$50,000 Free (Standard) / $1,000,000 (Pro)</td>
                  <td className="text-muted">₹0 (Real money only)</td>
                  <td className="text-muted">Paper trade only on US data</td>
                </tr>
                <tr>
                  <td><strong>24/7 Historical Bar Replay</strong></td>
                  <td className="highlight-column text-green font-bold">Pro Tier (1x-5x Speed)</td>
                  <td className="text-muted">Not available</td>
                  <td className="text-muted">$30 - $60 / month paywall</td>
                </tr>
                <tr>
                  <td><strong>AI Mentor Pre-Trade Audit</strong></td>
                  <td className="highlight-column text-green font-bold">Included 24/7</td>
                  <td className="text-muted">Not available</td>
                  <td className="text-muted">Not available</td>
                </tr>
                <tr>
                  <td><strong>Live Option Greeks & OI</strong></td>
                  <td className="highlight-column text-green font-bold">Live Nifty & BankNifty</td>
                  <td className="text-muted">Basic tables only</td>
                  <td className="text-muted">Additional data subscriptions</td>
                </tr>
                <tr>
                  <td><strong>Bankruptcy Bailout Shop</strong></td>
                  <td className="highlight-column text-green font-bold">1:3 Ratio ($1k up to $1M)</td>
                  <td className="text-muted">Deposit more real savings</td>
                  <td className="text-muted">Not available</td>
                </tr>
                <tr>
                  <td><strong>No-Code Strategy Backtester</strong></td>
                  <td className="highlight-column text-green font-bold">Visual drag-and-drop</td>
                  <td className="text-muted">Not available</td>
                  <td className="text-muted">Requires Pine Script coding</td>
                </tr>
                <tr>
                  <td><strong>Annual Cost</strong></td>
                  <td className="highlight-column text-green font-bold">₹0 Free to Start ($50k)</td>
                  <td className="text-muted">₹5,000+ in brokerages & losses</td>
                  <td className="text-muted">$360+/year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. SECTION: FAQ ACCORDION */}
      <section className="section faq-section">
        <div className="section-container faq-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Clock size={16} className="text-green" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="section-heading">Got Questions? We Have Answers.</h2>
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

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="section cta-section">
        <div className="section-container">
          <div className="cta-card">
            <span className="cta-badge">GET STARTED IN UNDER 60 SECONDS</span>
            <h2 className="cta-heading">
              Build Your Trading Edge With $50,000 Free Virtual Capital.
            </h2>
            <p className="cta-subheading">
              Join disciplined traders practicing real execution, historical replay, and AI coaching. 
              Start free with $50,000 or scale to $1,000,000 with Pro. No credit card required.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-cta-giant">
                <span>Create Free Account</span>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="cta-guarantees">
              <span>✓ 100% Free Forever</span>
              <span>✓ $50,000 Starting Margin</span>
              <span>✓ $1,000,000 Pro Tier</span>
              <span>✓ Zero Real Money At Risk</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLEAN LIGHT FOOTER */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <Logo size={36} showName={true} showTagline={true} />
            <p className="footer-bio">
              NonStock is the modern stock market simulation and paper trading platform. 
              Master the markets with $50,000 free virtual capital (up to $1,000,000 Pro), 24/7 historical replay, and AI-powered risk coaching.
            </p>
            <div className="footer-status-pill">
              <span className="status-indicator"></span>
              <span>All Systems Operational • Real-time Feeds</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <button onClick={() => scrollToSection('explore-options')} className="footer-text-btn">
              Explore What's Included
            </button>
            <button onClick={() => scrollToSection('problems')} className="footer-text-btn">
              Problems We Solve
            </button>
            <Link to="/paper-trading">Virtual Trading Desk</Link>
            <Link to="/shop">Capital Bailout Shop</Link>
            <Link to="/upgrade-pro">NonStock Pro</Link>
            <Link to="/fno">Option Greeks Chain</Link>
            <Link to="/strategy-lab">Strategy Builder</Link>
          </div>

          <div className="footer-links-col">
            <h4>Account</h4>
            <Link to="/register">Create Free Account</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/terms">Terms & Disclaimer</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="disclaimer-text">
            <strong>Educational Disclaimer:</strong> NonStock is strictly a trading education, backtesting, and simulation platform. 
            All capital and margins displayed are virtual. NonStock is not a SEBI-registered broker or financial advisor. 
            Past performance in historical replay does not guarantee future market returns.
          </p>
          <div className="copyright-text">
            © {new Date().getFullYear()} NonStock. All rights reserved.
          </div>
        </div>
      </footer>

      {/* COMPREHENSIVE PURE WHITE THEME STYLES */}
      <style>{`
        /* Root container: Pure White Background */
        .landing-root {
          min-height: 100vh;
          background: #ffffff !important;
          color: #0f172a !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Generic Utilities */
        .text-green { color: #00a854 !important; }
        .text-muted { color: #64748b !important; }
        .text-highlight { color: #0f172a; font-weight: 800; }
        .font-bold { font-weight: 800; }
        .flex-shrink-0 { flex-shrink: 0; }

        /* 1. Navbar: Pure Crisp White with Soft Shadow */
        .landing-navbar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
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
          gap: 12px;
        }
        .navbar-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid transparent;
          padding: 8px 16px;
          border-radius: 12px;
          color: #475569;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .navbar-link-btn:hover {
          color: #00a854;
          background: #f0fdf4;
          border-color: #bbf7d0;
        }
        .link-icon {
          color: #00a854;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-nav-login {
          color: #334155;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .btn-nav-login:hover {
          color: #00a854;
          background: #f8fafc;
        }
        .btn-nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #00a854;
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          padding: 9px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(0, 168, 84, 0.25);
          transition: all 0.2s;
        }
        .btn-nav-cta:hover {
          background: #009147;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 168, 84, 0.35);
        }

        /* 2. Hero Section */
        .hero-section {
          background: radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0, 168, 84, 0.08) 0%, #ffffff 75%);
          padding: 60px 24px 80px;
          text-align: center;
        }
        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 30px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          margin-bottom: 24px;
        }
        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00a854;
          box-shadow: 0 0 10px #00a854;
        }
        .badge-text {
          font-size: 11.5px;
          font-weight: 800;
          color: #166534;
          letter-spacing: 0.8px;
        }
        .hero-title {
          font-size: 52px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -1.2px;
          color: #090e17;
          margin-bottom: 20px;
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, #00a854 0%, #064e3b 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .hero-description {
          font-size: 18px;
          color: #475569;
          line-height: 1.6;
          max-width: 820px;
          margin: 0 auto 36px;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #00a854;
          color: #ffffff;
          text-decoration: none;
          font-size: 16px;
          font-weight: 800;
          padding: 14px 32px;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 168, 84, 0.3);
          transition: all 0.25s ease;
        }
        .btn-hero-primary:hover {
          background: #009147;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 168, 84, 0.4);
        }
        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          font-size: 16px;
          font-weight: 800;
          padding: 14px 28px;
          border-radius: 16px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.25s ease;
        }
        .btn-hero-secondary:hover {
          border-color: #00a854;
          color: #00a854;
          transform: translateY(-2px);
        }
        .hero-trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 50px;
        }
        .trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }
        .trust-dot {
          color: #94a3b8;
        }

        /* Hero Preview Image Display */
        .hero-preview-wrapper {
          max-width: 1060px;
          margin: 0 auto;
        }
        .hero-preview-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 0 40px rgba(0, 168, 84, 0.08);
          transition: transform 0.3s ease;
        }
        .hero-preview-card:hover {
          transform: translateY(-3px);
        }
        .preview-window-bar {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .window-dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot.red { background: #ef4444; }
        .dot.yellow { background: #f59e0b; }
        .dot.green { background: #10b981; }
        .window-address {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
          font-family: monospace;
        }
        .window-tag {
          font-size: 11px;
          font-weight: 800;
          color: #00a854;
          background: #f0fdf4;
          padding: 2px 10px;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }
        .hero-preview-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }
        .preview-caption {
          font-size: 13.5px;
          color: #64748b;
          margin-top: 14px;
          font-weight: 600;
        }

        /* 3. Section Headers & Generic Containers */
        .section {
          padding: 80px 24px;
          position: relative;
        }
        .section-container {
          max-width: 1240px;
          margin: 0 auto;
        }
        .section-header {
          text-align: center;
          max-width: 860px;
          margin: 0 auto 50px;
        }
        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.2px;
          color: #00a854;
          margin-bottom: 12px;
        }
        .section-heading {
          font-size: 40px;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.8px;
          color: #090e17;
          margin-bottom: 16px;
        }
        .section-subheading {
          font-size: 17px;
          color: #475569;
          line-height: 1.6;
        }

        /* 4. Explore Section & Module Tabs */
        .explore-section {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }
        .module-tabs-nav {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .module-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 10px 18px;
          border-radius: 14px;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          transition: all 0.25s ease;
        }
        .module-tab-btn:hover {
          border-color: #00a854;
          color: #00a854;
          transform: translateY(-2px);
        }
        .module-tab-btn.active {
          background: #00a854;
          border-color: #00a854;
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(0, 168, 84, 0.35);
        }
        .tab-badge {
          font-size: 9px;
          font-weight: 900;
          background: #f1f5f9;
          color: #0f172a;
          padding: 2px 7px;
          border-radius: 8px;
        }
        .module-tab-btn.active .tab-badge {
          background: #ffffff;
          color: #00a854;
        }

        /* Two-Column Feature Card */
        .feature-detail-card {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 44px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.05);
          align-items: center;
        }
        .feature-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .feature-pill {
          font-size: 11px;
          font-weight: 900;
          color: #00a854;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 3px 10px;
          border-radius: 10px;
        }
        .feature-index {
          font-size: 11.5px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 1px;
        }
        .feature-title {
          font-size: 30px;
          font-weight: 900;
          color: #090e17;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .feature-tagline {
          font-size: 16px;
          font-weight: 800;
          color: #00a854;
          margin-bottom: 16px;
        }
        .feature-description {
          font-size: 15px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .feature-includes-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 20px;
        }
        .panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.8px;
          color: #0f172a;
          margin-bottom: 14px;
        }
        .includes-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .includes-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: #334155;
          line-height: 1.5;
        }
        .feature-edge-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 14px 18px;
          margin-bottom: 28px;
        }
        .edge-text {
          font-size: 13px;
          color: #166534;
          line-height: 1.5;
          margin: 0;
        }
        .feature-cta-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }
        .btn-feature-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #00a854;
          color: #ffffff;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
          padding: 12px 26px;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0, 168, 84, 0.25);
          transition: all 0.2s;
        }
        .btn-feature-cta:hover {
          background: #009147;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 168, 84, 0.35);
        }
        .feature-free-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #475569;
          font-weight: 700;
        }

        /* Right Image Frame */
        .feature-detail-visual {
          width: 100%;
        }
        .visual-frame {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s;
        }
        .visual-frame:hover {
          transform: scale(1.01);
        }
        .visual-top-bar {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .visual-dots {
          display: flex;
          gap: 5px;
        }
        .visual-title {
          font-size: 12px;
          font-weight: 800;
          color: #475569;
        }
        .visual-live-pill {
          font-size: 10px;
          font-weight: 900;
          color: #00a854;
          background: #f0fdf4;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1px solid #bbf7d0;
        }
        .visual-img-container {
          background: #ffffff;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .visual-actual-img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          display: block;
          object-fit: cover;
        }
        .visual-footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 10px 16px;
        }
        .visual-caption-text {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }

        /* 5. Problems We Solve Section */
        .problems-section {
          background: #ffffff;
        }
        .problems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 28px;
        }
        .problem-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.25s ease;
        }
        .problem-card:hover {
          border-color: #cbd5e1;
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
        }
        .problem-card.highlight {
          border-color: #86efac;
          box-shadow: 0 8px 25px rgba(0, 168, 84, 0.08);
        }
        .trap-header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.8px;
          padding: 4px 12px;
          border-radius: 10px;
          margin-bottom: 14px;
          align-self: flex-start;
        }
        .trap-header.error {
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }
        .trap-title {
          font-size: 20px;
          font-weight: 900;
          color: #090e17;
          margin-bottom: 10px;
          line-height: 1.3;
        }
        .trap-description {
          font-size: 14.5px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .solution-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 18px 20px;
        }
        .solution-box.highlight-solution {
          background: #ecfdf5;
          border-color: #86efac;
        }
        .solution-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 900;
          color: #00a854;
          letter-spacing: 0.8px;
          margin-bottom: 6px;
        }
        .solution-title {
          font-size: 16px;
          font-weight: 900;
          color: #090e17;
          margin-bottom: 6px;
        }
        .solution-description {
          font-size: 13.5px;
          color: #166534;
          line-height: 1.5;
          margin: 0;
        }

        /* 6. Comparison Section */
        .comparison-section {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }
        .comparison-table-wrap {
          overflow-x: auto;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .comparison-table th, .comparison-table td {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }
        .comparison-table th {
          background: #f8fafc;
          font-size: 15px;
          font-weight: 800;
          color: #090e17;
        }
        .comparison-table th small {
          display: block;
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          margin-top: 2px;
        }
        .comparison-table .highlight-column {
          background: #f0fdf4;
          border-left: 1px solid #86efac;
          border-right: 1px solid #86efac;
        }
        .table-brand {
          color: #00a854;
          font-weight: 900;
          font-size: 16px;
        }

        /* 7. FAQ Section */
        .faq-section {
          background: #ffffff;
        }
        .faq-container {
          max-width: 860px;
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .faq-item {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 20px 24px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }
        .faq-item:hover {
          border-color: #00a854;
        }
        .faq-item.open {
          border-color: #00a854;
          background: #fafffb;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16.5px;
          font-weight: 800;
          color: #090e17;
        }
        .faq-answer {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          font-size: 14.5px;
          color: #475569;
          line-height: 1.6;
        }

        /* 8. Bottom CTA */
        .cta-section {
          background: #ffffff;
          padding-bottom: 100px;
        }
        .cta-card {
          background: radial-gradient(circle at 50% 0%, #ecfdf5 0%, #ffffff 80%);
          border: 1px solid #86efac;
          border-radius: 28px;
          padding: 64px 36px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 168, 84, 0.1);
        }
        .cta-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 900;
          color: #00a854;
          letter-spacing: 1.5px;
          background: #f0fdf4;
          padding: 4px 14px;
          border-radius: 14px;
          margin-bottom: 20px;
          border: 1px solid #bbf7d0;
        }
        .cta-heading {
          font-size: 42px;
          font-weight: 900;
          line-height: 1.2;
          color: #090e17;
          letter-spacing: -0.8px;
          margin-bottom: 18px;
        }
        .cta-subheading {
          font-size: 17px;
          color: #475569;
          max-width: 680px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }
        .btn-cta-giant {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #00a854;
          color: #ffffff;
          text-decoration: none;
          font-size: 17px;
          font-weight: 900;
          padding: 16px 42px;
          border-radius: 30px;
          box-shadow: 0 8px 25px rgba(0, 168, 84, 0.35);
          transition: all 0.25s;
        }
        .btn-cta-giant:hover {
          background: #009147;
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(0, 168, 84, 0.45);
        }
        .cta-guarantees {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 28px;
          font-size: 13.5px;
          color: #64748b;
          font-weight: 700;
          flex-wrap: wrap;
        }

        /* 9. Light Footer */
        .landing-footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 70px 24px 40px;
        }
        .footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 50px;
        }
        .footer-bio {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 18px 0;
          max-width: 420px;
        }
        .footer-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #00a854;
          font-weight: 700;
          background: #f0fdf4;
          padding: 4px 12px;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00a854;
          box-shadow: 0 0 8px #00a854;
        }
        .footer-links-col h4 {
          font-size: 14px;
          font-weight: 900;
          color: #090e17;
          margin-bottom: 18px;
          letter-spacing: 0.5px;
        }
        .footer-links-col a, .footer-text-btn {
          display: block;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 12px;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }
        .footer-links-col a:hover, .footer-text-btn:hover {
          color: #00a854;
        }
        .footer-bottom {
          max-width: 1240px;
          margin: 0 auto;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 32px;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.6;
        }
        .disclaimer-text {
          max-width: 800px;
          margin: 0;
        }
        .copyright-text {
          white-space: nowrap;
        }

        /* 10. Responsive */
        @media (max-width: 1024px) {
          .hero-title { font-size: 40px; }
          .feature-detail-card { grid-template-columns: 1fr; gap: 30px; }
          .footer-inner { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .hero-title { font-size: 32px; }
          .hero-description { font-size: 15px; }
          .hero-actions { flex-direction: column; width: 100%; }
          .btn-hero-primary, .btn-hero-secondary { width: 100%; justify-content: center; }
          .problems-grid { grid-template-columns: 1fr; }
          .feature-detail-card { padding: 24px; }
          .cta-heading { font-size: 28px; }
          .footer-inner { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; gap: 16px; }
        }
      `}</style>
    </div>
  );
}
