import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const TradingContext = createContext();

export const useTrading = () => useContext(TradingContext);

export const TradingProvider = ({ children }) => {
  const [balance, setBalance] = useState(1000);
  const [coins, setCoins] = useState(100);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [isBusted, setIsBusted] = useState(false);

  // Badge Logic
  const getBadge = (equity) => {
    if (equity >= 15000) return { name: 'Operator', color: '#A855F7', glow: '0 0 10px #A855F7' }; // Neon purple
    if (equity >= 8000) return { name: 'Master', color: '#EF4444', glow: 'none' };
    if (equity >= 4000) return { name: 'Gold', color: '#F59E0B', glow: 'none' };
    if (equity >= 2000) return { name: 'Silver', color: '#94A3B8', glow: 'none' };
    return { name: 'Contender', color: '#64748B', glow: 'none' };
  };

  const badge = getBadge(balance);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('nonstock_trading_state');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.balance !== undefined) setBalance(parsed.balance);
        if (parsed.coins !== undefined) setCoins(parsed.coins);
        if (parsed.positions) setPositions(parsed.positions);
        if (parsed.history) setHistory(parsed.history);
        if (parsed.hasSeenModal !== undefined) setHasSeenModal(parsed.hasSeenModal);
        if (parsed.isBusted !== undefined) setIsBusted(parsed.isBusted);
      }
    } catch (e) {
      console.error("Failed to parse trading state", e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('nonstock_trading_state', JSON.stringify({
      balance, coins, positions, history, hasSeenModal, isBusted
    }));
  }, [balance, coins, positions, history, hasSeenModal, isBusted]);

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

    setPositions(prev => prev.filter(p => p.id !== id));
    setHistory(prev => [{
      ...pos,
      closePrice: markPrice,
      closeTime: new Date().toISOString(),
      pnl
    }, ...prev]);

    toast(`Closed ${pos.asset} ${pos.side}. PnL: $${pnl.toFixed(2)}`, { icon: pnl >= 0 ? '🤑' : '📉' });
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

  return (
    <TradingContext.Provider value={{
      balance, coins, positions, history, hasSeenModal, isBusted, badge,
      placeOrder, closePosition, updateSLTP, resetAccount, acknowledgeModal
    }}>
      {children}
    </TradingContext.Provider>
  );
};
