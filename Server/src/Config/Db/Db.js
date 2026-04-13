import mongoose from 'mongoose';
import config from '../Config.js';

function connectDB() {
    mongoose.connect(config.MONGO_URI)
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((err) => {
        console.log("Database connection failed", err);
    })
}

export default connectDB;