const mongoose = require('mongoose');
require('dotenv').config();

const Team = require('./src/models/Team.Model');
const Event = require('./src/models/Event.Model');

async function listData() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const teams = await Team.find({});
    console.log('--- TEAMS ---');
    teams.forEach(t => console.log(`${t.name} (${t.color}): ${t._id}`));

    const events = await Event.find({});
    console.log('\n--- EVENTS ---');
    events.forEach(e => console.log(`${e.name}: ${e._id}`));

    await mongoose.disconnect();
}

listData().catch(err => console.error(err));
