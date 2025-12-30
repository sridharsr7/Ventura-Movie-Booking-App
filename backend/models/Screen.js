const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    screenType: { type: String, enum: ['IMAX', '2D', '3D', '4DX', 'SCREEN X'], default: '2D' },
    seatCapacity: { type: Number, required: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],

    showtimes: [{
        movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
        time: { type: String, required: true },
        date: { type: Date, required: true }
    }],


    rowPrices: {
        type: Map,
        of: Number,
        default: {}
    },

    rowNames: {
        type: Map,
        of: String,
        default: {}
    },

    specialSeats: [{
        row: { type: Number, required: true },
        col: { type: Number, required: true },
        status: { type: String, enum: ['damaged', 'disabled', 'gap'], required: true }
    }]

}, { timestamps: true });

module.exports = mongoose.model('Screen', screenSchema);
