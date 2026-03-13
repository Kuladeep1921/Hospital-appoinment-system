const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Hospital name is required'],
            trim: true,
        },
        district: {
            type: String,
            required: [true, 'District is required'],
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
