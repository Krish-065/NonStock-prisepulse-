import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/api';

const TradingContext = createContext();

export const useTrading = () => useContext(TradingContext);

export const TradingProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(1000);
  const [coins, setCoins] = useState(() => (user?.gold_coins !== undefined ? Number(user.gold_coins) : 100));
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [isBusted, setIsBusted] = useState(false);
  const [watchlist, setWatchlist] = useState(['BTCUSDT', 'XAUUSD', 'EURUSD', 'AAPL', 'NVDA']);
  const [unlockedTools, setUnlockedTools] = useState({
    screener: false,
    strategyLab: false,
    aiMentor: false,
    replay: false
  });

  // 60-Day (2 Months) Free Access for all account holders
  const createdAtMs = user?.created_at ? new Date(user.created_at).getTime() : Date.now();
  const trialDurationMs = 60 * 24 * 60 * 60 * 1000; // 60 days
  const elapsedMs = Date.now() - createdAtMs;
  const isFreeGraceActive = elapsedMs < trialDurationMs;
  const trialDaysRemaining = isFreeGraceActive 
    ? Math.max(0, Math.ceil((trialDurationMs - elapsedMs) / (24 * 60 * 60 * 1000)))
    : 0;

  const effectiveUnlockedTools = {
    screener: Boolean(user?.is_pro || isFreeGraceActive || unlockedTools.screener),
    strategyLab: Boolean(user?.is_pro || isFreeGraceActive || unlockedTools.strategyLab),
    aiMentor: true, // Unrestricted AI Mentor per user requirements
    replay: Boolean(user?.is_pro || isFreeGraceActive || unlockedTools.replay),
    globalMarkets: true,
  };

  // Badge Logic
  const getBadge = (equity) => {
    const num = Number(equity) || 0;
    if (num >= 15000) return { name: 'Operator', color: '#A855F7', glow: '0 0 16px rgba(168, 85, 247, 0.6)' }; // Neon bright purple
    if (num >= 8000) return { name: 'Master', color: '#E11D48', glow: '0 0 14px rgba(225, 29, 72, 0.45)' }; // Ruby bright red
    if (num >= 4000) return { name: 'Gold', color: '#EAB308', glow: '0 0 14px rgba(234, 179, 8, 0.45)' }; // Yellow gold bright
    if (num >= 2000) return { name: 'Silver', color: '#94A3B8', glow: '0 0 10px rgba(148, 163, 184, 0.4)' }; // Silver color
    return { name: 'Contender', color: '#0F172A', glow: 'none' }; // Deep bold navy/slate
  };

  const badge = getBadge(balance);
  const [streakDays, setStreakDays] = useState(() => (user?.login_streak !== undefined ? Number(user.login_streak) : 1));

  // Sync Coins and Streak with backend PostgreSQL database
  const syncVaultAndStreak = async () => {
    if (!user) return;
    try {
      // 1. Process or verify daily login bonus via backend API
      const res = await apiClient.post('/paper/daily-claim');
      if (res.data?.success) {
        const { goldCoins, loginStreak, dailyReward } = res.data;
        if (typeof goldCoins === 'number') {
          setCoins(goldCoins);
        }
        if (typeof loginStreak === 'number') {
          setStreakDays(loginStreak);
          localStorage.setItem('nonstock_streak_count', loginStreak.toString());
        }
        if (dailyReward && !dailyReward.alreadyClaimed && dailyReward.coinsAwarded) {
          toast.success(dailyReward.message || `Day ${loginStreak} Discipline Streak: +${dailyReward.coinsAwarded} Gold Coins awarded!`);
        }
        return;
      }
    } catch (claimErr) {
      // 2. Fallback to portfolio endpoint
      try {
        const pRes = await apiClient.get('/paper/portfolio');
        if (pRes.data) {
          if (typeof pRes.data.goldCoins === 'number') {
            setCoins(pRes.data.goldCoins);
          }
          if (typeof pRes.data.loginStreak === 'number') {
            setStreakDays(pRes.data.loginStreak);
            localStorage.setItem('nonstock_streak_count', pRes.data.loginStreak.toString());
          }
        }
      } catch (pErr) {
        console.warn('Vault sync notice:', pErr.message);
      }
    }
  };

  // Sync on user change or login
  useEffect(() => {
    if (user?.gold_coins !== undefined) {
      setCoins(prev => Math.max(prev, Number(user.gold_coins)));
    }
    if (user?.login_streak !== undefined) {
      setStreakDays(prev => Math.max(prev, Number(user.login_streak)));
    }
    if (user?.id) {
      syncVaultAndStreak();
    }
  }, [user?.id, user?.gold_coins, user?.login_streak]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('nonstock_trading_state');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.balance !== undefined) setBalance(Number(parsed.balance) || 1000);
        if (parsed.coins !== undefined) {
          setCoins(prev => user?.gold_coins !== undefined ? Math.max(prev, Number(user.gold_coins)) : (Number(parsed.coins) || 100));
        }
        if (parsed.positions) setPositions(Array.isArray(parsed.positions) ? parsed.positions : []);
        if (parsed.history) setHistory(Array.isArray(parsed.history) ? parsed.history : []);
        if (parsed.hasSeenModal !== undefined) setHasSeenModal(Boolean(parsed.hasSeenModal));
        if (parsed.isBusted !== undefined) setIsBusted(Boolean(parsed.isBusted));
        if (parsed.watchlist) setWatchlist(Array.isArray(parsed.watchlist) ? parsed.watchlist : ['BTCUSDT', 'XAUUSD', 'EURUSD', 'AAPL', 'NVDA']);
        if (parsed.unlockedTools && typeof parsed.unlockedTools === 'object') {
          setUnlockedTools(prev => ({ ...prev, ...parsed.unlockedTools }));
        }
      }
    } catch (e) {
      console.error("Failed to parse trading state", e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('nonstock_trading_state', JSON.stringify({
      balance, coins, positions, history, hasSeenModal, isBusted, watchlist, unlockedTools
    }));
  }, [balance, coins, positions, history, hasSeenModal, isBusted, watchlist, unlockedTools]);

  const acknowledgeModal = () => setHasSeenModal(true);

  const placeOrder = (order) => {
    // order: { asset, side, type, size, leverage, entryPrice, sl, tp, margin }
    if (isBusted) {
      toast.error("Account busted. Please reset.");
      return;
    }
    if (balance < order.margin) {
      toast.error("Insufficient balance for this margin requirement.");
      return;
    }

    setBalance(prev => prev - order.margin);
    const newPosition = {
      ...order,
      id: Date.now().toString(),
      openTime: new Date().toISOString()
    };
    setPositions(prev => [...prev, newPosition]);

    // Gamification coin rewards
    let earnedCoins = 0;
    let reason = 'DISCIPLINE_BONUS';
    let desc = `Disciplined trade opened on ${order.asset}`;

    if (history.length === 0 && positions.length === 0) {
      earnedCoins += 25;
      reason = 'FIRST_TRADE';
      desc = 'First Blood Milestone: First trade executed';
      toast.success('First Blood Milestone! +25 Gold Coins');
    }
    if (order.sl && parseFloat(order.sl) > 0) {
      earnedCoins += 5;
      reason = 'DISCIPLINE_SL';
      desc = `Risk Disciplined: Trade placed on ${order.asset} with active Stop Loss protection`;
      toast.success('Discipline Bonus: SL Protection active! +5 Gold Coins');
    }

    if (earnedCoins > 0) {
      setCoins(prev => prev + earnedCoins);
      // Persist to database audit log
      apiClient.post('/paper/record-discipline-coins', {
        amount: earnedCoins,
        reason,
        description: desc
      }).catch(err => console.warn('Could not record discipline coins:', err.message));
    }

    toast.success(`Opened ${order.side} on ${order.asset}`);
  };

  const closePosition = (id, markPrice) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    // Calculate PnL
    const isLong = pos.side === 'LONG';
    const priceDiff = isLong ? (markPrice - pos.entryPrice) : (pos.entryPrice - markPrice);
    const pnl = priceDiff * pos.size;
    
    // Return margin + pnl
    const returnedValue = pos.margin + pnl;
    
    setBalance(prev => {
      const newBal = prev + returnedValue;
      if (newBal <= 0) {
        setIsBusted(true);
        toast.error("Account BUSTED! Equity reached 0.");
        return 0;
      }
      return newBal;
    });

    // Gamification reward for profitable trade
    if (pnl > 0) {
      setCoins(prev => prev + 10);
      toast.success(`Profitable Exit! +10 Gold Coins earned`);
      // Persist to database audit log
      apiClient.post('/paper/record-discipline-coins', {
        amount: 10,
        reason: 'TRADE_PROFIT',
        description: `Profitable trade exit on ${pos.asset} (+$${pnl.toFixed(2)})`
      }).catch(err => console.warn('Could not record profit coins:', err.message));
    }

    setPositions(prev => prev.filter(p => p.id !== id));
    setHistory(prev => [{
      ...pos,
      closePrice: markPrice,
      closeTime: new Date().toISOString(),
      pnl
    }, ...prev]);

    if (pnl >= 0) {
      toast.success(`Closed ${pos.asset} ${pos.side}. PnL: +$${pnl.toFixed(2)}`);
    } else {
      toast.error(`Closed ${pos.asset} ${pos.side}. PnL: -$${Math.abs(pnl).toFixed(2)}`);
    }
  };

  const updateSLTP = (id, sl, tp) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, sl, tp } : p));
    toast.success("SL/TP updated.");
  };

  const resetAccount = (useCoins = true) => {
    if (useCoins) {
      if (coins >= 100) {
        setCoins(prev => prev - 100);
        setBalance(1000);
        setPositions([]);
        setIsBusted(false);
        toast.success("Account reset! 100 coins deducted.");
        apiClient.post('/paper/record-discipline-coins', {
          amount: -100,
          reason: 'ACCOUNT_RESET',
          description: 'Account balance reset fee (-100 Gold Coins)'
        }).catch(() => {});
      } else {
        toast.error("Not enough Gold Coins (need 100).");
      }
    } else {
      // 24h cooldown simulated (for now instant reset but user keeps coins)
      setBalance(1000);
      setPositions([]);
      setIsBusted(false);
      toast.success("Account reset after cooldown.");
    }
  };

  const addToWatchlist = (sym) => {
    if (!sym) return;
    const clean = sym.toUpperCase().trim();
    if (watchlist.includes(clean)) {
      toast.error(`${clean} is already in your watchlist.`);
      return;
    }
    setWatchlist(prev => [clean, ...prev]);
    toast.success(`Added ${clean} to Watchlist`);
  };

  const removeFromWatchlist = (sym) => {
    setWatchlist(prev => prev.filter(s => s !== sym));
    toast.success(`Removed ${sym} from Watchlist`);
  };

  const unlockTool = async (toolKey, cost, toolName) => {
    if (effectiveUnlockedTools[toolKey]) {
      toast.success(`${toolName || toolKey} is already unlocked!`);
      return true;
    }
    if (coins < cost) {
      toast.error(`Not enough Gold Coins. Required: ${cost}, Current: ${coins}`);
      return false;
    }
    try {
      const res = await apiClient.post('/paper/unlock-tool', { toolKey, cost });
      if (res.data && !res.data.error) {
        if (typeof res.data.remainingCoins === 'number') {
          setCoins(res.data.remainingCoins);
        } else {
          setCoins(prev => Math.max(0, prev - cost));
        }
        setUnlockedTools(prev => ({ ...prev, [toolKey]: true }));
        toast.success(`${toolName || toolKey} unlocked! Added directly to your top navbar.`);
        return true;
      } else {
        toast.error(res.data?.error || 'Failed to unlock tool');
        return false;
      }
    } catch (e) {
      console.warn('Unlock tool API fallback:', e);
      setCoins(prev => Math.max(0, prev - cost));
      setUnlockedTools(prev => ({ ...prev, [toolKey]: true }));
      toast.success(`${toolName || toolKey} unlocked! Added directly to your top navbar.`);
      return true;
    }
  };

  return (
    <TradingContext.Provider value={{
      balance, coins, positions, history, hasSeenModal, isBusted, badge,
      watchlist, unlockedTools: effectiveUnlockedTools, streakDays,
      isFreeGraceActive, trialDaysRemaining,
      placeOrder, closePosition, updateSLTP, resetAccount, acknowledgeModal,
      addToWatchlist, removeFromWatchlist, unlockTool, syncVaultAndStreak
    }}>
      {children}
    </TradingContext.Provider>
  );
};
