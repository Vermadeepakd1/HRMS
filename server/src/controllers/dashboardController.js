import Task from "../models/Task.js";
import User from "../models/User.js";
import { calculateProductivity } from "../services/aiService.js";

export const getDashboard = async (req, res) => {
  try {
    if (req.user.role === "employee") {
      const myTasks = await Task.find({ assignedTo: req.user.id });

      const assignedTasks = myTasks.filter(
        (task) => task.status === "Assigned",
      ).length;
      const submittedTasks = myTasks.filter(
        (task) => task.status === "Submitted",
      ).length;
      const approvedTasks = myTasks.filter(
        (task) => task.status === "Approved",
      ).length;

      return res.json({
        role: "employee",
        myTasks: myTasks.length,
        assignedTasks,
        submittedTasks,
        approvedTasks,
      });
    }

    const employees = await User.find({ role: "employee" }, { password: 0 });
    const employeeIds = employees.map((employee) => employee._id);

    const tasks = await Task.find({
      createdBy: req.user.id,
      assignedTo: { $in: employeeIds },
    }).populate("assignedTo", "name email role");

    const totalEmployees = employees.length;
    const totalTasks = tasks.length;
    const assignedTasks = tasks.filter(
      (task) => task.status === "Assigned",
    ).length;
    const submittedTasks = tasks.filter(
      (task) => task.status === "Submitted",
    ).length;
    const approvedTasks = tasks.filter(
      (task) => task.status === "Approved",
    ).length;

    const productivity = [];

    for (const employee of employees) {
      const stats = await calculateProductivity(employee._id);

      productivity.push({
        employeeId: employee._id,
        name: employee.name,
        ...stats,
      });
    }

    return res.json({
      role: "admin",
      totalEmployees,
      totalTasks,
      assignedTasks,
      submittedTasks,
      approvedTasks,
      productivity,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
