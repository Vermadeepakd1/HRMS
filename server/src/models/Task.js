import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Assigned", "Submitted", "Approved"],
      default: "Assigned",
    },
    dueDate: Date,
    proofUrl: String,
    submittedAt: Date,
    approvedAt: Date,
    paymentStatus: { type: String, default: "Pending" },
    txHash: String,
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
