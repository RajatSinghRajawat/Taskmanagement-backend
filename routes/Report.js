const express = require("express");
const router = express.Router();

const {
    createReport,
    updateReport,
    deleteReport,
    getReports,
    getSingleReport,
    getMyReports
} = require("../controllers/Report");

const authMiddleware = require("../middleware/authMiddleware");

// STUDENT ACCESS
router.get("/my-reports", authMiddleware, (req, res, next) => {
    console.log("HIT: /api/reports/my-reports");
    next();
}, getMyReports);

// CREATE
router.post("/", authMiddleware, createReport);

// GET ALL
router.get("/", authMiddleware, getReports);

// GET SINGLE
router.get("/:id", authMiddleware, getSingleReport);

// UPDATE
router.put("/:id", authMiddleware, updateReport);

// DELETE
router.delete("/:id", authMiddleware, deleteReport);

module.exports = router;