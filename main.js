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

<<<<<<< HEAD
    evtSource.onmessage = (event) => {
      chat.innerHTML += `<div><strong>Servidor:</strong> ${event.data}</div>`;
      chat.scrollTop = chat.scrollHeight;
    };

    evtSource.onerror = () => {
      chat.innerHTML += `<div style="color:red;">Conexión cerrada.</div>`;
      evtSource.close();
    };
  });
=======
// Mostrar mensaje en burbuja
function mostrarMensaje(ia,mensaje){
  const div=document.createElement("div");
  div.className="mensaje "+ia;
  chatDiv.appendChild(div);
>>>>>>> parent of cd8858a (sds)

  // Enviar mensaje del usuario
  btnEnviar.addEventListener("click", async () => {
    const texto = mensajeInput.value.trim();
    if (!texto) return;

<<<<<<< HEAD
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
=======
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

// Función para chat continuo
async function enviarTurno(prompt="", destinatario="IA-1"){
  if(detener) return;
  if(pausa) return;

  try{
    const bodyText=prompt?prompt:contexto;
    const resp=await fetch("http://localhost:3000/conversacion",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ text: bodyText, turnos:1, short:true, destinatario })
    });
    const data=await resp.json();

    for(const msg of data.chat){
      await mostrarMensaje(msg.ia,msg.mensaje);
      contexto+=`${msg.ia}: ${msg.mensaje}\n`;
>>>>>>> parent of cd8858a (sds)
    }
  });
});
