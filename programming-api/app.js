import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";
import * as assignments from "./controllers/programmingAssignmentsController.js";
const app = new Hono();
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.get("/api/assignments", assignments.getAssignments);
app.get("/api/user/:userId/assignments", assignments.getAssignmentsForUser);

export default app;
