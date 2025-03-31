import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Webhook } from 'svix';
import bodyParser from 'body-parser';
import mongoose, { Schema } from 'mongoose';
import User from './userModel.js';
import Best from './bestModel.js';
import Performance from './performanceModel.js';

dotenv.config();

mongoose
    .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to DB');
        app.listen(port, () => {
            console.log(`Server is listening at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err.message);
    });

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

app.post('/api/webhooks', async (req, res) => {
    try {
        const payloadString = req.rawBody;
        const svixHeaders = req.headers;

        console.log('Headers:', svixHeaders);
        console.log('Raw Body:', payloadString);

        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY);
        const evt = wh.verify(payloadString, svixHeaders);

        const { id, ...attributes } = evt.data;
        const eventType = evt.type;

        if (eventType === 'user.created') {
            const firstName = attributes.first_name;
            const lastName = attributes.last_name;

            console.log(firstName);

            const user = new User({
                clerkUserId: id,
                firstName: firstName,
                lastName: lastName
            });

            await user.save();
            console.log('User is created');
        }

        res.status(200).json({
            success: true,
            message: 'Webhook received',
        });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});

app.post('/api/update-best-time', async (req, res) => {
    const { clerkUserId, bestPoseTime, pose_name } = req.body;

    try {
        // const existingBest = await Best.findOne({ clerkUserId: clerkUserId, pose: pose_name });

        // if (existingBest) {
        //     const currentBestTime = existingBest.bestTime || 0;

        //     if (bestPoseTime > currentBestTime) {
        //         existingBest.bestTime = bestPoseTime;
        //         existingBest.date = new Date();
        //         await existingBest.save();

        //         res.status(200).json({
        //             success: true,
        //             message: 'Best time updated',
        //         });
        //     } else {
        //         res.status(200).json({
        //             success: true,
        //             message: 'New best time is not greater than the current best time',
        //         });
        //     }
        // } else {
        //     let newBest = new Best({
        //         clerkUserId: clerkUserId,
        //         pose: pose_name,
        //         bestTime: bestPoseTime,
        //         date: new Date()
        //     });

        //     await newBest.save();

        //     res.status(200).json({
        //         success: true,
        //         message: 'New best time created',
        //     });
        // }


        let updateObject = {};
        updateObject[`${pose_name}_best`] = bestPoseTime;
        updateObject['$inc'] = { cumulativePoseTime: bestPoseTime }
        const updateBest = await Best.findOneAndUpdate({ clerkUserId: clerkUserId }, updateObject, { new: true, upsert: true })
        console.log(updateBest)
        res.status(200).json({ success: true, message: "cumulative pose time updated" })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

app.get('/api/best-times/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const bestTimes = await Best.find({ clerkUserId: userId }).sort({ date: 1 });
        res.status(200).json({
            success: true,
            bestTimes,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// Endpoint to get user's profile data
app.get('/api/user-profile/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(userId);
    try {
        const user = await User.findOne({ clerkUserId: userId });
        console.log(user);
        if (user) {
            const best = await Best.findOne({ clerkUserId: userId });
            res.status(200).json({
                success: true,
                user: {
                    ...user.toObject(),
                    ...best.toObject(),
                },
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// Endpoint to get leaderboard data
app.get('/api/leaderboard', async (req, res) => {
    const { pose } = req.query;
    try {
        const leaderboard = await Best.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'clerkUserId',
                    foreignField: 'clerkUserId',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $sort: { [`${pose}_best`]: -1 }
            },
            {
                $project: {
                    _id: 0,
                    clerkUserId: 1,
                    [`${pose}_best`]: 1,
                    'userDetails.firstName': 1,
                    'userDetails.lastName': 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            leaderboard,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// app.post('/api/update-performance', async (req, res) => {
//     const { clerkUserId, pose_name, bestTime } = req.body;

//     try {
//         const bestTimeField = `${pose_name}_best.best_time`;
//         const dateField = `${pose_name}_best.date`;

//         // const pose1 = `${pose}_best`
//         const today = new Date()
//         const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//         const endOfDay = new Date(today.setHours(23, 59, 59, 999));
//         const existingPerformance = await Performance.findOne({
//             clerkUserId: clerkUserId,
//             // pose: pose,
//             [dateField]: {
//                 $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of the day
//                 $lt: new Date(new Date().setHours(23, 59, 59, 999)) // End of the day

//             }
//         });

//         if (existingPerformance) {
//             const currentBestTime = existingPerformance[pose_name + '_best'].best_time || 0;
//             if (bestTime > currentBestTime) {
//                 existingPerformance[pose_name + '_best'].best_time = bestTime;
//                 existingPerformance[pose_name + '_best'].date = new Date();
//                 await existingPerformance.save()

//                 res.status(200).json({
//                     success: true,
//                     message: "Best time updated for today"
//                 })
//             } else {
//                 res.status(200).json({
//                     success: true,
//                     message: 'New best time is not greater than the current best time'
//                 })
//             }
//         } else {
//             let updateObject = {
//                 clerkUserId: clerkUserId,
//                 [bestTimeField]: bestTime,
//                 [dateField]: new Date
//             }
//             const updatedPerformance = await Performance.findOneAndUpdate({ clerkUserId: clerkUserId }, updateObject, { new: true, upsert: true })
//             res.status(200).json({ success: true, message: "New best time created for today" })
//         }
//     } catch (err) {
//         console.error('Error updating performance:', err);
//         res.status(500).json({
//             success: false,
//             message: err.message,
//         });
//     }
// });

// app.get('/api/get-performance/:clerkid', async (req, res) => {
//     try {
//         const clearkid = req.params.clerkid
//         const allPerformance = await Performance.findOne({ clerkUserId: clearkid })

//         if (allPerformance != null) {
//             res.status(200).json({
//                 success: true,
//                 allPerformance: allPerformance
//             })
//         }
//         else {
//             res.status(403).json({
//                 success: false,
//                 message: 'Not found at all'
//             })
//         }

//     }
//     catch (err) {
//         res.status(500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
// )

app.post('/api/update-performance', async (req, res) => {
    const { clerkUserId, pose_name, bestTime } = req.body;

    try {
        const bestTimeField = `${pose_name}_best.best_time`;
        const dateField = `${pose_name}_best.date`;

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const existingPerformance = await Performance.findOne({
            clerkUserId: clerkUserId,
            [dateField]: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        if (existingPerformance) {
            const currentBestTime = existingPerformance[pose_name + '_best'].best_time || 0;
            if (bestTime > currentBestTime) {
                existingPerformance[pose_name + '_best'].best_time = bestTime;
                existingPerformance[pose_name + '_best'].date = new Date();
                await existingPerformance.save();

                res.status(200).json({
                    success: true,
                    message: "Best time updated for today"
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: 'New best time is not greater than the current best time'
                });
            }
        } else {
            let updateObject = {
                clerkUserId: clerkUserId,
                [bestTimeField]: bestTime,
                [dateField]: new Date()
            };
            const updatedPerformance = await Performance.findOneAndUpdate(
                { clerkUserId: clerkUserId },
                updateObject,
                { new: true, upsert: true }
            );
            res.status(200).json({ success: true, message: "New best time created for today" });
        }
    } catch (err) {
        console.error('Error updating performance:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

app.get('/api/get-performance/:clerkid', async (req, res) => {
    try {
        const clerkid = req.params.clerkid;
        const allPerformance = await Performance.findOne({ clerkUserId: clerkid });

        if (allPerformance) {
            // Transform the performance data into the expected format
            const transformedPerformance = {};

            for (const [key, value] of Object.entries(allPerformance.toObject())) {
                if (key.endsWith('_best') && typeof value === 'object' && value.date && value.best_time !== undefined) {
                    const poseName = key.replace('_best', '');
                    if (!transformedPerformance[poseName]) {
                        transformedPerformance[poseName] = [];
                    }
                    transformedPerformance[poseName].push({
                        date: value.date,
                        best_time: value.best_time
                    });
                }
            }

            res.status(200).json({
                success: true,
                performanceData: transformedPerformance
            });
        } else {
            res.status(403).json({
                success: false,
                message: 'Not found at all'
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


const port = process.env.PORT || 80;
