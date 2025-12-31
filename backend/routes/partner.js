const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Screen = require('../models/Screen');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const PartnerReport = require('../models/PartnerReport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/reports/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed!'));
        }
    }
});

const partner = (req, res, next) => {
    if (req.user && req.user.role === 'partner') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a partner' });
    }
};

router.get('/stats', protect, partner, async (req, res) => {
    try {
        const { period, startDate: customStart, endDate: customEnd } = req.query;

        let startDate = new Date();
        let endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (period === 'all') {
            startDate = new Date(0);
        } else if (period === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        }


        const screens = await Screen.find({ partner: req.user._id });
        const screenIds = screens.map(s => s._id);

        const bookings = await Booking.find({
            screen: { $in: screenIds },
            status: 'confirmed',
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const totalRevenue = bookings.reduce((sum, b) => {
            const bookingRevenue = b.seats ? b.seats.reduce((s, seat) => s + (seat.price || 0), 0) : 0;
            return sum + bookingRevenue;
        }, 0);
        const totalBookings = bookings.length;


        const screenStats = screens.map(screen => {
            const screenBookings = bookings.filter(b => b.screen.toString() === screen._id.toString());
            const screenRevenue = screenBookings.reduce((sum, b) => {
                const bRev = b.seats ? b.seats.reduce((s, seat) => s + (seat.price || 0), 0) : 0;
                return sum + bRev;
            }, 0);
            return {
                id: screen._id,
                name: screen.name,
                bookings: screenBookings.length,
                revenue: screenRevenue
            };
        });

        res.json({ totalRevenue, totalBookings, screenStats });
    } catch (error) {
        console.error("Partner stats error:", error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});


router.get('/analytics', protect, partner, async (req, res) => {
    try {
        const { period, startDate: customStart, endDate: customEnd } = req.query; // 'today', 'week', 'month', 'all', 'custom'
        const screens = await Screen.find({ partner: req.user._id });
        const screenIds = screens.map(s => s._id);
        const screenMap = screens.reduce((acc, s) => {
            acc[s._id.toString()] = s.name;
            return acc;
        }, {});

        let startDate = new Date();
        let endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        let isHourly = false;

        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else if (period === 'all') {
            startDate = new Date(0);
        } else if (period === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);


            if (startDate.toDateString() === endDate.toDateString()) {
                isHourly = true;
            }
        } else if (period === 'today') {
            isHourly = true;
        } else {
            isHourly = true;
        }

        const bookings = await Booking.find({
            screen: { $in: screenIds },
            status: 'confirmed',
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 });


        const dataMap = {};

        bookings.forEach(b => {
            const date = new Date(b.createdAt);
            let key;
            if (isHourly) {
                key = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }); // "10 AM"
            } else {
                key = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); // "25 Dec"
            }

            if (!dataMap[key]) {
                dataMap[key] = { name: key, TotalRevenue: 0, TotalBookings: 0 };

                screens.forEach(s => {
                    dataMap[key][`Revenue_${s._id}`] = 0;
                    dataMap[key][`Bookings_${s._id}`] = 0;
                });
            }

            const screenId = b.screen.toString();

            const amount = b.seats ? b.seats.reduce((s, seat) => s + (seat.price || 0), 0) : 0;

            dataMap[key].TotalRevenue += amount;
            dataMap[key].TotalBookings += 1;

            if (dataMap[key][`Revenue_${screenId}`] !== undefined) {
                dataMap[key][`Revenue_${screenId}`] += amount;
                dataMap[key][`Bookings_${screenId}`] += 1;
            }
        });


        const chartData = Object.values(dataMap);

        const screensData = screens.map(s => ({
            id: s._id,
            name: s.name
        }));

        res.json({ chartData, screens: screensData });

    } catch (error) {
        console.error("Partner analytics error:", error);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
});

router.get('/movies', protect, partner, async (req, res) => {
    try {
        const movies = await Movie.find({}).sort({ createdAt: -1 });
        const partnerUser = await User.findById(req.user._id);
        const approvedMovieIds = partnerUser.approvedMovies || [];

        const moviesWithStatus = movies.map(movie => ({
            ...movie._doc,
            isApproved: approvedMovieIds.includes(movie._id)
        }));

        res.json(moviesWithStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/movies/:id/approve', protect, partner, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.approvedMovies) {
            user.approvedMovies = [];
        }

        if (!user.approvedMovies.includes(req.params.id)) {
            user.approvedMovies.push(req.params.id);
            await user.save();
        }

        res.json({ message: 'Movie approved', approvedMovies: user.approvedMovies });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/movies/:id/reject', protect, partner, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.approvedMovies) {
            user.approvedMovies = user.approvedMovies.filter(id => id.toString() !== req.params.id);
            await user.save();
        }
        res.json({ message: 'Movie rejected/removed', approvedMovies: user.approvedMovies });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/my-movies', protect, partner, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('approvedMovies');
        res.json(user.approvedMovies || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/screens', protect, partner, async (req, res) => {
    try {
        const { name, screenType, seatCapacity, rows, columns } = req.body;

        const screen = await Screen.create({
            partner: req.user._id,
            name,
            screenType,
            seatCapacity,
            rows,
            columns,
            movies: []
        });

        res.status(201).json(screen);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/screens', protect, partner, async (req, res) => {
    try {
        const screens = await Screen.find({ partner: req.user._id }).populate('movies').populate('showtimes.movie');
        res.json(screens);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/screens/:id', async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id);
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }
        res.json(screen);
    } catch (error) {
        console.error("Error fetching screen:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/screens/:screenId/movies', protect, partner, async (req, res) => {
    try {
        const { movieId } = req.body;
        const screen = await Screen.findOne({ _id: req.params.screenId, partner: req.user._id });

        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user.approvedMovies.includes(movieId)) {
            return res.status(400).json({ message: 'You must approve the movie first' });
        }

        if (!screen.movies.includes(movieId)) {
            screen.movies.push(movieId);
            await screen.save();
        }

        const updatedScreen = await Screen.findById(screen._id).populate('movies').populate('showtimes.movie');
        res.json(updatedScreen);

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/screens/:id', protect, partner, async (req, res) => {
    try {
        const screen = await Screen.findOne({ _id: req.params.id, partner: req.user._id });
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }

        screen.name = req.body.name || screen.name;
        screen.screenType = req.body.screenType || screen.screenType;
        screen.rows = req.body.rows || screen.rows;
        screen.columns = req.body.columns || screen.columns;
        screen.seatCapacity = req.body.seatCapacity || screen.seatCapacity;

        if (req.body.specialSeats) {
            screen.specialSeats = req.body.specialSeats;
        }
        if (req.body.rowPrices) {
            screen.rowPrices = req.body.rowPrices;
            screen.markModified('rowPrices');
        }
        if (req.body.rowNames) {
            screen.rowNames = req.body.rowNames;
            screen.markModified('rowNames');
        }

        const updatedScreen = await screen.save();
        res.json(updatedScreen);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/screens/:id', protect, partner, async (req, res) => {
    try {
        const screen = await Screen.findOne({ _id: req.params.id, partner: req.user._id });
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }
        await screen.deleteOne();
        res.json({ message: 'Screen deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


const getMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};


const checkOverlap = (newStart, newEnd, existingStart, existingEnd) => {
    return Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd);
};

router.post('/screens/:id/showtimes', protect, partner, async (req, res) => {
    try {
        const { movieId, time, date } = req.body;
        const screen = await Screen.findOne({ _id: req.params.id, partner: req.user._id }).populate('showtimes.movie');

        if (!screen) return res.status(404).json({ message: 'Screen not found' });

        const user = await User.findById(req.user._id);
        if (!user.approvedMovies.includes(movieId)) {
            return res.status(400).json({ message: 'You must approve the movie first' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });


        const newStart = getMinutes(time);
        const newEnd = newStart + movie.duration + 20; // 20 min buffer for new show

        const newShowDate = new Date(date).toISOString().split('T')[0];

        const hasOverlap = screen.showtimes.some(show => {
            if (new Date(show.date).toISOString().split('T')[0] !== newShowDate) return false;

            // If movie is missing (deleted?), we can't check duration-based overlap clearly. 
            // Better to assume it occupies some time, or skip. Warning: this might allow collision with ghost shows.
            // For now, if no movie, we skip as we can't calculate end time.
            if (!show.movie) return false;

            const existingStart = getMinutes(show.time);
            // Enforce buffer on existing show too
            const existingEnd = existingStart + show.movie.duration + 20;

            // Strict overlap check:
            // (StartA < EndB) and (EndA > StartB)
            return (newStart < existingEnd) && (newEnd > existingStart);
        });

        if (hasOverlap) {
            return res.status(400).json({ message: 'Showtime overlaps with an existing movie (including 20m buffer).' });
        }

        screen.showtimes.push({ movie: movieId, time, date });
        await screen.save();

        // Populate deep to ensure frontend receives correct data structure
        const updatedScreen = await Screen.findById(screen._id)
            .populate('movies')
            .populate({
                path: 'showtimes.movie',
                model: 'Movie'
            });
        res.json(updatedScreen);
    } catch (error) {
        console.error("Add/Edit Showtime Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/screens/:id/showtimes/:showtimeId', protect, partner, async (req, res) => {
    try {
        const screen = await Screen.findOne({ _id: req.params.id, partner: req.user._id });
        if (!screen) return res.status(404).json({ message: 'Screen not found' });

        screen.showtimes = screen.showtimes.filter(s => s._id.toString() !== req.params.showtimeId);
        await screen.save();

        const updatedScreen = await Screen.findById(screen._id).populate('movies').populate('showtimes.movie');
        res.json(updatedScreen);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/screens/:id/showtimes/:showtimeId', protect, partner, async (req, res) => {
    try {
        const { movieId, time, date } = req.body;
        const screen = await Screen.findOne({ _id: req.params.id, partner: req.user._id }).populate('showtimes.movie'); // Populate to get durations

        if (!screen) return res.status(404).json({ message: 'Screen not found' });

        const showtime = screen.showtimes.id(req.params.showtimeId);
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

        let targetMovieId = showtime.movie._id || showtime.movie;
        if (movieId) {
            const user = await User.findById(req.user._id);
            if (!user.approvedMovies.includes(movieId)) {
                return res.status(400).json({ message: 'You must approve the movie first' });
            }
            targetMovieId = movieId;
        }

        const movie = await Movie.findById(targetMovieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        const targetTime = time || showtime.time;
        const targetDate = date || showtime.date;


        const newStart = getMinutes(targetTime);
        const newEnd = newStart + movie.duration + 20;
        const newShowDate = new Date(targetDate).toISOString().split('T')[0];

        const hasOverlap = screen.showtimes.some(show => {
            if (show._id.toString() === req.params.showtimeId) return false; // Skip itself
            if (new Date(show.date).toISOString().split('T')[0] !== newShowDate) return false;
            if (!show.movie) return false;

            const existingStart = getMinutes(show.time);
            // Enforce buffer on existing
            const existingEnd = existingStart + show.movie.duration + 20;

            return (newStart < existingEnd) && (newEnd > existingStart);
        });

        if (hasOverlap) {
            return res.status(400).json({ message: 'Showtime overlaps with an existing movie (including 20m buffer).' });
        }


        if (movieId) showtime.movie = movieId;
        if (time) showtime.time = time;
        if (date) showtime.date = date;

        await screen.save();

        const updatedScreen = await Screen.findById(screen._id)
            .populate('movies')
            .populate({
                path: 'showtimes.movie',
                model: 'Movie'
            });
        res.json(updatedScreen);
    } catch (error) {
        console.error("Add/Edit Showtime Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.post('/report', protect, partner, upload.single('attachment'), async (req, res) => {
    try {
        const { title, message } = req.body;
        const attachment = req.file ? req.file.path : null;

        const report = new PartnerReport({
            partner: req.user._id,
            title,
            message,
            attachment
        });

        await report.save();
        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
        console.error("Partner Report Error:", error);
        res.status(500).json({ message: 'Server error submit report' });
    }
});

module.exports = router;
