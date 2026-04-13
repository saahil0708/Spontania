import Team from "../Models/Team.Model.js";

async function getTeams(req, res) {
    try {
        const teams = await Team.find();
        return res.status(200).json({
            success: true,
            message: "Teams fetched successfully",
            data: teams
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Minimal CRUD since teams are fixed for now
async function updateTeam(req, res) {
    try {
        const { id } = req.params;
        const updatedTeam = await Team.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: updatedTeam
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export { getTeams, updateTeam };
