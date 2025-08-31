pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js';

let contexto=""; 
let turnoActivo=false; 
let pausa=false; 
let detener=false;

const chatDiv=document.getElementById('chat');
const textoEntrada=document.getElementById('textoEntrada');

// Prompts iniciales de cada IA
let promptIA1 = "Eres IA-1, curiosa e investigadora de la verdad. Responde de manera corta y clara.";
let promptIA2 = "Eres IA-2, curiosa e investigadora de la verdad. Responde de manera corta y clara.";

// Mostrar mensaje en burbuja
function mostrarMensaje(ia,mensaje){
  const div=document.createElement("div");
  div.className="mensaje "+ia;
  chatDiv.appendChild(div);

  let texto="";
  for(const palabra of mensaje.split(" ")){
    texto+=palabra+" ";
    div.textContent=texto;
    chatDiv.scrollTop=chatDiv.scrollHeight;
  }
}

// Procesar PDF
document.getElementById('cargarPDF').onclick=()=>document.getElementById('pdfFile').click();
document.getElementById('pdfFile').onchange=async e=>{
  const file=e.target.files[0];
  if(!file) return;
  const arrayBuffer=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:arrayBuffer}).promise;
  let text="";
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    text+=content.items.map(item=>item.str).join(" ")+"\n\n";
  }
  textoEntrada.value=text.length>3000?text.slice(0,3000):text;
}

// Cambiar prompt IA-1
document.getElementById('promptIA1').onclick = () => {
  const nuevoPrompt = prompt("Ingrese nuevo prompt para IA-1:", promptIA1);
  if(nuevoPrompt) promptIA1 = nuevoPrompt;
};

// Cambiar prompt IA-2
document.getElementById('promptIA2').onclick = () => {
  const nuevoPrompt = prompt("Ingrese nuevo prompt para IA-2:", promptIA2);
  if(nuevoPrompt) promptIA2 = nuevoPrompt;
}

// Función de chat continuo
async function enviarTurno(prompt="", destinatario="IA-1"){
  if(detener) return;
  if(pausa) return;

  try{
    let bodyText = prompt ? prompt : contexto;
    const promptFinal = destinatario==="IA-1" ? `${promptIA1}\n\n${bodyText}` : `${promptIA2}\n\n${bodyText}`;

    const resp = await fetch("http://localhost:3000/conversacion",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ text: promptFinal, turnos:1, short:true, destinatario })
    });

    const data = await resp.json();

    for(const msg of data.chat){
      await mostrarMensaje(msg.ia,msg.mensaje);
      contexto+=`${msg.ia}: ${msg.mensaje}\n`;
    }

    const ultimoIA=data.chat[data.chat.length-1].ia;
    const otro=ultimoIA==="IA-1"?"IA-2":"IA-1";
    if(turnoActivo && !pausa && !detener) setTimeout(()=>enviarTurno("",otro),500);

  }catch(err){
    console.error("Error conversación:",err);
    mostrarMensaje("IA-1","Error al conectar con el servidor.");
  }
}

// Enviar mensaje desde input
document.getElementById('enviarMensaje').onclick=()=>{
  const text=textoEntrada.value.trim();
  if(!text) return;
  textoEntrada.value="";
  mostrarMensaje("IA-1",text);
  contexto+=`IA-1: ${text}\n`;
  if(!turnoActivo){turnoActivo=true; detener=false; pausa=false; enviarTurno("", "IA-2");}
}

// Botones control
document.getElementById('pausar').onclick=()=>{pausa=!pausa;}
document.getElementById('detener').onclick=()=>{detener=true; turnoActivo=false;}
document.getElementById('nueva').onclick=()=>{
  contexto=""; chatDiv.innerHTML=""; turnoActivo=false; pausa=false; detener=false; textoEntrada.value="";
}
