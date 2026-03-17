const express = require('express');
const router = express.Router();
const { suggestDoctor } = require('../controllers/chatbotController');

router.post('/suggest-doctor', suggestDoctor);

module.exports = router;
