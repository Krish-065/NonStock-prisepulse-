const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

// Endpoint: POST /api/ai/mentor
router.post('/mentor', authenticate, aiController.getMentorResponse);

module.exports = router;
