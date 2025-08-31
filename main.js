// main.js

// Detecta si estamos en localhost o producción
const baseURL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://iaconversacional-git-main-agradecidos-projects.vercel.app";

// Si necesitas WebSocket, recuerda que Vercel no lo soporta directamente.
// Aquí solo lo dejo comentado para desarrollo local.
// const ws = new WebSocket(`${baseURL.replace(/^http/, 'ws')}/`);

// Botón para iniciar acción
const btnIniciar = document.getElementById("btnIniciar");

btnIniciar.addEventListener("click", async () => {
  try {
    const res = await fetch(`${baseURL}/api/iniciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: "Hola desde el cliente" }),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    console.log("Respuesta de la API:", data);

    // Mostrar respuesta en la página si querés
    const output = document.getElementById("output");
    if (output) output.textContent = JSON.stringify(data, null, 2);

  } catch (err) {
    console.error("Error al conectar con la API:", err);
    alert("No se pudo conectar con la API. Revisa la consola.");
  }
});
