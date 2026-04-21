const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'special', 'show'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    availableSlots: {
        type: Number,
        required: true,
        default: 100
    },
    date: {
        type: Date,
        required: true
    },
    timeSlots: [{
        time: String,
        capacity: Number,
        booked: { type: Number, default: 0 }
    }],
    image: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
