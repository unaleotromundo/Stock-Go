const API_URL = "https://http://localhost:3000/conversacion"; // <- reemplazar con tu backend real

let conversaciones = JSON.parse(localStorage.getItem("conversaciones") || "[]");
let conversacionActivaId = null;
let chatPausado = false;
let chatDetenido = false;
let prompts = {
    "IA-1": "Eres IA-1, investigadora y curiosa. Responde corta y clara, profundizando en el tema, evitando repetir ideas previas (~30-40 palabras).",
    "IA-2": "Eres IA-2, investigadora y curiosa. Responde corta y clara, profundizando en el tema, evitando repetir ideas previas (~30-40 palabras)."
};

// Elementos
const listaConversaciones = document.getElementById("listaConversaciones");
const chatHistorial = document.getElementById("chatHistorial");
const inputMensaje = document.getElementById("inputMensaje");
const inputPDF = document.getElementById("inputPDF");
const enviarBtn = document.getElementById("enviar");
const pausarBtn = document.getElementById("pausar");
const detenerBtn = document.getElementById("detener");
const nuevaConvBtn = document.getElementById("nuevaConversacion");
const editarPromptsBtn = document.getElementById("editarPrompts");

function guardarConversaciones() {
    localStorage.setItem("conversaciones", JSON.stringify(conversaciones));
}

function agregarConversacion(nombre) {
    const id = Date.now();
    const nueva = { id, nombre, mensajes: [] };
    conversaciones.push(nueva);
    conversacionActivaId = id;
    guardarConversaciones();
    renderizarLista();
    renderizarChat();
}

function renderizarLista() {
    listaConversaciones.innerHTML = "";
    conversaciones.forEach(conv => {
        const li = document.createElement("li");
        li.textContent = conv.nombre;
        if(conv.id === conversacionActivaId) li.classList.add("active");
        li.onclick = () => {
            conversacionActivaId = conv.id;
            renderizarLista();
            renderizarChat();
        };
        listaConversaciones.appendChild(li);
    });
}

function renderizarChat() {
    chatHistorial.innerHTML = "";
    const conv = conversaciones.find(c => c.id === conversacionActivaId);
    if(!conv) return;
    conv.mensajes.forEach(m => {
        const div = document.createElement("div");
        div.classList.add("mensaje", m.ia);
        div.textContent = m.mensaje;
        chatHistorial.appendChild(div);
    });
    chatHistorial.scrollTop = chatHistorial.scrollHeight;
}

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
