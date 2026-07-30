const { Worker } = require("bullmq");

const createRedisConnection = require("../../src/config/redis");

const finalizeInterview = require("../services/finalize.service");

const finalizeWorker = new Worker(
  "finalize",

  async (job) => {

    const { interviewId } = job.data;

    console.log(
      `Finalizing interview ${interviewId}`
    );

    await finalizeInterview(interviewId);

  },

  {
    connection: createRedisConnection(),

    concurrency: 2,
  }
);

finalizeWorker.on("completed", (job) => {

  console.log(
    `Finalize job ${job.id} completed`
  );

});

finalizeWorker.on("failed", (job, err) => {

  console.error(
    `Finalize job ${job?.id} failed`,
    err.message
  );

});

module.exports = finalizeWorker;