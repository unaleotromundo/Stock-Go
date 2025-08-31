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

// Verificar que la API Key esté presente
if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERROR: La variable OPENAI_API_KEY no está definida en .env");
    process.exit(1); // Detiene el servidor
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generar respuesta de IA (aprox 30-40 palabras)
async function generarRespuesta(prompt, iaName) {
    try {
        const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200 // límite de palabras
        });
        let contenido = resp.choices[0].message.content.trim();
        return contenido;
    } catch (err) {
        console.error(`Error OpenAI ${iaName}:`, err);
        return `Error en la IA ${iaName}`;
    }
}

// Endpoint de conversación
app.post("/conversacion", async (req, res) => {
    const { text, turnos = 1, destinatario = "IA-1" } = req.body;

    let chat = [];
    let promptIA1 = "Eres IA-1, curiosa e investigadora de la verdad. Responde de manera corta y clara.";
    let promptIA2 = "Eres IA-2, curiosa e investigadora de la verdad. Responde de manera corta y clara.";

    let mensaje = text;

    try {
        for (let i = 0; i < turnos; i++) {
            const iaName = destinatario === "IA-1" ? "IA-1" : "IA-2";
            const prompt = destinatario === "IA-1" ? `${promptIA1}\n\n${mensaje}` : `${promptIA2}\n\n${mensaje}`;

            const respuesta = await generarRespuesta(prompt, iaName);
            chat.push({ ia: iaName, mensaje: respuesta });

            // Preparar siguiente turno
            mensaje = respuesta;
        }
        res.json({ chat });
    } catch (err) {
        console.error("Error endpoint /conversacion:", err);
        res.status(500).json({ chat: [], error: "Error en servidor" });
    }
});

app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
