const express = require("express");
const router  = express.Router();

const {
  createInterviewPost,
  getDashboardPosts,
  getInterviewPostById,
  cancelInterviewPost,
  completeInterviewPost
} = require("../controllers/interviewPostController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Recruiter — post a new interview
router.post("/post", authMiddleware, roleMiddleware("recruiter"), createInterviewPost);

// Candidate — see all available interviews on dashboard
router.get("/dashboard", authMiddleware, roleMiddleware("candidate"), getDashboardPosts);

// Candidate — get full details of one interview before attending
router.get("/:postId", authMiddleware, roleMiddleware("candidate"), getInterviewPostById);

// Recruiter — cancel a post before it expires
router.patch("/:postId/cancel", authMiddleware, roleMiddleware("recruiter"), cancelInterviewPost);

// Candidate — mark interview as completed
router.patch("/:postId/complete", authMiddleware, roleMiddleware("candidate"), completeInterviewPost);

module.exports = router;