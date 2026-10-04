import { 
  Zap, Award, Target, Clock, ShieldCheck, Star, Trophy, 
  AlertCircle, BarChart2, Flame, Crown, Activity, Coins, 
  Medal, ShieldAlert, TrendingUp, TrendingDown 
} from 'lucide-react';

/**
 * NonStock 52 Institutional Badges Catalog
 * Decoupled from generic coin faucets:
 * - Exactly 15 elite/mastery badges have Rare Protocol Bounties (5 Intermediate, 10 Difficult/Elite)
 * - 37 badges are pure Honor Insignia & Mathematical Reputation Proofs (0 Coins)
 */
export const BADGES_CATALOG = [
  // ─── TIER 1: STARTER / INTRODUCTORY (1 - 10) ─── ALL 0 COINS (HONOR INSIGNIA)
  
  {
    id: 1,
    tier: 1,
    name: 'First Spark',
    tagline: 'Execute your 1st paper trade in the Arena',
    desc: 'Enter the market with conviction and log your first verified order.',
    coins: 25,
    hasBounty: true,
    theme: 'bull_candle',
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
    coins: 25,
    hasBounty: true,
    theme: 'bull_candle',
    name: 'Identity Confirmed',
    tagline: 'Customize your profile and avatar',
    desc: 'Establish your institutional trading handle with an avatar photo or banner.',
    icon: Award,
    color: '#059669',
    check: ({ hasAvatar }) => {
      return { unlocked: Boolean(hasAvatar), progress: hasAvatar ? 1 : 0, target: 1, text: hasAvatar ? 'Customized' : '0/1 set' };
    }
  },
  
  {
    id: 3,
    tier: 1,
    coins: 25,
    hasBounty: true,
    theme: 'diamond_hands',
    name: 'Radar Online',
    tagline: 'Add 3+ assets to your live Watchlist',
    desc: 'Organize your trading screens by tracking at least 3 global instruments.',
    icon: Target,
    color: '#0D9488',
    check: ({ watchlist }) => {
      const count = watchlist?.length || 0;
      return { unlocked: count >= 3, progress: Math.min(3, count), target: 3, text: `${Math.min(3, count)}/3 assets` };
    }
  },
  {
    id: 4,
    tier: 1,
    coins: 25,
    hasBounty: true,
    theme: 'sniper_scope',
    name: 'Patience Pays',
    tagline: 'Place your first Limit or Stop order',
    desc: 'Do not chase market prices. Command the price you want by queueing a pending order.',
    icon: Clock,
    color: '#0284C7',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const hasLimit = all.some(o => o.orderType === 'LIMIT' || o.type === 'LIMIT' || o.sl || o.tp);
      return { unlocked: hasLimit, progress: hasLimit ? 1 : 0, target: 1, text: hasLimit ? '1/1 Limit' : '0/1 placed' };
    }
  },
  
  {
    id: 5,
    tier: 1,
    coins: 25,
    hasBounty: true,
    theme: 'lightning_exec',
    name: 'Shields Up',
    tagline: 'Execute an order with Stop-Loss defined',
    desc: 'Professional capital preservation starts with pre-calculated downside limits.',
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
    coins: 25,
    hasBounty: true,
    theme: 'shield_sl',
    name: 'Profit Visionary',
    tagline: 'Set a Take-Profit target on a trade',
    desc: 'Lock in targets before emotion takes over during sudden volatility spikes.',
    icon: Star,
    color: '#F59E0B',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const hasTP = all.some(o => o.takeProfit || o.tp);
      return { unlocked: hasTP, progress: hasTP ? 1 : 0, target: 1, text: hasTP ? 'Target Set' : '0/1 TP set' };
    }
  },
  
  {
    id: 7,
    tier: 1,
    coins: 25,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'First Blood',
    tagline: 'Close your first trade in net profit',
    desc: 'The proving journey begins: take capital off the table into green territory.',
    icon: Trophy,
    color: '#10B981',
    check: ({ history }) => {
      const hasWin = (history || []).some(h => (h.pnl || h.profit || 0) > 0);
      return { unlocked: hasWin, progress: hasWin ? 1 : 0, target: 1, text: hasWin ? '1/1 Won' : '0/1 Win' };
    }
  },
  {
    id: 8,
    tier: 1,
    coins: 25,
    hasBounty: true,
    theme: 'bull_candle',
    name: 'Risk Conscious',
    tagline: 'Keep position risk under 5% of equity',
    desc: 'Never risk your sovereign desk on a single thesis. Size with precision.',
    icon: AlertCircle,
    color: '#059669',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const disciplined = all.some(o => (o.margin || 50) <= 100);
      return { unlocked: disciplined, progress: disciplined ? 1 : 0, target: 1, text: disciplined ? 'Disciplined' : '0/1 trade' };
    }
  },
  
  {
    id: 9,
    tier: 1,
    coins: 25,
    hasBounty: true,
    theme: 'risk_scale',
    name: 'Market Scholar',
    tagline: 'Examine both Long and Short order flows',
    desc: 'Trade bidirectionally: take both bullish and bearish setups when market conditions dictate.',
    icon: BarChart2,
    color: '#6366F1',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const hasLong = all.some(o => (o.side || o.type) === 'BUY' || (o.side || o.type) === 'LONG');
      const hasShort = all.some(o => (o.side || o.type) === 'SELL' || (o.side || o.type) === 'SHORT');
      const ok = hasLong && hasShort;
      return { unlocked: ok, progress: (hasLong ? 1 : 0) + (hasShort ? 1 : 0), target: 2, text: ok ? 'Dual-Sided' : `${(hasLong ? 1 : 0) + (hasShort ? 1 : 0)}/2 sides` };
    }
  },
  {
    id: 10,
    tier: 1,
    coins: 25,
    hasBounty: true,
    theme: 'order_block',
    name: 'Double Threat',
    tagline: 'Log 2 consecutive profitable exits',
    desc: 'Initial repeatability: back-to-back winners proving edge over randomness.',
    icon: Flame,
    color: '#10B981',
    check: ({ history }) => {
      let maxWinStreak = 0, curr = 0;
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0) {
          curr++;
          if (curr > maxWinStreak) maxWinStreak = curr;
        } else curr = 0;
      });
      return { unlocked: maxWinStreak >= 2, progress: Math.min(2, maxWinStreak), target: 2, text: `${Math.min(2, maxWinStreak)}/2 streak` };
    }
  },

  // ─── TIER 2: INTERMEDIATE (11 - 30) ─── EXACTLY 5 BOUNTIES, 15 HONOR INSIGNIA
  
  {
    id: 11,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'bull_candle',
    name: '5x Velocity',
    tagline: 'Score a trade with +400% (5x) profit return',
    desc: 'Capture asymmetrical convexity with extreme reward-to-risk ratio.',
    // BOUNTY 1
    icon: Zap,
    color: '#10B981',
    check: ({ history }) => {
      const had5x = (history || []).some(h => {
        const roi = h.margin ? ((h.pnl || h.profit || 0) / h.margin) * 100 : 0;
        return roi >= 400;
      });
      return { unlocked: had5x, progress: had5x ? 1 : 0, target: 1, text: had5x ? '5x Achieved' : '0/1 5x trade' };
    }
  },
  {
    id: 12,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'compound_curve',
    name: 'Triple Threat',
    tagline: 'Score 3 consecutive winning trades',
    desc: 'Three in a row: compounding disciplined gains without emotional overtrading.',
    icon: Flame,
    color: '#059669',
    check: ({ history }) => {
      let maxWinStreak = 0, curr = 0;
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0) {
          curr++;
          if (curr > maxWinStreak) maxWinStreak = curr;
        } else curr = 0;
      });
      return { unlocked: maxWinStreak >= 3, progress: Math.min(3, maxWinStreak), target: 3, text: `${Math.min(3, maxWinStreak)}/3 streak` };
    }
  },
  
  {
    id: 13,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'bull_candle',
    name: 'Iron Grip',
    tagline: 'Hold a winning position for > 4 hours',
    desc: 'Patience in winning trades: letting your mathematical edge play out without cutting winners prematurely.',
    icon: ShieldCheck,
    color: '#0284C7',
    check: ({ history }) => {
      const held = (history || []).some(h => {
        if ((h.pnl || h.profit || 0) <= 0) return false;
        const durMs = new Date(h.closeTime).getTime() - new Date(h.openTime).getTime();
        return durMs >= 4 * 60 * 60 * 1000;
      });
      return { unlocked: held, progress: held ? 1 : 0, target: 1, text: held ? 'Held >4h' : '0/1 trade' };
    }
  },
  {
    id: 14,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'shield_sl',
    name: 'Equity Prover',
    tagline: 'Reach $2,000 Equity (Silver Prover Tier)',
    desc: 'Double your baseline capital from $1,000 to $2,000 through pure order execution.',
    // BOUNTY 2
    icon: Award,
    color: '#64748B',
    check: ({ balance }) => {
      const bal = Number(balance) || 1000;
      return { unlocked: bal >= 2000, progress: Math.min(2000, Math.round(bal)), target: 2000, text: `$${Math.round(bal)} / $2,000` };
    }
  },
  
  {
    id: 15,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'Asset Diversifier',
    tagline: 'Trade across 3 different market asset classes',
    desc: 'Prove adaptability across Equities, Crypto, and Global FX.',
    icon: Target,
    color: '#8B5CF6',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const assets = new Set(all.map(o => (o.symbol || o.asset || '').toUpperCase()));
      return { unlocked: assets.size >= 3, progress: Math.min(3, assets.size), target: 3, text: `${Math.min(3, assets.size)}/3 classes` };
    }
  },
  {
    id: 16,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'risk_scale',
    name: 'Forex Navigator',
    tagline: 'Execute 5 trades on Currency pairs',
    desc: 'Master liquidity, spread management, and macro rates in foreign exchange.',
    icon: BarChart2,
    color: '#0D9488',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const fx = all.filter(o => ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'].includes((o.symbol || o.asset || '').toUpperCase())).length;
      return { unlocked: fx >= 5, progress: Math.min(5, fx), target: 5, text: `${Math.min(5, fx)}/5 FX trades` };
    }
  },
  
  {
    id: 17,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'order_block',
    name: 'Crypto Nomad',
    tagline: 'Execute 5 trades on BTC, ETH, or SOL',
    desc: 'Navigate high beta and weekend continuous liquidity feeds.',
    icon: Zap,
    color: '#F59E0B',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const crypto = all.filter(o => ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BTC', 'ETH'].includes((o.symbol || o.asset || '').toUpperCase())).length;
      return { unlocked: crypto >= 5, progress: Math.min(5, crypto), target: 5, text: `${Math.min(5, crypto)}/5 crypto trades` };
    }
  },
  {
    id: 18,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'lightning_exec',
    name: 'Equity Analyst',
    tagline: 'Execute 5 trades on AAPL, NVDA, or SPY',
    desc: 'Analyze balance sheets, earnings volatility, and institutional order books.',
    icon: TrendingUp,
    color: '#10B981',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const eq = all.filter(o => ['AAPL', 'NVDA', 'TSLA', 'SPY', 'QQQ'].includes((o.symbol || o.asset || '').toUpperCase())).length;
      return { unlocked: eq >= 5, progress: Math.min(5, eq), target: 5, text: `${Math.min(5, eq)}/5 equities` };
    }
  },
  
  {
    id: 19,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'order_block',
    name: 'Commodity Master',
    tagline: 'Trade Gold (XAUUSD) or Crude Oil (WTI)',
    desc: 'Demonstrate macro awareness trading physical reserve commodities.',
    icon: Star,
    color: '#D97706',
    check: ({ history, positions }) => {
      const all = [...(history || []), ...(positions || [])];
      const com = all.filter(o => ['XAUUSD', 'WTIUSD', 'GOLD', 'OIL'].includes((o.symbol || o.asset || '').toUpperCase())).length;
      return { unlocked: com >= 2, progress: Math.min(2, com), target: 2, text: `${Math.min(2, com)}/2 commodities` };
    }
  },
  {
    id: 20,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'bull_candle',
    name: 'Downside Architect',
    tagline: 'Never allow a loss exceeding -10% of portfolio',
    desc: 'Ironclad risk control: cut losers immediately and prevent tail-risk drawdowns.',
    icon: ShieldCheck,
    color: '#059669',
    check: ({ history }) => {
      const total = history?.length || 0;
      if (total < 5) return { unlocked: false, progress: total, target: 5, text: `${total}/5 trades to prove` };
      const hadBigLoss = (history || []).some(h => (h.pnl || h.profit || 0) <= -100);
      return { unlocked: !hadBigLoss, progress: hadBigLoss ? 0 : 5, target: 5, text: hadBigLoss ? 'Breached -10%' : 'Flawless Risk' };
    }
  },
  
  {
    id: 21,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'shield_sl',
    name: 'Sniper Precision',
    tagline: 'Close a trade with Risk-to-Reward ratio >= 1:3',
    desc: 'Pristine setup execution: risk $1 to extract $3+ from the market.',
    icon: Target,
    color: '#10B981',
    check: ({ history }) => {
      const sniper = (history || []).some(h => {
        if (!h.sl || !h.tp || !h.entryPrice) return false;
        const risk = Math.abs(h.entryPrice - h.sl);
        const reward = Math.abs(h.tp - h.entryPrice);
        return risk > 0 && (reward / risk) >= 3.0 && (h.pnl || h.profit || 0) > 0;
      });
      return { unlocked: sniper, progress: sniper ? 1 : 0, target: 1, text: sniper ? '1:3 Hit' : '0/1 sniper' };
    }
  },
  {
    id: 22,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'sniper_scope',
    name: 'Risk Invariance',
    tagline: 'Place 10 consecutive trades with verified Stop Loss',
    desc: 'Form the unbreakable institutional habit: never open naked market exposure.',
    // BOUNTY 3
    icon: ShieldCheck,
    color: '#059669',
    check: ({ history }) => {
      const total = history?.length || 0;
      const count = (history || []).filter(h => h.stopLoss || h.sl).length;
      return { unlocked: count >= 10, progress: Math.min(10, count), target: 10, text: `${Math.min(10, count)}/10 SL trades` };
    }
  },
  
  {
    id: 23,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'shield_sl',
    name: 'Capital Defender',
    tagline: 'Maintain positive equity after 10 closed trades',
    desc: 'Capital preservation verified: your account equity remains above the $1,000 baseline.',
    icon: Trophy,
    color: '#0284C7',
    check: ({ history, balance }) => {
      const count = history?.length || 0;
      const bal = Number(balance) || 1000;
      const ok = count >= 10 && bal >= 1000;
      return { unlocked: ok, progress: Math.min(10, count), target: 10, text: `${Math.min(10, count)}/10 trades (${bal >= 1000 ? '+$' : '-$'})` };
    }
  },
  {
    id: 24,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'shield_sl',
    name: 'Volume Pioneer',
    tagline: 'Transact $10,000 in cumulative trading volume',
    desc: 'Move five figures of liquidity across global order books.',
    icon: Activity,
    color: '#0D9488',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 10000, progress: Math.min(10000, Math.round(vol)), target: 10000, text: `$${Math.round(vol).toLocaleString()} / $10k` };
    }
  },
  
  {
    id: 25,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'compound_curve',
    name: 'Edge Replicator',
    tagline: 'Achieve win rate >= 60% across 15+ trades',
    desc: 'Statistically significant edge: prove that your methodology is non-random.',
    // BOUNTY 4
    icon: Crown,
    color: '#10B981',
    check: ({ history }) => {
      const total = history?.length || 0;
      if (total < 15) return { unlocked: false, progress: total, target: 15, text: `${total}/15 trades (need 60%+)` };
      const wins = history.filter(h => (h.pnl || h.profit || 0) > 0).length;
      const rate = Math.round((wins / total) * 100);
      return { unlocked: rate >= 60, progress: Math.min(60, rate), target: 60, text: `${rate}% / 60% win rate` };
    }
  },
  {
    id: 26,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'bull_candle',
    name: 'Night Watch',
    tagline: 'Manage an active swing position overnight (> 12 hours)',
    desc: 'Extend your timeframe: withstand overnight gaps and headline volatility with conviction.',
    icon: Clock,
    color: '#6366F1',
    check: ({ history }) => {
      const overnight = (history || []).some(h => {
        const durMs = new Date(h.closeTime).getTime() - new Date(h.openTime).getTime();
        return durMs >= 12 * 60 * 60 * 1000;
      });
      return { unlocked: overnight, progress: overnight ? 1 : 0, target: 1, text: overnight ? 'Swing Logged' : '0/1 overnight' };
    }
  },
  
  {
    id: 27,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'bull_candle',
    name: 'Disciplined Size',
    tagline: 'Execute 10 trades without exceeding 2x leverage',
    desc: 'Prudent risk management: avoid aggressive leverage traps that liquidate retail accounts.',
    icon: ShieldAlert,
    color: '#059669',
    check: ({ history }) => {
      const lowLev = (history || []).filter(h => (h.leverage || 1) <= 2).length;
      return { unlocked: lowLev >= 10, progress: Math.min(10, lowLev), target: 10, text: `${Math.min(10, lowLev)}/10 ≤2x trades` };
    }
  },
  {
    id: 28,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'risk_scale',
    name: 'Rebound Operator',
    tagline: 'Bounce back from 2 consecutive losses with a winner',
    desc: 'Tilt resistance: retain absolute mental clarity after consecutive adverse outcomes.',
    icon: Flame,
    color: '#F59E0B',
    check: ({ history }) => {
      let bounced = false;
      for (let i = 2; i < (history || []).length; i++) {
        const p0 = (history[i - 2].pnl || history[i - 2].profit || 0) < 0;
        const p1 = (history[i - 1].pnl || history[i - 1].profit || 0) < 0;
        const p2 = (history[i].pnl || history[i].profit || 0) > 0;
        if (p0 && p1 && p2) { bounced = true; break; }
      }
      return { unlocked: bounced, progress: bounced ? 1 : 0, target: 1, text: bounced ? 'Bounced back' : 'Requires 2L -> 1W' };
    }
  },
  
  {
    id: 29,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'bear_candle',
    name: 'Session Conductor',
    tagline: 'Conduct 5 winning trades across different weekdays',
    desc: 'Consistency across London, New York, and Asian market regimes.',
    icon: Target,
    color: '#0284C7',
    check: ({ history }) => {
      const days = new Set();
      (history || []).forEach(h => {
        if ((h.pnl || h.profit || 0) > 0 && h.closeTime) {
          days.add(new Date(h.closeTime).getDay());
        }
      });
      return { unlocked: days.size >= 4, progress: Math.min(4, days.size), target: 4, text: `${Math.min(4, days.size)}/4 weekdays` };
    }
  },
  {
    id: 30,
    tier: 2,
    coins: 50,
    hasBounty: true,
    theme: 'compound_curve',
    name: 'Century Volume',
    tagline: 'Transact $50,000 cumulative volume',
    desc: 'Surpass fifty thousand dollars of verified notional volume transacted.',
    // BOUNTY 5
    icon: Activity,
    color: '#0D9488',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 50000, progress: Math.min(50000, Math.round(vol)), target: 50000, text: `$${Math.round(vol).toLocaleString()} / $50k` };
    }
  },

  // ─── TIER 3: ADVANCED / ELITE & STREAKS (31 - 52) ─── EXACTLY 10 BOUNTIES, 12 HONOR INSIGNIA
  
  {
    id: 31,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'trade_streak',
    name: 'Discipline Ignition',
    tagline: '3-day active trading streak',
    desc: 'Execute disciplined market trades on 3 consecutive days.',
    // BOUNTY 6
    icon: Flame,
    color: '#10B981',
    check: ({ tradeStreak }) => {
      const s = tradeStreak || 0;
      return { unlocked: s >= 3, progress: Math.min(3, s), target: 3, text: `${Math.min(3, s)}/3 trading days` };
    }
  },
  {
    id: 32,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'trade_streak',
    name: 'Weekly Disciplined Operator',
    tagline: '1-week (7-day) continuous trading streak',
    desc: 'One full week of disciplined daily trade executions in the arena.',
    // BOUNTY 7
    icon: Flame,
    color: '#059669',
    check: ({ tradeStreak }) => {
      const s = tradeStreak || 0;
      return { unlocked: s >= 7, progress: Math.min(7, s), target: 7, text: `${Math.min(7, s)}/7 trading days` };
    }
  },
  
  {
    id: 33,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'trade_streak',
    name: 'Fortnight Fortress',
    tagline: '14-day continuous trading streak',
    desc: 'Two solid weeks of continuous daily disciplined trade execution.',
    icon: Flame,
    color: '#047857',
    check: ({ tradeStreak }) => {
      const s = tradeStreak || 0;
      return { unlocked: s >= 14, progress: Math.min(14, s), target: 14, text: `${Math.min(14, s)}/14 trading days` };
    }
  },
  {
    id: 34,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'trade_streak',
    name: 'Habit of Champions',
    tagline: '21-day continuous trading streak',
    desc: 'Neuroplastic routine: 21 consecutive days of disciplined trading.',
    icon: Flame,
    color: '#065F46',
    check: ({ tradeStreak }) => {
      const s = tradeStreak || 0;
      return { unlocked: s >= 21, progress: Math.min(21, s), target: 21, text: `${Math.min(21, s)}/21 trading days` };
    }
  },
  
  {
    id: 35,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'trade_streak',
    name: 'Monthly Trade Titan',
    tagline: '30-day continuous trading streak',
    desc: 'One uninterrupted calendar month of daily trading presence.',
    // BOUNTY 8
    icon: Crown,
    color: '#EAB308',
    check: ({ tradeStreak }) => {
      const s = tradeStreak || 0;
      return { unlocked: s >= 30, progress: Math.min(30, s), target: 30, text: `${Math.min(30, s)}/30 trading days` };
    }
  },
  {
    id: 36,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'trade_streak',
    name: 'Unshakeable Habit',
    tagline: '60-day continuous trading streak',
    desc: 'Two full months without missing a single day of active disciplined trading.',
    icon: Crown,
    color: '#CA8A04',
    check: ({ tradeStreak }) => {
      const s = tradeStreak || 0;
      return { unlocked: s >= 60, progress: Math.min(60, s), target: 60, text: `${Math.min(60, s)}/60 trading days` };
    }
  },
  
  {
    id: 37,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'trade_streak',
    name: 'Centurion Nomad',
    tagline: '100-day daily trading streak',
    desc: 'Triple-digit milestone: 100 days of ironclad trading execution.',
    // BOUNTY 9
    icon: Trophy,
    color: '#854D0E',
    check: ({ tradeStreak }) => {
      const s = tradeStreak || 0;
      return { unlocked: s >= 100, progress: Math.min(100, s), target: 100, text: `${Math.min(100, s)}/100 trading days` };
    }
  },
  {
    id: 38,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'master_titan',
    name: 'Apex Predator',
    tagline: 'Score 5 consecutive winning trades',
    desc: 'Five consecutive winners without a single drawdown exit.',
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
    coins: 100,
    hasBounty: true,
    theme: 'apex_crown',
    name: 'Septa-Strike',
    tagline: '7 consecutive winning trades',
    desc: 'Seven consecutive green prints across any market environment.',
    icon: Flame,
    color: '#059669',
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
    coins: 100,
    hasBounty: true,
    theme: 'bull_candle',
    name: 'Deca-Strike Legend',
    tagline: '10 consecutive winning trades without a loss',
    desc: 'Ten wins in a row. Elite probability engineering and zero tilt.',
    // BOUNTY 10
    icon: Crown,
    color: '#047857',
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
    coins: 100,
    hasBounty: true,
    theme: 'apex_crown',
    name: 'Battle Tested',
    tagline: 'Execute 50 total lifetime trades',
    desc: 'Solidify your track record across fifty unique market setups.',
    icon: ShieldCheck,
    color: '#10B981',
    check: ({ history, positions }) => {
      const total = (history?.length || 0) + (positions?.length || 0);
      return { unlocked: total >= 50, progress: Math.min(50, total), target: 50, text: `${Math.min(50, total)}/50 trades` };
    }
  },
  {
    id: 42,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'Century Operator',
    tagline: 'Execute 100 total lifetime trades',
    desc: 'One hundred trades executed. A statistically significant sample size.',
    icon: Award,
    color: '#059669',
    check: ({ history, positions }) => {
      const total = (history?.length || 0) + (positions?.length || 0);
      return { unlocked: total >= 100, progress: Math.min(100, total), target: 100, text: `${Math.min(100, total)}/100 trades` };
    }
  },
  
  {
    id: 43,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'Market Veteran',
    tagline: 'Execute 250 lifetime trades',
    desc: 'Quarter of a thousand trades. Hardened against market noise and whipsaws.',
    icon: Medal,
    color: '#047857',
    check: ({ history, positions }) => {
      const total = (history?.length || 0) + (positions?.length || 0);
      return { unlocked: total >= 250, progress: Math.min(250, total), target: 250, text: `${Math.min(250, total)}/250 trades` };
    }
  },
  {
    id: 44,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'master_titan',
    name: 'Six-Figure Flow',
    tagline: 'Transact $100,000 cumulative volume',
    desc: 'Surpass six figures of trading liquidity managed in the arena.',
    icon: Coins,
    color: '#EAB308',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 100000, progress: Math.min(100000, Math.round(vol)), target: 100000, text: `$${Math.round(vol).toLocaleString()} / $100k` };
    }
  },
  
  {
    id: 45,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'Half-Million Mover',
    tagline: 'Transact $500,000 cumulative volume',
    desc: 'Move half a million dollars of cumulative notional exposure.',
    icon: Activity,
    color: '#D97706',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 500000, progress: Math.min(500000, Math.round(vol)), target: 500000, text: `$${Math.round(vol).toLocaleString()} / $500k` };
    }
  },
  {
    id: 46,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'Million Dollar Desk',
    tagline: 'Transact $1,000,000 cumulative turnover',
    desc: 'Institutional scale: Seven figures of total trading turnover executed.',
    // BOUNTY 11
    icon: Crown,
    color: '#CA8A04',
    check: ({ history }) => {
      const vol = (history || []).reduce((sum, h) => sum + (h.size || 1) * (h.entryPrice || 100), 0);
      return { unlocked: vol >= 1000000, progress: Math.min(1000000, Math.round(vol)), target: 1000000, text: `$${Math.round(vol).toLocaleString()} / $1M` };
    }
  },
  
  {
    id: 47,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'Ruby Master',
    tagline: 'Ascend to Master Rank ($8,000 equity)',
    desc: '8x portfolio growth from $1,000. Earn the elite Ruby Master Insignia.',
    // BOUNTY 12
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
    coins: 100,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'Apex Operator',
    tagline: 'Ascend to Operator Rank ($15,000 equity)',
    desc: '15x your starting capital. Attain the highest sovereign rank on NonStock.',
    // BOUNTY 13
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
    coins: 100,
    hasBounty: true,
    theme: 'apex_crown',
    name: 'Triple 10x Titan',
    tagline: 'Score 3 separate 10x (+900%) ROI trades',
    desc: 'Prove that your 10x return was not luck: replicate it three separate times.',
    // BOUNTY 14
    icon: Flame,
    color: '#10B981',
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
    coins: 100,
    hasBounty: true,
    theme: 'master_titan',
    name: 'Phoenix Resurrection',
    tagline: 'Recover from a -20% drawdown to a new equity high',
    desc: 'Psychological resilience: bounce back from deep red to peak capital.',
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
    coins: 100,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'Discipline Paragon',
    tagline: 'Achieve DER Discipline Rating >= 90 over 20+ trades',
    desc: 'Never breach risk rules. High risk-reward, consistent sizing, and flawless stops.',
    icon: ShieldCheck,
    color: '#10B981',
    check: ({ history }) => {
      const count = history?.length || 0;
      if (count < 20) return { unlocked: false, progress: count, target: 20, text: `${count}/20 trades (need 90+ DER)` };
      const slCount = history.filter(h => h.stopLoss || h.sl).length;
      const derScore = Math.round((slCount / count) * 100);
      return { unlocked: derScore >= 90, progress: Math.min(90, derScore), target: 90, text: `${derScore}/90 DER score` };
    }
  },
  {
    id: 52,
    tier: 3,
    coins: 100,
    hasBounty: true,
    theme: 'gold_vault',
    name: 'NonStock Grandmaster',
    tagline: 'Complete 50+ trades, win rate >= 75%, and unlock 30+ badges',
    desc: 'The pinnacle of trading prowess. Reserved for the absolute top 0.1% on NonStock.',
    // BOUNTY 15
    icon: Crown,
    color: '#059669',
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

/**
 * Dedicated Discipline Tasks Desk
 * Daily actionable habits that distribute Gold Coins completely independently from badges.
 */
export const DISCIPLINE_TASKS = [
  {
    id: 'login_streak_checkin',
    title: 'Daily Terminal Login Streak',
    desc: 'Verify daily terminal attendance to collect daily login bonus (+10 Coins).',
    coins: 10,
    icon: Flame,
    check: ({ loginStreak }) => ({
      completed: (loginStreak || 1) >= 1,
      progress: 1,
      target: 1,
      statusText: `${loginStreak || 1}-Day Login Streak (+10 Coins)`
    })
  },
  {
    id: 'trade_streak_execution',
    title: 'Daily Trade Streak Execution',
    desc: 'Execute at least 1 trade today to advance Trade Streak (+10 Coins & Badges).',
    coins: 10,
    icon: Zap,
    check: ({ tradeStreak, hasTradedToday }) => ({
      completed: Boolean(hasTradedToday || (tradeStreak || 0) > 0),
      progress: (hasTradedToday || (tradeStreak || 0) > 0) ? 1 : 0,
      target: 1,
      statusText: `${tradeStreak || 0}-Day Trade Streak Active (+10 Coins)`
    })
  },
  {
    id: 'watchlist_audit',
    title: 'Pre-Market Watchlist Surveillance',
    desc: 'Maintain active surveillance on at least 3 global instruments.',
    coins: 10,
    icon: Target,
    check: ({ watchlist }) => {
      const c = watchlist?.length || 0;
      return {
        completed: c >= 3,
        progress: Math.min(3, c),
        target: 3,
        statusText: `${c}/3 Instruments Monitored`
      };
    }
  },
  {
    id: 'sl_invariance',
    title: 'Risk Invariance (Stop Loss Mandatory)',
    desc: 'Execute trades with active Stop Loss protection (never risk naked equity).',
    coins: 15,
    icon: ShieldCheck,
    check: ({ positions, history }) => {
      const allTrades = [...(positions || []), ...(history || [])];
      if (allTrades.length === 0) return { completed: false, progress: 0, target: 1, statusText: '0/1 SL Protected Trade' };
      const slProtected = allTrades.filter(t => t.stopLoss || t.sl).length;
      return {
        completed: slProtected >= 1,
        progress: Math.min(1, slProtected),
        target: 1,
        statusText: slProtected >= 1 ? 'SL Invariance Active' : 'Awaiting Protected Trade'
      };
    }
  },
  {
    id: 'anti_overtrading',
    title: 'Anti-Overtrading Protocol',
    desc: 'Practice emotional restraint: maintain ≤ 5 closed orders per day (zero tilt).',
    coins: 20,
    icon: Activity,
    check: ({ history }) => {
      const today = new Date().toISOString().slice(0, 10);
      const todaysTrades = (history || []).filter(h => (h.closeTime || '').slice(0, 10) === today).length;
      const isCompliant = todaysTrades <= 5;
      return {
        completed: isCompliant,
        progress: Math.min(5, todaysTrades),
        target: 5,
        statusText: `${todaysTrades}/5 Executions Today`
      };
    }
  },
  {
    id: 'sniper_exit',
    title: 'Execution Edge Profit Target',
    desc: 'Close at least one position in verified net green profit.',
    coins: 20,
    icon: TrendingUp,
    check: ({ history }) => {
      const wins = (history || []).filter(h => (h.pnl || h.profit || 0) > 0).length;
      return {
        completed: wins >= 1,
        progress: Math.min(1, wins),
        target: 1,
        statusText: wins >= 1 ? `${wins} Green Exits Verified` : '0/1 Profitable Exit'
      };
    }
  }
];
