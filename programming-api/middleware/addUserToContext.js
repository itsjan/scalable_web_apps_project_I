import * as sessionService from "../services/sessionService";

const addUserToContextMiddleware = async (c, next) => {
  c.user = await sessionService.getUserFromSession(c);
  await next();
};

export { addUserToContextMiddleware };
