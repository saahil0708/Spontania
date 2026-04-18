import mongoose from 'mongoose';
import Team from './src/models/Team.Model.js';
import Event from './src/models/Event.Model.js';
import Score from './src/models/Score.Model.js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Identify events to delete (The ones I accidentally seeded)
        const eventsToDelete = await Event.find({ 
            name: { $in: ["Inkspire", "Fee Recovery", "Sponsors", "Tournament Baseline (Old)"] } 
        });

        const eventIds = eventsToDelete.map(e => e._id);
        
        // Delete Scores for these events
        await Score.deleteMany({ event: { $in: eventIds } });
        console.log(`Deleted scores for ${eventsToDelete.length} events`);

        // Delete the Events themselves
        await Event.deleteMany({ _id: { $in: eventIds } });
        console.log(`Deleted ${eventsToDelete.length} events`);

        console.log('Cleanup complete!');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

cleanup();
