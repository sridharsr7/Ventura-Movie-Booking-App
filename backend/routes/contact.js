const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');


router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const newMessage = new ContactMessage({
            name,
            email,
            message
        });

        await newMessage.save();

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
