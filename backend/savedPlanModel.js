import mongoose from 'mongoose';

const savedPlanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            index: true,
        },
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        // Snapshot of the inputs the plan was generated from.
        meta: {
            age: String,
            weight: String,
            height: String,
            experience: String,
        },
    },
    { timestamps: true }
);

const SavedPlan = mongoose.model('SavedPlan', savedPlanSchema);

export default SavedPlan;
