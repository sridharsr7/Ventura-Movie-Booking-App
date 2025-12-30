const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./db');

dotenv.config();

const seedPartner = async () => {
    try {
        await connectDB();

        const partnerExists = await User.findOne({ email: 'partner@test.com' });

        if (partnerExists) {
            console.log('Partner user already exists');
            partnerExists.password = 'password123';
            await partnerExists.save();
            console.log('Partner password reset to password123');
            process.exit();
        }

        await User.create({
            name: 'Test Partner',
            email: 'partner@test.com',
            mobile: '9876543210',
            password: 'password123',
            role: 'partner',
            address: '123 Test St',
            location: 'Test City'
        });

        console.log('Partner user created successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding partner:', error);
        process.exit(1);
    }
};

seedPartner();
