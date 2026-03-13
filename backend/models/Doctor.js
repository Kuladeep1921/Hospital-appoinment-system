const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Doctor name is required'],
            trim: true,
        },
        specialization: {
            type: String,
            required: [true, 'Specialization is required'],
            trim: true,
        },
        experience: {
            type: Number,
            default: 0,
        },
        available: {
            type: Boolean,
            default: true,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
            required: [true, 'Hospital ID is required'],
        },
        district: {
            type: String,
            required: [true, 'District is required'],
        },
        consultationFee: {
            type: Number,
            default: 500,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
