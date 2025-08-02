import { applyCORS } from "./cors";

export default async function handler(req, res) {
  if (applyCORS(req, res)) return;

  if (req.method === "POST") {
    // Aquí iría la lógica de generación de imagen con IA.
    res.status(200).json({ url: "https://placehold.co/400x300.png?text=Demo+AI+Image" });
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}