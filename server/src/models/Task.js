import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    status: {
      type: String,
      enum: ["Assigned", "In Progress", "Completed"],
      default: "Assigned",
    },
    dueDate: Date,
    completedAt: Date,
    txHash: String,
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
