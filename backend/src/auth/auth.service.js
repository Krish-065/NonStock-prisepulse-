const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const https = require('https');
const { query } = require('../db/index');
const { processLoginReward } = require('../services/gamificationService');

function generateUUID() {
  return crypto.randomUUID();
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((error, success) => {
  if (error) console.error('❌ SMTP Error:', error.message);
  else console.log('✅ SMTP Ready');
});

async function sendVerificationEmail(email, otp) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid rgba(0, 255, 136, 0.25); border-radius: 16px; background-color: #0a0e27; color: #ffffff; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
      <h2 style="color: #00ff88; margin-top: 0; font-size: 22px; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; text-align: center;">Stocks Operator Verification</h2>
      <p style="font-size: 15px; color: #e1e3e6; line-height: 1.5; text-align: center; margin-top: 16px;">
        Please verify your email address to complete your registration. Your one-time verification password (OTP) is:
      </p>
      <div style="background: rgba(0, 255, 136, 0.08); border: 1px dashed #00ff88; border-radius: 12px; padding: 16px; font-size: 26px; font-weight: 800; letter-spacing: 6px; text-align: center; color: #00ff88; margin: 24px 0; font-family: monospace;">
        ${otp}
      </div>
      <p style="font-size: 13px; color: #9b9eac; text-align: center; margin-bottom: 0; line-height: 1.4;">
        This code is valid for <strong>10 minutes</strong>. <br />
        If you did not initiate this request, you can safely ignore this email.
      </p>
    </div>
  `;

  // 1. Try sending via Brevo's HTTP API (bypasses Render free tier port 587 outgoing firewall!)
  if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.startsWith('xsmtpsib-')) {
    try {
      console.log('Attempting to send verification email via Brevo HTTP API...');
      const apiResult = await new Promise((resolve, reject) => {
        const postData = JSON.stringify({
          sender: {
            name: process.env.FROM_NAME || 'Stocks Operator',
            email: process.env.FROM_EMAIL
          },
          to: [{ email }],
          subject: 'Verify your email - Stocks Operator',
          htmlContent: html
        });

        const options = {
          hostname: 'api.brevo.com',
          port: 443,
          path: '/v3/smtp/email',
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.EMAIL_PASS,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(postData)
          }
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve({ success: true, body: JSON.parse(body) });
              } catch (e) {
                resolve({ success: true, body: { messageId: 'unknown' } });
              }
            } else {
              resolve({ success: false, error: body });
            }
          });
        });

        req.on('error', (err) => { reject(err); });
        req.write(postData);
        req.end();
      });

      if (apiResult.success) {
        console.log('✅ Email successfully delivered via Brevo HTTP API! Message ID:', apiResult.body.messageId);
        return;
      } else {
        console.warn('⚠️ Brevo HTTP API rejected request, trying standard SMTP backup. Error:', apiResult.error);
      }
    } catch (apiError) {
      console.warn('⚠️ Brevo HTTP API request failed, trying standard SMTP backup. Error:', apiError.message);
    }
  }

  // 2. Fallback to standard SMTP (works locally)
  console.log('Sending verification email via traditional SMTP...');
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Verify your email - Stocks Operator',
    html,
  });
}

async function sendResetEmail(email, resetUrl) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Reset your Stocks Operator password</h2>
      <p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Reset your password - Stocks Operator',
    html,
  });
}

async function sendPasswordChangeNotificationEmail(email, userName) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid rgba(255, 51, 102, 0.25); border-radius: 16px; background-color: #0a0e27; color: #ffffff; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
      <h2 style="color: #ff3366; margin-top: 0; font-size: 22px; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; text-align: center;">Security Alert: Password Changed</h2>
      <p style="font-size: 15px; color: #e1e3e6; line-height: 1.5;">
        Hello ${userName || 'Investor'},
      </p>
      <p style="font-size: 15px; color: #e1e3e6; line-height: 1.5;">
        This email confirms that the password for your <strong>Stocks Operator</strong> account has been successfully updated.
      </p>
      <div style="background: rgba(255, 51, 102, 0.08); border-left: 4px solid #ff3366; border-radius: 4px; padding: 12px; margin: 20px 0; color: #e1e3e6; font-size: 14px;">
        <strong>Details:</strong><br />
        • Date/Time: ${new Date().toUTCString()}<br />
        • Action: Password Update
      </div>
      <p style="font-size: 14px; color: #e1e3e6; line-height: 1.5;">
        If you performed this action, no further steps are required.
      </p>
      <p style="font-size: 14px; color: #ff3366; line-height: 1.5; font-weight: 700;">
        If you did NOT perform this action, please reset your password immediately or contact our support team to secure your account.
      </p>
      <p style="font-size: 13px; color: #9b9eac; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; margin-bottom: 0;">
        This is an automated security notification. Please do not reply directly to this email.
      </p>
    </div>
  `;

  if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.startsWith('xsmtpsib-')) {
    try {
      console.log('Attempting to send password change notification via Brevo HTTP API...');
      const postData = JSON.stringify({
        sender: {
          name: process.env.FROM_NAME || 'Stocks Operator',
          email: process.env.FROM_EMAIL
        },
        to: [{ email }],
        subject: 'Security Alert: Password Changed - Stocks Operator',
        htmlContent: html
      });

      const apiResult = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.brevo.com',
          port: 443,
          path: '/v3/smtp/email',
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.EMAIL_PASS,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(postData)
          }
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve({ success: true, body: JSON.parse(body) });
              } catch (e) {
                resolve({ success: true, body: { messageId: 'unknown' } });
              }
            } else {
              resolve({ success: false, error: body });
            }
          });
        });

        req.on('error', (err) => { reject(err); });
        req.write(postData);
        req.end();
      });

      if (apiResult.success) {
        console.log('✅ Password change email delivered via Brevo HTTP API!');
        return;
      } else {
        console.warn('⚠️ Brevo HTTP API rejected request, trying standard SMTP backup. Error:', apiResult.error);
      }
    } catch (apiError) {
      console.warn('⚠️ Brevo HTTP API request failed, trying standard SMTP backup. Error:', apiError.message);
    }
  }

  console.log('Sending password change email via traditional SMTP...');
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Security Alert: Password Changed - Stocks Operator',
    html,
  });
}

// CREATE PERSISTENT DEVICE SESSION (Supports Concurrent Multi-Device Logins)
async function createDeviceSession({ userId, email, ip, userAgent, deviceId, deviceName }) {
  // 1. Generate new session token and ID for this device (does NOT invalidate other devices)
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const sessionId = generateUUID();
  const validDeviceId = deviceId || ('dev_' + crypto.randomBytes(12).toString('hex'));
  const validDeviceName = deviceName || 'Device';

  // 2. Insert new active session with 30-day validity
  await query(
    `INSERT INTO sessions (id, user_id, token, ip_address, user_agent, device_id, device_name, is_valid, expires_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW() + INTERVAL '30 days')`,
    [sessionId, userId, sessionToken, ip, userAgent, validDeviceId, validDeviceName]
  );

  // 3. Update last active device info on user record (informational)
  await query(
    `UPDATE users SET current_session_id = $1, current_device_id = $2, current_device_name = $3 WHERE id = $4`,
    [sessionId, validDeviceId, validDeviceName, userId]
  );

  // 4. Generate long-lived JWT token (30 days) containing sessionId and deviceId
  const jwtToken = jwt.sign(
    { id: userId, email, sessionId, deviceId: validDeviceId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { sessionId, sessionToken, jwtToken, deviceId: validDeviceId };
}

// REGISTER
async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, number & special character' });
    }

    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = generateUUID();
    const userName = name || email.split('@')[0];
    const isAdmin = email.toLowerCase().startsWith('admin@');
    const isPro = email.toLowerCase() === 'krishshah8201@gmail.com';
    const proPlan = isPro ? 'lifetime' : null;

    // Set is_email_verified = false to require email verification
    await query(
      `INSERT INTO users (id, email, password, name, is_email_verified, is_admin, is_pro, pro_plan) VALUES ($1, $2, $3, $4, false, $5, $6, $7)`,
      [userId, email, hashed, userName, isAdmin, isPro, proPlan]
    );

    // Generate OTP and update user
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await query(
      `UPDATE users SET email_verify_token = $1, email_verify_expiry = $2 WHERE id = $3`,
      [otp, expiry, userId]
    );

    // Send verification email asynchronously
    sendVerificationEmail(email, otp).catch(mailError => {
      console.error('❌ SMTP Background Verification Mail Delivery Failed:', mailError.message);
    });

    // Log OTP in console as backup
    console.log(`🔑 [VERIFICATION SECURITY BACKUP] OTP for ${email} is: ${otp}`);

    res.json({
      message: 'Registration successful, please verify your email',
      requiresVerification: true,
      email
    });
  } catch (error) {
    console.error('❌ Registration system error:', error);
    res.status(500).json({ error: 'Registration failed due to a system error.' });
  }
}

// VERIFY EMAIL
async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await query(
      `SELECT * FROM users WHERE email = $1 AND email_verify_token = $2 AND email_verify_expiry > NOW()`,
      [email, otp]
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await query(`UPDATE users SET is_email_verified = true, email_verify_token = NULL, email_verify_expiry = NULL WHERE id = $1`, [user.rows[0].id]);

    const isPro = email.toLowerCase() === 'krishshah8201@gmail.com' ? true : user.rows[0].is_pro;
    const proPlan = email.toLowerCase() === 'krishshah8201@gmail.com' ? 'lifetime' : user.rows[0].pro_plan;

    const deviceId = req.body.deviceId || req.headers['x-device-id'] || req.headers['x_device_id'];
    const deviceName = req.body.deviceName || req.headers['x-device-name'] || req.headers['x_device_name'];
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const { jwtToken } = await createDeviceSession({
      userId: user.rows[0].id,
      email,
      ip: req.ip,
      userAgent,
      deviceId,
      deviceName
    });

    res.json({ message: 'Email verified', token: jwtToken, user: { id: user.rows[0].id, email, name: user.rows[0].name, is_admin: user.rows[0].is_admin, is_pro: isPro, pro_plan: proPlan, has_completed_tutorial: user.rows[0].has_completed_tutorial, has_completed_pro_tutorial: user.rows[0].has_completed_pro_tutorial } });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const ip = req.ip;

    const recent = await query(
      `SELECT COUNT(*) FROM login_attempts WHERE email = $1 AND created_at > NOW() - INTERVAL '15 minutes' AND success = false`,
      [email]
    );
    if (parseInt(recent.rows[0].count) >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }

    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (userRes.rows.length === 0) {
      await query(`INSERT INTO login_attempts (id, email, ip_address, success) VALUES ($1,$2,$3,$4)`, [generateUUID(), email, ip, false]);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await query(`INSERT INTO login_attempts (id, email, ip_address, success) VALUES ($1,$2,$3,$4)`, [generateUUID(), email, ip, false]);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await query(`INSERT INTO login_attempts (id, email, ip_address, success) VALUES ($1,$2,$3,$4)`, [generateUUID(), email, ip, true]);

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      const tempToken = jwt.sign({ id: user.id, isPending2FA: true }, process.env.JWT_SECRET, { expiresIn: '10m' });
      return res.json({ twoFactorRequired: true, tempToken });
    }

    const deviceId = req.body.deviceId || req.headers['x-device-id'] || req.headers['x_device_id'];
    const deviceName = req.body.deviceName || req.headers['x-device-name'] || req.headers['x_device_name'];
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const { jwtToken } = await createDeviceSession({
      userId: user.id,
      email,
      ip,
      userAgent,
      deviceId,
      deviceName
    });

    const isPro = email.toLowerCase() === 'krishshah8201@gmail.com' ? true : user.is_pro;
    const proPlan = email.toLowerCase() === 'krishshah8201@gmail.com' ? 'lifetime' : user.pro_plan;

    // Process dynamic daily login reward and streak
    let loginReward = null;
    try {
      loginReward = await processLoginReward(user.id);
    } catch (e) {
      console.warn('Login reward processing warning:', e.message);
    }

    const updatedUserRes = await query('SELECT gold_coins, login_streak, account_tag, der_score, virtual_balance FROM users WHERE id = $1', [user.id]);
    const uStats = updatedUserRes.rows[0] || {};

    res.json({ 
      message: 'Login successful', 
      token: jwtToken, 
      loginReward,
      user: { 
        id: user.id, 
        email, 
        name: user.name, 
        is_admin: user.is_admin, 
        is_pro: isPro, 
        pro_plan: proPlan, 
        has_completed_tutorial: user.has_completed_tutorial, 
        has_completed_pro_tutorial: user.has_completed_pro_tutorial,
        gold_coins: parseInt(uStats.gold_coins || 100),
        login_streak: parseInt(uStats.login_streak || 1),
        account_tag: uStats.account_tag || 'Contender',
        der_score: parseFloat(uStats.der_score || 75.00),
        virtual_balance: parseFloat(uStats.virtual_balance || 1000.00)
      } 
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
}

// VERIFY 2FA DURING LOGIN
async function verifyTwoFactorLogin(req, res) {
  try {
    const { tempToken, token } = req.body;
    if (!tempToken || !token) {
      return res.status(400).json({ error: 'Missing code or temporary token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Session expired. Please log in again.' });
    }

    if (!decoded.isPending2FA) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const userRes = await query(`SELECT * FROM users WHERE id = $1`, [decoded.id]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid 2FA code' });
    }

    // Code is valid! Complete the login session creation.
    const ip = req.ip;
    const deviceId = req.body.deviceId || req.headers['x-device-id'] || req.headers['x_device_id'];
    const deviceName = req.body.deviceName || req.headers['x-device-name'] || req.headers['x_device_name'];
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const { jwtToken } = await createDeviceSession({
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      deviceId,
      deviceName
    });

    const isPro = user.email.toLowerCase() === 'krishshah8201@gmail.com' ? true : user.is_pro;
    const proPlan = user.email.toLowerCase() === 'krishshah8201@gmail.com' ? 'lifetime' : user.pro_plan;
    res.json({ message: 'Login successful', token: jwtToken, user: { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin, is_pro: isPro, pro_plan: proPlan, has_completed_tutorial: user.has_completed_tutorial, has_completed_pro_tutorial: user.has_completed_pro_tutorial } });
  } catch (error) {
    console.error('❌ 2FA login verification failed:', error);
    res.status(500).json({ error: '2FA login verification failed' });
  }
}


// FORGOT PASSWORD
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (user.rows.length === 0) {
      return res.json({ message: 'If your email is registered, you will receive a reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await query(`UPDATE users SET email_verify_token = $1, email_verify_expiry = $2 WHERE email = $3`, [resetToken, expiry, email]);

    let origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    if (!origin.startsWith('http')) {
      origin = `https://${origin}`;
    }
    const resetUrl = `${origin}/reset-password?token=${resetToken}&email=${email}`;
    
    // Send reset email asynchronously in the background so the client doesn't hang!
    sendResetEmail(email, resetUrl).catch(mailError => {
      console.error('❌ SMTP Background Reset Mail Delivery Failed:', mailError.message);
    });

    // Always log the reset link to the console immediately as a secure backup in Render logs!
    console.log(`🔑 [RESET PASSWORD SECURITY BACKUP] Reset URL for ${email} is: ${resetUrl}`);

    res.json({ message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('❌ Forgot password system error:', error);
    res.status(500).json({ error: 'Failed to request password reset due to a system error.' });
  }
}

// RESET PASSWORD
async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, number & special character' });
    }

    const user = await query(
      `SELECT * FROM users WHERE email = $1 AND email_verify_token = $2 AND email_verify_expiry > NOW()`,
      [email, token]
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password = $1, email_verify_token = NULL, email_verify_expiry = NULL WHERE email = $2`, [hashed, email]);
    await query(`UPDATE sessions SET is_valid = false WHERE user_id = $1`, [user.rows[0].id]);

    res.json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
}

// GET SESSIONS
async function getSessions(req, res) {
  try {
    const result = await query(
      `SELECT id, ip_address, user_agent, device_id, device_name, last_active, created_at, expires_at FROM sessions WHERE user_id = $1 AND is_valid = true ORDER BY last_active DESC`,
      [req.user.id]
    );
    res.json({ sessions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

// LOGOUT CURRENT SESSION
async function logout(req, res) {
  try {
    if (req.sessionId) {
      await query(`UPDATE sessions SET is_valid = false WHERE id = $1 AND user_id = $2`, [req.sessionId, req.user.id]);
    }
    await query(
      `UPDATE users SET current_session_id = NULL, current_device_id = NULL, current_device_name = NULL WHERE id = $1 AND current_session_id = $2`,
      [req.user.id, req.sessionId]
    );
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}

// LOGOUT SPECIFIC SESSION
async function logoutSession(req, res) {
  try {
    await query(`UPDATE sessions SET is_valid = false WHERE id = $1 AND user_id = $2`, [req.params.sessionId, req.user.id]);
    await query(
      `UPDATE users SET current_session_id = NULL, current_device_id = NULL, current_device_name = NULL WHERE id = $1 AND current_session_id = $2`,
      [req.user.id, req.params.sessionId]
    );
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
}

// 2FA SETUP
async function setupTwoFactor(req, res) {
  try {
    const secret = speakeasy.generateSecret({ name: `Stocks Operator (${req.user.email})` });
    await query(`UPDATE users SET two_factor_secret = $1 WHERE id = $2`, [secret.base32, req.user.id]);
    res.json({
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret.otpauth_url)}`,
    });
  } catch (error) {
    res.status(500).json({ error: '2FA setup failed' });
  }
}

// VERIFY AND ENABLE 2FA
async function verifyAndEnableTwoFactor(req, res) {
  try {
    const { token } = req.body;
    const user = await query(`SELECT two_factor_secret FROM users WHERE id = $1`, [req.user.id]);
    const verified = speakeasy.totp.verify({
      secret: user.rows[0].two_factor_secret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) return res.status(400).json({ error: 'Invalid 2FA code' });
    await query(`UPDATE users SET two_factor_enabled = true WHERE id = $1`, [req.user.id]);
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ error: '2FA verification failed' });
  }
}

// DISABLE 2FA
async function disableTwoFactor(req, res) {
  try {
    const { token } = req.body;
    const user = await query(`SELECT two_factor_secret FROM users WHERE id = $1`, [req.user.id]);
    const verified = speakeasy.totp.verify({
      secret: user.rows[0].two_factor_secret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) return res.status(400).json({ error: 'Invalid 2FA code' });
    await query(`UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1`, [req.user.id]);
    res.json({ message: '2FA disabled' });
  } catch (error) {
    res.status(500).json({ error: 'Disable 2FA failed' });
  }
}

// CHANGE PASSWORD (AUTHENTICATED)
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please fill in all fields' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, number & special character' });
    }

    const userRes = await query(`SELECT password, email, name FROM users WHERE id = $1`, [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, req.user.id]);

    // Send email notification asynchronously so we don't block the API response
    sendPasswordChangeNotificationEmail(user.email, user.name).catch((mailErr) => {
      console.error('❌ Failed to send password change email:', mailErr.message);
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ error: 'Password update failed' });
  }
}

// GOOGLE SIGN-IN / SIGN-UP
async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google Credential is required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '416992875765-gdh7ncmsipfgnh3o8vrc95igg6ifdio1.apps.googleusercontent.com';
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    const ip = req.ip;

    // Check if user exists by google_id or email
    let userRes = await query(`SELECT * FROM users WHERE google_id = $1`, [googleId]);
    let user;

    if (userRes.rows.length > 0) {
      user = userRes.rows[0];
    } else {
      // Check if user exists by email
      userRes = await query(`SELECT * FROM users WHERE email = $1`, [email]);
      if (userRes.rows.length > 0) {
        // Link google account
        user = userRes.rows[0];
        await query(`UPDATE users SET google_id = $1 WHERE id = $2`, [googleId, user.id]);
        user.google_id = googleId;
      } else {
        // Register new user via Google
        const userId = generateUUID();
        const userName = name || email.split('@')[0];
        const isAdmin = email.toLowerCase().startsWith('admin@');
        const isPro = email.toLowerCase() === 'krishshah8201@gmail.com';
        const proPlan = isPro ? 'lifetime' : null;

        await query(
          `INSERT INTO users (id, email, password, name, is_email_verified, is_admin, is_pro, pro_plan, google_id) 
           VALUES ($1, $2, NULL, $3, true, $4, $5, $6, $7)`,
          [userId, email, userName, isAdmin, isPro, proPlan, googleId]
        );

        const newUserRes = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
        user = newUserRes.rows[0];
      }
    }

    // Create session bound to device (single active device enforcement)
    const deviceId = req.body.deviceId || req.headers['x-device-id'] || req.headers['x_device_id'];
    const deviceName = req.body.deviceName || req.headers['x-device-name'] || req.headers['x_device_name'];
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const { jwtToken } = await createDeviceSession({
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      deviceId,
      deviceName
    });

    const isPro = user.email.toLowerCase() === 'krishshah8201@gmail.com' ? true : user.is_pro;
    const proPlan = user.email.toLowerCase() === 'krishshah8201@gmail.com' ? 'lifetime' : user.pro_plan;

    res.json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin,
        is_pro: isPro,
        pro_plan: proPlan,
        has_completed_tutorial: user.has_completed_tutorial,
        has_completed_pro_tutorial: user.has_completed_pro_tutorial
      }
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
}

// DELETE ACCOUNT (Invalidates user sessions and marks deleted while strictly preserving user record in DB)
async function deleteAccount(req, res) {
  try {
    const userId = req.user?.id || req.body?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Ensure columns exist in users table
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false`).catch(() => {});
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`).catch(() => {});

    // Mark as deleted in DB (preserving all records in database as requested)
    await query(
      `UPDATE users SET is_deleted = true, deleted_at = NOW(), current_session_id = NULL WHERE id = $1`,
      [userId]
    );

    // Invalidate all active sessions for this user in DB
    await query(
      `UPDATE sessions SET is_valid = false WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Account session terminated and permanently removed from device. Database record preserved.'
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({ error: 'Failed to process account deletion' });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  verifyTwoFactorLogin,
  forgotPassword,
  resetPassword,
  getSessions,
  logout,
  logoutSession,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  changePassword,
  googleLogin,
  createDeviceSession,
  deleteAccount,
};