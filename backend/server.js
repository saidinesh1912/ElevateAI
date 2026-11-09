
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

// Import routes
const userRoutes = require("./routes/userRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const careerTwinRoutes = require("./routes/careerTwinRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Elevate AI Backend is running!",
  });
});

// PostgreSQL connection test
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "PostgreSQL connected successfully!",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "PostgreSQL connection failed",
    });
  }
});

// Student profile routes
app.use("/api/users", userRoutes);

// Resume and hidden skill discovery routes
app.use("/api/resume", resumeRoutes);
// Career Digital Twin routes
app.use("/api/career-twin", careerTwinRoutes);
// Handle Multer upload errors
app.use((error, req, res, next) => {
  if (error instanceof require("multer").MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "File size must not exceed 5 MB."
          : error.message,
    });
  }

  if (error.message === "Only PDF and DOCX files are supported.") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Server error:", error.message);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Elevate AI Backend running on port ${PORT}`);
});
