const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'District name is required'],
            unique: true,
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'State name is required'],
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('District', districtSchema);
