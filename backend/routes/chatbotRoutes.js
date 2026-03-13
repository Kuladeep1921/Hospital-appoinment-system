const express = require('express');
const router = express.Router();
const { suggestDoctor } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/suggest-doctor', protect, suggestDoctor);

module.exports = router;
