const mongoose = require('mongoose');
const Screen = require('./models/Screen');
// const Movie = require('./models/Movie'); // We will mock or create a dummy movie
// const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const testOverlap = async () => {
    try {
        const uri = 'mongodb+srv://sridharsr7:Sri123@cluster0.p0h5o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // 1. Create a dummy Movie (needed for duration)
        const Movie = require('./models/Movie');
        // Check if a movie exists or create one
        let movie = await Movie.findOne({ title: 'Test Overlap Movie' });
        if (!movie) {
            movie = await Movie.create({
                title: 'Test Overlap Movie',
                duration: 120, // 2 hours
                description: 'Test',
                poster: 'test',
                genre: 'Test',
                language: 'Test',
                releaseDate: new Date(),
                status: 'running'
            });
        }
        console.log('Movie ID:', movie._id, 'Duration:', movie.duration);

        // 2. Create Screen
        const Screen = require('./models/Screen');
        // find or create
        let screen = await Screen.findOne({ name: 'Overlap Test Screen' });
        if (screen) {
            await screen.deleteOne();
        }

        // Need a partner ID - use a fake one
        const fakePartnerId = new mongoose.Types.ObjectId();

        screen = new Screen({
            partner: fakePartnerId,
            name: 'Overlap Test Screen',
            seatCapacity: 100,
            rows: 10,
            columns: 10,
            showtimes: []
        });
        await screen.save();
        console.log('Screen created:', screen._id);

        // 3. Logic from partner.js to reproduce
        // We will simulate the "Add Showtime" check manually here to see if strict logic holds
        // Then we can try to "push" to DB to see if DB constraints exist (unlikely)

        const getMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const existingShow = {
            movie: movie, // Populated object simulation
            time: '10:00',
            date: new Date('2025-01-01')
        };

        // Add first show to screen
        screen.showtimes.push({
            movie: movie._id,
            time: existingShow.time,
            date: existingShow.date
        });
        await screen.save();

        // Re-fetch and populate
        screen = await Screen.findById(screen._id).populate('showtimes.movie');
        console.log('Screen fetched with 1 showtime.');

        // 4. Try to add conflicting showtime
        const newShow = {
            time: '10:00', // EXACT SAME TIME
            date: '2025-01-01'
        };

        const newStart = getMinutes(newShow.time); // 600
        const newEnd = newStart + movie.duration + 20; // 740
        const newShowDate = new Date(newShow.date).toISOString().split('T')[0]; // "2025-01-01"

        console.log(`Checking Overlap for ${newShow.time} on ${newShowDate}`);

        const hasOverlap = screen.showtimes.some(show => {
            // Match date
            const showDateStr = new Date(show.date).toISOString().split('T')[0];
            if (showDateStr !== newShowDate) return false;

            if (!show.movie) {
                console.log('Skipping show with no movie');
                return false;
            }

            const existingStart = getMinutes(show.time);
            const existingEnd = existingStart + show.movie.duration;

            console.log(`Comparing: New([${newStart}, ${newEnd}]) vs Existing([${existingStart}, ${existingEnd}])`);

            const overlap = Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd);
            if (overlap) console.log('Overlap FOUND!');
            return overlap;
        });

        if (hasOverlap) {
            console.log('PASS: Logic correctly detected overlap.');
        } else {
            console.error('FAIL: Logic failed to detect overlap!');
        }

        // Cleanup
        await Screen.deleteOne({ _id: screen._id });
        await Movie.deleteOne({ _id: movie._id });
        console.log('Cleanup done');
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testOverlap();
