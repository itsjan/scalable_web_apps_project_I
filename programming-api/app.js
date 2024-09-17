import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import * as assignments from "./controllers/programmingAssignmentsController.js";
import accessControlMiddleware from "./middleware/accessControl.js";

// Create a new Hono application instance
const app = new Hono();

// Apply access control middleware to all routes under /api/assignments/
app.use("/api/assignments/*", accessControlMiddleware);

// Define a custom 404 Not Found handler
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

// Define route to get all assignments
app.get("/api/assignments", assignments.getAssignments);
// Define route to get assignments for a specific user
app.get("/api/assignments/user/:userId/", assignments.getAssignmentsForUser);

// Export the Hono application instance
export default app;
