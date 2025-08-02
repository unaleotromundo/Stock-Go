import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());

// Middleware de CORS corregido para Vercel
// Esta configuración maneja correctamente los subdominios de Vercel y las solicitudes 'preflight'.
app.use(cors({
    origin: (origin, callback) => {
        // Permite cualquier subdominio de .vercel.app y el origen nulo (para entornos de desarrollo locales)
        if (!origin || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Es crucial permitir el header 'Authorization' para DALL-E
    optionsSuccessStatus: 200,
}));

// Este middleware es crucial para responder a las solicitudes OPTIONS 'preflight'
app.options('*', cors());

// --- Tus endpoints para Gemini y generación de imágenes ---

// Endpoint 1: Para generar texto con la API de Gemini
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

// Endpoint 2: Para generar imágenes con una API dedicada (Ejemplo con DALL-E)
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