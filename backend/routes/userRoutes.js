const express = require('express');
const router = express.Router();
const { getPatients, deletePatient } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/patients', protect, adminOnly, getPatients);
router.delete('/patients/:id', protect, adminOnly, deletePatient);

module.exports = router;
