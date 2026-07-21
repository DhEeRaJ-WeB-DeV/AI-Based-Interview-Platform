const express = require("express");
const router  = express.Router();

const {
  createInterviewPost,
  Can_getDashboardPosts,
  Rec_getDashboardPosts,
  deleteInterviewPost,
  selectInterviewSlot
} = require("../controllers/interviewPostController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Recruiter — post a new interview
router.post("/post", authMiddleware, roleMiddleware("recruiter"), createInterviewPost);

// Candidate — see all available interviews on dashboard
router.get("/dashboard", authMiddleware, roleMiddleware("candidate"), Can_getDashboardPosts);

// Recruiter — see all available interviews on dashboard
router.get("/my-posts", authMiddleware, roleMiddleware("recruiter"), Rec_getDashboardPosts);

// Candidate — confirm their chosen time slot
router.post("/:postId/select-slot", authMiddleware, roleMiddleware("candidate"), selectInterviewSlot);

// // // Candidate — get full details of one interview before attending
// router.get("/:postId", authMiddleware, roleMiddleware("candidate"), getInterviewPostById);

// Recruiter - delete the post they made 
router.delete("/:postId", authMiddleware, roleMiddleware("recruiter"), deleteInterviewPost);

module.exports = router;