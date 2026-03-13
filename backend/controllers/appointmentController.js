const Appointment = require('../models/Appointment');

// @desc   Book an appointment
// @route  POST /api/appointments
// @access Private (Admin can use for walk-ins)
const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, problem, patientName, patientPhone } = req.body;

        if (!doctorId || !date || !timeSlot || !problem) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // If it's a walk-in booking by admin, userId may be null, but name/phone should exist
        let userId = req.user._id;
        if (req.user.role === 'admin' && patientName && patientPhone) {
            userId = null; // Walk-in
        }

        const appointment = await Appointment.create({
            userId,
            patientName: patientName || undefined,
            patientPhone: patientPhone || undefined,
            doctorId,
            date,
            timeSlot,
            problem,
            status: req.user.role === 'admin' ? 'Approved' : 'Pending', // Auto-approve walk-ins
        });

        const populated = await Appointment.findById(appointment._id)
            .populate('doctorId', 'name specialization')
            .populate('userId', 'name email phone');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ message: 'Server error booking appointment' });
    }
};

// @desc   Get appointments for logged-in user
// @route  GET /api/appointments/user
// @access Private
const getUserAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user._id })
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });

        res.json(appointments);
    } catch (error) {
        console.error('Get user appointments error:', error);
        res.status(500).json({ message: 'Server error fetching appointments' });
    }
};

// @desc   Get all appointments (admin)
// @route  GET /api/appointments
// @access Private/Admin
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctorId', 'name specialization')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.json(appointments);
    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(500).json({ message: 'Server error fetching appointments' });
    }
};

// @desc   Update appointment status
// @route  PATCH /api/appointments/:id/status
// @access Private/Admin
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
            .populate('doctorId', 'name specialization')
            .populate('userId', 'name email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error updating appointment' });
    }
};

// @desc   Update an appointment (Patient)
// @route  PUT /api/appointments/:id
// @access Private
const updateAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, problem } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Checking if the appointment belongs to the logged in user
        if (appointment.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Only allow edits if status is pending
        if (appointment.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending appointments can be edited' });
        }

        appointment.doctorId = doctorId || appointment.doctorId;
        appointment.date = date || appointment.date;
        appointment.timeSlot = timeSlot || appointment.timeSlot;
        appointment.problem = problem || appointment.problem;

        const updated = await appointment.save();

        const populated = await Appointment.findById(updated._id).populate('doctorId', 'name specialization');
        res.json(populated);
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ message: 'Server error updating appointment' });
    }
};

// @desc   Delete an appointment (Patient)
// @route  DELETE /api/appointments/:id
// @access Private
const deleteAppointment = async (req, res) => {
    try {
        console.log('DELETE request received for ID:', req.params.id);
        console.log('User making request:', { id: req.user._id, role: req.user.role });

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            console.log('Appointment not found');
            return res.status(404).json({ message: 'Appointment not found' });
        }

        console.log('Appointment to delete:', { id: appointment._id, userId: appointment.userId });

        // Allow if user is admin OR if user is the owner
        const isAdmin = req.user.role === 'admin';
        const isOwner = appointment.userId?.toString() === req.user._id.toString();

        console.log('Auth check:', { isAdmin, isOwner });

        if (!isAdmin && !isOwner) {
            console.log('Unauthorized delete attempt');
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Appointment.findByIdAndDelete(req.params.id);
        console.log('Appointment deleted successfully');
        res.json({
            success: true,
            message: 'Appointment deleted successfully',
        });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ message: 'Server error deleting appointment' });
    }
};

module.exports = {
    bookAppointment,
    getUserAppointments,
    getAllAppointments,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
};
