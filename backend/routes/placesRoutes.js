const express = require('express');
const router = express.Router();
const { getLiveHospitals } = require('../controllers/placesController');
const { protect } = require('../middleware/authMiddleware');

router.get('/hospitals', protect, getLiveHospitals);

module.exports = router;
