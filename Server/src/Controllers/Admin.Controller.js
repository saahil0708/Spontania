import AdminModel from "../Models/Admin.Model.js";
import config from "../Config/Config.js";

const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "None"
};

const generateTokens = async (adminId) => {
    try {
        const admin = await AdminModel.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error("Error generating tokens");
    }
};

async function registerAdmin(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existedAdmin = await AdminModel.findOne({ email });
        if (existedAdmin) {
            return res.status(409).json({ success: false, message: "Admin with this email already exists" });
        }

        const admin = await AdminModel.create({ name, email, password });
        
        const { accessToken, refreshToken } = await generateTokens(admin._id);

        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                success: true,
                message: "Admin registered successfully",
                data: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email
                }
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function loginAdmin(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const isPasswordValid = admin.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = await generateTokens(admin._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                success: true,
                message: "Logged in successfully",
                data: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email
                }
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function getCurrentAdmin(req, res) {
    try {
        return res.status(200).json({
            success: true,
            message: "Admin fetched successfully",
            data: {
                _id: req.admin._id,
                name: req.admin.name,
                email: req.admin.email
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export { registerAdmin, loginAdmin, getCurrentAdmin };