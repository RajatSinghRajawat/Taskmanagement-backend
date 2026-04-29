const routes = require("express").Router();
const { createTAsk, getTasksByCourse } = require("../controllers/task-Teachers");
const authMiddleware = require("../middleware/authMiddleware");

routes.post("/create-task", createTAsk);
routes.get("/tasks-by-course", authMiddleware, getTasksByCourse);