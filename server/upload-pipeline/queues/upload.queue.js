const { Queue } = require("bullmq");
const createRedisConnection = require("../../src/config/redis");

const uploadQueue = new Queue("upload-video", {
  createRedisConnection,
});

module.exports = uploadQueue;