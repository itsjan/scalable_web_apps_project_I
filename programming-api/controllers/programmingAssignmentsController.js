import * as programmingAssignmentService from "../services/programmingAssignmentService.js";

import {
  getSignedCookie,
  setSignedCookie,
} from "https://deno.land/x/hono@v3.12.11/helper.ts";

const getSessionId = async (c) => {
  const secret = "1234567890";
  const sessionId =
    (await getSignedCookie(c, secret, "sessionId")) ?? crypto.randomUUID();

  if (sessionId === undefined) {
    return crypto.randomUUID();
  }
  await setSignedCookie(c, "sessionId", sessionId, secret, { path: "/" });
  return sessionId;
};

const getAssignmentsForUser = async (c) => {
  const sessionId = await getSessionId(c);

  try {
    const userId = c.req.param("userId");
    const assignments =
      await programmingAssignmentService.findAllForUser(userId);
    const lastOneCompleted =
      (await programmingAssignmentService.lastAssignmentCompletedByUser(
        userId,
      )) ?? 0;
    const correctSolutions =
      await programmingAssignmentService.correctSubmissionsByUser(userId);

    console.log({ assignments, lastOneCompleted, correctSolutions });
    return c.json({ assignments, lastOneCompleted, correctSolutions });
  } catch (error) {
    console.log(error);
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

export { getAssignmentsForUser, getAssignments };
