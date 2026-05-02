const mongoose = require('mongoose');
const Task = require('../models/task-Teachers');
const Student = require('../models/student');
const StudentAuth = require('../models/studentsmodels');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');


// ==============================
//  CREATE TASK
// ==============================
const createTask = async (req, res) => {
    try {
        const {
            Title,
            Description,
            course,
            Task_Type,
            Priority,
            Assigned_To,
            Deadline,
            Assign_Date,
            Batch,
            Links,
            Late_Allowed,
            Marks_Feedback,
            questions
        } = req.body;

        if (!Title || !course || !Task_Type || !Deadline || !Batch) {
            console.log("Validation Failed - Missing fields:", { Title, course, Task_Type, Deadline, Batch });
            return res.status(400).json({ message: "Required fields missing: Check Title, Course, Batch, Type and Deadline" });
        }

        const attachments = req.files ? req.files.map(file => file.path) : [];

        const taskData = {
            Title,
            Description,
            course,
            Batch,
            Task_Type,
            Priority,
            Deadline,
            Assign_Date,
            Links,
            Late_Allowed,
            Marks_Feedback,
            Attachments: attachments,
            questions: questions ? (typeof questions === 'string' ? JSON.parse(questions) : questions) : []
        };

        if (Assigned_To && Assigned_To !== "" && Assigned_To !== "(Student Object ID - Optional)") {
            taskData.Assigned_To = Assigned_To;
        }

        const task = new Task({
            ...taskData,
            uploadedBy: req.user.id
        });
        await task.save();

        // 🔔 Create Notifications for Students
        try {
            const studentsToNotify = await StudentAuth.find({ 
                courses: course, 
                batch: Batch 
            });

            const notificationPromises = studentsToNotify.map(s => 
                Notification.create({
                    recipient: s._id,
                    title: "📚 New Task Assigned",
                    message: `A new ${Task_Type} has been posted for ${course}: "${Title}". Deadline: ${new Date(Deadline).toLocaleDateString()}`,
                    type: "Task_Assigned",
                    relatedId: task._id,
                    relatedModel: "Task"
                })
            );
            await Promise.all(notificationPromises);
            console.log(`Notifications sent to ${studentsToNotify.length} students for task: ${Title}`);
        } catch (noteError) {
            console.error("Failed to send task notifications:", noteError.message);
        }

        res.status(201).json({ message: "Task Created Successfully", task });

    } catch (error) {
        console.error("CREATE TASK ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};



// ==============================
//  GET ALL TASKS (Teacher)
// ==============================
const getTasks = async (req, res) => {
    try {
        let rawTasks;
        try {
            rawTasks = await Task.find()
                .sort({ createdAt: -1 })
                .populate("Assigned_To", "name email");
        } catch (popError) {
            console.warn("⚠️ Population failed, returning raw tasks:", popError.message);
            rawTasks = await Task.find().sort({ createdAt: -1 });
        }

        const tasks = rawTasks.map(task => {
            const t = task.toObject();
            if (t.Assigned_To) {
                t.Assigned_To = t.Assigned_To.map(s => ({
                    ...s,
                    fullName: s.name
                }));
            }
            return t;
        });

        res.status(200).json({
            total: tasks.length,
            tasks
        });

    } catch (error) {
        console.error("GET TASKS CRITICAL ERROR:", error);
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// ✅ GET TASK BY COURSE (Student)
// ==============================
const getTasksByCourse = async (req, res) => {
    try {
        const { course, batch } = req.query;
        
        const query = {};
        if (course) query.course = course;
        if (batch) query.Batch = batch; // Use capital 'B' as per Model

        if (!course && !batch) {
            return res.status(400).json({ message: "Course or Batch is required" });
        }

        const tasks = await Task.find(query).lean();
        
        // Add submission status for each task
        const tasksWithStatus = await Promise.all(tasks.map(async (task) => {
            const submission = await Submission.findOne({ taskId: task._id, studentId: req.user.id });
            return {
                ...task,
                status: submission ? "completed" : task.Status
            };
        }));

        res.status(200).json({ total: tasksWithStatus.length, tasks: tasksWithStatus });

    } catch (error) {
        console.error("GET TASKS BY COURSE/BATCH ERROR:", error);
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// ✅ GET SINGLE TASK DETAILS
// ==============================
const getSingleTask = async (req, res) => {
    try {
        const rawTask = await Task.findById(req.params.id).populate("Assigned_To", "name email");

        if (!rawTask) return res.status(404).json({ message: "❌ Task not found" });

        const task = rawTask.toObject();
        if (task.Assigned_To) {
            task.Assigned_To = task.Assigned_To.map(s => ({
                ...s,
                fullName: s.name
            }));
        }

        res.status(200).json(task);

    } catch (error) {
        console.error("GET SINGLE TASK ERROR:", error);
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// ✅ UPDATE TASK
// ==============================
const updateTask = async (req, res) => {
    try {
        const updateData = req.body;

        if (req.files && req.files.length > 0) {
            updateData.Attachments = req.files.map(file => file.path);
        }

        if (updateData.questions) {
            updateData.questions = typeof updateData.questions === 'string' ? JSON.parse(updateData.questions) : updateData.questions;
        }

        if (updateData.Assigned_To === "" || updateData.Assigned_To === "(Student Object ID - Optional)") {
            delete updateData.Assigned_To;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedTask) return res.status(404).json({ message: "❌ Task not found" });

        res.status(200).json({ message: "✅ Task Updated", task: updatedTask });

    } catch (error) {
        console.error("UPDATE TASK ERROR:", error);
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// ✅ DELETE TASK
// ==============================
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: "❌ Task not found" });

        res.status(200).json({ message: "🗑 Task Deleted Successfully" });

    } catch (error) {
        res.status(500).json({ message: "❌ Server Error" });
    }
};



// ==============================
// 📊 GET TASK SUBMISSION STATS (Teacher)
// ==============================
const getTaskSubmissionStats = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // 1. Get all students in the course/batch from StudentAuth
        const allStudents = await StudentAuth.find({ 
            courses: task.course, 
            batch: task.Batch 
        }).select("name email profileImage");

        // 2. Get all submissions for this task
        const submissions = await Submission.find({ taskId: task._id })
            .populate("studentId", "name email");

        // 3. Map status
        const submissionMap = new Map();
        submissions.forEach(s => {
            submissionMap.set(s.studentId?._id.toString(), s);
        });

        const stats = allStudents.map(s => {
            const sub = submissionMap.get(s._id.toString());
            return {
                student: { ...s._doc, fullName: s.name },
                status: sub ? "Submitted" : "Pending",
                submissionDate: sub ? sub.submissionDate : null,
                submissionId: sub ? sub._id : null,
                submissionData: sub || null
            };
        });

        res.status(200).json({
            taskTitle: task.Title,
            totalAssigned: allStudents.length,
            submittedCount: submissions.length,
            pendingCount: allStudents.length - submissions.length,
            stats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ==============================
// 🚀 EXPORT ALL
// ==============================
module.exports = {
    createTask,
    getTasks,
    getTasksByCourse,
    getSingleTask,
    getTaskSubmissionStats,
    updateTask,
    deleteTask
};