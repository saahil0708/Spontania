import mongoose, { model } from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../Config/Config.js";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    },
    added: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = crypto.createHash("sha256").update(this.password).digest("hex");
});

// Method to check password
adminSchema.methods.isPasswordCorrect = function (password) {
    const hash = crypto.createHash("sha256").update(password).digest("hex");
    return hash === this.password;
};

// Method to generate Access Token
adminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        config.ACCESS_TOKEN_SECRET,
        {
            expiresIn: config.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Method to generate Refresh Token
adminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        config.REFRESH_TOKEN_SECRET,
        {
            expiresIn: config.REFRESH_TOKEN_EXPIRY
        }
    );
};

export default model("Admin", adminSchema);