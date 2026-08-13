require('dotenv').config();
const jwt = require('jsonwebtoken');
const { query } = require('../db/index');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'Nonstock-super-secret-key-2025';
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/ai/mentor`;

async function runVerification() {
  console.log('🏁 Starting Jarvis AI Mentor programmatic verification...\n');

  // 1. Create a mock user and session in db
  const userId = 'usr_test_jarvis_' + crypto.randomBytes(4).toString('hex');
  const userEmail = `jarvis_test_${userId}@test.com`;
  const sessionId = 'sess_test_jarvis_' + crypto.randomBytes(4).toString('hex');

  try {
    await query(
      `INSERT INTO users (id, name, email, password) 
       VALUES ($1, $2, $3, $4)`,
      [userId, 'Jarvis Validator', userEmail, 'password123']
    );

    await query(
      `INSERT INTO sessions (id, user_id, token, expires_at) 
       VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
      [sessionId, userId, sessionId]
    );

    console.log('✅ Mock user and session registered in database.');
  } catch (dbErr) {
    console.error('❌ Failed to register test credentials in database:', dbErr.message);
    process.exit(1);
  }

  // Sign JWT matching database records
  const testToken = jwt.sign(
    { id: userId, sessionId: sessionId, name: 'Jarvis Validator' },
    JWT_SECRET
  );

  const testPayloads = [
    {
      name: 'Learner Mode - Liquidity Trap Analysis',
      body: {
        message: 'Analyze this setup and explain the risks.',
        marketData: {
          symbol: 'RELIANCE',
          timeframe: '15m',
          currentPrice: 2450.50,
          rsi: 68.4,
          macd: { signal: 'bearish_divergence' },
          trend: 'Upward Breakout (Weakening)',
          patternDetected: 'Potential Liquidity Trap / Fakeout near 2460.00 resistance'
        },
        accountMode: 'learner'
      }
    },
    {
      name: 'Pro Mode - Cup & Handle Breakout Analysis',
      body: {
        message: 'Validate this breakout structure and identify invalidation level.',
        marketData: {
          symbol: 'TCS',
          timeframe: '1h',
          currentPrice: 3890.00,
          rsi: 58.2,
          macd: { signal: 'bullish_cross' },
          trend: 'Strong Uptrend',
          patternDetected: 'Cup & Handle Breakout above 3850.00 with high volume profile'
        },
        accountMode: 'pro'
      }
    }
  ];

  for (const { name, body } of testPayloads) {
    console.log(`\n--------------------------------------------------`);
    console.log(`🧪 Testing Scenario: ${name}`);
    console.log(`--------------------------------------------------`);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`
        },
        body: JSON.stringify(body)
      });

      console.log(`Status Code: ${response.status}`);
      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ Success! Response returned by: ${data.model}`);
        if (data.warning) console.warn(`⚠️ Warning: ${data.warning}`);
        console.log(`\n--- Jarvis Response Snippet ---`);
        console.log(data.response.substring(0, 600) + '\n...');
      } else {
        console.error(`❌ Failed:`, data);
      }
    } catch (err) {
      console.error(`❌ Connection/execution error:`, err.message);
    }
  }

  // Clean up database records
  console.log('\n🧹 Cleaning up test database records...');
  try {
    await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
    await query(`DELETE FROM users WHERE id = $1`, [userId]);
    console.log('✅ Cleaned up successfully.');
  } catch (cleanErr) {
    console.error('❌ Failed to clean up database records:', cleanErr.message);
  }

  console.log('\n🎉 Verification finished.');
}

runVerification();
