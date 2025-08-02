javascript
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());

const corsOptions = {
origin: (origin, callback) => {
if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:5500') { // Añade tu origen local si pruebas localmente
callback(null, true);
} else {
callback(new Error('Not allowed by CORS'));
}
},
methods: ['GET', 'POST', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors());

// Endpoint para generar texto con Gemini
app.post('/api/chat', async (req, res) => {
const geminiApiKey = process.env.GEMINI_API_KEY;
const userMessage = req.body.message;

if (!geminiApiKey) {
    return res.status(500).json({ error: 'Clave de API de Gemini no configurada.' });
}

try {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        }
    );
    const data = await response.json();
    if (!response.ok) {
        console.error('Error Gemini:', data);
        return res.status(response.status).json({ error: data.error?.message || 'Error de Gemini' });
    }
    res.json(data);
} catch (error) {
    console.error('Error al llamar a Gemini:', error);
    res.status(500).json({ error: 'Error del servidor al procesar el chat.' });
}
});

// Endpoint para generar imágenes con DALL-E
app.post('/api/generate-image', async (req, res) => {
const imageApiKey = process.env.IMAGEN_API_KEY;
const { prompt } = req.body;

if (!imageApiKey) {
    return res.status(500).json({ error: 'Clave de API de imágenes no configurada.' });
}

try {
    const imageUrl = `https://api.openai.com/v1/images/generations`;
    const payload = {
        prompt,
        model: "dall-e-3",
        n: 1,
        size: "1024x1024"
    };

    const response = await fetch(imageUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${imageApiKey}`
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('Error en la API de imágenes:', data);
        return res.status(response.status).json({ error: data.error?.message || 'Error al generar la imagen.' });
    }

    const imageResultUrl = data.data?.[0]?.url;
    if (imageResultUrl) {
        res.json({ imageUrl: imageResultUrl });
    } else {
        res.status(500).json({ error: 'Respuesta inesperada de la API de imágenes.' });
    }
} catch (error) {
    console.error('Error al llamar a la API de imágenes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
}
});

export default app;