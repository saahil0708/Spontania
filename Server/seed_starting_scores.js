import mongoose from 'mongoose';
import Team from './src/models/Team.Model.js';
import Event from './src/models/Event.Model.js';
import Score from './src/models/Score.Model.js';
import dotenv from 'dotenv';

dotenv.config();

const SCORES = [
    {
        event: "Inkspire",
        category: "Fine Arts",
        scores: {
            "White Napoleons": 120,
            "Blue Victorians": 138,
            "Green Gladiators": 141,
            "Red Romans": 120
        }
    },
    {
        event: "Fee Recovery",
        category: "General",
        scores: {
            "White Napoleons": 26,
            "Blue Victorians": 40,
            "Green Gladiators": 30,
            "Red Romans": 20
        }
    },
    {
        event: "Sponsors",
        category: "General",
        scores: {
            "White Napoleons": 40,
            "Blue Victorians": 26,
            "Green Gladiators": 30,
            "Red Romans": 20
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Get/Create Teams
        const teamMap = {};
        const teamsList = [
            { name: "White Napoleons", color: "white" },
            { name: "Blue Victorians", color: "blue" },
            { name: "Green Gladiators", color: "green" },
            { name: "Red Romans", color: "red" }
        ];

        for (const t of teamsList) {
            let team = await Team.findOne({ name: t.name });
            if (!team) {
                team = await Team.create(t);
                console.log(`Created team: ${t.name}`);
            }
            teamMap[t.name] = team._id;
        }

        // 2. Process Scores
        for (const s of SCORES) {
            let event = await Event.findOne({ name: s.event });
            if (!event) {
                event = await Event.create({ name: s.event, category: s.category });
                console.log(`Created event: ${s.event}`);
            }

            for (const [teamName, points] of Object.entries(s.scores)) {
                await Score.findOneAndUpdate(
                    { event: event._id, team: teamMap[teamName] },
                    { score: points.toString() },
                    { upsert: true, new: true }
                );
            }
            console.log(`Updated scores for event: ${s.event}`);
        }

        console.log('Seeding complete!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
