import Score from "../Models/Score.Model.js";

async function addOrUpdateScore(req, res) {
    try {
        const { eventId, teamId, score, remarks } = req.body;
        if (!eventId || !teamId) {
            return res.status(400).json({ success: false, message: "Event ID and Team ID are required" });
        }

        const updatedScore = await Score.findOneAndUpdate(
            { event: eventId, team: teamId },
            { 
                score, 
                remarks, 
                judge: req.admin?._id // Admin ID from JWT middleware
            },
            { upsert: true, new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Score recorded successfully",
            data: updatedScore
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getScoresByEvent(req, res) {
    try {
        const { eventId } = req.params;
        const scores = await Score.find({ event: eventId }).populate("team", "name color");
        // Filter out scores where team population failed (orphaned references)
        const validScores = scores.filter(s => s.team);
        
        return res.status(200).json({
            success: true,
            message: "Scores fetched successfully",
            data: validScores
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getAllScores(req, res) {
    try {
        const scores = await Score.find()
            .populate("team", "name color institution")
            .populate("event", "name date");
        
        // Filter out scores where team or event population failed
        const validScores = scores.filter(s => s.team && s.event);

        return res.status(200).json({
            success: true,
            message: "All scores fetched successfully",
            data: validScores
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export { addOrUpdateScore, getScoresByEvent, getAllScores };
