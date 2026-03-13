const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const verify = async () => {
    try {
        console.log('Connecting to URI:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: 'admin@hospital.com' });
        console.log('Admin user found in DB:', admin !== null);
        console.log('Admin info:', admin);
        process.exit(0);
    } catch (err) {
        console.error('DB ERROR:', err);
        process.exit(1);
    }
};

verify();
