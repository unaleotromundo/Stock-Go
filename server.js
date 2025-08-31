import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*", methods: ["GET","POST","OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());

const openai1 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_1 });
const openai2 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_2 });

let conversacionActiva = false;
let ultimaRespuesta = "Hola, ¿cómo estás?";
let turno = "IA-1";
let wsClients = [];

// Loop automático IA ↔ IA
async function loopConversacion() {
    if (!conversacionActiva) return;

    try {
        const client = turno === "IA-1" ? openai1 : openai2;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: ultimaRespuesta }],
            max_tokens: 250
        });

        const mensaje = response.choices[0].message.content;

        // Enviar a todos los clientes
        wsClients.forEach(ws => {
            if (ws.readyState === 1) ws.send(JSON.stringify({ ia: turno, mensaje }));
        });

        ultimaRespuesta = mensaje;
        turno = turno === "IA-1" ? "IA-2" : "IA-1";

        setTimeout(loopConversacion, 2000);

    } catch (err) {
        console.error("Error en loop:", err);
        conversacionActiva = false;
    }
}

// Endpoints REST
app.post("/iniciar", (req, res) => {
    if (!conversacionActiva) {
        conversacionActiva = true;
        ultimaRespuesta = req.body.mensaje || "Hola, ¿cómo estás?";
        turno = "IA-1";
        loopConversacion();
        res.json({ ok: true, mensaje: "Conversación iniciada ✅" });
    } else {
        res.json({ ok: false, mensaje: "Ya hay una conversación en curso" });
    }
});

app.post("/detener", (req, res) => {
    conversacionActiva = false;
    res.json({ ok: true, mensaje: "Conversación detenida ⏹️" });
});

// Health check
app.get("/", (req, res) => res.send("Servidor IA activo ✅"));

// Servidor + WebSocket
const server = app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("🔌 Cliente conectado");
    wsClients.push(ws);

    ws.on("close", () => {
        console.log("❌ Cliente desconectado");
        wsClients = wsClients.filter(c => c !== ws);
    });
});
