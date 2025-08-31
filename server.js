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

// Comprobar que las API Keys existen
if (!process.env.OPENAI_API_KEY_1 || !process.env.OPENAI_API_KEY_2) {
    console.error("❌ ERROR: Faltan OPENAI_API_KEY_1 o OPENAI_API_KEY_2 en el .env");
    process.exit(1);
}

// Inicializar clientes OpenAI
const openai1 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_1 });
const openai2 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_2 });

// Generar respuesta de IA (~30-40 palabras)
async function generarRespuesta(openai, prompt, iaName) {
    try {
        const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200 // aprox 30-40 palabras
        });
        return resp.choices[0].message.content.trim();
    } catch (err) {
        console.error(`Error ${iaName}:`, err);
        return `Error en la IA ${iaName}`;
    }
}

// Endpoint de conversación
app.post("/conversacion", async (req, res) => {
    const { text, turnos = 1, destinatario = "IA-1" } = req.body;

    let chat = [];
    let mensaje = text;

    // Prompts por defecto
    let promptIA1 = "Eres IA-1, curiosa e investigadora de la verdad. Responde de manera corta y clara (30-40 palabras).";
    let promptIA2 = "Eres IA-2, curiosa e investigadora de la verdad. Responde de manera corta y clara (30-40 palabras).";

    try {
        for (let i = 0; i < turnos; i++) {
            const iaName = destinatario === "IA-1" ? "IA-1" : "IA-2";
            const openaiClient = destinatario === "IA-1" ? openai1 : openai2;
            const prompt = destinatario === "IA-1" ? `${promptIA1}\n\n${mensaje}` : `${promptIA2}\n\n${mensaje}`;

            const respuesta = await generarRespuesta(openaiClient, prompt, iaName);
            chat.push({ ia: iaName, mensaje: respuesta });

            mensaje = respuesta; // preparar siguiente turno
        }

        res.json({ chat });
    } catch (err) {
        console.error("Error en /conversacion:", err);
        res.status(500).json({ chat: [], error: "Error en servidor" });
    }
});

app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
