import express from "express";
import {
  approveTask,
  createTask,
  deleteTask,
  getTasks,
  submitTaskProof,
  updateTaskStatus,
} from "../controllers/taskController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createTask);
router.get("/", protect, getTasks);
router.put("/:id", protect, authorize("admin"), updateTaskStatus);
router.put("/:id/submit", protect, authorize("employee"), submitTaskProof);
router.put("/:id/approve", protect, authorize("admin"), approveTask);
router.delete("/:id", protect, authorize("admin"), deleteTask);

export default router;
