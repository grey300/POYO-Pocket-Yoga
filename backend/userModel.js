import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        // Optional: Google-only accounts have no local password.
        passwordHash: { type: String },
        // Set for accounts created/linked via Google Sign-In.
        googleId: { type: String, sparse: true },
        avatar: { type: String },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        // --- Gamification / activity tracking ---
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastPracticeDate: { type: Date },
        sessionCount: { type: Number, default: 0 },
        planCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Hash the plaintext password held on a transient `password` field before save.
userSchema.methods.setPassword = async function setPassword(plain) {
    this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.comparePassword = function comparePassword(plain) {
    if (!this.passwordHash) return Promise.resolve(false);
    return bcrypt.compare(plain, this.passwordHash);
};

// Never leak the hash to clients.
userSchema.methods.toSafeObject = function toSafeObject() {
    const { passwordHash, __v, ...rest } = this.toObject();
    return rest;
};

const User = mongoose.model('Users', userSchema);

export default User;
