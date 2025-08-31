import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

async function testGemini() {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-1.5",
        input: "Hola, Gemini. Haz una prueba breve."
      }),
    });

    const data = await res.json();
    console.log("Respuesta Gemini:", data);
  } catch (err) {
    console.error("Error Gemini:", err);
  }
}

testGemini();
