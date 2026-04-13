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
        return res.status(200).json({
            success: true,
            message: "Scores fetched successfully",
            data: scores
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export { addOrUpdateScore, getScoresByEvent };
