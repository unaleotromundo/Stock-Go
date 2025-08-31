import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Función para pedir API Key si no existe
async function obtenerAPIKey() {
    if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question("Ingrese su OPENAI_API_KEY: ", (key) => {
            rl.close();
            resolve(key.trim());
        });
    });
}

// Inicializar OpenAI con la API Key
let openai;
(async () => {
    const apiKey = await obtenerAPIKey();
    if (!apiKey) {
        console.error("❌ ERROR: No se proporcionó API Key. El servidor se detiene.");
        process.exit(1);
    }
    openai = new OpenAI({ apiKey });
})();

// Generar respuesta de IA (30-40 palabras aprox)
async function generarRespuesta(prompt, iaName) {
    try {
        const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200
        });
        return resp.choices[0].message.content.trim();
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

            mensaje = respuesta; // Preparar siguiente turno
        }
        res.json({ chat });
    } catch (err) {
        console.error("Error endpoint /conversacion:", err);
        res.status(500).json({ chat: [], error: "Error en servidor" });
    }
});

app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
