import mongoose from 'mongoose';
import Team from './src/models/Team.Model.js';
import Event from './src/models/Event.Model.js';
import Score from './src/models/Score.Model.js';
import dotenv from 'dotenv';

dotenv.config();

async function deepCleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Delete scores with no event reference
        const orphaned = await Score.deleteMany({ event: { $exists: false } });
        console.log(`Deleted ${orphaned.deletedCount} orphaned scores`);

        // Check if there are scores for the "Tournament Baseline" only
        const allScores = await Score.find({}).populate('event');
        for (const s of allScores) {
            if (s.event?.name !== "Tournament Baseline") {
                // If it's a round score, set it to "0"
                await Score.findByIdAndUpdate(s._id, { score: "0" });
            }
        }
        console.log('Reset all non-baseline scores to 0');

        console.log('Deep cleanup complete!');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

deepCleanup();
