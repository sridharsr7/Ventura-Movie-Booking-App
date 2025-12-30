const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Movie = require('./models/Movie');
const connectDB = require('./db');

dotenv.config();

const seedMovieAndAssign = async () => {
    try {
        await connectDB();

        
        let movie = await Movie.findOne({ title: 'Test Movie' });
        if (!movie) {
            movie = await Movie.create({
                title: 'Test Movie',
                description: 'A test movie description',
                poster: 'https://via.placeholder.com/150',
                genre: 'Action',
                language: 'English',
                duration: 120,
                releaseDate: new Date(),
                status: 'running'
            });
            console.log('Test Movie created');
        } else {
            console.log('Test Movie already exists');
        }

        const partner = await User.findOne({ email: 'partner@test.com' });
        if (!partner) {
            console.log('Partner not found, run seedPartner.js first');
            process.exit(1);
        }

        if (!partner.approvedMovies.includes(movie._id)) {
            partner.approvedMovies.push(movie._id);
            await partner.save();
            console.log('Movie assigned to partner');
        } else {
            console.log('Movie already assigned to partner');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding movie:', error);
        process.exit(1);
    }
};

seedMovieAndAssign();
