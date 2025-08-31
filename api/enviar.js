export default function handler(req, res) {
  if (req.method === "POST") {
    const { mensaje } = req.body;
    // Aquí podrías procesar o guardar el mensaje si quieres
    res.status(200).json({ mensaje });
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
