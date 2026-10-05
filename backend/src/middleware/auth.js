const jwt = require('jsonwebtoken');
const { query } = require('../db/index');

async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.sessionId) {
      const sessionResult = await query(
        `SELECT s.*, u.current_session_id, u.current_device_id,
                CASE WHEN s.expires_at <= NOW() THEN true ELSE false END as is_expired
         FROM sessions s 
         LEFT JOIN users u ON u.id = s.user_id 
         WHERE s.id = $1 AND s.user_id = $2`,
        [decoded.sessionId, decoded.id]
      );

      if (sessionResult.rows.length === 0) {
        return res.status(401).json({ error: 'Session expired or not found. Please log in again.', code: 'SESSION_NOT_FOUND' });
      }

      const session = sessionResult.rows[0];

      // Check if session has been invalidated
      if (!session.is_valid) {
        return res.status(401).json({ error: 'Session has been logged out. Please log in again.', code: 'SESSION_INVALID' });
      }

      // Check if session has expired
      if (session.is_expired) {
        return res.status(401).json({ error: 'Session expired. Please log in again.', code: 'SESSION_EXPIRED' });
      }

      // Touch session activity & extend expiry for active sessions
      await query(`UPDATE sessions SET last_active = NOW(), expires_at = NOW() + INTERVAL '30 days' WHERE id = $1`, [decoded.sessionId]);

      req.deviceId = session.device_id;
      req.sessionId = decoded.sessionId;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
}

module.exports = { authenticate };