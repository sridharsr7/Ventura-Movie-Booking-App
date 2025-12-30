const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
});

const User = mongoose.model('User', userSchema);

const checkUser = async () => {
    await connectDB();
    const email = 'sri@gmail.com';
    const user = await User.findOne({ email });
    console.log(`User with email ${email}:`, user);
    process.exit();
};

checkUser();
