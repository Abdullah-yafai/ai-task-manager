import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Task } from "../models/task.model.js";


const createTask = asyncHandler(async (req, res) => {
    const task = new Task({ ...req.body, user: req.user._id })
    await task.save();
    return res.status(200).json(new ApiResponse(task, 200, 'Your Task Created SuccessFully'))
})

const getAllTask = asyncHandler(async (req, res) => {
    const task = await Task.find({ user: req.user._id, }).sort({ dueDate: 1 }).lean()
    console.log(task);
    return res.status(200).json(new ApiResponse(task, 200, 'Your All Task'))
})
const udpateTask = asyncHandler(async (req, res) => {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true }).lean();
    if (!task) throw new ApiError(404, "Task not found");
    return res.status(200).json(new ApiResponse(task, 200, 'Your Task Updated'))
})
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!task) {
        throw new ApiError(404, "Task not found or already deleted");
    }
    return res.status(200).json(new ApiResponse(null, 200, 'Your Task deleted'))
})

export { createTask, getAllTask, udpateTask, deleteTask }