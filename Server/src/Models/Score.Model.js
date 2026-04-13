import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    remarks: {
        type: String,
        trim: true
    },
    judge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, { timestamps: true });

// Ensure one score per team per event
scoreSchema.index({ event: 1, team: 1 }, { unique: true });

export default mongoose.model("Score", scoreSchema);
