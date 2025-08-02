import { applyCORS } from "./cors";

export default function handler(req, res) {
  if (applyCORS(req, res)) return;

  if (req.method === "POST") {
    const { message } = req.body;
    res.status(200).json({ reply: `Tu mensaje fue: ${message}` });
    return;
  }
  res.status(405).json({ error: "Método no permitido" });
}