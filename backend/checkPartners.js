const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://Sridhar:Sridharsr7@sricluster.kdp0dka.mongodb.net/?appName=SriCluster').then(async () => {
    console.log("Connected to MongoDB");
    try {
        const partners = await User.find({ role: 'partner' });
        console.log("Found partners:", partners.length);
        partners.forEach(p => {
            console.log(`Partner: ${p.name}, Location: '${p.location}', Raw:`, p.location);
        });

        const distinctLocations = await User.find({ role: 'partner' }).distinct('location');
        console.log("Distinct locations:", distinctLocations);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}).catch(err => console.error(err));
