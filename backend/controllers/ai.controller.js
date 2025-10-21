import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { openai } from "../server.js";
import { Task } from "../models/Task.model.js";

// // ✅ Correct OpenAI initialization
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // env se lega
// });

const generateAIPlan = asyncHandler(async (req, res) => {
  const { goals, deadlines } = req.body;

  if (!goals || !deadlines) {
    return res
      .status(400)
      .json(new ApiResponse(null, 400, "Goals and deadlines are required"));
  }

  const prompt = `Generate a 7-day task schedule based on these goals and deadlines: ${JSON.stringify({
    goals,
    deadlines,
  })}. Prioritize urgent tasks first and format it neatly.`;

  // ✅ Correct method (SDK v4 syntax)
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a smart productivity assistant." },
      { role: "user", content: prompt },
    ],
  });

  const aiResponse = completion.choices[0].message.content;

  const plan = await Task.create({
    title: `AI Generated Plan: ${prompt.slice(0, 30)}...`,
    description: "Auto-generated plan using AI",
    user: req.user._id,
    generatedByAI: true,
    aiPlan: aiResponse, // 👈 new field for full text
    dueDate: new Date(),
  });
  // 4️⃣ Return saved tasks
  return res
    .status(200)
    .json(new ApiResponse(plan, 200, "AI Tasks Generated & Saved"));
});

export { generateAIPlan };
