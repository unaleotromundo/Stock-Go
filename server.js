import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para tu frontend en GitHub Pages
app.use(cors({
    origin: "https://unaleotromundo.github.io",
    methods: ["GET","POST","OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// Inicializar clientes OpenAI con tus dos claves
const openai1 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_1 });
const openai2 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_2 });

// Endpoint para manejar la conversación
app.post("/conversacion", async (req, res) => {
    try {
        const { text, destinatario } = req.body;

        const client = destinatario === "IA-1" ? openai1 : openai2;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: text }],
            max_tokens: 250
        });

        const mensaje = response.choices[0].message.content;
        res.json({ chat: [{ ia: destinatario, mensaje }] });
    } catch (err) {
        console.error("Error en conversación:", err);
        res.status(500).json({ chat: [{ ia: "Error", mensaje: "Error en la IA" }] });
    }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
