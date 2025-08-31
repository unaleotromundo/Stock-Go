// /api/chat.js
export default function handler(req, res) {
  if (req.method === "POST") {
    const { mensaje } = req.body;
    // Simulamos una respuesta
    const reply = `💬 Eco: ${mensaje}`;
    return res.status(200).json({ reply });
  }
  return res.status(405).json({ error: "Método no permitido" });
}
