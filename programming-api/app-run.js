import app from "./app.js";
const portConfig = { port: 7777, hostname: "0.0.0.0" };

const ac = new AbortController();
const { signal } = ac;

Deno.addSignalListener("SIGINT", () => {
  console.log("Shutting down server...");
  ac.abort();
});

const server = Deno.serve({
  ...portConfig,
  signal,
  handler: app.fetch,
  onListen({ port, hostname }) {
    console.log(`Programming API listening on http://${hostname}:${port}`);
  },
});

await server.finished;
console.log("Server shut down");
