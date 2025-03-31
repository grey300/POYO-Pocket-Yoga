// import mongoose from 'mongoose';

// const bestSchema = new mongoose.Schema(
//     {
//         clerkUserId: { type: String, unique: true, required: true },
//         bestPoseTime: { type: Number, required: true },
//     },
//     { timestamps: true }
// );

// const Best = mongoose.model('Best', bestSchema);

// export default Best;

import mongoose from 'mongoose';

const bestSchema = new mongoose.Schema({
    clerkUserId: {
        type: String,
        required: true,
        unique: true,
    },
    cumulativePoseTime: {
        type: Number,
        required: true,
        default: 0,
    },

    Tree_best:{
        type: String,
        required: false
    },
    Chair_best:{
        type: String,
        required: false
    },
    Cobra_best:{
        type: String,
        required: false
    },
    Warrior_best:{
        type: String,
        required: false
    },
    Dog_best:{
        type: String,
        required: false
    },
    Shoulderstand_best:{
        type: String,
        required: false
    }
    
});

const Best = mongoose.model('Best', bestSchema);

export default Best;
