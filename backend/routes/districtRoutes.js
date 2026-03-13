const express = require('express');
const router = express.Router();
const { getDistricts } = require('../controllers/districtController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDistricts);

module.exports = router;
