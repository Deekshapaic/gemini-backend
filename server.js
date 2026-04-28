import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ FIX ROOT (this removes your error)
app.get("/", (req, res) => {
  res.send("Gemini Backend is LIVE ✅");
});

// common function
async function runPrompt(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ✅ CHAT
app.post("/chat", async (req, res) => {
  try {
    const { message, context } = req.body;
    const reply = await runPrompt(
      `Context: ${JSON.stringify(context)}\nUser: ${message}`
    );
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ DEMAND
app.post("/demand", async (req, res) => {
  try {
    const text = await runPrompt(
      `Return demand prediction JSON for crops: ${JSON.stringify(req.body.crops)}`
    );
    res.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch {
    res.json([]);
  }
});

// ✅ RECOMMEND
app.post("/recommend", async (req, res) => {
  try {
    const text = await runPrompt(
      `Suggest crops JSON using weather ${JSON.stringify(
        req.body.weather
      )} and demand ${JSON.stringify(req.body.marketDemand)}`
    );
    res.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch {
    res.json([]);
  }
});

// ✅ TRANSCRIBE
app.post("/transcribe", async (req, res) => {
  try {
    const { base64Audio, mimeType } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      { text: "Transcribe this audio" },
      {
        inlineData: {
          data: base64Audio,
          mimeType,
        },
      },
    ]);

    res.json({ text: result.response.text() });
  } catch {
    res.json({ text: "" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running 🚀"));
