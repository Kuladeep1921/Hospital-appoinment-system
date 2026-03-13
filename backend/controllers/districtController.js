const District = require('../models/District');

// @desc   Get all districts
// @route  GET /api/districts
// @access Private
const getDistricts = async (req, res) => {
    try {
        const districts = await District.find({}).sort({ name: 1 });
        res.json(districts);
    } catch (error) {
        console.error('Get districts error:', error);
        res.status(500).json({ message: 'Server error fetching districts' });
    }
};

module.exports = { getDistricts };
