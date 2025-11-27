// models/Task.js
import mongoose from "mongoose";

const PlanMetaSchema = new mongoose.Schema(
  {
    goal: String,
    startDate: String,      // ISO yyyy-mm-dd (string rakhen to aapke prompt ke saath fit)
    duration: { type: Number, min: 1 },
    timePerDay: { type: Number, min: 5 },
    skillLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
    constraints: String,
    taskType: String,
  },
  { _id: false }
);

const TaskSchema = new mongoose.Schema(
  {
    // ownership
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // manual + ai shared fields
    title: { type: String, required: true },
    description: { type: String, default: "" },
    dueAt: { type: Date },
    completed: { type: Boolean, default: false },

    // ai-friendly extras (manual me optional)
    day: { type: Number, min: 1 },
    effortMins: { type: Number, min: 5 },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },

    // source flags (tabs filtering)
    source: { type: String, enum: ["manual", "ai"], default: "manual", index: true },
    generatedByAI: { type: Boolean, default: false, index: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, index: true },
    // optional context of the plan
    planMeta: { type: PlanMetaSchema },
  },
  { timestamps: true }
);

TaskSchema.index({ user: 1, source: 1, createdAt: -1 });
TaskSchema.index({ user: 1, groupId: 1 });

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
export default Task;
