document.addEventListener("DOMContentLoaded", () => {
  const chat = document.getElementById("chat");
  const mensajeInput = document.getElementById("mensaje");
  const btnEnviar = document.getElementById("btnEnviar");
  const btnIniciar = document.getElementById("btnIniciar");

  let evtSource;

  // Iniciar SSE
  btnIniciar.addEventListener("click", () => {
    if (evtSource) evtSource.close(); // cerrar conexión previa
    evtSource = new EventSource("/api/iniciar");

    evtSource.onmessage = (event) => {
      chat.innerHTML += `<div><strong>Servidor:</strong> ${event.data}</div>`;
      chat.scrollTop = chat.scrollHeight;
    };

    evtSource.onerror = () => {
      chat.innerHTML += `<div style="color:red;">Conexión cerrada.</div>`;
      evtSource.close();
    };
  });

  // Enviar mensaje del usuario
  btnEnviar.addEventListener("click", async () => {
    const texto = mensajeInput.value.trim();
    if (!texto) return;

    // Enviar al servidor
    try {
      const res = await fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: texto })
      });
      const data = await res.json();
      chat.innerHTML += `<div><strong>Tú:</strong> ${data.mensaje}</div>`;
      chat.scrollTop = chat.scrollHeight;
      mensajeInput.value = "";
    } catch (err) {
      chat.innerHTML += `<div style="color:red;">Error enviando mensaje</div>`;
    }
  });
});
