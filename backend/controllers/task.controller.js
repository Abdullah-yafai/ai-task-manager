import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Task from "../models/task.model.js"; // DEFAULT import (model exports default)

// ---------- Helpers ----------
const parseDueAt = (value) => {
    if (!value) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
};

const whitelistPatch = (body = {}) => {
    // Sirf allowed fields update hon:
    // NOTE: source, generatedByAI, user, planMeta ko update karne ki permission NA do.
    const allowed = ["title", "description", "dueAt", "completed", "priority", "effortMins", "day"];
    const patch = {};
    for (const k of allowed) {
        if (body[k] !== undefined) patch[k] = body[k];
    }
    if ("dueAt" in patch) patch.dueAt = parseDueAt(patch.dueAt);
    if ("title" in patch && typeof patch.title === "string") patch.title = patch.title.trim();
    if ("description" in patch && typeof patch.description === "string") patch.description = patch.description.trim();
    return patch;
};

// ---------- Create (Manual) ----------
export const createTask = asyncHandler(async (req, res) => {
    const { title, description = "", dueAt, priority } = req.body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json(new ApiResponse(null, 400, "Title is required."));
    }

    const doc = await Task.create({
        user: req.user._id,
        title: title.trim(),
        description: description?.trim?.() || "",
        dueAt: parseDueAt(dueAt),
        completed: false,
        priority,
        // Manual flags
        source: "manual",
        generatedByAI: false,
        // planMeta optional for manual; usually omit
    });

    return res.status(200).json(new ApiResponse(doc, 200, "Your task was created successfully"));
});

// ---------- Get All (flat or grouped) ----------
export const getAllTask = asyncHandler(async (req, res) => {
    const { grouped } = req.query;

    if (grouped === "1" || grouped === "true") {
        // Manual tasks (unchanged)
        const manual = await Task.find({
            user: req.user._id,
            source: "manual",
        }).sort({ createdAt: -1 });

        // AI tasks grouped by groupId → { groupId, meta, tasks[] }
        const ai = await Task.aggregate([
            {
                $match: {
                    user: req.user._id,
                    source: "ai",
                    groupId: { $ne: null }, // ensure grouped
                },
            },
            // sort first so pushed tasks are in day order
            { $sort: { groupId: 1, day: 1, createdAt: 1 } },
            {
                $group: {
                    _id: "$groupId",
                    meta: { $first: "$planMeta" },
                    tasks: {
                        $push: {
                            _id: "$_id",
                            title: "$title",
                            description: "$description",
                            day: "$day",
                            effortMins: "$effortMins",
                            priority: "$priority",
                            dueAt: "$dueAt",
                            completed: "$completed",
                            createdAt: "$createdAt",
                            updatedAt: "$updatedAt",
                        },
                    },
                },
            },
            // final shape
            {
                $project: {
                    _id: 0,
                    groupId: "$_id",
                    meta: 1,
                    tasks: 1,
                },
            },
            // optional: newest groups first (by first task createdAt desc)
            { $sort: { "tasks.0.createdAt": -1 } },
        ]);

        return res
            .status(200)
            .json(new ApiResponse({ manual, ai }, 200, "Your All Task"));
    }

    // Flat (legacy)
    const data = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(data, 200, "Your All Task"));
});


// ---------- Update ----------
export const updateTask = asyncHandler(async (req, res) => {
    const patch = whitelistPatch(req.body);
    if (Object.keys(patch).length === 0) {
        return res.status(400).json(new ApiResponse(null, 400, "Nothing to update"));
    }

    const updated = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        patch,
        { new: true }
    ).lean();

    if (!updated) throw new ApiError(404, "Task not found");
    return res.status(200).json(new ApiResponse(updated, 200, "Your Task Updated"));
});

// ---------- Delete ----------
export const deleteTask = asyncHandler(async (req, res) => {
    const ok = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!ok) throw new ApiError(404, "Task not found or already deleted");
    return res.status(200).json(new ApiResponse(null, 200, "Your Task deleted"));
});

// ---------- (Optional) Toggle complete ----------
export const toggleComplete = asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) throw new ApiError(404, "Task not found");
    task.completed = !task.completed;
    await task.save();
    return res.status(200).json(new ApiResponse(task, 200, "Toggled"));
});
