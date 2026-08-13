const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

// Endpoint: POST /api/ai/mentor
router.post('/mentor', authenticate, aiController.getMentorResponse);

// Endpoint: GET /api/ai/technicals/:symbol
router.get('/technicals/:symbol', authenticate, aiController.getLiveTechnicals);

module.exports = router;
