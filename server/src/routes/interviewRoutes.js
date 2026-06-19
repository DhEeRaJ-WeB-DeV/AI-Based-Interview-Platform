const express  = require('express');
const router   = express.Router();
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

const {
startInterview,
  getNextQuestion,
  saveAnswer,
  submitInterview,
  getResult,
  uploadRecording
} = require('../controllers/interviewController');

const recordingUpload = require("../middlewares/recordingMiddleware");

router.post("/upload-recording",recordingUpload.single("video"),uploadRecording);

router.post('/start-interview',authMiddleware, roleMiddleware('candidate'), startInterview);

router.get ('/:id/question',authMiddleware, roleMiddleware('candidate'), getNextQuestion);

router.post('/:id/answer',authMiddleware, roleMiddleware('candidate'), saveAnswer);

router.post('/:id/submit',authMiddleware, roleMiddleware('candidate'), submitInterview);

router.get ('/:interviewId/result',authMiddleware,roleMiddleware("recruiter"), getResult);


module.exports = router;