const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../db/index');
const crypto = require('crypto');

// 1. Fetch community feed posts
router.get('/posts', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, u.name as author_name 
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'Failed to retrieve community posts' });
  }
});

// 2. Create new post
router.post('/posts', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const postId = crypto.randomUUID();
    await query(
      `INSERT INTO community_posts (id, user_id, title, content, likes) VALUES ($1, $2, $3, $4, 0)`,
      [postId, req.user.id, title, content]
    );

    const result = await query(`
      SELECT p.*, u.name as author_name 
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [postId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// 3. Like a post
router.post('/posts/:id/like', authenticate, async (req, res) => {
  try {
    await query(`UPDATE community_posts SET likes = likes + 1 WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ error: 'Failed to register like' });
  }
});

// 4. Fetch courses
router.get('/courses', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM courses ORDER BY created_at ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ error: 'Failed to retrieve courses' });
  }
});

// 5. Fetch contests
router.get('/contests', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM contests ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch contests error:', err);
    res.status(500).json({ error: 'Failed to retrieve contests' });
  }
});

// 6. Join a contest
router.post('/contests/:id/join', authenticate, async (req, res) => {
  try {
    await query(`UPDATE contests SET participants = participants + 1 WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Join contest error:', err);
    res.status(500).json({ error: 'Failed to join contest' });
  }
});

// 7. Fetch group messages
router.get('/chat/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    let result = await query(
      `SELECT * FROM group_messages WHERE group_id = $1 ORDER BY created_at ASC LIMIT 50`,
      [groupId]
    );

    // Seed default chat messages if the room is empty to show active discussions
    if (result.rows.length === 0) {
      const defaultChats = {
        nifty: [
          { author: 'AlgorithmicGuru', msg: 'Check out RSI crosses below 30 on RELIANCE! Looks like a great entry point.' },
          { author: 'NiftyTrader', msg: 'Yeah, EMA 20 is still pointing down though, better wait for a crossover.' },
          { author: 'BeginnerInvest', msg: 'Should we run a backtest on Nifty index breakouts first?' },
          { author: 'QuantPro', msg: 'Definitely. Breakouts above the 30-day resistance work nicely in current market conditions.' }
        ],
        options: [
          { author: 'F&OScalper', msg: 'Nifty Put-Call Ratio (PCR) is sitting at 0.76. Looks oversold.' },
          { author: 'ThetaDecay', msg: 'Time to sell weekly OTM puts if you have the margin.' },
          { author: 'OptionStudent', msg: 'Isn\'t selling options risky for beginners?' },
          { author: 'ThetaDecay', msg: 'Extremely! Stick to paper trading here until you master risk management.' }
        ],
        basics: [
          { author: 'PrisePulseMentor', msg: 'Welcome to Investing Basics! Ask anything about indicators or stock terminologies.' },
          { author: 'Newbie99', msg: 'What does "Spread" mean in bid-ask quotes?' },
          { author: 'PrisePulseMentor', msg: 'It is the difference between the highest price a buyer is willing to pay (bid) and the lowest price a seller is willing to accept (ask).' }
        ],
        crypto: [
          { author: 'CryptoWhale', msg: 'BTC holding strong above key support of $60K.' },
          { author: 'SatoshisSon', msg: 'ADX index is indicating high trend strength. Bull run might resume.' },
          { author: 'AltSeasonWhen', msg: 'Wait for ETH to crossover its 50-day EMA first.' }
        ]
      };

      const seedMessages = defaultChats[groupId] || [];
      for (const m of seedMessages) {
        await query(
          `INSERT INTO group_messages (id, group_id, user_id, author_name, message) VALUES ($1,$2,NULL,$3,$4)`,
          [crypto.randomUUID(), groupId, m.author, m.msg]
        );
      }

      // Re-fetch seeded messages
      result = await query(
        `SELECT * FROM group_messages WHERE group_id = $1 ORDER BY created_at ASC LIMIT 50`,
        [groupId]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch group messages error:', err);
    res.status(500).json({ error: 'Failed to retrieve group messages' });
  }
});

// 8. Send group message
router.post('/chat/:groupId', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const msgId = crypto.randomUUID();
    await query(
      `INSERT INTO group_messages (id, group_id, user_id, author_name, message) VALUES ($1,$2,$3,$4,$5)`,
      [msgId, groupId, req.user.id, req.user.name || 'Anonymous', message]
    );

    const result = await query(`SELECT * FROM group_messages WHERE id = $1`, [msgId]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Send group message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
