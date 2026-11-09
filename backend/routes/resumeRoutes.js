
const express = require("express");
const multer = require("multer");

const verifyToken = require("../middleware/verifyToken");

const {
  analyzeResume,
  getResumeAnalyses,
} = require("../controllers/resumeController");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Only PDF and DOCX files are supported."));
    }
  },
});

// Retrieve the logged-in student's saved analyses
router.get(
  "/history",
  verifyToken,
  getResumeAnalyses
);

// Upload and analyze a resume
router.post(
  "/analyze",
  verifyToken,
  upload.single("resume"),
  analyzeResume
);

module.exports = router;
