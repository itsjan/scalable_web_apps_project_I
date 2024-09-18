import { getUserFromSession } from "../services/auth/sessionService.js";

const addUserToContextMiddleware = async (c, next) => {
  console.log("Debug: Entering addUserToContextMiddleware");
  const userObject = await getUserFromSession(c);

  console.log("Debug: User from session:", userObject);
  console.log("Debug: Userid from session:", userObject.user.userid);

  c.user = userObject.user.userid;
  console.log("Debug: Set c.user to:", c.user);

  await next();
  console.log("Debug: Exiting addUserToContextMiddleware");
};

export default addUserToContextMiddleware;
