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

// Configuración OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Función para generar respuesta de IA con límite de 30-40 palabras
async function generarRespuesta(prompt, iaName) {
    try {
        const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200 // aprox 30-40 palabras
        });
        let contenido = resp.choices[0].message.content.trim();
        return contenido;
    } catch (err) {
        console.error(`Error OpenAI ${iaName}:`, err);
        return `Error en la IA ${iaName}`;
    }
}

// Endpoint para conversación
app.post("/conversacion", async (req, res) => {
    const { text, turnos = 1, short = false, destinatario } = req.body;

    let chat = [];
    let promptIA1 = "Eres IA-1, curiosa e investigadora de la verdad. Responde de manera corta y clara.";
    let promptIA2 = "Eres IA-2, curiosa e investigadora de la verdad. Responde de manera corta y clara.";

    let mensaje = text;

    try {
        for (let i = 0; i < turnos; i++) {
            let iaName = destinatario === "IA-1" ? "IA-1" : "IA-2";
            let prompt = destinatario === "IA-1" ? `${promptIA1}\n\n${mensaje}` : `${promptIA2}\n\n${mensaje}`;

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

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
