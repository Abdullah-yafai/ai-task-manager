
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Task from "../models/task.model.js";
import { openai } from "../server.js";
import mongoose from "mongoose";

// const openai = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY });

export const generateAIPlan = asyncHandler(async (req, res) => {
  const {
    goal,
    startDate,
    duration,
    timePerDay = 60,
    skillLevel = "Beginner",
    constraints = "",
    taskType = "",

  } = req.body || {};

  if (!goal || !startDate || !duration) {
    return res
      .status(400)
      .json(new ApiResponse(null, 400, "Goals, duration and startDate are required"));
  }

  // --- Prompt (forces JSON)
  const SYSTEM_MESSAGE = `
You are a planning assistant.
Always return ONLY valid JSON that matches the provided format.
No prose, no markdown, no explanations — JSON only.
Distribute tasks realistically over the given duration, respect time-per-day, skill level, and constraints.
`.trim();

  const USER_PROMPT = `
Create a day-by-day plan.

INPUTS:
- Goal: ${goal}
- Start Date (ISO): ${startDate}
- Duration (days): ${duration}
- Time per day (minutes): ${timePerDay}
- Skill Level: ${skillLevel}
- Constraints/Notes: ${constraints}
- Preferred Task Type: ${taskType}

OUTPUT FORMAT (strict JSON):
{
  "goal": "string",
  "startDate": "YYYY-MM-DD",
  "duration": number,
  "timePerDay": number,
  "skillLevel": "Beginner" | "Intermediate" | "Advanced",
  "constraints": "string",
  "taskType": "string",
  "tasks": [
    {
      "day": number,           // 1..duration
      "title": "string",
      "description": "string",
      "effortMins": number,    // <= timePerDay
      "priority": "low" | "medium" | "high"
    }
  ]
}

Rules:
- Return ONLY the JSON object above.
- Each day's total effortMins must be <= timePerDay.
- Keep titles concise and descriptions actionable.
- Avoid generic advice; be specific to the goal and skill level.
`.trim();

  // --- Call OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_MESSAGE },
      { role: "user", content: USER_PROMPT },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = completion?.choices?.[0]?.message?.content || "{}";

  // --- Parse JSON safely
  let planJson;
  try {
    planJson = JSON.parse(content);
  } catch {
    const fixed = content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1);
    planJson = JSON.parse(fixed);
  }

  // --- Minimal normalization
  if (!Array.isArray(planJson?.tasks)) planJson.tasks = [];

  planJson.goal = planJson.goal || goal;
  planJson.startDate = planJson.startDate || startDate;
  planJson.duration = Number(planJson.duration || duration);
  planJson.timePerDay = Number(planJson.timePerDay || timePerDay);
  planJson.skillLevel = planJson.skillLevel || skillLevel;
  planJson.constraints = planJson.constraints ?? constraints;
  planJson.taskType = planJson.taskType ?? taskType;


  // Normalize tasks
  const normalizedTasks = planJson.tasks
    .filter(t => t && typeof t === "object")
    .map(t => ({
      day: Number(t.day ?? 1),
      title: String(t.title ?? "Task"),
      description: String(t.description ?? ""),
     effortMins: Math.max(5, Number(t.effortMins ?? planJson.timePerDay ?? 60)),
      priority: ["low", "medium", "high"].includes(String(t.priority).toLowerCase())
        ? String(t.priority).toLowerCase()
        : "medium",
    }));

  // --- Build planMeta once
  const planMeta = {
    goal: planJson.goal,
    startDate: planJson.startDate,
    duration: planJson.duration,
    timePerDay: planJson.timePerDay,
    skillLevel: planJson.skillLevel,
    constraints: planJson.constraints,
    taskType: planJson.taskType,
  };

  // --- Optional dueAt calculation (based on startDate + day-1)
  const start = new Date(planJson.startDate);
  const hasValidStart = !isNaN(start.getTime());

  const groupId = new mongoose.Types.ObjectId();

  const docs = normalizedTasks.map(t => ({
    user: req.user._id,

    title: t.title,
    description: t.description,
    dueAt: hasValidStart
      ? new Date(start.getTime() + (Math.max(1, t.day) - 1) * 86400000)
      : undefined,

    day: t.day,
    effortMins: t.effortMins,
    priority: t.priority,

    source: "ai",
    generatedByAI: true,
    groupId,
    planMeta,
  }));

  // --- Persist each AI task as a Task document (flat)
  const saved = await Task.insertMany(docs);

  return res
    .status(200)
    .json(new ApiResponse({
      groupId,                      // <-- return this so UI can tag the group
      meta: planMeta,               // header info for preview
      tasks: saved,
    }, 200, "AI Tasks Generated & Saved"));
});
