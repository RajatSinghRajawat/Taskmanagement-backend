const mongoose = require('mongoose')




const studentsAuth = mongoose.Schema({

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
    courses: {
        type: String,
        enum: [
            "Software-Development",
            "Data-Science",
            "Cyber-Security",
            "Cloud-Computing",
            "Artificial-Intelligence",
            "Digital-Marketing",
            "UI-UX-Design",
            "Business-Analytics",
            "Project-Management",
            "DevOps"
        ],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})