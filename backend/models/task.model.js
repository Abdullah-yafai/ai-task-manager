import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    completed: { type: Boolean, default: false },
      generatedByAI: { type: Boolean, default: false },
      aiPlan: { type: String, default: "" }, 
}, { timestamps: true })

export const Task = mongoose.model('Task', taskSchema)