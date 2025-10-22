import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/task.js";
import aiRoutes from "./routes/ai.js";
import OpenAI from "openai";

dotenv.config()

// ✅ Read key manually & log for debugging
const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;

if (!apiKey || !baseURL) {
  console.error("❌ OpenAI API key missing. Check .env or dotenv path!");
}

export const openai = new OpenAI({ apiKey, baseURL });


const app = express();


const allowedOrigins = [
  "https://ai-task-manager-beta.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Preflight request handler (Express 5 fix)
app.options("/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static("public"));

// routes
app.use("/api/auth", authRoutes)
app.use("/api/task", taskRoutes)
app.use("/api/ai", aiRoutes)

// DB Connection

console.log("🔑 OpenAI key loaded:", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");


mongoose.connect(process.env.MONGODBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // wait max 5s
  socketTimeoutMS: 45000, // keep alive 45s
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));