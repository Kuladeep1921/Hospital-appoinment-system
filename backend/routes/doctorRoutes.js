const express = require('express');
const router = express.Router();
const { getDoctors, addDoctor, deleteDoctor } = require('../controllers/doctorController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getDoctors);
router.post('/', protect, adminOnly, addDoctor);
router.delete('/:id', protect, adminOnly, deleteDoctor);

module.exports = router;
