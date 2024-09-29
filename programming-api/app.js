// app.js

import { Hono } from "hono";
import { upgradeWebSocket } from "hono/deno";
import {
  getAllSubmissionsByUser,
  submitSolutionForGrading,
  updateGraderFeedback,
} from "./services/submissionService.js";
import * as assignmentsService from "./services/programmingAssignmentService.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";
const cachedAssignmentsService = cacheMethodCalls(assignmentsService, [
  "insert",
]);
import { getRedisClient } from "./database/redis.js";

const app = new Hono();
const clients = new Map();

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

/**
 * Creates a Web Socket for communication with the programming-ui clients
 * Currently only used to send updates to grading requests
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

/**
 * Returns all programming assignments
 * Candidate for caching
 */
app.get("/api/assignments", async (c) => {
  try {
    const assignments = await cachedAssignmentsService.findAll();
    return c.json(assignments);
  } catch (error) {
    console.error("Error in getAssignments:", error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
});

/**
 * Creates a new assignment
 * ( invalidates cache )
 */
app.post("/api/assignments", async (c) => {

  // todo: validata parameters ...
  const body = await c.req.json();
  try {
    const assignment = await cachedAssignmentsService.insert(body);
    return c.json(assignment);
  } catch (error) {
    console.error("Error in insert:", error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
})

/**
 * Endpoint for the programming-ui client to submit solutions for grading
 */
app.post("/api/user/:userUuid/submissions/:assignmentId", async (c) => {
  const userUuid = c.req.param("userUuid");
  const ws = clients.get(userUuid);
  const assignmentId = c.req.param("assignmentId");
  const body = await c.req.json();
  const code = body.code;

  try {
    const result = await submitSolutionForGrading(
      userUuid,
      assignmentId,
      code,
    );

    // we have a queue of submissions. Push to Redis
    const redisClient = await getRedisClient();
    await redisClient.lpush("submissions", JSON.stringify(result));

    if (ws) {
      ws.send(JSON.stringify({ type: "submission_update", submission: result }));
    } else {
      console.log(
        `No WebSocket connection found for user: ${userUuid}`,
      );
    }

    return c.json({ ...result, ok: true }, 200);
  } catch (error) {
    console.error("Error in submitSolutionForGrading:", error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
});

/**
 * Endpoint for the programming-ui client to get submissions by user
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
      const submissions = await submissionsByUser(
        assignmentId,
        userUuid,
      );
      console.log("Submissions retrieved:", submissions);

      return c.json({ submissions });
    } catch (error) {
      console.error("Error in getSubmissionsByUser:", error);
      return c.json({ message: "Internal Server Error", ok: false }, 500);
    }
  },
);

/**
 * Endpoint for the programming-ui client to get all submissions by user
 */
app.get("/api/user/:userUuid/submissions", async (c) => {
  console.log("Starting getAllSubmissionsByUser function");
  const userUuid = c.req.param("userUuid");

  try {
    const allSubmissions = await getAllSubmissionsByUser(
      userUuid,
    );

    return c.json({ submissions: allSubmissions });
  } catch (error) {
    console.error("Error in getAllSubmissionsByUser:", error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
});

/**
 * Polls grading results from the Redis queue
 * Also sends updates to the clients
 */
async function pollResults() {
  const client = await getRedisClient();

  while (true) {
    try {
      // Pop a message from the right end of the 'results' list
      const message = await client.rpop("results");
      if (message !== null) {
        console.log("Received result:", message);
        const result = JSON.parse(message);

        // - updates the DB
        await updateGraderFeedback(result);
        // - sends an update to the client
        const ws = clients.get(result.user_uuid);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "submission_update",
              submission: result,
            }),
          );
        } else {
          console.log(
            `No WebSocket connection found for user: ${result.user_uuid}`,
          );
        }
      } else {
        //console.log("No message received from Redis queue");
      }
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

