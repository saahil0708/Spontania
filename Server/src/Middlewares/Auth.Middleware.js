import jwt from "jsonwebtoken";
import config from "../Config/Config.js";
import AdminModel from "../Models/Admin.Model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

        const admin = await AdminModel.findById(decodedToken?._id).select("-password -refreshToken");

        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid Access Token" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: error?.message || "Invalid access token" });
    }
};
