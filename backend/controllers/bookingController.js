const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { showId, museumName, showName, ticketCount, adultCount, childCount, seniorCount, totalAmount, date, timeSlot } = req.body;

        if (!museumName || !totalAmount || !date) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const booking = new Booking({
            user: req.user._id,
            eventId: showId,
            museumName,
            showName,
            ticketCount: ticketCount || (adultCount + childCount + seniorCount),
            adultCount,
            childCount,
            seniorCount,
            totalAmount,
            date,
            timeSlot,
            status: 'confirmed'
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ date: 1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            if (booking.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById
};
