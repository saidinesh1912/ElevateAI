
const pool = require("../config/db");

// Analyze uploaded resume and save results
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF or DOCX resume.",
      });
    }

    // Identify authenticated student
    const userResult = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = $1",
      [req.user.uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Please save your profile first.",
      });
    }

    const userId = userResult.rows[0].id;

    // Forward resume to Python NLP service
    const formData = new FormData();

    const resumeBlob = new Blob([req.file.buffer], {
      type: req.file.mimetype,
    });

    formData.append("file", resumeBlob, req.file.originalname);

    const pythonUrl =
      process.env.NLP_SERVICE_URL || "http://127.0.0.1:8000";

    const pythonResponse = await fetch(
      `${pythonUrl}/api/analyze-resume`,
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(120000),
      }
    );

    const analysisResult = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return res.status(pythonResponse.status).json({
        success: false,
        message:
          analysisResult.detail || "Resume analysis failed.",
      });
    }

    // Save results against the authenticated student's database ID
    const saveResult = await pool.query(
      `INSERT INTO resume_analyses (
        user_id,
        filename,
        projects_analyzed,
        total_unique_skills,
        analysis_result
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, filename, projects_analyzed,
                total_unique_skills, created_at`,
      [
        userId,
        req.file.originalname,
        analysisResult.projects_analyzed,
        analysisResult.total_unique_skills,
        JSON.stringify(analysisResult),
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Resume analyzed and results saved successfully.",
      analysis: saveResult.rows[0],
      results: analysisResult,
    });
  } catch (error) {
    console.error("Resume analysis error:", error.message);

    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      return res.status(504).json({
        success: false,
        message: "Resume analysis timed out. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to analyze resume. Please try again.",
    });
  }
};

// Retrieve only the authenticated student's saved analyses
const getResumeAnalyses = async (req, res) => {
  try {
    // Resolve the database user from the verified Firebase UID
    const userResult = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = $1",
      [req.user.uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    const userId = userResult.rows[0].id;

    // Never retrieve records belonging to another student
    const result = await pool.query(
      `SELECT
         id,
         filename,
         projects_analyzed,
         total_unique_skills,
         analysis_result,
         created_at
       FROM resume_analyses
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      analyses: result.rows,
    });
  } catch (error) {
    console.error("Resume history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your resume analyses.",
    });
  }
};

module.exports = {
  analyzeResume,
  getResumeAnalyses,
};
