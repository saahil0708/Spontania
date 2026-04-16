import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: false // Optional for overall final winners
    },
    category: {
        type: String,
        required: false // Optional if specifically for an event
    },
    rank: {
        type: Number,
        required: true,
        default: 1 // 1st, 2nd, 3rd...
    },
    type: {
        type: String,
        enum: ["Round", "Final"],
        required: true
    },
    isAnnounced: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Winner", winnerSchema);
