const mongoose = require('mongoose');

const partnerReportSchema = new mongoose.Schema({
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    attachment: {
        type: String 
    },
    status: {
        type: String,
        enum: ['pending', 'viewed', 'resolved'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PartnerReport', partnerReportSchema);
