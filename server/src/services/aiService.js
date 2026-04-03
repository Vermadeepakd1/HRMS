import Task from "../models/Task.js";

export const calculateProductivity = async (employeeId) => {
  const tasks = await Task.find({ assignedTo: employeeId });

  let approved = 0;
  let delayed = 0;
  let submitted = 0;

  tasks.forEach((task) => {
    if (task.status === "Approved") {
      approved += 1;

      if (task.dueDate && task.approvedAt && task.approvedAt > task.dueDate) {
        delayed += 1;
      }
    } else if (task.status === "Submitted") {
      submitted += 1;
    }
  });

  const score = approved * 10 - delayed * 5 + submitted * 2;

  return {
    approved,
    delayed,
    submitted,
    score,
  };
};
