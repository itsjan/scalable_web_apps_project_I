import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import * as assignments from "./controllers/programmingAssignmentsController.js";
import * as submissions from "./controllers/submissionsController.js";

const app = new Hono();

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.get("/api/assignments", assignments.getAssignments);

app.post(
  "/api/user/:userUuid/submissions/:assignmentId",
  submissions.submitSolutionForGrading,
);

export default app;
