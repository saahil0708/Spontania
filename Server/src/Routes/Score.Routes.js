import { Router } from "express";
import { addOrUpdateScore, getScoresByEvent } from "../Controllers/Score.Controller.js";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(addOrUpdateScore);
router.route("/event/:eventId").get(getScoresByEvent);

export default router;
