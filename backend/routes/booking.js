const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Screen = require('../models/Screen');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/showtime/:screenId/:showtimeId', async (req, res) => {
    try {
        const { screenId, showtimeId } = req.params;

        const bookings = await Booking.find({
            screen: screenId,
            showtimeId: showtimeId,
            status: 'confirmed'
        });

        let bookedSeats = [];
        bookings.forEach(booking => {
            bookedSeats = bookedSeats.concat(booking.seats);
        });

        res.json(bookedSeats);
    } catch (error) {
        console.error("Error fetching booked seats:", error);
        res.status(500).json({ message: "Server error fetching seats" });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const { screenId, movieId, showtimeId, showDate, showTime, seats, totalAmount } = req.body;

        if (!seats || seats.length === 0) {
            return res.status(400).json({ message: "No seats selected" });
        }

        const existingBookings = await Booking.find({
            screen: screenId,
            showtimeId: showtimeId,
            status: 'confirmed',
            'seats': {
                $elemMatch: {
                    $or: seats.map(s => ({ row: s.row, col: s.col }))
                }
            }
        });

        if (existingBookings.length > 0) {
            return res.status(400).json({ message: "One or more selected seats are already booked." });
        }

        const newBooking = new Booking({
            user: req.user.id,
            screen: screenId,
            movie: movieId,
            showtimeId,
            showDate,
            showTime,
            seats,
            totalAmount
        });

        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);

    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Server error creating booking" });
    }
});

router.get('/user', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('movie', 'title poster')
            .populate('screen', 'name partner')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: "Server error fetching bookings" });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('movie')
            .populate({
                path: 'screen',
                populate: { path: 'partner' }
            })
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({ message: "Server error fetching booking details" });
    }
});

module.exports = router;
