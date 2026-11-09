
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Load Firebase service account credentials
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Render environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Invalid Firebase service account JSON:", error.message);
    throw error;
  }
} else {
  // Local development: service account JSON file
  serviceAccount = require("../serviceAccountKey.json");
}

// Initialize Firebase only once
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });

  console.log("Firebase Admin initialized successfully");
}

const auth = getAuth();

module.exports = { auth };
