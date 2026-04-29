const mongoose = require('mongoose');
const Task = require('../models/task-Teachers');

// creat a Task

const createTAsk = async (req, res) => {
    try {
        const { Title, Description, Subject, Class_Section, Task_Type, Priority, Assigned_To, Assign_Date, Deadline, Attachments, Links, Late_Allowed, Status, Marks_Feedback } = req.body;

        if (!Title || !Description || !Subject || !Class_Section || !Task_Type || !Priority || !Assigned_To || !Assign_Date || !Deadline || !Attachments || !Links || !Late_Allowed || !Status || !Marks_Feedback) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const task = new Task({
            Title,
            Description,
            Subject,
            Class_Section,
            Task_Type,
            Priority,
            Assigned_To,
            Assign_Date,
            Deadline,
            Attachments,
            Links,
            Late_Allowed,
            Status,
            Marks_Feedback
        });

        await task.save();

        res.status(201).json(task);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}



