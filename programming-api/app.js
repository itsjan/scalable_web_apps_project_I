// app.js
//import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/deno";
import * as assignments from "./controllers/programmingAssignmentsController.js";
import * as submissions from "./controllers/submissionsController.js";

const app = new Hono();
const clients = new Map();

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

// app.get("/ws/user/:userUuid",  (c) => {
//   const userUuid = c.req.param("userUuid");
//   const { socket, response } = await upgradeWebSocket(c);

//   console.log({ socket, response });
//   clients.set(userUuid, socket);
//   //socket.send("Hello from server!");

//   return {
//     onOpen(ws) {
//       console.log(`WebSocket connection opened for user: ${userUuid}`);
//       clients.set(userUuid, ws);
//       socket.send("Hello from server!");
//     },
//     onMessage(event, ws) {
//       console.log(`Message from client ${userUuid}: ${event.data}`);
//       socket.send("Hello from server!");
//     },
//     onClose() {
//       clients.delete(userUuid);
//       console.log(`WebSocket connection closed for user: ${userUuid}`);
//     },
//   };
// });
//

app.get(
  "/ws/user/:userUuid",
  upgradeWebSocket((c) => {
    return {
      onOpen(_event, ws) {
        console.log(
          `WebSocket connection opened for user: ${c.req.param("userUuid")}`,
        );
        clients.set(c.req.param("userUuid"), ws);
        const data = JSON.stringify({
          type: "hello",
          message: "Hello from server!",
        });
        ws.send(data);
      },
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`);
        ws.send("Hello from server!");
      },
      onClose: () => {
        console.log("Connection closed");
      },
    };
  }),
);

app.get("/api/assignments", assignments.getAssignments);

app.post("/api/user/:userUuid/submissions/:assignmentId", (c) => {
  console.log("Starting post submissions function");
  const ws = clients.get(c.req.param("userUuid"));
  return submissions.submitSolutionForGrading(c, ws);
});

app.get(
  "/api/user/:userUuid/submissions/:assignmentId",
  submissions.getSubmissionsByUser,
);

app.get("/api/user/:userUuid/submissions", submissions.getAllSubmissionsByUser);

export default app;
