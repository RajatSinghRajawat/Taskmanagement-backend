const mongoose = require("mongoose");
const Task = require("../models/task-Teachers");
const Student = require("../models/studentsmodels"); // Pointing to StudentAuth model

// ==============================
// ✅ CREATE STUDENT (Now mostly redundant as students signup themselves)
// ==============================
const createStudent = async (req, res) => {
  try {
    const {
      fullName, // mapped to name
      email,
      password,
      course, // mapped to courses
      batch,
      status
    } = req.body;

    if (!fullName || !email || !password || !course || !batch) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const student = new Student({
      name: fullName,
      email,
      password, // Note: Should be hashed if created manually, but we prefer signup
      courses: course,
      batch,
      status: status || "Active"
    });

    await student.save();

    res.status(201).json({
      message: "Student enrolled successfully",
      student: { ...student._doc, fullName: student.name, course: student.courses }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ✅ GET ALL STUDENTS (FILTER)
// ==============================
const getAllStudents = async (req, res) => {
  try {
    const { course, status, search } = req.query;

    let filter = {};

    if (course && course !== 'All') filter.courses = course;
    if (status && status !== 'All') filter.status = status;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const rawStudents = await Student.find(filter).sort({ createdAt: -1 });

    // Map fields for frontend compatibility
    const students = rawStudents.map(s => ({
      ...s._doc,
      fullName: s.name,
      course: s.courses
    }));

    res.status(200).json({
      total: students.length,
      students
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ✅ GET STUDENT BY ID
// ==============================
const getStudentById = async (req, res) => {
  try {
    const rawStudent = await Student.findById(req.params.id);

    if (!rawStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = {
      ...rawStudent._doc,
      fullName: rawStudent.name,
      course: rawStudent.courses
    };

    const tasks = await Task.find({ 
      $or: [
        { Assigned_To: student._id },
        { course: student.course, Batch: student.batch }
      ]
    });
    
    res.status(200).json({ ...student, tasks });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ✅ UPDATE STUDENT
// ==============================
const updateStudent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.fullName) updateData.name = updateData.fullName;
    if (updateData.course) updateData.courses = updateData.course;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated",
      student: { ...student._doc, fullName: student.name, course: student.courses }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ✅ DELETE STUDENT
// ==============================
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// 🎯 GET STUDENT PROFILE (For Student Portal)
// ==============================
const getStudentProfile = async (req, res) => {
  try {
    const studentEmail = req.user.email;
    const rawStudent = await Student.findOne({ email: studentEmail });

    if (!rawStudent) {
      return res.status(200).json({ 
        success: false, 
        message: "Account found but profile details are missing.",
        noProfile: true
      });
    }

    const student = {
      ...rawStudent._doc,
      fullName: rawStudent.name,
      course: rawStudent.courses
    };

    const tasks = await Task.find({ 
      $or: [
        { Assigned_To: student._id },
        { course: student.course, Batch: student.batch }
      ]
    });
    
    res.status(200).json({
      success: true,
      student,
      tasks
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==============================
// 🚀 EXPORT
// ==============================
module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentProfile,
  updateStudent,
  deleteStudent
};