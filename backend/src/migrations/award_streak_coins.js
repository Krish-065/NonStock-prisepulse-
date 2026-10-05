require('dotenv').config();
const { query, pool } = require('../db');
const crypto = require('crypto');

async function fixUserStreakAndCoins() {
  try {
    const email = 'krishshah8201@gmail.com';
    const userRes = await query('SELECT id, name, email, gold_coins, login_streak FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.log('User not found:', email);
      return;
    }

    const user = userRes.rows[0];
    console.log('Current user in DB before fix:', user);

    // Baseline: 100 (initial account coins) + 4 days * 10 coins = 140 coins total
    const targetCoins = 140;
    const targetStreak = 4;

    await query(
      'UPDATE users SET gold_coins = $1, login_streak = $2, last_login_date = CURRENT_DATE WHERE id = $3',
      [targetCoins, targetStreak, user.id]
    );

    // Clean old transactions and record official 4-day streak audit logs (+10 each)
    await query('DELETE FROM coin_transactions WHERE user_id = $1', [user.id]);

    const day1 = new Date(Date.now() - 3 * 86400000);
    const day2 = new Date(Date.now() - 2 * 86400000);
    const day3 = new Date(Date.now() - 1 * 86400000);
    const day4 = new Date();

    const txs = [
      {
        id: crypto.randomUUID(),
        user_id: user.id,
        amount: 10,
        reason: 'DAILY_LOGIN',
        description: 'Day 1 Daily Login Bonus (+10 Coins)',
        created_at: day1
      },
      {
        id: crypto.randomUUID(),
        user_id: user.id,
        amount: 10,
        reason: 'DAILY_LOGIN',
        description: 'Day 2 Daily Login Bonus (+10 Coins)',
        created_at: day2
      },
      {
        id: crypto.randomUUID(),
        user_id: user.id,
        amount: 10,
        reason: 'DAILY_LOGIN',
        description: 'Day 3 Daily Login Bonus (+10 Coins)',
        created_at: day3
      },
      {
        id: crypto.randomUUID(),
        user_id: user.id,
        amount: 10,
        reason: 'DAILY_LOGIN',
        description: 'Day 4 Daily Login Bonus (+10 Coins)',
        created_at: day4
      }
    ];

    for (const tx of txs) {
      await query(
        'INSERT INTO coin_transactions (id, user_id, amount, reason, description, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [tx.id, tx.user_id, tx.amount, tx.reason, tx.description, tx.created_at]
      );
    }

    const updatedUser = await query('SELECT id, name, email, gold_coins, login_streak, last_login_date FROM users WHERE id = $1', [user.id]);
    console.log('✅ Updated user in DB:', updatedUser.rows[0]);

    const recordedTxs = await query('SELECT id, amount, reason, description, created_at FROM coin_transactions WHERE user_id = $1 ORDER BY created_at ASC', [user.id]);
    console.log('✅ Recorded coin transactions in DB:');
    console.table(recordedTxs.rows);

  } catch (err) {
    console.error('Error in fixUserStreakAndCoins:', err);
  } finally {
    await pool.end();
  }
}

fixUserStreakAndCoins();
