import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const TradingContext = createContext();

export const useTrading = () => useContext(TradingContext);

export const TradingProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(1000);
  const [coins, setCoins] = useState(100);
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
    return { name: 'Contender', color: '#0F172A', glow: 'none' }; // Deep bold navy/slate (NEVER silver)
  };

  const badge = getBadge(balance);
  const [streakDays, setStreakDays] = useState(1);

  // Daily Streak Claim - strictly once per calendar day (not on repeat logins on same day)
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const savedClaim = localStorage.getItem('nonstock_last_daily_claim');
      const savedStreak = parseInt(localStorage.getItem('nonstock_streak_count') || '1', 10);

      if (!savedClaim) {
        localStorage.setItem('nonstock_last_daily_claim', todayStr);
        localStorage.setItem('nonstock_streak_count', '1');
        setStreakDays(1);
        setCoins(prev => prev + 25);
        toast.success('Daily Discipline Bonus: +25 Gold Coins awarded to your vault!');
      } else if (savedClaim !== todayStr) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = savedClaim === yesterday ? savedStreak + 1 : 1;
        localStorage.setItem('nonstock_last_daily_claim', todayStr);
        localStorage.setItem('nonstock_streak_count', newStreak.toString());
        setStreakDays(newStreak);
        setCoins(prev => prev + 25);
        toast.success(`Day ${newStreak} Discipline Streak: +25 Gold Coins awarded!`);
      } else {
        setStreakDays(savedStreak || 1);
      }
    } catch (e) {
      console.warn('Daily streak check note:', e);
    }
  }, []);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('nonstock_trading_state');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.balance !== undefined) setBalance(Number(parsed.balance) || 1000);
        if (parsed.coins !== undefined) setCoins(Number(parsed.coins) || 0);
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
    if (history.length === 0 && positions.length === 0) {
      earnedCoins += 25;
      toast.success('First Blood Milestone! +25 Gold Coins');
    }
    if (order.sl && parseFloat(order.sl) > 0) {
      earnedCoins += 5;
      toast.success('Discipline Bonus: SL Protection active! +5 Gold Coins');
    }
    if (earnedCoins > 0) {
      setCoins(prev => prev + earnedCoins);
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
    toast.success(`Added ${clean} to Watchlist`, { icon: '⭐' });
  };

  const removeFromWatchlist = (sym) => {
    setWatchlist(prev => prev.filter(s => s !== sym));
    toast.success(`Removed ${sym} from Watchlist`);
  };

  const unlockTool = (toolKey, cost, toolName) => {
    if (effectiveUnlockedTools[toolKey]) {
      toast.success(`${toolName || toolKey} is already unlocked!`);
      return true;
    }
    if (coins < cost) {
      toast.error(`Not enough Gold Coins. Required: ${cost}, Current: ${coins}`);
      return false;
    }
    setCoins(prev => prev - cost);
    setUnlockedTools(prev => ({ ...prev, [toolKey]: true }));
    toast.success(`${toolName || toolKey} unlocked! Added directly to your top navbar.`);
    return true;
  };

  return (
    <TradingContext.Provider value={{
      balance, coins, positions, history, hasSeenModal, isBusted, badge,
      watchlist, unlockedTools: effectiveUnlockedTools, streakDays,
      isFreeGraceActive, trialDaysRemaining,
      placeOrder, closePosition, updateSLTP, resetAccount, acknowledgeModal,
      addToWatchlist, removeFromWatchlist, unlockTool
    }}>
      {children}
    </TradingContext.Provider>
  );
};
