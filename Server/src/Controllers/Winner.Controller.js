import Winner from "../Models/Winner.Model.js";

async function declareWinner(req, res) {
    try {
        const { teamId, eventId, category, rank, type } = req.body;

        if (!teamId || !type || !rank) {
            return res.status(400).json({ success: false, message: "Team ID, Type, and Rank are required" });
        }

        // If it's a Round winner, we usually want to know which event or category
        const winner = await Winner.create({
            team: teamId,
            event: eventId,
            category,
            rank,
            type,
            isAnnounced: false
        });

        return res.status(201).json({
            success: true,
            message: "Winner declared successfully",
            data: winner
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getWinners(req, res) {
    try {
        const winners = await Winner.find()
            .populate("team", "name color institution")
            .populate("event", "name category")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: winners
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function markAsAnnounced(req, res) {
    try {
        const { winnerId } = req.params;
        await Winner.findByIdAndUpdate(winnerId, { isAnnounced: true });
        return res.status(200).json({ success: true, message: "Winner marked as announced" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function resetWinners(req, res) {
    try {
        await Winner.deleteMany({});
        return res.status(200).json({ success: true, message: "All winners cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export { declareWinner, getWinners, markAsAnnounced, resetWinners };
