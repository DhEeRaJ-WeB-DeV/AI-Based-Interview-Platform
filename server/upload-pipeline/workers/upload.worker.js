const { Worker } = require("bullmq");
const createRedisConnection = require("../../src/config/redis");

const uploadVideo = require("../services/uploadVideo.service");

const uploadWorker = new Worker(
  "upload-video",

  async (job) => {
    const { interviewId, questionId } = job.data;

    console.log(
      `Processing upload for Interview: ${interviewId}, Question: ${questionId}`
    );

    await uploadVideo(interviewId, questionId);
  },

  {
    connection: createRedisConnection(),

    concurrency: 3,
  }
);

uploadWorker.on("completed", (job) => {
  console.log(`Upload job ${job.id} completed`);
});

uploadWorker.on("failed", (job, err) => {
  console.error(
    `Upload job ${job?.id} failed:`,
    err.message
  );

console.error("reason: ",err.data);
});

uploadWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

module.exports = uploadWorker;