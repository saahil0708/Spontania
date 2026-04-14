import mongoose from 'mongoose';
import Event from './src/Models/Event.Model.js';
import dotenv from 'dotenv';

dotenv.config();

const eventsToSeed = [
    { name: "On the Spot Painting", category: "Fine Arts" },
    { name: "Mehndi", category: "Fine Arts" },
    { name: "Rangoli", category: "Fine Arts" },
    { name: "On the Spot Photography", category: "Fine Arts" },
    { name: "Cartooning", category: "Fine Arts" },
    { name: "Clay Modelling", category: "Fine Arts" },
    { name: "Collage Making", category: "Fine Arts" },
    
    { name: "Group Dance (Regional)", category: "Dance" },
    { name: "Luddi", category: "Dance" },
    { name: "Bhangra Boys", category: "Dance" },
    { name: "Western Dance", category: "Dance" },
    { name: "Classical Dance", category: "Dance" },
    
    { name: "Folk Song (Group)", category: "Singing" },
    { name: "Vaar Singing", category: "Singing" },
    { name: "Group Shabad/ Bhajan", category: "Singing" },
    { name: "Group Song Indian", category: "Singing" },
    { name: "Western Group Song", category: "Singing" },
    
    { name: "Mime", category: "Theatre" },
    { name: "Mimicry", category: "Theatre" },
    { name: "One Act Play", category: "Theatre" },
    { name: "Fashion Show", category: "Theatre" }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const eventData of eventsToSeed) {
            const existing = await Event.findOne({ name: eventData.name });
            if (!existing) {
                await Event.create(eventData);
                console.log(`Created event: ${eventData.name}`);
            } else {
                existing.category = eventData.category;
                await existing.save();
                console.log(`Updated event: ${eventData.name}`);
            }
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
