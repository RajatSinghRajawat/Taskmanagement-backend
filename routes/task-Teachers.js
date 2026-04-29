const routes = require("express").Router();
const { createTAsk, getTasksByCourse, getSingleTask ,updateTask  ,deleteTask } = require("../controllers/task-Teachers");
const authMiddleware = require("../middleware/authMiddleware");

routes.post("/create-task", createTAsk);
routes.get("/tasks-by-course", authMiddleware, getTasksByCourse);
routes.get("/task/:id", authMiddleware, getSingleTask);
routes.put("/task/:id", updateTask);
routes.delete("/task/:id", deleteTask);

module.exports = routes;