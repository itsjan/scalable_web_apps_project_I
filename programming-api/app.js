// app.js
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/deno";
import * as assignments from "./controllers/programmingAssignmentsController.js";
import * as submissions from "./controllers/submissionsController.js";
import { updateGraderFeedback } from "./services/submissionService.js";
import { getRedisClient } from "./database/redis.js";

const app = new Hono();
const clients = new Map();

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

// Web Socket for communication with the programming-ui clients
// Currently only used to send updates to grading requests
app.get(
  "/ws/user/:userUuid",
  upgradeWebSocket((c) => {
    return {
      onOpen(_event, ws) {
        console.log(
          `WebSocket connection opened for user: ${c.req.param("userUuid")}`,
        );
        clients.set(c.req.param("userUuid"), ws);
      },
      // Messages from the client would be handled here
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

// Returns all programming assignments
// Candidate for caching
app.get("/api/assignments", assignments.getAssignments);

// Endpoint for the programming-ui client to submit solutons for grading
app.post("/api/user/:userUuid/submissions/:assignmentId", (c) => {
  const ws = clients.get(c.req.param("userUuid"));
  return submissions.submitSolutionForGrading(c, ws);
});

// Returns all submissions for a given user
app.get("/api/user/:userUuid/submissions", submissions.getAllSubmissionsByUser);

// Polls grading results from the Redis queue
// Also sends updates to the clients
async function pollResults() {
  const client = await getRedisClient();

  while (true) {
    try {
      // Pop a message from the right end of the 'results' list
      client.rpop("results").then((message) => {
        if (message !== null) {
          const result = JSON.parse(message);

          // Send update to the client
          const ws = clients.get(result.user_uuid);
          if (ws) {
            ws.send(
              JSON.stringify({
                type: "submission_update",
                submission: result,
              }),
            );
          }
        } else {
          //console.log("No message received from Redis queue");
        }
      });
    } catch (error) {
      console.error("Error polling results:", error);
      console.error("Stack trace:", error.stack);
      // Wait before retrying in case of error
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Start the polling loop
pollResults();

export default app;
