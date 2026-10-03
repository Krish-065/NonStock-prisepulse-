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
  ChevronRight, Filter, Info, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

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

// 52 BADGES SYSTEM DEFINITION
const BADGES_CATALOG = [
  // ─── TIER 1: EASY / STARTER (1 - 10) ───
  {
    id: 1,
    tier: 1,
    name: 'First Spark',
    tagline: 'Execute your 1st paper trade in the Arena',
    desc: 'Enter the market with conviction and log your first verified order.',
    category: 'trades',
    coins: 50,
    icon: Zap,
    color: '#10B981',
    check: ({ history, positions }) => {
      const total = (history?.length || 0) + (positions?.length || 0);
      return { unlocked: total >= 1, progress: Math.min(1, total), target: 1, text: `${Math.min(1, total)}/1 trade` };
    }
  },
  {
    id: 2,
    tier: 1,
    name: 'Identity Confirmed',
    tagline: 'Customize your profile and avatar',
    desc: 'Establish your institutional trading handle with an avatar photo or banner.',
    category: 'profile',
    coins: 50,
    icon: Award,
    color: '#3B82F6',
    check: ({ hasAvatar }) => {
      return { unlocked: Boolean(hasAvatar), progress: hasAvatar ? 1 : 0, target: 1, text: hasAvatar ? 'Customized' : '0/1 set' };
    }
  },
  {
    id: 3,
    tier: 1,
    name: 'Radar Online',
    tagline: 'Add 3+ assets to your live Watchlist',
    desc: 'Organize your trading screens by tracking at least 3 global instruments.',
    category: 'watchlist',
    coins: 50,
    icon: Target,
    color: '#06B6D4',
    check: ({ watchlist }) => {
      const count = watchlist?.length || 0;
      return { unlocked: count >= 3, progress: Math.min(3, count), target: 3, text: `${Math.min(3, count)}/3 assets` };
    }
  },
  {
    id: 4,
    tier: 1,
    name: 'Patience Pays',
    tagline: 'Place your first Limit or Stop order',
    desc: 'Do not chase market prices. Command the price you want by queueing a pending order.',
    category: 'trades',
    coins: 60,
    icon: Clock,
    color: '#8B5CF6',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const hasLimit = all.some(o => o.orderType === 'LIMIT' || o.type === 'LIMIT' || o.sl || o.tp);
      return { unlocked: hasLimit, progress: hasLimit ? 1 : 0, target: 1, text: hasLimit ? '1/1 Limit' : '0/1 placed' };
    }
  },
  {
    id: 5,
    tier: 1,
    name: 'Shields Up',
    tagline: 'Execute an order with Stop-Loss defined',
    desc: 'Professional capital preservation starts with pre-calculated downside limits.',
    category: 'risk',
    coins: 60,
    icon: ShieldCheck,
    color: '#10B981',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const hasSL = all.some(o => o.stopLoss || o.sl);
      return { unlocked: hasSL, progress: hasSL ? 1 : 0, target: 1, text: hasSL ? 'Protected' : '0/1 SL set' };
    }
  },
  {
    id: 6,
    tier: 1,
    name: 'Profit Visionary',
    tagline: 'Set a Take-Profit target on a trade',
    desc: 'Lock in targets before emotion takes over during sudden volatility spikes.',
    category: 'risk',
    coins: 60,
    icon: Star,
    color: '#F59E0B',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const hasTP = all.some(o => o.takeProfit || o.tp);
      return { unlocked: hasTP, progress: hasTP ? 1 : 0, target: 1, text: hasTP ? 'Targeted' : '0/1 TP set' };
    }
  },
  {
    id: 7,
    tier: 1,
    name: 'First Green',
    tagline: 'Close a trade with positive net profit',
    desc: 'Taste your first green print in the ledger and bank real profits.',
    category: 'trades',
    coins: 75,
    icon: TrendingUp,
    color: '#10B981',
    check: ({ history }) => {
      const wins = (history || []).filter(h => (h.pnl || h.profit || 0) > 0).length;
      return { unlocked: wins >= 1, progress: Math.min(1, wins), target: 1, text: `${Math.min(1, wins)}/1 win` };
    }
  },
  {
    id: 8,
    tier: 1,
    name: 'Double Strike',
    tagline: 'Win 2 consecutive trades in a row',
    desc: 'String together two consecutive winning executions without a loss.',
    category: 'streak',
    coins: 80,
    icon: Zap,
    color: '#06B6D4',
    check: ({ history }) => {
      let maxWinStreak = 0;
      let curr = 0;
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0) {
          curr++;
          if (curr > maxWinStreak) maxWinStreak = curr;
        } else {
          curr = 0;
        }
      });
      return { unlocked: maxWinStreak >= 2, progress: Math.min(2, maxWinStreak), target: 2, text: `${Math.min(2, maxWinStreak)}/2 wins` };
    }
  },
  {
    id: 9,
    tier: 1,
    name: 'Silver Gatekeeper',
    tagline: 'Grow portfolio balance to $1,500',
    desc: 'Produce a 50% cumulative gain over the starting baseline of $1,000.',
    category: 'equity',
    coins: 100,
    icon: Trophy,
    color: '#94A3B8',
    check: ({ balance }) => {
      const bal = Number(balance) || 1000;
      return { unlocked: bal >= 1500, progress: Math.min(1500, Math.round(bal)), target: 1500, text: `$${Math.round(bal)} / $1,500` };
    }
  },
  {
    id: 10,
    tier: 1,
    name: 'Silver Vanguard',
    tagline: 'Ascend to Silver Rank ($2,000 equity)',
    desc: 'Double your account from $1,000 to $2,000 to earn the verified Silver Insignia.',
    category: 'equity',
    coins: 150,
    icon: Medal,
    color: '#CBD5E1',
    check: ({ balance }) => {
      const bal = Number(balance) || 1000;
      return { unlocked: bal >= 2000, progress: Math.min(2000, Math.round(bal)), target: 2000, text: `$${Math.round(bal)} / $2,000` };
    }
  },

  // ─── TIER 2: HIGH-ROI MULTIPLIERS & PERFORMANCE (11 - 30) ───
  {
    id: 11,
    tier: 2,
    name: 'Double Up (2x ROI)',
    tagline: 'Close a trade with 2x (+100%) return on margin',
    desc: 'Extract a full 100% gain on the margin committed to a single order.',
    category: 'roi',
    coins: 150,
    icon: Flame,
    color: '#F97316',
    check: ({ history }) => {
      const maxRoi = (history || []).reduce((max, h) => {
        const roi = h.margin ? ((h.pnl || h.profit || 0) / h.margin) * 100 : 0;
        return Math.max(max, roi);
      }, 0);
      return { unlocked: maxRoi >= 100, progress: Math.min(100, Math.round(maxRoi)), target: 100, text: `${Math.round(maxRoi)}% / 100% ROI` };
    }
  },
  {
    id: 12,
    tier: 2,
    name: 'Triple Threat (3x ROI)',
    tagline: 'Close a trade with 3x (+200%) return on margin',
    desc: 'Ride a fierce market trend until your initial margin triples in value.',
    category: 'roi',
    coins: 200,
    icon: Flame,
    color: '#EF4444',
    check: ({ history }) => {
      const maxRoi = (history || []).reduce((max, h) => {
        const roi = h.margin ? ((h.pnl || h.profit || 0) / h.margin) * 100 : 0;
        return Math.max(max, roi);
      }, 0);
      return { unlocked: maxRoi >= 200, progress: Math.min(200, Math.round(maxRoi)), target: 200, text: `${Math.round(maxRoi)}% / 200% ROI` };
    }
  },
  {
    id: 13,
    tier: 2,
    name: 'Quintuple King (5x ROI)',
    tagline: 'Close a trade with 5x (+400%) return on margin',
    desc: 'Monster breakout execution. Multiply your allocated position capital five times over.',
    category: 'roi',
    coins: 300,
    icon: Trophy,
    color: '#EC4899',
    check: ({ history }) => {
      const maxRoi = (history || []).reduce((max, h) => {
        const roi = h.margin ? ((h.pnl || h.profit || 0) / h.margin) * 100 : 0;
        return Math.max(max, roi);
      }, 0);
      return { unlocked: maxRoi >= 400, progress: Math.min(400, Math.round(maxRoi)), target: 400, text: `${Math.round(maxRoi)}% / 400% ROI` };
    }
  },
  {
    id: 14,
    tier: 2,
    name: '10x Supernova (10x ROI)',
    tagline: 'Close a legendary trade with 10x (+900%) profit',
    desc: 'The holy grail of asymmetric speculation: a complete 10-bagger return on margin.',
    category: 'roi',
    coins: 500,
    icon: Crown,
    color: '#A855F7',
    check: ({ history }) => {
      const maxRoi = (history || []).reduce((max, h) => {
        const roi = h.margin ? ((h.pnl || h.profit || 0) / h.margin) * 100 : 0;
        return Math.max(max, roi);
      }, 0);
      return { unlocked: maxRoi >= 900, progress: Math.min(900, Math.round(maxRoi)), target: 900, text: `${Math.round(maxRoi)}% / 900% ROI` };
    }
  },
  {
    id: 15,
    tier: 2,
    name: 'Century Bank',
    tagline: 'Earn +$100.00 profit on a single trade',
    desc: 'Log three digits of pure green profit in a single execution ticket.',
    category: 'profit',
    coins: 120,
    icon: Coins,
    color: '#10B981',
    check: ({ history }) => {
      const maxProfit = (history || []).reduce((m, h) => Math.max(m, h.pnl || h.profit || 0), 0);
      return { unlocked: maxProfit >= 100, progress: Math.min(100, Math.round(maxProfit)), target: 100, text: `$${Math.round(maxProfit)} / $100` };
    }
  },
  {
    id: 16,
    tier: 2,
    name: 'Quarter Grand',
    tagline: 'Earn +$250.00 profit on a single trade',
    desc: 'Score a $250 windfall on a high-conviction momentum move.',
    category: 'profit',
    coins: 180,
    icon: Coins,
    color: '#14B8A6',
    check: ({ history }) => {
      const maxProfit = (history || []).reduce((m, h) => Math.max(m, h.pnl || h.profit || 0), 0);
      return { unlocked: maxProfit >= 250, progress: Math.min(250, Math.round(maxProfit)), target: 250, text: `$${Math.round(maxProfit)} / $250` };
    }
  },
  {
    id: 17,
    tier: 2,
    name: 'Half-Thousand Hit',
    tagline: 'Earn +$500.00 profit on a single trade',
    desc: 'Bank half a grand in profit on one single swing trade.',
    category: 'profit',
    coins: 250,
    icon: Award,
    color: '#F59E0B',
    check: ({ history }) => {
      const maxProfit = (history || []).reduce((m, h) => Math.max(m, h.pnl || h.profit || 0), 0);
      return { unlocked: maxProfit >= 500, progress: Math.min(500, Math.round(maxProfit)), target: 500, text: `$${Math.round(maxProfit)} / $500` };
    }
  },
  {
    id: 18,
    tier: 2,
    name: 'Grand Slam Sizer',
    tagline: 'Earn +$1,000.00 profit on a single trade',
    desc: 'Double your entire starting account in one decisive, clinical trade.',
    category: 'profit',
    coins: 400,
    icon: Trophy,
    color: '#EAB308',
    check: ({ history }) => {
      const maxProfit = (history || []).reduce((m, h) => Math.max(m, h.pnl || h.profit || 0), 0);
      return { unlocked: maxProfit >= 1000, progress: Math.min(1000, Math.round(maxProfit)), target: 1000, text: `$${Math.round(maxProfit)} / $1,000` };
    }
  },
  {
    id: 19,
    tier: 2,
    name: 'Triple Win Streak',
    tagline: 'Win 3 consecutive trades without a loss',
    desc: 'Demonstrate disciplined consistency with 3 consecutive wins.',
    category: 'streak',
    coins: 120,
    icon: Activity,
    color: '#3B82F6',
    check: ({ history }) => {
      let maxWinStreak = 0, curr = 0;
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0) {
          curr++;
          if (curr > maxWinStreak) maxWinStreak = curr;
        } else curr = 0;
      });
      return { unlocked: maxWinStreak >= 3, progress: Math.min(3, maxWinStreak), target: 3, text: `${Math.min(3, maxWinStreak)}/3 wins` };
    }
  },
  {
    id: 20,
    tier: 2,
    name: 'Four-Fold Edge',
    tagline: 'Win 4 consecutive trades without a loss',
    desc: 'Ride the edge of the market with 4 straight profitable outcomes.',
    category: 'streak',
    coins: 160,
    icon: Activity,
    color: '#8B5CF6',
    check: ({ history }) => {
      let maxWinStreak = 0, curr = 0;
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0) {
          curr++;
          if (curr > maxWinStreak) maxWinStreak = curr;
        } else curr = 0;
      });
      return { unlocked: maxWinStreak >= 4, progress: Math.min(4, maxWinStreak), target: 4, text: `${Math.min(4, maxWinStreak)}/4 wins` };
    }
  },
  {
    id: 21,
    tier: 2,
    name: 'Gold Horizon',
    tagline: 'Build portfolio equity to $3,000',
    desc: 'Reach 3x of your starting balance with consistent compounding.',
    category: 'equity',
    coins: 200,
    icon: Trophy,
    color: '#FACC15',
    check: ({ balance }) => {
      const bal = Number(balance) || 1000;
      return { unlocked: bal >= 3000, progress: Math.min(3000, Math.round(bal)), target: 3000, text: `$${Math.round(bal)} / $3,000` };
    }
  },
  {
    id: 22,
    tier: 2,
    name: 'Golden Sovereign',
    tagline: 'Ascend to Gold Rank ($4,000 equity)',
    desc: 'Reach 4x capital growth to earn the distinguished Gold Insignia.',
    category: 'equity',
    coins: 300,
    icon: Crown,
    color: '#EAB308',
    check: ({ balance }) => {
      const bal = Number(balance) || 1000;
      return { unlocked: bal >= 4000, progress: Math.min(4000, Math.round(bal)), target: 4000, text: `$${Math.round(bal)} / $4,000` };
    }
  },
  {
    id: 23,
    tier: 2,
    name: 'Crypto Assassin',
    tagline: 'Win 3 trades in Bitcoin, Ethereum, or Solana',
    desc: 'Tame the volatility of digital assets with 3 profitable crypto closes.',
    category: 'asset',
    coins: 150,
    icon: Zap,
    color: '#F97316',
    check: ({ history }) => {
      const count = (history || []).filter(h => 
        ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BTC', 'ETH'].includes(h.symbol) && (h.pnl || h.profit || 0) > 0
      ).length;
      return { unlocked: count >= 3, progress: Math.min(3, count), target: 3, text: `${Math.min(3, count)}/3 crypto wins` };
    }
  },
  {
    id: 24,
    tier: 2,
    name: 'Forex Navigator',
    tagline: 'Win 3 trades in currency pairs (EUR/USD, GBP/USD, USD/JPY)',
    desc: 'Demonstrate foreign currency precision across 3 green forex orders.',
    category: 'asset',
    coins: 150,
    icon: Globe,
    color: '#3B82F6',
    check: ({ history }) => {
      const count = (history || []).filter(h => 
        ['EURUSD', 'GBPUSD', 'USDJPY'].includes(h.symbol) && (h.pnl || h.profit || 0) > 0
      ).length;
      return { unlocked: count >= 3, progress: Math.min(3, count), target: 3, text: `${Math.min(3, count)}/3 forex wins` };
    }
  },
  {
    id: 25,
    tier: 2,
    name: 'Resource Titan',
    tagline: 'Win 3 trades in Gold (XAUUSD) or Crude Oil (WTIUSD)',
    desc: 'Harvest macro trends in global commodities.',
    category: 'asset',
    coins: 150,
    icon: Star,
    color: '#EAB308',
    check: ({ history }) => {
      const count = (history || []).filter(h => 
        ['XAUUSD', 'WTIUSD', 'XAGUSD'].includes(h.symbol) && (h.pnl || h.profit || 0) > 0
      ).length;
      return { unlocked: count >= 3, progress: Math.min(3, count), target: 3, text: `${Math.min(3, count)}/3 commodity wins` };
    }
  },
  {
    id: 26,
    tier: 2,
    name: 'Wall Street Prodigy',
    tagline: 'Win 3 trades in US equities (AAPL, NVDA, TSLA, SPY)',
    desc: 'Capitalize on big tech momentum with 3 winning stock trades.',
    category: 'asset',
    coins: 150,
    icon: TrendingUp,
    color: '#10B981',
    check: ({ history }) => {
      const count = (history || []).filter(h => 
        ['AAPL', 'NVDA', 'TSLA', 'SPY'].includes(h.symbol) && (h.pnl || h.profit || 0) > 0
      ).length;
      return { unlocked: count >= 3, progress: Math.min(3, count), target: 3, text: `${Math.min(3, count)}/3 stock wins` };
    }
  },
  {
    id: 27,
    tier: 2,
    name: 'Asymmetric Edge',
    tagline: 'Win a trade with Risk/Reward ratio >= 1:3',
    desc: 'Risk $10 to make $30 or more. True professional trade geometry.',
    category: 'risk',
    coins: 200,
    icon: Target,
    color: '#06B6D4',
    check: ({ history }) => {
      const hasAsymmetric = (history || []).some(h => {
        const profit = h.pnl || h.profit || 0;
        const slDist = h.stopLoss ? Math.abs((h.entryPrice || 0) - h.stopLoss) : 0;
        const tpDist = h.takeProfit ? Math.abs((h.takeProfit || 0) - (h.entryPrice || 0)) : 0;
        return profit > 0 && ((tpDist / (slDist || 1)) >= 2.5 || (h.margin && profit >= h.margin * 1.5));
      });
      return { unlocked: hasAsymmetric, progress: hasAsymmetric ? 1 : 0, target: 1, text: hasAsymmetric ? '1/1 R:R >= 1:3' : '0/1 complete' };
    }
  },
  {
    id: 28,
    tier: 2,
    name: 'Active Fleet',
    tagline: 'Execute 25 total verified trades',
    desc: 'Build trading experience through volume and market screen time.',
    category: 'trades',
    coins: 180,
    icon: BarChart2,
    color: '#6366F1',
    check: ({ history, positions }) => {
      const total = (history?.length || 0) + (positions?.length || 0);
      return { unlocked: total >= 25, progress: Math.min(25, total), target: 25, text: `${Math.min(25, total)}/25 trades` };
    }
  },
  {
    id: 29,
    tier: 2,
    name: 'High Roller',
    tagline: 'Transact $50,000+ in cumulative volume',
    desc: 'Command significant capital turnover across your positions.',
    category: 'volume',
    coins: 220,
    icon: Coins,
    color: '#EC4899',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 50000, progress: Math.min(50000, Math.round(vol)), target: 50000, text: `$${Math.round(vol).toLocaleString()} / $50,000` };
    }
  },
  {
    id: 30,
    tier: 2,
    name: 'Eagle Eye',
    tagline: 'Maintain 65%+ win rate across 10+ trades',
    desc: 'Laser-focused execution without excessive churn or impulsive entries.',
    category: 'accuracy',
    coins: 250,
    icon: Star,
    color: '#10B981',
    check: ({ history }) => {
      const total = history?.length || 0;
      if (total < 10) return { unlocked: false, progress: total, target: 10, text: `${total}/10 trades (need 65%+)` };
      const wins = history.filter(h => (h.pnl || h.profit || 0) > 0).length;
      const rate = Math.round((wins / total) * 100);
      return { unlocked: rate >= 65, progress: Math.min(65, rate), target: 65, text: `${rate}% / 65% win rate` };
    }
  },

  // ─── TIER 3: VERY HARD / STREAKS & ELITE MASTERY (31 - 52) ───
  {
    id: 31,
    tier: 3,
    name: 'Discipline Ignition',
    tagline: '3-day active trading login streak',
    desc: 'Show up to inspect the markets 3 consecutive days in a row.',
    category: 'streak',
    coins: 100,
    icon: Flame,
    color: '#F97316',
    check: ({ streakDays }) => {
      const s = streakDays || 1;
      return { unlocked: s >= 3, progress: Math.min(3, s), target: 3, text: `${Math.min(3, s)}/3 days` };
    }
  },
  {
    id: 32,
    tier: 3,
    name: 'Weekly Iron Will',
    tagline: '7-day continuous discipline streak',
    desc: 'One full week of relentless market presence and disciplined reviews.',
    category: 'streak',
    coins: 150,
    icon: Flame,
    color: '#EA580C',
    check: ({ streakDays }) => {
      const s = streakDays || 1;
      return { unlocked: s >= 7, progress: Math.min(7, s), target: 7, text: `${Math.min(7, s)}/7 days` };
    }
  },
  {
    id: 33,
    tier: 3,
    name: 'Fortnight Fortress',
    tagline: '14-day continuous discipline streak',
    desc: 'Two solid weeks of continuous trading and daily bonuses.',
    category: 'streak',
    coins: 250,
    icon: Flame,
    color: '#EF4444',
    check: ({ streakDays }) => {
      const s = streakDays || 1;
      return { unlocked: s >= 14, progress: Math.min(14, s), target: 14, text: `${Math.min(14, s)}/14 days` };
    }
  },
  {
    id: 34,
    tier: 3,
    name: 'Habit of Champions',
    tagline: '21-day continuous discipline streak',
    desc: 'Neuroplastic routine: 21 days to permanently solidify trading discipline.',
    category: 'streak',
    coins: 350,
    icon: Flame,
    color: '#DC2626',
    check: ({ streakDays }) => {
      const s = streakDays || 1;
      return { unlocked: s >= 21, progress: Math.min(21, s), target: 21, text: `${Math.min(21, s)}/21 days` };
    }
  },
  {
    id: 35,
    tier: 3,
    name: 'Monthly Titan',
    tagline: '30-day continuous discipline streak',
    desc: 'One uninterrupted calendar month of professional presence.',
    category: 'streak',
    coins: 500,
    icon: Crown,
    color: '#EAB308',
    check: ({ streakDays }) => {
      const s = streakDays || 1;
      return { unlocked: s >= 30, progress: Math.min(30, s), target: 30, text: `${Math.min(30, s)}/30 days` };
    }
  },
  {
    id: 36,
    tier: 3,
    name: 'Unshakeable Habit',
    tagline: '60-day continuous discipline streak',
    desc: 'Two full months without missing a single day of market study.',
    category: 'streak',
    coins: 750,
    icon: Crown,
    color: '#A855F7',
    check: ({ streakDays }) => {
      const s = streakDays || 1;
      return { unlocked: s >= 60, progress: Math.min(60, s), target: 60, text: `${Math.min(60, s)}/60 days` };
    }
  },
  {
    id: 37,
    tier: 3,
    name: 'Centurion Nomad',
    tagline: '100-day daily discipline streak',
    desc: 'Triple-digit milestone: 100 days of ironclad focus and execution.',
    category: 'streak',
    coins: 1200,
    icon: Crown,
    color: '#F43F5E',
    check: ({ streakDays }) => {
      const s = streakDays || 1;
      return { unlocked: s >= 100, progress: Math.min(100, s), target: 100, text: `${Math.min(100, s)}/100 days` };
    }
  },
  {
    id: 38,
    tier: 3,
    name: 'Flawless Five',
    tagline: '5 consecutive winning trades without any loss',
    desc: 'Five consecutive green closes without surrendering a penny.',
    category: 'streak',
    coins: 250,
    icon: Zap,
    color: '#10B981',
    check: ({ history }) => {
      let maxWinStreak = 0, curr = 0;
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0) {
          curr++;
          if (curr > maxWinStreak) maxWinStreak = curr;
        } else curr = 0;
      });
      return { unlocked: maxWinStreak >= 5, progress: Math.min(5, maxWinStreak), target: 5, text: `${Math.min(5, maxWinStreak)}/5 wins` };
    }
  },
  {
    id: 39,
    tier: 3,
    name: 'Lucky Seven',
    tagline: '7 consecutive winning trades in a row',
    desc: 'Seven flawless trades. Unstoppable rhythm with market order flow.',
    category: 'streak',
    coins: 400,
    icon: Trophy,
    color: '#06B6D4',
    check: ({ history }) => {
      let maxWinStreak = 0, curr = 0;
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0) {
          curr++;
          if (curr > maxWinStreak) maxWinStreak = curr;
        } else curr = 0;
      });
      return { unlocked: maxWinStreak >= 7, progress: Math.min(7, maxWinStreak), target: 7, text: `${Math.min(7, maxWinStreak)}/7 wins` };
    }
  },
  {
    id: 40,
    tier: 3,
    name: 'Deca-Strike Legend',
    tagline: '10 consecutive winning trades without a loss',
    desc: 'Ten wins in a row. Elite probability engineering and zero tilt.',
    category: 'streak',
    coins: 800,
    icon: Crown,
    color: '#E11D48',
    check: ({ history }) => {
      let maxWinStreak = 0, curr = 0;
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0) {
          curr++;
          if (curr > maxWinStreak) maxWinStreak = curr;
        } else curr = 0;
      });
      return { unlocked: maxWinStreak >= 10, progress: Math.min(10, maxWinStreak), target: 10, text: `${Math.min(10, maxWinStreak)}/10 wins` };
    }
  },
  {
    id: 41,
    tier: 3,
    name: 'Battle Tested',
    tagline: 'Execute 50 total lifetime trades',
    desc: 'Solidify your track record across fifty unique market setups.',
    category: 'trades',
    coins: 300,
    icon: ShieldCheck,
    color: '#3B82F6',
    check: ({ history, positions }) => {
      const total = (history?.length || 0) + (positions?.length || 0);
      return { unlocked: total >= 50, progress: Math.min(50, total), target: 50, text: `${Math.min(50, total)}/50 trades` };
    }
  },
  {
    id: 42,
    tier: 3,
    name: 'Century Operator',
    tagline: 'Execute 100 total lifetime trades',
    desc: 'One hundred trades executed. A statistically significant sample size.',
    category: 'trades',
    coins: 600,
    icon: Award,
    color: '#8B5CF6',
    check: ({ history, positions }) => {
      const total = (history?.length || 0) + (positions?.length || 0);
      return { unlocked: total >= 100, progress: Math.min(100, total), target: 100, text: `${Math.min(100, total)}/100 trades` };
    }
  },
  {
    id: 43,
    tier: 3,
    name: 'Market Veteran',
    tagline: 'Execute 250 lifetime trades',
    desc: 'Quarter of a thousand trades. Hardened against market noise and whipsaws.',
    category: 'trades',
    coins: 1000,
    icon: Medal,
    color: '#A855F7',
    check: ({ history, positions }) => {
      const total = (history?.length || 0) + (positions?.length || 0);
      return { unlocked: total >= 250, progress: Math.min(250, total), target: 250, text: `${Math.min(250, total)}/250 trades` };
    }
  },
  {
    id: 44,
    tier: 3,
    name: 'Six-Figure Flow',
    tagline: 'Transact $100,000 cumulative volume',
    desc: 'Surpass six figures of trading liquidity managed in the arena.',
    category: 'volume',
    coins: 350,
    icon: Coins,
    color: '#F59E0B',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 100000, progress: Math.min(100000, Math.round(vol)), target: 100000, text: `$${Math.round(vol).toLocaleString()} / $100k` };
    }
  },
  {
    id: 45,
    tier: 3,
    name: 'Half-Million Mover',
    tagline: 'Transact $500,000 cumulative volume',
    desc: 'Move half a million dollars of cumulative notional exposure.',
    category: 'volume',
    coins: 650,
    icon: Activity,
    color: '#EC4899',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 500000, progress: Math.min(500000, Math.round(vol)), target: 500000, text: `$${Math.round(vol).toLocaleString()} / $500k` };
    }
  },
  {
    id: 46,
    tier: 3,
    name: 'Million Dollar Desk',
    tagline: 'Transact $1,000,000 cumulative turnover',
    desc: 'Institutional scale: Seven figures of total trading turnover executed.',
    category: 'volume',
    coins: 1500,
    icon: Crown,
    color: '#EAB308',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 1000000, progress: Math.min(1000000, Math.round(vol)), target: 1000000, text: `$${Math.round(vol).toLocaleString()} / $1M` };
    }
  },
  {
    id: 47,
    tier: 3,
    name: 'Ruby Master',
    tagline: 'Ascend to Master Rank ($8,000 equity)',
    desc: '8x portfolio growth from $1,000. Earn the elite Ruby Master Insignia.',
    category: 'equity',
    coins: 750,
    icon: Trophy,
    color: '#E11D48',
    check: ({ balance }) => {
      const bal = Number(balance) || 1000;
      return { unlocked: bal >= 8000, progress: Math.min(8000, Math.round(bal)), target: 8000, text: `$${Math.round(bal)} / $8,000` };
    }
  },
  {
    id: 48,
    tier: 3,
    name: 'Apex Operator',
    tagline: 'Ascend to Operator Rank ($15,000 equity)',
    desc: '15x your starting capital. Attain the highest sovereign rank on NonStock.',
    category: 'equity',
    coins: 1500,
    icon: Crown,
    color: '#A855F7',
    check: ({ balance }) => {
      const bal = Number(balance) || 1000;
      return { unlocked: bal >= 15000, progress: Math.min(15000, Math.round(bal)), target: 15000, text: `$${Math.round(bal)} / $15,000` };
    }
  },
  {
    id: 49,
    tier: 3,
    name: 'Triple 10x Titan',
    tagline: 'Score 3 separate 10x (+900%) ROI trades',
    desc: 'Prove that your 10x return was not luck: replicate it three separate times.',
    category: 'roi',
    coins: 2000,
    icon: Flame,
    color: '#F43F5E',
    check: ({ history }) => {
      const count10x = (history || []).filter(h => {
        const roi = h.margin ? ((h.pnl || h.profit || 0) / h.margin) * 100 : 0;
        return roi >= 900;
      }).length;
      return { unlocked: count10x >= 3, progress: Math.min(3, count10x), target: 3, text: `${Math.min(3, count10x)}/3 10x trades` };
    }
  },
  {
    id: 50,
    tier: 3,
    name: 'Phoenix Resurrection',
    tagline: 'Recover from a -20% drawdown to a new equity high',
    desc: 'Psychological resilience: bounce back from deep red to peak capital.',
    category: 'resilience',
    coins: 600,
    icon: ShieldAlert,
    color: '#F59E0B',
    check: ({ history, balance }) => {
      const bal = Number(balance) || 1000;
      const hadLoss = (history || []).some(h => (h.pnl || h.profit || 0) <= -200);
      const isRecovered = bal >= 1200 && hadLoss;
      return { unlocked: isRecovered, progress: isRecovered ? 1 : 0, target: 1, text: isRecovered ? 'Rebounded' : 'Requires DD recovery' };
    }
  },
  {
    id: 51,
    tier: 3,
    name: 'Discipline Paragon',
    tagline: 'Achieve DER Discipline Rating >= 90 over 20+ trades',
    desc: 'Never breach risk rules. High risk-reward, consistent sizing, and flawless stops.',
    category: 'der',
    coins: 800,
    icon: ShieldCheck,
    color: '#10B981',
    check: ({ history }) => {
      const count = history?.length || 0;
      if (count < 20) return { unlocked: false, progress: count, target: 20, text: `${count}/20 trades (need 90+ DER)` };
      // Simulated DER based on SL/TP discipline
      const slCount = history.filter(h => h.stopLoss || h.sl).length;
      const derScore = Math.round((slCount / count) * 100);
      return { unlocked: derScore >= 90, progress: Math.min(90, derScore), target: 90, text: `${derScore}/90 DER score` };
    }
  },
  {
    id: 52,
    tier: 3,
    name: 'NonStock Grandmaster',
    tagline: 'Complete 50+ trades, win rate >= 75%, and unlock 30+ badges',
    desc: 'The pinnacle of trading prowess. Reserved for the absolute top 0.1% on NonStock.',
    category: 'mastery',
    coins: 3000,
    icon: Crown,
    color: '#8B5CF6',
    check: ({ history, unlockedBadgeCount }) => {
      const count = history?.length || 0;
      const wins = (history || []).filter(h => (h.pnl || h.profit || 0) > 0).length;
      const rate = count > 0 ? (wins / count) * 100 : 0;
      const isMaster = count >= 50 && rate >= 75 && (unlockedBadgeCount || 0) >= 30;
      return { 
        unlocked: isMaster, 
        progress: Math.min(30, unlockedBadgeCount || 0), 
        target: 30, 
        text: `${unlockedBadgeCount || 0}/30 badges, ${Math.round(rate)}% win (${count}/50 trades)` 
      };
    }
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    balance = 1000, coins = 100, streakDays = 1, positions = [], history = [], badge, closePosition,
    watchlist = [], addToWatchlist, removeFromWatchlist,
    unlockedTools = {}, unlockTool,
    isFreeGraceActive = true, trialDaysRemaining = 60
  } = useTrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('all'); // all, unlocked, locked, tier1, tier2, tier3
  const [badgeSearch, setBadgeSearch] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showProModal, setShowProModal] = useState(false);

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
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        localStorage.setItem('nonstock_user_avatar', dataUrl);
        setAvatarUrl(dataUrl);
        toast.success('Profile avatar updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Banner must be under 4MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        localStorage.setItem('nonstock_user_banner', dataUrl);
        setBannerUrl(dataUrl);
        toast.success('Profile banner updated');
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter search results for Watchlist
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return WATCHLIST_DATABASE.filter(item => 
      item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Rank and target calculation
  const balanceNum = Number(balance) || 1000;
  let dynamicTierName = 'Contender';
  let dynamicTierColor = '#94A3B8';
  let nextRankName = 'Silver';
  let nextRankTarget = 2000;

  if (balanceNum >= 15000) {
    dynamicTierName = 'Operator';
    dynamicTierColor = '#A855F7';
    nextRankName = 'Max Rank (Apex Operator)';
    nextRankTarget = 15000;
  } else if (balanceNum >= 8000) {
    dynamicTierName = 'Master';
    dynamicTierColor = '#E11D48';
    nextRankName = 'Operator';
    nextRankTarget = 15000;
  } else if (balanceNum >= 4000) {
    dynamicTierName = 'Gold';
    dynamicTierColor = '#EAB308';
    nextRankName = 'Master';
    nextRankTarget = 8000;
  } else if (balanceNum >= 2000) {
    dynamicTierName = 'Silver';
    dynamicTierColor = '#CBD5E1';
    nextRankName = 'Gold';
    nextRankTarget = 4000;
  } else {
    dynamicTierName = 'Contender';
    dynamicTierColor = '#64748B';
    nextRankName = 'Silver';
    nextRankTarget = 2000;
  }

  const rankProgress = Math.min(100, Math.max(0, (balanceNum / nextRankTarget) * 100));
  const userName = user?.name || user?.email?.split('@')[0] || 'Trader';

  // Compute stats
  const totalTrades = history.length;
  const winningTrades = history.filter(h => (h.pnl || h.profit || 0) > 0).length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
  const netPnL = balanceNum - 1000;
  const netRoi = ((balanceNum - 1000) / 1000) * 100;

  // Evaluate All 52 Badges
  const evaluatedBadges = useMemo(() => {
    // First pass to compute count of unlocked for grandmaster
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

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return evaluatedBadges.filter(b => {
      // Search filter
      if (badgeSearch.trim()) {
        const q = badgeSearch.toLowerCase().trim();
        const match = b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Category filter
      if (badgeFilter === 'unlocked') return b.unlocked;
      if (badgeFilter === 'locked') return !b.unlocked;
      if (badgeFilter === 'tier1') return b.tier === 1;
      if (badgeFilter === 'tier2') return b.tier === 2;
      if (badgeFilter === 'tier3') return b.tier === 3;
      return true;
    });
  }, [evaluatedBadges, badgeFilter, badgeSearch]);

  // Real Leaderboard
  const [realLeaderboard, setRealLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    apiClient.get('/paper/hall-of-fame')
      .then(res => {
        const data = res.data;
        if (data?.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          const normalized = data.leaderboard.map(item => ({
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
      })
      .finally(() => setLoadingLeaderboard(false));
  }, [userName, balanceNum, dynamicTierName, dynamicTierColor]);

  // Decagon clip-path style
  const decagonClip = 'polygon(50% 0%, 80% 9%, 100% 35%, 100% 65%, 80% 91%, 50% 100%, 20% 91%, 0% 65%, 0% 35%, 20% 9%)';

  return (
    <div style={{ 
      maxWidth: '1440px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px',
      color: '#F8FAFC'
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

      {/* ─── 1. 60-DAY FREE PLATFORM PASS BANNER (IF ACTIVE) ─── */}
      {isFreeGraceActive && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  60-Day Full Platform Access Active
                </span>
                <span style={{
                  background: '#10B981',
                  color: '#042F2E',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '20px'
                }}>
                  {trialDaysRemaining} DAYS REMAINING
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                All institutional tools (Technical Screener, Global Macro Analysis, Strategy Lab, Replay) are 100% unlocked for your account during your first 2 months!
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => navigate('/screener')}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#E2E8F0',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Search size={13} />
              <span>Explore Screener</span>
            </button>
            <button
              onClick={() => navigate('/global-markets')}
              style={{
                background: '#10B981',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Globe size={13} />
              <span>Global Markets</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 2. EXECUTIVE PROFILE & VAULT TERMINAL HERO ─── */}
      <div style={{
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: bannerUrl 
          ? `linear-gradient(180deg, rgba(11, 15, 25, 0.85) 0%, rgba(11, 15, 25, 0.98) 100%), url(${bannerUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 14, 27, 0.98) 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Banner Change Button */}
        <button
          onClick={() => bannerInputRef.current?.click()}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Upload custom terminal banner"
        >
          <Image size={13} />
          <span>Change Banner</span>
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          {/* Left: Avatar & Rank Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div 
              onClick={() => avatarInputRef.current?.click()}
              style={{
                position: 'relative',
                width: '84px',
                height: '84px',
                borderRadius: '20px',
                background: '#0B0F19',
                border: `2px solid ${dynamicTierColor}`,
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${dynamicTierColor}33`,
                flexShrink: 0
              }}
              title="Click to update avatar"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '32px', fontWeight: 900, color: dynamicTierColor }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '3px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Camera size={12} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 900, 
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}>
                  {userName}
                </h1>

                {/* Rank Badge */}
                <span style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: dynamicTierColor,
                  border: `1.5px solid ${dynamicTierColor}`,
                  padding: '3px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  boxShadow: `0 0 10px ${dynamicTierColor}33`
                }}>
                  {dynamicTierName}
                </span>

                <button
                  onClick={() => setShowProModal(true)}
                  style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    color: '#FACC15',
                    padding: '3px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Crown size={12} />
                  <span>Pro Member</span>
                </button>
              </div>

              <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span>Institutional Paper Ledger</span>
                <span>•</span>
                <span>Account: NS-{user?.id?.substring(0, 8) || 'CONTENDER'}</span>
                <span>•</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>Base: $1,000.00</span>
              </div>

              {/* Next Tier Progression */}
              <div style={{ marginTop: '12px', maxWidth: '380px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>
                  <span>Portfolio: ${balanceNum.toFixed(2)}</span>
                  <span>Target: {nextRankName} (${nextRankTarget.toLocaleString()})</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${rankProgress}%`, 
                    height: '100%', 
                    background: `linear-gradient(90deg, #10B981, ${dynamicTierColor})`, 
                    borderRadius: '6px', 
                    transition: 'width 0.3s' 
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Gold Coins Vault Widget */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.05) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '16px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(234, 179, 8, 0.08)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(234, 179, 8, 0.18)',
              border: '1.5px solid rgba(234, 179, 8, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Coins size={28} color="#FACC15" />
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#FACC15', letterSpacing: '1px', textTransform: 'uppercase' }}>
                GOLD COINS VAULT
              </div>
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
                {coins} <span style={{ fontSize: '14px', fontWeight: 700, color: '#FACC15' }}>Coins</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <Flame size={13} color="#FB923C" /> 
                <span>{streakDays}-Day Discipline Streak (+25 daily)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. EXECUTIVE TRADING METRICS BAR (6 TILES) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Portfolio Equity
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
            ${balanceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: netPnL >= 0 ? '#10B981' : '#EF4444', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            {netPnL >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{netPnL >= 0 ? '+' : ''}{netRoi.toFixed(1)}% All-Time</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Net Realized PnL
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: netPnL >= 0 ? '#10B981' : '#EF4444', marginTop: '4px' }}>
            {netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
            From $1,000 baseline
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Win Rate %
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
            {winRate}%
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
            {winningTrades} Won / {totalTrades} Closed
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Discipline Score (DER)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#38BDF8', marginTop: '4px' }}>
            88 / 100
          </div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
            Strict Risk Protected
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Active Positions
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
            {positions.length}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
            Live Market Exposure
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '16px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => navigate('/trading')}
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Zap size={14} />
            <span>Enter Trading Arena</span>
          </button>
        </div>
      </div>

      {/* ─── 4. THE 52-BADGES TROPHY VAULT (THE MAIN SYSTEM) ─── */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '28px',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Header & Badges Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy size={24} color="#FACC15" />
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Institutional Badges Vault ({totalUnlockedCount} / 52 Unlocked)
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8' }}>
              Locked badges remain visible alongside unlocked badges with exact live criteria and coin bounties.
            </p>
          </div>

          {/* Search bar inside Badges Vault */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px 12px',
              width: '220px'
            }}>
              <Search size={14} color="#64748B" />
              <input
                type="text"
                placeholder="Search 52 badges..."
                value={badgeSearch}
                onChange={(e) => setBadgeSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  width: '100%'
                }}
              />
              {badgeSearch && (
                <X size={12} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setBadgeSearch('')} />
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '24px'
        }}>
          {[
            { id: 'all', label: `All Badges (52)` },
            { id: 'unlocked', label: `Unlocked (${totalUnlockedCount})` },
            { id: 'locked', label: `Locked (${52 - totalUnlockedCount})` },
            { id: 'tier1', label: `Starter / Easy (1-10)` },
            { id: 'tier2', label: `5x / 10x Multipliers (11-30)` },
            { id: 'tier3', label: `Streaks & Mastery (31-52)` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setBadgeFilter(tab.id)}
              style={{
                background: badgeFilter === tab.id ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                border: badgeFilter === tab.id ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                color: badgeFilter === tab.id ? '#10B981' : '#94A3B8',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid (Displaying locked badges alongside unlocked badges) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '14px'
        }}>
          {filteredBadges.map((badgeItem) => {
            const Icon = badgeItem.icon;
            const isUnlocked = badgeItem.unlocked;

            return (
              <div
                key={badgeItem.id}
                onClick={() => setSelectedBadge(badgeItem)}
                style={{
                  background: isUnlocked 
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)' 
                    : 'rgba(11, 15, 25, 0.7)',
                  borderRadius: '14px',
                  border: isUnlocked 
                    ? `1.5px solid ${badgeItem.color}55` 
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isUnlocked 
                    ? `0 4px 18px ${badgeItem.color}15` 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  if (isUnlocked) {
                    e.currentTarget.style.borderColor = badgeItem.color;
                  } else {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (isUnlocked) {
                    e.currentTarget.style.borderColor = `${badgeItem.color}55`;
                  } else {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  }
                }}
              >
                {/* Status tag */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: isUnlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: isUnlocked ? '#10B981' : '#64748B',
                  border: isUnlocked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  {isUnlocked ? (
                    <>
                      <CheckCircle2 size={10} />
                      <span>UNLOCKED</span>
                    </>
                  ) : (
                    <>
                      <Lock size={10} />
                      <span>LOCKED</span>
                    </>
                  )}
                </div>

                {/* 10-Sided Decagon Shield Icon */}
                <div style={{
                  position: 'relative',
                  width: '58px',
                  height: '58px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {/* Outer Decagon */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: isUnlocked ? `linear-gradient(135deg, ${badgeItem.color}, ${badgeItem.color}66)` : '#334155',
                    clipPath: decagonClip,
                    boxShadow: isUnlocked ? `0 0 14px ${badgeItem.color}44` : 'none'
                  }} />

                  {/* Inner Decagon */}
                  <div style={{
                    position: 'absolute',
                    inset: '2.5px',
                    background: isUnlocked ? '#0B0F19' : '#0F172A',
                    clipPath: decagonClip,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isUnlocked ? (
                      <Icon size={22} color={badgeItem.color} />
                    ) : (
                      <Lock size={18} color="#64748B" />
                    )}
                  </div>
                </div>

                {/* Badge Info */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: '45px' }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: isUnlocked ? badgeItem.color : '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginBottom: '2px'
                  }}>
                    Tier {badgeItem.tier} • #{badgeItem.id}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isUnlocked ? '#FFFFFF' : '#CBD5E1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {badgeItem.name}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#94A3B8', 
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis' 
                  }}>
                    {badgeItem.tagline}
                  </div>

                  {/* Mini Progress Bar for Locked / Unlocked */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: '#64748B', marginBottom: '2px' }}>
                      <span>{badgeItem.progressText}</span>
                      <span>+{badgeItem.coins} Coins</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: isUnlocked ? '100%' : `${badgeItem.progressPct}%`,
                        height: '100%',
                        background: isUnlocked ? badgeItem.color : '#64748B',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. ACTIVE POSITIONS TERMINAL ─── */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#38BDF8" />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Live Arena Positions ({positions.length})
            </h3>
          </div>

          <button
            onClick={() => navigate('/trading')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Open Order Pad</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {positions.length === 0 ? (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.08)'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#94A3B8' }}>
              No open market exposure. Your account is 100% in cash reserve.
            </p>
            <button
              onClick={() => navigate('/trading')}
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Open New Trade
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Instrument</th>
                  <th style={{ padding: '10px' }}>Side</th>
                  <th style={{ padding: '10px' }}>Size</th>
                  <th style={{ padding: '10px' }}>Entry Price</th>
                  <th style={{ padding: '10px' }}>Margin</th>
                  <th style={{ padding: '10px' }}>SL / TP</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => (
                  <tr key={pos.id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 800, color: '#FFFFFF' }}>{pos.symbol}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 900,
                        background: pos.type === 'BUY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: pos.type === 'BUY' ? '#10B981' : '#EF4444'
                      }}>
                        {pos.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#CBD5E1' }}>{pos.size}</td>
                    <td style={{ padding: '12px 10px', color: '#CBD5E1' }}>${Number(pos.entryPrice || 0).toFixed(2)}</td>
                    <td style={{ padding: '12px 10px', color: '#CBD5E1' }}>${Number(pos.margin || 0).toFixed(2)}</td>
                    <td style={{ padding: '12px 10px', color: '#94A3B8', fontSize: '11px' }}>
                      {pos.stopLoss ? `SL: $${pos.stopLoss}` : 'No SL'} | {pos.takeProfit ? `TP: $${pos.takeProfit}` : 'No TP'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button
                        onClick={() => closePosition && closePosition(pos.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#EF4444',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 6. WATCHLIST & HALL OF FAME ROW ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* Watchlist Manager */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="#FACC15" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Trading Watchlist ({watchlist.length})
              </h3>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="+ Add symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  outline: 'none',
                  width: '130px'
                }}
              />
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '32px',
                  right: 0,
                  width: '240px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '6px',
                  zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}>
                  {searchResults.slice(0, 5).map(item => (
                    <div
                      key={item.symbol}
                      onClick={() => {
                        addToWatchlist(item.symbol);
                        setSearchQuery('');
                      }}
                      style={{
                        padding: '6px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{item.symbol}</span>
                      <span style={{ color: '#10B981', fontSize: '11px' }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {watchlist.map((sym) => {
              const info = WATCHLIST_DATABASE.find(d => d.symbol === sym) || { price: '--', change: '--' };
              return (
                <div
                  key={sym}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '11px',
                      color: '#38BDF8'
                    }}>
                      {sym.substring(0, 3)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{sym}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{info.name || 'Global Asset'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{info.price}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: (info.change || '').startsWith('+') ? '#10B981' : '#EF4444' }}>
                        {info.change}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/trading')}
                      style={{
                        background: '#10B981',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '5px 9px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Trade
                    </button>

                    <button
                      onClick={() => removeFromWatchlist(sym)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Remove from watchlist"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Verified Hall of Fame */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Medal size={18} color="#A855F7" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Verified Hall of Fame (Live Arena)
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>• Real-Time</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {realLeaderboard.slice(0, 5).map((trader, idx) => (
              <div
                key={trader.name || idx}
                style={{
                  background: trader.isSelf ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: trader.isSelf ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: idx === 0 ? '#FACC15' : idx === 1 ? '#CBD5E1' : idx === 2 ? '#D97706' : '#334155',
                    color: idx === 0 ? '#713F12' : '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{trader.name}</span>
                      {trader.isSelf && (
                        <span style={{ fontSize: '10px', background: '#10B981', color: '#042F2E', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: trader.color || '#94A3B8', fontWeight: 700 }}>
                      {trader.tag || 'Contender'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                    ${Number(trader.balance || 1000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700 }}>
                    DER {Number(trader.der || 85).toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BADGE DETAILS MODAL ─── */}
      {selectedBadge && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: '#0F172A',
            border: `1.5px solid ${selectedBadge.color}`,
            borderRadius: '20px',
            padding: '28px',
            maxWidth: '460px',
            width: '100%',
            position: 'relative',
            boxShadow: `0 16px 40px ${selectedBadge.color}33`
          }}>
            <button
              onClick={() => setSelectedBadge(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#FFFFFF',
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

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                position: 'relative',
                width: '76px',
                height: '76px',
                margin: '0 auto 12px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: selectedBadge.unlocked ? `linear-gradient(135deg, ${selectedBadge.color}, ${selectedBadge.color}66)` : '#334155',
                  clipPath: decagonClip,
                  boxShadow: selectedBadge.unlocked ? `0 0 20px ${selectedBadge.color}66` : 'none'
                }} />
                <div style={{
                  position: 'absolute',
                  inset: '3px',
                  background: '#0B0F19',
                  clipPath: decagonClip,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedBadge.unlocked ? (
                    <selectedBadge.icon size={30} color={selectedBadge.color} />
                  ) : (
                    <Lock size={26} color="#64748B" />
                  )}
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 800, color: selectedBadge.color, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Tier {selectedBadge.tier} Achievement #{selectedBadge.id}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '4px 0 2px 0' }}>
                {selectedBadge.name}
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                {selectedBadge.tagline}
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '18px',
              fontSize: '13px',
              color: '#CBD5E1',
              lineHeight: 1.5
            }}>
              {selectedBadge.desc}
            </div>

            {/* Live Progress */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
                <span>Status: {selectedBadge.unlocked ? 'Unlocked & Claimed' : 'Locked in Progress'}</span>
                <span>{selectedBadge.progressText}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: selectedBadge.unlocked ? '100%' : `${selectedBadge.progressPct}%`,
                  height: '100%',
                  background: selectedBadge.unlocked ? selectedBadge.color : '#38BDF8',
                  borderRadius: '6px'
                }} />
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FACC15' }}>Bounty Upon Unlock:</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#FFFFFF' }}>+{selectedBadge.coins} Gold Coins</span>
            </div>

            <button
              onClick={() => {
                setSelectedBadge(null);
                navigate('/trading');
              }}
              style={{
                width: '100%',
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Take Trade to Progress
            </button>
          </div>
        </div>
      )}

      {/* Pro Modal */}
      {showProModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: '#0F172A',
            border: '1.5px solid #FACC15',
            borderRadius: '20px',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowProModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Crown size={36} color="#FACC15" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                NonStock Pro Membership
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                ₹50 / 3 Months • All Tools & Badges Perks
              </p>
            </div>

            <div style={{ fontSize: '13px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Unlimited access to Technical Screener</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Global Macro Indices & Foreign Markets</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Strategy Lab Backtester & Market Replay</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>Golden Pro Badge in Public Hall of Fame</span>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success('Pro features are 100% active during your 60-day promotional window!');
                setShowProModal(false);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FACC15, #EAB308)',
                color: '#713F12',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              Enjoy 60-Day Free Platform Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
