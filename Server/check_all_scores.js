import mongoose from 'mongoose';
import Team from './src/models/Team.Model.js';
import Event from './src/models/Event.Model.js';
import Score from './src/models/Score.Model.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkScores() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const scores = await Score.find({}).populate('event').populate('team');
        console.log('--- ALL SCORES IN DB ---');
        scores.forEach(s => {
            console.log(`Event: ${s.event?.name}, Team: ${s.team?.name}, Score: ${s.score}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkScores();
