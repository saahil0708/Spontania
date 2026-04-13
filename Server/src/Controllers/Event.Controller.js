import Event from "../Models/Event.Model.js";

async function createEvent(req, res) {
    try {
        const { name, description, date, location } = req.body;
        if (!name || !date) {
            return res.status(400).json({ success: false, message: "Name and date are required" });
        }

        const event = await Event.create({ name, description, date, location });

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getEvents(req, res) {
    try {
        const events = await Event.find().sort({ date: 1 });
        return res.status(200).json({
            success: true,
            message: "Events fetched successfully",
            data: events
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function updateEvent(req, res) {
    try {
        const { id } = req.params;
        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: updatedEvent
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function deleteEvent(req, res) {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export { createEvent, getEvents, updateEvent, deleteEvent };
