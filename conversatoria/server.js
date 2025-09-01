// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡Servidor funcionando en Vercel!");
=======
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
>>>>>>> parent of 82ed050 (ghj)
});

// Ruta para usar OpenAI
app.post("/api/gpt", async (req, res) => {
  try {
    const { Configuration, OpenAIApi } = await import("openai");

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const { prompt } = req.body;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ result: completion.data.choices[0].message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Para Vercel, exportamos la app
export default app;
