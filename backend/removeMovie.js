const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('./models/Movie');

const removeMovie = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const result = await Movie.deleteOne({ title: 'asdad' });

        if (result.deletedCount > 0) {
            console.log('Successfully removed movie: asdad');
        } else {
            console.log('Movie not found: asdad');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

removeMovie();
