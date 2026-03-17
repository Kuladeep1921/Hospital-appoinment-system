const axios = require('axios');

// Convert district name → coordinates using Nominatim
const getCoordinates = async (district) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(district)},India&format=json&limit=1`;
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'HospitalBookingApp/1.0' }
    });
    if (!data.length) throw new Error('District not found');
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
};

// Fetch real hospitals from Overpass API using coordinates
const getLiveHospitals = async (req, res) => {
    const { district } = req.query;
    if (!district) return res.status(400).json({ message: 'District is required' });

    try {
        const { lat, lon } = await getCoordinates(district);

        // Search hospitals within 15km radius
        const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:15000,${lat},${lon});way["amenity"="hospital"](around:15000,${lat},${lon}););out center;`;
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        const { data } = await axios.get(overpassUrl, {
            headers: { 'User-Agent': 'HospitalBookingApp/1.0' }
        });

        const hospitals = data.elements
            .filter(e => e.tags?.name)
            .map(e => ({
                _id: `osm-${e.id}`,
                name: e.tags.name,
                district,
                address: e.tags['addr:full'] || e.tags['addr:street'] || e.tags['addr:city'] || district,
                phone: e.tags.phone || e.tags['contact:phone'] || null,
                website: e.tags.website || e.tags['contact:website'] || null,
                emergency: e.tags.emergency || null,
                isLive: true,
            }));

        res.json(hospitals);
    } catch (err) {
        console.error('Live hospitals fetch error:', err.message);
        res.status(500).json({ message: 'Failed to fetch live hospitals', error: err.message });
    }
};

module.exports = { getLiveHospitals };
