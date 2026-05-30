import Redis from "ioredis";

let redisClient = null;

export const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    let connectionUrl = process.env.REDIS_URL.trim();
    if (connectionUrl.startsWith("redis-cli -u ")) {
      connectionUrl = connectionUrl.replace("redis-cli -u ", "").trim();
    }

    redisClient = new Redis(connectionUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    redisClient.on("error", (error) => {
      console.warn("Redis unavailable:", error.message);
    });

    redisClient.connect().catch(() => {
      console.warn("Skipping Redis connection for local development");
    });
  }

  return redisClient;
};