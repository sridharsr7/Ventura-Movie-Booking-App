const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./db');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        try {
            await User.collection.dropIndex('username_1');
            console.log('Dropped stale username_1 index');
        } catch (e) {
        }

        const adminExists = await User.findOne({ email: 'admin' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const admin = await User.create({
            name: 'Admin',
            email: 'admin',
            mobile: '1234567890',
            password: 'admin123'
        });

        console.log('Admin user created successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
