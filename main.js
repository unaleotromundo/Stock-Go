const API_URL = "https://prueba-ofo7bd350-agradecidos-projects.vercel.app/conversacion";

let conversaciones = [];
let activo = true;
let detenido = false;
let turno = 0;
let promptIA1 = "Eres una IA curiosa e investigadora de la verdad.";
let promptIA2 = "Eres una IA curiosa e investigadora de la verdad.";

const chatDiv = document.getElementById("chat");
const enviarBtn = document.getElementById("enviarBtn");
const pausarBtn = document.getElementById("pausarBtn");
const detenerBtn = document.getElementById("detenerBtn");
const nuevaConversacionBtn = document.getElementById("nuevaConversacionBtn");
const promptIA1Btn = document.getElementById("promptIA1Btn");
const promptIA2Btn = document.getElementById("promptIA2Btn");
const mensajeInput = document.getElementById("mensajeInput");
const archivoInput = document.getElementById("archivoInput");
const listaConversaciones = document.getElementById("listaConversaciones");

// Cargar historial
if (localStorage.getItem("conversaciones")) {
    conversaciones = JSON.parse(localStorage.getItem("conversaciones"));
    renderizarLista();
}

// Funciones
function renderizarLista() {
    listaConversaciones.innerHTML = "";
    conversaciones.forEach((c, i) => {
        const li = document.createElement("li");
        li.textContent = c.nombre;
        li.onclick = () => {
            turno = i;
            renderizarChat();
        };
        listaConversaciones.appendChild(li);
    });
}

function renderizarChat() {
    chatDiv.innerHTML = "";
    if (!conversaciones[turno]) return;
    conversaciones[turno].chat.forEach(m => {
        const div = document.createElement("div");
        div.classList.add("mensaje", m.ia === "IA-1" ? "ia1" : "ia2");
        div.textContent = m.mensaje;
        chatDiv.appendChild(div);
    });
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

async function enviarMensaje(texto) {
    if (!texto) return;
    if (!conversaciones[turno]) {
        conversaciones.push({ nombre: `Conversación ${conversaciones.length+1}`, chat: [] });
        turno = conversaciones.length - 1;
    }
    const chatActual = conversaciones[turno].chat;

    chatActual.push({ ia: "Usuario", mensaje: texto });
    renderizarChat();
    localStorage.setItem("conversaciones", JSON.stringify(conversaciones));

    if (detenido) return;

    activo = true;
    loopConversacion();
}

async function loopConversacion() {
    if (!activo || detenido) return;

    const chatActual = conversaciones[turno].chat;
    const ultimo = chatActual[chatActual.length - 1]?.mensaje || "";

    // IA-1
    const resp1 = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: promptIA1 + "\n" + ultimo, destinatario: "IA-1" })
    });
    const data1 = await resp1.json();
    chatActual.push(data1.chat[0]);
    renderizarChat();
    localStorage.setItem("conversaciones", JSON.stringify(conversaciones));

    if (detenido) return;

    // IA-2
    const resp2 = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: promptIA2 + "\n" + chatActual[chatActual.length-1].mensaje, destinatario: "IA-2" })
    });
    const data2 = await resp2.json();
    chatActual.push(data2.chat[0]);
    renderizarChat();
    localStorage.setItem("conversaciones", JSON.stringify(conversaciones));

    setTimeout(loopConversacion, 1000); // cada segundo
}

// Botones
enviarBtn.onclick = () => {
    enviarMensaje(mensajeInput.value);
    mensajeInput.value = "";
};

pausarBtn.onclick = () => { activo = !activo; };

detenerBtn.onclick = () => { detenido = true; };

nuevaConversacionBtn.onclick = () => {
    conversaciones.push({ nombre: `Conversación ${conversaciones.length+1}`, chat: [] });
    turno = conversaciones.length - 1;
    renderizarLista();
    renderizarChat();
    localStorage.setItem("conversaciones", JSON.stringify(conversaciones));
};

promptIA1Btn.onclick = () => {
    const nuevoPrompt = prompt("Nuevo prompt para IA-1:", promptIA1);
    if (nuevoPrompt) promptIA1 = nuevoPrompt;
};

promptIA2Btn.onclick = () => {
    const nuevoPrompt = prompt("Nuevo prompt para IA-2:", promptIA2);
    if (nuevoPrompt) promptIA2 = nuevoPrompt;
};

// PDF a texto (opcional)
archivoInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const pdfData = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;
    let texto = "";
    for (let i=1; i<=pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        texto += content.items.map(item => item.str).join(" ") + "\n";
    }
    enviarMensaje(texto);
};
