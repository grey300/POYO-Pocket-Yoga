import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { OAuth2Client } from 'google-auth-library';
import User from './userModel.js';
import Best from './bestModel.js';
import Performance from './performanceModel.js';
import { signToken, requireAuth, requireAdmin } from './authMiddleware.js';

dotenv.config();

const port = process.env.PORT || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const googleClientId =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_oauth_client_id'
        ? process.env.GOOGLE_CLIENT_ID
        : null;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const app = express();

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

// Cache the Mongo connection so serverless cold starts reuse a single
// connection instead of opening a new one on every invocation (which would
// exhaust MongoDB Atlas connection limits).
let dbPromise = null;
function connectDB() {
    if (!dbPromise) {
        dbPromise = mongoose
            .connect(process.env.MONGODB_URL)
            .then((conn) => {
                console.log('Connected to DB');
                return conn;
            })
            .catch((err) => {
                dbPromise = null; // allow a retry on the next request
                throw err;
            });
    }
    return dbPromise;
}

// Ensure the database is connected before handling any request.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection error:', err.message);
        res.status(503).json({ success: false, message: 'Database unavailable' });
    }
});

/* ----------------------------- Auth routes ----------------------------- */

app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }

        const user = new User({ firstName, lastName, email });
        await user.setPassword(password);
        await user.save();

        const token = signToken(user);
        res.status(201).json({ success: true, token, user: user.toSafeObject() });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: (email || '').toLowerCase().trim() });
        if (!user || !(await user.comparePassword(password || ''))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = signToken(user);
        res.status(200).json({ success: true, token, user: user.toSafeObject() });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Sign in / sign up with Google. Verifies the ID token from Google Identity
// Services, then finds or creates a local user and issues our own JWT.
app.post('/api/auth/google', async (req, res) => {
    if (!googleClient) {
        return res.status(503).json({ success: false, message: 'Google sign-in is not configured on the server.' });
    }

    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({ success: false, message: 'Missing Google credential' });
    }

    try {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
        const payload = ticket.getPayload();

        if (!payload?.email_verified) {
            return res.status(401).json({ success: false, message: 'Google email is not verified' });
        }

        const email = payload.email.toLowerCase().trim();
        let user = await User.findOne({ email });

        if (user) {
            // Link the Google identity to an existing local account.
            if (!user.googleId) {
                user.googleId = payload.sub;
                if (payload.picture) user.avatar = payload.picture;
                await user.save();
            }
        } else {
            user = new User({
                firstName: payload.given_name || 'Google',
                lastName: payload.family_name || 'User',
                email,
                googleId: payload.sub,
                avatar: payload.picture,
            });
            await user.save();
        }

        const token = signToken(user);
        res.status(200).json({ success: true, token, user: user.toSafeObject() });
    } catch (err) {
        console.error('Google auth error:', err.message);
        res.status(401).json({ success: false, message: 'Google sign-in failed' });
    }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user: user.toSafeObject() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* --------------------------- User data routes --------------------------- */

app.post('/api/update-best-time', requireAuth, async (req, res) => {
    const { bestPoseTime, pose_name } = req.body;

    try {
        const updateObject = {
            [`${pose_name}_best`]: bestPoseTime,
            $inc: { cumulativePoseTime: bestPoseTime },
        };
        await Best.findOneAndUpdate(
            { userId: req.user.id },
            updateObject,
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, message: 'cumulative pose time updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/update-performance', requireAuth, async (req, res) => {
    const { pose_name, bestTime } = req.body;

    try {
        const bestTimeField = `${pose_name}_best.best_time`;
        const dateField = `${pose_name}_best.date`;

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const existingPerformance = await Performance.findOne({
            userId: req.user.id,
            [dateField]: { $gte: startOfDay, $lt: endOfDay },
        });

        if (existingPerformance) {
            const currentBestTime = existingPerformance[pose_name + '_best'].best_time || 0;
            if (bestTime > currentBestTime) {
                existingPerformance[pose_name + '_best'].best_time = bestTime;
                existingPerformance[pose_name + '_best'].date = new Date();
                await existingPerformance.save();
                res.status(200).json({ success: true, message: 'Best time updated for today' });
            } else {
                res.status(200).json({ success: true, message: 'New best time is not greater than the current best time' });
            }
        } else {
            const updateObject = {
                userId: req.user.id,
                [bestTimeField]: bestTime,
                [dateField]: new Date(),
            };
            await Performance.findOneAndUpdate(
                { userId: req.user.id },
                updateObject,
                { new: true, upsert: true }
            );
            res.status(200).json({ success: true, message: 'New best time created for today' });
        }
    } catch (err) {
        console.error('Error updating performance:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Current user's profile + best times.
app.get('/api/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const best = await Best.findOne({ userId: req.user.id });
        res.status(200).json({
            success: true,
            user: {
                ...user.toSafeObject(),
                ...(best ? best.toObject() : {}),
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/best-times', requireAuth, async (req, res) => {
    try {
        const bestTimes = await Best.find({ userId: req.user.id });
        res.status(200).json({ success: true, bestTimes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/get-performance', requireAuth, async (req, res) => {
    try {
        const allPerformance = await Performance.findOne({ userId: req.user.id });

        if (allPerformance) {
            const transformedPerformance = {};
            for (const [key, value] of Object.entries(allPerformance.toObject())) {
                if (key.endsWith('_best') && typeof value === 'object' && value.date && value.best_time !== undefined) {
                    const poseName = key.replace('_best', '');
                    if (!transformedPerformance[poseName]) transformedPerformance[poseName] = [];
                    transformedPerformance[poseName].push({ date: value.date, best_time: value.best_time });
                }
            }
            res.status(200).json({ success: true, performanceData: transformedPerformance });
        } else {
            res.status(200).json({ success: true, performanceData: {} });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/leaderboard', requireAuth, async (req, res) => {
    const { pose } = req.query;
    try {
        const bestField = `${pose}_best`;
        const leaderboard = await Best.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            { $unwind: '$userDetails' },
            { $addFields: { [bestField]: { $toDouble: { $ifNull: [`$${bestField}`, 0] } } } },
            { $sort: { [bestField]: -1 } },
            {
                $project: {
                    _id: 0,
                    userId: 1,
                    [bestField]: 1,
                    'userDetails.firstName': 1,
                    'userDetails.lastName': 1,
                },
            },
        ]);
        res.status(200).json({ success: true, leaderboard });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* ------------------------------ AI planner ------------------------------ */

app.post('/api/generate-plan', async (req, res) => {
    if (!openai) {
        return res.status(503).json({
            success: false,
            message: 'AI planner is not configured. Set OPENAI_API_KEY on the server.',
        });
    }

    const { age, weight, height, experience } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant designed to create personalized yoga plans.' },
                {
                    role: 'user',
                    content: `Generate a personalized yoga plan for a ${age}-year-old person with a weight of ${weight}kg and a height of ${height}cm. They have ${experience} experience level in yoga. Only use Tree, Chair, Cobra, Warrior, Dog, Shoulderstand poses.`,
                },
            ],
            model: 'gpt-3.5-turbo-0125',
            max_tokens: 300,
            temperature: 0.7,
        });
        res.status(200).json({ success: true, plan: completion.choices[0].message.content });
    } catch (err) {
        console.error('Error generating plan:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

/* --------------------------- Admin: user mgmt --------------------------- */

app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        const [totalUsers, totalAdmins, bestAgg] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'admin' }),
            Best.aggregate([{ $group: { _id: null, total: { $sum: '$cumulativePoseTime' } } }]),
        ]);
        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalAdmins,
                totalMembers: totalUsers - totalAdmins,
                totalPracticeTime: bestAgg[0]?.total || 0,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        const filter = search
            ? {
                  $or: [
                      { firstName: { $regex: search, $options: 'i' } },
                      { lastName: { $regex: search, $options: 'i' } },
                      { email: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};
        const users = await User.find(filter).sort({ createdAt: -1 }).select('-passwordHash -__v');
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash -__v');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const best = await Best.findOne({ userId: user._id });
        res.status(200).json({ success: true, user, best: best || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    try {
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }
        const user = new User({ firstName, lastName, email, role: role === 'admin' ? 'admin' : 'user' });
        await user.setPassword(password);
        await user.save();
        res.status(201).json({ success: true, user: user.toSafeObject() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
    const { firstName, lastName, email, role, password } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Prevent an admin from demoting the last remaining admin.
        if (user.role === 'admin' && role === 'user') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot demote the last remaining admin' });
            }
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (role === 'user' || role === 'admin') user.role = role;
        if (password) await user.setPassword(password);

        await user.save();
        res.status(200).json({ success: true, user: user.toSafeObject() });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot delete the last remaining admin' });
            }
        }

        await Promise.all([
            User.deleteOne({ _id: user._id }),
            Best.deleteOne({ userId: user._id }),
            Performance.deleteOne({ userId: user._id }),
        ]);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/* -------------------------------- Startup ------------------------------- */

// Kick off the first DB connection eagerly (non-blocking).
connectDB().catch((err) => console.error('Initial DB connection failed:', err.message));

// Listen locally and on hosts that run the process (Vercel Node runtime, Render).
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

export default app;
