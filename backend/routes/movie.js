const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');


const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, admin, upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'castPhotos', maxCount: 10 },
    { name: 'crewPhotos', maxCount: 10 }
]), async (req, res) => {
    try {
        console.log("POST /api/movies called");
        console.log("req.body:", req.body);
        console.log("req.files:", req.files);
        const { title, description, genre, language, duration, releaseDate, status, format, trailerLink } = req.body;

        let posterPath = req.body.poster;
        if (req.files['poster']) {
            posterPath = `/uploads/${req.files['poster'][0].filename}`;
        }

        let cast = [];
        if (req.body.cast) {
            cast = JSON.parse(req.body.cast);
            let fileIndex = 0;
            cast.forEach(member => {

                if (!member.photo || member.isNewFile) {
                    if (req.files['castPhotos'] && req.files['castPhotos'][fileIndex]) {
                        member.photo = `/uploads/${req.files['castPhotos'][fileIndex].filename}`;
                        fileIndex++;
                    }
                    delete member.isNewFile;
                }
            });
        }

        let crew = [];
        if (req.body.crew) {
            crew = JSON.parse(req.body.crew);
            let fileIndex = 0;
            crew.forEach(member => {
                if (!member.photo || member.isNewFile) {
                    if (req.files['crewPhotos'] && req.files['crewPhotos'][fileIndex]) {
                        member.photo = `/uploads/${req.files['crewPhotos'][fileIndex].filename}`;
                        fileIndex++;
                    }
                    delete member.isNewFile;
                }
            });
        }


        const movie = await Movie.create({
            title,
            description,
            poster: posterPath,
            trailerLink,
            genre,
            language,
            duration,
            releaseDate,
            status,
            format,
            cast,
            crew
        });

        res.status(201).json(movie);
    } catch (error) {
        console.error('Error creating movie:', error);
        res.status(500).json({ message: 'Server error adding movie' });
    }
});


router.get('/locations', async (req, res) => {
    try {
        const locations = await User.find({ role: 'partner' }).distinct('location');

        const validLocations = locations.filter(l => l && l.trim() !== '');
        res.json(validLocations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: 'Server error fetching locations' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { city, status, all } = req.query;

        let query = {};

        if (all) {
            query = {};
        } else if (status) {
            query.status = status;
        } else if (city) {
            query.status = 'running';
            const partners = await User.find({
                role: 'partner',
                location: { $regex: new RegExp(city, 'i') }
            });

            const approvedMovieIds = partners.reduce((acc, partner) => {
                if (partner.approvedMovies && partner.approvedMovies.length > 0) {
                    partner.approvedMovies.forEach(movieId => {
                        if (!acc.includes(movieId.toString())) {
                            acc.push(movieId);
                        }
                    });
                }
                return acc;
            }, []);

            query._id = { $in: approvedMovieIds };
        } else {
            query = { status: 'running' };
        }

        const movies = await Movie.find(query).sort({ createdAt: -1 });
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id/showtimes', async (req, res) => {
    try {
        const Screen = require('../models/Screen');
        const Booking = require('../models/Booking');
        const screens = await Screen.find({
            'showtimes.movie': req.params.id
        }).populate('partner', 'name location');

        const result = [];


        const getRowLabel = (index) => String.fromCharCode(65 + index);


        for (const screen of screens) {
            if (!screen.partner) continue;

            const now = new Date();
            const relevantShowtimes = screen.showtimes.filter(st => {
                if (st.movie && st.movie.toString() !== req.params.id) return false;

                if (!st.movie) return false;

                const showDate = new Date(st.date);
                const [hours, minutes] = st.time.split(':');
                showDate.setHours(hours, minutes, 0, 0);
                return showDate >= now;
            });

            if (relevantShowtimes.length === 0) continue;


            const categoryMap = {};

            for (let r = 0; r < screen.rows; r++) {
                const rowLabel = getRowLabel(r);
                const price = screen.rowPrices?.get(rowLabel) || 150;

                const name = screen.rowNames?.get(rowLabel) || '';


                const badSeats = screen.specialSeats ? screen.specialSeats.filter(s => s.row === r && (s.status === 'gap' || s.status === 'damaged')).length : 0;
                const rowCapacity = screen.columns - badSeats;


                if (rowCapacity <= 0) continue;

                const key = `${name}|${price}`;
                if (!categoryMap[key]) {
                    categoryMap[key] = { total: 0, booked: 0, category: name, price: price, rowIndices: [] };
                }
                categoryMap[key].total += rowCapacity;
                categoryMap[key].rowIndices.push(r);
            }


            const showtimeData = await Promise.all(relevantShowtimes.map(async (st) => {

                const bookings = await Booking.find({
                    showtimeId: st._id,
                    status: 'confirmed'
                });


                const currentStats = JSON.parse(JSON.stringify(categoryMap));


                bookings.forEach(booking => {
                    booking.seats.forEach(seat => {
                        for (const key in currentStats) {
                            if (currentStats[key].rowIndices.includes(seat.row)) {
                                currentStats[key].booked += 1;
                                break;
                            }
                        }
                    });
                });


                const tooltipStats = Object.values(currentStats)
                    .filter(stat => stat.category.trim() !== '')
                    .map(stat => {
                        const percentage = stat.total > 0 ? (stat.booked / stat.total) * 100 : 0;
                        let status = "Available";
                        if (percentage >= 100) status = "Sold Out";
                        else if (percentage >= 70) status = "Fast Filling";

                        return {
                            category: stat.category,
                            price: stat.price,
                            status: status,
                            booked: stat.booked,
                            total: stat.total
                        };
                    });


                tooltipStats.sort((a, b) => b.price - a.price);

                return {
                    _id: st._id,
                    time: st.time,
                    date: st.date,
                    stats: tooltipStats
                };
            }));


            showtimeData.sort((a, b) => {
                const dA = new Date(a.date);
                const [hA, mA] = a.time.split(':');
                dA.setHours(hA, mA, 0, 0);

                const dB = new Date(b.date);
                const [hB, mB] = b.time.split(':');
                dB.setHours(hB, mB, 0, 0);

                return dA - dB;
            });

            result.push({
                screenId: screen._id,
                screenName: screen.name,
                partnerName: screen.partner.name,
                location: screen.partner.location,
                showtimes: showtimeData
            });
        }

        res.json(result);
    } catch (error) {
        console.error("Error fetching showtimes:", error);
        res.status(500).json({ message: 'Server error fetching showtimes' });
    }
});


router.put('/:id', protect, admin, upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'castPhotos', maxCount: 10 },
    { name: 'crewPhotos', maxCount: 10 }
]), async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            movie.title = req.body.title || movie.title;
            movie.description = req.body.description || movie.description;
            movie.genre = req.body.genre || movie.genre;
            movie.language = req.body.language || movie.language;
            movie.duration = req.body.duration || movie.duration;
            movie.releaseDate = req.body.releaseDate || movie.releaseDate;
            movie.status = req.body.status || movie.status;
            movie.status = req.body.status || movie.status;
            movie.format = req.body.format || movie.format;
            if (req.body.trailerLink !== undefined) movie.trailerLink = req.body.trailerLink;

            if (req.files['poster']) {
                movie.poster = `/uploads/${req.files['poster'][0].filename}`;
            } else if (req.body.poster) {
                movie.poster = req.body.poster;
            }

            if (req.body.cast) {
                const newCast = JSON.parse(req.body.cast);

                let fileIndex = 0;
                newCast.forEach(member => {
                    if (member.isNewFile) {
                        if (req.files['castPhotos'] && req.files['castPhotos'][fileIndex]) {
                            member.photo = `/uploads/${req.files['castPhotos'][fileIndex].filename}`;
                            fileIndex++;
                        }
                        delete member.isNewFile;
                    }
                });
                movie.cast = newCast;
            }

            if (req.body.crew) {
                const newCrew = JSON.parse(req.body.crew);
                let fileIndex = 0;
                newCrew.forEach(member => {
                    if (member.isNewFile) {
                        if (req.files['crewPhotos'] && req.files['crewPhotos'][fileIndex]) {
                            member.photo = `/uploads/${req.files['crewPhotos'][fileIndex].filename}`;
                            fileIndex++;
                        }
                        delete member.isNewFile;
                    }
                });
                movie.crew = newCrew;
            }

            const updatedMovie = await movie.save();
            res.json(updatedMovie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            await movie.deleteOne();
            res.json({ message: 'Movie removed' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        console.error("Error deleting movie", error);
        res.status(500).json({ message: 'Server error' });
    }
});

const Review = require('../models/Review');
const Booking = require('../models/Booking');

router.get('/:id/review-eligibility', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const movieId = req.params.id;

        const existingReview = await Review.findOne({ user: userId, movie: movieId });
        if (existingReview) {
            return res.json({ canReview: false, hasReviewed: true, rating: existingReview.rating });
        }

        const now = new Date();

        const bookings = await Booking.find({
            user: userId,
            movie: movieId,
            status: 'confirmed'
        });

        const hasWatched = bookings.some(booking => {
            const showDate = new Date(booking.showDate);
            const [hours, minutes] = booking.showTime.split(':');
            showDate.setHours(hours, minutes, 0, 0);
            return showDate < now;
        });

        if (hasWatched) {
            res.json({ canReview: true, hasReviewed: false });
        } else {
            res.json({ canReview: false, hasReviewed: false, message: 'You need to watch the movie to review it.' });
        }
    } catch (error) {
        console.error("Error checking review eligibility:", error);
        res.status(500).json({ message: 'Server error check eligibility' });
    }
});

router.post('/:id/rate', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const movieId = req.params.id;
        let { rating, comment } = req.body; 

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating. please provide 1-5' });
        }

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ message: 'Please provide a comment about the movie.' });
        }

        const ratingOutOf10 = rating * 2;

        const existingReview = await Review.findOne({ user: userId, movie: movieId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this movie' });
        }

        const headings = await Booking.find({ user: userId, movie: movieId, status: 'confirmed' });
        const now = new Date();
        const hasWatched = headings.some(booking => {
            const showDate = new Date(booking.showDate);
            const [hours, minutes] = booking.showTime.split(':');
            showDate.setHours(hours, minutes, 0, 0);
            return showDate < now;
        });

        if (!hasWatched) {
            return res.status(403).json({ message: 'You must watch the movie before reviewing' });
        }

        const review = await Review.create({
            user: userId,
            movie: movieId,
            rating: ratingOutOf10,
            comment: comment
        });

        const movie = await Movie.findById(movieId);
        const currentTotalScore = movie.averageRating * movie.totalVotes;
        const newTotalVotes = movie.totalVotes + 1;
        const newAverage = (currentTotalScore + ratingOutOf10) / newTotalVotes;

        movie.averageRating = newAverage;
        movie.totalVotes = newTotalVotes;
        await movie.save();

        res.status(201).json({ message: 'Review submitted', review, newAverage, newTotalVotes });

    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ message: 'Server error submitting review' });
    }
});

router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ movie: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
});

module.exports = router;
