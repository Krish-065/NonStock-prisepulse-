const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { query } = require('../db/index');
const { authenticate } = require('../middleware/auth');

// Plans configuration
const PLANS = {
  monthly: { amount: 49900, currency: 'INR', name: 'PrisePulse Pro — Monthly', description: 'Unlimited AI Mentor, Live Charts, Option Greeks' },
  quarterly: { amount: 129900, currency: 'INR', name: 'PrisePulse Pro — Quarterly', description: '3 months of full Pro access' },
  annual: { amount: 399900, currency: 'INR', name: 'PrisePulse Pro — Annual (Best Value)', description: '12 months — save 33%' },
};

// Initialize Razorpay (gracefully handles missing keys for dev)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized');
} else {
  console.warn('⚠️  Razorpay keys not found in .env — payment routes will return 503 until configured');
}

// ─── POST /api/payment/create-order ──────────────────────────────────────────
router.post('/create-order', authenticate, async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({
      error: 'Payment gateway not configured',
      hint: 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend .env'
    });
  }

  const { plan = 'monthly' } = req.body;
  const planConfig = PLANS[plan];
  if (!planConfig) {
    return res.status(400).json({ error: 'Invalid plan. Choose: monthly, quarterly, annual' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: planConfig.amount,      // in paise (₹499 = 49900 paise)
      currency: planConfig.currency,
      receipt: `receipt_${req.user.id}_${Date.now()}`,
      notes: {
        user_id: String(req.user.id),
        plan,
        user_email: req.user.email || '',
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan,
      planName: planConfig.name,
      description: planConfig.description,
    });
  } catch (err) {
    console.error('[Razorpay] Create order error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// ─── POST /api/payment/verify ─────────────────────────────────────────────────
router.post('/verify', authenticate, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }

  // Verify HMAC signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    console.error('[Razorpay] Signature mismatch!');
    return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
  }

  // Calculate expiry based on plan
  const expiryMap = { monthly: 30, quarterly: 90, annual: 365 };
  const days = expiryMap[plan] || 30;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  try {
    // Upgrade user to Pro in database
    await query(
      `UPDATE users
       SET is_pro = true,
           pro_plan = $1,
           pro_status = 'active',
           pro_expires_at = $2,
           virtual_balance = GREATEST(virtual_balance, 1000000)
       WHERE id = $3`,
      [plan, expiresAt.toISOString(), req.user.id]
    );

    console.log(`✅ [Razorpay] User ${req.user.id} upgraded to Pro (${plan}) — expires ${expiresAt.toDateString()}`);

    res.json({
      success: true,
      message: `Welcome to PrisePulse Pro! Your ${plan} plan is now active.`,
      proExpiresAt: expiresAt.toISOString(),
      plan,
    });
  } catch (err) {
    console.error('[Razorpay] DB upgrade error:', err);
    res.status(500).json({ error: 'Payment verified but failed to activate Pro. Contact support.' });
  }
});

// ─── GET /api/payment/plans ───────────────────────────────────────────────────
router.get('/plans', (req, res) => {
  res.json({
    plans: Object.entries(PLANS).map(([key, p]) => ({
      id: key,
      name: p.name,
      description: p.description,
      amount: p.amount,
      amountFormatted: `₹${(p.amount / 100).toLocaleString('en-IN')}`,
      currency: p.currency,
    })),
    razorpayConfigured: !!razorpay,
  });
});

module.exports = router;
