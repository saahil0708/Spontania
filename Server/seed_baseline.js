import mongoose from 'mongoose';
import Team from './src/models/Team.Model.js';
import Event from './src/models/Event.Model.js';
import Score from './src/models/Score.Model.js';
import dotenv from 'dotenv';

dotenv.config();

const BASELINE_SCORES = {
    "White Napoleons": 186,
    "Blue Victorians": 204,
    "Green Gladiators": 201,
    "Red Romans": 160
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create Baseline Event
        let event = await Event.findOne({ name: "Tournament Baseline" });
        if (!event) {
            event = await Event.create({ 
                name: "Tournament Baseline", 
                category: "Fine Arts", // Valid category per enum
                status: "Completed"
            });
            console.log('Created Baseline Event');
        }

        // 2. Set Scores
        for (const [teamName, points] of Object.entries(BASELINE_SCORES)) {
            const team = await Team.findOne({ name: teamName });
            if (team) {
                await Score.findOneAndUpdate(
                    { event: event._id, team: team._id },
                    { score: points.toString() },
                    { upsert: true, returnDocument: 'after' }
                );
                console.log(`Set ${teamName} to ${points}`);
            } else {
                console.warn(`Team ${teamName} not found`);
            }
        }

        console.log('Baseline seeding complete!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
