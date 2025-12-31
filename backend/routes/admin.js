const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Screen = require('../models/Screen');
const ContactMessage = require('../models/ContactMessage');
const PartnerReport = require('../models/PartnerReport');

const { protect, admin } = require('../middleware/authMiddleware');


const getMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};


const Booking = require('../models/Booking');


router.get('/stats', protect, admin, async (req, res) => {
    try {
        const Movie = require('../models/Movie');

        const { city, period, startDate: customStart, endDate: customEnd } = req.query;

        let dateStart = new Date();
        let dateEnd = new Date();
        dateStart.setHours(0, 0, 0, 0);
        dateEnd.setHours(23, 59, 59, 999);


        if (period === 'week') {
            dateStart.setDate(dateStart.getDate() - 7);
        } else if (period === 'month') {
            dateStart.setMonth(dateStart.getMonth() - 1);
        } else if (period === 'all') {
            dateStart = new Date(0);
        } else if (period === 'custom' && customStart && customEnd) {
            dateStart = new Date(customStart);
            dateEnd = new Date(customEnd);
            dateStart.setHours(0, 0, 0, 0);
            dateEnd.setHours(23, 59, 59, 999);
        }


        let partnerQuery = { role: 'partner' };
        if (city && city !== 'All') {
            partnerQuery.location = city;
        }

        const partners = await User.find(partnerQuery).populate('approvedMovies');
        const totalPartners = partners.length;
        const partnerIds = partners.map(p => p._id);


        const screens = await Screen.find({ partner: { $in: partnerIds } });
        const screenIds = screens.map(s => s._id);

        const bookingQuery = {
            status: 'confirmed',
            screen: { $in: screenIds },
            createdAt: { $gte: dateStart, $lte: dateEnd }
        };

        const bookings = await Booking.find(bookingQuery);
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);


        let approvedMovieIds = new Set();
        partners.forEach(p => {
            if (p.approvedMovies && p.approvedMovies.length > 0) {
                p.approvedMovies.forEach(m => approvedMovieIds.add(m._id ? m._id.toString() : m.toString()));
            }
        });

        const totalApproved = await Movie.countDocuments({
            _id: { $in: Array.from(approvedMovieIds) },
            status: 'running'
        });


        const totalUpcoming = await Movie.countDocuments({ status: 'upcoming' });
        const totalMovies = await Movie.countDocuments({});

        const userPending = await ContactMessage.countDocuments({ status: { $in: ['new', 'viewed'] } });
        const userResolved = await ContactMessage.countDocuments({ status: 'completed' });

        const partnerPending = await PartnerReport.countDocuments({ status: { $in: ['pending', 'viewed'] } });
        const partnerResolved = await PartnerReport.countDocuments({ status: 'resolved' });


        const allCities = await User.find({ role: 'partner' }).distinct('location');
        const validCities = allCities.filter(l => l && l.trim() !== '');

        res.json({
            totalBookings,
            totalRevenue,
            totalPartners,
            totalApproved,
            totalUpcoming,
            totalUpcoming,
            totalMovies,
            userPending,
            userResolved,
            partnerPending,
            partnerResolved,
            cities: validCities
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

router.post('/partners', protect, admin, async (req, res) => {
    try {
        const { name, email, mobile, password, address, location } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            mobile,
            password,
            role: 'partner',
            address,
            location
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                location: user.location
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/reports', protect, admin, async (req, res) => {
    try {
        console.log('GET /api/admin/reports called');
        const reports = await ContactMessage.find().sort({ createdAt: -1 });
        console.log(`Found ${reports.length} reports`);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/reports/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await ContactMessage.findById(req.params.id);

        if (report) {
            report.status = status;
            await report.save();
            res.json(report);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.get('/reports/:id', protect, admin, async (req, res) => {
    try {
        const report = await ContactMessage.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const user = await User.findOne({ email: report.email }).select('-password');

        res.json({
            report,
            user: user || null
        });
    } catch (error) {
        console.error('Error fetching report details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/partners', protect, admin, async (req, res) => {
    try {
        const partners = await User.find({ role: 'partner' }).select('-password');
        res.json(partners);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/partners/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.mobile = req.body.mobile || user.mobile;
            user.address = req.body.address || user.address;
            user.location = req.body.location || user.location;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                address: updatedUser.address,
                location: updatedUser.location
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/partners/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'Partner removed' });
        } else {
            res.status(404).json({ message: 'Partner not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});



router.get('/partners-analytics', protect, admin, async (req, res) => {
    try {
        const partners = await User.find({ role: 'partner' })
            .select('-password')
            .populate('approvedMovies');

        const partnersData = await Promise.all(partners.map(async (partner) => {
            const screens = await Screen.find({ partner: partner._id })
                .populate('showtimes.movie');

            return {
                ...partner.toObject(),
                screens
            };
        }));

        res.json(partnersData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
});


router.put('/screens/:id/showtimes/:showtimeId', protect, admin, async (req, res) => {
    try {
        const { movieId, time, date } = req.body;
        const screen = await Screen.findById(req.params.id).populate('showtimes.movie');

        if (!screen) return res.status(404).json({ message: 'Screen not found' });

        const showtime = screen.showtimes.id(req.params.showtimeId);
        if (!showtime) return res.status(404).json({ message: 'Showtime not found' });


        let targetMovieId = showtime.movie?._id || showtime.movie;
        if (movieId) targetMovieId = movieId;

        const movie = await require('../models/Movie').findById(targetMovieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });

        const targetTime = time || showtime.time;
        const targetDate = date || showtime.date;


        const newStart = getMinutes(targetTime);
        const newEnd = newStart + movie.duration;
        const newShowDate = new Date(targetDate).toISOString().split('T')[0];

        const hasOverlap = screen.showtimes.some(show => {
            if (show._id.toString() === req.params.showtimeId) return false; // Skip itself
            if (new Date(show.date).toISOString().split('T')[0] !== newShowDate) return false;
            if (!show.movie) return false;

            const existingStart = getMinutes(show.time);
            const existingEnd = existingStart + show.movie.duration;

            return Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd);
        });

        if (hasOverlap) {
            return res.status(400).json({ message: 'Showtime overlaps with an existing movie.' });
        }

        if (movieId) showtime.movie = movieId;
        if (time) showtime.time = time;
        if (date) showtime.date = date;

        await screen.save();

        const updatedScreen = await Screen.findById(screen._id).populate('movies').populate('showtimes.movie');
        res.json(updatedScreen);
    } catch (error) {
        console.error("Admin Edit Showtime Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.get('/partners/:partnerId/screens', protect, admin, async (req, res) => {
    try {
        const screens = await Screen.find({ partner: req.params.partnerId })
            .populate('movies')
            .populate('showtimes.movie');
        res.json(screens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching screens' });
    }
});


router.post('/partners/:partnerId/screens', protect, admin, async (req, res) => {
    try {
        const { name, screenType, seatCapacity, rows, columns } = req.body;
        const screen = await Screen.create({
            partner: req.params.partnerId,
            name,
            screenType,
            seatCapacity,
            rows,
            columns,
            movies: []
        });
        res.status(201).json(screen);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating screen' });
    }
});


router.put('/screens/:id', protect, admin, async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id);
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
        console.error(error);
        res.status(500).json({ message: 'Server error updating screen' });
    }
});


router.delete('/screens/:id', protect, admin, async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id);
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }
        await screen.deleteOne();
        res.json({ message: 'Screen deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting screen' });
    }
});


router.get('/partners/:partnerId/movies', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.partnerId).populate('approvedMovies');
        if (!user) return res.status(404).json({ message: 'Partner not found' });
        res.json(user.approvedMovies || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching partner movies' });
    }
});


router.post('/screens/:id/showtimes', protect, admin, async (req, res) => {
    try {
        const { movieId, time, date } = req.body;
        const screen = await Screen.findById(req.params.id).populate('showtimes.movie');

        if (!screen) return res.status(404).json({ message: 'Screen not found' });

        const movie = await require('../models/Movie').findById(movieId);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });


        const newStart = getMinutes(time);
        const newEnd = newStart + movie.duration;
        const newShowDate = new Date(date).toISOString().split('T')[0];

        const hasOverlap = screen.showtimes.some(show => {
            if (new Date(show.date).toISOString().split('T')[0] !== newShowDate) return false;
            if (!show.movie) return false;

            const existingStart = getMinutes(show.time);
            const existingEnd = existingStart + show.movie.duration;

            return Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd);
        });

        if (hasOverlap) {
            return res.status(400).json({ message: 'Showtime overlaps with an existing movie.' });
        }

        screen.showtimes.push({ movie: movieId, time, date });
        await screen.save();

        const updatedScreen = await Screen.findById(screen._id).populate('movies').populate('showtimes.movie');
        res.json(updatedScreen);
    } catch (error) {
        console.error("Admin Add Showtime Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.delete('/screens/:id/showtimes/:showtimeId', protect, admin, async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id);
        if (!screen) return res.status(404).json({ message: 'Screen not found' });

        screen.showtimes = screen.showtimes.filter(s => s._id.toString() !== req.params.showtimeId);
        await screen.save();

        const updatedScreen = await Screen.findById(screen._id).populate('movies').populate('showtimes.movie');
        res.json(updatedScreen);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting showtime' });
    }
});


router.get('/performance', protect, admin, async (req, res) => {
    try {
        const { period, city, startDate: customStart, endDate: customEnd } = req.query;

        let dateStart = new Date();
        let dateEnd = new Date();
        dateStart.setHours(0, 0, 0, 0);
        dateEnd.setHours(23, 59, 59, 999);

        if (period === 'week') {
            dateStart.setDate(dateStart.getDate() - 7);
        } else if (period === 'month') {
            dateStart.setMonth(dateStart.getMonth() - 1);
        } else if (period === 'all') {
            dateStart = new Date(0);
        } else if (period === 'custom' && customStart && customEnd) {
            dateStart = new Date(customStart);
            dateEnd = new Date(customEnd);
            dateStart.setHours(0, 0, 0, 0);
            dateEnd.setHours(23, 59, 59, 999);
        }

        let partnerMatch = {};
        if (city && city !== 'All') {
            partnerMatch['partnerDetails.location'] = city;
        }

        const performanceData = await Booking.aggregate([
            {
                $match: {
                    status: 'confirmed',
                    createdAt: { $gte: dateStart, $lte: dateEnd }
                }
            },
            {
                $lookup: {
                    from: 'screens',
                    localField: 'screen',
                    foreignField: '_id',
                    as: 'screenDetails'
                }
            },
            { $unwind: '$screenDetails' },
            {
                $group: {
                    _id: '$screenDetails.partner',
                    totalRevenue: { $sum: '$totalAmount' },
                    totalBookings: { $sum: 1 },
                    totalTickets: { $sum: { $size: '$seats' } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partnerDetails'
                }
            },
            { $unwind: '$partnerDetails' },
            { $match: partnerMatch },
            { $sort: { [req.query.sortBy === 'tickets' ? 'totalTickets' : 'totalRevenue']: -1 } },
            {
                $project: {
                    _id: 1,
                    name: '$partnerDetails.name',
                    email: '$partnerDetails.email',
                    location: '$partnerDetails.location',
                    totalRevenue: 1,
                    totalBookings: 1,
                    totalTickets: 1
                }
            }
        ]);

        const allCities = await User.find({ role: 'partner' }).distinct('location');
        const validCities = allCities.filter(l => l && l.trim() !== '');

        res.json({ data: performanceData, cities: validCities });
    } catch (error) {
        console.error("Error fetching partner performance:", error);
        res.status(500).json({ message: 'Server error fetching performance data' });
    }
});

module.exports = router;


router.get('/partner-reports', protect, admin, async (req, res) => {
    try {
        const reports = await PartnerReport.find()
            .populate('partner', 'name email location mobile')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Error fetching partner reports:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.put('/partner-reports/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await PartnerReport.findById(req.params.id);

        if (report) {
            report.status = status;
            await report.save();
            res.json(report);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        console.error('Error updating partner report status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.get('/partner-reports/:id', protect, admin, async (req, res) => {
    try {
        const report = await PartnerReport.findById(req.params.id).populate('partner', 'name email location mobile');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        console.error('Error fetching partner report details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

