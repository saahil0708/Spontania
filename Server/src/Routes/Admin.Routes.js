import { Router } from "express";
import { registerAdmin, loginAdmin, getCurrentAdmin } from "../Controllers/Admin.Controller.js";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/me").get(verifyJWT, getCurrentAdmin);

export default router;
