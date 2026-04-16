import { Router } from "express";
import { declareWinner, getWinners, markAsAnnounced, resetWinners } from "../Controllers/Winner.Controller.js";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getWinners).post(declareWinner);
router.route("/announce/:winnerId").patch(markAsAnnounced);
router.route("/reset").delete(resetWinners);

export default router;
