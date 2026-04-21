const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    eventId: { type: String },
    museumName: { type: String, required: true },
    showName: { type: String },
    ticketCount: { type: Number, required: true, min: 1 },
    adultCount: { type: Number, default: 0 },
    childCount: { type: Number, default: 0 },
    seniorCount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'confirmed'
    },
    qrCode: { type: String }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
