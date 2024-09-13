import { connect } from "../deps.js";

const redis = await connect({
  hostname: "redis",
  port: 6379,
});

const cacheMethodCalls = (object, methodsToFlushCacheWith = []) => {
  const handler = {
    get: (module, methodName) => {
      const method = module[methodName];
      return async (...methodArgs) => {
        console.log(`Calling method: ${methodName} with args:`, methodArgs);
        if (methodsToFlushCacheWith.includes(methodName)) {
          console.log(`Flushing cache for method: ${methodName}`);
          await redis.flushdb();
          return await method.apply(this, methodArgs);
        }

        const cacheKey = `${methodName}-${JSON.stringify(methodArgs)}`;
        console.log(`Cache key: ${cacheKey}`);
        const cacheResult = await redis.get(cacheKey);
        if (!cacheResult) {
          console.log(`Cache miss for key: ${cacheKey}`);
          const result = await method.apply(this, methodArgs);
          console.log(`Caching result for key: ${cacheKey}`);
          await redis.set(cacheKey, JSON.stringify(result));
          return result;
        }

        console.log(`Cache hit for key: ${cacheKey}`);
        return JSON.parse(cacheResult);
      };
    },
  };

  return new Proxy(object, handler);
};

export { cacheMethodCalls };
