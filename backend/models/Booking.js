const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    screen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
        required: true
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    showtimeId: {
        type: String, 
        required: true
    },
    showDate: {
        type: Date,
        required: true
    },
    showTime: {
        type: String,
        required: true
    },
    seats: [{
        row: { type: Number, required: true },
        col: { type: Number, required: true },
        label: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    },
    bookingId: {
        type: String,
        unique: true,
        default: () => 'B' + Date.now() + Math.floor(Math.random() * 1000)
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
