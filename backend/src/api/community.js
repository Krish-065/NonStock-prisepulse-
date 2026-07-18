const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { query } = require('../db/index');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

// 1. Fetch community feed posts
router.get('/posts', async (req, res) => {
  try {
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Nonstock-super-secret-key-2025');
        currentUserId = decoded.id;
      } catch (e) {
        // Ignore invalid token
      }
    }

    const { tab } = req.query;

    let baseQuery = `
      SELECT p.*, 
             u.name as author_name,
             u.is_verified as author_is_verified,
             u.verification_title as author_verification_title,
             c.name as channel_name,
             c.avatar_url as channel_avatar,
             c.is_premium as channel_is_premium,
             c.price as channel_price,
             c.owner_id as channel_owner_id,
             (SELECT COUNT(*) FROM channel_follows WHERE channel_id = p.channel_id) as channel_followers,
             EXISTS(SELECT 1 FROM channel_follows WHERE user_id = $1 AND channel_id = p.channel_id) as is_following,
             EXISTS(SELECT 1 FROM channel_follows WHERE user_id = $1 AND channel_id = p.channel_id AND is_paid = true) as has_paid_subscription
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN channels c ON p.channel_id = c.id
    `;
    
    let queryParams = [currentUserId || ''];

    if (tab === 'trending') {
      baseQuery += ` ORDER BY p.likes DESC, p.created_at DESC`;
    } else if (tab === 'following' && currentUserId) {
      baseQuery += ` WHERE p.channel_id IN (SELECT channel_id FROM channel_follows WHERE user_id = $2) ORDER BY p.created_at DESC`;
      queryParams.push(currentUserId);
    } else {
      baseQuery += ` ORDER BY p.created_at DESC`;
    }

    const result = await query(baseQuery, queryParams);
    
    // Redact premium posts content if not followed/purchased
    const posts = result.rows.map(row => {
      const isAuthor = currentUserId && row.user_id === currentUserId;
      const isChannelOwner = currentUserId && row.channel_owner_id === currentUserId;
      const isUnlocked = !row.is_premium && !row.channel_is_premium;
      
      if (!isUnlocked && !isAuthor && !isChannelOwner && !row.has_paid_subscription) {
        return {
          ...row,
          content: '🔒 Premium Content Locked. Subscribe to this channel to unlock full analysis and updates.',
          image_url: null,
          is_locked: true,
          is_redacted: true
        };
      }
      return {
        ...row,
        is_locked: false,
        is_redacted: false
      };
    });

    res.json(posts);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'Failed to retrieve community posts' });
  }
});

// 2. Create new post
router.post('/posts', authenticate, async (req, res) => {
  try {
    const { title, content, image_url, channel_id, is_premium = false } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (channel_id) {
      // Verify user owns the channel
      const channelRes = await query('SELECT owner_id FROM channels WHERE id = $1', [channel_id]);
      if (channelRes.rows.length === 0) {
        return res.status(404).json({ error: 'Channel not found' });
      }
      if (channelRes.rows[0].owner_id !== req.user.id) {
        return res.status(403).json({ error: 'You do not own this channel' });
      }
    }

    const postId = crypto.randomUUID();
    await query(
      `INSERT INTO community_posts (id, user_id, title, content, image_url, channel_id, likes, is_premium) 
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7)`,
      [postId, req.user.id, title, content, image_url || null, channel_id || null, is_premium]
    );

    const result = await query(`
      SELECT p.*, 
             u.name as author_name,
             u.is_verified as author_is_verified,
             u.verification_title as author_verification_title,
             c.name as channel_name,
             c.avatar_url as channel_avatar
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN channels c ON p.channel_id = c.id
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

// 4. Create Channel
router.post('/channels', authenticate, async (req, res) => {
  try {
    const { name, description, avatar_url, is_premium = false, price = 0.00 } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Enforce one channel per account limit
    const userChannelCheck = await query('SELECT id FROM channels WHERE owner_id = $1', [req.user.id]);
    if (userChannelCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You can only create one channel per account' });
    }

    // Check uniqueness of channel name
    const checkRes = await query('SELECT id FROM channels WHERE LOWER(name) = LOWER($1)', [name]);
    if (checkRes.rows.length > 0) {
      return res.status(400).json({ error: 'Channel name already exists' });
    }

    const channelId = 'ch_' + crypto.randomBytes(8).toString('hex');
    await query(
      `INSERT INTO channels (id, owner_id, name, description, avatar_url, is_premium, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [channelId, req.user.id, name, description || '', avatar_url || '', is_premium, price]
    );

    // Auto-follow own channel as paid
    await query(
      `INSERT INTO channel_follows (user_id, channel_id, is_paid, subscribed_at) 
       VALUES ($1, $2, true, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING`,
      [req.user.id, channelId]
    );

    res.status(201).json({ success: true, message: 'Channel created successfully', channelId });
  } catch (err) {
    console.error('Create channel error:', err);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// 5. List Channels
router.get('/channels', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM channel_follows WHERE channel_id = c.id) as followers_count,
              EXISTS(SELECT 1 FROM channel_follows WHERE user_id = $1 AND channel_id = c.id) as is_following,
              EXISTS(SELECT 1 FROM channel_follows WHERE user_id = $1 AND channel_id = c.id AND is_paid = true) as has_paid_subscription,
              u.name as owner_name,
              u.is_verified as owner_is_verified,
              u.verification_title as owner_verification_title
       FROM channels c
       JOIN users u ON c.owner_id = u.id
       ORDER BY followers_count DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List channels error:', err);
    res.status(500).json({ error: 'Failed to retrieve channels' });
  }
});

// 6. Follow Channel (Deduct points if premium)
router.post('/channels/:id/follow', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check channel existence and premium status
    const channelRes = await query('SELECT owner_id, is_premium, price FROM channels WHERE id = $1', [id]);
    if (channelRes.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    const channel = channelRes.rows[0];

    // Check if already following
    const followRes = await query('SELECT is_paid FROM channel_follows WHERE user_id = $1 AND channel_id = $2', [req.user.id, id]);
    const alreadyFollowing = followRes.rows.length > 0;
    const alreadyPaid = alreadyFollowing && followRes.rows[0].is_paid;

    if (channel.is_premium && !alreadyPaid) {
      if (channel.owner_id === req.user.id) {
        // Owner doesn't pay
        await query(
          `INSERT INTO channel_follows (user_id, channel_id, is_paid, subscribed_at) 
           VALUES ($1, $2, true, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id, channel_id) DO UPDATE SET is_paid = true`,
          [req.user.id, id]
        );
      } else {
        // Deduct points from follower virtual_balance, add to owner
        const userRes = await query('SELECT virtual_balance FROM users WHERE id = $1', [req.user.id]);
        const balance = parseFloat(userRes.rows[0]?.virtual_balance || 0);
        const fee = parseFloat(channel.price);

        if (balance < fee) {
          return res.status(400).json({ error: `Insufficient virtual balance. Subscription requires ₹${fee.toFixed(2)}.` });
        }

        // Perform balance deduction and credit in a single transaction sequence
        await query('BEGIN');
        try {
          await query('UPDATE users SET virtual_balance = virtual_balance - $1 WHERE id = $2', [fee, req.user.id]);
          await query('UPDATE users SET virtual_balance = virtual_balance + $1 WHERE id = $2', [fee, channel.owner_id]);
          
          await query(
            `INSERT INTO channel_follows (user_id, channel_id, is_paid, subscribed_at) 
             VALUES ($1, $2, true, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id, channel_id) DO UPDATE SET is_paid = true, subscribed_at = CURRENT_TIMESTAMP`,
            [req.user.id, id]
          );
          
          await query('COMMIT');
        } catch (txErr) {
          await query('ROLLBACK');
          throw txErr;
        }
      }
    } else {
      // Free channel or already paid follow
      await query(
        `INSERT INTO channel_follows (user_id, channel_id, is_paid, subscribed_at) 
         VALUES ($1, $2, false, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING`,
        [req.user.id, id]
      );
    }

    res.json({ success: true, message: 'Subscribed to channel successfully' });
  } catch (err) {
    console.error('Follow channel error:', err);
    res.status(500).json({ error: 'Failed to follow channel' });
  }
});

// 7. Unfollow Channel
router.post('/channels/:id/unfollow', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await query(
      `DELETE FROM channel_follows WHERE user_id = $1 AND channel_id = $2`,
      [req.user.id, id]
    );
    res.json({ success: true, message: 'Unfollowed channel successfully' });
  } catch (err) {
    console.error('Unfollow channel error:', err);
    res.status(500).json({ error: 'Failed to unfollow channel' });
  }
});

// 8. Publish Course Playlist
router.post('/courses', authenticate, async (req, res) => {
  try {
    const { title, description, youtube_link, category } = req.body;
    if (!title || !description || !youtube_link) {
      return res.status(400).json({ error: 'Title, description, and YouTube link are required' });
    }
    const id = 'c_' + crypto.randomBytes(8).toString('hex');
    await query(
      `INSERT INTO courses (id, title, description, instructor, youtube_link, category)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, title, description, req.user.name || 'Coaching Expert', youtube_link, category || 'General']
    );
    res.status(201).json({ success: true, message: 'Course playlist published successfully!' });
  } catch (err) {
    console.error('Publish course error:', err);
    res.status(500).json({ error: 'Failed to publish course' });
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
router.get('/contests', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, COALESCE(u.name, 'System') as host_name
      FROM contests c
      LEFT JOIN users u ON c.hosted_by = u.id
      WHERE c.status = 'approved' OR c.hosted_by = $1
      ORDER BY c.id ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch contests error:', err);
    res.status(500).json({ error: 'Failed to retrieve contests' });
  }
});

// 5.5. Host / create a new contest request (Pending Approval)
router.post('/contests', authenticate, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      prizePool, 
      startDate, 
      endDate, 
      proofs,
      isPrivate = false,
      passcode = null,
      initialCapital = 1000000.00,
      allowedAssets = 'all',
      leverageLimit = 1
    } = req.body;

    if (!title || !description || !prizePool || !startDate || !endDate || !proofs) {
      return res.status(400).json({ error: 'All fields are required, including proofs/background' });
    }

    // Get host details
    const userRes = await query('SELECT name, email FROM users WHERE id = $1', [req.user.id]);
    const hostUser = userRes.rows[0];
    const hostName = hostUser?.name || 'NonStock User';
    const hostEmail = hostUser?.email || 'N/A';

    const contestId = 'ct_' + crypto.randomBytes(8).toString('hex');
    await query(
      `INSERT INTO contests (id, title, description, prize_pool, start_date, end_date, participants, hosted_by, status, proofs, is_private, passcode, initial_capital, allowed_assets, leverage_limit)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, 'pending', $8, $9, $10, $11, $12, $13)`,
      [contestId, title, description, prizePool, startDate, endDate, req.user.id, proofs, isPrivate, passcode, initialCapital, allowedAssets, leverageLimit]
    );

    // Send email notification to Admin
    const frontendUrl = process.env.FRONTEND_URL || 'localhost:5173';
    const hostUrl = frontendUrl.startsWith('http') ? frontendUrl : `https://${frontendUrl}`;
    
    const adminEmail = process.env.FROM_EMAIL || 'krishshah8201@gmail.com';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid rgba(0, 255, 136, 0.25); border-radius: 16px; background-color: #0a0e27; color: #ffffff; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
        <h2 style="color: #00ff88; margin-top: 0; font-size: 22px; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; text-align: center;">🏆 New Contest Hosting Request</h2>
        
        <p style="font-size: 15px; color: #e1e3e6; line-height: 1.5;">
          A user has requested to host a paper trading contest on the NonStock platform. Please review the details below:
        </p>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px; color: #9b9eac;"><strong>Host User:</strong> ${hostName} (${hostEmail})</p>
          <p style="margin: 4px 0; font-size: 14px; color: #9b9eac;"><strong>Contest Title:</strong> ${title}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #9b9eac;"><strong>Prize Pool:</strong> ${prizePool}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #9b9eac;"><strong>Start Date:</strong> ${startDate}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #9b9eac;"><strong>End Date:</strong> ${endDate}</p>
        </div>

        <h3 style="color: #00ff88; font-size: 16px; margin-top: 24px;">📝 Description</h3>
        <p style="font-size: 14px; color: #e1e3e6; background: rgba(255, 255, 255, 0.02); border-radius: 8px; padding: 12px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 20px;">
          ${description}
        </p>

        <h3 style="color: #00ff88; font-size: 16px; margin-top: 24px;">🔒 Verification Proofs (Anti-Fraud Check)</h3>
        <p style="font-size: 14px; color: #e1e3e6; background: rgba(255, 255, 255, 0.02); border-radius: 8px; padding: 12px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 24px; white-space: pre-wrap;">
          ${proofs}
        </p>

        <div style="text-align: center; margin-top: 32px;">
          <p style="font-size: 12px; color: #9b9eac; margin-bottom: 16px;">
            You can approve or reject this request directly from the Contest Host Review Panel:
          </p>
          <a href="${hostUrl}/community" style="background-color: #00ff88; color: #0a0e27; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Go to Admin Review Dashboard</a>
        </div>
      </div>
    `;

    // Asynchronously send email
    sendEmail({
      to: adminEmail,
      subject: `[NonStock Admin] New Contest Request: ${title}`,
      html: htmlContent
    }).catch(mailErr => {
      console.error('❌ Failed to send contest request email:', mailErr.message);
    });

    res.status(201).json({ success: true, message: 'Contest request submitted successfully and is pending admin approval.' });
  } catch (err) {
    console.error('Create contest request error:', err);
    res.status(500).json({ error: 'Failed to submit contest request' });
  }
});

// 5.6. Fetch pending contest requests (Admin Only)
router.get('/contests/pending', authenticate, async (req, res) => {
  try {
    const adminCheck = await query(`SELECT is_admin FROM users WHERE id = $1`, [req.user.id]);
    const isAdmin = adminCheck.rows[0]?.is_admin || req.user.email.toLowerCase().startsWith('admin@');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied: admin permission required' });
    }

    const result = await query(`
      SELECT c.*, u.name as host_name, u.email as host_email
      FROM contests c
      JOIN users u ON c.hosted_by = u.id
      WHERE c.status = 'pending'
      ORDER BY c.start_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch pending contests error:', err);
    res.status(500).json({ error: 'Failed to retrieve pending contests' });
  }
});

// 5.7. Approve contest request (Admin Only)
router.post('/contests/:id/approve', authenticate, async (req, res) => {
  try {
    const adminCheck = await query(`SELECT is_admin FROM users WHERE id = $1`, [req.user.id]);
    const isAdmin = adminCheck.rows[0]?.is_admin || req.user.email.toLowerCase().startsWith('admin@');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied: admin permission required' });
    }

    const result = await query(
      `UPDATE contests SET status = 'approved' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.json({ success: true, message: 'Contest approved successfully', contest: result.rows[0] });
  } catch (err) {
    console.error('Approve contest error:', err);
    res.status(500).json({ error: 'Failed to approve contest' });
  }
});

// 5.8. Reject contest request (Admin Only)
router.post('/contests/:id/reject', authenticate, async (req, res) => {
  try {
    const adminCheck = await query(`SELECT is_admin FROM users WHERE id = $1`, [req.user.id]);
    const isAdmin = adminCheck.rows[0]?.is_admin || req.user.email.toLowerCase().startsWith('admin@');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied: admin permission required' });
    }

    const result = await query(
      `UPDATE contests SET status = 'rejected' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.json({ success: true, message: 'Contest request rejected successfully', contest: result.rows[0] });
  } catch (err) {
    console.error('Reject contest error:', err);
    res.status(500).json({ error: 'Failed to reject contest' });
  }
});

// 6. Join a contest
router.post('/contests/:id/join', authenticate, async (req, res) => {
  try {
    const { passcode } = req.body;
    // Only join approved contests
    const check = await query(`SELECT status, is_private, passcode FROM contests WHERE id = $1`, [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    const contest = check.rows[0];
    if (contest.status !== 'approved') {
      return res.status(400).json({ error: 'Cannot join a contest that is not approved' });
    }

    if (contest.is_private) {
      if (!passcode || passcode !== contest.passcode) {
        return res.status(403).json({ error: 'Invalid or missing passcode for this private contest' });
      }
    }

    await query(`UPDATE contests SET participants = participants + 1 WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Join contest error:', err);
    res.status(500).json({ error: 'Failed to join contest' });
  }
});

// 6.5. Search public groups/rooms
router.get('/groups/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const result = await query(`
      SELECT g.*, 
             gm.role as my_role,
             COALESCE(u.name, 'System') as creator_name
      FROM discussion_groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = $1
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.is_public = true AND (g.room_id ILIKE $2 OR g.name ILIKE $2)
      ORDER BY g.created_at ASC
    `, [req.user.id, `%${q}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error('Search groups error:', err);
    res.status(500).json({ error: 'Failed to search groups' });
  }
});

// 6.6. Join a public room
router.post('/groups/:groupId/join', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupInfo = await query(`SELECT is_public FROM discussion_groups WHERE id = $1`, [groupId]);
    if (groupInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (!groupInfo.rows[0].is_public) {
      return res.status(400).json({ error: 'Cannot join private group directly' });
    }
    await query(
      `INSERT INTO group_members (id, group_id, user_id, role) 
       VALUES ($1, $2, $3, 'member')
       ON CONFLICT (group_id, user_id) DO NOTHING`,
      [crypto.randomUUID(), groupId, req.user.id]
    );
    res.json({ success: true, message: 'Successfully joined public room' });
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// 7. Fetch group messages
router.get('/chat/:groupId', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check group info
    const groupInfo = await query(`SELECT created_by, is_public FROM discussion_groups WHERE id = $1`, [groupId]);
    if (groupInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // If private, verify current user is a member
    if (!groupInfo.rows[0].is_public && groupInfo.rows[0].created_by !== null) {
      const memberCheck = await query(
        `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, req.user.id]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied: you are not a member of this private group' });
      }
    }

    let result = await query(
      `SELECT * FROM group_messages WHERE group_id = $1 ORDER BY created_at ASC LIMIT 50`,
      [groupId]
    );

    // Seed default chat messages if the room is empty to show active discussions (for public rooms only)
    if (result.rows.length === 0 && groupInfo.rows[0].created_by === null) {
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

    // Check group info
    const groupInfo = await query(`SELECT created_by, features, is_public FROM discussion_groups WHERE id = $1`, [groupId]);
    if (groupInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isCreator = groupInfo.rows[0].created_by === req.user.id;

    // Check group membership / roles
    let role = null;
    const memberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, req.user.id]
    );
    if (memberCheck.rows.length > 0) {
      role = memberCheck.rows[0].role;
    }

    // If private, verify current user is a member
    if (!groupInfo.rows[0].is_public && groupInfo.rows[0].created_by !== null) {
      if (!role && !isCreator) {
        return res.status(403).json({ error: 'Access denied: you are not a member of this private group' });
      }
    }

    // Enforce admin-only posting rules
    if (groupInfo.rows[0].features === 'admin-only-chat') {
      const isAdmin = role === 'admin' || isCreator;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only group creators or admins can post messages in this channel.' });
      }
    }

    const userRes = await query(`SELECT name FROM users WHERE id = $1`, [req.user.id]);
    const authorName = userRes.rows[0]?.name || 'Anonymous';

    const msgId = crypto.randomUUID();
    await query(
      `INSERT INTO group_messages (id, group_id, user_id, author_name, message) VALUES ($1,$2,$3,$4,$5)`,
      [msgId, groupId, req.user.id, authorName, message]
    );

    const result = await query(`SELECT * FROM group_messages WHERE id = $1`, [msgId]);
    const savedMsg = result.rows[0];

    const io = req.app.get('io');
    if (io) {
      io.to(`group:${groupId}`).emit('newChatMessage', savedMsg);
    }

    res.status(201).json(savedMsg);
  } catch (err) {
    console.error('Send group message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// 9. Fetch all groups current user is a member of, plus public groups
router.get('/groups', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT g.*, 
             gm.role as my_role,
             COALESCE(u.name, 'System') as creator_name
      FROM discussion_groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = $1
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.created_by IS NULL OR gm.user_id IS NOT NULL
      ORDER BY g.created_at ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch groups error:', err);
    res.status(500).json({ error: 'Failed to retrieve groups' });
  }
});

// 10. Create new discussion group/public room
router.post('/groups', authenticate, async (req, res) => {
  try {
    const { name, features, isPublic, roomId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    let finalIsPublic = isPublic === true;
    let finalRoomId = roomId || null;

    if (finalIsPublic) {
      if (!finalRoomId) {
        return res.status(400).json({ error: 'Room ID is required for public rooms' });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(finalRoomId)) {
        return res.status(400).json({ error: 'Room ID must contain only alphanumeric characters and underscores' });
      }

      // Check uniqueness of roomId or name
      const uniqueCheck = await query(
        `SELECT 1 FROM discussion_groups WHERE room_id = $1 OR name = $2`,
        [finalRoomId, name]
      );
      if (uniqueCheck.rows.length > 0) {
        return res.status(400).json({ error: 'A room with this Room ID or Room Name already exists' });
      }
    }

    const allowedFeatures = ['all-can-chat', 'admin-only-chat'];
    const finalFeatures = allowedFeatures.includes(features) ? features : 'all-can-chat';

    const groupId = crypto.randomUUID();
    
    // Insert group
    await query(
      `INSERT INTO discussion_groups (id, name, created_by, features, is_public, room_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [groupId, name, req.user.id, finalFeatures, finalIsPublic, finalRoomId]
    );

    // Add creator as admin
    await query(
      `INSERT INTO group_members (id, group_id, user_id, role) VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), groupId, req.user.id, 'admin']
    );

    const result = await query(`
      SELECT g.*, 'admin' as my_role, u.name as creator_name
      FROM discussion_groups g
      JOIN users u ON g.created_by = u.id
      WHERE g.id = $1
    `, [groupId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// 11. Invite user(s) to a group by email
router.post('/groups/:groupId/invite', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;
    let { emails } = req.body;

    if (!emails) {
      return res.status(400).json({ error: 'No emails provided' });
    }

    // Check if user is admin of group
    const memberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, req.user.id]
    );

    if (memberCheck.rows.length === 0 || memberCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins can invite members' });
    }

    // Normalize emails to array
    if (typeof emails === 'string') {
      emails = emails.split(',').map(e => e.trim());
    }

    const invitedList = [];
    const errorsList = [];

    for (const email of emails) {
      if (!email) continue;
      
      // Check if user exists
      const userCheck = await query(`SELECT id FROM users WHERE email = $1`, [email]);
      if (userCheck.rows.length === 0) {
        errorsList.push(`User with email "${email}" not found`);
        continue;
      }

      const targetUserId = userCheck.rows[0].id;

      // Check if user is already a member
      const existingMember = await query(
        `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, targetUserId]
      );
      if (existingMember.rows.length > 0) {
        errorsList.push(`User "${email}" is already a member of this group`);
        continue;
      }

      // Check if an invite is already pending
      const existingInvite = await query(
        `SELECT 1 FROM group_invitations WHERE group_id = $1 AND email = $2 AND status = 'pending'`,
        [groupId, email]
      );
      if (existingInvite.rows.length > 0) {
        errorsList.push(`Invitation to "${email}" is already pending`);
        continue;
      }

      // Create invitation
      const inviteId = crypto.randomUUID();
      await query(
        `INSERT INTO group_invitations (id, group_id, invited_by, email, status) VALUES ($1, $2, $3, $4, 'pending')`,
        [inviteId, groupId, req.user.id, email]
      );
      invitedList.push(email);
    }

    res.json({ 
      success: true, 
      invited: invitedList, 
      errors: errorsList 
    });
  } catch (err) {
    console.error('Invite members error:', err);
    res.status(500).json({ error: 'Failed to process invitations' });
  }
});

// 12. Get pending invitations for the current user
router.get('/invitations', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, g.name as group_name, u.name as inviter_name
      FROM group_invitations i
      JOIN discussion_groups g ON i.group_id = g.id
      JOIN users u ON i.invited_by = u.id
      WHERE i.email = $1 AND i.status = 'pending'
      ORDER BY i.created_at DESC
    `, [req.user.email]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch invitations error:', err);
    res.status(500).json({ error: 'Failed to retrieve invitations' });
  }
});

// 13. Accept group invitation
router.post('/invitations/:inviteId/accept', authenticate, async (req, res) => {
  try {
    const { inviteId } = req.params;
    
    const inviteQuery = await query(
      `SELECT * FROM group_invitations WHERE id = $1 AND email = $2 AND status = 'pending'`,
      [inviteId, req.user.email]
    );

    if (inviteQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Pending invitation not found' });
    }

    const invite = inviteQuery.rows[0];

    // Update invitation
    await query(
      `UPDATE group_invitations SET status = 'accepted' WHERE id = $1`,
      [inviteId]
    );

    // Add to members
    await query(
      `INSERT INTO group_members (id, group_id, user_id, role) 
       VALUES ($1, $2, $3, 'member')
       ON CONFLICT (group_id, user_id) DO UPDATE SET role = 'member'`,
      [crypto.randomUUID(), invite.group_id, req.user.id]
    );

    res.json({ success: true, message: 'Invitation accepted successfully' });
  } catch (err) {
    console.error('Accept invite error:', err);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// 14. Reject group invitation
router.post('/invitations/:inviteId/reject', authenticate, async (req, res) => {
  try {
    const { inviteId } = req.params;

    const result = await query(
      `UPDATE group_invitations SET status = 'rejected' WHERE id = $1 AND email = $2 AND status = 'pending' RETURNING 1`,
      [inviteId, req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pending invitation not found' });
    }

    res.json({ success: true, message: 'Invitation rejected successfully' });
  } catch (err) {
    console.error('Reject invite error:', err);
    res.status(500).json({ error: 'Failed to reject invitation' });
  }
});

// 15. Get members of a specific group
router.get('/groups/:groupId/members', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists
    const groupInfo = await query(`SELECT created_by FROM discussion_groups WHERE id = $1`, [groupId]);
    if (groupInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // If private, verify requester is a member
    if (groupInfo.rows[0].created_by !== null) {
      const memberCheck = await query(
        `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, req.user.id]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Fetch members
    const result = await query(`
      SELECT u.id, u.name, u.email, gm.role, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_at ASC
    `, [groupId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch group members error:', err);
    res.status(500).json({ error: 'Failed to retrieve members list' });
  }
});

// 16. Update a member's role (promote to admin)
router.post('/groups/:groupId/members/:userId/role', authenticate, async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;

    if (role !== 'admin') {
      return res.status(400).json({ error: 'Only promotion to admin is supported' });
    }

    // Check if current user is admin of group
    const myMemberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, req.user.id]
    );

    if (myMemberCheck.rows.length === 0 || myMemberCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins can update roles' });
    }

    // Update role
    const result = await query(
      `UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3 RETURNING 1`,
      [role, groupId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found in this group' });
    }

    res.json({ success: true, message: `Member successfully promoted to ${role}` });
  } catch (err) {
    console.error('Update member role error:', err);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// 17. Get channels owned by current user
router.get('/my-channels', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM channel_follows WHERE channel_id = c.id) as followers_count
       FROM channels c
       WHERE c.owner_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch my channels error:', err);
    res.status(500).json({ error: 'Failed to retrieve channels' });
  }
});

// 18. Update channel details
router.put('/channels/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, avatar_url, is_premium, price } = req.body;

    // Check ownership
    const channelRes = await query('SELECT owner_id, name FROM channels WHERE id = $1', [id]);
    if (channelRes.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    if (channelRes.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this channel' });
    }

    // Check name uniqueness if changed
    if (name && name.toLowerCase() !== channelRes.rows[0].name.toLowerCase()) {
      const checkRes = await query('SELECT id FROM channels WHERE LOWER(name) = LOWER($1) AND id != $2', [name, id]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ error: 'Channel name already exists' });
      }
    }

    await query(
      `UPDATE channels 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           avatar_url = COALESCE($3, avatar_url),
           is_premium = COALESCE($4, is_premium),
           price = COALESCE($5, price)
       WHERE id = $6`,
      [name, description, avatar_url, is_premium, price, id]
    );

    res.json({ success: true, message: 'Channel updated successfully' });
  } catch (err) {
    console.error('Update channel error:', err);
    res.status(500).json({ error: 'Failed to update channel' });
  }
});

// 19. Delete channel
router.delete('/channels/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const channelRes = await query('SELECT owner_id FROM channels WHERE id = $1', [id]);
    if (channelRes.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    if (channelRes.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this channel' });
    }

    await query('DELETE FROM channels WHERE id = $1', [id]);
    res.json({ success: true, message: 'Channel deleted successfully' });
  } catch (err) {
    console.error('Delete channel error:', err);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

// 20. Get posts published by current user
router.get('/my-posts', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, 
              u.name as author_name,
              c.name as channel_name,
              c.avatar_url as channel_avatar
       FROM community_posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN channels c ON p.channel_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch my posts error:', err);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// 21. Delete post
router.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const postRes = await query('SELECT user_id FROM community_posts WHERE id = $1', [id]);
    if (postRes.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (postRes.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not own this post' });
    }

    await query('DELETE FROM community_posts WHERE id = $1', [id]);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
