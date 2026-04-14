import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["Scheduled", "Ongoing", "Completed"],
        default: "Scheduled"
    }
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
