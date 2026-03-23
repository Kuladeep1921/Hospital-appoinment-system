const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');

// @desc   Get all doctors
// @route  GET /api/doctors
// @access Private
const getDoctors = async (req, res) => {
    try {
        const { hospitalId, district, specialization } = req.query;
        let query = { available: true };
        
        if (hospitalId) {
            if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
                return res.status(400).json({ message: 'Invalid hospitalId' });
            }
            query.hospitalId = hospitalId;
        }
        if (district) {
            query.district = district;
        }
        if (specialization) {
            query.specialization = specialization;
        }

        const doctors = await Doctor.find(query)
            .populate('hospitalId', 'name')
            .sort({ name: 1 });
            
        res.json(doctors);
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
};

// @desc   Add a doctor (admin only)
// @route  POST /api/doctors
// @access Private/Admin
const addDoctor = async (req, res) => {
    try {
        const { name, specialization, experience, consultationFee, hospitalId, district } = req.body;
        if (!name || !specialization || !hospitalId || !district) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const doctor = await Doctor.create({ 
            name, 
            specialization, 
            experience, 
            consultationFee, 
            hospitalId, 
            district 
        });
        res.status(201).json(doctor);
    } catch (error) {
        console.error('Add doctor error:', error);
        res.status(500).json({ message: 'Server error adding doctor' });
    }
};

// @desc   Delete a doctor (admin only)
// @route  DELETE /api/doctors/:id
// @access Private/Admin
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ message: 'Doctor removed' });
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({ message: 'Server error deleting doctor' });
    }
};

module.exports = { getDoctors, addDoctor, deleteDoctor };
