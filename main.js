// WebSocket
const ws = new WebSocket("ws://localhost:3000");

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    mostrarMensaje(data.ia, data.mensaje);
};

function mostrarMensaje(ia, mensaje) {
    const chatHistorial = document.getElementById("chatHistorial");
    const div = document.createElement("div");
    div.classList.add("mensaje", ia);
    div.textContent = mensaje;
    chatHistorial.appendChild(div);
    chatHistorial.scrollTop = chatHistorial.scrollHeight;
}

// Enviar mensaje inicial / iniciar loop
document.getElementById("enviar").addEventListener("click", async () => {
    await fetch("http://localhost:3000/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: document.getElementById("inputMensaje").value })
    });
});

// Detener conversación
document.getElementById("detener").addEventListener("click", async () => {
    await fetch("http://localhost:3000/detener", { method: "POST" });
});

// Toggle modo oscuro
document.getElementById("toggleTema").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const btn = document.getElementById("toggleTema");
    btn.textContent = document.body.classList.contains("dark") ? "☀️ Modo claro" : "🌙 Modo oscuro";
});
