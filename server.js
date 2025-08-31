import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Aumentar límite de payload
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const openai1 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_1 });
const openai2 = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_2 });

// Función para llamar a OpenAI con opción de respuesta corta
async function llamarOpenAI(openaiClient, prompt, short=false) {
    try {
        // Si short=true, agregamos instrucción de longitud
        const promptFinal = short 
            ? `${prompt}\nPor favor, responde en un máximo de 30 a 40 palabras.` 
            : prompt;

        const resp = await openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: promptFinal }]
        });

        return resp.choices[0].message.content || "Sin respuesta";
    } catch (err) {
        console.error("Error OpenAI:", err);
        return "Error OpenAI";
    }
}

app.post("/conversacion", async (req, res) => {
    let { text, turnos, short=false, destinatario="IA-1" } = req.body;

    // Recortar texto largo
    if(text.length > 3000) text = text.slice(0,3000);

    let chat = [];

    // Determinar cuál IA inicia
    const ia1Turn = destinatario==="IA-1";

    for (let i=0;i<turnos;i++){
        if(ia1Turn){
            const respuesta1 = await llamarOpenAI(openai1, text, short);
            chat.push({ ia: "IA-1", mensaje: respuesta1 });

            const prompt2 = `Eres IA-2, investigadora de la verdad. Responde al mensaje de IA-1:\n${respuesta1}`;
            const respuesta2 = await llamarOpenAI(openai2, prompt2, short);
            chat.push({ ia: "IA-2", mensaje: respuesta2 });
        } else {
            const respuesta2 = await llamarOpenAI(openai2, text, short);
            chat.push({ ia: "IA-2", mensaje: respuesta2 });

            const prompt1 = `Eres IA-1, investigadora de la verdad. Responde al mensaje de IA-2:\n${respuesta2}`;
            const respuesta1 = await llamarOpenAI(openai1, prompt1, short);
            chat.push({ ia: "IA-1", mensaje: respuesta1 });
        }
    }

    res.json({ chat });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
