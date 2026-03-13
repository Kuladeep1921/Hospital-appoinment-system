const express = require('express');
const router = express.Router();
const { getHospitals, createHospital, deleteHospital } = require('../controllers/hospitalController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getHospitals);
router.post('/', protect, adminOnly, createHospital);
router.delete('/:id', protect, adminOnly, deleteHospital);

module.exports = router;
