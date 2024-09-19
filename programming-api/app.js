import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import * as assignments from "./controllers/programmingAssignmentsController.js";
import * as submissions from "./controllers/submissionsController.js";
import * as authController from "./controllers/auth/authController.js";
import accessControlMiddleware from "./middleware/accessControl.js";
import addUserToContextMiddleware from "./middleware/addUserToContext.js";

// Create a new Hono application instance
const app = new Hono();

// Apply access control middleware to all routes under /api/assignments/
app.use("/api/assignments/*", addUserToContextMiddleware);
app.use("/api/assignments/*", accessControlMiddleware);

// Define a custom 404 Not Found handler
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.get("/api/assignments", assignments.getAssignments);
//app.get("/api/assignments/user/:userId/", assignments.getAssignmentsForUser);

app.post(
  "/api/user/:userUuid/submissions/:assignmentId",
  submissions.submitSolutionForGrading,
);

app.post("/auth/register", authController.registerUser);
app.post("/auth/login", authController.loginUser);
app.post("/auth/logout", authController.logoutUser);

// Export the Hono application instance
export default app;
