const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    poster: { type: String, required: true },
    trailerLink: { type: String },
    genre: { type: String, required: true },
    language: { type: String, required: true },
    duration: { type: Number, required: true },
    releaseDate: { type: Date, required: true },
    displayFormat: { type: String, default: '2D', enum: ['2D', '3D', '4DX', 'IMAX 2D', 'IMAX 3D', 'SCREEN X', 'All'] },
    format: { type: String, default: '2D', enum: ['2D', '3D', '4DX', 'IMAX 2D', 'IMAX 3D', 'SCREEN X', 'All'] },
    status: { type: String, enum: ['running', 'upcoming'], default: 'upcoming' },
    cast: [{
        name: String,
        role: String,
        characterName: String,
        photo: String
    }],
    crew: [{
        name: String,
        role: String,
        photo: String
    }],
    averageRating: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
