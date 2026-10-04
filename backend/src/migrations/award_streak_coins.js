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
    console.log('Current user in DB:', user);

    // Baseline: 100 + 25 (Day 1) + 25 (Day 2) + 25 (Day 3) = 175
    const targetCoins = 175;
    const targetStreak = 3;

    await query(
      'UPDATE users SET gold_coins = $1, login_streak = $2, last_login_date = CURRENT_DATE WHERE id = $3',
      [targetCoins, targetStreak, user.id]
    );

    // Clean old transactions and record official 3-day streak audit logs
    await query('DELETE FROM coin_transactions WHERE user_id = $1', [user.id]);

    const day1 = new Date(Date.now() - 2 * 86400000);
    const day2 = new Date(Date.now() - 1 * 86400000);
    const day3 = new Date();

    const tx1 = {
      id: crypto.randomUUID(),
      user_id: user.id,
      amount: 25,
      reason: 'DAILY_LOGIN',
      description: 'Day 1 Discipline Login Bonus (+25 Coins)',
      created_at: day1
    };
    const tx2 = {
      id: crypto.randomUUID(),
      user_id: user.id,
      amount: 25,
      reason: 'DAILY_LOGIN',
      description: 'Day 2 Discipline Login Bonus (+25 Coins)',
      created_at: day2
    };
    const tx3 = {
      id: crypto.randomUUID(),
      user_id: user.id,
      amount: 25,
      reason: 'DAILY_LOGIN',
      description: 'Day 3 Discipline Login Bonus (+25 Coins)',
      created_at: day3
    };

    for (const tx of [tx1, tx2, tx3]) {
      await query(
        'INSERT INTO coin_transactions (id, user_id, amount, reason, description, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [tx.id, tx.user_id, tx.amount, tx.reason, tx.description, tx.created_at]
      );
    }

    const updatedUser = await query('SELECT id, name, email, gold_coins, login_streak, last_login_date FROM users WHERE id = $1', [user.id]);
    console.log('Updated user in DB:', updatedUser.rows[0]);

    const txs = await query('SELECT id, amount, reason, description, created_at FROM coin_transactions WHERE user_id = $1 ORDER BY created_at ASC', [user.id]);
    console.log('Recorded coin transactions in DB:');
    console.table(txs.rows);

  } catch (err) {
    console.error('Error in fixUserStreakAndCoins:', err);
  } finally {
    await pool.end();
  }
}

fixUserStreakAndCoins();
