const Hospital = require('../models/Hospital');

// @desc   Get hospitals in a district
// @route  GET /api/hospitals
// @access Private
const getHospitals = async (req, res) => {
    try {
        const { district } = req.query;
        let query = {};
        if (district) {
            query.district = district;
        }
        const hospitals = await Hospital.find(query).sort({ name: 1 });
        res.json(hospitals);
    } catch (error) {
        console.error('Get hospitals error:', error);
        res.status(500).json({ message: 'Server error fetching hospitals' });
    }
};

// @desc   Create hospital (admin)
// @route  POST /api/hospitals
// @access Private/Admin
const createHospital = async (req, res) => {
    try {
        const { name, district, address } = req.body;
        if (!name || !district) {
            return res.status(400).json({ message: 'Name and district are required' });
        }
        const hospital = await Hospital.create({ name, district, address });
        res.status(201).json(hospital);
    } catch (error) {
        console.error('Create hospital error:', error);
        res.status(500).json({ message: 'Server error creating hospital' });
    }
};

// @desc   Delete hospital (admin)
// @route  DELETE /api/hospitals/:id
// @access Private/Admin
const deleteHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        // Optionally delete doctors in this hospital? 
        // await Doctor.deleteMany({ hospitalId: req.params.id });
        res.json({ message: 'Hospital removed' });
    } catch (error) {
        console.error('Delete hospital error:', error);
        res.status(500).json({ message: 'Server error deleting hospital' });
    }
};

module.exports = { getHospitals, createHospital, deleteHospital };
