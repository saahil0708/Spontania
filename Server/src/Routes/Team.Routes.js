import { Router } from "express";
import { getTeams, updateTeam } from "../Controllers/Team.Controller.js";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getTeams);
router.route("/:id").patch(verifyJWT, updateTeam);

export default router;
