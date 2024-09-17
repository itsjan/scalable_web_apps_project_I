const accessControlMiddleware = async (c, next) => {
  const authenticated = c.user;
  if (!authenticated) {
    return c.json({ error: "You have not authenticated!" }, 401);
  }

  await next();
};

export default accessControlMiddleware;
