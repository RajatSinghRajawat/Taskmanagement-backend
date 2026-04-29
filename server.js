const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

// Connect to Database
const connectDB = require("./config/db");
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Server Start
const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});