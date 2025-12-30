const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Screen = require('./models/Screen'); 
const connectDB = require('./db');

dotenv.config();

const seedShowtimes = async () => {
    try {
        await connectDB();

        const partner = await User.findOne({ email: 'partner@test.com' });
        if (!partner) {
            console.log('Partner not found');
            process.exit(1);
        }

        const movie = await Movie.findOne({ title: 'Test Movie' });
        if (!movie) {
            console.log('Movie not found');
            process.exit(1);
        }

       
        let screen = await Screen.findOne({ partner: partner._id });
        if (!screen) {
            screen = await Screen.create({
                name: 'Backend Seeded Screen',
                partner: partner._id,
                screenType: 'Standard',
                seatCapacity: 100,
                rows: 10,
                columns: 10,
                showtimes: []
            });
            console.log('Created new screen');
        } else {
            console.log('Found existing screen:', screen.name);
        }

        screen.showtimes = [];

        const times = ['10:00', '11:00', '12:00', '13:00'];
        for (const time of times) {
            screen.showtimes.push({
                movie: movie._id,
                time: time,
                date: new Date()
            });
        }

        await screen.save();
        console.log('Added 4 showtimes to screen');
        process.exit();

    } catch (error) {
        console.error('Error seeding showtimes:', error);
        process.exit(1);
    }
};

seedShowtimes();
