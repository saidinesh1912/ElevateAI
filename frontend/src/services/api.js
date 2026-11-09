
import axios from "axios";
import { auth } from "./firebase";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attach Firebase ID token
API.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const token = await user.getIdToken();

  config.headers.Authorization = `Bearer ${token}`;

  return config;
});

// Save or update student profile
export const saveUserProfile = async (profileData) => {
  const response = await API.post("/users/profile", profileData);
  return response.data;
};

// Retrieve currently authenticated student's profile
export const getUserProfile = async () => {
  const response = await API.get("/users/profile");
  return response.data;
};

// Upload resume and discover skills
export const analyzeResume = async (file) => {
  const formData = new FormData();

  formData.append("resume", file);

  const response = await API.post("/resume/analyze", formData);

  return response.data;
};

// Retrieve only the logged-in student's saved resume analyses
export const getResumeAnalyses = async () => {
  const response = await API.get("/resume/history");

  return response.data;
};
// Career Digital Twin - Analyze Resume
export const analyzeCareerTwin = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await API.post(
    "/career-twin/analyze",
    formData
  );

  return response.data;
};

// Career Digital Twin - Get Analysis History
export const getCareerTwinHistory = async () => {
  const response = await API.get(
    "/career-twin/history"
  );

  return response.data;
};
export default API;
