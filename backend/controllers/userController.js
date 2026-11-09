
const pool = require("../config/db");

// Create or update authenticated student's profile
const saveProfile = async (req, res) => {
  try {
    const { uid, email } = req.user;

    const {
      full_name,
      college,
      branch,
      graduation_year,
    } = req.body;

    const name = full_name?.trim();

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const year =
      graduation_year === undefined ||
      graduation_year === null ||
      graduation_year === ""
        ? null
        : Number(graduation_year);

    if (
      year !== null &&
      (!Number.isInteger(year) || year < 2000 || year > 2100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid graduation year",
      });
    }

    const query = `
      INSERT INTO users (
        firebase_uid,
        full_name,
        email,
        college,
        branch,
        graduation_year
      )
      VALUES ($1, $2, $3, $4, $5, $6)

      ON CONFLICT (firebase_uid)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        college = COALESCE(EXCLUDED.college, users.college),
        branch = COALESCE(EXCLUDED.branch, users.branch),
        graduation_year = COALESCE(
          EXCLUDED.graduation_year,
          users.graduation_year
        ),
        updated_at = CURRENT_TIMESTAMP

      RETURNING *;
    `;

    const values = [
      uid,
      name,
      email,
      college || null,
      branch || null,
      year,
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      message: "Student profile saved successfully",
      profile: result.rows[0],
    });

  } catch (error) {
    console.error("Profile save error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save student profile",
    });
  }
};

// Retrieve only the authenticated student's profile
const getMyProfile = async (req, res) => {
  try {
    const { uid } = req.user;

    const query = `
      SELECT
        id,
        firebase_uid,
        full_name,
        email,
        college,
        branch,
        graduation_year,
        created_at,
        updated_at
      FROM users
      WHERE firebase_uid = $1;
    `;

    const result = await pool.query(query, [uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      profile: result.rows[0],
    });

  } catch (error) {
    console.error("Profile retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve student profile",
    });
  }
};

module.exports = {
  saveProfile,
  getMyProfile,
};
