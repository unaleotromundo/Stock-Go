// Espera a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  const btnIniciar = document.getElementById("btnIniciar");
  const output = document.getElementById("output");

  if (!btnIniciar || !output) {
    console.error("No se encontraron los elementos #btnIniciar o #output en el HTML");
    return;
  }

  const baseURL = ""; // dejar vacío en Vercel para relative paths, ej: /api/iniciar

  btnIniciar.addEventListener("click", async () => {
    try {
      const res = await fetch(`${baseURL}/api/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: "Hola desde el cliente" }),
      });

      if (!res.ok) throw new Error(`Error en la respuesta: ${res.status}`);

      const data = await res.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      console.error(err);
      output.textContent = `Error al conectar con la API: ${err.message}`;
    }
  });
});
