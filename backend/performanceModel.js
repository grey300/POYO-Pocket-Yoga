// performanceModel.js
import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    Tree_best: {
        best_time: { type: Number, required: false },
        date: { type: Date, required: false },
    },
    Chair_best: {
        best_time: { type: Number, required: false },
        date: { type: Date, required: false },
    },
    Cobra_best: {
        best_time: { type: Number, required: false },
        date: { type: Date, required: false },
    },
    Warrior_best: {
        best_time: { type: Number, required: false },
        date: { type: Date, required: false },
    },
    Dog_best: {
        best_time: { type: Number, required: false },
        date: { type: Date, required: false },
    },
    Shoulderstand_best: {
        best_time: { type: Number, required: false },
        date: { type: Date, required: false },
    },
});

const Performance = mongoose.model('Performance', performanceSchema);

export default Performance;
