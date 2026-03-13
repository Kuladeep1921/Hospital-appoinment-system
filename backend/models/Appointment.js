const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Optional for walk-in offline bookings
        },
        patientName: {
            type: String,
            required: false, // Used if userId is missing (walk-ins)
        },
        patientPhone: {
            type: String,
            required: false,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        date: {
            type: Date,
            required: [true, 'Appointment date is required'],
        },
        timeSlot: {
            type: String,
            required: [true, 'Time slot is required'],
        },
        problem: {
            type: String,
            required: [true, 'Problem description is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
