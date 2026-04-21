const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Process mock payment
// @route   POST /api/payments/checkout
// @access  Private
const processPayment = async (req, res) => {
    try {
        const { bookingId, amount, method } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Mock payment logic - assume success
        const transactionId = 'MOCK_TXN_' + Math.floor(Math.random() * 1000000000);

        const payment = new Payment({
            booking: bookingId,
            user: req.user._id,
            transactionId,
            amount,
            status: 'success',
            method: method || 'mock_card'
        });

        await payment.save();

        // Update booking status
        booking.status = 'confirmed';
        // Mock QR Code generation (a real implementation would use a library like 'qrcode')
        booking.qrCode = `QR_CODE_DATA_${transactionId}`;
        await booking.save();

        res.status(201).json({
            message: 'Payment successful',
            transactionId,
            bookingId: booking._id,
            qrCode: booking.qrCode
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    processPayment
};
