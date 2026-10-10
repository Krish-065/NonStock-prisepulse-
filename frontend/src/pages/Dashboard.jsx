import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrading } from '../contexts/TradingContext';
import { apiClient } from '../services/api';
import { 
  Trophy, Medal, Star, Zap, ArrowRight, ShieldCheck, 
  Lock, Unlock, Target, Coins, Activity, TrendingUp, TrendingDown,
  Search, Plus, X, Crown, Sparkles, Sliders, ExternalLink,
  Flame, CheckCircle2, AlertCircle, BarChart2, Camera, Image, Trash2,
  Bot, FlaskConical, Clock, ShieldAlert, Award, Globe, ArrowUpRight,
  ChevronRight, Filter, Info, Eye, ChevronDown, ChevronUp, Layers, Check,
  Server, Play, Pause, RefreshCw, FileText, Calculator, LayoutDashboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import BrokerMirrorModal from '../components/BrokerMirrorModal';
import GoldCoin1K from '../components/GoldCoin1K';
import MarketHoursDesk from '../components/MarketHoursDesk';
import PositionSizeCalculator from '../components/PositionSizeCalculator';
import MobilePortfolioHub from '../components/MobilePortfolioHub';
import TradingBadgeIcon from '../components/TradingBadgeIcon';
import DecagonTagBadge from '../components/DecagonTagBadge';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { BADGES_CATALOG, DISCIPLINE_TASKS } from '../data/badgesData';

// Available assets for the Watchlist search dropdown & live ticker
const WATCHLIST_DATABASE = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Crypto', price: 86280.00, change: 2.45, digits: 2, prefix: '$' },
  { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Crypto', price: 3420.50, change: 1.80, digits: 2, prefix: '$' },
  { symbol: 'SOLUSDT', name: 'Solana', category: 'Crypto', price: 158.20, change: 4.12, digits: 2, prefix: '$' },
  { symbol: 'XAUUSD', name: 'Gold Spot (Ounce)', category: 'Commodities', price: 2518.40, change: 0.74, digits: 2, prefix: '$' },
  { symbol: 'WTIUSD', name: 'Crude Oil WTI', category: 'Commodities', price: 78.50, change: -0.65, digits: 2, prefix: '$' },
  { symbol: 'XAGUSD', name: 'Silver Spot', category: 'Commodities', price: 29.40, change: 1.15, digits: 2, prefix: '$' },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'Forex', price: 1.0848, change: 0.22, digits: 4, prefix: '$' },
  { symbol: 'GBPUSD', name: 'British Pound / USD', category: 'Forex', price: 1.3032, change: -0.12, digits: 4, prefix: '$' },
  { symbol: 'USDJPY', name: 'USD / Japanese Yen', category: 'Forex', price: 148.82, change: 0.36, digits: 2, prefix: '¥' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / USD', category: 'Forex', price: 0.6720, change: 0.18, digits: 4, prefix: '$' },
  { symbol: 'USDCAD', name: 'USD / Canadian Dollar', category: 'Forex', price: 1.3540, change: -0.08, digits: 4, prefix: '$' },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Equities', price: 226.40, change: 0.85, digits: 2, prefix: '$' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Equities', price: 124.50, change: 3.10, digits: 2, prefix: '$' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Equities', price: 248.60, change: -1.40, digits: 2, prefix: '$' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Equities', price: 420.80, change: 0.60, digits: 2, prefix: '$' },
  { symbol: 'SPY', name: 'S&P 500 ETF Trust', category: 'Indices', price: 572.30, change: 0.45, digits: 2, prefix: '$' },
  { symbol: 'QQQ', name: 'Invesco QQQ (Nasdaq 100)', category: 'Indices', price: 488.20, change: 0.78, digits: 2, prefix: '$' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    balance = 1000, coins = 100, streakDays = 1, loginStreak = 1, tradeStreak = 0, positions = [], history = [], badge, closePosition,
    watchlist = [], addToWatchlist, removeFromWatchlist,
    unlockedTools = {}, unlockTool,
    isFreeGraceActive = true, trialDaysRemaining = 60,
    syncVaultAndStreak
  } = useTrading();

  // Responsive mobile state for optimal vertical stacked layout on mobile
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 900 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gold Coins Vault & Audit Ledger Modal state
  const [showCoinVaultModal, setShowCoinVaultModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [coinVaultData, setCoinVaultData] = useState(null);
  const [coinVaultLoading, setCoinVaultLoading] = useState(false);

  const fetchCoinVaultLedger = async () => {
    setCoinVaultLoading(true);
    try {
      if (syncVaultAndStreak) {
        await syncVaultAndStreak();
      }
      const res = await apiClient.get('/paper/coin-vault');
      if (res.data) {
        setCoinVaultData(res.data);
      }
    } catch (e) {
      console.warn('Failed to load coin vault ledger:', e);
    } finally {
      setCoinVaultLoading(false);
    }
  };

  // Welcome / Transition overlay state
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    const hasSeen = sessionStorage.getItem('stocksoperator_seen_welcome_splash');
    return !hasSeen;
  });
  const [welcomeSeconds, setWelcomeSeconds] = useState(3);

  // Auto-countdown to close welcome splash
  useEffect(() => {
    if (!showWelcomeSplash) return;
    const timer = setInterval(() => {
      setWelcomeSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          sessionStorage.setItem('stocksoperator_seen_welcome_splash', 'true');
          setShowWelcomeSplash(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showWelcomeSplash]);

  const dismissWelcome = () => {
    sessionStorage.setItem('stocksoperator_seen_welcome_splash', 'true');
    setShowWelcomeSplash(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [badgeSearch, setBadgeSearch] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showProModal, setShowProModal] = useState(false);
  
  // Show More / Collapse state for badges (curated default view of 6 badges)
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Broker Mirror & Real Account Sync state
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [brokerMirror, setBrokerMirror] = useState(null);

  const fetchBrokerMirror = () => {
    apiClient.get('/broker-mirror/status')
      .then(res => setBrokerMirror(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchBrokerMirror();
  }, []);

  const handleToggleMirror = async () => {
    try {
      const res = await apiClient.post('/broker-mirror/toggle');
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchBrokerMirror();
      }
    } catch {
      toast.error('Failed to toggle mirror state');
    }
  };

  const handleDisconnectMirror = async () => {
    if (!window.confirm('Disconnect broker mirror? Real trades will no longer replicate to the proving baseline.')) return;
    try {
      const res = await apiClient.post('/broker-mirror/disconnect');
      if (res.data?.success) {
        toast.success('Broker disconnected');
        fetchBrokerMirror();
      }
    } catch {
      toast.error('Failed to disconnect broker');
    }
  };

  // Avatar & Banner state
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('stocksoperator_user_avatar') || '' : '';
  });
  const [bannerUrl, setBannerUrl] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('stocksoperator_user_banner') || '' : '';
  });

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar file size must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result;
      if (b64) {
        setAvatarUrl(b64);
        localStorage.setItem('stocksoperator_user_avatar', b64);
        toast.success('Avatar updated successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Banner file size must be under 4MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result;
      if (b64) {
        setBannerUrl(b64);
        localStorage.setItem('stocksoperator_user_banner', b64);
        toast.success('Terminal banner updated successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  // Safe numerical baseline & tier logic
  const balanceNum = useMemo(() => {
    const b = Number(balance);
    return isNaN(b) || b <= 0 ? 1000 : b;
  }, [balance]);

  let dynamicTierName = 'Contender';
  let dynamicTierColor = '#0F172A';
  let nextRankName = 'Silver Prover';
  let nextRankTarget = 2000;
  let currentRankTarget = 1000;

  if (balanceNum >= 15000) {
    dynamicTierName = 'Apex Operator';
    dynamicTierColor = '#A855F7';
    nextRankName = 'Pinnacle Master';
    nextRankTarget = 25000;
    currentRankTarget = 15000;
  } else if (balanceNum >= 8000) {
    dynamicTierName = 'Master Titan';
    dynamicTierColor = '#E11D48';
    nextRankName = 'Apex Operator';
    nextRankTarget = 15000;
    currentRankTarget = 8000;
  } else if (balanceNum >= 4000) {
    dynamicTierName = 'Gold Sovereign';
    dynamicTierColor = '#EAB308';
    nextRankName = 'Master Titan';
    nextRankTarget = 8000;
    currentRankTarget = 4000;
  } else if (balanceNum >= 2000) {
    dynamicTierName = 'Silver Prover';
    dynamicTierColor = '#64748B';
    nextRankName = 'Gold Sovereign';
    nextRankTarget = 4000;
    currentRankTarget = 2000;
  } else {
    dynamicTierName = 'Contender';
    dynamicTierColor = '#0F172A';
    nextRankName = 'Silver Prover';
    nextRankTarget = 2000;
    currentRankTarget = 1000;
  }

  const rankProgress = Math.min(100, Math.max(0, ((balanceNum - currentRankTarget) / (nextRankTarget - currentRankTarget || 1)) * 100));
  const userName = user?.name || user?.email?.split('@')[0] || 'Trader';

  // Compute stats
  const totalTrades = history.length;
  const winningTrades = history.filter(h => (h.pnl || h.profit || 0) > 0).length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  const netPnL = balanceNum - 1000;
  const netRoi = ((balanceNum - 1000) / 1000) * 100;

  // ─── MATHEMATICALLY RIGOROUS DISCIPLINE EXECUTION RATING (DER) ENGINE ───
  // Total Score Scale: 0 to 100 Points.
  // 1. Win Rate Edge (0 - 35 pts): (winRate / 100) * 35 (or 24.5 default if 0 trades)
  // 2. Capital Growth & Preservation (0 - 25 pts): Math.min(25, (balanceNum / 1000) * 18 + (netPnL >= 0 ? 4 : 0))
  // 3. Mandatory Stop-Loss Protection (0 - 20 pts): 19.5 pts if protected
  // 4. Streak Discipline (0 - 10 pts): Math.min(10, Math.max(2, (loginStreak + tradeStreak) * 1.5))
  // 5. Anti-Overtrading & Tilt Control (0 - 10 pts): 10.0 pts for <= 5 trades/day
  const derScore = useMemo(() => {
    const winRatePts = totalTrades > 0 ? (winRate / 100) * 35 : 24.5;
    const growthFactor = Math.max(0.5, Math.min(2.0, balanceNum / 1000));
    const capitalPts = Math.min(25, growthFactor * 18 + (netPnL >= 0 ? 4 : 0));
    const slCompliant = positions.every(p => Boolean(p.sl)) && (history.length === 0 || history.some(h => Boolean(h.sl) || Boolean(h.stopLoss)));
    const riskPts = slCompliant || positions.length === 0 ? 19.5 : 12.0;
    const combinedStreak = (loginStreak || 1) + (tradeStreak || 0);
    const streakPts = Math.min(10, Math.max(2, combinedStreak * 1.5));
    const todayTrades = history.filter(h => (h.closeTime || h.openTime || '').slice(0, 10) === new Date().toISOString().slice(0, 10)).length + positions.length;
    const tiltControlPts = todayTrades <= 5 ? 10.0 : Math.max(2.0, 10.0 - (todayTrades - 5) * 1.5);

    const raw = winRatePts + capitalPts + riskPts + streakPts + tiltControlPts;
    return parseFloat(Math.min(99.4, Math.max(50.0, raw)).toFixed(1));
  }, [totalTrades, winRate, balanceNum, netPnL, positions, history, loginStreak, tradeStreak]);

  // ─── WATCHLIST RADAR & SEARCH BAR ENGINE ───
  const [watchlistSearch, setWatchlistSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAllWatchlist, setShowAllWatchlist] = useState(false);
  const [liveWatchlistPrices, setLiveWatchlistPrices] = useState(() => {
    const initial = {};
    WATCHLIST_DATABASE.forEach(item => {
      initial[item.symbol] = {
        price: item.price,
        change: item.change,
        digits: item.digits,
        prefix: item.prefix,
        name: item.name,
        category: item.category,
        flash: null
      };
    });
    return initial;
  });

  // Micro-tick live engine for Watchlist items
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setLiveWatchlistPrices(prev => {
        const next = { ...prev };
        const symbols = Object.keys(next);
        if (symbols.length === 0) return prev;
        
        const count = Math.min(symbols.length, Math.floor(Math.random() * 2) + 1);
        for (let i = 0; i < count; i++) {
          const sym = symbols[Math.floor(Math.random() * symbols.length)];
          const item = next[sym];
          if (!item) continue;
          
          let delta = 0;
          if (item.category === 'Crypto') {
            delta = (Math.random() - 0.49) * (item.price > 1000 ? 22 : 0.4);
          } else if (item.category === 'Commodities') {
            delta = (Math.random() - 0.49) * 0.65;
          } else if (item.category === 'Forex') {
            delta = (Math.random() - 0.49) * 0.00025;
          } else {
            delta = (Math.random() - 0.49) * 0.45;
          }

          const newPrice = parseFloat((item.price + delta).toFixed(item.digits || 2));
          const flash = delta >= 0 ? 'up' : 'down';
          next[sym] = {
            ...item,
            price: newPrice,
            flash
          };
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(tickInterval);
  }, []);

  const getWatchlistMeta = (sym) => {
    const clean = (sym || '').toUpperCase();
    if (liveWatchlistPrices[clean]) return liveWatchlistPrices[clean];
    const match = WATCHLIST_DATABASE.find(w => w.symbol === clean);
    if (match) {
      return {
        price: match.price,
        change: match.change,
        digits: match.digits,
        prefix: match.prefix,
        name: match.name,
        category: match.category,
        flash: null
      };
    }
    return {
      price: 100.0,
      change: 0.0,
      digits: 2,
      prefix: '$',
      name: clean,
      category: 'Market',
      flash: null
    };
  };

  const filteredCatalogForSearch = useMemo(() => {
    const q = watchlistSearch.trim().toLowerCase();
    if (!q) return [];
    return WATCHLIST_DATABASE.filter(item => {
      const alreadyIn = watchlist.includes(item.symbol);
      if (alreadyIn) return false;
      return item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    }).slice(0, 6);
  }, [watchlistSearch, watchlist]);

  const handleAddSymbolToWatchlist = (sym) => {
    addToWatchlist(sym);
    setWatchlistSearch('');
    setIsSearchFocused(false);
  };

  // Evaluate All 52 Badges
  const evaluatedBadges = useMemo(() => {
    const stateContext = {
      balance: balanceNum,
      history,
      positions,
      coins,
      streakDays: loginStreak || streakDays || 1,
      loginStreak: loginStreak || streakDays || 1,
      tradeStreak: tradeStreak || 0,
      watchlist,
      hasAvatar: Boolean(avatarUrl)
    };

    let tempUnlocked = 0;
    BADGES_CATALOG.forEach(b => {
      if (b.id !== 52) {
        const res = b.check(stateContext);
        if (res.unlocked) tempUnlocked++;
      }
    });

    stateContext.unlockedBadgeCount = tempUnlocked;

    return BADGES_CATALOG.map(b => {
      const evaluation = b.check(stateContext);
      const pct = Math.min(100, Math.max(0, Math.round((evaluation.progress / (evaluation.target || 1)) * 100)));
      return {
        ...b,
        unlocked: evaluation.unlocked,
        progress: evaluation.progress,
        target: evaluation.target,
        progressPct: pct,
        progressText: evaluation.text
      };
    });
  }, [balanceNum, history, positions, coins, streakDays, loginStreak, tradeStreak, watchlist, avatarUrl]);

  const totalUnlockedCount = useMemo(() => {
    return evaluatedBadges.filter(b => b.unlocked).length;
  }, [evaluatedBadges]);

  // Evaluate the Dedicated Discipline Tasks Desk (Completely separate from badges)
  const evaluatedDisciplineTasks = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const hasTradedToday = positions.length > 0 || (history || []).some(h => (h.closeTime || h.openTime || '').slice(0, 10) === todayStr);

    const taskContext = {
      streakDays: loginStreak || streakDays || 1,
      loginStreak: loginStreak || streakDays || 1,
      tradeStreak: tradeStreak || 0,
      hasTradedToday,
      watchlist,
      positions,
      history,
      coins
    };
    return DISCIPLINE_TASKS.map(task => {
      const evaluation = task.check(taskContext);
      return {
        ...task,
        completed: evaluation.completed,
        progress: evaluation.progress,
        target: evaluation.target,
        statusText: evaluation.statusText
      };
    });
  }, [streakDays, loginStreak, tradeStreak, watchlist, positions, history, coins]);

  const completedTasksCount = useMemo(() => {
    return evaluatedDisciplineTasks.filter(t => t.completed).length;
  }, [evaluatedDisciplineTasks]);

  const earnedTasksCoins = useMemo(() => {
    return evaluatedDisciplineTasks.filter(t => t.completed).reduce((sum, t) => sum + t.coins, 0);
  }, [evaluatedDisciplineTasks]);

  // Filtered badges based on search & category
  const filteredBadges = useMemo(() => {
    return evaluatedBadges.filter(b => {
      if (badgeSearch.trim()) {
        const q = badgeSearch.toLowerCase().trim();
        const match = b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (badgeFilter === 'bounties') return b.hasBounty;
      if (badgeFilter === 'honor') return !b.hasBounty;
      if (badgeFilter === 'unlocked') return b.unlocked;
      if (badgeFilter === 'locked') return !b.unlocked;
      if (badgeFilter === 'tier1') return b.tier === 1;
      if (badgeFilter === 'tier2') return b.tier === 2;
      if (badgeFilter === 'tier3') return b.tier === 3;
      return true;
    });
  }, [evaluatedBadges, badgeFilter, badgeSearch]);

  // Visible badges: if not showAllBadges, show top 6
  const visibleBadges = useMemo(() => {
    if (showAllBadges) return filteredBadges;
    const sorted = [...filteredBadges].sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return b.progressPct - a.progressPct;
    });
    return sorted.slice(0, 6);
  }, [filteredBadges, showAllBadges]);

  // Real Leaderboard
  const [realLeaderboard, setRealLeaderboard] = useState([]);

  useEffect(() => {
    apiClient.get('/paper/hall-of-fame')
      .then(res => {
        const data = res.data;
        if (data?.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          const normalized = data.leaderboard
            .filter(item => {
              const nameLower = (item.name || '').toLowerCase();
              return !nameLower.includes('tester') && !nameLower.includes('test') && !nameLower.includes('demo');
            })
            .map(item => ({
              ...item,
              balance: Number(item.balance) > 15000 ? 1000 : (Number(item.balance) || 1000)
            }));
          setRealLeaderboard(normalized);
        } else {
          setRealLeaderboard([
            {
              rank: 1,
              name: userName,
              tag: dynamicTierName,
              color: dynamicTierColor,
              der: derScore,
              balance: balanceNum,
              isSelf: true
            }
          ]);
        }
      })
      .catch(() => {
        setRealLeaderboard([
          {
            rank: 1,
            name: userName,
            tag: dynamicTierName,
            color: dynamicTierColor,
            der: derScore,
            balance: balanceNum,
            isSelf: true
          }
        ]);
      });
  }, [userName, balanceNum, dynamicTierName, dynamicTierColor, derScore]);

  // ─── 5-MARKET CATEGORY BENCHMARK & RANKING ENGINE ───
  const [rankingCategory, setRankingCategory] = useState('Overall');
  const [showTop20, setShowTop20] = useState(false);

  const getTierTheme = (tier) => {
    if (tier === 'Apex Operator') return 'decagon_apex';
    if (tier === 'Master Titan') return 'decagon_titan';
    if (tier === 'Gold Sovereign') return 'decagon_gold';
    if (tier === 'Silver Prover') return 'decagon_silver';
    return 'decagon_contender';
  };

  // Helper to categorize any asset
  const getAssetCategory = (symbol = '') => {
    const sym = String(symbol || '').toUpperCase().trim();
    if (sym.includes('.NS') || sym.includes('.BO') || sym.includes('NIFTY') || sym.includes('NSE') || sym.includes('BSE') || sym.includes('RELIANCE') || sym.includes('TCS') || sym.includes('HDFCBANK') || sym.includes('INFY') || sym.includes('ICICIBANK') || sym.includes('TATAMOTORS')) {
      return 'Indian Market';
    }
    if (sym.includes('BTC') || sym.includes('ETH') || sym.includes('SOL') || sym.includes('XRP') || sym.includes('DOGE') || sym.includes('BNB') || sym.includes('ADA') || sym.includes('USDT') || sym.includes('CRYPTO')) {
      return 'Crypto';
    }
    if (sym.includes('EUR') || sym.includes('GBP') || sym.includes('JPY') || sym.includes('CHF') || sym.includes('AUD') || sym.includes('NZD') || sym.includes('CAD') || sym.includes('=X') || sym.includes('FOREX')) {
      return 'Forex';
    }
    if (sym.includes('XAU') || sym.includes('GOLD') || sym.includes('XAG') || sym.includes('SILVER') || sym.includes('WTI') || sym.includes('CRUDE') || sym.includes('OIL') || sym.includes('BRENT') || sym.includes('NATGAS') || sym.includes('GC=F') || sym.includes('CL=F') || sym.includes('SI=F') || sym.includes('COMMODIT')) {
      return 'Commodities';
    }
    return 'US Market';
  };

  // User's Real Category Breakdown from History
  const categoryBreakdown = useMemo(() => {
    const breakdown = {
      Crypto: { trades: 0, wins: 0, slHits: 0, netPnl: 0 },
      Forex: { trades: 0, wins: 0, slHits: 0, netPnl: 0 },
      Commodities: { trades: 0, wins: 0, slHits: 0, netPnl: 0 },
      'US Market': { trades: 0, wins: 0, slHits: 0, netPnl: 0 },
      'Indian Market': { trades: 0, wins: 0, slHits: 0, netPnl: 0 }
    };

    (history || []).forEach(item => {
      const cat = getAssetCategory(item.asset || item.symbol || '');
      if (!breakdown[cat]) breakdown[cat] = { trades: 0, wins: 0, slHits: 0, netPnl: 0 };
      
      const pnl = Number(item.pnl || item.profit || 0);
      breakdown[cat].trades += 1;
      if (pnl > 0) {
        breakdown[cat].wins += 1;
      } else if (pnl < 0) {
        breakdown[cat].slHits += 1;
      }
      breakdown[cat].netPnl += pnl;
    });

    return breakdown;
  }, [history]);

  // Unified Ranked Board for selected category
  const rankedBoardList = useMemo(() => {
    const list = realLeaderboard.map((item, idx) => {
      if (item.isSelf) {
        return {
          ...item,
          name: userName,
          tag: dynamicTierName,
          color: dynamicTierColor,
          der: derScore,
          balance: balanceNum,
          netPnl: balanceNum - 1000,
          categoryStats: categoryBreakdown,
          isSelf: true
        };
      }

      const bal = Number(item.balance) || 1000;
      const net = bal - 1000;
      return {
        ...item,
        netPnl: net,
        categoryStats: item.categoryStats || {
          Crypto: { trades: Math.max(1, Math.round(((idx + 3) * 2) * 0.35)), wins: Math.round(((idx + 3) * 2) * 0.22), slHits: Math.round(((idx + 3) * 2) * 0.13), netPnl: Math.round(net * 0.45) },
          Forex: { trades: Math.max(1, Math.round(((idx + 3) * 2) * 0.25)), wins: Math.round(((idx + 3) * 2) * 0.17), slHits: Math.round(((idx + 3) * 2) * 0.08), netPnl: Math.round(net * 0.25) },
          Commodities: { trades: Math.max(1, Math.round(((idx + 3) * 2) * 0.2)), wins: Math.round(((idx + 3) * 2) * 0.14), slHits: Math.round(((idx + 3) * 2) * 0.06), netPnl: Math.round(net * 0.18) },
          'US Market': { trades: Math.max(1, Math.round(((idx + 3) * 2) * 0.15)), wins: Math.round(((idx + 3) * 2) * 0.1), slHits: Math.round(((idx + 3) * 2) * 0.05), netPnl: Math.round(net * 0.12) },
          'Indian Market': { trades: 0, wins: 0, slHits: 0, netPnl: 0 }
        }
      };
    });

    const hasSelf = list.some(u => u.isSelf);
    if (!hasSelf) {
      list.push({
        id: user?.id || 'self',
        name: userName,
        tag: dynamicTierName,
        color: dynamicTierColor,
        der: derScore,
        balance: balanceNum,
        netPnl: balanceNum - 1000,
        categoryStats: categoryBreakdown,
        isSelf: true
      });
    }

    if (rankingCategory === 'Overall') {
      list.sort((a, b) => (Number(b.balance) || 1000) - (Number(a.balance) || 1000));
    } else {
      list.sort((a, b) => {
        const pnlA = a.categoryStats?.[rankingCategory]?.netPnl ?? 0;
        const pnlB = b.categoryStats?.[rankingCategory]?.netPnl ?? 0;
        return pnlB - pnlA;
      });
    }

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [realLeaderboard, userName, dynamicTierName, dynamicTierColor, derScore, balanceNum, categoryBreakdown, rankingCategory, user?.id]);

  const visibleRankList = useMemo(() => {
    const limit = showTop20 ? 20 : 10;
    return rankedBoardList.slice(0, limit);
  }, [rankedBoardList, showTop20]);

  const currentUserRankItem = useMemo(() => {
    return rankedBoardList.find(u => u.isSelf) || null;
  }, [rankedBoardList]);

  const isCurrentUserInTopView = useMemo(() => {
    if (!currentUserRankItem) return true;
    const limit = showTop20 ? 20 : 10;
    return currentUserRankItem.rank <= limit;
  }, [currentUserRankItem, showTop20]);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div style={{ 
      maxWidth: '1540px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px',
      color: '#0F172A',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Hidden file inputs for avatar & banner upload */}
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={handleAvatarUpload} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
      <input 
        type="file" 
        ref={bannerInputRef} 
        onChange={handleBannerUpload} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* ─── INSTITUTIONAL VIEW SELECTOR (MOBILE & DESKTOP SUITE TABS) ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(226, 232, 240, 0.85)',
        borderRadius: '16px',
        padding: '10px 14px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          width: '100%'
        }}>
          {[
            { id: 'overview', label: 'Overview & Bento Dossier', icon: LayoutDashboard },
            { id: 'hours', label: 'Global Market Hours (NY, LDN, TYO, SYD)', icon: Clock, badge: 'SCREEN 1' },
            { id: 'curve', label: 'Portfolio Performance Curve', icon: TrendingUp, badge: 'SCREEN 2' },
            { id: 'calculator', label: 'Position Size & Risk Calculator', icon: Calculator, badge: 'SCREEN 3' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid #EA580C' : '1px solid transparent',
                  background: isActive ? 'rgba(240, 253, 244, 0.88)' : '#F8FAFC',
                  color: isActive ? '#9A3412' : '#475569',
                  fontSize: '13px',
                  fontWeight: isActive ? 900 : 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#C2410C' : '#64748B'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 900,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: isActive ? '#EA580C' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#64748B'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 0. SLEEK WELCOME / TRANSITION MODAL ─── */}
      {showWelcomeSplash && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #EA580C',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '540px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            position: 'relative'
          }}>
            <button
              onClick={dismissWelcome}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B'
              }}
            >
              <X size={16} />
            </button>

            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'rgba(240, 253, 244, 0.88)',
              border: '2px solid #EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.2)'
            }}>
              <ShieldCheck size={36} color="#EA580C" />
            </div>

            <div style={{ fontSize: '12px', fontWeight: 800, color: '#EA580C', letterSpacing: '1px', textTransform: 'uppercase' }}>
              VERIFIED INSTITUTIONAL PROTOCOL
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '8px 0 10px 0' }}>
              Welcome to Your Proving Terminal
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Your disciplined execution desk. 0 Tips, 0 Fake Screenshot PnL. Only real order flow execution with mathematical proof.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>BASELINE CAPITAL</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#EA580C', marginTop: '2px' }}>$1,000.00 Equal</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Universal proving baseline</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>ACTIVE PASS</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>60D Free Tools Pass</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>All institutional tools free</div>
              </div>
            </div>

            <button
              onClick={dismissWelcome}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
              }}
            >
              <span>Enter Execution Desk ({welcomeSeconds}s)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── DEDICATED TAB VIEW: MARKET HOURS (SCREEN 1) ─── */}
      {activeTab === 'hours' && (
        <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%' }}>
          <MarketHoursDesk />
        </div>
      )}

      {/* ─── DEDICATED TAB VIEW: PERFORMANCE CURVE (SCREEN 2) ─── */}
      {activeTab === 'curve' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <MobilePortfolioHub 
            balance={balanceNum} 
            netPnL={netPnL} 
            netRoi={netRoi} 
            coins={coins} 
            streakDays={streakDays} 
            derScore={Math.round(derScore)} 
            tierName={dynamicTierName} 
          />
        </div>
      )}

      {/* ─── DEDICATED TAB VIEW: POSITION SIZE CALCULATOR (SCREEN 3) ─── */}
      {activeTab === 'calculator' && (
        <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%' }}>
          <PositionSizeCalculator userBalance={balanceNum} />
        </div>
      )}

      {/* ─── OVERVIEW & BENTO DOSSIER TAB ─── */}
      {activeTab === 'overview' && (
        <>
          {/* Mobile Curve Preview when viewport is compact */}
          <div style={{ display: typeof window !== 'undefined' && window.innerWidth < 800 ? 'block' : 'none' }}>
            <MobilePortfolioHub 
              balance={balanceNum} 
              netPnL={netPnL} 
              netRoi={netRoi} 
              coins={coins} 
              streakDays={streakDays} 
              derScore={Math.round(derScore)} 
              tierName={dynamicTierName} 
            />
          </div>

          {/* ─── 0. TOP WIDE GLOBAL PROVING RANK BOARD (HALL OF FAME) ─── */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Wide Rank Board Header */}
            <div style={{
              padding: isMobile ? '16px' : '22px 28px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '16px',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <img 
                  src="/assets/stocks_operator_logo.png" 
                  alt="Stocks Operator" 
                  style={{ height: isMobile ? '30px' : '36px', objectFit: 'contain' }} 
                />
                <div style={{ width: '1px', height: '28px', background: '#E2E8F0', display: isMobile ? 'none' : 'block' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: isMobile ? '18px' : '21px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                      GLOBAL RANK BOARD // HALL OF FAME
                    </h2>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      background: '#FFEDD5',
                      color: '#C2410C',
                      border: '1px solid #FDBA74',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      LIVE BENCHMARK
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Ranked strictly by currency & net earnings ($) in chosen market • Zero fake screenshots • Universal $1,000 baseline
                  </p>
                </div>
              </div>

              {/* Market Ranking Pills */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflowX: 'auto',
                width: isMobile ? '100%' : 'auto',
                scrollbarWidth: 'none',
                paddingBottom: isMobile ? '4px' : '0'
              }}>
                {['Overall', 'Crypto', 'Forex', 'Commodities', 'US Market', 'Indian Market'].map((cat) => {
                  const isActive = rankingCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setRankingCategory(cat)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '10px',
                        border: isActive ? '1.5px solid #EA580C' : '1px solid #CBD5E1',
                        background: isActive ? '#0F172A' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#334155',
                        fontSize: '12px',
                        fontWeight: isActive ? 900 : 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rank Board Scrollable Table Container */}
            <div style={{
              maxHeight: '440px',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  background: '#F8FAFC',
                  zIndex: 2,
                  borderBottom: '1.5px solid #E2E8F0',
                  color: '#64748B',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px'
                }}>
                  <tr>
                    <th style={{ padding: '12px 18px', width: '70px' }}>Rank</th>
                    <th style={{ padding: '12px 16px' }}>Operator / Trader</th>
                    <th style={{ padding: '12px 16px' }}>
                      {rankingCategory === 'Overall' ? 'Market Trades' : `${rankingCategory} (Wins / SL)`}
                    </th>
                    <th style={{ padding: '12px 16px' }}>Discipline Rating</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>
                      {rankingCategory === 'Overall' ? 'Equity Capital' : `Net ${rankingCategory} Earned`}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRankList.map((row) => {
                    const isSelf = row.isSelf;
                    const stats = row.categoryStats?.[rankingCategory] || { trades: 0, wins: 0, slHits: 0, netPnl: 0 };
                    const catEarned = rankingCategory === 'Overall' ? (row.balance - 1000) : stats.netPnl;
                    const isPositive = catEarned >= 0;

                    return (
                      <tr
                        key={row.id || row.name}
                        style={{
                          background: isSelf ? 'rgba(255, 237, 213, 0.35)' : 'transparent',
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Rank Column */}
                        <td style={{ padding: '14px 18px', fontWeight: 900 }}>
                          {row.rank === 1 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D97706', fontSize: '14px' }}>
                              <Crown size={16} color="#D97706" /> #1
                            </span>
                          ) : row.rank === 2 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '14px' }}>
                              <Medal size={16} color="#94A3B8" /> #2
                            </span>
                          ) : row.rank === 3 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#B45309', fontSize: '14px' }}>
                              <Medal size={16} color="#B45309" /> #3
                            </span>
                          ) : (
                            <span style={{ color: '#475569' }}>#{row.rank}</span>
                          )}
                        </td>

                        {/* Operator Name & Tier Tag */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '10px',
                              background: isSelf ? '#EA580C' : '#0F172A',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '13px'
                            }}>
                              {row.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 800, color: '#0F172A' }}>
                                  {row.name}
                                </span>
                                {isSelf && (
                                  <span style={{
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    background: '#EA580C',
                                    color: '#FFFFFF',
                                    padding: '1px 5px',
                                    borderRadius: '4px'
                                  }}>
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 700, color: row.color || '#C2410C' }}>{row.tag || 'Contender'}</span>
                                <span>•</span>
                                <span>$1,000 Equal</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category Stats */}
                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                          {rankingCategory === 'Overall' ? (
                            <div style={{ fontSize: '12px', fontWeight: 700 }}>
                              {isSelf ? `${totalTrades} Total Trades (${winRate}% Win)` : `${row.trades || 8} Verified Trades`}
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                                {stats.trades} Trades ({stats.wins} Wins • {stats.slHits} SL Hits)
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                Win Rate: {stats.trades > 0 ? Math.round((stats.wins / stats.trades) * 100) : 0}%
                              </div>
                            </div>
                          )}
                        </td>

                        {/* DER Score */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 900,
                            color: '#9A3412',
                            background: 'rgba(240, 253, 244, 0.88)',
                            border: '1px solid #FDBA74',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {Number(row.der || 75.0).toFixed(1)} / 100 DER
                          </span>
                        </td>

                        {/* Currency Earned / Capital */}
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          {rankingCategory === 'Overall' ? (
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                                ${Number(row.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: isPositive ? '#C2410C' : '#DC2626' }}>
                                {isPositive ? '+' : ''}${catEarned.toFixed(2)} PnL
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{
                                fontSize: '15px',
                                fontWeight: 900,
                                color: isPositive ? '#C2410C' : '#DC2626'
                              }}>
                                {isPositive ? '+' : ''}${Number(catEarned).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>
                                {rankingCategory} Net Currency
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pinned Standing Footer if Current User is Outside Visible Top View */}
              {!isCurrentUserInTopView && currentUserRankItem && (
                <div style={{
                  position: 'sticky',
                  bottom: 0,
                  background: '#0F172A',
                  color: '#FFFFFF',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #EA580C',
                  zIndex: 3
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, background: '#EA580C', padding: '2px 8px', borderRadius: '4px' }}>
                      YOUR STANDING
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '13px' }}>
                      Rank #{currentUserRankItem.rank} in {rankingCategory}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800 }}>
                    Net Earned: <strong style={{ color: '#FB923C' }}>
                      {rankingCategory === 'Overall' 
                        ? `$${balanceNum.toFixed(2)} (${balanceNum - 1000 >= 0 ? '+' : ''}${(balanceNum - 1000).toFixed(2)})`
                        : `${(categoryBreakdown[rankingCategory]?.netPnl || 0) >= 0 ? '+' : ''}$${(categoryBreakdown[rankingCategory]?.netPnl || 0).toFixed(2)}`}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Rank Board Footer with Expansion Toggle */}
            <div style={{
              padding: '12px 24px',
              background: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#C2410C" />
                <span>Audited Ranking Protocol • {rankedBoardList.length} Prover{rankedBoardList.length === 1 ? '' : 's'} on Universal Baseline</span>
              </div>

              {rankedBoardList.length > 10 && (
                <button
                  onClick={() => setShowTop20(prev => !prev)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#0F172A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{showTop20 ? 'Collapse to Top 10' : 'Show More (Top 20)'}</span>
                  {showTop20 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>
          </div>

          {/* ─── 1. COMPREHENSIVE TRADER PROFILE DOSSIER & SECTOR DISTRIBUTION ─── */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* ─── FULL-WIDTH PANORAMIC COVER BANNER (PERFECT ON WEBSITE & MOBILE) ─── */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: isMobile ? '125px' : '185px',
              background: bannerUrl 
                ? `url(${bannerUrl}) center/cover no-repeat` 
                : 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #FB923C 100%)',
              transition: 'height 0.25s ease',
              overflow: 'hidden'
            }}>
              {/* Subtle top/bottom overlay for contrast */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 60%, rgba(0,0,0,0.35) 100%)',
                pointerEvents: 'none'
              }} />

              {/* Banner Controls (Top Right: Change & Remove) */}
              <div style={{
                position: 'absolute',
                top: isMobile ? '10px' : '14px',
                right: isMobile ? '12px' : '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 5
              }}>
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  title="Upload / Change Custom Banner"
                  style={{
                    background: 'rgba(15, 23, 42, 0.78)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '8px',
                    padding: isMobile ? '5px 10px' : '6px 14px',
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.78)'}
                >
                  <Camera size={13} />
                  <span>{bannerUrl ? 'Change Banner' : '+ Add Cover Banner'}</span>
                </button>

                {bannerUrl && (
                  <button
                    onClick={() => {
                      setBannerUrl('');
                      localStorage.removeItem('stocksoperator_user_banner');
                      toast.success('Custom banner removed');
                    }}
                    title="Remove custom banner"
                    style={{
                      background: 'rgba(220, 38, 38, 0.85)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '8px',
                      padding: isMobile ? '5px 8px' : '6px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* ─── MASTHEAD CONTENT BODY ─── */}
            <div style={{
              padding: isMobile ? '0 16px 20px 16px' : '0 28px 26px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Profile Identity Row with Avatar overlapping banner */}
              <div style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '16px',
                marginTop: isMobile ? '-34px' : '-44px',
                position: 'relative',
                zIndex: 4
              }}>
                {/* Left: Avatar & Identity */}
                <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: isMobile ? '12px' : '18px', flexWrap: 'wrap' }}>
                  {/* Interactive Avatar */}
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    style={{
                      position: 'relative',
                      width: isMobile ? '68px' : '88px',
                      height: isMobile ? '68px' : '88px',
                      borderRadius: '22px',
                      background: '#FFFFFF',
                      border: '4px solid #FFFFFF',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      transition: 'transform 0.15s ease'
                    }}
                    title="Click to update avatar"
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: 900, color: '#EA580C' }}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(15, 23, 42, 0.75)',
                      padding: '3px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Camera size={11} color="#FFFFFF" />
                    </div>
                  </div>

                  {/* Name, Tier & Status */}
                  <div style={{ paddingTop: isMobile ? '6px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px' }}>
                        {userName}
                      </span>
                      <DecagonTagBadge tier={dynamicTierName} size={isMobile ? "sm" : "md"} />
                      <div 
                        title={`${dynamicTierName} Verified Tier Insignia`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          borderRadius: '16px',
                          background: '#FFFFFF',
                          border: `2px solid ${dynamicTierColor}`,
                          boxShadow: `0 0 25px ${dynamicTierColor}45, 0 4px 12px rgba(0,0,0,0.06)`,
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <TradingBadgeIcon theme={getTierTheme(dynamicTierName)} size={isMobile ? 38 : 48} />
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>Rank #{currentUserRankItem?.rank || 1} ({rankingCategory})</span>
                      <span>•</span>
                      <span style={{ color: '#EA580C', fontWeight: 800 }}>Pro Member</span>
                      <span>•</span>
                      <span style={{ color: '#64748B' }}>Baseline $1,000.00</span>
                    </div>
                  </div>
                </div>

                {/* Right: Live Audit & Arena Action */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: isMobile ? 'space-between' : 'flex-end',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    background: 'rgba(240, 253, 244, 0.88)',
                    border: '1px solid #FDBA74',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#9A3412'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EA580C' }} />
                    <span>LIVE FEED AUDIT</span>
                  </div>

                  <button
                    onClick={() => navigate('/trading')}
                    style={{
                      background: '#0F172A',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      padding: '9px 18px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)'
                    }}
                  >
                    <Zap size={15} color="#EA580C" />
                    <span>ENTER ARENA</span>
                  </button>
                </div>
              </div>

              {/* Upper Technical Meta Ribbon */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '10px 16px',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '11px',
                color: '#64748B',
                fontWeight: 700,
                letterSpacing: '0.6px',
                textTransform: 'uppercase'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#0F172A', fontWeight: 900 }}>UNALTERABLE EXECUTION PROTOCOL</span>
                  <span>•</span>
                  <span>ACCOUNT: SO-{user?.id?.substring(0, 8) || 'c141ad16'}</span>
                  <span>•</span>
                  <span>UNIVERSAL BASELINE: <strong style={{ color: '#EA580C' }}>$1,000.00</strong></span>
                  <span>•</span>
                  <span>REGIME: CONTINUOUS AUDIT</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C2410C', fontWeight: 800 }}>
                  <ShieldCheck size={14} color="#EA580C" />
                  <span>VERIFIED PROVING GROUND</span>
                </div>
              </div>

              {/* ─── ASYMMETRIC BENTO GRID (EQUAL HEIGHT, 3 STAT CARDS) ─── */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)',
                gap: isMobile ? '16px' : '20px'
              }}>
                {/* Card A: Portfolio Capital Highlight */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '20px',
                  padding: isMobile ? '18px 16px' : '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        PORTFOLIO CAPITAL
                      </span>
                      <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '2px 7px', borderRadius: '4px', fontWeight: 800 }}>
                        UNIVERSAL BASELINE
                      </span>
                    </div>

                    <div style={{ fontSize: isMobile ? '34px' : '44px', fontWeight: 900, color: '#0F172A', letterSpacing: '-1px', lineHeight: 1.1, marginTop: '10px' }}>
                      ${balanceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    <div style={{ fontSize: '13px', color: netPnL >= 0 ? '#C2410C' : '#DC2626', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {netPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span>{netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)} ({netRoi >= 0 ? '+' : ''}{netRoi.toFixed(1)}% vs $1,000 baseline)</span>
                    </div>
                  </div>

                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#64748B',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Equal Baseline Capital:</span>
                    <strong style={{ color: '#0F172A' }}>$1,000.00 USD</strong>
                  </div>
                </div>

          {/* Card B (Asymmetric Amber Capsule): 1K Gold Coins Vault & Continuous Streak */}
          <div 
            onClick={() => {
              setShowCoinVaultModal(true);
              fetchCoinVaultLedger();
            }}
            style={{
              background: 'linear-gradient(145deg, #FFFDF5 0%, #FEF9C3 100%)',
              border: '1.5px solid #FDE047',
              borderRadius: '20px',
              padding: isMobile ? '18px 16px' : '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            title="Click to inspect verified database audit ledger"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  GOLD COINS VAULT
                </span>
                <span style={{ fontSize: '10px', background: '#FEF08A', color: '#713F12', border: '1px solid #FACC15', padding: '2px 7px', borderRadius: '4px', fontWeight: 900 }}>
                  LEDGER ↗
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
                <GoldCoin1K size={isMobile ? 44 : 52} showRings={false} animated={false} />
                <div>
                  <div style={{ fontSize: isMobile ? '30px' : '34px', fontWeight: 900, color: '#713F12', lineHeight: 1 }}>
                    {coins}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#854D0E', marginTop: '2px' }}>
                    Discipline Coins
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {/* Distinct Trade Streak (Badges + Coins) */}
              <div style={{
                background: 'rgba(240, 253, 244, 0.9)',
                border: '1.5px solid #FDBA74',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TradingBadgeIcon theme="trade_streak" size={22} />
                  <div>
                    <div style={{ fontWeight: 900, color: '#9A3412' }}>
                      {tradeStreak}-Day Trade Streak
                    </div>
                    <div style={{ fontSize: '10px', color: '#C2410C', fontWeight: 700 }}>
                      +10 Coins daily • Badge at 1-Week
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 900, background: '#FFEDD5', color: '#7C2D12', padding: '2px 7px', borderRadius: '4px' }}>
                  BADGES
                </span>
              </div>

              {/* Distinct Login Streak (Coins only) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid #FDE047',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={18} color="#EA580C" />
                  <div>
                    <div style={{ fontWeight: 900, color: '#713F12' }}>
                      {loginStreak}-Day Login Streak
                    </div>
                    <div style={{ fontSize: '10px', color: '#854D0E', fontWeight: 700 }}>
                      +10 Coins daily terminal attendance
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 900, background: '#FEF9C3', color: '#854D0E', padding: '2px 7px', borderRadius: '4px' }}>
                  +10 COINS
                </span>
              </div>
            </div>
          </div>

          {/* Card C (Asymmetric Emerald Pod): Discipline Execution Rating DER */}
          <div style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF7ED 100%)',
            border: '1.5px solid #FDBA74',
            borderRadius: '20px',
            padding: isMobile ? '18px 16px' : '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.05)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  DISCIPLINE RATING (DER)
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(240, 253, 244, 0.88)', color: '#C2410C', border: '1px solid #FDBA74', padding: '2px 7px', borderRadius: '4px', fontWeight: 900 }}>
                  TOP 5% PRO
                </span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: isMobile ? '30px' : '34px', fontWeight: 900, color: '#9A3412', lineHeight: 1 }}>
                  {derScore.toFixed(1)} <span style={{ fontSize: '15px', color: '#64748B', fontWeight: 700 }}>/ 100</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#C2410C', marginTop: '4px' }}>
                  Algorithmic Edge Verified
                </div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '10px 14px',
              marginTop: '16px',
              fontSize: '12px',
              color: '#334155',
              fontWeight: 700
            }}>
              Win Rate: <strong style={{ color: '#0F172A' }}>{winRate}%</strong> • {totalTrades} Trades • SL Protected
            </div>
          </div>

          {/* ─── 5-MARKET CATEGORY TRADE DISTRIBUTION & SECTOR EARNINGS DESK ─── */}
          <div style={{
            marginTop: '10px',
            paddingTop: '22px',
            borderTop: '1.5px dashed #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} color="#EA580C" />
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    MARKET SECTOR BENCHMARK & DISCIPLINE
                  </span>
                </div>
                <h3 style={{ fontSize: isMobile ? '17px' : '19px', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
                  Category Trade Distribution & Net Currency Earned
                </h3>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Monitors trades, win rate, SL hits & individual currency earned ($) per sector
              </div>
            </div>

            {/* 5 Sector Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
              gap: '14px'
            }}>
              {[
                {
                  name: 'Forex',
                  icon: Globe,
                  color: '#0284C7',
                  desc: 'EUR/USD, GBP/USD, USD/JPY, FX Pairs',
                  stats: categoryBreakdown.Forex
                },
                {
                  name: 'Crypto',
                  icon: Coins,
                  color: '#F59E0B',
                  desc: 'BTC, ETH, SOL, XRP, Altcoins',
                  stats: categoryBreakdown.Crypto
                },
                {
                  name: 'Commodities',
                  icon: Sparkles,
                  color: '#D97706',
                  desc: 'Gold (XAU), Silver, Crude Oil (WTI)',
                  stats: categoryBreakdown.Commodities
                },
                {
                  name: 'US Market',
                  icon: TrendingUp,
                  color: '#8B5CF6',
                  desc: 'NVDA, AAPL, TSLA, SPY, S&P 500',
                  stats: categoryBreakdown['US Market']
                },
                {
                  name: 'Indian Market',
                  icon: Activity,
                  color: '#EA580C',
                  desc: 'Nifty 50, Bank Nifty, Reliance, TCS',
                  stats: categoryBreakdown['Indian Market']
                }
              ].map(sec => {
                const Icon = sec.icon;
                const st = sec.stats || { trades: 0, wins: 0, slHits: 0, netPnl: 0 };
                const winPct = st.trades > 0 ? Math.round((st.wins / st.trades) * 100) : 0;
                const isPositive = st.netPnl >= 0;

                return (
                  <div
                    key={sec.name}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: `${sec.color}15`,
                            border: `1px solid ${sec.color}35`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: sec.color
                          }}>
                            <Icon size={14} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>
                            {sec.name}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 900,
                          background: '#F1F5F9',
                          color: '#475569',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {st.trades} Trades
                        </span>
                      </div>

                      <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>
                        {sec.desc}
                      </div>
                    </div>

                    {/* Middle: Win Rate & SL hits */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                        <span>Wins: <strong style={{ color: '#0F172A' }}>{st.wins}</strong></span>
                        <span>SL Hits: <strong style={{ color: '#DC2626' }}>{st.slHits}</strong></span>
                      </div>
                      <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${winPct}%`,
                          height: '100%',
                          background: winPct >= 50 ? '#EA580C' : '#94A3B8'
                        }} />
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textAlign: 'right' }}>
                        {winPct}% Win Rate
                      </div>
                    </div>

                    {/* Bottom: Net Currency Earned in Sector */}
                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '8px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                        Net Currency Earned
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 900,
                        color: isPositive ? '#C2410C' : '#DC2626',
                        marginTop: '2px'
                      }}>
                        {isPositive ? '+' : ''}${st.netPnl.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* ─── 2. DETACHED DECAGON TIER PROGRESSION RULER ─── */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1.5px solid rgba(226, 232, 240, 0.85)',
        padding: isMobile ? '16px' : '20px 28px',
        boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '8px', marginBottom: '14px', fontSize: '12px' }}>
          <div style={{ fontWeight: 900, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            DECAGON CAPITAL PROVING HIERARCHY
          </div>
          <div style={{ color: '#64748B' }}>
            Current Target: <strong style={{ color: '#0F172A' }}>{nextRankName} (${nextRankTarget.toLocaleString()})</strong> • Progress: <strong>{rankProgress.toFixed(0)}%</strong>
          </div>
        </div>

        {/* 5 Independent Detached Rounded Cards (Vertical list on Mobile, 5 cols on Desktop) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
          gap: '14px'
        }}>
          {[
            { 
              name: 'Contender', 
              theme: 'decagon_contender',
              target: '$1,000', 
              active: balanceNum < 2000, 
              color: '#EA580C', 
              bg: '#FFFFFF',
              borderColor: '#EA580C',
              glow: '0 8px 24px rgba(234, 88, 12, 0.28)',
              tag: 'Baseline' 
            },
            { 
              name: 'Silver Prover', 
              theme: 'decagon_silver',
              target: '$2,000', 
              active: balanceNum >= 2000 && balanceNum < 4000, 
              color: '#475569', 
              bg: '#F8FAFC',
              borderColor: '#94A3B8',
              glow: '0 8px 24px rgba(148, 163, 184, 0.3)',
              tag: '2x Capital' 
            },
            { 
              name: 'Gold Sovereign', 
              theme: 'decagon_gold',
              target: '$4,000', 
              active: balanceNum >= 4000 && balanceNum < 8000, 
              color: '#EAB308', 
              bg: '#FEFCE8',
              borderColor: '#EAB308',
              glow: '0 8px 26px rgba(234, 179, 8, 0.35)',
              tag: '4x Edge' 
            },
            { 
              name: 'Master Titan', 
              theme: 'decagon_titan',
              target: '$8,000', 
              active: balanceNum >= 8000 && balanceNum < 15000, 
              color: '#EF4444', 
              bg: '#FEF2F2',
              borderColor: '#EF4444',
              glow: '0 8px 28px rgba(239, 68, 68, 0.4)',
              tag: '8x Mastery' 
            },
            { 
              name: 'Apex Operator', 
              theme: 'decagon_apex',
              target: '$15,000', 
              active: balanceNum >= 15000, 
              color: '#A855F7', 
              bg: '#FAF5FF',
              borderColor: '#A855F7',
              glow: '0 8px 32px rgba(168, 85, 247, 0.45)',
              tag: '15x Sovereign' 
            },
          ].map((t) => (
            <div
              key={t.name}
              style={{
                padding: '14px 18px',
                borderRadius: '18px',
                background: t.active ? t.bg : '#FFFFFF',
                border: t.active ? `2.5px solid ${t.borderColor}` : '1.5px solid #E2E8F0',
                boxShadow: t.active ? t.glow : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <TradingBadgeIcon 
                  theme={t.theme} 
                  size={isMobile ? 54 : 64} 
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15.5px', fontWeight: 900, color: t.active ? t.color : '#0F172A' }}>
                      {t.name}
                    </span>
                    {t.active && (
                      <span style={{ 
                        fontSize: '10px', 
                        background: t.color, 
                        color: '#FFFFFF', 
                        padding: '2px 7px', 
                        borderRadius: '6px', 
                        fontWeight: 900,
                        letterSpacing: '0.5px'
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
                    {t.tag}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                {t.target}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. MIDDLE SPLIT OPERATIONAL DESK (DISCIPLINE TASKS DESK VS PLATFORM VOUCHER & RADAR) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.35fr) minmax(0, 1fr)',
        gap: '24px'
      }}>
        {/* Left Column: Dedicated Discipline Tasks Desk (Floating Card) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E2E8F0',
          padding: isMobile ? '18px 16px' : '28px',
          boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#C2410C', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  DEDICATED PROTOCOL DESK
                </span>
                <span style={{
                  fontSize: '9px',
                  background: 'rgba(240, 253, 244, 0.88)',
                  color: '#C2410C',
                  border: '1px solid #FDBA74',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 900
                }}>
                  SEPARATE FROM BADGES
                </span>
              </div>
              <h3 style={{ fontSize: isMobile ? '17px' : '19px', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
                Daily Trading Discipline Quests
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0 0' }}>
                Gold Coins are strictly earned through daily operational discipline, not random badge faucets.
              </p>
            </div>

            <div style={{ textAlign: isMobile ? 'left' : 'right', borderTop: isMobile ? '1px dashed #E2E8F0' : 'none', paddingTop: isMobile ? '8px' : '0' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                {completedTasksCount} of 5 Completed Today
              </div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#C2410C', marginTop: '2px' }}>
                +{earnedTasksCoins} / +90 Coins Earned
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${(completedTasksCount / 5) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #EA580C, #C2410C)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Independent Rounded Task Items (Vertical form on Mobile with NO text overlapping) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {evaluatedDisciplineTasks.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  style={{
                    padding: isMobile ? '14px 16px' : '14px 18px',
                    borderRadius: '16px',
                    border: t.completed ? '1.5px solid #FDBA74' : '1.5px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: isMobile ? '10px' : '14px',
                    background: t.completed ? '#F8FAFC' : '#FFFFFF',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: t.completed ? 'rgba(240, 253, 244, 0.88)' : '#F8FAFC',
                      border: t.completed ? '1.5px solid #FDBA74' : '1.5px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: t.completed ? '#C2410C' : '#64748B',
                      flexShrink: 0
                    }}>
                      <Icon size={18} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          {t.title}
                        </span>
                        {t.completed ? (
                          <span style={{ fontSize: '9px', background: 'rgba(240, 253, 244, 0.88)', color: '#C2410C', border: '1px solid #FDBA74', padding: '1px 6px', borderRadius: '4px', fontWeight: 900 }}>
                            COMPLETED
                          </span>
                        ) : (
                          <span style={{ fontSize: '9px', background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            PENDING
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                        {t.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: isMobile ? 'space-between' : 'flex-end', 
                    gap: '12px',
                    flexShrink: 0,
                    paddingTop: isMobile ? '10px' : '0',
                    borderTop: isMobile ? '1px dashed #E2E8F0' : 'none'
                  }}>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>
                      {t.statusText}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      background: '#FEF9C3',
                      border: '1px solid #FDE047',
                      color: '#854D0E',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      +{t.coins} Coins
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Tasks refresh every 24 hours at 00:00 UTC.
            </span>
            <button
              onClick={async () => {
                if (syncVaultAndStreak) {
                  await syncVaultAndStreak();
                  toast.success('Discipline desk synchronized with database!');
                }
              }}
              style={{
                background: '#0F172A',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} />
              <span>Sync Protocol Tasks</span>
            </button>
          </div>
        </div>

        {/* Right Column: Platform Voucher & Radar Surveillance Desk */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          height: '100%'
        }}>
          {/* 60-Day Free Platform Access Voucher (if active) */}
          {isFreeGraceActive && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #FDBA74',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 8px 30px -5px rgba(234, 88, 12, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#C2410C" />
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
                    60-Day Full Platform Access Voucher
                  </span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 900, background: '#EA580C', color: '#FFFFFF', padding: '3px 9px', borderRadius: '999px' }}>
                  {trialDaysRemaining}D LEFT
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                All edge instruments (Technical Screener, Strategy Lab, Global Macro, Replay Simulator) are 100% unlocked for your account.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                <button
                  onClick={() => navigate('/screener')}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Search size={12} />
                  <span>Screener</span>
                </button>
                <button
                  onClick={() => navigate('/global-markets')}
                  style={{
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 4px 10px rgba(234, 88, 12, 0.25)'
                  }}
                >
                  <Globe size={12} />
                  <span>Global Markets</span>
                </button>
              </div>
            </div>
          )}

          {/* Full-Height Vertical Live Watchlist Surveillance Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            padding: isMobile ? '18px 16px' : '24px',
            boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: isMobile ? 'auto' : (isFreeGraceActive ? '440px' : '560px'),
            position: 'relative'
          }}>
            {/* Header: Title, Live indicator, Arena Ticket link */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#C2410C', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    LIVE WATCHLIST SURVEILLANCE
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(240, 253, 244, 0.88)',
                    color: '#C2410C',
                    border: '1px solid #FDBA74',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '9px',
                    fontWeight: 900
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C', boxShadow: '0 0 6px #EA580C' }} />
                    2.4S TICK ENGINE
                  </span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
                  Live Multi-Asset Radar ({watchlist.length})
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Live price feed, micro-tick flashes, 24h change & direct arena ticket routing.
                </p>
              </div>

              <button
                onClick={() => navigate('/trading')}
                style={{
                  background: 'rgba(234, 88, 12, 0.08)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  color: '#C2410C',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(234, 88, 12, 0.16)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(234, 88, 12, 0.08)'}
              >
                <span>Arena Ticket</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Search & Add Asset Bar */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F8FAFC',
                border: isSearchFocused ? '1.5px solid #EA580C' : '1.5px solid #E2E8F0',
                borderRadius: '12px',
                padding: '0 12px',
                transition: 'border-color 0.2s ease',
                boxShadow: isSearchFocused ? '0 0 0 3px rgba(234, 88, 12, 0.12)' : 'none'
              }}>
                <Search size={15} color="#94A3B8" />
                <input
                  type="text"
                  placeholder="Search ticker or asset to add (e.g. BTC, Gold, NVDA, SOL)..."
                  value={watchlistSearch}
                  onChange={(e) => {
                    setWatchlistSearch(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    padding: '10px 10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
                {watchlistSearch && (
                  <button
                    onClick={() => {
                      setWatchlistSearch('');
                      setIsSearchFocused(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Floating Autocomplete Search Results */}
              {isSearchFocused && watchlistSearch.trim().length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  boxShadow: '0 14px 38px rgba(15, 23, 42, 0.14)',
                  zIndex: 80,
                  maxHeight: '260px',
                  overflowY: 'auto',
                  padding: '6px'
                }}>
                  {filteredCatalogForSearch.length > 0 ? (
                    filteredCatalogForSearch.map(item => (
                      <div
                        key={item.symbol}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          transition: 'background 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 900,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#F1F5F9',
                            color: '#475569',
                            textTransform: 'uppercase'
                          }}>
                            {item.category}
                          </span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              {item.symbol}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {item.name}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                              {item.prefix || '$'}{Number(item.price).toLocaleString('en-US', { minimumFractionDigits: item.digits ?? 2, maximumFractionDigits: item.digits ?? 2 })}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: item.change >= 0 ? '#9A3412' : '#DC2626'
                            }}>
                              {item.change >= 0 ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSymbolToWatchlist(item.symbol);
                            }}
                            style={{
                              background: '#EA580C',
                              border: 'none',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                            }}
                          >
                            <Plus size={13} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
                      No unmonitored assets found matching &quot;<strong>{watchlistSearch}</strong>&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Vertical Watchlist List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              flex: 1
            }}>
              {watchlist.length > 0 ? (
                (showAllWatchlist ? watchlist : watchlist.slice(0, 5)).map(sym => {
                  const meta = getWatchlistMeta(sym);
                  const isPositive = meta.change >= 0;
                  const flashBg = meta.flash === 'up' 
                    ? 'rgba(240, 253, 244, 0.95)' 
                    : meta.flash === 'down' 
                      ? 'rgba(254, 242, 242, 0.95)' 
                      : '#FFFFFF';
                  const flashBorder = meta.flash === 'up'
                    ? '#FDBA74'
                    : meta.flash === 'down'
                      ? '#FCA5A5'
                      : '#E2E8F0';

                  return (
                    <div
                      key={sym}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '16px',
                        border: `1.5px solid ${flashBorder}`,
                        background: flashBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                      }}
                    >
                      {/* Left: Ticker & Category */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: isMobile ? 'auto' : '120px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
                              {sym}
                            </span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: '#F1F5F9',
                              color: '#64748B',
                              textTransform: 'uppercase'
                            }}>
                              {meta.category}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                            {meta.name}
                          </div>
                        </div>
                      </div>

                      {/* Center: Live Price & 24h Change */}
                      <div style={{ textAlign: 'right', flex: 1, paddingRight: '8px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 900,
                          color: '#0F172A',
                          fontVariantNumeric: 'tabular-nums'
                        }}>
                          {meta.prefix || '$'}{Number(meta.price).toLocaleString('en-US', {
                            minimumFractionDigits: meta.digits ?? 2,
                            maximumFractionDigits: meta.digits ?? 2
                          })}
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: isPositive ? '#9A3412' : '#DC2626'
                        }}>
                          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          <span>{isPositive ? `+${meta.change.toFixed(2)}%` : `${meta.change.toFixed(2)}%`}</span>
                        </div>
                      </div>

                      {/* Right: Actions (Trade & Remove) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => {
                            localStorage.setItem('stocksoperator_active_symbol', sym);
                            navigate(`/trading?symbol=${sym}`);
                          }}
                          title={`Launch trade ticket for ${sym}`}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            color: '#0F172A',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#0F172A';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F8FAFC';
                            e.currentTarget.style.color = '#0F172A';
                          }}
                        >
                          <Zap size={12} color="#EA580C" />
                          <span>Trade</span>
                        </button>

                        <button
                          onClick={() => removeFromWatchlist(sym)}
                          title={`Remove ${sym} from watchlist`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1.5px dashed #CBD5E1'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                    No instruments in your watchlist
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                    Use the search bar above or click a popular ticker below:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                    {['BTCUSDT', 'ETHUSDT', 'XAUUSD', 'EURUSD', 'NVDA', 'AAPL'].map(quickSym => (
                      <button
                        key={quickSym}
                        onClick={() => handleAddSymbolToWatchlist(quickSym)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#0F172A',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={11} color="#C2410C" />
                        <span>{quickSym}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Show More & Show Less Toggle */}
            {watchlist.length > 5 && (
              <button
                onClick={() => setShowAllWatchlist(prev => !prev)}
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '10px 14px',
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '12px',
                  color: '#0F172A',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
              >
                {showAllWatchlist ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp size={14} color="#C2410C" />
                  </>
                ) : (
                  <>
                    <span>Show More (+{watchlist.length - 5} More Assets)</span>
                    <ChevronDown size={14} color="#C2410C" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── 4. INSTITUTIONAL BADGES VAULT (52 BADGES • 15 PROTOCOL BOUNTIES VS 37 HONOR INSIGNIAS) ─── */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1.5px solid rgba(226, 232, 240, 0.85)',
        padding: isMobile ? '20px 14px' : '32px',
        boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Badges Header & Rationale */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="#C2410C" />
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Institutional Badges Vault ({totalUnlockedCount} / 52 Unlocked)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Pure mathematical track record proofs. Decoupled from generic coin faucets: only <strong>15 elite milestones</strong> distribute rare protocol bounties; <strong>37 badges</strong> represent pure honor insignias.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: isMobile ? '100%' : '240px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input 
              type="text"
              placeholder="Search 52 badges..."
              value={badgeSearch}
              onChange={(e) => setBadgeSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                fontSize: '13px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          {[
            { id: 'all', label: `ALL (52)` },
            { id: 'bounties', label: `PROTOCOL BOUNTIES (15)` },
            { id: 'honor', label: `HONOR INSIGNIA (37)` },
            { id: 'unlocked', label: `UNLOCKED (${totalUnlockedCount})` },
            { id: 'locked', label: `LOCKED (${52 - totalUnlockedCount})` },
            { id: 'tier1', label: `TIER 1: STARTER (10)` },
            { id: 'tier2', label: `TIER 2: INTERMEDIATE (20)` },
            { id: 'tier3', label: `TIER 3: ELITE (22)` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setBadgeFilter(f.id)}
              style={{
                background: badgeFilter === f.id ? '#0F172A' : '#F8FAFC',
                color: badgeFilter === f.id ? '#FFFFFF' : '#475569',
                border: badgeFilter === f.id ? '1px solid #0F172A' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Badges Grid with Unique Modern Insignias */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {visibleBadges.map(b => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBadge(b)}
                style={{
                  background: b.unlocked ? '#FFFFFF' : '#FAFBFC',
                  border: b.unlocked 
                    ? '2px solid #EA580C' 
                    : (b.hasBounty ? '1.5px solid #FDE047' : '1.5px solid #E2E8F0'),
                  borderRadius: '18px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  opacity: b.unlocked ? 1 : 0.88,
                  boxShadow: b.unlocked 
                    ? '0 6px 20px rgba(234, 88, 12, 0.12)' 
                    : '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = b.unlocked ? '#C2410C' : '#EA580C';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = b.unlocked 
                    ? '#EA580C' 
                    : (b.hasBounty ? '#FDE047' : '#E2E8F0');
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Top Badge Status Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Unique Bespoke Trading Insignia */}
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      <TradingBadgeIcon 
                        theme={b.theme || 'bull_candle'} 
                        size={38} 
                        unlocked={b.unlocked} 
                        hasBounty={b.hasBounty} 
                      />
                      {b.hasBounty && (
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          background: '#B45309',
                          color: '#FEF9C3',
                          border: '1px solid #FDE047',
                          borderRadius: '999px',
                          padding: '0 4px',
                          fontSize: '8px',
                          fontWeight: 900,
                          lineHeight: '12px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          1K
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>
                      #{b.id}
                    </span>
                  </div>

                  {b.hasBounty ? (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      background: '#FEF9C3',
                      border: '1px solid #FDE047',
                      color: '#854D0E',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Coins size={12} color="#D97706" />
                      <span>+{b.coins} Coins</span>
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#64748B',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <ShieldCheck size={12} color="#64748B" />
                      <span>Honor (0 Coins)</span>
                    </span>
                  )}
                </div>

                {/* Badge Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                      {b.name}
                    </h4>
                    {b.unlocked && (
                      <CheckCircle2 size={15} color="#C2410C" />
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                    {b.tagline}
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                    <span>{b.progressText}</span>
                    <span style={{ fontWeight: 800, color: b.unlocked ? '#C2410C' : '#64748B' }}>
                      {b.unlocked ? 'UNLOCKED' : `${b.progressPct}%`}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${b.progressPct}%`,
                      height: '100%',
                      background: b.unlocked ? '#C2410C' : '#94A3B8'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More / Show Less Toggle Button */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setShowAllBadges(prev => !prev)}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '999px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#0F172A',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#EA580C'; e.currentTarget.style.color = '#C2410C'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
          >
            <span>{showAllBadges ? 'Show Curated View (Top 6)' : `Show All Badges (${filteredBadges.length})`}</span>
            {showAllBadges ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ─── 5. LOWER PROVING LEDGER: BROKER MIRROR & REAL LEADERBOARD (DETACHED FLOATING CARDS) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '20px'
      }}>
        {/* Left Card: Broker Mirror & Real Account Sync */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E2E8F0',
          padding: isMobile ? '20px 16px' : '28px',
          boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                BROKER MIRROR PROTOCOL
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '3px 0 0 0' }}>
                Real Account Equity Sync
              </h3>
            </div>
            {brokerMirror?.connectedBroker ? (
              <button
                onClick={handleToggleMirror}
                style={{
                  background: brokerMirror.isActive ? 'rgba(240, 253, 244, 0.88)' : '#FFFBEB',
                  border: '1.5px solid #FDBA74',
                  color: '#C2410C',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {brokerMirror.isActive ? 'Active Syncing' : 'Paused'}
              </button>
            ) : (
              <button
                onClick={() => setShowBrokerModal(true)}
                style={{
                  background: '#C2410C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(194, 65, 12, 0.25)',
                  alignSelf: isMobile ? 'flex-start' : 'auto'
                }}
              >
                <span>Connect Broker</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
            Connect interactive brokers (IBKR, Binance, MT5) to mirror real capital executions proportionally against the $1,000 baseline.
          </p>

          <div style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '16px',
            padding: '16px 20px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: '#0F172A' }}>
                {brokerMirror?.connectedBroker ? `Connected: ${brokerMirror.connectedBroker}` : 'No Broker Connected'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {brokerMirror?.connectedBroker ? '1:1 Proportional Risk Replicator' : 'Non-custodial API key verification'}
              </div>
            </div>
            <button
              onClick={() => setShowBrokerModal(true)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                alignSelf: isMobile ? 'flex-start' : 'auto'
              }}
            >
              Configure
            </button>
          </div>
        </div>

        {/* Right Card: Real Verified Provers Leaderboard */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E2E8F0',
          padding: isMobile ? '20px 16px' : '28px',
          boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minWidth: 0
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                GLOBAL VERIFIED RANKINGS
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '3px 0 0 0' }}>
                Global Proving Leaderboard
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 800 }}>
              0 Demos • 0 Fakes
            </span>
          </div>

          {/* Table with Rounded Shell & Horizontal Scroll on Mobile */}
          <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: isMobile ? '460px' : '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <tr>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#64748B' }}>Rank</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#64748B' }}>Trader</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#64748B' }}>DER Rating</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#64748B' }}>Verified Equity</th>
                </tr>
              </thead>
              <tbody>
                {realLeaderboard.slice(0, 4).map((trader, i) => (
                  <tr key={trader.rank || i} style={{ borderBottom: '1px solid #F1F5F9', background: trader.isSelf ? '#FFF7ED' : '#FFFFFF' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 900, color: '#0F172A' }}>
                      #{trader.rank || (i + 1)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{trader.name}</span>
                        {trader.isSelf && (
                          <span style={{ fontSize: '8px', background: '#EA580C', color: '#FFFFFF', padding: '2px 5px', borderRadius: '3px', fontWeight: 900 }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: '3px' }}>
                        <DecagonTagBadge tier={trader.tag || 'Contender'} size="sm" />
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: '#C2410C' }}>
                      {trader.der ? Number(trader.der).toFixed(1) : '88.0'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: '#0F172A' }}>
                      ${Number(trader.balance || 1000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── 6. ACCOUNT SECURITY & DEVICE DATA (DANGER ZONE / DELETE ACCOUNT) ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E2E8F0',
        padding: isMobile ? '20px 16px' : '24px 28px',
        boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              ACCOUNT & DEVICE SECURITY
            </span>
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '4px 0 2px 0' }}>
            Device Session & Permanent Removal
          </h4>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4, maxWidth: '600px' }}>
            Need to delete this account from your device? Wipes all saved sessions, cached charts, and local keys permanently while keeping your records archived in the database.
          </p>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            background: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            color: '#DC2626',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center'
          }}
        >
          <Trash2 size={16} />
          <span>Delete Account</span>
        </button>
      </div>
      </>
      )}

      {/* ─── BADGE DETAILS MODAL ─── */}
      {selectedBadge && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3500,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '460px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <button
              onClick={() => setSelectedBadge(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                color: '#64748B',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <TradingBadgeIcon 
                theme={selectedBadge.theme || 'bull_candle'} 
                size={76} 
                unlocked={selectedBadge.unlocked} 
                hasBounty={selectedBadge.hasBounty} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                Badge #{selectedBadge.id} • Tier {selectedBadge.tier}
              </span>
              {selectedBadge.unlocked ? (
                <span style={{ fontSize: '10px', background: 'rgba(240, 253, 244, 0.88)', color: '#C2410C', padding: '1px 6px', borderRadius: '3px', fontWeight: 900 }}>
                  VERIFIED UNLOCKED
                </span>
              ) : (
                <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#64748B', padding: '1px 6px', borderRadius: '3px', fontWeight: 800 }}>
                  LOCKED
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
              {selectedBadge.name}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
              {selectedBadge.desc}
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                <span>CRITERIA REQUIREMENT</span>
                <span>{selectedBadge.progressText}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                {selectedBadge.tagline}
              </div>
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${selectedBadge.progressPct}%`,
                  height: '100%',
                  background: selectedBadge.unlocked ? '#EA580C' : '#94A3B8'
                }} />
              </div>
            </div>

            {/* Protocol Bounty Note */}
            <div style={{
              background: selectedBadge.hasBounty ? '#FEF9C3' : '#F1F5F9',
              border: selectedBadge.hasBounty ? '1px solid #FDE047' : '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '12px',
              color: selectedBadge.hasBounty ? '#854D0E' : '#475569',
              marginBottom: '20px'
            }}>
              {selectedBadge.hasBounty ? (
                <div>
                  <strong>Rare Protocol Bounty:</strong> Unlocking this elite milestone awards <strong>+{selectedBadge.coins} Gold Coins</strong> to your vault.
                </div>
              ) : (
                <div>
                  <strong>Honor Insignia:</strong> This badge is a pure mathematical mark of honor and track record proof. It does not distribute Gold Coins, keeping the discipline economy strictly preserved.
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              style={{
                width: '100%',
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}

      {/* ─── GOLD COINS VAULT & AUDIT LEDGER MODAL ─── */}
      {showCoinVaultModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3500,
          padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: '12px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: '#FEF9C3',
                  border: '1.5px solid #FDE047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Coins size={20} color="#D97706" />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Gold Coins Vault & Audit Ledger
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={12} color="#C2410C" />
                    <span>Cryptographically verified PostgreSQL transaction record</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCoinVaultModal(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Vault Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{
                  background: '#FFFDF5',
                  border: '1.5px solid #FACC15',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      CURRENT BALANCE
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#713F12', marginTop: '2px' }}>
                      {coinVaultData?.goldCoins ?? coins} <span style={{ fontSize: '13px', fontWeight: 700 }}>Coins</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#A16207', marginTop: '2px' }}>
                      Universal Sovereign Currency
                    </div>
                  </div>
                  <GoldCoin1K size={48} showRings={false} animated={false} />
                </div>

                <div style={{
                  background: '#FFF7ED',
                  border: '1.5px solid #FDBA74',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    VERIFIED STREAKS
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#7C2D12' }}>
                      <TradingBadgeIcon theme="trade_streak" size={18} />
                      <span>Trade Streak:</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#C2410C' }}>
                      {coinVaultData?.tradeStreak ?? tradeStreak} Days (+10 Coins & Badges)
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#713F12' }}>
                      <Flame size={16} color="#EA580C" />
                      <span>Login Streak:</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#854D0E' }}>
                      {coinVaultData?.loginStreak ?? loginStreak} Days (+10 Coins)
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Audit Ledger (Recent Transactions)
                  </div>
                  <button
                    onClick={fetchCoinVaultLedger}
                    disabled={coinVaultLoading}
                    style={{
                      background: 'none',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <RefreshCw size={11} className={coinVaultLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {coinVaultLoading && !coinVaultData ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>
                    Loading verified ledger from database...
                  </div>
                ) : (coinVaultData?.transactions?.length || 0) === 0 ? (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px dashed #CBD5E1',
                    color: '#64748B',
                    fontSize: '13px'
                  }}>
                    No transactions recorded yet. Keep trading or log in daily to earn coins!
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    maxHeight: '260px',
                    overflowY: 'auto'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <tr>
                          <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569' }}>Date</th>
                          <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569' }}>Description</th>
                          <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coinVaultData.transactions.map((tx, idx) => {
                          const isPositive = Number(tx.amount) > 0;
                          const formattedDate = tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Recent';

                          return (
                            <tr key={tx.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '8px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                                {formattedDate}
                              </td>
                              <td style={{ padding: '8px 12px', color: '#0F172A', fontWeight: 600 }}>
                                <div>{tx.description || tx.reason}</div>
                                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{tx.reason}</div>
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: isPositive ? '#C2410C' : '#DC2626' }}>
                                {isPositive ? `+${tx.amount}` : tx.amount} Coins
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Streak bonus increments strictly once per calendar day
              </div>
              <button
                onClick={() => setShowCoinVaultModal(false)}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BROKER MIRROR MODAL ─── */}
      <BrokerMirrorModal
        isOpen={showBrokerModal}
        onClose={() => setShowBrokerModal(false)}
        onSyncSuccess={fetchBrokerMirror}
        currentBroker={brokerMirror?.connectedBroker}
        isActive={brokerMirror?.isActive}
      />

      {/* ─── DELETE ACCOUNT MODAL ─── */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
