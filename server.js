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

// Dos instancias de OpenAI con diferentes claves
const openai1 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_1 });
const openai2 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_2 });

// Función para llamar a OpenAI
async function llamarOpenAI(openaiClient, prompt) {
    try {
        const resp = await openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        });
        return resp.choices[0].message.content || "Sin respuesta";
    } catch (err) {
        console.error("Error OpenAI:", err);
        return "Error OpenAI";
    }
}

// Endpoint para la conversación
app.post("/conversacion", async (req, res) => {
    const { text, turnos } = req.body;
    let chat = [];

    let mensaje1 = `Eres una IA curiosa e investigadora de la verdad. Analiza este texto y propón un análisis detallado:\n\n${text}`;

    for (let i = 0; i < turnos; i++) {
        const respuesta1 = await llamarOpenAI(openai1, mensaje1);
        chat.push({ ia: "IA-1", mensaje: respuesta1 });

        const prompt2 = `Eres una IA curiosa e investigadora de la verdad. Responde al mensaje de IA-1:\n\n${respuesta1}`;
        const respuesta2 = await llamarOpenAI(openai2, prompt2);
        chat.push({ ia: "IA-2", mensaje: respuesta2 });

        // Preparar siguiente turno
        mensaje1 = `Revisa lo que IA-2 dijo y profundiza aún más:\n${respuesta2}`;
    }

    res.json({ chat });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
