import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// root check
app.get("/", (req, res) => {
  res.send("Gemini Backend is LIVE ✅");
});

// ---------- UNIVERSAL HANDLER ----------
async function runPrompt(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ---------- CHAT ----------
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

// ---------- DEMAND ----------
app.post("/demand", async (req, res) => {
  try {
    const { crops } = req.body;

    const text = await runPrompt(
      `Predict demand trends as JSON for: ${JSON.stringify(crops)}`
    );

    res.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch (e) {
    res.json([]); // fallback so frontend never crashes
  }
});

// ---------- RECOMMEND ----------
app.post("/recommend", async (req, res) => {
  try {
    const { weather, marketDemand } = req.body;

    const text = await runPrompt(
      `Suggest crops in JSON based on weather ${JSON.stringify(
        weather
      )} and demand ${JSON.stringify(marketDemand)}`
    );

    res.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch (e) {
    res.json([]);
  }
});

// ---------- TRANSCRIBE ----------
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
  } catch (e) {
    res.json({ text: "" });
  }
});

// ---------- START ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running 🚀"));
