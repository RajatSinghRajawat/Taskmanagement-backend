// controllers/authController.js

const Student = require("../models/studentsAuth");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = generateToken;

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, courses } = req.body;

        if (!name || !email || !password || !courses) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await Student.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Student.create({
            name,
            email,
            password: hashedPassword,
            courses
        });

        const token = generateToken(user);

        res.status(201).json({
            message: "User registered",
            token,
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};


// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Student.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: "Login successful",
            token,
            user
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


// GET PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await Student.findById(req.user.id).select("-password");

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    register,
    login,
    getProfile
};