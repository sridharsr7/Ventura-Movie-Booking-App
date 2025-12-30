require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/movies', require('./routes/movie'));
app.use('/api/partner', require('./routes/partner'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/uploads', express.static('uploads'));
app.use('/api/contact', require('./routes/contact'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;


const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Failed to connect to DB', error);
        process.exit(1);
    }
};

startServer();
