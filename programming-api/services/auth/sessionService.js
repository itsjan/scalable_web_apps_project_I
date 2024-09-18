// File: sessionService.js
const openKv = async () => await Deno.openKv("sessions.db");

import {
  deleteCookie,
  getSignedCookie,
  setSignedCookie,
} from "https://deno.land/x/hono@v3.12.11/helper.ts";

const secret = "***secret***";
const WEEK_IN_MILLISECONDS = 604800000;

const createSession = async (c, user) => {
  const sessionId = crypto.randomUUID();
  await setSignedCookie(c, "sessionId", sessionId, secret, {
    path: "/",
  });

  const kv = await openKv();
  await kv.set(
    ["sessions", sessionId],
    { user },
    {
      expireIn: WEEK_IN_MILLISECONDS,
    },
  );
};

const deleteSession = async (c) => {
  const sessionId = await getSignedCookie(c, secret, "sessionId");

  if (!sessionId) {
    console.log("No session ID found");
    return null;
  }
  deleteCookie(c, "sessionId", {
    path: "/",
  });
  const kv = await openKv();
  await kv.delete(["sessions", sessionId]);
};

const getUserFromSession = async (c) => {
  const sessionId = await getSignedCookie(c, secret, "sessionId");
  if (!sessionId) {
    console.log("No session ID found");
    return null;
  }
  const kv = await openKv();
  const result = await kv.get(["sessions", sessionId]);
  const userObject = result?.value ?? null;
  if (!userObject || !userObject.user) {
    return null;
  }

  // Reset the session expiration time
  await kv.set(["sessions", sessionId], userObject, {
    expireIn: WEEK_IN_MILLISECONDS,
  });

  return userObject;
};

export { createSession, deleteSession, getUserFromSession };
