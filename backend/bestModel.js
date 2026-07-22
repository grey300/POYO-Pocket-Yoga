import mongoose from 'mongoose';

const bestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        unique: true,
    },
    cumulativePoseTime: {
        type: Number,
        required: true,
        default: 0,
    },
    Tree_best: { type: Number, required: false },
    Chair_best: { type: Number, required: false },
    Cobra_best: { type: Number, required: false },
    Warrior_best: { type: Number, required: false },
    Dog_best: { type: Number, required: false },
    Shoulderstand_best: { type: Number, required: false },
});

const Best = mongoose.model('Best', bestSchema);

export default Best;
