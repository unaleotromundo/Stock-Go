import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Verificar clave OpenAI
console.log("Clave OpenAI cargada:", process.env.OPENAI_API_KEY ? "Sí" : "No");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Función simulada de Gemini
async function llamarGemini(prompt) {
    console.log("Prompt Gemini recibido:", prompt.slice(0, 100), "...");
    // Simula análisis inicial
    return "Simulación Gemini: he analizado el texto y propongo un primer comentario detallado.";
}

// Función real OpenAI
async function llamarOpenAI(prompt) {
    try {
        const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        });
        console.log("Respuesta OpenAI:", resp.choices[0].message.content);
        return resp.choices[0].message.content || "Sin respuesta de OpenAI";
    } catch (err) {
        console.error("Error OpenAI:", err);
        return "Error OpenAI";
    }
}

// Endpoint de conversación
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
