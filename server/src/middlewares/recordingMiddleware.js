// middlewares/recordingUpload.js

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/recordings/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `recording-${Date.now()}${path.extname(file.originalname) || ".webm"}`
    );
  },
});

module.exports = multer({ storage });