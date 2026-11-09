
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");

const {
  saveProfile,
  getMyProfile,
} = require("../controllers/userController");

// Save or update authenticated student's profile
router.post("/profile", verifyToken, saveProfile);

// Retrieve only authenticated student's profile
router.get("/profile", verifyToken, getMyProfile);

module.exports = router;
