document.addEventListener("DOMContentLoaded", () => {
  const btnIniciar = document.getElementById("btnIniciar");
  const output = document.getElementById("output");

  if (!btnIniciar || !output) return;

  btnIniciar.addEventListener("click", () => {
    output.textContent = "";

    const evtSource = new EventSource("/api/iniciar");

    evtSource.onmessage = (event) => {
      output.textContent += event.data + "\n";
      output.scrollTop = output.scrollHeight; // autoscroll
    };

    evtSource.onerror = (err) => {
      console.error("Error SSE:", err);
      output.textContent += "Error en la conexión.\n";
      evtSource.close();
    };
  });
});
