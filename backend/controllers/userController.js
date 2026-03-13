const User = require('../models/User');

// @desc   Get all patients (admin)
// @route  GET /api/users/patients
// @access Private/Admin
const getPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
        res.json(patients);
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ message: 'Server error fetching patients' });
    }
};

// @desc   Delete a patient record (admin)
// @route  DELETE /api/users/patients/:id
// @access Private/Admin
const deletePatient = async (req, res) => {
    try {
        const patient = await User.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ message: 'Patient record removed' });
    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({ message: 'Server error deleting patient' });
    }
};

module.exports = { getPatients, deletePatient };
