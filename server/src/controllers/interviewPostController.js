const InterviewPost = require("../models/interviewpost");
const User = require("../models/User");

// ─────────────────────────────────────────────
// POST /api/interviews/post
// Recruiter submits the form
// ─────────────────────────────────────────────
const createInterviewPost = async (req, res) => {
  try {
    const {
      roundName,
      role,
      jd,
      skills,
      candidateType,
      minExperience,
      maxExperience,
      difficulty,
      questions,
      followUps,
      adaptive,
      Email,
    } = req.body;

    if (!roundName || !role) {
      return res.status(400).json({ message: "Round name and role are required." });
    }

    const skillsArray = skills
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const post = await InterviewPost.create({
      roundName,
      role,
      jobDescription: jd || "",
      skills: skillsArray,
      candidateType,
      minExperience: candidateType === "experienced" ? Number(minExperience) : null,
      maxExperience: candidateType === "experienced" ? Number(maxExperience) : null,
      difficulty,
      numberOfQuestions: Number(questions) || 10,
      followUps,
      adaptive,
      candidateEmail: Email || null,
      postedBy: req.user.id,
    });

    res.status(201).json({
      message: "Interview posted successfully.",
      postId: post._id,
      expiresAt: post.expiresAt,
    });
  } catch (err) {
    console.error("createInterviewPost error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// GET /api/interviews/dashboard
// Candidate sees all active posts meant for them
// ─────────────────────────────────────────────
const getDashboardPosts = async (req, res) => {
  try {
    // Step 1 — get email from DB using id from token
    const user = await User.findById(req.user.id).select("email");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Step 2 — use that email to filter posts
    const posts = await InterviewPost.find({
      status: "active",
      expiresAt: { $gt: new Date() },
      candidateEmail: user.email,
    })
      .select("roundName role skills candidateType minExperience maxExperience difficulty numberOfQuestions expiresAt")
      .sort({ createdAt: -1 });

    console.log("the fetched data from db:", posts);
    return res.status(200).json({ posts });

  } catch (err) {
    console.error("getDashboardPosts error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// GET /api/interviews/:postId
// Candidate fetches full post before starting interview
// ─────────────────────────────────────────────
const getInterviewPostById = async (req, res) => {
  try {
    const post = await InterviewPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Interview not found or has expired." });
    }

    if (post.status !== "active" || post.expiresAt < new Date()) {
      return res.status(410).json({ message: "This interview is no longer available." });
    }

    if (post.candidateEmail && post.candidateEmail !== req.user.email) {
      return res.status(403).json({ message: "This interview is not meant for you." });
    }

    res.status(200).json({ post });
  } catch (err) {
    console.error("getInterviewPostById error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/interviews/:postId/cancel
// Recruiter cancels a post early
// ─────────────────────────────────────────────
const cancelInterviewPost = async (req, res) => {
  try {
    const post = await InterviewPost.findOne({
      _id: req.params.postId,
      postedBy: req.user.id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.status = "cancelled";
    await post.save();

    res.status(200).json({ message: "Interview post cancelled." });
  } catch (err) {
    console.error("cancelInterviewPost error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// Call this when candidate completes the interview
const completeInterviewPost = async (req, res) => {
  try {
    const post = await InterviewPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.status = "completed";
    post.expiresAt = undefined; // ← removes the field → TTL ignores this document now
    await post.save();

    res.status(200).json({ message: "Interview marked as completed." });
  } catch (err) {
    console.error("completeInterviewPost error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  createInterviewPost,
  getDashboardPosts,
  getInterviewPostById,
  cancelInterviewPost,
  completeInterviewPost
};