import Employee from "../models/Employee.js";
import Task from "../models/Task.js";
import { calculateProductivity } from "../services/aiService.js";

export const getDashboard = async (req, res) => {
  try {
    const employees = await Employee.find({
      createdBy: req.user.id,
    });

    const totalEmployees = employees.length;

    const employeeIds = employees.map((employee) => employee._id);
    const tasks = await Task.find({
      assignedTo: { $in: employeeIds },
    }).populate("assignedTo");

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "Completed",
    ).length;

    const activeEmployees = new Set(
      tasks
        .filter((task) => task.status === "In Progress")
        .map(
          (task) =>
            task.assignedTo?._id?.toString() || task.assignedTo?.toString(),
        ),
    ).size;

    const productivity = [];

    for (const employee of employees) {
      const stats = await calculateProductivity(employee._id);

      productivity.push({
        employeeId: employee._id,
        name: employee.name,
        ...stats,
      });
    }

    res.json({
      totalEmployees,
      activeEmployees,
      totalTasks,
      completedTasks,
      productivity,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
