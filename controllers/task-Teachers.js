const mongoose = require('mongoose');
const Task = require('../models/task-Teachers');

// creat a Task

const createTAsk = async (req, res) => {
    try {
        const { Title, Description, course, Class_Section, Task_Type, Priority, Assigned_To, Assign_Date, Deadline, Attachments, Links, Late_Allowed, Status, Marks_Feedback } = req.body;

        if (!Title || !Description || !course || !Class_Section || !Task_Type || !Priority || !Assigned_To || !Assign_Date || !Deadline || !Attachments || !Links || !Late_Allowed || !Status || !Marks_Feedback) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const task = new Task({
            Title,
            Description,
            course,
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


const getTasksByCourse = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware

        // Step 1: Get logged-in student
        const student = await Student.findById(userId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Step 2: Get student's course
        const studentCourse = student.courses;

        // Step 3: Filter tasks based on course
        const tasks = await Task.find({
            course: studentCourse   // 👈 make sure course == student's course
        });

        res.status(200).json({
            message: "Tasks fetched successfully",
            course: studentCourse,
            total: tasks.length,
            tasks
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};



