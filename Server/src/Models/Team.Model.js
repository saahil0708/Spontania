import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    color: {
        type: String,
        required: true
    },
    institution: {
        type: String,
        default: "Spontania"
    }
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);
