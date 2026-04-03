import express from "express";
import {
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "../controllers/employeeController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getEmployees);
router.put("/:id", protect, authorize("admin"), updateEmployee);
router.delete("/:id", protect, authorize("admin"), deleteEmployee);

export default router;
