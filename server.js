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

// Configurar APIs
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Función para llamar a Gemini
async function llamarGemini(prompt) {
    try {
        const res = await fetch("https://api.gemini.com/v1/llm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GEMINI_API_KEY}`,
            },
            body: JSON.stringify({
                prompt,
                model: "gemini-1.5"
            }),
        });
        const data = await res.json();
        return data.text || data.output_text || data.response || "Sin respuesta de Gemini";
    } catch (err) {
        console.error("Error Gemini:", err);
        return "Error Gemini";
    }
}

// Función para llamar a OpenAI
async function llamarOpenAI(prompt) {
    try {
        const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        });
        return resp.choices[0].message.content || "Sin respuesta de OpenAI";
    } catch (err) {
        console.error("Error OpenAI:", err);
        return "Error OpenAI";
    }
}

// Endpoint para iniciar la conversación
app.post("/conversacion", async (req, res) => {
    const { text, turnos } = req.body;
    let chat = [];
    let mensajeGemini = `Eres una IA curiosa e investigadora de la verdad. Analiza este texto y propón un análisis detallado a OpenAI:\n\n${text}`;
    
    for (let i = 0; i < turnos; i++) {
        const respuestaGemini = await llamarGemini(mensajeGemini);
        chat.push({ ia: "Gemini", mensaje: respuestaGemini });

        const promptOpenAI = `Eres una IA curiosa e investigadora de la verdad. Responde al mensaje de Gemini:\n\n${respuestaGemini}`;
        const respuestaOpenAI = await llamarOpenAI(promptOpenAI);
        chat.push({ ia: "OpenAI", mensaje: respuestaOpenAI });

        // Preparar siguiente turno para Gemini
        mensajeGemini = `Revisa lo que OpenAI dijo y profundiza aún más:\n${respuestaOpenAI}`;
    }

    res.json({ chat });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
