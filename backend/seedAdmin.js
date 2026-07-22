// Creates (or updates) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
// Run with: npm run seed:admin
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './userModel.js';

dotenv.config();

const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD;

async function run() {
    if (!email || !password) {
        console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    let admin = await User.findOne({ email });

    if (admin) {
        admin.role = 'admin';
        await admin.setPassword(password);
        await admin.save();
        console.log(`Updated existing user "${email}" to admin and reset password.`);
    } else {
        admin = new User({
            firstName: 'Admin',
            lastName: 'User',
            email,
            role: 'admin',
        });
        await admin.setPassword(password);
        await admin.save();
        console.log(`Created admin account "${email}".`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
