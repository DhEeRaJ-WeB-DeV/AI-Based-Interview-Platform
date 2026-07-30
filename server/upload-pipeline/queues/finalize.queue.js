const { Queue } = require("bullmq");
const createRedisConnection = require("../../src/config/redis");

const finalizeQueue = new Queue(
  "finalize",
  {
   connection: createRedisConnection(),
  }
);

module.exports = finalizeQueue;