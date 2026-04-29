const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
        required: true,
    },
    Subject: {
        type: String,
        required: true,
    },
    Class_Section: {
        type: String,
        required: true,
    },
    Task_Type: {
        type: String,
        required: true,
    },
    Priority: {
        type: String,
        required: true,
    },
    Assigned_To: {
        type: String,
        required: true,
    },
    Assign_Date: {
        type: String,
        required: true,
    },
    Deadline: {
        type: String,
        required: true,
    },
    Attachments: {
        type: String,
        required: true,
    },
    Links: {
        type: String,
        required: true,
    },
    Late_Allowed: {
        type: String,
        required: true,
    },
    Status: {
        type: String,
        required: true,
    },
    Marks_Feedback: {
        type: String,
        required: true,
    },



});

module.exports = mongoose.model("Task", TaskSchema);