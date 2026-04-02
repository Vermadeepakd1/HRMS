import Task from "../models/Task.js";

export const calculateProductivity = async (employeeId) => {
  const tasks = await Task.find({ assignedTo: employeeId });

  let completed = 0;
  let delayed = 0;
  let active = 0;

  tasks.forEach((task) => {
    if (task.status === "Completed") {
      completed += 1;

      if (task.dueDate && task.completedAt && task.completedAt > task.dueDate) {
        delayed += 1;
      }
    } else if (task.status === "In Progress") {
      active += 1;
    }
  });

  const score = completed * 10 - delayed * 5 + active * 2;

  return {
    completed,
    delayed,
    active,
    score,
  };
};
