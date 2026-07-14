require('dotenv').config();
const { query } = require('./src/db/index');

const API_BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('🚀 Starting E2E Integration and Validation Tests...\n');

  // Helper function to perform fetch requests
  async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const status = response.status;
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
    return { status, data };
  }

  // 1. Cleanup existing test accounts/data if any to ensure clean test state
  console.log('🧹 Cleaning up database test records...');
  await query("DELETE FROM group_members WHERE user_id IN (SELECT id FROM users WHERE email IN ($1, $2))", ['tester_student@nonstock.com', 'admin@tester.com']);
  await query("DELETE FROM contests WHERE hosted_by IN (SELECT id FROM users WHERE email IN ($1, $2))", ['tester_student@nonstock.com', 'admin@tester.com']);
  await query("DELETE FROM discussion_groups WHERE created_by IN (SELECT id FROM users WHERE email IN ($1, $2))", ['tester_student@nonstock.com', 'admin@tester.com']);
  await query("DELETE FROM users WHERE email IN ($1, $2)", ['tester_student@nonstock.com', 'admin@tester.com']);
  console.log('✅ Cleanup complete.\n');

  // 2. Register tester student
  console.log('👤 Registering student account (tester_student@nonstock.com)...');
  const studentReg = await apiRequest('/auth/register', 'POST', {
    email: 'tester_student@nonstock.com',
    password: 'Password123!',
    name: 'Student Tester'
  });
  if (studentReg.status !== 200) {
    throw new Error(`Student registration failed: ${JSON.stringify(studentReg.data)}`);
  }
  console.log('   Student registered successfully. Retrieving verification OTP from DB...');
  const studentOtpRes = await query("SELECT email_verify_token FROM users WHERE email = $1", ['tester_student@nonstock.com']);
  const studentOtp = studentOtpRes.rows[0].email_verify_token;
  console.log(`   OTP retrieved: ${studentOtp}. Verifying email...`);
  const studentVerify = await apiRequest('/auth/verify-email', 'POST', {
    email: 'tester_student@nonstock.com',
    otp: studentOtp
  });
  if (studentVerify.status !== 200) {
    throw new Error(`Student verification failed: ${JSON.stringify(studentVerify.data)}`);
  }
  
  console.log('   Logging in student...');
  const studentLogin = await apiRequest('/auth/login', 'POST', {
    email: 'tester_student@nonstock.com',
    password: 'Password123!'
  });
  if (studentLogin.status !== 200) {
    throw new Error(`Student login failed: ${JSON.stringify(studentLogin.data)}`);
  }
  const studentToken = studentLogin.data.token;
  console.log('✅ Student email verified and authenticated!\n');

  // 3. Register tester admin (starts with admin@)
  console.log('🔑 Registering admin account (admin@tester.com)...');
  const adminReg = await apiRequest('/auth/register', 'POST', {
    email: 'admin@tester.com',
    password: 'Password123!',
    name: 'Admin Tester'
  });
  if (adminReg.status !== 200) {
    throw new Error(`Admin registration failed: ${JSON.stringify(adminReg.data)}`);
  }
  console.log('   Admin registered successfully. Retrieving verification OTP from DB...');
  const adminOtpRes = await query("SELECT email_verify_token FROM users WHERE email = $1", ['admin@tester.com']);
  const adminOtp = adminOtpRes.rows[0].email_verify_token;
  console.log(`   OTP retrieved: ${adminOtp}. Verifying email...`);
  const adminVerify = await apiRequest('/auth/verify-email', 'POST', {
    email: 'admin@tester.com',
    otp: adminOtp
  });
  if (adminVerify.status !== 200) {
    throw new Error(`Admin verification failed: ${JSON.stringify(adminVerify.data)}`);
  }
  
  console.log('   Logging in admin...');
  const adminLogin = await apiRequest('/auth/login', 'POST', {
    email: 'admin@tester.com',
    password: 'Password123!'
  });
  if (adminLogin.status !== 200) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
  }
  const adminToken = adminLogin.data.token;
  console.log('✅ Admin email verified and authenticated!\n');

  // 4. Create Public Channel (Student)
  console.log('💬 Creating a new public channel...');
  const createGroup1 = await apiRequest('/community/groups', 'POST', {
    name: 'Student Public Hub',
    features: 'all-can-chat',
    isPublic: true,
    roomId: 'student_hub'
  }, studentToken);
  if (createGroup1.status !== 201) {
    throw new Error(`Group creation failed: ${JSON.stringify(createGroup1.data)}`);
  }
  console.log('✅ Public channel created successfully!');
  console.log('   Room Name: "Student Public Hub"');
  console.log('   Room ID/Handle: "@student_hub"\n');

  // 5. Verify Uniqueness Constraints
  console.log('⚠️ Verifying Room ID and Name uniqueness constraints...');
  
  // Try same Room ID, different Name
  console.log('   Trying to create group with duplicate Room ID ("student_hub")...');
  const dupRoomIdRes = await apiRequest('/community/groups', 'POST', {
    name: 'Different Name But Same ID',
    features: 'all-can-chat',
    isPublic: true,
    roomId: 'student_hub'
  }, studentToken);
  if (dupRoomIdRes.status === 400) {
    console.log(`   ✅ Correctly blocked duplicate Room ID creation. Server response: "${dupRoomIdRes.data.error}"`);
  } else {
    throw new Error(`Failed to block duplicate Room ID. Status code: ${dupRoomIdRes.status}`);
  }

  // Try same Name, different Room ID
  console.log('   Trying to create group with duplicate Room Name ("Student Public Hub")...');
  const dupNameRes = await apiRequest('/community/groups', 'POST', {
    name: 'Student Public Hub',
    features: 'all-can-chat',
    isPublic: true,
    roomId: 'student_hub_new'
  }, studentToken);
  if (dupNameRes.status === 400) {
    console.log(`   ✅ Correctly blocked duplicate Room Name creation. Server response: "${dupNameRes.data.error}"`);
  } else {
    throw new Error(`Failed to block duplicate Room Name. Status code: ${dupNameRes.status}`);
  }
  console.log('');

  // 6. Search Discovery
  console.log('🔍 Testing search discovery for public rooms...');
  const searchRes = await apiRequest('/community/groups/search?q=student', 'GET', null, studentToken);
  if (searchRes.status !== 200 || !Array.isArray(searchRes.data)) {
    throw new Error(`Search failed: ${JSON.stringify(searchRes.data)}`);
  }
  const foundGroup = searchRes.data.find(g => g.room_id === 'student_hub');
  if (foundGroup) {
    console.log(`   ✅ Success! Found public channel "${foundGroup.name}" with room_id "@${foundGroup.room_id}" via search.`);
  } else {
    throw new Error('Created public channel not returned in search results');
  }
  console.log('');

  // 7. Request to Host a Contest (Student)
  console.log('🏆 Submitting request to Host a Contest...');
  const contestRequest = await apiRequest('/community/contests', 'POST', {
    title: 'Option Strategy Face-Off (Automated Test)',
    description: 'A contest testing option strategy configurations and real-time execution.',
    prizePool: '₹50,000 Cash Pool',
    startDate: '2026-08-01',
    endDate: '2026-08-10',
    proofs: 'Verified Option Educator on NSE, registered certificate ID: 890123.'
  }, studentToken);
  if (contestRequest.status !== 201) {
    throw new Error(`Contest request submission failed: ${JSON.stringify(contestRequest.data)}`);
  }
  console.log(`   ✅ Contest request submitted successfully. Status: ${contestRequest.data.message}\n`);

  // 8. Admin Approval Workflow
  console.log('👑 Testing admin approval workflow...');
  
  // Fetch pending contests as Admin
  console.log('   Fetching pending contest requests as Admin...');
  const pendingContests = await apiRequest('/community/contests/pending', 'GET', null, adminToken);
  if (pendingContests.status !== 200) {
    throw new Error(`Fetch pending contests failed: ${JSON.stringify(pendingContests.data)}`);
  }
  const myPendingContest = pendingContests.data.find(c => c.title.includes('Option Strategy Face-Off'));
  if (!myPendingContest) {
    throw new Error('Submitted contest not found in admin pending list');
  }
  console.log(`   ✅ Found pending contest "${myPendingContest.title}" with proofs: "${myPendingContest.proofs}".`);

  // Approve the contest
  console.log(`   Approving contest ID: ${myPendingContest.id}...`);
  const approveRes = await apiRequest(`/community/contests/${myPendingContest.id}/approve`, 'POST', null, adminToken);
  if (approveRes.status !== 200) {
    throw new Error(`Failed to approve contest: ${JSON.stringify(approveRes.data)}`);
  }
  console.log(`   ✅ Contest approved successfully! Response message: "${approveRes.data.message}"\n`);

  // 9. Participate / Verify Joined
  console.log('📊 Verifying that contest is active and student can join/participate...');
  const contestsList = await apiRequest('/community/contests', 'GET', null, studentToken);
  if (contestsList.status !== 200) {
    throw new Error(`Failed to fetch active contests: ${JSON.stringify(contestsList.data)}`);
  }
  const approvedContest = contestsList.data.find(c => c.id === myPendingContest.id);
  if (approvedContest && approvedContest.status === 'approved') {
    console.log(`   ✅ Verified contest is active with status: "${approvedContest.status}".`);
  } else {
    throw new Error('Approved contest not listed as active/approved in public contests list');
  }

  // Join the contest
  console.log(`   Joining contest ID: ${approvedContest.id} as student...`);
  const joinContestRes = await apiRequest(`/community/contests/${approvedContest.id}/join`, 'POST', null, studentToken);
  if (joinContestRes.status !== 200) {
    throw new Error(`Failed to join contest: ${JSON.stringify(joinContestRes.data)}`);
  }
  console.log('   ✅ Successfully joined/participated in the contest!\n');

  // 10. Paper Trading API verification
  console.log('📈 Verifying Paper Trading endpoints...');
  
  // Get initial portfolio
  console.log('   Fetching initial paper portfolio...');
  const initPortfolio = await apiRequest('/paper/portfolio', 'GET', null, studentToken);
  if (initPortfolio.status !== 200) {
    throw new Error(`Failed to fetch initial portfolio: ${JSON.stringify(initPortfolio.data)}`);
  }
  console.log(`   ✅ Initial Virtual Balance: $${initPortfolio.data.virtualBalance}`);
  if (parseFloat(initPortfolio.data.virtualBalance) !== 50000.00) {
    throw new Error(`Expected initial balance to be $50,000, got: $${initPortfolio.data.virtualBalance}`);
  }
  
  // Execute a BUY trade for crypto (USD native)
  console.log('   Executing virtual BUY trade for BTC (quantity: 0.5, price: $50,000)...');
  const buyTrade = await apiRequest('/paper/trade', 'POST', {
    symbol: 'BTC',
    action: 'BUY',
    quantity: 0.5,
    price: 50000
  }, studentToken);
  if (buyTrade.status !== 200) {
    throw new Error(`Virtual BUY trade failed: ${JSON.stringify(buyTrade.data)}`);
  }
  console.log(`   ✅ BUY successful. Message: "${buyTrade.data.message}"`);
  
  // Fetch portfolio and check holding
  console.log('   Checking holdings after BUY...');
  const midPortfolio = await apiRequest('/paper/portfolio', 'GET', null, studentToken);
  const btcHolding = midPortfolio.data.holdings.find(h => h.symbol === 'BTC');
  if (!btcHolding || parseFloat(btcHolding.quantity) !== 0.5) {
    throw new Error(`BTC holding not updated correctly: ${JSON.stringify(midPortfolio.data)}`);
  }
  console.log(`   ✅ BTC holding verified (quantity: ${btcHolding.quantity}, buyPrice: $${btcHolding.buyPrice})`);
  
  // Test Setting SL/TP level on holding
  console.log('   Setting Stop Loss ($45,000) and Take Profit ($60,000) for BTC...');
  const setSlTpRes = await apiRequest('/paper/set-sltp', 'POST', {
    symbol: 'BTC',
    stopLoss: 45000,
    takeProfit: 60000
  }, studentToken);
  if (setSlTpRes.status !== 200) {
    throw new Error(`Set SL/TP failed: ${JSON.stringify(setSlTpRes.data)}`);
  }
  console.log('   ✅ SL/TP saved successfully.');

  // Verify SL/TP are returned in portfolio
  const portfolioWithSl = await apiRequest('/paper/portfolio', 'GET', null, studentToken);
  const btcHoldingWithSl = portfolioWithSl.data.holdings.find(h => h.symbol === 'BTC');
  if (!btcHoldingWithSl || btcHoldingWithSl.stopLoss !== 45000 || btcHoldingWithSl.takeProfit !== 60000) {
    throw new Error(`SL/TP levels not retrieved correctly: ${JSON.stringify(portfolioWithSl.data)}`);
  }
  console.log(`   ✅ Verified SL/TP levels are stored: SL=$${btcHoldingWithSl.stopLoss}, TP=$${btcHoldingWithSl.takeProfit}`);

  // Test Indian Stock trade with exchange rate conversion
  console.log('   Testing Indian stock BUY (RELIANCE.NS, quantity: 10, price: ₹2,400)...');
  const buyReliance = await apiRequest('/paper/trade', 'POST', {
    symbol: 'RELIANCE.NS',
    action: 'BUY',
    quantity: 10,
    price: 2400
  }, studentToken);
  if (buyReliance.status !== 200) {
    throw new Error(`RELIANCE BUY trade failed: ${JSON.stringify(buyReliance.data)}`);
  }
  console.log(`   ✅ RELIANCE BUY successful! Message: "${buyReliance.data.message}"`);

  // Execute a SELL trade for crypto (USD native) with Stop Loss hit trigger
  console.log('   Executing virtual SELL trade for BTC with Stop Loss trigger (quantity: 0.2, price: $60,000)...');
  const sellTrade = await apiRequest('/paper/trade', 'POST', {
    symbol: 'BTC',
    action: 'SELL',
    quantity: 0.2,
    price: 60000,
    triggerReason: 'stop_loss'
  }, studentToken);
  if (sellTrade.status !== 200) {
    throw new Error(`Virtual SELL trade failed: ${JSON.stringify(sellTrade.data)}`);
  }
  console.log(`   ✅ SELL successful. P&L: $${sellTrade.data.profitAndLoss}. consecutiveSlHits is now incremented.`);

  // Verify consecutiveSlHits is 1
  const portfolioAfterSl = await apiRequest('/paper/portfolio', 'GET', null, studentToken);
  if (portfolioAfterSl.data.consecutiveSlHits !== 1) {
    throw new Error(`Expected consecutiveSlHits to be 1, got: ${portfolioAfterSl.data.consecutiveSlHits}`);
  }
  console.log(`   ✅ Verified consecutive SL hits tracked correctly: ${portfolioAfterSl.data.consecutiveSlHits}`);

  // Test Refill capability
  console.log('   Testing account refill ($50,000)...');
  const refillRes = await apiRequest('/paper/refill', 'POST', null, studentToken);
  if (refillRes.status !== 200) {
    throw new Error(`Refill failed: ${JSON.stringify(refillRes.data)}`);
  }
  console.log(`   ✅ Refill successful! Message: "${refillRes.data.message}"`);

  // Verify refill blocked on third attempt (since refill_count is now 2)
  console.log('   Verifying third refill attempt is blocked...');
  const refillAttempt3 = await apiRequest('/paper/refill', 'POST', null, studentToken);
  if (refillAttempt3.status === 400) {
    console.log(`   ✅ Correctly blocked third refill. Message: "${refillAttempt3.data.error}"`);
  } else {
    throw new Error(`Expected third refill to be blocked, but got status: ${refillAttempt3.status}`);
  }

  // 10b. Test Pending Orders (DB storage & Funds Reservation / Refunding / Execution)
  console.log('📈 Testing database-backed Pending Orders & Balance History...');

  // Place a pending LIMIT BUY order (quantity: 0.1, price: $40,000 => Cost: $4,000)
  const balanceBeforePending = parseFloat((await apiRequest('/paper/portfolio', 'GET', null, studentToken)).data.virtualBalance);
  console.log(`   Available balance before placing LIMIT BUY: $${balanceBeforePending}`);

  console.log('   Placing a LIMIT BUY order for BTC (qty: 0.1, price: $40,000)...');
  const placePendingRes = await apiRequest('/paper/orders', 'POST', {
    symbol: 'BTC',
    action: 'BUY',
    type: 'limit',
    quantity: 0.1,
    price: 40000
  }, studentToken);

  if (placePendingRes.status !== 200) {
    throw new Error(`Failed to place pending LIMIT BUY order: ${JSON.stringify(placePendingRes.data)}`);
  }
  const pendingOrderId = placePendingRes.data.order.id;
  console.log(`   ✅ Pending LIMIT BUY order placed successfully with ID: ${pendingOrderId}`);

  // Verify balance was reduced (reserved)
  const balanceAfterPending = parseFloat((await apiRequest('/paper/portfolio', 'GET', null, studentToken)).data.virtualBalance);
  console.log(`   Available balance after placing LIMIT BUY: $${balanceAfterPending}`);
  if (Math.abs(balanceBeforePending - balanceAfterPending - 4000) > 0.01) {
    throw new Error(`Expected balance to be reduced by $4,000, got: $${balanceAfterPending} (Before: $${balanceBeforePending})`);
  }
  console.log('   ✅ Verified that $4,000 was successfully reserved from available balance.');

  // Cancel the pending order
  console.log(`   Cancelling pending LIMIT BUY order with ID: ${pendingOrderId}...`);
  const cancelRes = await apiRequest(`/paper/orders/${pendingOrderId}`, 'DELETE', null, studentToken);
  if (cancelRes.status !== 200) {
    throw new Error(`Failed to cancel pending order: ${JSON.stringify(cancelRes.data)}`);
  }
  console.log('   ✅ Pending order successfully cancelled.');

  // Verify balance was restored
  const balanceAfterCancel = parseFloat((await apiRequest('/paper/portfolio', 'GET', null, studentToken)).data.virtualBalance);
  console.log(`   Available balance after cancellation: $${balanceAfterCancel}`);
  if (Math.abs(balanceAfterCancel - balanceBeforePending) > 0.01) {
    throw new Error(`Expected balance to be restored to $${balanceBeforePending}, got: $${balanceAfterCancel}`);
  }
  console.log('   ✅ Verified that reserved funds were fully refunded to available balance.');

  // Place another LIMIT BUY order to test execution / fill
  console.log('   Placing another LIMIT BUY order to test fill... (qty: 0.1, price: $40,000)');
  const placePendingRes2 = await apiRequest('/paper/orders', 'POST', {
    symbol: 'BTC',
    action: 'BUY',
    type: 'limit',
    quantity: 0.1,
    price: 40000
  }, studentToken);
  const pendingOrderId2 = placePendingRes2.data.order.id;

  // Execute fill via POST /paper/trade using pendingOrderId
  console.log(`   Simulating execution of pending BUY order (ID: ${pendingOrderId2}) at price $40,000...`);
  const fillRes = await apiRequest('/paper/trade', 'POST', {
    symbol: 'BTC',
    action: 'BUY',
    quantity: 0.1,
    price: 40000,
    pendingOrderId: pendingOrderId2
  }, studentToken);

  if (fillRes.status !== 200) {
    throw new Error(`Failed to execute trade fill: ${JSON.stringify(fillRes.data)}`);
  }
  console.log(`   ✅ Pending order fill completed successfully: "${fillRes.data.message}"`);

  // Verify that balance was NOT double-deducted (should still be minus only $4,000 from balanceBeforePending)
  const balanceAfterFill = parseFloat((await apiRequest('/paper/portfolio', 'GET', null, studentToken)).data.virtualBalance);
  console.log(`   Available balance after execution: $${balanceAfterFill}`);
  if (Math.abs(balanceBeforePending - balanceAfterFill - 4000) > 0.01) {
    throw new Error(`Expected balance to be $${balanceBeforePending - 4000}, got: $${balanceAfterFill}`);
  }
  console.log('   ✅ Verified that funds were not double-deducted during execution.');

  // Verify balance history records are correctly created
  console.log('   Fetching balance history logs...');
  const balanceHistoryRes = await apiRequest('/paper/balance-history', 'GET', null, studentToken);
  if (balanceHistoryRes.status !== 200 || balanceHistoryRes.data.history.length === 0) {
    throw new Error(`Failed to retrieve balance history: ${JSON.stringify(balanceHistoryRes.data)}`);
  }
  console.log(`   ✅ Balance history retrieved successfully. Total logs: ${balanceHistoryRes.data.history.length}`);

  // Verify history
  console.log('   Retrieving paper trade history logs...');
  const tradeHistory = await apiRequest('/paper/history', 'GET', null, studentToken);
  if (tradeHistory.status !== 200 || tradeHistory.data.history.length < 3) {
    throw new Error(`Failed to fetch history logs: ${JSON.stringify(tradeHistory.data)}`);
  }
  console.log(`   ✅ History logs retrieved. Total trades in log: ${tradeHistory.data.history.length}`);
  
  // Reset portfolio
  console.log('   Resetting virtual portfolio to default...');
  const resetRes = await apiRequest('/paper/reset', 'POST', null, studentToken);
  if (resetRes.status !== 200) {
    throw new Error(`Failed to reset virtual portfolio: ${JSON.stringify(resetRes.data)}`);
  }
  console.log(`   ✅ Reset successful. Message: "${resetRes.data.message}"\n`);

  console.log('🎉 All E2E Integration and Validation Tests Passed Successfully!');
}

runTests().catch(err => {
  console.error('\n❌ E2E Integration and Validation Tests Failed:', err);
  process.exit(1);
});
