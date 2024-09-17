import app from "./app.js";
const portConfig = { port: 7777, hostname: "0.0.0.0" };
Deno.serve({
  ...portConfig,
  handler: app.fetch,
  onListen({ port, hostname }) {
    console.log(`Programming API listening on http://${hostname}:${port}`);
  },
});
