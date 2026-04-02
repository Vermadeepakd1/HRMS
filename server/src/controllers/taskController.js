import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status, txHash } =
      req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.status === "Completed" && status && status !== "Completed") {
      return res
        .status(400)
        .json({ msg: "Completed tasks are locked and cannot be changed" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || undefined;
    if (dueDate !== undefined) task.dueDate = dueDate || undefined;

    if (status) {
      const previousStatus = task.status;
      task.status = status;

      if (status === "Completed") {
        if (previousStatus !== "Completed") {
          task.completedAt = new Date();
        }

        if (txHash) {
          task.txHash = txHash;
        }
      }
    }

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    await task.deleteOne();

    res.json({ msg: "Task deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
