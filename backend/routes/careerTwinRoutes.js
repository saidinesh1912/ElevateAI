
const express = require("express");
const multer = require("multer");

const verifyToken = require("../middleware/verifyToken");

const {
  analyzeCareerTwin,
  getCareerTwinHistory,
} = require("../controllers/careerTwinController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
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

// Retrieve logged-in student's Career Twin history
router.get(
  "/history",
  verifyToken,
  getCareerTwinHistory
);

// Upload resume and generate career matches
router.post(
  "/analyze",
  verifyToken,
  upload.single("resume"),
  analyzeCareerTwin
);

module.exports = router;

