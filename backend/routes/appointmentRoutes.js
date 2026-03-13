const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getUserAppointments,
    getAllAppointments,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, bookAppointment);
router.get('/user', protect, getUserAppointments);
router.get('/', protect, adminOnly, getAllAppointments);
router.patch('/:id/status', protect, adminOnly, updateAppointmentStatus);

router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
