const { query } = require('../db/index');
const crypto = require('crypto');

/**
 * NonStock Dynamic Gamification Service
 * Handles real-time Gold Coins, Streaks, Discipline Tasks, Badges, and Verified Leaderboard
 */

// 1. Award or Deduct Gold Coins with full audit logging
async function awardCoins(userId, amount, reason, description) {
  try {
    const userRes = await query('SELECT gold_coins FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return null;

    const currentCoins = parseInt(userRes.rows[0].gold_coins || 0);
    const newCoins = Math.max(0, currentCoins + amount);

    await query('UPDATE users SET gold_coins = $1 WHERE id = $2', [newCoins, userId]);

    // Insert audit log
    await query(
      'INSERT INTO coin_transactions (id, user_id, amount, reason, description) VALUES ($1, $2, $3, $4, $5)',
      [crypto.randomUUID(), userId, amount, reason, description || reason]
    );

    return {
      newBalance: newCoins,
      coinsAwarded: amount,
      reason,
      description
    };
  } catch (err) {
    console.error('❌ Gamification awardCoins error:', err);
    return null;
  }
}

// 2. Process Daily Login Reward & Streak
async function processLoginReward(userId) {
  try {
    const userRes = await query(
      `SELECT 
        id, 
        gold_coins, 
        login_streak, 
        last_login_date,
        to_char(last_login_date, 'YYYY-MM-DD') as last_login_str,
        to_char(CURRENT_DATE, 'YYYY-MM-DD') as today_str,
        (CURRENT_DATE - last_login_date) as diff_days 
      FROM users WHERE id = $1`,
      [userId]
    );
    if (userRes.rows.length === 0) return null;

    const user = userRes.rows[0];
    const diffDays = user.diff_days !== null && user.diff_days !== undefined ? parseInt(user.diff_days) : null;
    const currentStreak = parseInt(user.login_streak || 1);
    const currentCoins = parseInt(user.gold_coins || 100);

    // If diff_days is 0, user already claimed reward today
    if (diffDays === 0) {
      return {
        alreadyClaimed: true,
        streak: currentStreak,
        currentCoins: currentCoins,
        message: 'Daily login bonus already claimed for today'
      };
    }

    // Determine streak
    let newStreak = 1;
    if (diffDays === 1) {
      // Exactly consecutive day
      newStreak = currentStreak + 1;
    } else if (diffDays === null || user.last_login_date === null) {
      // First ever claim
      newStreak = Math.max(1, currentStreak);
    } else {
      // Streak broken (diffDays > 1)
      newStreak = 1;
    }

    // Base daily reward: +10 coins on login streak (as requested: 5-10 coins on login, no badges on login streak)
    let coinsEarned = 10;
    let bonusNote = `Day ${newStreak} Daily Login Bonus (+10 Coins)`;

    if (newStreak >= 7) {
      bonusNote = `${newStreak}-Day Consecutive Login Streak (+10 Coins)!`;
    }

    // Update user record
    const updatedCoins = currentCoins + coinsEarned;
    await query(
      'UPDATE users SET gold_coins = $1, login_streak = $2, last_login_date = CURRENT_DATE WHERE id = $3',
      [updatedCoins, newStreak, userId]
    );

    // Audit log
    await query(
      'INSERT INTO coin_transactions (id, user_id, amount, reason, description) VALUES ($1, $2, $3, $4, $5)',
      [crypto.randomUUID(), userId, coinsEarned, 'DAILY_LOGIN', bonusNote]
    );

    return {
      alreadyClaimed: false,
      coinsAwarded: coinsEarned,
      streak: newStreak,
      newBalance: updatedCoins,
      message: bonusNote
    };
  } catch (err) {
    console.error('❌ Gamification processLoginReward error:', err);
    return null;
  }
}

// 3. Process Reward When User Places a Trade (Separate Trade Streak & Milestone Badges)
async function processTradeOpenReward(userId, { stopLoss, symbol }) {
  try {
    const userRes = await query(
      `SELECT 
        total_trades_count, 
        trade_streak, 
        last_trade_date,
        (CURRENT_DATE - last_trade_date) as diff_trade_days 
       FROM users WHERE id = $1`, 
      [userId]
    );
    const user = userRes.rows[0];
    const totalTrades = parseInt(user?.total_trades_count || 0);
    const currentTradeStreak = parseInt(user?.trade_streak || 0);
    const diffTradeDays = user?.diff_trade_days !== null && user?.diff_trade_days !== undefined ? parseInt(user.diff_trade_days) : null;

    const rewards = [];

    // Award First Blood badge if this is trade #1
    if (totalTrades === 0) {
      await awardBadge(userId, 'first_blood', 'First Blood', 'Executed your very first live simulated proving trade');
      await awardCoins(userId, 25, 'FIRST_TRADE', 'Welcome to the Trading Arena (+25 Coins)');
      rewards.push({ coins: 25, reason: 'First Trade Milestone (+25 Coins)' });
    }

    // Distinct Trade Streak Engine: awards +10 Coins per active trading day, plus 1-Week Badge
    if (diffTradeDays !== 0) {
      let newTradeStreak = 1;
      if (diffTradeDays === 1) {
        newTradeStreak = currentTradeStreak + 1;
      } else {
        newTradeStreak = 1;
      }

      await query(
        'UPDATE users SET trade_streak = $1, last_trade_date = CURRENT_DATE WHERE id = $2',
        [newTradeStreak, userId]
      );

      await awardCoins(userId, 10, 'TRADE_STREAK', `Day ${newTradeStreak} Trading Streak Bonus (+10 Coins)`);
      rewards.push({ coins: 10, tradeStreak: newTradeStreak, reason: `Day ${newTradeStreak} Trade Streak (+10 Coins)` });

      // Badge must be given on the basis of trade streak (especially on 1-week / 7-day trade streak)
      if (newTradeStreak === 7) {
        await awardBadge(userId, 'weekly_iron_will', 'Weekly Disciplined Operator', 'Executed disciplined trades across a continuous 1-week (7-day) trade streak');
        rewards.push({ badge: 'weekly_iron_will', reason: '🏆 1-Week Trade Streak Badge Earned!' });
      }
    }

    // Reward disciplined risk management (Stop Loss set)
    if (stopLoss && parseFloat(stopLoss) > 0) {
      await awardCoins(userId, 5, 'DISCIPLINE_SL', `Risk Disciplined: Trade placed on ${symbol} with active Stop Loss protection`);
      rewards.push({ coins: 5, reason: 'Discipline Bonus: Stop Loss Protected (+5 Coins)' });
    }

    return rewards;
  } catch (err) {
    console.error('❌ Gamification processTradeOpenReward error:', err);
    return [];
  }
}

// 4. Process Reward When User Closes a Trade
async function processTradeCloseReward(userId, { pnl, isProfit, symbol, rrr }) {
  try {
    const userRes = await query(
      'SELECT total_trades_count, winning_trades_count, consecutive_wins, virtual_balance FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) return null;

    let totalTrades = parseInt(userRes.rows[0].total_trades_count || 0) + 1;
    let winningTrades = parseInt(userRes.rows[0].winning_trades_count || 0);
    let consecutiveWins = parseInt(userRes.rows[0].consecutive_wins || 0);
    const balance = parseFloat(userRes.rows[0].virtual_balance || 1000);

    const earnedRewards = [];

    if (isProfit || pnl > 0) {
      winningTrades += 1;
      consecutiveWins += 1;

      // Base win coins
      await awardCoins(userId, 10, 'TRADE_PROFIT', `Profitable trade exit on ${symbol} (+$${pnl.toFixed(2)})`);
      earnedRewards.push({ coins: 10, reason: 'Profitable Trade Exit (+10 Coins)' });

      // Streak milestones
      if (consecutiveWins === 3) {
        await awardCoins(userId, 30, 'WIN_STREAK_3', 'Triple Threat: 3 consecutive winning trades (+30 Coins)');
        earnedRewards.push({ coins: 30, reason: 'Triple Threat Streak (+30 Coins)' });
      } else if (consecutiveWins === 5) {
        await awardCoins(userId, 75, 'WIN_STREAK_5', 'Apex Predator: 5 consecutive winning trades (+75 Coins)');
        await awardBadge(userId, 'apex_trader', 'Apex Predator', 'Maintained 5 consecutive profitable trades without drawdown');
        earnedRewards.push({ coins: 75, reason: 'Apex Predator Streak (+75 Coins)' });
      }

      // Sniper Entry if R:R >= 2
      if (rrr && parseFloat(rrr) >= 2.0) {
        await awardCoins(userId, 20, 'SNIPER_ENTRY', `Sniper Execution: Achieved 1:${rrr} Risk-to-Reward ratio (+20 Coins)`);
        await awardBadge(userId, 'sniper_entry', 'Sniper Entry', `Hit profit target with a pristine 1:${rrr} Risk/Reward ratio`);
        earnedRewards.push({ coins: 20, reason: `Sniper Entry 1:${rrr} (+20 Coins)` });
      }
    } else {
      consecutiveWins = 0;
    }

    // Dynamic DER / CPR Score Calculation
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 70;
    // Score combines win rate (50%), portfolio growth vs $1000 (30%), and base consistency (20%)
    const growthRatio = Math.max(0, Math.min(2.5, balance / 1000));
    const rawDer = (winRate * 0.5) + (growthRatio * 20) + 15;
    const derScore = parseFloat(Math.min(99.4, Math.max(50.0, rawDer)).toFixed(1));

    // Dynamic Rank Tag Allocation based strictly on the 5 Decagon Tiers
    let accountTag = 'Contender';
    if (balance >= 15000) {
      accountTag = 'Apex Operator';
    } else if (balance >= 8000) {
      accountTag = 'Master Titan';
    } else if (balance >= 4000) {
      accountTag = 'Gold Sovereign';
    } else if (balance >= 2000) {
      accountTag = 'Silver Prover';
    } else {
      accountTag = 'Contender';
    }

    // Update user stats
    await query(
      `UPDATE users 
       SET total_trades_count = $1, 
           winning_trades_count = $2, 
           consecutive_wins = $3, 
           der_score = $4, 
           account_tag = $5 
       WHERE id = $6`,
      [totalTrades, winningTrades, consecutiveWins, derScore, accountTag, userId]
    );

    return {
      earnedRewards,
      totalTrades,
      winningTrades,
      consecutiveWins,
      derScore,
      accountTag
    };
  } catch (err) {
    console.error('❌ Gamification processTradeCloseReward error:', err);
    return null;
  }
}

// 5. Award a Verified Badge
async function awardBadge(userId, badgeId, title, description) {
  try {
    const existing = await query(
      'SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2',
      [userId, badgeId]
    );
    if (existing.rows.length > 0) return false;

    await query(
      'INSERT INTO user_badges (id, user_id, badge_id, title, description, earned_year) VALUES ($1, $2, $3, $4, $5, $6)',
      [crypto.randomUUID(), userId, badgeId, title, description, new Date().getFullYear()]
    );
    return true;
  } catch (err) {
    console.error('❌ Gamification awardBadge error:', err);
    return false;
  }
}

// 6. Get User Badges
async function getUserBadges(userId) {
  try {
    const res = await query(
      'SELECT badge_id as "badgeId", title, description, earned_at as "earnedAt", earned_year as "earnedYear" FROM user_badges WHERE user_id = $1 ORDER BY earned_at DESC',
      [userId]
    );

    // If user has no badges yet, grant initial 'contender_verified'
    if (res.rows.length === 0) {
      await awardBadge(userId, 'contender_verified', 'Contender Verified', 'Officially verified participant in NonStock Proving Arena');
      return [{
        badgeId: 'contender_verified',
        title: 'Contender Verified',
        description: 'Officially verified participant in NonStock Proving Arena',
        earnedAt: new Date().toISOString(),
        earnedYear: new Date().getFullYear()
      }];
    }

    return res.rows;
  } catch (err) {
    console.error('❌ Gamification getUserBadges error:', err);
    return [];
  }
}

// 7. Get 100% Real Verified Leaderboard (NO FAKE / BOTS)
async function getRealLeaderboard() {
  try {
    const res = await query(
      `SELECT 
         u.id, 
         u.name, 
         COALESCE(u.account_tag, 'Contender') as "accountTag", 
         COALESCE(u.der_score, 75.00) as "derScore", 
         COALESCE(u.virtual_balance, 1000.00) as "virtualBalance", 
         COALESCE(u.gold_coins, 100) as "goldCoins",
         COALESCE(u.is_pro, false) as "isPro",
         COALESCE(u.total_trades_count, 0) as "totalTrades",
         COALESCE(u.winning_trades_count, 0) as "winningTrades"
       FROM users u
       WHERE u.name IS NOT NULL 
         AND TRIM(u.name) != ''
         AND LOWER(u.name) NOT LIKE '%tester%'
         AND LOWER(u.name) NOT LIKE '%test%'
         AND LOWER(u.name) NOT LIKE '%dummy%'
         AND LOWER(u.email) NOT LIKE '%test%'
         AND LOWER(u.email) NOT LIKE '%tester%'
         AND LOWER(u.email) NOT LIKE '%demo%'
         AND LOWER(u.email) NOT LIKE '%bot%'
       ORDER BY u.der_score DESC, u.virtual_balance DESC
       LIMIT 50`
    );

    return res.rows.map((user, index) => {
      const bal = parseFloat(user.virtualBalance) || 1000.00;
      let tag = 'Contender';
      let color = '#059669'; // Contender emerald green

      if (bal >= 15000) {
        tag = 'Apex Operator';
        color = '#A855F7'; // Neon bright purple
      } else if (bal >= 8000) {
        tag = 'Master Titan';
        color = '#E11D48'; // Ruby bright red
      } else if (bal >= 4000) {
        tag = 'Gold Sovereign';
        color = '#EAB308'; // Yellow gold bright
      } else if (bal >= 2000) {
        tag = 'Silver Prover';
        color = '#64748B'; // Silver color
      } else {
        tag = 'Contender';
        color = '#059669'; // Contender emerald green
      }

      return {
        rank: index + 1,
        id: user.id,
        name: user.name || 'Verified Trader',
        tag,
        color,
        der: parseFloat(user.derScore || 75.0),
        balance: bal,
        coins: parseInt(user.goldCoins || 100),
        isPro: Boolean(user.isPro),
        trades: parseInt(user.totalTrades || 0),
        wins: parseInt(user.winningTrades || 0)
      };
    });
  } catch (err) {
    console.error('❌ Gamification getRealLeaderboard error:', err);
    return [];
  }
}

// 8. Unlock Tool with Gold Coins
async function unlockToolWithCoins(userId, toolKey, cost) {
  try {
    const userRes = await query('SELECT gold_coins FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return { error: 'User not found' };

    const currentCoins = parseInt(userRes.rows[0].gold_coins || 0);
    if (currentCoins < cost) {
      return { error: `Insufficient Gold Coins. You have ${currentCoins}, but ${cost} are required.` };
    }

    // Deduct coins
    const newCoins = currentCoins - cost;
    await query('UPDATE users SET gold_coins = $1 WHERE id = $2', [newCoins, userId]);

    // Record feature unlock
    await query(
      'INSERT INTO user_unlocked_features (id, user_id, feature_id) VALUES ($1, $2, $3)',
      [crypto.randomUUID(), userId, toolKey]
    );

    // Audit log
    await query(
      'INSERT INTO coin_transactions (id, user_id, amount, reason, description) VALUES ($1, $2, $3, $4, $5)',
      [crypto.randomUUID(), userId, -cost, 'TOOL_UNLOCK', `Unlocked platform tool: ${toolKey} for ${cost} coins`]
    );

    return {
      success: true,
      remainingCoins: newCoins,
      toolKey,
      message: `Tool ${toolKey} successfully unlocked!`
    };
  } catch (err) {
    console.error('❌ Gamification unlockToolWithCoins error:', err);
    return { error: 'Failed to unlock tool' };
  }
}

// 9. Get Unlocked Tools for User
async function getUnlockedTools(userId) {
  try {
    const res = await query(
      'SELECT feature_id as "featureId", unlocked_at as "unlockedAt" FROM user_unlocked_features WHERE user_id = $1',
      [userId]
    );
    return res.rows.map(r => r.featureId);
  } catch (err) {
    console.error('❌ Gamification getUnlockedTools error:', err);
    return [];
  }
}

// 10. Get Coin Transactions / Audit Trail
async function getCoinTransactions(userId, limit = 50) {
  try {
    const res = await query(
      'SELECT id, amount, reason, description, created_at FROM coin_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows;
  } catch (err) {
    console.error('❌ Gamification getCoinTransactions error:', err);
    return [];
  }
}

module.exports = {
  awardCoins,
  processLoginReward,
  processTradeOpenReward,
  processTradeCloseReward,
  awardBadge,
  getUserBadges,
  getRealLeaderboard,
  unlockToolWithCoins,
  getUnlockedTools,
  getCoinTransactions
};
