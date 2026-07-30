const IORedis = require("ioredis");

const createRedisConnection = () =>
  new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
  });

module.exports = createRedisConnection;