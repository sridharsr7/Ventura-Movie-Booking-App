const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const ContactMessage = require('./models/ContactMessage');

const checkMessages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const count = await ContactMessage.countDocuments();
        console.log(`Total Contact Messages: ${count}`);

        const messages = await ContactMessage.find();
        console.log('Messages:', JSON.stringify(messages, null, 2));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkMessages();
