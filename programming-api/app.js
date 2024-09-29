// app.js
//import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/deno";
import * as assignments from "./controllers/programmingAssignmentsController.js";
import * as submissions from "./controllers/submissionsController.js";
import { updateGraderFeedback } from "./services/submissionService.js";
import { getRedisClient } from "./database/redis.js";

const app = new Hono();
const clients = new Map();

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

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

async function pollResults() {
  const client = await getRedisClient();

  while (true) {
    try {
      // Pop a message from the right end of the 'results' list
      client.rpop("results").then(async (message) => {
        if (message !== null) {
          console.log("Received result:", message);
          const result = JSON.parse(message);
          console.log("Parsed result:", result);

          console.log("Updating grader feedback with params:");
          console.log("user_uuid:", result.user_uuid);
          console.log("id:", result.id);
          console.log("grader_feedback:", result.grader_feedback);
          console.log("correct:", result.correct);
          console.log("status:", result.status);

          // updates the DB
          await updateGraderFeedback(
            result.user_uuid,
            result.id,
            result.grader_feedback,
            result.correct,
            result.status,
          );

          console.log("Updated result:");
          console.log(JSON.stringify(updatedResult, null, 2));

          const ws = clients.get(result.user_uuid);
          if (ws) {
            console.log("Sending WebSocket message to user:", result.user_uuid);
            ws.send(
              JSON.stringify({
                type: "submission_update",
                submission: result,
              }),
            );
          } else {
            console.log("WebSocket not found for user:", result.user_uuid);
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

//const intervalId = setInterval(
//  () => console.log("Nope"),
//  5000);
//clearInterval(intervalId);

pollResults();

export default app;
