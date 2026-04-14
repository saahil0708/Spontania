import mongoose from 'mongoose';
import Event from './src/Models/Event.Model.js';
import dotenv from 'dotenv';

dotenv.config();

const mapping = {
    "Fine Arts": [
        "On the Spot Painting", "Mehndi", "Rangoli", 
        "On the Spot Photography", "Cartooning", 
        "Clay Modelling", "Collage Making"
    ],
    "Dance": [
        "Group Dance (Regional)", "Luddi", "Bhangra Boys", 
        "Western Dance", "Classical Dance"
    ],
    "Singing": [
        "Folk Song (Group)", "Vaar Singing", "Group Shabad/ Bhajan", 
        "Group Song Indian", "Western Group Song"
    ],
    "Theatre": [
        "Mime", "Mimicry", "One Act Play", "Fashion Show"
    ]
};

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const events = await Event.find();
        console.log(`Found ${events.length} events`);

        for (const event of events) {
            let assignedCategory = null;
            
            for (const [category, names] of Object.entries(mapping)) {
                if (names.some(name => event.name.toLowerCase().includes(name.toLowerCase()))) {
                    assignedCategory = category;
                    break;
                }
            }

            if (assignedCategory) {
                event.category = assignedCategory;
                await event.save();
                console.log(`Updated "${event.name}" -> ${assignedCategory}`);
            } else {
                console.log(`No category found for "${event.name}"`);
            }
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
