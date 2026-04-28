app.get("/", (req, res) => {
  res.send("Gemini Backend is LIVE ✅");
});
app.use(express.json({ limit: "20mb" }));
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------- BASIC TEST ROUTE ----------
app.get("/", (req, res) => {
  res.send("✅ Gemini Backend Running");
});

// ---------- CHAT ----------
app.post("/chat", async (req, res) => {
  try {
    const { message, context } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "You are the Organic Agroflow Intelligence Node, helping farmers, wholesalers and retailers optimize organic supply chains.",
    });

    const result = await model.generateContent(
      `Context: ${JSON.stringify(context)}\nUser: ${message}`
    );

    res.json({ reply: result.response.text() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- DEMAND PREDICTION ----------
app.post("/demand", async (req, res) => {
  try {
    const { crops } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `Predict 30-day demand trend for these crops: ${JSON.stringify(crops)}. 
       Respond as JSON array with cropId, trend(up/down/stable), reasoning.`
    );

    const text = result.response.text().replace(/```json|```/g, "").trim();
    res.json(JSON.parse(text));
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});

// ---------- CROP RECOMMENDATION ----------
app.post("/recommend", async (req, res) => {
  try {
    const { weather, marketDemand } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `Suggest 2 crops based on weather ${JSON.stringify(
        weather
      )} and market demand ${JSON.stringify(
        marketDemand
      )}. Respond as JSON array with name, matchScore, reasoning.`
    );

    const text = result.response.text().replace(/```json|```/g, "").trim();
    res.json(JSON.parse(text));
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});

// ---------- AUDIO TRANSCRIPTION ----------
app.post("/transcribe", async (req, res) => {
  try {
    const { base64Audio, mimeType } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType,
        },
      },
      "Transcribe this audio accurately. Respond only with text.",
    ]);

    res.json({ text: result.response.text().trim() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ text: "" });
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Gemini backend running on port ${PORT}`);
});
