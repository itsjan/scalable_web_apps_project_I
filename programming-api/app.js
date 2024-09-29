// app.js

import { Hono } from "hono";
import { upgradeWebSocket } from "hono/deno";
import * as submissionService from "./services/submissionService.js";
import { updateGraderFeedback } from "./services/submissionService.js";
import {findAll as findAllAssignments} from "./services/programmingAssignmentService.js";

import { getRedisClient } from "./database/redis.js";

const app = new Hono();
const clients = new Map();

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));


/*
// Creates a Web Socket for communication with the programming-ui clients
// Currently only used to send updates to grading requests
*/
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

/*
// Returns all programming assignments
// Candidate for caching
*/
app.get("/api/assignments", async (c) => {
  try {
    const assignments = await findAllAssignments();
    return c.json(assignments);
  } catch (error) {
    console.error("Error in getAssignments:", error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
});


/*
// Endpoint for the programming-ui client to submit solutons for grading
*/
app.post("/api/user/:userUuid/submissions/:assignmentId", async (c) => {

  const userUuid = c.req.param("userUuid");
  const ws = clients.get(userUuid);
  const assignmentId = c.req.param("assignmentId");
  const body = await c.req.json();
  const code = body.code;

  try {
    const result = await submissionService.submitSolutionForGrading(
      userUuid,
      assignmentId,
      code,
    );
    console.log("Submission result:", result);

    ws.send(JSON.stringify({ type: "submission_update", submission: result }));

    return c.json({ ...result, ok: true }, 200);
  } catch (error) {
    return c.json({ message: "Internal Server Error", error }, 500);
  }

  //return submissions.submitSolutionForGrading(c, ws);
});

/*
// Endpoint for the programming-ui client to get submissions by user
*/
app.get(
  "/api/user/:userUuid/submissions/:assignmentId",
  async (c) => {
    console.log("Starting getSubmissionsByUser function");
    const assignmentId = c.req.param("assignmentId");
    const userUuid = c.req.param("userUuid");

    console.log("Assignment ID:", assignmentId);
    console.log("User UUID:", userUuid);

    try {
      const submissions = await submissionService.submissionsByUser(
        assignmentId,
        userUuid,
      );
      console.log("Submissions retrieved:", submissions);

      return c.json({ submissions });
    } catch (error) {
      console.error("Error in getSubmissionsByUser:", error);
      return c.json({ message: "Internal Server Error", ok: false }, 500);
    }
  }
);

/*
// Endpoint for the programming-ui client to get all submissions by user
*/
app.get("/api/user/:userUuid/submissions", async (c) => {
  console.log("Starting getAllSubmissionsByUser function");
  const userUuid = c.req.param("userUuid");

  console.log("User UUID:", userUuid);

  try {
    const allSubmissions = await submissionService.getAllSubmissionsByUser(
      userUuid,
    );
    console.log("All submissions retrieved:", allSubmissions);

    return c.json({ submissions: allSubmissions });
  } catch (error) {
    console.error("Error in getAllSubmissionsByUser:", error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
});

/*
// Polls grading results from the Redis queue
// Also sends updates to the clients
*/
async function pollResults() {
  const client = await getRedisClient();

  while (true) {
    try {
      // Pop a message from the right end of the 'results' list
      client.rpop("results").then(async (message) => {
        if (message !== null) {
          console.log("Received result:", message);
          const result = JSON.parse(message);

          // - updates the DB
          await updateGraderFeedback(result)
          // - sends an update to the client
          const ws = clients.get(result.user_uuid);
          if (ws) {
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

// Start the polling loop
pollResults();

export default app;
