import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

General Rules:
- Keep responses short and structured.
- No long paragraphs.
- Use bullet points when suggesting things.
- Use numbered steps for directions.
- Always relate answers to Manchester.
- If giving directions, first ask if they are walking, taking bus, tram, or Uber.`
  }
];

// 🔒 DEMO LIMIT SETTINGS
const MAX_REQUESTS = 5;
let requestCount = 0;

app.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    // 🛑 Stop if demo limit reached
    if (requestCount >= MAX_REQUESTS) {
      return res.json({
        reply:
          "✨ You've reached the demo limit. Refresh to explore more cosmic guidance!"
      });
    }

    conversationHistory.push({
      role: "user",
      content: message,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationHistory,
    });

    const reply = completion.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: reply,
    });

    requestCount++; // increment after successful response

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something broke in the cosmos." });
  }
});

app.get("/", (req, res) => {
  res.send("🌌 Esther AI is alive and waiting...");
});

app.listen(3000, () => {
  console.log("🌌 Esther AI running on http://localhost:3000");
});