const accessControlMiddleware = async (c, next) => {
  console.log("Debug: Entering accessControlMiddleware");
  console.log(c);
  if (!c.user) {
    return c.json({ error: "Authentication required" }, 401);
  }
  await next();
};

export default accessControlMiddleware;
