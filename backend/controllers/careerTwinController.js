
const pool = require("../config/db");

// ==========================================
// 1. ANALYZE CAREER TWIN
// ==========================================

const analyzeCareerTwin = async (req, res) => {
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

    // Forward resume to Python Career Twin API
    const formData = new FormData();

    const resumeBlob = new Blob([req.file.buffer], {
      type: req.file.mimetype,
    });

    formData.append("file", resumeBlob, req.file.originalname);

    const pythonUrl =
      process.env.CAREER_TWIN_SERVICE_URL ||
      "http://127.0.0.1:8001";

    const pythonResponse = await fetch(
      `${pythonUrl}/api/career-twin/analyze`,
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
        message: analysisResult.detail || "Career analysis failed.",
      });
    }

    const identifiedSkills = analysisResult.identified_skills || [];
    const careerMatches = analysisResult.career_matches;

    if (!Array.isArray(careerMatches) || careerMatches.length === 0) {
      return res.status(502).json({
        success: false,
        message: "No career matches were generated.",
      });
    }

    // Save results in PostgreSQL
    const saveResult = await pool.query(
      `INSERT INTO career_twin_analyses (
        user_id,
        filename,
        identified_skills,
        career_matches,
        analysis_result
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        filename,
        identified_skills,
        career_matches,
        created_at`,
      [
        userId,
        req.file.originalname,
        JSON.stringify(identifiedSkills),
        JSON.stringify(careerMatches),
        JSON.stringify(analysisResult),
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Career Twin analysis completed and saved successfully.",
      analysis: saveResult.rows[0],
    });

  } catch (error) {
    console.error("Career Twin analysis error:", error.message);

    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      return res.status(504).json({
        success: false,
        message: "Career analysis timed out. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to complete Career Twin analysis.",
    });
  }
};


// ==========================================
// 2. GET CAREER TWIN HISTORY
// ==========================================

const getCareerTwinHistory = async (req, res) => {
  try {
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

    const result = await pool.query(
      `SELECT
        id,
        filename,
        identified_skills,
        career_matches,
        analysis_result,
        created_at
      FROM career_twin_analyses
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
    console.error("Career Twin history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve Career Twin history.",
    });
  }
};

module.exports = {
  analyzeCareerTwin,
  getCareerTwinHistory,
};
