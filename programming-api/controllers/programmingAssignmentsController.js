import * as programmingAssignmentService from "../services/programmingAssignmentService.js";

import {
  getSignedCookie,
  setSignedCookie,
} from "https://deno.land/x/hono@v3.12.11/helper.ts";

const getSessionId = async (c) => {
  const secret = "1234567890";
  const sessionId = (await getSignedCookie(c, secret, "sessionId")) ??
    crypto.randomUUID();

  if (sessionId === undefined) {
    return crypto.randomUUID();
  }
  await setSignedCookie(c, "sessionId", sessionId, secret, { path: "/" });
  return sessionId;
};

const getAssignmentsForUser = async (c) => {
  console.log("Starting getAssignmentsForUser function");

  try {
    const userId = c.user;
    console.log("User ........:");
    console.log({ ...c });

    console.log("Fetching assignments for user");
    const assignments = await programmingAssignmentService.findAllForUser(
      userId,
    );
    console.log("Assignments fetched:", assignments);

    console.log("Fetching last completed assignment");
    const lastOneCompleted =
      (await programmingAssignmentService.lastAssignmentCompletedByUser(
        userId,
      )) ?? 0;
    console.log("Last completed assignment:", lastOneCompleted);

    console.log("Fetching correct solutions");
    const correctSolutions = await programmingAssignmentService
      .correctSubmissionsByUser(userId);
    console.log("Correct solutions:", correctSolutions);

    console.log({ assignments, lastOneCompleted, correctSolutions });
    console.log("Returning JSON response");
    return c.json({ assignments, lastOneCompleted, correctSolutions });
  } catch (error) {
    console.log("Error in getAssignmentsForUser:", error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
};

const getAssignments = async (c) => {
  try {
    const assignments = await programmingAssignmentService.findAll();
    return c.json(assignments);
  } catch (error) {
    console.log(error);
    return c.json({ message: "Internal Server Error", ok: false }, 500);
  }
};

export { getAssignments, getAssignmentsForUser };
