import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTrading } from '../contexts/TradingContext';
import { apiClient } from '../services/api';
import { 
  Trophy, Medal, Star, Zap, ArrowRight, ShieldCheck, 
  Lock, Unlock, Target, Coins, Activity, TrendingUp, TrendingDown,
  Search, Plus, X, Crown, Sparkles, Sliders, ExternalLink,
  Flame, CheckCircle2, AlertCircle, BarChart2, Camera, Image,
  Bot, FlaskConical, Clock, ShieldAlert, Award, Globe, ArrowUpRight,
  ChevronRight, Filter, Info, Eye, ChevronDown, ChevronUp, Layers, Check,
  Server, Play, Pause, RefreshCw, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import BrokerMirrorModal from '../components/BrokerMirrorModal';
import GoldCoin1K from '../components/GoldCoin1K';
import { BADGES_CATALOG, DISCIPLINE_TASKS } from '../data/badgesData';

// Available assets for the Watchlist search dropdown
const WATCHLIST_DATABASE = [
  { symbol: 'BTCUSDT', name: 'Bitcoin / USDT', category: 'Crypto', price: '$86,280.00', change: '+2.45%' },
  { symbol: 'ETHUSDT', name: 'Ethereum / USDT', category: 'Crypto', price: '$3,420.50', change: '+1.80%' },
  { symbol: 'SOLUSDT', name: 'Solana / USDT', category: 'Crypto', price: '$158.20', change: '+4.12%' },
  { symbol: 'XAUUSD', name: 'Gold Spot / USD', category: 'Commodities', price: '$2,518.40', change: '+0.74%' },
  { symbol: 'WTIUSD', name: 'Crude Oil WTI', category: 'Commodities', price: '$78.50', change: '-0.65%' },
  { symbol: 'XAGUSD', name: 'Silver Spot / USD', category: 'Commodities', price: '$29.40', change: '+1.15%' },
  { symbol: 'EURUSD', name: 'EUR / USD Forex', category: 'Forex', price: '1.0848', change: '+0.22%' },
  { symbol: 'GBPUSD', name: 'GBP / USD Forex', category: 'Forex', price: '1.3032', change: '-0.12%' },
  { symbol: 'USDJPY', name: 'USD / JPY Forex', category: 'Forex', price: '148.82', change: '+0.36%' },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Equities', price: '$226.40', change: '+0.85%' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Equities', price: '$124.50', change: '+3.10%' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Equities', price: '$248.60', change: '-1.40%' },
  { symbol: 'SPY', name: 'S&P 500 ETF Trust', category: 'Equities', price: '$572.30', change: '+0.45%' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    balance = 1000, coins = 100, streakDays = 1, positions = [], history = [], badge, closePosition,
    watchlist = [], addToWatchlist, removeFromWatchlist,
    unlockedTools = {}, unlockTool,
    isFreeGraceActive = true, trialDaysRemaining = 60,
    syncVaultAndStreak
  } = useTrading();

  // Gold Coins Vault & Audit Ledger Modal state
  const [showCoinVaultModal, setShowCoinVaultModal] = useState(false);
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
    const hasSeen = sessionStorage.getItem('nonstock_seen_welcome_splash');
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
          sessionStorage.setItem('nonstock_seen_welcome_splash', 'true');
          setShowWelcomeSplash(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showWelcomeSplash]);

  const dismissWelcome = () => {
    sessionStorage.setItem('nonstock_seen_welcome_splash', 'true');
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
    return typeof window !== 'undefined' ? localStorage.getItem('nonstock_user_avatar') || '' : '';
  });
  const [bannerUrl, setBannerUrl] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('nonstock_user_banner') || '' : '';
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
        localStorage.setItem('nonstock_user_avatar', b64);
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
        localStorage.setItem('nonstock_user_banner', b64);
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

  // Evaluate All 52 Badges
  const evaluatedBadges = useMemo(() => {
    const stateContext = {
      balance: balanceNum,
      history,
      positions,
      coins,
      streakDays,
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
  }, [balanceNum, history, positions, coins, streakDays, watchlist, avatarUrl]);

  const totalUnlockedCount = useMemo(() => {
    return evaluatedBadges.filter(b => b.unlocked).length;
  }, [evaluatedBadges]);

  // Evaluate the 5 Dedicated Discipline Tasks Desk (Completely separate from badges)
  const evaluatedDisciplineTasks = useMemo(() => {
    const taskContext = {
      streakDays,
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
  }, [streakDays, watchlist, positions, history, coins]);

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
              der: 88.0,
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
            der: 88.0,
            balance: balanceNum,
            isSelf: true
          }
        ]);
      });
  }, [userName, balanceNum, dynamicTierName, dynamicTierColor]);

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
            border: '2px solid #10B981',
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
              background: '#ECFDF5',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)'
            }}>
              <ShieldCheck size={36} color="#059669" />
            </div>

            <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '1px', textTransform: 'uppercase' }}>
              NONSTOCK VERIFIED PROTOCOL
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
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>$1,000.00 Equal</div>
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
                background: 'linear-gradient(135deg, #10B981, #059669)',
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
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <span>Enter Execution Desk ({welcomeSeconds}s)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── 1. TOP ASYMMETRIC BENTO EXECUTIVE MASTHEAD & HERO DOSSIER ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E2E8F0',
        padding: '24px 28px',
        boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Upper Technical Meta Ribbon */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid #F1F5F9',
          marginBottom: '20px',
          fontSize: '11px',
          color: '#64748B',
          fontWeight: 700,
          letterSpacing: '0.6px',
          textTransform: 'uppercase'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: '#0F172A', fontWeight: 900 }}>NONSTOCK PROTOCOL</span>
            <span>•</span>
            <span>ACCOUNT: NS-{user?.id?.substring(0, 8) || 'c141ad16'}</span>
            <span>•</span>
            <span>UNIVERSAL BASELINE: <strong style={{ color: '#059669' }}>$1,000.00</strong></span>
            <span>•</span>
            <span>REGIME: CONTINUOUS AUDIT</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => bannerInputRef.current?.click()}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Image size={13} />
              <span>CUSTOM BANNER</span>
            </button>

            <button
              onClick={() => navigate('/trading')}
              style={{
                background: '#0F172A',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
              }}
            >
              <Zap size={13} color="#10B981" />
              <span>ENTER ARENA</span>
            </button>
          </div>
        </div>

        {/* ─── ASYMMETRIC BENTO GRID (UNEVEN HIGHLIGHTS & BOLD TYPOGRAPHY) ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr) minmax(0, 1fr)',
          gap: '20px'
        }}>
          {/* Card A (Expansive Hero Card): Trader Identity & Portfolio Equity */}
          <div style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
            border: '1.5px solid #E2E8F0',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}>
            {/* Identity Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    position: 'relative',
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: '#FFFFFF',
                    border: '2px solid #10B981',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}
                  title="Click to update avatar"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#10B981' }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    padding: '2px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Camera size={10} color="#FFFFFF" />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>
                      {userName}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      letterSpacing: '0.8px',
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1.5px solid #A7F3D0',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      textTransform: 'uppercase'
                    }}>
                      {dynamicTierName}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Disciplined Prover</span>
                    <span>•</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Pro Member</span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: '#ECFDF5',
                fontSize: '10px',
                fontWeight: 800,
                color: '#047857'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>LIVE FEED AUDIT</span>
              </div>
            </div>

            {/* Massive Bold Equity Highlight */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                PORTFOLIO CAPITAL
              </div>
              <div style={{ fontSize: '46px', fontWeight: 900, color: '#0F172A', letterSpacing: '-1.5px', lineHeight: 1.1, marginTop: '4px' }}>
                ${balanceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '13px', color: netPnL >= 0 ? '#059669' : '#DC2626', fontWeight: 800, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {netPnL >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                <span>{netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)} ({netRoi >= 0 ? '+' : ''}{netRoi.toFixed(1)}% vs $1,000 baseline)</span>
              </div>
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
              padding: '24px',
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
                <GoldCoin1K size={52} showRings={false} animated={false} />
                <div>
                  <div style={{ fontSize: '34px', fontWeight: 900, color: '#713F12', lineHeight: 1 }}>
                    {coins}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#854D0E', marginTop: '2px' }}>
                    Discipline Coins
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid #FACC15',
              borderRadius: '12px',
              padding: '10px 14px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 800,
              color: '#92400E'
            }}>
              <Flame size={16} color="#EA580C" />
              <span>{streakDays}-Day Streak (+25 daily coins)</span>
            </div>
          </div>

          {/* Card C (Asymmetric Emerald Pod): Discipline Execution Rating DER */}
          <div style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F0FDF4 100%)',
            border: '1.5px solid #BBF7D0',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.05)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  DISCIPLINE RATING (DER)
                </span>
                <span style={{ fontSize: '10px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: '4px', fontWeight: 900 }}>
                  TOP 5% PRO
                </span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '34px', fontWeight: 900, color: '#047857', lineHeight: 1 }}>
                  88.0 <span style={{ fontSize: '15px', color: '#64748B', fontWeight: 700 }}>/ 100</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
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
        </div>
      </div>

      {/* ─── 2. DETACHED DECAGON TIER PROGRESSION RULER ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E2E8F0',
        padding: '20px 28px',
        boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '12px' }}>
          <div style={{ fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            DECAGON CAPITAL PROVING HIERARCHY
          </div>
          <div style={{ color: '#64748B' }}>
            Current Target: <strong style={{ color: '#0F172A' }}>{nextRankName} (${nextRankTarget.toLocaleString()})</strong> • Progress: <strong>{rankProgress.toFixed(0)}%</strong>
          </div>
        </div>

        {/* 5 Independent Detached Rounded Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px'
        }}>
          {[
            { name: 'Contender', target: '$1,000', active: balanceNum < 2000, color: '#059669', tag: 'Baseline' },
            { name: 'Silver Prover', target: '$2,000', active: balanceNum >= 2000 && balanceNum < 4000, color: '#64748B', tag: '2x Capital' },
            { name: 'Gold Sovereign', target: '$4,000', active: balanceNum >= 4000 && balanceNum < 8000, color: '#EAB308', tag: '4x Edge' },
            { name: 'Master Titan', target: '$8,000', active: balanceNum >= 8000 && balanceNum < 15000, color: '#E11D48', tag: '8x Mastery' },
            { name: 'Apex Operator', target: '$15,000', active: balanceNum >= 15000, color: '#A855F7', tag: '15x Sovereign' },
          ].map((t) => (
            <div
              key={t.name}
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                background: t.active ? '#ECFDF5' : '#F8FAFC',
                border: t.active ? '2px solid #10B981' : '1.5px solid #E2E8F0',
                boxShadow: t.active ? '0 4px 16px rgba(16, 185, 129, 0.15)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: t.active ? '#059669' : '#475569' }}>
                  {t.name}
                </span>
                {t.active && (
                  <span style={{ fontSize: '9px', background: '#10B981', color: '#FFFFFF', padding: '2px 5px', borderRadius: '4px', fontWeight: 900 }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>
                {t.target}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                {t.tag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. MIDDLE SPLIT OPERATIONAL DESK (DISCIPLINE TASKS DESK VS PLATFORM VOUCHER & RADAR) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
        gap: '24px'
      }}>
        {/* Left Column: Dedicated Discipline Tasks Desk (Floating Card) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E2E8F0',
          padding: '28px',
          boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  DEDICATED PROTOCOL DESK
                </span>
                <span style={{
                  fontSize: '9px',
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 900
                }}>
                  SEPARATE FROM BADGES
                </span>
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
                Daily Trading Discipline Quests
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0 0' }}>
                Gold Coins are strictly earned through daily operational discipline, not random badge faucets.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                {completedTasksCount} of 5 Completed Today
              </div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                +{earnedTasksCoins} / +90 Coins Earned
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${(completedTasksCount / 5) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10B981, #059669)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Independent Rounded Task Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {evaluatedDisciplineTasks.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: t.completed ? '1.5px solid #BBF7D0' : '1.5px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    background: t.completed ? '#F8FAFC' : '#FFFFFF',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: t.completed ? '#ECFDF5' : '#F8FAFC',
                      border: t.completed ? '1.5px solid #A7F3D0' : '1.5px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: t.completed ? '#059669' : '#64748B',
                      flexShrink: 0
                    }}>
                      <Icon size={18} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          {t.title}
                        </span>
                        {t.completed ? (
                          <span style={{ fontSize: '9px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '1px 6px', borderRadius: '4px', fontWeight: 900 }}>
                            COMPLETED
                          </span>
                        ) : (
                          <span style={{ fontSize: '9px', background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            PENDING
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
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

        {/* Right Column: Platform Voucher & Radar Overview (Detached Floating Cards) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* 60-Day Free Platform Access Voucher */}
          {isFreeGraceActive && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #A7F3D0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 8px 30px -5px rgba(16, 185, 129, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#059669" />
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                    60-Day Full Platform Access Voucher
                  </span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 900, background: '#10B981', color: '#FFFFFF', padding: '3px 9px', borderRadius: '999px' }}>
                  {trialDaysRemaining}D LEFT
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                All edge instruments (Technical Screener, Strategy Lab, Global Macro, Replay Simulator) are 100% unlocked for every account holder for 2 months.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => navigate('/screener')}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Search size={13} />
                  <span>Screener</span>
                </button>
                <button
                  onClick={() => navigate('/global-markets')}
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Globe size={13} />
                  <span>Global Markets</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Watchlist Terminal */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            padding: '22px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                LIVE WATCHLIST SURVEILLANCE ({watchlist.length})
              </div>
              <button
                onClick={() => navigate('/trading')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Arena Ticket</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {watchlist.map(sym => (
                <div
                  key={sym}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#0F172A'
                  }}
                >
                  <span>{sym}</span>
                  <X 
                    size={13} 
                    color="#94A3B8" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeFromWatchlist(sym)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. INSTITUTIONAL BADGES VAULT (52 BADGES • 15 PROTOCOL BOUNTIES VS 37 HONOR INSIGNIAS) ─── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E2E8F0',
        padding: '32px',
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
              <Trophy size={20} color="#059669" />
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Institutional Badges Vault ({totalUnlockedCount} / 52 Unlocked)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Pure mathematical track record proofs. Decoupled from generic coin faucets: only <strong>15 elite milestones</strong> distribute rare protocol bounties; <strong>37 badges</strong> represent pure honor insignias.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '240px' }}>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                    ? '2px solid #10B981' 
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
                    ? '0 6px 20px rgba(16, 185, 129, 0.12)' 
                    : '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = b.unlocked ? '#059669' : '#10B981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = b.unlocked 
                    ? '#10B981' 
                    : (b.hasBounty ? '#FDE047' : '#E2E8F0');
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Top Badge Status Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Unique Insignia Container */}
                    <div style={{
                      position: 'relative',
                      width: '36px',
                      height: '36px',
                      borderRadius: b.hasBounty ? '10px' : '10px',
                      background: b.hasBounty 
                        ? 'linear-gradient(135deg, #FEF9C3 0%, #FDE047 60%, #D97706 100%)'
                        : (b.unlocked ? '#ECFDF5' : '#F1F5F9'),
                      border: b.hasBounty 
                        ? '1.5px solid #F59E0B'
                        : (b.unlocked ? '1.5px solid #10B981' : '1.5px solid #CBD5E1'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: b.hasBounty ? '#78350F' : (b.unlocked ? b.color || '#059669' : '#94A3B8'),
                      boxShadow: b.hasBounty ? '0 2px 8px rgba(217, 119, 6, 0.3)' : 'none'
                    }}>
                      <Icon size={18} />
                      {b.hasBounty && (
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          background: '#B45309',
                          color: '#FEF9C3',
                          border: '1px solid #FDE047',
                          borderRadius: '999px',
                          padding: '0 3px',
                          fontSize: '7px',
                          fontWeight: 900
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
                      <CheckCircle2 size={15} color="#059669" />
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
                    <span style={{ fontWeight: 800, color: b.unlocked ? '#059669' : '#64748B' }}>
                      {b.unlocked ? 'UNLOCKED' : `${b.progressPct}%`}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${b.progressPct}%`,
                      height: '100%',
                      background: b.unlocked ? '#059669' : '#94A3B8'
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
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#059669'; }}
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
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '24px'
      }}>
        {/* Left Card: Broker Mirror & Real Account Sync */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E2E8F0',
          padding: '28px',
          boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
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
                  background: brokerMirror.isActive ? '#ECFDF5' : '#FFFBEB',
                  border: '1.5px solid #A7F3D0',
                  color: '#059669',
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
                  background: '#059669',
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
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
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
            alignItems: 'center'
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
                cursor: 'pointer'
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
          padding: '28px',
          boxShadow: '0 8px 30px -5px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                GLOBAL VERIFIED RANKINGS
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '3px 0 0 0' }}>
                NonStock Proving Leaderboard
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 800 }}>
              0 Demos • 0 Fakes
            </span>
          </div>

          {/* Table with Rounded Shell */}
          <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
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
                  <tr key={trader.rank || i} style={{ borderBottom: '1px solid #F1F5F9', background: trader.isSelf ? '#F0FDF4' : '#FFFFFF' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 900, color: '#0F172A' }}>
                      #{trader.rank || (i + 1)}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{trader.name}</span>
                        {trader.isSelf && (
                          <span style={{ fontSize: '8px', background: '#10B981', color: '#FFFFFF', padding: '2px 5px', borderRadius: '3px', fontWeight: 900 }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                        {trader.tag || 'Contender'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: '#059669' }}>
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
            borderRadius: '12px',
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
              width: '54px',
              height: '54px',
              borderRadius: '8px',
              background: selectedBadge.unlocked ? '#ECFDF5' : '#F1F5F9',
              border: `1.5px solid ${selectedBadge.unlocked ? '#10B981' : '#CBD5E1'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selectedBadge.unlocked ? selectedBadge.color : '#94A3B8',
              marginBottom: '16px'
            }}>
              {React.createElement(selectedBadge.icon, { size: 28 })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                Badge #{selectedBadge.id} • Tier {selectedBadge.tier}
              </span>
              {selectedBadge.unlocked ? (
                <span style={{ fontSize: '10px', background: '#ECFDF5', color: '#059669', padding: '1px 6px', borderRadius: '3px', fontWeight: 900 }}>
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
                  background: selectedBadge.unlocked ? '#10B981' : '#94A3B8'
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
                    <ShieldCheck size={12} color="#059669" />
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
                  background: '#F0FDF4',
                  border: '1.5px solid #A7F3D0',
                  borderRadius: '8px',
                  padding: '14px 16px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    DISCIPLINE STREAK
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#065F46', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={22} color="#EA580C" />
                    <span>{coinVaultData?.loginStreak ?? streakDays} <span style={{ fontSize: '13px', fontWeight: 700 }}>Days</span></span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>
                    +25 Coins granted every consecutive day
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
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: isPositive ? '#059669' : '#DC2626' }}>
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
    </div>
  );
}
