const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./db');

dotenv.config();

const updateAdminRole = async () => {
    try {
        await connectDB();

        const adminUser = await User.findOne({ email: 'admin' });

        if (adminUser) {
            adminUser.role = 'admin';
            await adminUser.save();
            console.log('Admin user role updated to "admin"');
        } else {
            console.log('Admin user not found');
        }

        process.exit();
    } catch (error) {
        console.error('Error updating admin role:', error);
        process.exit(1);
    }
};

updateAdminRole();
