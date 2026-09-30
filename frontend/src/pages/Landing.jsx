import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  TrendingUp, TrendingDown, Play, Pause, FastForward, RotateCcw, 
  Calendar, ShieldCheck, Cpu, Zap, Sparkles, Clock, ArrowRight, 
  Search, CheckCircle2, XCircle, BarChart3, ChevronDown, 
  ChevronUp, Bot, Activity, Flame, Target, LineChart,
  Lock, AlertTriangle, Compass, Sliders, ExternalLink, Layers
} from 'lucide-react';
import { apiClient } from '../services/api';

// Initial mock candles for the interactive Hero Replay Demo
const initialCandles = [
  { time: '09:15', open: 24800, high: 24860, low: 24790, close: 24840, vol: 180 },
  { time: '09:30', open: 24840, high: 24910, low: 24820, close: 24895, vol: 240 },
  { time: '09:45', open: 24895, high: 24930, low: 24870, close: 24910, vol: 210 },
  { time: '10:00', open: 24910, high: 24970, low: 24890, close: 24965, vol: 320 },
  { time: '10:15', open: 24965, high: 25020, low: 24940, close: 25010, vol: 410 },
  { time: '10:30', open: 25010, high: 25040, low: 24980, close: 24990, vol: 290 },
  { time: '10:45', open: 24990, high: 25080, low: 24975, close: 25070, vol: 380 },
  { time: '11:00', open: 25070, high: 25150, low: 25060, close: 25140, vol: 520 },
  { time: '11:15', open: 25140, high: 25190, low: 25110, close: 25160, vol: 390 },
  { time: '11:30', open: 25160, high: 25240, low: 25130, close: 25225, vol: 480 },
  { time: '11:45', open: 25225, high: 25290, low: 25200, close: 25270, vol: 510 },
  { time: '12:00', open: 25270, high: 25340, low: 25250, close: 25330, vol: 620 }
];

export default function Landing() {
  const navigate = useNavigate();

  // Public stats
  const [stats, setStats] = useState({
    activeUsers: '14,200+',
    dailyVolume: '₹5.2T',
    replayHours: '165,000+',
    capitalSaved: '₹12.4 Cr+'
  });

  const [movers, setMovers] = useState({
    gainers: [
      { symbol: 'TATASTEEL', price: 158.40, changePercent: 4.82 },
      { symbol: 'RELIANCE', price: 2984.50, changePercent: 3.15 },
      { symbol: 'HDFCBANK', price: 1682.00, changePercent: 2.64 },
      { symbol: 'INFY', price: 1890.25, changePercent: 2.18 },
      { symbol: 'ICICIBANK', price: 1245.80, changePercent: 1.95 }
    ],
    losers: [
      { symbol: 'WIPRO', price: 540.20, changePercent: -2.85 },
      { symbol: 'BAJFINANCE', price: 7120.00, changePercent: -1.94 },
      { symbol: 'ASIANPAINT', price: 3180.50, changePercent: -1.62 },
      { symbol: 'MARUTI', price: 12400.00, changePercent: -1.35 },
      { symbol: 'TITAN', price: 3620.00, changePercent: -1.10 }
    ]
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Hero Interactive Market Replay Demo state
  const [replayCandles, setReplayCandles] = useState(initialCandles.slice(0, 6));
  const [isReplaying, setIsReplaying] = useState(true);
  const [replaySpeed, setReplaySpeed] = useState(2);
  const [replayPnL, setReplayPnL] = useState(14850);
  const [currentPrice, setCurrentPrice] = useState(25010);
  const [replayStep, setReplayStep] = useState(6);

  // Interactive Options Exploration Station active tab
  const [activeOptionTab, setActiveOptionTab] = useState('replay');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Fetch Public Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/market/public-stats');
        if (res.data) {
          setStats(prev => ({
            ...prev,
            activeUsers: (res.data.activeUsers || 14200) + '+',
            dailyVolume: res.data.dailyVolume || '₹5.2T'
          }));
        }
      } catch {
        // Fallback already initialized
      }
    };
    fetchStats();
  }, []);

  // Fetch Market Data Movers
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const moversRes = await apiClient.get('/market/movers');
        if (moversRes.data) {
          const g = moversRes.data?.gainers;
          const l = moversRes.data?.losers;
          if (Array.isArray(g) && g.length > 0) {
            setMovers(prev => ({
              gainers: g.slice(0, 5),
              losers: (Array.isArray(l) && l.length > 0) ? l.slice(0, 5) : prev.losers
            }));
          }
        }
      } catch {
        // Safe fallback
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Interactive Replay Engine Tick Loop
  useEffect(() => {
    if (!isReplaying) return;
    const intervalTime = Math.max(500, 2200 / replaySpeed);
    const timer = setInterval(() => {
      setReplayStep(prev => {
        const nextStep = prev >= initialCandles.length ? 3 : prev + 1;
        const newCandles = initialCandles.slice(0, nextStep);
        setReplayCandles(newCandles);
        const lastCandle = newCandles[newCandles.length - 1];
        if (lastCandle) {
          setCurrentPrice(lastCandle.close);
          const pnlDelta = (lastCandle.close - 24840) * 50;
          setReplayPnL(Math.round(pnlDelta));
        }
        return nextStep;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isReplaying, replaySpeed]);

  // Handle Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await apiClient.get(`/market/search/${encodeURIComponent(searchQuery)}`);
          setSearchResults(res.data.slice(0, 6));
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetReplay = () => {
    setReplayStep(3);
    setReplayCandles(initialCandles.slice(0, 3));
    setCurrentPrice(initialCandles[2].close);
    setReplayPnL(3500);
    setIsReplaying(true);
  };

  // Detailed platform learning options & modules
  const platformOptions = [
    {
      id: 'replay',
      label: 'Market Replay Engine',
      badge: '100% FREE FOREVER',
      icon: <Clock size={20} />,
      title: 'The Time Machine: Bar-by-Bar Historical Replay',
      tagline: 'Trade Any Historical Day On Weekends at 1x to 10x Speed',
      description: 'The market is closed on weekends, but that is exactly when serious traders have the time to practice. NonStock eliminates the $30/month fee charged by TradingView and lets you backtest any historical session bar-by-bar with 100% blind objectivity.',
      includes: [
        'Historical tick-by-tick candlestick simulation on 1m, 5m, 15m, and 1D timeframes',
        'Future candle blackout mode so you cannot cheat your technical analysis',
        'Mid-replay paper order execution: place Buy & Sell brackets as candles print',
        'Turbo playback speeds (1x, 2x, 5x, 10x) & quick-rewind capability'
      ],
      traderEdge: 'High-Level Edge: Master pattern recognition and risk-to-reward ratios on 50+ historical trade setups every weekend before Monday morning bells ring.',
      route: '/paper-trading',
      btnLabel: 'Launch Market Replay Mode'
    },
    {
      id: 'paper',
      label: 'Virtual Trading Desk',
      badge: '₹10,00,000 VIRTUAL MARGIN',
      icon: <Target size={20} />,
      title: 'Institutional Paper Trading Terminal',
      tagline: 'Master Execution With Real Market Depth & Zero Capital Risk',
      description: 'Experience true exchange-grade execution without risking your hard-earned life savings. Practice placing Limit, Market, and Bracket orders with realistic slippage, real-time NSE/BSE pricing, and complete trade performance auditing.',
      includes: [
        'Instant ₹10,00,000 virtual trading margin with one-click balance reset',
        'Advanced multi-charting layout with TradingView & Lightweight Candlestick views',
        'Bracket orders with automatic Target and Stop-Loss (SL) execution triggers',
        'Comprehensive live P&L dashboard, win-rate analytics, and historical trade ledger'
      ],
      traderEdge: 'High-Level Edge: Professional hedge funds test every new model in simulated execution before allocating capital. Build an ironclad edge risk-free.',
      route: '/paper-trading',
      btnLabel: 'Open Virtual Trading Desk'
    },
    {
      id: 'mentor',
      label: 'AI Quant Mentor',
      badge: '24/7 QUANT COACH',
      icon: <Bot size={20} />,
      title: 'Your 24/7 Institutional Quant & Risk Officer',
      tagline: 'Get Every Trade Setup Audited Before You Press Execute',
      description: 'Retail traders fail because they have no senior risk manager to stop them from making emotional mistakes. NonStock AI Quant Mentor reviews your entry logic, calculates mathematical position sizing, and detects emotional tilt before it causes a blowup.',
      includes: [
        'Pre-trade risk-to-reward audits with automatic stop-loss calculation',
        'Technical confluence analysis: flags overbought indicators and major resistance traps',
        'Psychological tilt breaker: alerts you when you are revenge-trading after consecutive losses',
        'Interactive 24/7 derivatives tutor for options Greeks, implied volatility, and setups'
      ],
      traderEdge: 'High-Level Edge: Having an objective algorithmic assistant continuously auditing your decision-making creates disciplined, non-emotional trading habits.',
      route: '/ai-mentor',
      btnLabel: 'Chat with AI Mentor Free'
    },
    {
      id: 'options',
      label: 'F&O Option Greeks',
      badge: 'INSTITUTIONAL DERIVATIVES',
      icon: <Activity size={20} />,
      title: 'Derivatives Matrix & Real-Time Option Greeks',
      tagline: 'Analyze Delta, Theta, Gamma, Vega & Institutional Open Interest',
      description: 'Over 85% of market turnover is concentrated in index options. NonStock provides a full institutional derivatives matrix for Nifty, BankNifty, and FinNifty, exposing where smart money is writing contracts.',
      includes: [
        'Real-time NSE option chain with live strike-by-strike Call/Put matrices',
        'Institutional Greeks: Delta sensitivity, Theta time-decay, Gamma acceleration & Vega volatility',
        'Live Put-Call Ratio (PCR) and Max Pain indicators for pinpointing reversal levels',
        'Open Interest (OI) buildup heatmaps showing long build-up vs short covering'
      ],
      traderEdge: 'High-Level Edge: Stop trading options blindly based on price alone. Understand implied volatility and Greek decay to profit consistently.',
      route: '/fno',
      btnLabel: 'Explore Option Greeks Chain'
    },
    {
      id: 'lab',
      label: 'Strategy Lab & Bots',
      badge: 'ALGO SANDBOX',
      icon: <Cpu size={20} />,
      title: 'Algorithmic Strategy Builder & Sandbox Bots',
      tagline: 'Systematize Your Edge with Zero Emotional Hesitation',
      description: 'Transform discretionary hunches into mathematical rule-based algorithms. Combine technical indicators (RSI, Supertrend, Moving Averages, MACD) and deploy sandbox bots to execute simulated trades automatically.',
      includes: [
        'No-code visual strategy builder: define precise entry, exit, and stop triggers',
        'Automated sandbox bots that monitor the market and fire simulated orders instantly',
        'Deep backtest evaluation: win rate percentage, maximum drawdown, and Sharpe ratio',
        'Stress-test strategies across bull rallies, sharp crashes, and sideways chop'
      ],
      traderEdge: 'High-Level Edge: Systematic rule sets eliminate greed and fear. Validate your trading system mathematically before risking a single rupee.',
      route: '/strategy-lab',
      btnLabel: 'Launch Strategy Lab'
    },
    {
      id: 'scanner',
      label: 'Pro Screener & Heatmap',
      badge: 'SECTOR ROTATION RADAR',
      icon: <Search size={20} />,
      title: 'Institutional Market Scanner & Capital Flow Radar',
      tagline: 'Track Smart Money Moving Across Sectors in Real Time',
      description: 'Never waste time staring at stagnant stocks. NonStock scans 2,000+ equities dynamically for volume explosions, 52-week highs, and displays real-time sector heatmaps so you catch breakouts before retail notice.',
      includes: [
        'Dynamic multi-metric stock filter: volume breakouts, RSI extremes, and momentum surges',
        'Real-time Sector Rotation Heatmap: see money flow into IT, Banking, Auto, Energy, or Pharma',
        'Live market gainers, losers, and 5-minute volatility alerts updated continuously',
        'Instant one-click navigation to full-screen technical charts and order execution'
      ],
      traderEdge: 'High-Level Edge: Institutional capital always rotates into specific sectors before individual stocks rally. Catch the macro wave early.',
      route: '/screener',
      btnLabel: 'Open Stock Screener'
    }
  ];

  const currentOption = platformOptions.find(o => o.id === activeOptionTab) || platformOptions[0];

  return (
    <div className="landing-root">
      {/* Background Matrix & Subtle Cyber Grid */}
      <div className="bg-ambient-glow"></div>
      <div className="bg-grid-overlay"></div>
      <div className="bg-radial-flare"></div>

      {/* 1. Sleek Sticky Navigation (Directly at Top 0) */}
      <nav className="nav-container">
        <div className="nav-inner">
          <Link to="/" className="brand-link">
            <Logo size={40} showName={true} showTagline={true} />
          </Link>

          <div className="nav-menu">
            <button onClick={() => scrollToSection('explore-options')} className="nav-link-btn highlight-link">
              <Compass size={16} /> Explore What's Included
            </button>
            <button onClick={() => scrollToSection('problems')} className="nav-link-btn">
              Problems We Solve
            </button>
            <button onClick={() => scrollToSection('replay-engine')} className="nav-link-btn">
              <Clock size={15} /> Time Machine Replay
            </button>
            <button onClick={() => scrollToSection('terminal')} className="nav-link-btn">
              Trade Desk
            </button>
            <button onClick={() => scrollToSection('ai-mentor')} className="nav-link-btn">
              AI Mentor
            </button>
            <button onClick={() => scrollToSection('comparison')} className="nav-link-btn">
              Why NonStock
            </button>
            <button onClick={() => scrollToSection('pulse')} className="nav-link-btn">
              Live Pulse
            </button>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="btn-nav-login">Sign In</Link>
            <Link to="/register" className="btn-nav-cta">
              <span>Start Free</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="hero-wrap">
        <div className="hero-content">
          {/* Top glowing status badge */}
          <div className="hero-badge">
            <span className="badge-pulse-dot"></span>
            <span className="badge-text">THE #1 TRADING SIMULATION & MARKET REPLAY ENGINE</span>
            <span className="badge-free">100% FREE</span>
          </div>

          {/* Big Bold Commanding Headline */}
          <h1 className="hero-heading">
            Stop Losing Real Money <br />
            <span className="text-neon-gradient">Learning How To Trade.</span>
          </h1>

          {/* Subtitle with High-Contrast Visible White */}
          <p className="hero-lead">
            Practice live without risking a rupee. Replay historical market sessions on weekends, execute orders 
            with <strong className="text-white">₹10,00,000 virtual capital</strong>, and get coached 24/7 by an institutional AI mentor — 100% Free.
          </p>

          {/* Hero CTAs */}
          <div className="hero-buttons-row">
            <Link to="/register" className="btn-hero-primary">
              <span>Launch Free Trade Desk</span>
              <ArrowRight size={18} />
            </Link>
            <button onClick={() => scrollToSection('explore-options')} className="btn-hero-secondary">
              <Compass size={18} className="text-neon-green" />
              <span>Explore Platform Options</span>
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <ShieldCheck size={18} className="trust-icon" />
              <span>Zero Financial Risk</span>
            </div>
            <div className="trust-dot"></div>
            <div className="trust-item">
              <Zap size={18} className="trust-icon" />
              <span>₹10L Virtual Sandbox</span>
            </div>
            <div className="trust-dot"></div>
            <div className="trust-item">
              <Clock size={18} className="trust-icon" />
              <span>Free Weekend Bar Replay</span>
            </div>
            <div className="trust-dot"></div>
            <div className="trust-item">
              <Lock size={18} className="trust-icon" />
              <span>No Credit Card Needed</span>
            </div>
          </div>
        </div>

        {/* 3. HERO INTERACTIVE VISUALIZATION: The Live Trade & Replay Simulator */}
        <div className="hero-mockup-wrapper">
          <div className="terminal-window">
            {/* Terminal Top Bar */}
            <div className="terminal-header">
              <div className="terminal-window-buttons">
                <span className="win-btn win-red"></span>
                <span className="win-btn win-yellow"></span>
                <span className="win-btn win-green"></span>
              </div>
              <div className="terminal-title">
                <span className="terminal-symbol">NIFTY 50 • NSE</span>
                <span className="terminal-tag">5-MIN REPLAY ENGINE</span>
                <span className="live-status-pill">
                  <span className="status-blink"></span>
                  {isReplaying ? 'PRINTING LIVE CANDLES' : 'PAUSED'}
                </span>
              </div>
              <div className="terminal-header-tools">
                <span className="terminal-res">₹10,00,000 VIRTUAL MARGIN</span>
              </div>
            </div>

            {/* Replay Controls Toolbar */}
            <div className="terminal-replay-bar">
              <div className="replay-controls-left">
                <button 
                  onClick={() => setIsReplaying(!isReplaying)} 
                  className={`btn-replay-toggle ${isReplaying ? 'active' : ''}`}
                  title={isReplaying ? "Pause Replay" : "Play Replay"}
                >
                  {isReplaying ? <Pause size={15} /> : <Play size={15} fill="#000" />}
                  <span>{isReplaying ? 'Pause' : 'Play Replay'}</span>
                </button>

                <div className="speed-pills">
                  {[1, 2, 5, 10].map(s => (
                    <button
                      key={s}
                      onClick={() => setReplaySpeed(s)}
                      className={`speed-pill ${replaySpeed === s ? 'active' : ''}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <button onClick={handleResetReplay} className="btn-replay-reset" title="Rewind to Start">
                  <RotateCcw size={14} />
                  <span>Rewind</span>
                </button>
              </div>

              <div className="replay-controls-right">
                <div className="replay-date-chip">
                  <Calendar size={14} />
                  <span>Historical: Oct 14, 2024 (Budget Session)</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Candlestick Canvas / Visualization */}
            <div className="terminal-chart-area">
              <div className="chart-grid-bg"></div>

              {/* Price & Floating P&L Stats */}
              <div className="chart-floating-hud">
                <div className="hud-metric">
                  <span className="hud-label">LAST TRADED PRICE</span>
                  <span className="hud-val text-neon-green">₹{currentPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">SIMULATED POSITION</span>
                  <span className="hud-val text-white">LONG 100 QTY @ ₹24,840</span>
                </div>
                <div className="hud-metric hud-highlight">
                  <span className="hud-label">UNREALIZED P&L</span>
                  <span className={`hud-val ${replayPnL >= 0 ? 'text-neon-green' : 'text-danger'}`}>
                    {replayPnL >= 0 ? `+₹${replayPnL.toLocaleString('en-IN')}` : `-₹${Math.abs(replayPnL).toLocaleString('en-IN')}`}
                    <span className="pnl-pct"> ({replayPnL >= 0 ? '+' : ''}{((replayPnL / 124200) * 100).toFixed(1)}%)</span>
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Candles */}
              <div className="chart-svg-container">
                <svg viewBox="0 0 780 220" className="candles-svg" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="bull-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#05df72" stopOpacity="0.45" />
                    </linearGradient>
                    <linearGradient id="bear-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff4444" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#b30000" stopOpacity="0.45" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline */}
                  <line x1="0" y1="110" x2="780" y2="110" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="780" y2="60" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="160" x2="780" y2="160" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

                  {/* Entry Line Indicator */}
                  <line x1="50" y1="180" x2="780" y2="180" stroke="#00ff88" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
                  <text x="60" y="174" fill="#00ff88" fontSize="11" fontWeight="bold">Simulated Entry @ 24,840</text>

                  {/* Render candles */}
                  {replayCandles.map((c, idx) => {
                    const isBull = c.close >= c.open;
                    const x = 50 + idx * 56;
                    const minP = 24750;
                    const maxP = 25380;
                    const scaleY = (p) => 205 - ((p - minP) / (maxP - minP)) * 180;

                    const openY = scaleY(c.open);
                    const closeY = scaleY(c.close);
                    const highY = scaleY(c.high);
                    const lowY = scaleY(c.low);

                    const topBody = Math.min(openY, closeY);
                    const bodyH = Math.max(Math.abs(closeY - openY), 4);
                    const fill = isBull ? 'url(#bull-glow)' : 'url(#bear-glow)';
                    const stroke = isBull ? '#00ff88' : '#ff4444';

                    return (
                      <g key={idx} className="candle-node">
                        {/* Wick */}
                        <line x1={x + 10} y1={highY} x2={x + 10} y2={lowY} stroke={stroke} strokeWidth="2" />
                        {/* Body */}
                        <rect 
                          x={x} 
                          y={topBody} 
                          width="20" 
                          height={bodyH} 
                          rx="2" 
                          fill={fill} 
                          stroke={stroke} 
                          strokeWidth="1.2" 
                        />
                        {/* Time label */}
                        <text x={x + 10} y="215" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">{c.time}</text>
                      </g>
                    );
                  })}

                  {/* Live Target Line */}
                  <line x1="0" y1="28" x2="780" y2="28" stroke="#00ff88" strokeWidth="1.4" opacity="0.6" />
                  <text x="690" y="22" fill="#00ff88" fontSize="10" fontWeight="bold">PROFIT TARGET: 25,350</text>
                </svg>
              </div>

              {/* AI Mentor Real-Time Insight Callout Bubble */}
              <div className="terminal-ai-bubble">
                <div className="ai-bubble-icon">
                  <Bot size={18} />
                </div>
                <div className="ai-bubble-content">
                  <div className="ai-bubble-title">NonStock AI Quant Coach</div>
                  <div className="ai-bubble-text">
                    "High-volume breakout confirmed above 25,100 resistance with 1.8x volume expansion. 
                    Target 25,350 hit. Recommended move: Trailing SL to lock in +₹14,850 profit."
                  </div>
                </div>
                <div className="ai-bubble-tag">LIVE QUANT AUDIT</div>
              </div>
            </div>

            {/* Terminal Footer Bar */}
            <div className="terminal-footer">
              <div className="terminal-footer-info">
                <span className="status-indicator"></span>
                <span>Market Replay Engine v2.4 Active</span>
                <span className="footer-separator">•</span>
                <span>100% Free Forever Mode</span>
              </div>
              <div className="terminal-footer-action">
                <Link to="/register" className="btn-terminal-try">
                  <span>Open Full Trading Terminal</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 4. NEW INTERACTIVE SECTION: WHAT NONSTOCK INCLUDES & OPTIONS TO EXPLORE */}
      <section id="explore-options" className="content-section explore-options-section">
        <div className="section-head">
          <div className="section-eyebrow">
            <Compass size={16} className="text-neon-green" />
            <span>INTERACTIVE PLATFORM EXPLORER</span>
          </div>
          <h2 className="section-title">
            What NonStock Includes. <br />
            <span className="text-neon-green">Engineered For Serious Traders & High-Level Learners.</span>
          </h2>
          <p className="section-subtitle">
            Click on any module below to explore its core capabilities, see what features it includes, 
            and understand why high-profile traders choose NonStock over fragmented paid tools.
          </p>
        </div>

        {/* Interactive Option Tabs Bar */}
        <div className="options-tab-nav">
          {platformOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setActiveOptionTab(opt.id)}
              className={`option-tab-btn ${activeOptionTab === opt.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{opt.icon}</span>
              <span className="tab-text">{opt.label}</span>
              {opt.badge && <span className="tab-pill">{opt.badge}</span>}
            </button>
          ))}
        </div>

        {/* Big Interactive Exploration Display Card */}
        <div className="option-display-card">
          <div className="option-card-left">
            <div className="option-badge-row">
              <span className="opt-tag-badge">{currentOption.badge}</span>
              <span className="opt-id-tag">MODULE 0{platformOptions.findIndex(o => o.id === currentOption.id) + 1}</span>
            </div>

            <h3 className="opt-card-heading">{currentOption.title}</h3>
            <p className="opt-card-tagline">{currentOption.tagline}</p>
            <p className="opt-card-desc">{currentOption.description}</p>

            <div className="opt-includes-box">
              <h4 className="opt-inc-title">
                <Layers size={16} className="text-neon-green" />
                <span>WHAT THIS MODULE INCLUDES FOR YOU:</span>
              </h4>
              <ul className="opt-inc-list">
                {currentOption.includes.map((inc, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className="text-neon-green flex-shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="opt-edge-callout">
              <Zap size={18} className="text-neon-green flex-shrink-0" />
              <p>{currentOption.traderEdge}</p>
            </div>

            <div className="opt-action-row">
              <Link to={currentOption.route} className="btn-hero-primary">
                <span>{currentOption.btnLabel}</span>
                <ArrowRight size={16} />
              </Link>
              <div className="opt-free-guarantee">
                <ShieldCheck size={16} className="text-neon-green" />
                <span>100% Free • No Subscription</span>
              </div>
            </div>
          </div>

          <div className="option-card-right">
            {/* Visual preview representation tailored to active tab */}
            <div className="opt-interactive-preview">
              <div className="preview-top-bar">
                <span className="p-dot red"></span>
                <span className="p-dot yellow"></span>
                <span className="p-dot green"></span>
                <span className="p-title">NonStock Terminal // {currentOption.label.toUpperCase()}</span>
              </div>

              <div className="preview-body">
                {activeOptionTab === 'replay' && (
                  <div className="replay-spec-widget">
                    <div className="spec-stat-row">
                      <div className="spec-box">
                        <span className="spec-lbl">REPLAY SPEED</span>
                        <span className="spec-val text-neon-green">1x • 2x • 5x • 10x</span>
                      </div>
                      <div className="spec-box">
                        <span className="spec-lbl">WEEKEND PRACTICE</span>
                        <span className="spec-val text-white">UNRESTRICTED</span>
                      </div>
                    </div>
                    <div className="spec-demo-track">
                      <div className="spec-track-label">
                        <span>OCT 14, 2024 (HISTORICAL SESSION)</span>
                        <span className="text-neon-green">BAR 48 OF 75</span>
                      </div>
                      <div className="spec-progress-bar">
                        <div className="spec-progress-fill" style={{ width: '64%' }}></div>
                      </div>
                    </div>
                    <div className="spec-highlight-box">
                      <span className="text-neon-green font-bold">TradingView Price:</span> $360/year <br />
                      <span className="text-neon-green font-bold">NonStock Price:</span> ₹0 / 100% Free Forever
                    </div>
                  </div>
                )}

                {activeOptionTab === 'paper' && (
                  <div className="paper-spec-widget">
                    <div className="virtual-margin-pill">
                      <span>VIRTUAL MARGIN ALLOCATED</span>
                      <strong className="text-neon-green">₹10,00,000.00</strong>
                    </div>
                    <div className="spec-order-ladder">
                      <div className="ladder-row buy">
                        <span>BUY 100 QTY RELIANCE @ 2,980</span>
                        <span className="status-badge filled">EXECUTED</span>
                      </div>
                      <div className="ladder-row target">
                        <span>TARGET LIMIT @ 3,040</span>
                        <span className="status-badge pending">ACTIVE (+₹6,000)</span>
                      </div>
                      <div className="ladder-row sl">
                        <span>STOP LOSS TRIGGER @ 2,950</span>
                        <span className="status-badge safe">PROTECTED</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeOptionTab === 'mentor' && (
                  <div className="mentor-spec-widget">
                    <div className="ai-audit-header">
                      <Bot size={16} className="text-neon-green" />
                      <span>LIVE ALGORITHMIC TRADE AUDIT</span>
                    </div>
                    <div className="ai-metric-grid">
                      <div className="ai-m-item">
                        <span className="m-label">RISK/REWARD</span>
                        <span className="m-value text-neon-green">1 : 3.2 (OPTIMAL)</span>
                      </div>
                      <div className="ai-m-item">
                        <span className="m-label">MAX LOSS CAP</span>
                        <span className="m-value text-white">1.5% OF MARGIN</span>
                      </div>
                      <div className="ai-m-item">
                        <span className="m-label">RSI AUDIT</span>
                        <span className="m-value text-white">58.4 (NEUTRAL BREAKOUT)</span>
                      </div>
                      <div className="ai-m-item">
                        <span className="m-label">TILT SCORE</span>
                        <span className="m-value text-neon-green">0% (DISCIPLINED)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeOptionTab === 'options' && (
                  <div className="options-spec-widget">
                    <div className="greek-table-mini">
                      <div className="gt-row header">
                        <span>STRIKE</span>
                        <span>DELTA</span>
                        <span>THETA</span>
                        <span>OI CHG</span>
                      </div>
                      <div className="gt-row">
                        <span className="text-white font-bold">25,300 CE</span>
                        <span className="text-neon-green">0.68</span>
                        <span className="text-danger">-14.2</span>
                        <span className="text-neon-green">+1.4M (BUY)</span>
                      </div>
                      <div className="gt-row active-atm">
                        <span className="text-neon-green font-bold">25,350 ATM</span>
                        <span className="text-neon-green">0.51</span>
                        <span className="text-danger">-18.6</span>
                        <span className="text-neon-green">+3.8M (BUILDS)</span>
                      </div>
                      <div className="gt-row">
                        <span className="text-white font-bold">25,400 CE</span>
                        <span className="text-neon-green">0.34</span>
                        <span className="text-danger">-12.1</span>
                        <span className="text-danger">-800K</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeOptionTab === 'lab' && (
                  <div className="lab-spec-widget">
                    <div className="rule-flow">
                      <div className="rule-step">
                        <span className="step-num">1</span>
                        <span>IF 15M RSI CROSSES ABOVE 55</span>
                      </div>
                      <div className="rule-arrow">↓</div>
                      <div className="rule-step">
                        <span className="step-num">2</span>
                        <span>AND SUPERTREND IS BULLISH (GREEN)</span>
                      </div>
                      <div className="rule-arrow">↓</div>
                      <div className="rule-step trigger">
                        <span className="step-num">3</span>
                        <span className="text-neon-green font-bold">EXECUTE BUY 50 LOTS WITH 1:2 R:R</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeOptionTab === 'scanner' && (
                  <div className="scanner-spec-widget">
                    <div className="scanner-header">
                      <span>SECTOR HEATMAP FLOW</span>
                      <span className="text-neon-green">NIFTY 50 LIVE</span>
                    </div>
                    <div className="heatmap-grid">
                      <div className="hm-cell strong-bull">NIFTY IT +2.84%</div>
                      <div className="hm-cell strong-bull">NIFTY AUTO +2.15%</div>
                      <div className="hm-cell bull">NIFTY BANK +1.20%</div>
                      <div className="hm-cell neutral">NIFTY PHARMA +0.34%</div>
                      <div className="hm-cell bear">NIFTY FMCG -0.85%</div>
                      <div className="hm-cell strong-bear">NIFTY METAL -1.62%</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="preview-footer-note">
                <span className="pulse-green"></span>
                <span>Active NonStock Institutional Module • 100% Free Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Grid Cards for Direct One-Click Navigation into Modules */}
        <div className="module-grid-title">
          <h3>Direct Access Hub: Choose Your Learning Path</h3>
          <p>Every single tool is available without subscription paywalls.</p>
        </div>

        <div className="options-cards-grid">
          {platformOptions.map((opt, i) => (
            <div 
              key={opt.id} 
              className={`module-card ${activeOptionTab === opt.id ? 'highlight-border' : ''}`}
              onClick={() => setActiveOptionTab(opt.id)}
            >
              <div className="m-card-top">
                <div className="m-card-icon">{opt.icon}</div>
                <span className="m-card-badge">{opt.badge}</span>
              </div>
              <h4 className="m-card-title">{opt.label}</h4>
              <p className="m-card-sub">{opt.tagline}</p>
              <div className="m-card-divider"></div>
              <div className="m-card-actions">
                <span className="m-card-click-hint">Click to Preview</span>
                <Link to={opt.route} className="m-card-link-btn" onClick={(e) => e.stopPropagation()}>
                  <span>Launch</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION: PROBLEMS NONSTOCK SOLVES FOR NEW TRADERS */}
      <section id="problems" className="content-section problems-section">
        <div className="section-head">
          <div className="section-eyebrow">
            <AlertTriangle size={16} className="text-neon-green" />
            <span>THE HARSH TRUTH ABOUT RETAIL TRADING</span>
          </div>
          <h2 className="section-title">
            91% of Beginners Lose Their Savings In The First 90 Days. <br />
            <span className="text-neon-green">Here Is How NonStock Fixes Every Single Trap.</span>
          </h2>
          <p className="section-subtitle">
            Most beginners fail because they practice with real money on complex broker platforms that offer 
            zero safety nets, zero replay tools, and charge high brokerages. NonStock was engineered to eliminate this barrier forever.
          </p>
        </div>

        <div className="problems-grid">
          {/* Card 1 */}
          <div className="problem-solution-card">
            <div className="card-top-tag error-tag">
              <XCircle size={15} />
              <span>THE BRUTAL TRAP #1</span>
            </div>
            <h3 className="card-heading">Losing ₹50,000+ While Just Learning</h3>
            <p className="card-problem-text">
              Beginners jump into Zerodha or Groww, make rookie mistakes on market orders, experience severe slippage, 
              and panic-sell until their hard-earned money vanishes.
            </p>
            <div className="solution-divider"></div>
            <div className="solution-box">
              <div className="solution-tag">
                <CheckCircle2 size={16} />
                <span>THE NONSTOCK FIX</span>
              </div>
              <h4 className="solution-title">₹10,00,000 Zero-Risk Virtual Capital</h4>
              <p className="solution-desc">
                Simulate real trades with realistic exchange fills, live market depth, and accurate brokerages. 
                Build an ironclad edge before committing a single rupee of real wealth.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="problem-solution-card featured-glow-card">
            <div className="card-top-tag error-tag">
              <XCircle size={15} />
              <span>THE BRUTAL TRAP #2</span>
            </div>
            <h3 className="card-heading">Markets Are Closed When You Have Free Time</h3>
            <p className="card-problem-text">
              Students and 9-to-5 professionals only have free time on evenings and weekends, but live stock exchanges 
              are completely frozen. You can't practice live decision-making.
            </p>
            <div className="solution-divider"></div>
            <div className="solution-box highlight-solution">
              <div className="solution-tag">
                <Sparkles size={16} />
                <span>THE NONSTOCK FIX</span>
              </div>
              <h4 className="solution-title">The Time Machine: 24/7 Market Replay</h4>
              <p className="solution-desc">
                Rewind the charts to any historical date (Budget Day, election rallies, sudden gap-downs). 
                Replay candles tick-by-tick at up to 10x speed. Practice 100 setups in a single Saturday.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="problem-solution-card">
            <div className="card-top-tag error-tag">
              <XCircle size={15} />
              <span>THE BRUTAL TRAP #3</span>
            </div>
            <h3 className="card-heading">$30/Month Paywalls On Essential Tools</h3>
            <p className="card-problem-text">
              Platforms like TradingView charge $360 every year just to unlock Bar Replay and multiple indicator layouts. 
              Learners pay monthly fees before they even become profitable.
            </p>
            <div className="solution-divider"></div>
            <div className="solution-box">
              <div className="solution-tag">
                <CheckCircle2 size={16} />
                <span>THE NONSTOCK FIX</span>
              </div>
              <h4 className="solution-title">100% Free Forever Replay & Charts</h4>
              <p className="solution-desc">
                We believe trading education should never be behind a paywall. NonStock gives you unrestricted historical 
                candlestick replay, indicators, and paper execution 100% free.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="problem-solution-card">
            <div className="card-top-tag error-tag">
              <XCircle size={15} />
              <span>THE BRUTAL TRAP #4</span>
            </div>
            <h3 className="card-heading">Emotional Revenge Trading & Blind Tips</h3>
            <p className="card-problem-text">
              New traders suffer a loss, get furious, double their lot size, and blow up their account in 15 minutes. 
              No one is there to stop them or critique their strategy.
            </p>
            <div className="solution-divider"></div>
            <div className="solution-box">
              <div className="solution-tag">
                <CheckCircle2 size={16} />
                <span>THE NONSTOCK FIX</span>
              </div>
              <h4 className="solution-title">Institutional AI Trading Mentor</h4>
              <p className="solution-desc">
                Your personal 24/7 quant tutor. Evaluates your risk-to-reward ratio, flags overbought indicators, 
                enforces strict discipline, and prevents catastrophic revenge trading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: THE TIME MACHINE (MARKET REPLAY DEEP DIVE) */}
      <section id="replay-engine" className="content-section feature-showcase-section">
        <div className="showcase-container">
          <div className="showcase-content">
            <div className="section-eyebrow">
              <Clock size={16} className="text-neon-green" />
              <span>THE SIGNATURE KILLER FEATURE</span>
            </div>
            <h2 className="showcase-title">
              Trade Any Day In History. <br />
              <span className="text-neon-gradient">At 5x Speed On Weekends.</span>
            </h2>
            <p className="showcase-lead">
              Why wait until Monday 9:15 AM to hone your edge? With NonStock Market Replay, you have a private 
              time machine. Pick any past market date, hit play, and test your trading setups bar-by-bar with zero bias.
            </p>

            <div className="feature-bullets">
              <div className="f-bullet">
                <div className="f-bullet-icon"><Calendar size={20} /></div>
                <div>
                  <strong>Rewind To Crucial Historical Events</strong>
                  <p>Backtest how your breakout strategy would have performed during Budget 2024, US CPI prints, or sudden market crashes.</p>
                </div>
              </div>

              <div className="f-bullet">
                <div className="f-bullet-icon"><FastForward size={20} /></div>
                <div>
                  <strong>Adjustable Playback Speeds (1x, 2x, 5x, 10x)</strong>
                  <p>Don't waste 6 hours waiting for candles. Fast-forward through slow lunch sessions and focus strictly on high-momentum setups.</p>
                </div>
              </div>

              <div className="f-bullet">
                <div className="f-bullet-icon"><ShieldCheck size={20} /></div>
                <div>
                  <strong>Blind Backtesting Mode (No Cheating)</strong>
                  <p>Future candles remain completely invisible until they print, giving you the exact emotional feel of real-time trading.</p>
                </div>
              </div>

              <div className="f-bullet">
                <div className="f-bullet-icon"><BarChart3 size={20} /></div>
                <div>
                  <strong>Place Simulated Orders Mid-Replay</strong>
                  <p>Not just a viewer—execute Buy and Sell orders as candles form, track live P&L, and evaluate your win rate.</p>
                </div>
              </div>
            </div>

            <div className="showcase-cta-row">
              <Link to="/paper-trading" className="btn-hero-primary">
                <span>Try Market Replay Now</span>
                <ArrowRight size={16} />
              </Link>
              <div className="free-badge-note">
                <span className="pulse-green"></span>
                <span>TradingView charges $30/mo • NonStock is ₹0 Free</span>
              </div>
            </div>
          </div>

          <div className="showcase-visual">
            <div className="visual-card">
              <div className="visual-card-glow"></div>
              <div className="visual-top">
                <div className="replay-badge-strip">
                  <span className="rec-dot"></span>
                  <span className="rec-text">REPLAY ENGINE 10X RUNNING</span>
                </div>
                <div className="replay-date-selector">
                  <span className="label">TARGET DATE:</span>
                  <span className="val">2024-06-04 (ELECTION DAY)</span>
                </div>
              </div>

              <div className="visual-chart-mock">
                {/* Simulated election candle drop & sharp recovery */}
                <div className="mock-candle-seq">
                  <div className="c-col down" style={{ height: '70px', marginTop: '40px' }}></div>
                  <div className="c-col down" style={{ height: '110px', marginTop: '60px' }}></div>
                  <div className="c-col down" style={{ height: '140px', marginTop: '80px' }}></div>
                  <div className="c-col up special" style={{ height: '120px', marginTop: '40px' }}>
                    <div className="pin-callout">Replay Buy Executed</div>
                  </div>
                  <div className="c-col up" style={{ height: '90px', marginTop: '20px' }}></div>
                  <div className="c-col up" style={{ height: '130px', marginTop: '0px' }}></div>
                </div>

                <div className="visual-metrics-grid">
                  <div className="v-stat">
                    <span className="v-lbl">Replay P&L</span>
                    <span className="v-val text-neon-green">+₹48,250</span>
                  </div>
                  <div className="v-stat">
                    <span className="v-lbl">Win Ratio</span>
                    <span className="v-val text-white">83.3%</span>
                  </div>
                  <div className="v-stat">
                    <span className="v-lbl">Speed</span>
                    <span className="v-val text-neon-green">5x Turbo</span>
                  </div>
                </div>
              </div>

              <div className="visual-card-footer">
                <span>⏱️ Replay Step: Candle 48 of 75 • Indian NSE NIFTY</span>
                <span className="text-neon-green font-bold">Zero Lag Execution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: THE INSTITUTIONAL TRADE DESK */}
      <section id="terminal" className="content-section terminal-deepdive-section">
        <div className="section-head">
          <div className="section-eyebrow">
            <LineChart size={16} className="text-neon-green" />
            <span>COMPLETE INSTITUTIONAL SUITE</span>
          </div>
          <h2 className="section-title">
            Everything You Need To Master The Markets. <br />
            <span className="text-neon-green">In One Unified, Distraction-Free Terminal.</span>
          </h2>
          <p className="section-subtitle">
            Say goodbye to having 6 different browser tabs open. NonStock brings real-time charts, 
            market replay, Indian F&O Greeks, and AI insights into a single blazing-fast interface.
          </p>
        </div>

        <div className="terminal-features-grid">
          <div className="t-card">
            <div className="t-card-icon"><BarChart3 size={32} /></div>
            <h3>Advanced TradingView & Custom Charts</h3>
            <p>Seamlessly switch between native Lightweight Candles and institutional TradingView layouts with multi-timeframe analysis.</p>
          </div>

          <div className="t-card">
            <div className="t-card-icon"><Target size={32} /></div>
            <h3>₹10L Realistic Paper Trading</h3>
            <p>Place Market, Limit, and Stop-Loss orders. Experience realistic order fulfillment without putting personal savings at risk.</p>
          </div>

          <div className="t-card">
            <div className="t-card-icon"><Activity size={32} /></div>
            <h3>F&O Option Greeks & Open Interest</h3>
            <p>Real-time Delta, Theta, Gamma calculations and PCR (Put-Call Ratio) analysis for index option traders.</p>
          </div>

          <div className="t-card">
            <div className="t-card-icon"><Flame size={32} /></div>
            <h3>Sector Rotation & Heatmaps</h3>
            <p>Spot where institutional capital is flowing before the move happens: IT, Banks, Auto, Energy, and Pharma.</p>
          </div>

          <div className="t-card">
            <div className="t-card-icon"><Search size={32} /></div>
            <h3>Real-Time Dynamic Stock Screener</h3>
            <p>Filter 2,000+ Indian and global stocks by volume spikes, 52-week highs, RSI levels, and breakout momentum.</p>
          </div>

          <div className="t-card">
            <div className="t-card-icon"><Cpu size={32} /></div>
            <h3>Strategy Lab & Automated Sandbox</h3>
            <p>Design mathematical indicator rules and deploy sandbox bots to validate trade logic automatically.</p>
          </div>
        </div>
      </section>

      {/* 8. SECTION: 24/7 AI MENTOR */}
      <section id="ai-mentor" className="content-section ai-mentor-section">
        <div className="ai-mentor-container">
          <div className="ai-mentor-visual">
            <div className="ai-chat-mock">
              <div className="chat-top">
                <div className="chat-avatar">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="chat-title">NonStock AI Trading Mentor</div>
                  <div className="chat-status">🟢 Quantitative Risk Tutor Active</div>
                </div>
              </div>

              <div className="chat-messages">
                <div className="msg user-msg">
                  <div className="msg-sender">You (Trader)</div>
                  <div className="msg-bubble">
                    "Looking at buying NIFTY 25,400 Call at ₹120. Breakout looks clean. Should I enter with full size?"
                  </div>
                </div>

                <div className="msg ai-msg">
                  <div className="msg-sender">AI Quant Coach</div>
                  <div className="msg-bubble">
                    <p className="ai-p">
                      <strong>⚠️ Risk Warning:</strong> NIFTY is currently 8 points away from daily R2 resistance (25,410). 
                      RSI is 74.8 (Overbought).
                    </p>
                    <div className="ai-stats-pill-row">
                      <span className="pill green">Recommended Risk: 1.5%</span>
                      <span className="pill yellow">Wait for 15M Close</span>
                      <span className="pill green">R:R = 1:2.8</span>
                    </div>
                    <p className="ai-p">
                      If you enter now, risk of false breakout is 42%. Better entry: Wait for a retest of 25,370 with SL at 25,320.
                    </p>
                  </div>
                </div>
              </div>

              <div className="chat-input-bar">
                <span>Ask AI Mentor anything about your setup, risk, or strategy...</span>
                <button className="chat-send-btn"><ArrowRight size={14} /></button>
              </div>
            </div>
          </div>

          <div className="ai-mentor-content">
            <div className="section-eyebrow">
              <Bot size={16} className="text-neon-green" />
              <span>YOUR 24/7 INSTITUTIONAL QUANT TUTOR</span>
            </div>
            <h2 className="showcase-title">
              Never Trade Alone. <br />
              <span className="text-neon-gradient">Get Coached on Every Execution.</span>
            </h2>
            <p className="showcase-lead">
              The world's best prop traders have senior risk managers watching their screen to stop them from making emotional errors. 
              NonStock AI gives you that exact institutional guidance for every trade you plan.
            </p>

            <div className="ai-feature-checklist">
              <div className="check-item">
                <CheckCircle2 size={20} className="text-neon-green flex-shrink-0" />
                <span><strong>Mathematical Risk Sizing:</strong> Calculates ideal lot sizes based on your account balance.</span>
              </div>
              <div className="check-item">
                <CheckCircle2 size={20} className="text-neon-green flex-shrink-0" />
                <span><strong>Revenge Trading Circuit Breaker:</strong> Detects emotional tilt and recommends cooling-off periods.</span>
              </div>
              <div className="check-item">
                <CheckCircle2 size={20} className="text-neon-green flex-shrink-0" />
                <span><strong>Pre-Trade Setup Audits:</strong> Identifies conflicting indicators, heavy overhead resistance, and upcoming news events.</span>
              </div>
            </div>

            <div className="ai-cta-box">
              <Link to="/ai-mentor" className="btn-hero-primary">
                <span>Chat with AI Mentor Free</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION: HEAD-TO-HEAD COMPARISON TABLE */}
      <section id="comparison" className="content-section comparison-section">
        <div className="section-head">
          <div className="section-eyebrow">
            <ShieldCheck size={16} className="text-neon-green" />
            <span>HOW WE STACK UP</span>
          </div>
          <h2 className="section-title">
            The NonStock Advantage: <br />
            <span className="text-neon-green">Why Serious Learners Choose Us Over Competitors</span>
          </h2>
          <p className="section-subtitle">
            See how NonStock eliminates paywalls and financial stress compared to traditional brokers and expensive charting tools.
          </p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="feature-col">Feature / Capability</th>
                <th className="broker-col">Traditional Brokers <br /><small>(Zerodha, Groww)</small></th>
                <th className="tv-col">TradingView Pro <br /><small>($30/mo Plan)</small></th>
                <th className="nonstock-col highlight-col">
                  <div className="th-badge">BEST FOR LEARNERS</div>
                  <span>NonStock</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="feature-name">
                  <strong>Market Replay (Time Machine)</strong>
                  <span>Practice historical chart candles bar-by-bar</span>
                </td>
                <td className="status-no"><XCircle size={18} /> No Replay</td>
                <td className="status-warn"><AlertTriangle size={18} /> Paid ($360/year)</td>
                <td className="status-yes highlight-cell"><CheckCircle2 size={20} /> 100% Free Forever</td>
              </tr>
              <tr>
                <td className="feature-name">
                  <strong>Weekend & After-Hours Practice</strong>
                  <span>Hone trading skills when market is closed</span>
                </td>
                <td className="status-no"><XCircle size={18} /> Frozen on Weekends</td>
                <td className="status-warn"><AlertTriangle size={18} /> Charts only (No Orders)</td>
                <td className="status-yes highlight-cell"><CheckCircle2 size={20} /> Full Weekend Replay & Paper Orders</td>
              </tr>
              <tr>
                <td className="feature-name">
                  <strong>Financial Capital Risk</strong>
                  <span>Learn without burning real savings</span>
                </td>
                <td className="status-no"><XCircle size={18} /> 100% Real Money Risk</td>
                <td className="status-warn"><AlertTriangle size={18} /> Basic simulator</td>
                <td className="status-yes highlight-cell"><CheckCircle2 size={20} /> ₹10,00,000 Free Virtual Margin</td>
              </tr>
              <tr>
                <td className="feature-name">
                  <strong>Built-in AI Trading Coach</strong>
                  <span>Real-time quant analysis and risk guidance</span>
                </td>
                <td className="status-no"><XCircle size={18} /> None</td>
                <td className="status-no"><XCircle size={18} /> None</td>
                <td className="status-yes highlight-cell"><CheckCircle2 size={20} /> 24/7 AI Mentor Included</td>
              </tr>
              <tr>
                <td className="feature-name">
                  <strong>Unified Market Coverage</strong>
                  <span>NSE/BSE, Crypto, Global Indices, Commodities</span>
                </td>
                <td className="status-warn"><AlertTriangle size={18} /> Indian Only</td>
                <td className="status-yes"><CheckCircle2 size={18} /> Global</td>
                <td className="status-yes highlight-cell"><CheckCircle2 size={20} /> Unified Global + Indian Desk</td>
              </tr>
              <tr>
                <td className="feature-name">
                  <strong>Cost to Student / Learner</strong>
                  <span>Subscription and software fees</span>
                </td>
                <td className="status-warn">Brokerage + Real Losses</td>
                <td className="status-no">$360+ every year</td>
                <td className="status-yes highlight-cell price-zero">₹0 / Always Free</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 10. SECTION: LIVE MARKET PULSE & SEARCH */}
      <section id="pulse" className="content-section pulse-section">
        <div className="section-head">
          <div className="section-eyebrow">
            <Activity size={16} className="text-neon-green" />
            <span>REAL-TIME EXCHANGE FEED</span>
          </div>
          <h2 className="section-title">
            Live Market Movers & Instant Asset Search
          </h2>
          <p className="section-subtitle">
            Search 2,000+ equities, cryptocurrencies, and global commodities with zero delay.
          </p>
        </div>

        {/* Search Bar */}
        <div className="live-search-container" ref={searchRef}>
          <div className="search-bar-box">
            <Search size={22} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search any stock, index, or crypto (e.g. 'RELIANCE', 'TATASTEEL', 'BTC')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar-input"
            />
            {isSearching && <span className="search-loading-spinner"></span>}
          </div>

          {searchResults.length > 0 && (
            <div className="search-results-popup">
              {searchResults.map((item, idx) => (
                <div 
                  key={idx} 
                  className="search-item-row" 
                  onClick={() => navigate(`/stock/${item.symbol}`)}
                >
                  <div className="s-main">
                    <span className="s-symbol">{item.symbol}</span>
                    <span className="s-name">{item.name}</span>
                  </div>
                  <span className="s-exchange">{item.exchange || 'NSE'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Gainers & Losers Grid */}
        <div className="movers-layout">
          <div className="movers-card gainers-card">
            <div className="movers-header">
              <div className="m-title-wrap">
                <TrendingUp size={22} className="text-neon-green" />
                <h3>Top Market Gainers</h3>
              </div>
              <span className="m-badge green">BULLISH MOMENTUM</span>
            </div>
            <div className="movers-list">
              {movers.gainers.map((s, i) => (
                <div key={i} className="mover-row" onClick={() => navigate(`/stock/${s.symbol}-EQ`)}>
                  <div className="mover-info">
                    <span className="mover-rank">#{i + 1}</span>
                    <span className="mover-sym">{s.symbol}</span>
                  </div>
                  <div className="mover-price-wrap">
                    <span className="mover-val">₹{Number(s.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className="mover-chg up">+{s.changePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="movers-card losers-card">
            <div className="movers-header">
              <div className="m-title-wrap">
                <TrendingDown size={22} className="text-danger" />
                <h3>Top Market Losers</h3>
              </div>
              <span className="m-badge red">BEARISH PRESSURE</span>
            </div>
            <div className="movers-list">
              {movers.losers.map((s, i) => (
                <div key={i} className="mover-row" onClick={() => navigate(`/stock/${s.symbol}-EQ`)}>
                  <div className="mover-info">
                    <span className="mover-rank">#{i + 1}</span>
                    <span className="mover-sym">{s.symbol}</span>
                  </div>
                  <div className="mover-price-wrap">
                    <span className="mover-val">₹{Number(s.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className="mover-chg down">{s.changePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 11. SECTION: COMMUNITY METRICS & TRUST */}
      <section className="content-section stats-banner-section">
        <div className="stats-banner-grid">
          <div className="stat-box">
            <div className="stat-big-number">{stats.activeUsers}</div>
            <div className="stat-text">Active Learners & Traders</div>
          </div>
          <div className="stat-box">
            <div className="stat-big-number">{stats.replayHours}</div>
            <div className="stat-text">Historical Replay Hours Logged</div>
          </div>
          <div className="stat-box">
            <div className="stat-big-number">{stats.capitalSaved}</div>
            <div className="stat-text">Retail Capital Shielded from Losses</div>
          </div>
          <div className="stat-box">
            <div className="stat-big-number">100% Free</div>
            <div className="stat-text">Core Tools & Replay Forever</div>
          </div>
        </div>
      </section>

      {/* 12. SECTION: FREQUENTLY ASKED QUESTIONS */}
      <section className="content-section faq-section">
        <div className="section-head">
          <div className="section-eyebrow">
            <Sparkles size={16} className="text-neon-green" />
            <span>CLARITY & TRANSPARENCY</span>
          </div>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about NonStock, Market Replay, and risk-free simulation.
          </p>
        </div>

        <div className="faq-accordion">
          {[
            {
              q: "Is NonStock really 100% free? Are there hidden fees?",
              a: "Yes! NonStock was created to democratize trading education. Our core features—including the Market Replay Time Machine, ₹10L Paper Trading sandbox, and AI Mentor insights—are completely free for all traders. There are no credit cards required and no trial expiration dates."
            },
            {
              q: "How does the Market Replay Time Machine work on weekends?",
              a: "Unlike live brokers that stop functioning after 3:30 PM on Fridays, NonStock stores tick-level historical market data. When you select a date and hit 'Play', our engine prints candles sequentially as if the market were happening live right now. You can pause, speed up to 10x, and place simulated orders anytime."
            },
            {
              q: "Do I need to link my personal Zerodha, Groww, or AngelOne account?",
              a: "No! NonStock is a dedicated trading simulation and backtesting platform. You never need to connect your real broker or deposit real currency. You receive a simulated virtual margin of ₹10,00,000 so you can practice without financial anxiety."
            },
            {
              q: "Can I trade Indian F&O (Options and Futures) as well as Crypto?",
              a: "Yes! NonStock features multi-asset support. You can analyze and simulate trades across Indian NSE/BSE stocks, Nifty & BankNifty indices with Option Greeks, international cryptos like Bitcoin and Ethereum, and global commodity indices."
            },
            {
              q: "How is NonStock different from ordinary paper trading apps?",
              a: "Most paper trading apps are just simple calculator forms that don't reflect market reality. NonStock provides full TradingView charting, real-time depth, custom historical bar replay (which normally costs $30/month on TradingView), and an integrated AI quantitative coach to critique your strategies."
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`faq-item ${openFaq === idx ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                {openFaq === idx ? <ChevronUp size={18} className="text-neon-green" /> : <ChevronDown size={18} />}
              </div>
              {openFaq === idx && (
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 13. FINAL BIG CALL TO ACTION */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <div className="cta-badge">BE NONSTOP WITH NONSTOCK</div>
          <h2 className="cta-banner-heading">
            Stop Donating Capital To The Markets. <br />
            <span className="text-neon-green">Start Practicing Like A Pro Today.</span>
          </h2>
          <p className="cta-banner-sub">
            Join thousands of traders backtesting strategies, mastering execution, and leveling up risk-free. 
            Setup takes less than 30 seconds.
          </p>
          <div className="cta-btn-wrapper">
            <Link to="/register" className="btn-cta-giant">
              <span>Create Your Free Account Now</span>
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="cta-footnote">
            <span>✓ Instant Access</span>
            <span>✓ ₹10L Virtual Capital</span>
            <span>✓ 100% Free Forever Bar Replay</span>
          </div>
        </div>
      </section>

      {/* 14. MODERN SLEEK FOOTER */}
      <footer className="footer-wrap">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <Logo size={42} showName={true} showTagline={true} />
            <p className="footer-tagline">
              The premier trading simulation, market replay, and institutional quantitative education platform. 
              Be nonstop with NonStock.
            </p>
            <div className="footer-system-status">
              <span className="status-ping"></span>
              <span>All Systems Operational • Real-Time Feeds Active</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <Link to="/paper-trading">Trade Desk & Paper Trading</Link>
            <Link to="/paper-trading">Market Replay (Time Machine)</Link>
            <Link to="/markets">Live Markets & Indices</Link>
            <Link to="/screener">Dynamic Screener</Link>
            <Link to="/fno">F&O Options Chain</Link>
          </div>

          <div className="footer-links-col">
            <h4>Intelligence</h4>
            <Link to="/ai-mentor">AI Quant Mentor</Link>
            <Link to="/strategy-lab">Strategy Builder & Bots</Link>
            <Link to="/sector-rotation">Sector Rotation</Link>
            <Link to="/news">Market News Wire</Link>
          </div>

          <div className="footer-links-col">
            <h4>Account</h4>
            <Link to="/register">Create Free Account</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/terms">Terms & Disclaimer</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-disclaimer">
            <strong>Educational Disclaimer:</strong> NonStock is a trading education and simulation environment. 
            All capital shown is strictly virtual. NonStock is not a registered broker or financial advisory firm. 
            Past performance in historical replay does not guarantee real-world market success.
          </p>
          <div className="footer-copy">
            © {new Date().getFullYear()} NonStock. All rights reserved. Built for ambitious traders worldwide.
          </div>
        </div>
      </footer>

      {/* 15. COMPREHENSIVE STYLING (GREEN, WHITE, AND BLACK THEME) */}
      <style>{`
        /* Root container and core color system */
        .landing-root {
          min-height: 100vh;
          background: #030708;
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient glowing background */
        .bg-ambient-glow {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1000px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.09) 0%, rgba(0, 255, 136, 0.02) 40%, transparent 70%);
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .bg-grid-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-radial-flare {
          position: fixed;
          bottom: -150px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 255, 136, 0.06) 0%, transparent 65%);
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
        }

        /* Utility colors */
        .text-neon-green {
          color: #00ff88 !important;
          text-shadow: 0 0 16px rgba(0, 255, 136, 0.35);
        }
        .text-neon-gradient {
          background: linear-gradient(135deg, #00ff88 0%, #ffffff 85%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .text-white { color: #ffffff !important; }
        .text-danger { color: #ff4444 !important; }
        .font-bold { font-weight: 800; }
        .flex-shrink-0 { flex-shrink: 0; }

        /* Navigation (Fixed directly at top 0) */
        .nav-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 74px;
          background: rgba(3, 7, 8, 0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(0, 255, 136, 0.18);
          z-index: 999;
          display: flex;
          align-items: center;
        }
        .nav-inner {
          max-width: 1300px;
          width: 100%;
          margin: 0 auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand-link {
          text-decoration: none;
        }
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .nav-link-btn {
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link-btn:hover {
          color: #ffffff;
        }
        .nav-link-btn.highlight-link {
          color: #00ff88;
          background: rgba(0, 255, 136, 0.08);
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(0, 255, 136, 0.25);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .btn-nav-login {
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 20px;
          transition: 0.2s;
        }
        .btn-nav-login:hover {
          color: #00ff88;
        }
        .btn-nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #00ff88;
          color: #030708;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          padding: 10px 22px;
          border-radius: 24px;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
          background: #05df72;
        }

        /* Hero Wrap */
        .hero-wrap {
          position: relative;
          z-index: 10;
          padding: 120px 24px 70px;
          max-width: 1300px;
          margin: 0 auto;
          text-align: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 255, 136, 0.08);
          border: 1px solid rgba(0, 255, 136, 0.28);
          padding: 6px 16px;
          border-radius: 30px;
          margin-bottom: 24px;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.12);
        }
        .badge-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
          animation: pulseDot 2s infinite;
        }
        @keyframes pulseDot {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        .badge-text {
          font-size: 12px;
          font-weight: 800;
          color: #00ff88;
          letter-spacing: 0.8px;
        }
        .badge-free {
          font-size: 10px;
          font-weight: 900;
          background: #00ff88;
          color: #030708;
          padding: 2px 7px;
          border-radius: 12px;
        }
        .hero-heading {
          font-size: 58px;
          font-weight: 900;
          line-height: 1.12;
          letter-spacing: -1.5px;
          margin-bottom: 22px;
          color: #ffffff;
        }
        .hero-lead {
          font-size: 19px;
          color: #e2e8f0;
          max-width: 780px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }
        .hero-buttons-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 18px;
          margin-bottom: 40px;
        }
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #00ff88;
          color: #030708;
          text-decoration: none;
          font-size: 16px;
          font-weight: 800;
          padding: 16px 36px;
          border-radius: 36px;
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-hero-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 45px rgba(0, 255, 136, 0.6);
          background: #05df72;
        }
        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(0, 255, 136, 0.35);
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          padding: 16px 32px;
          border-radius: 36px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.25s;
        }
        .btn-hero-secondary:hover {
          background: rgba(0, 255, 136, 0.12);
          border-color: #00ff88;
          transform: translateY(-3px);
        }
        .hero-trust-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
          flex-wrap: wrap;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .trust-icon {
          color: #00ff88;
        }
        .trust-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
        }

        /* Hero Terminal Mockup */
        .hero-mockup-wrapper {
          margin-top: 50px;
          perspective: 1200px;
        }
        .terminal-window {
          background: #070b0e;
          border: 1px solid rgba(0, 255, 136, 0.28);
          border-radius: 20px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 255, 136, 0.12);
          overflow: hidden;
          text-align: left;
          position: relative;
        }
        .terminal-header {
          background: #0b1116;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .terminal-window-buttons {
          display: flex;
          gap: 8px;
        }
        .win-btn {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }
        .win-red { background: #ff5f56; }
        .win-yellow { background: #ffbd2e; }
        .win-green { background: #27c93f; }
        .terminal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .terminal-symbol {
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
        }
        .terminal-tag {
          font-size: 10px;
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
        }
        .live-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
          padding: 2px 10px;
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }
        .status-blink {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00ff88;
          animation: pulseDot 1.5s infinite;
        }
        .terminal-res {
          font-size: 12px;
          font-weight: 800;
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: 12px;
        }

        /* Replay bar inside mockup */
        .terminal-replay-bar {
          background: rgba(14, 21, 28, 0.7);
          border-bottom: 1px solid rgba(0, 255, 136, 0.15);
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .replay-controls-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-replay-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #00ff88;
          color: #030708;
          border: none;
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-replay-toggle:hover {
          background: #05df72;
        }
        .speed-pills {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.05);
          padding: 3px;
          border-radius: 14px;
        }
        .speed-pill {
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 10px;
          cursor: pointer;
        }
        .speed-pill.active {
          background: #00ff88;
          color: #030708;
        }
        .btn-replay-reset {
          display: flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 14px;
          cursor: pointer;
        }
        .btn-replay-reset:hover {
          border-color: #00ff88;
          color: #00ff88;
        }
        .replay-date-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #00ff88;
          background: rgba(0, 255, 136, 0.08);
          border: 1px solid rgba(0, 255, 136, 0.25);
          padding: 4px 12px;
          border-radius: 14px;
        }

        /* Chart Canvas Area */
        .terminal-chart-area {
          position: relative;
          height: 340px;
          background: #05090c;
          padding: 20px;
          overflow: hidden;
        }
        .chart-floating-hud {
          position: absolute;
          top: 18px;
          left: 20px;
          display: flex;
          gap: 20px;
          z-index: 5;
          flex-wrap: wrap;
        }
        .hud-metric {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hud-label {
          font-size: 10px;
          font-weight: 800;
          color: #cbd5e1;
          letter-spacing: 0.5px;
        }
        .hud-val {
          font-size: 16px;
          font-weight: 800;
        }
        .hud-highlight {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          padding: 4px 12px;
          border-radius: 10px;
        }
        .pnl-pct {
          font-size: 12px;
        }

        .chart-svg-container {
          width: 100%;
          height: 100%;
          margin-top: 30px;
        }
        .candles-svg {
          width: 100%;
          height: 240px;
        }

        /* AI Mentor Bubble inside hero */
        .terminal-ai-bubble {
          position: absolute;
          bottom: 16px;
          right: 20px;
          max-width: 420px;
          background: rgba(11, 17, 22, 0.95);
          border: 1px solid rgba(0, 255, 136, 0.4);
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 255, 136, 0.18);
          backdrop-filter: blur(16px);
          display: flex;
          gap: 12px;
          align-items: flex-start;
          z-index: 10;
        }
        .ai-bubble-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ai-bubble-title {
          font-size: 12px;
          font-weight: 800;
          color: #00ff88;
          margin-bottom: 4px;
        }
        .ai-bubble-text {
          font-size: 12px;
          color: #ffffff;
          line-height: 1.45;
        }
        .ai-bubble-tag {
          position: absolute;
          top: -8px;
          right: 12px;
          font-size: 9px;
          font-weight: 900;
          background: #00ff88;
          color: #030708;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .terminal-footer {
          background: #0b1116;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }
        .terminal-footer-info {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #cbd5e1;
        }
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
        }
        .footer-separator { color: rgba(255, 255, 255, 0.2); }
        .btn-terminal-try {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #00ff88;
          text-decoration: none;
          font-weight: 800;
          font-size: 12px;
        }
        .btn-terminal-try:hover {
          text-decoration: underline;
        }

        /* Generic Section Headings */
        .content-section {
          padding: 90px 24px;
          max-width: 1300px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .section-head {
          text-align: center;
          max-width: 900px;
          margin: 0 auto 54px;
        }
        .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 800;
          color: #00ff88;
          letter-spacing: 1.5px;
          margin-bottom: 14px;
        }
        .section-title {
          font-size: 42px;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.8px;
          color: #ffffff;
          margin-bottom: 18px;
        }
        .section-subtitle {
          font-size: 17px;
          color: #e2e8f0;
          line-height: 1.6;
        }

        /* ========================================================
           4. NEW INTERACTIVE PLATFORM EXPLORER & OPTIONS STYLING
           ======================================================== */
        .explore-options-section {
          background: radial-gradient(circle at 50% 10%, rgba(0, 255, 136, 0.06) 0%, transparent 60%);
          border-top: 1px solid rgba(0, 255, 136, 0.15);
          border-bottom: 1px solid rgba(0, 255, 136, 0.15);
        }
        .options-tab-nav {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }
        .option-tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #080d11;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 12px 20px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .option-tab-btn:hover {
          border-color: rgba(0, 255, 136, 0.4);
          color: #ffffff;
          transform: translateY(-2px);
        }
        .option-tab-btn.active {
          background: rgba(0, 255, 136, 0.12);
          border-color: #00ff88;
          color: #00ff88;
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.2);
        }
        .tab-icon {
          display: flex;
          align-items: center;
        }
        .tab-pill {
          font-size: 9px;
          font-weight: 900;
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
          padding: 2px 7px;
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }
        .option-tab-btn.active .tab-pill {
          background: #00ff88;
          color: #030708;
        }

        /* Large Display Card */
        .option-display-card {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 40px;
          background: #070c10;
          border: 1px solid rgba(0, 255, 136, 0.35);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 255, 136, 0.1);
          margin-bottom: 60px;
          align-items: center;
        }
        .option-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .opt-tag-badge {
          font-size: 11px;
          font-weight: 900;
          background: #00ff88;
          color: #030708;
          padding: 3px 10px;
          border-radius: 10px;
        }
        .opt-id-tag {
          font-size: 12px;
          font-weight: 800;
          color: #cbd5e1;
          letter-spacing: 1px;
        }
        .opt-card-heading {
          font-size: 32px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .opt-card-tagline {
          font-size: 16px;
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 16px;
        }
        .opt-card-desc {
          font-size: 15px;
          color: #e2e8f0;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .opt-includes-box {
          background: #04080a;
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .opt-inc-title {
          font-size: 12px;
          font-weight: 900;
          color: #00ff88;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          letter-spacing: 0.8px;
        }
        .opt-inc-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .opt-inc-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: #ffffff;
          line-height: 1.45;
        }
        .opt-edge-callout {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(0, 255, 136, 0.08);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 28px;
        }
        .opt-edge-callout p {
          font-size: 13.5px;
          color: #e2e8f0;
          line-height: 1.5;
          margin: 0;
          font-weight: 600;
        }
        .opt-action-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .opt-free-guarantee {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #cbd5e1;
          font-weight: 700;
        }

        /* Right Interactive Mockup */
        .opt-interactive-preview {
          background: #04080a;
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }
        .preview-top-bar {
          background: #0b1116;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .p-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .p-dot.red { background: #ff5f56; }
        .p-dot.yellow { background: #ffbd2e; }
        .p-dot.green { background: #27c93f; }
        .p-title {
          font-size: 11px;
          font-weight: 800;
          color: #cbd5e1;
          margin-left: 8px;
          letter-spacing: 0.5px;
        }
        .preview-body {
          padding: 24px;
          min-height: 240px;
        }
        .preview-footer-note {
          background: #070c10;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: #cbd5e1;
          font-weight: 700;
        }

        /* Preview Widget Variants */
        .replay-spec-widget, .paper-spec-widget, .mentor-spec-widget, .options-spec-widget, .lab-spec-widget, .scanner-spec-widget {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .spec-stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .spec-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }
        .spec-lbl {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: #cbd5e1;
          margin-bottom: 4px;
        }
        .spec-val {
          font-size: 14px;
          font-weight: 900;
        }
        .spec-demo-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .spec-track-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }
        .spec-progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        .spec-progress-fill {
          height: 100%;
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
        }
        .spec-highlight-box {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 10px;
          padding: 12px;
          font-size: 13px;
          color: #ffffff;
          line-height: 1.5;
        }

        .virtual-margin-pill {
          background: rgba(0, 255, 136, 0.12);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 800;
        }
        .spec-order-ladder {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ladder-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
        }
        .ladder-row.buy { border-left: 3px solid #00ff88; }
        .ladder-row.target { border-left: 3px solid #27c93f; }
        .ladder-row.sl { border-left: 3px solid #ff5555; }
        .status-badge {
          font-size: 9.5px;
          font-weight: 900;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .status-badge.filled { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
        .status-badge.pending { background: rgba(255, 189, 46, 0.2); color: #ffbd2e; }
        .status-badge.safe { background: rgba(255, 85, 85, 0.2); color: #ff5555; }

        .ai-audit-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 900;
          color: #00ff88;
          letter-spacing: 0.5px;
        }
        .ai-metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ai-m-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 10px;
        }
        .m-label {
          display: block;
          font-size: 9.5px;
          font-weight: 800;
          color: #cbd5e1;
          margin-bottom: 4px;
        }
        .m-value {
          font-size: 12.5px;
          font-weight: 800;
        }

        .greek-table-mini {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .gt-row {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 0.8fr 1.2fr;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          font-size: 12px;
          align-items: center;
        }
        .gt-row.header {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          font-weight: 900;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        .gt-row.active-atm {
          background: rgba(0, 255, 136, 0.12);
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .rule-flow {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .rule-step {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
        }
        .rule-step.trigger {
          background: rgba(0, 255, 136, 0.12);
          border: 1px solid rgba(0, 255, 136, 0.3);
        }
        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #00ff88;
          color: #030708;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        }
        .rule-arrow {
          color: #00ff88;
          font-size: 14px;
          font-weight: 900;
        }

        .scanner-spec-widget {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .scanner-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 800;
        }
        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .hm-cell {
          padding: 12px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          text-align: center;
        }
        .hm-cell.strong-bull { background: rgba(0, 255, 136, 0.25); color: #00ff88; border: 1px solid #00ff88; }
        .hm-cell.bull { background: rgba(0, 255, 136, 0.15); color: #00ff88; }
        .hm-cell.neutral { background: rgba(255, 255, 255, 0.06); color: #cbd5e1; }
        .hm-cell.bear { background: rgba(255, 68, 68, 0.15); color: #ff5555; }
        .hm-cell.strong-bear { background: rgba(255, 68, 68, 0.25); color: #ff4444; border: 1px solid #ff4444; }

        /* Direct Access Module Cards Grid */
        .module-grid-title {
          text-align: center;
          margin-bottom: 28px;
        }
        .module-grid-title h3 {
          font-size: 26px;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 8px;
        }
        .module-grid-title p {
          font-size: 15px;
          color: #e2e8f0;
        }
        .options-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .module-card {
          background: #070c0f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 28px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        .module-card:hover {
          border-color: #00ff88;
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 255, 136, 0.15);
        }
        .module-card.highlight-border {
          border-color: #00ff88;
          background: #091217;
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.12);
        }
        .m-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .m-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(0, 255, 136, 0.12);
          color: #00ff88;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 255, 136, 0.25);
        }
        .m-card-badge {
          font-size: 9.5px;
          font-weight: 900;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 8px;
        }
        .m-card-title {
          font-size: 19px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
        }
        .m-card-sub {
          font-size: 13.5px;
          color: #e2e8f0;
          line-height: 1.5;
          flex-grow: 1;
          margin-bottom: 20px;
        }
        .m-card-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin-bottom: 16px;
        }
        .m-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .m-card-click-hint {
          font-size: 12px;
          color: #00ff88;
          font-weight: 700;
        }
        .m-card-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #00ff88;
          color: #030708;
          font-size: 12px;
          font-weight: 900;
          padding: 6px 14px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .m-card-link-btn:hover {
          background: #05df72;
          transform: translateY(-1px);
        }

        /* Problems Section Grid */
        .problems-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }
        .problem-solution-card {
          background: #070c0f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .problem-solution-card:hover {
          border-color: rgba(0, 255, 136, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 255, 136, 0.1);
        }
        .featured-glow-card {
          border-color: rgba(0, 255, 136, 0.35);
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.08);
        }
        .card-top-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .card-top-tag.error-tag {
          color: #ff5555;
          background: rgba(255, 85, 85, 0.12);
          padding: 4px 10px;
          border-radius: 12px;
        }
        .card-heading {
          font-size: 23px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .card-problem-text {
          font-size: 15px;
          color: #e2e8f0;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .solution-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
        }
        .solution-box {
          background: rgba(0, 255, 136, 0.04);
          border: 1px solid rgba(0, 255, 136, 0.18);
          border-radius: 14px;
          padding: 20px;
        }
        .solution-box.highlight-solution {
          background: rgba(0, 255, 136, 0.09);
          border-color: rgba(0, 255, 136, 0.38);
        }
        .solution-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          color: #00ff88;
          margin-bottom: 8px;
        }
        .solution-title {
          font-size: 17px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 6px;
        }
        .solution-desc {
          font-size: 14px;
          color: #f1f5f9;
          line-height: 1.5;
        }

        /* Feature Showcase (Time Machine Replay) */
        .showcase-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
        }
        .showcase-title {
          font-size: 42px;
          font-weight: 900;
          line-height: 1.18;
          letter-spacing: -1px;
          margin-bottom: 20px;
        }
        .showcase-lead {
          font-size: 17px;
          color: #e2e8f0;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .feature-bullets {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 36px;
        }
        .f-bullet {
          display: flex;
          gap: 16px;
        }
        .f-bullet-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(0, 255, 136, 0.12);
          color: #00ff88;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(0, 255, 136, 0.25);
        }
        .f-bullet strong {
          display: block;
          font-size: 16px;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .f-bullet p {
          font-size: 14px;
          color: #e2e8f0;
          line-height: 1.5;
          margin: 0;
        }
        .showcase-cta-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .free-badge-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 700;
          color: #00ff88;
        }
        .pulse-green {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
        }

        /* Showcase Visual Right Card */
        .visual-card {
          background: #070c10;
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 24px;
          padding: 28px;
          position: relative;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
        }
        .visual-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .replay-badge-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          color: #00ff88;
          background: rgba(0, 255, 136, 0.12);
          padding: 4px 12px;
          border-radius: 12px;
        }
        .rec-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff4444;
          animation: pulseDot 1s infinite;
        }
        .replay-date-selector {
          font-size: 12px;
          font-weight: 700;
          color: #cbd5e1;
        }
        .replay-date-selector .val {
          color: #00ff88;
          margin-left: 6px;
        }
        .visual-chart-mock {
          background: #04080a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .mock-candle-seq {
          height: 180px;
          display: flex;
          align-items: flex-end;
          gap: 22px;
          justify-content: center;
          position: relative;
        }
        .c-col {
          width: 24px;
          border-radius: 4px;
          position: relative;
        }
        .c-col.down {
          background: #ff4444;
          box-shadow: 0 0 15px rgba(255, 68, 68, 0.3);
        }
        .c-col.up {
          background: #00ff88;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
        }
        .c-col.special .pin-callout {
          position: absolute;
          top: -32px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          background: #00ff88;
          color: #030708;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 8px;
        }
        .visual-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 24px;
          text-align: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .v-lbl {
          display: block;
          font-size: 11px;
          color: #cbd5e1;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .v-val {
          font-size: 17px;
          font-weight: 800;
        }
        .visual-card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: #cbd5e1;
        }

        /* Institutional Trade Desk Grid */
        .terminal-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .t-card {
          background: #070c0f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px 28px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        .t-card:hover {
          border-color: #00ff88;
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 255, 136, 0.12);
        }
        .t-card-icon {
          color: #00ff88;
          margin-bottom: 20px;
        }
        .t-card h3 {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .t-card p {
          font-size: 14.5px;
          color: #e2e8f0;
          line-height: 1.6;
        }

        /* AI Mentor Section */
        .ai-mentor-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .ai-chat-mock {
          background: #070c10;
          border: 1px solid rgba(0, 255, 136, 0.35);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 255, 136, 0.12);
        }
        .chat-top {
          background: #0b1116;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .chat-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-title {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
        }
        .chat-status {
          font-size: 12px;
          color: #00ff88;
          font-weight: 600;
        }
        .chat-messages {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #04080a;
        }
        .msg-sender {
          font-size: 11px;
          font-weight: 800;
          color: #cbd5e1;
          margin-bottom: 6px;
        }
        .user-msg {
          align-self: flex-end;
          max-width: 85%;
        }
        .user-msg .msg-bubble {
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 14px 18px;
          border-radius: 16px 16px 4px 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        .ai-msg {
          align-self: flex-start;
          max-width: 90%;
        }
        .ai-msg .msg-bubble {
          background: rgba(0, 255, 136, 0.08);
          border: 1px solid rgba(0, 255, 136, 0.35);
          color: #ffffff;
          padding: 16px 20px;
          border-radius: 16px 16px 16px 4px;
          font-size: 14px;
          line-height: 1.55;
        }
        .ai-p { margin-bottom: 12px; }
        .ai-p:last-child { margin-bottom: 0; }
        .ai-stats-pill-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .pill {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 10px;
        }
        .pill.green {
          background: rgba(0, 255, 136, 0.18);
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.35);
        }
        .pill.yellow {
          background: rgba(255, 189, 46, 0.18);
          color: #ffbd2e;
          border: 1px solid rgba(255, 189, 46, 0.35);
        }
        .chat-input-bar {
          background: #0b1116;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: #cbd5e1;
        }
        .chat-send-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #00ff88;
          color: #030708;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .ai-feature-checklist {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 36px;
        }
        .check-item {
          display: flex;
          gap: 12px;
          font-size: 15.5px;
          color: #e2e8f0;
          line-height: 1.5;
        }
        .check-item strong { color: #ffffff; }

        /* Comparison Table */
        .comparison-table-wrapper {
          overflow-x: auto;
          background: #070c0f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .comparison-table th, .comparison-table td {
          padding: 22px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .comparison-table th {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          background: #0a1014;
        }
        .comparison-table th small {
          font-size: 11px;
          color: #cbd5e1;
          font-weight: 600;
        }
        .comparison-table .highlight-col {
          background: rgba(0, 255, 136, 0.08);
          border-left: 1px solid rgba(0, 255, 136, 0.3);
          border-right: 1px solid rgba(0, 255, 136, 0.3);
          position: relative;
        }
        .th-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 900;
          background: #00ff88;
          color: #030708;
          padding: 2px 8px;
          border-radius: 8px;
          margin-bottom: 6px;
        }
        .feature-name strong {
          display: block;
          font-size: 15px;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .feature-name span {
          font-size: 12.5px;
          color: #cbd5e1;
        }
        .status-no {
          color: #ff5555;
          font-size: 13.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-warn {
          color: #ffbd2e;
          font-size: 13.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-yes {
          color: #00ff88;
          font-size: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .highlight-cell {
          background: rgba(0, 255, 136, 0.05);
          border-left: 1px solid rgba(0, 255, 136, 0.25);
          border-right: 1px solid rgba(0, 255, 136, 0.25);
        }
        .price-zero {
          font-size: 16px;
          text-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
        }

        /* Live Market Pulse & Search */
        .live-search-container {
          position: relative;
          max-width: 680px;
          margin: 0 auto 50px;
        }
        .search-bar-box {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #090e13;
          border: 1px solid rgba(0, 255, 136, 0.4);
          border-radius: 36px;
          padding: 8px 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 136, 0.15);
          transition: 0.3s;
        }
        .search-bar-box:focus-within {
          border-color: #00ff88;
          box-shadow: 0 10px 40px rgba(0, 255, 136, 0.3);
        }
        .search-bar-icon {
          color: #00ff88;
        }
        .search-bar-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 15px;
          padding: 10px 0;
        }
        .search-bar-input::placeholder {
          color: #cbd5e1;
        }
        .search-loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 255, 136, 0.2);
          border-top-color: #00ff88;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .search-results-popup {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 10px;
          background: #070c10;
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
          z-index: 50;
        }
        .search-item-row {
          padding: 14px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: background 0.2s;
        }
        .search-item-row:hover {
          background: rgba(0, 255, 136, 0.12);
        }
        .s-main { display: flex; flex-direction: column; gap: 3px; }
        .s-symbol { color: #ffffff; font-weight: 800; font-size: 14px; }
        .s-name { color: #cbd5e1; font-size: 12px; }
        .s-exchange {
          font-size: 11px;
          font-weight: 800;
          color: #00ff88;
          background: rgba(0, 255, 136, 0.12);
          padding: 3px 10px;
          border-radius: 10px;
        }

        /* Movers Cards */
        .movers-layout {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }
        .movers-card {
          background: #070c10;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }
        .gainers-card {
          border-top: 3px solid #00ff88;
        }
        .losers-card {
          border-top: 3px solid #ff4444;
        }
        .movers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .m-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .m-title-wrap h3 {
          font-size: 19px;
          font-weight: 800;
          color: #ffffff;
        }
        .m-badge {
          font-size: 10px;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: 10px;
        }
        .m-badge.green {
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
        }
        .m-badge.red {
          background: rgba(255, 68, 68, 0.15);
          color: #ff4444;
        }
        .movers-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mover-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mover-row:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(4px);
        }
        .mover-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mover-rank {
          font-size: 12px;
          font-weight: 800;
          color: #cbd5e1;
        }
        .mover-sym {
          font-size: 14.5px;
          font-weight: 800;
          color: #ffffff;
        }
        .mover-price-wrap {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mover-val {
          font-size: 14.5px;
          font-weight: 800;
          color: #ffffff;
        }
        .mover-chg {
          font-size: 12.5px;
          font-weight: 800;
        }
        .mover-chg.up { color: #00ff88; }
        .mover-chg.down { color: #ff4444; }

        /* Stats Banner */
        .stats-banner-section {
          padding: 40px 24px;
        }
        .stats-banner-grid {
          background: #070c0f;
          border: 1px solid rgba(0, 255, 136, 0.25);
          border-radius: 24px;
          padding: 48px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          text-align: center;
          box-shadow: 0 0 50px rgba(0, 255, 136, 0.08);
        }
        .stat-big-number {
          font-size: 46px;
          font-weight: 900;
          color: #00ff88;
          text-shadow: 0 0 25px rgba(0, 255, 136, 0.4);
          margin-bottom: 8px;
        }
        .stat-text {
          font-size: 13.5px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.5px;
        }

        /* FAQ Accordion */
        .faq-accordion {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .faq-item {
          background: #070c0f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 22px 26px;
          cursor: pointer;
          transition: all 0.25s;
        }
        .faq-item:hover {
          border-color: rgba(0, 255, 136, 0.4);
        }
        .faq-item.open {
          border-color: #00ff88;
          background: #080f13;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16.5px;
          font-weight: 800;
          color: #ffffff;
        }
        .faq-answer {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 14.5px;
          color: #f1f5f9;
          line-height: 1.6;
        }

        /* Bottom Giant CTA */
        .cta-banner-section {
          padding: 80px 24px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .cta-banner-card {
          background: radial-gradient(circle at 50% 0%, rgba(0, 255, 136, 0.18) 0%, #060b0e 70%);
          border: 1px solid rgba(0, 255, 136, 0.4);
          border-radius: 32px;
          padding: 72px 40px;
          text-align: center;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(0, 255, 136, 0.18);
        }
        .cta-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 900;
          color: #00ff88;
          letter-spacing: 1.5px;
          background: rgba(0, 255, 136, 0.12);
          padding: 4px 14px;
          border-radius: 14px;
          margin-bottom: 20px;
          border: 1px solid rgba(0, 255, 136, 0.3);
        }
        .cta-banner-heading {
          font-size: 48px;
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 20px;
          letter-spacing: -1px;
        }
        .cta-banner-sub {
          font-size: 18px;
          color: #e2e8f0;
          max-width: 640px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }
        .btn-cta-giant {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #00ff88;
          color: #030708;
          text-decoration: none;
          font-size: 18px;
          font-weight: 900;
          padding: 20px 48px;
          border-radius: 40px;
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.5);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-cta-giant:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 60px rgba(0, 255, 136, 0.7);
          background: #05df72;
        }
        .cta-footnote {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 28px;
          font-size: 13.5px;
          color: #cbd5e1;
          font-weight: 700;
          flex-wrap: wrap;
        }

        /* Footer */
        .footer-wrap {
          background: #020405;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 80px 24px 40px;
          position: relative;
          z-index: 10;
        }
        .footer-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 60px;
        }
        .footer-tagline {
          font-size: 14.5px;
          color: #cbd5e1;
          line-height: 1.6;
          margin-top: 18px;
          max-width: 380px;
        }
        .footer-system-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #00ff88;
          margin-top: 20px;
          font-weight: 700;
        }
        .status-ping {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
        }
        .footer-links-col h4 {
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 18px;
          letter-spacing: 0.5px;
        }
        .footer-links-col a {
          display: block;
          color: #cbd5e1;
          text-decoration: none;
          font-size: 13.5px;
          margin-bottom: 12px;
          transition: color 0.2s;
        }
        .footer-links-col a:hover {
          color: #00ff88;
        }
        .footer-bottom {
          max-width: 1300px;
          margin: 0 auto;
          padding-top: 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 32px;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.6;
        }
        .footer-disclaimer {
          max-width: 800px;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1080px) {
          .hero-heading { font-size: 44px; }
          .option-display-card { grid-template-columns: 1fr; gap: 30px; }
          .options-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .showcase-container { grid-template-columns: 1fr; gap: 40px; }
          .ai-mentor-container { grid-template-columns: 1fr; gap: 40px; }
          .terminal-features-grid { grid-template-columns: repeat(2, 1fr); }
          .problems-grid { grid-template-columns: 1fr; }
          .stats-banner-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-inner { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .nav-menu { display: none; }
          .hero-wrap { padding-top: 100px; }
          .hero-heading { font-size: 34px; }
          .hero-lead { font-size: 16px; }
          .hero-buttons-row { flex-direction: column; width: 100%; }
          .btn-hero-primary, .btn-hero-secondary { width: 100%; justify-content: center; }
          .options-cards-grid { grid-template-columns: 1fr; }
          .movers-layout { grid-template-columns: 1fr; }
          .terminal-features-grid { grid-template-columns: 1fr; }
          .stats-banner-grid { grid-template-columns: 1fr; }
          .footer-inner { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; }
          .cta-banner-heading { font-size: 30px; }
          .cta-banner-card { padding: 40px 20px; }
          .section-title { font-size: 28px; }
          .showcase-title { font-size: 28px; }
          .opt-card-heading { font-size: 24px; }
          .terminal-ai-bubble { position: static; margin-top: 12px; max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
