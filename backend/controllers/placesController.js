const Hospital = require('../models/Hospital');

// Fetch hospitals from DB by district (replaces Overpass/Nominatim)
const getLiveHospitals = async (req, res) => {
    const { district } = req.query;
    if (!district) return res.status(400).json({ message: 'District is required' });

    try {
        const hospitals = await Hospital.find({ district }).sort({ name: 1 });
        res.json(hospitals);
    } catch (err) {
        console.error('Live hospitals fetch error:', err.message);
        res.json([]);
    }
};

module.exports = { getLiveHospitals };
