import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id,
      status: "Assigned",
      paymentStatus: "Pending",
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? { createdBy: req.user.id }
        : { assignedTo: req.user.id };

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role walletAddress")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.status === "Approved") {
      return res
        .status(400)
        .json({ msg: "Approved tasks are locked and cannot be changed" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || undefined;
    if (dueDate !== undefined) task.dueDate = dueDate || undefined;

    if (status && status === "Assigned") {
      task.status = "Assigned";
      task.proofUrl = undefined;
      task.submittedAt = undefined;
      task.approvedAt = undefined;
      task.txHash = undefined;
      task.paymentStatus = "Pending";
    }

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const submitTaskProof = async (req, res) => {
  try {
    const { proofUrl } = req.body;

    if (!proofUrl) {
      return res.status(400).json({ msg: "proofUrl is required" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.status === "Approved") {
      return res.status(400).json({ msg: "Approved tasks are locked" });
    }

    task.status = "Submitted";
    task.proofUrl = proofUrl;
    task.submittedAt = new Date();
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const approveTask = async (req, res) => {
  try {
    const { txHash } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.status !== "Submitted") {
      return res
        .status(400)
        .json({ msg: "Only submitted tasks can be approved" });
    }

    task.status = "Approved";
    task.approvedAt = new Date();
    if (txHash) {
      task.txHash = txHash;
      task.paymentStatus = "Logged";
    } else {
      task.paymentStatus = "Pending";
    }

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    await task.deleteOne();

    res.json({ msg: "Task deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};
