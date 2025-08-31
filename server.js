import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configuración de APIs
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Endpoint para recibir texto y devolver comentarios
app.post("/comentarios", async (req, res) => {
  const { text } = req.body;

  try {
    // OpenAI
    const openaiResp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `Comenta este texto:\n\n${text}` }]
    });
    const openaiComment = openaiResp.choices[0].message.content;

    // Gemini
    const geminiResp = await fetch("https://api.gemini.com/v1/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `Comenta este texto:\n\n${text}`,
        model: "gemini-1.5",
      }),
    });
    const geminiData = await geminiResp.json();
    const geminiComment = geminiData.text || "Sin respuesta de Gemini";

    res.json({ openaiComment, geminiComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar comentarios" });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
