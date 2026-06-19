const mongoose = require("mongoose");

const interviewPostSchema = new mongoose.Schema(
  {
    roundName:        { type: String, required: true },
    role:             { type: String, required: true },
    jobDescription:   { type: String, default: "" },
    skills:           { type: [String], default: [] },

    candidateType:    { type: String, enum: ["fresher", "experienced"], default: "fresher" },
    minExperience:    { type: Number, default: null },
    maxExperience:    { type: Number, default: null },

    difficulty:       { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    numberOfQuestions:{ type: Number, default: 10 },
    followUps:        { type: Boolean, default: true },
    adaptive:         { type: Boolean, default: true },

    candidateEmail:   { type: String, default: null },
    postedBy:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status:           { type: String, enum: ["active", "completed", "deleted"], default: "active" },

    // TTL field — document auto-deletes 2 hours after creation
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// TTL Index — MongoDB deletes the document when current time passes expiresAt
interviewPostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("inter_portal_posts", interviewPostSchema);