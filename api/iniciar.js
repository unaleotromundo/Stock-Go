export default function handler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let count = 0;
  const interval = setInterval(() => {
    count++;
    res.write(`data: Mensaje automático ${count}\n\n`);
    if (count >= 10) {
      clearInterval(interval);
      res.end();
    }
  }, 2000);

  req.on("close", () => clearInterval(interval));
}
