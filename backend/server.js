import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/task.js";
import aiRoutes from "./routes/ai.js";
import OpenAI from "openai";

dotenv.config()
console.log("🔑 OpenRouter Key (first 10 chars):", process.env.OPENROUTER_API_KEY?.slice(0, 10));

const apiKey = process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENROUTER_BASE_URL;

if (!apiKey || !baseURL) {
  console.error("❌ OpenAI API key missing. Check .env or dotenv path!");
}

export const openai = new OpenAI({
  apiKey, baseURL,
  defaultHeaders: {
    // "HTTP-Referer": "http://localhost:3001",  // ya tumhara frontend origin
    "HTTP-Referer": "https://ai-task-manager-beta.vercel.app",  // ya tumhara frontend origin
    "X-Title": "AI Task Manager Local",
  },
});


const app = express();

// after deployment cors issue solution
const allowedOrigins = [
  "https://ai-task-manager-beta.vercel.app",
  "http://localhost:3000"
];

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static("public"));

// routes
app.use("/api/auth", authRoutes)
app.use("/api/task", taskRoutes)
app.use("/api/ai", aiRoutes)

// DB Connection



mongoose.connect(process.env.MONGODBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // wait max 5s
  socketTimeoutMS: 45000, // keep alive 45s
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err.message));

app.get("/test-ai", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // 👈 note: 'openai/' prefix zaroori hai
      messages: [{ role: "user", content: "Say hello!" }],
    });
    res.send(completion.choices[0].message.content);
  } catch (err) {
    console.error("❌ AI error:", err);
    res.status(500).json({ error: err.message });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));