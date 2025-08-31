document.addEventListener("DOMContentLoaded", () => {
  const chat = document.getElementById("chat");
  const input = document.getElementById("mensaje");
  const enviarBtn = document.getElementById("enviar");

  if (!chat || !input || !enviarBtn) return;

  enviarBtn.addEventListener("click", async () => {
    const texto = input.value.trim();
    if (!texto) return;

    // Mostrar mensaje del usuario
    const userMsg = document.createElement("div");
    userMsg.className = "mensaje usuario";
    userMsg.textContent = texto;
    chat.appendChild(userMsg);

    input.value = "";
    chat.scrollTop = chat.scrollHeight;

    // Enviar al servidor
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: texto }),
      });
      const data = await res.json();

      // Efecto typing
      const serverMsg = document.createElement("div");
      serverMsg.className = "mensaje servidor";
      chat.appendChild(serverMsg);

      let i = 0;
      const typing = setInterval(() => {
        serverMsg.textContent += data.reply[i];
        i++;
        if (i >= data.reply.length) clearInterval(typing);
        chat.scrollTop = chat.scrollHeight;
      }, 30);
    } catch (err) {
      console.error(err);
    }
  });
});
