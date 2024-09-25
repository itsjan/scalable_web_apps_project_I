export { connect } from "https://deno.land/x/redis@v0.31.0/mod.ts";

let client;

export const getRedisClient = async () => {
  if (!client) {
    // In a Docker container, we typically use the service name defined in docker-compose.yml
    // instead of 'localhost'. For example, if the Redis service is named 'redis':
    // client = await connect({ hostname: "redis", port: 6379 });

    // However, for local development outside of Docker, we keep the localhost configuration:
    client = await connect({ hostname: "redis", port: 6379 });
  }
  return client;
};
