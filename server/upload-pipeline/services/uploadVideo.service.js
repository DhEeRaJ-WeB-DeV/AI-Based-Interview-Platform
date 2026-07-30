const fs = require("fs/promises");
const finalizeQueue = require("../queues/finalize.queue");
const cloudinary = require("../../src/config/cloudinary");
const Interview = require("../../src/models/Interview");

const uploadVideo = async (interviewId, questionId) => {
  const interview = await Interview.findById(interviewId);

  if (!interview) {
    throw new Error("Interview not found");
  }

  const question = interview.questions.id(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  // Already uploaded
  if (question.uploadStatus === "uploaded") {
    return;
  }

  // No local file available
  if (!question.localRecordingPath) {
    throw new Error("Local recording not found");
  }

  question.uploadStatus = "uploading";
  await interview.save();

  try {
    const result = await cloudinary.uploader.upload(
      question.localRecordingPath,
      {
        resource_type: "video",
        folder: "interview_recordings",
      }
    );

    question.recordingUrl = result.secure_url;
    question.uploadStatus = "uploaded";
    question.uploadedAt = new Date();

    // Delete local file
    await fs.unlink(question.localRecordingPath);

    question.localRecordingPath = null;

    await interview.save();

    console.log(
      `Uploaded question ${question.orderIndex} successfully`
    );


  const latestInterview =
    await Interview.findById(interviewId);

const allUploaded =
    latestInterview.questions.every(
        q => q.uploadStatus === "uploaded"
    );

    console.log("Status:", interview.status);
console.log(
  interview.questions.map(q => ({
    order: q.orderIndex,
    uploadStatus: q.uploadStatus,
  }))
);

console.log("alluploaded:", allUploaded)

    if (
      allUploaded &&
      interview.status === "processing"
    ) {

      await finalizeQueue.add(
        "finalize",
        {
          interviewId: interview._id,
        },
        {
          jobId: `finalize-${interview._id}`,
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

    }
  } catch (err) {
    question.uploadStatus = "failed";
    question.uploadAttempts += 1;

    await interview.save();

    throw err;
  }
};

module.exports = uploadVideo;