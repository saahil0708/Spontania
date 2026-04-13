import mongoose from "mongoose";
import Team from "../Models/Team.Model.js";
import config from "../Config/Config.js";

const teams = [
    { name: "White Napoleons", color: "white" },
    { name: "Red Romans", color: "red" },
    { name: "Blue Victorians", color: "blue" },
    { name: "Green Gladiators", color: "green" }
];

async function seedTeams() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        for (const team of teams) {
            await Team.findOneAndUpdate(
                { name: team.name },
                team,
                { upsert: true, new: true }
            );
        }

        console.log("Teams seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding teams:", error);
        process.exit(1);
    }
}

seedTeams();
