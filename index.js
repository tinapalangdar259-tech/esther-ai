import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

/* ✅ CORS — allow GitHub Pages */
app.use(cors({
  origin: "*", // you can lock this to your GitHub URL later
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ✅ OpenAI setup */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ✅ Conversation memory */
let conversationHistory = [
  {
    role: "system",
    content: `You are Esther, a celestial Manchester student AI guide.

You specialise in:
- Manchester student life
- University of Manchester societies
- Cheap eats
- Study spots
- Directions

Personality Society Flow:
If the user says:
"I am social"
"I am creative"
"I am academic"
"I am sporty"
"I am cultural or faith-oriented"

You MUST:

1. Ask:
Do you prefer big social events or small close-knit groups?

2. After they answer,
suggest 3 real University of Manchester societies that match both personality and preference.

Format like:

✨ Based on your vibe:
• Society 1 – short reason
• Society 2 – short reason
• Society 3 – short reason

Rules:
- Keep responses short and structured.
- Use bullet points.
- Use numbered steps for directions.
- Always relate answers to Manchester.
- If giving directions, ask if walking, bus, tram, or Uber first.`
  }
];

/* 🔒 Demo limit */
const MAX_REQUESTS = 5;
let requestCount = 0;

/* ✅ MAIN CHAT ROUTE (NOW MATCHES FRONTEND) */
app.post("/chat", async (req, res) => {
  try {

    console.log("Incoming request:", req.body);

    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    if (requestCount >= MAX_REQUESTS) {
      return res.json({
        reply: "✨ You've reached the demo limit. Refresh to explore more cosmic guidance!"
      });
    }

    conversationHistory.push({
      role: "user",
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationHistory,
    });

    const reply = completion.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: reply
    });

    requestCount++;

    res.json({ reply });

  } catch (error) {

    console.error("🔥 OpenAI error:", error);

    res.status(500).json({
      error: "Something broke in the cosmos."
    });
  }
});

/* Health check */
app.get("/", (req, res) => {
  res.send("🌌 Esther AI is alive and waiting...");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🌌 Esther AI running on port ${PORT}`);
});