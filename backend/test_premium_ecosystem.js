require('dotenv').config();
const { query } = require('./src/db/index');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'Nonstock-super-secret-key-2025';
const PORT = process.env.PORT || 3000;

async function runTest() {
  console.log('🚀 Starting Premium Creator Ecosystem Integration Test...');

  // 1. Create mock users
  const creatorId = 'creator_test_' + crypto.randomBytes(4).toString('hex');
  const followerId = 'follower_test_' + crypto.randomBytes(4).toString('hex');
  const adminId = 'admin_test_' + crypto.randomBytes(4).toString('hex');

  const creatorEmail = `creator_${creatorId}@test.com`;
  const followerEmail = `follower_${followerId}@test.com`;
  const adminEmail = `admin_${adminId}@test.com`;

  // Insert Creator User (Starts with 10,000 virtual balance)
  await query(
    `INSERT INTO users (id, name, email, password, virtual_balance) 
     VALUES ($1, $2, $3, $4, 10000)`,
    [creatorId, 'Professional Educator', creatorEmail, 'password123']
  );

  // Insert Follower User (Starts with 1,000 virtual balance)
  await query(
    `INSERT INTO users (id, name, email, password, virtual_balance) 
     VALUES ($1, $2, $3, $4, 1000)`,
    [followerId, 'Leasing Learner', followerEmail, 'password123']
  );

  // Insert Admin User (Starts with 100 virtual balance, is_admin = true)
  await query(
    `INSERT INTO users (id, name, email, password, is_admin) 
     VALUES ($1, $2, $3, $4, true)`,
    [adminId, 'Platform Administrator', adminEmail, 'password123']
  );

  console.log('✅ Mock users created successfully.');

  // Create mock sessions
  const creatorSess = 'sess_c_' + crypto.randomBytes(4).toString('hex');
  const followerSess = 'sess_f_' + crypto.randomBytes(4).toString('hex');
  const adminSess = 'sess_a_' + crypto.randomBytes(4).toString('hex');

  await query(`INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`, [creatorSess, creatorId, creatorSess]);
  await query(`INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`, [followerSess, followerId, followerSess]);
  await query(`INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`, [adminSess, adminId, adminSess]);

  // Generate tokens
  const creatorToken = jwt.sign({ id: creatorId, sessionId: creatorSess, name: 'Professional Educator' }, JWT_SECRET);
  const followerToken = jwt.sign({ id: followerId, sessionId: followerSess, name: 'Leasing Learner' }, JWT_SECRET);
  const adminToken = jwt.sign({ id: adminId, sessionId: adminSess, name: 'Platform Administrator' }, JWT_SECRET);

  const makeReq = async (token, method, path, body = null) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`http://localhost:${PORT}${path}`, options);
    const json = await res.json();
    return { status: res.status, json };
  };

  try {
    // ==========================================
    // STEP 1: Educator Verification Workflow
    // ==========================================
    console.log('\n--- Step 1: Educator Verification Request ---');
    const reqVer = await makeReq(creatorToken, 'POST', '/api/user/request-verification', {
      title: 'Options Trading Expert',
      proof: 'Unsplash & YouTube channel links demonstrating 5yr track record.'
    });
    console.log('Request Status:', reqVer.status, reqVer.json);
    if (reqVer.status !== 200) throw new Error('Failed to request verification');

    // Admin fetches pending verification requests
    console.log('\n--- Step 2: Admin Retrieves Requests ---');
    const getRequests = await makeReq(adminToken, 'GET', '/api/user/verification-requests');
    console.log('Pending requests count:', getRequests.json.length);
    const myRequestIndex = getRequests.json.findIndex(r => r.id === creatorId);
    if (myRequestIndex === -1) throw new Error('Verification request not in pending list');
    console.log('Creator request detail:', getRequests.json[myRequestIndex]);

    // Admin approves verification
    console.log('\n--- Step 3: Admin Approves Verification ---');
    const appReq = await makeReq(adminToken, 'POST', `/api/user/verify/${creatorId}`, {
      status: 'approved',
      title: 'Options Trading Expert'
    });
    console.log('Approval Status:', appReq.status, appReq.json);
    if (appReq.status !== 200) throw new Error('Failed to approve verification');

    // ==========================================
    // STEP 2: Premium Channel Setup
    // ==========================================
    console.log('\n--- Step 4: Create Premium Channel ---');
    const createChan = await makeReq(creatorToken, 'POST', '/api/community/channels', {
      name: 'Titan Option Alerts',
      description: 'Gated premium weekly options analysis',
      avatar_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
      is_premium: true,
      price: 400.00
    });
    console.log('Create Channel Status:', createChan.status, createChan.json);
    if (createChan.status !== 200 && createChan.status !== 201) throw new Error('Failed to create premium channel');
    const channelId = createChan.json.channelId;

    // Creator publishes a premium post
    console.log('\n--- Step 5: Publish Post under Premium Channel ---');
    const createPost = await makeReq(creatorToken, 'POST', '/api/community/posts', {
      title: 'NIFTY Bull Call Spread Alert',
      content: 'Buy NIFTY 24500 Call and Sell 24600 Call. Max risk is ₹4,000, target profit is ₹6,000.',
      channel_id: channelId,
      image_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f'
    });
    console.log('Publish Post Status:', createPost.status, createPost.json);
    if (createPost.status !== 200 && createPost.status !== 201) throw new Error('Failed to publish post');
    const postId = createPost.json.id;

    // ==========================================
    // STEP 3: Content Gating & Redaction Check
    // ==========================================
    console.log('\n--- Step 6: Follower Views Feed (Post Redacted) ---');
    const viewPostsPre = await makeReq(followerToken, 'GET', '/api/community/posts');
    const targetPostPre = viewPostsPre.json.find(p => p.id === postId);
    if (!targetPostPre) throw new Error('Published post not visible in community feed');
    console.log('Post Redacted Content Check:', targetPostPre.content);
    console.log('Post Image URL (should be null):', targetPostPre.image_url);
    console.log('Post is_redacted flag:', targetPostPre.is_redacted);
    if (!targetPostPre.is_redacted) throw new Error('Premium post was NOT gated/redacted!');

    // ==========================================
    // STEP 4: Premium Subscription Payment Flow
    // ==========================================
    console.log('\n--- Step 7: Follower Subscribes to Premium Channel ---');
    const subscribeChan = await makeReq(followerToken, 'POST', `/api/community/channels/${channelId}/follow`);
    console.log('Subscribe Status:', subscribeChan.status, subscribeChan.json);
    if (subscribeChan.status !== 200) throw new Error('Premium subscription failed');

    // Verify virtual balances
    console.log('\n--- Step 8: Verify Transaction Balances ---');
    const creatorUserObj = await makeReq(creatorToken, 'GET', '/api/user/profile');
    const followerUserObj = await makeReq(followerToken, 'GET', '/api/user/profile');
    console.log('Creator Balance (Should be 10000 + 400 = 10400):', creatorUserObj.json.virtual_balance);
    console.log('Follower Balance (Should be 1000 - 400 = 600):', followerUserObj.json.virtual_balance);
    if (parseFloat(creatorUserObj.json.virtual_balance) !== 10400) throw new Error('Creator balance not credited');
    if (parseFloat(followerUserObj.json.virtual_balance) !== 600) throw new Error('Follower balance not deducted');

    // Follower checks post again (should be unlocked now)
    console.log('\n--- Step 9: Follower Views Unlocked Content ---');
    const viewPostsPost = await makeReq(followerToken, 'GET', '/api/community/posts');
    const targetPostPost = viewPostsPost.json.find(p => p.id === postId);
    console.log('Post Unlocked Content:', targetPostPost.content);
    console.log('Post Image URL (should be unlocked):', targetPostPost.image_url);
    console.log('Post is_redacted flag:', targetPostPost.is_redacted);
    if (targetPostPost.is_redacted) throw new Error('Premium post remained redacted after subscription!');

    // ==========================================
    // STEP 5: AI Mentor Intelligence Check
    // ==========================================
    console.log('\n--- Step 10: AI Mentor Support & Resistance Query ---');
    const aiResSupport = await makeReq(followerToken, 'POST', '/api/ai/ask', {
      message: 'Explain how Support and Resistance levels work'
    });
    console.log('AI Response Snippet:', aiResSupport.json.response.substring(0, 200) + '...');
    if (!aiResSupport.json.response.includes('Support') || !aiResSupport.json.response.includes('Resistance')) {
      throw new Error('AI response did not satisfy the support/resistance query');
    }

    console.log('\n--- Step 11: AI Mentor Options Query ---');
    const aiResOptions = await makeReq(followerToken, 'POST', '/api/ai/ask', {
      message: 'What are option calls and puts?'
    });
    console.log('AI Response Snippet:', aiResOptions.json.response.substring(0, 200) + '...');
    if (!aiResOptions.json.response.toLowerCase().includes('option') || !aiResOptions.json.response.toLowerCase().includes('call')) {
      throw new Error('AI response did not satisfy the options query');
    }

    console.log('\n🧹 Cleaning up test records...');
    await query('DELETE FROM channel_follows WHERE channel_id = $1', [channelId]);
    await query('DELETE FROM community_posts WHERE channel_id = $1', [channelId]);
    await query('DELETE FROM channels WHERE id = $1', [channelId]);
    await query('DELETE FROM sessions WHERE user_id IN ($1, $2, $3)', [creatorId, followerId, adminId]);
    await query('DELETE FROM users WHERE id IN ($1, $2, $3)', [creatorId, followerId, adminId]);
    console.log('✅ Clean up complete.');

    console.log('\n🎉 ALL CREATOR ECOSYSTEM INTEGRATION TESTS PASSED PERFECTLY!');
  } catch (error) {
    console.error('❌ Integration test error:', error);
    // clean up on failure
    await query('DELETE FROM sessions WHERE user_id IN ($1, $2, $3)', [creatorId, followerId, adminId]);
    await query('DELETE FROM users WHERE id IN ($1, $2, $3)', [creatorId, followerId, adminId]);
    process.exit(1);
  }
}

runTest();
