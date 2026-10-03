require('dotenv').config();
const { query, pool } = require('../db');

async function runMigration() {
  try {
    console.log('Running Broker Mirror migration...');
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS mirror_real_balance NUMERIC DEFAULT 12480.00,
      ADD COLUMN IF NOT EXISTS mirror_is_active BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS mirror_risk_pct NUMERIC DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS mirror_mode VARCHAR(32) DEFAULT 'PERCENTAGE_EQUITY',
      ADD COLUMN IF NOT EXISTS mirror_last_sync_at TIMESTAMP DEFAULT NOW();
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS mirrored_trades (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        broker VARCHAR(64) NOT NULL,
        symbol VARCHAR(32) NOT NULL,
        type VARCHAR(16) NOT NULL,
        real_entry_price NUMERIC NOT NULL,
        real_exit_price NUMERIC,
        real_equity NUMERIC NOT NULL,
        real_risk_pct NUMERIC NOT NULL,
        real_pnl NUMERIC,
        real_pnl_pct NUMERIC,
        nonstock_capital NUMERIC NOT NULL DEFAULT 1000.00,
        nonstock_risk_amount NUMERIC NOT NULL,
        nonstock_pnl NUMERIC,
        status VARCHAR(20) DEFAULT 'CLOSED',
        sl_distance NUMERIC,
        tp_distance NUMERIC,
        opened_at TIMESTAMP DEFAULT NOW(),
        closed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Broker Mirror migration completed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
