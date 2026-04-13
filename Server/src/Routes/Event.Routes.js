import { Router } from "express";
import { createEvent, getEvents, updateEvent, deleteEvent } from "../Controllers/Event.Controller.js";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.use(verifyJWT); // All event routes require admin authentication

router.route("/").post(createEvent).get(getEvents);
router.route("/:id").patch(updateEvent).delete(deleteEvent);

export default router;
