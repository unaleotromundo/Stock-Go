<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", () => {
  const chat = document.getElementById("chat");
  const input = document.getElementById("mensaje");
  const enviarBtn = document.getElementById("enviar");
=======
const API_URL = "https://prueba-ofo7bd350-agradecidos-projects.vercel.app"; // <- reemplazar con tu backend real
>>>>>>> parent of 82ed050 (ghj)

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

<<<<<<< HEAD
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
=======
// Loop infinito de conversación
async function loopConversacion() {
    const conv = conversaciones.find(c=>c.id===conversacionActivaId);
    if(!conv || chatDetenido) return;

    const iaActual = conv.mensajes.length % 2 === 0 ? "IA-1":"IA-2";
    const prompt = `${prompts[iaActual]}\nHistorial:\n${conv.mensajes.map(m=>m.ia+": "+m.mensaje).join("\n")}`;

    const respuesta = await fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ text: prompt, destinatario: iaActual })
    }).then(r=>r.json()).then(d=>d.chat[0].mensaje).catch(()=>`Error ${iaActual}`);

    conv.mensajes.push({ ia: iaActual, mensaje: respuesta });
    renderizarChat();
    guardarConversaciones();

    if(!chatPausado) setTimeout(loopConversacion, 500);
}

// Eventos
enviarBtn.onclick = () => {
    if(inputMensaje.value.trim() === "") return;
    const conv = conversaciones.find(c => c.id === conversacionActivaId);
    conv.mensajes.push({ ia: "IA-1", mensaje: inputMensaje.value });
    renderizarChat();
    guardarConversaciones();
    inputMensaje.value = "";
    loopConversacion(); // Inicia loop automático
};
nuevaConvBtn.onclick = () => {
    const nombre = `Conversación ${conversaciones.length+1}`;
    agregarConversacion(nombre);
};
pausarBtn.onclick = () => chatPausado = !chatPausado;
detenerBtn.onclick = () => chatDetenido = true;
editarPromptsBtn.onclick = () => {
    const p1 = prompt("Editar prompt IA-1", prompts["IA-1"]);
    if(p1) prompts["IA-1"] = p1;
    const p2 = prompt("Editar prompt IA-2", prompts["IA-2"]);
    if(p2) prompts["IA-2"] = p2;
};

// Inicializar
if(conversaciones.length===0) agregarConversacion("Conversación 1");
else conversacionActivaId = conversaciones[conversaciones.length-1].id;

renderizarLista();
renderizarChat();
>>>>>>> parent of 82ed050 (ghj)
