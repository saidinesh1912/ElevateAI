
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import { auth } from "../../services/firebase";
import { saveUserProfile } from "../../services/api";

import AuthLayout from "../../components/AuthLayout";

import {
  Eye,
  EyeOff,
  ArrowRight,
  UserRound,
} from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    branch: "",
    graduationYear: "2027",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // Email and password signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Firebase account
      const credential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      // Step 2: Update Firebase display name
      await updateProfile(credential.user, {
        displayName: form.name.trim(),
      });

      // Step 3: Save profile in PostgreSQL
      await saveUserProfile({
        full_name: form.name.trim(),
        college: form.college.trim(),
        branch: form.branch,
        graduation_year: Number(form.graduationYear),
      });

      // Step 4: Navigate to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Signup error:", err);

      const messages = {
        "auth/email-already-in-use":
          "This email is already registered.",

        "auth/invalid-email":
          "Please enter a valid email address.",

        "auth/weak-password":
          "Please choose a stronger password.",

        "auth/network-request-failed":
          "Network error. Please check your internet connection.",
      };

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Account created, but profile could not be saved. Please try signing in again."
        );
      } else {
        setError(messages[err.code] || err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  // Google signup
  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      // Step 1: Authenticate using Google
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      // Step 2: Save Google user's profile in PostgreSQL
      await saveUserProfile({
        full_name: result.user.displayName || "",
        college: null,
        branch: null,
        graduation_year: null,
      });

      // Step 3: Navigate to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Google signup error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Unable to save your profile. Please try again."
        );
      } else {
        setError(err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="signup">
      <div className="auth-card signup-card">

        <div className="form-heading">
          <span className="form-eyebrow">
            GET STARTED
          </span>

          <h2>Create your account</h2>

          <p>
            Start discovering your professional potential.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>

          <label>Full name</label>

          <div className="input-box">
            <UserRound size={18} />

            <input
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <label>Email address</label>

          <div className="input-box">
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <label>College / University</label>

          <input
            className="plain-input"
            name="college"
            placeholder="Enter your college name"
            value={form.college}
            onChange={handleChange}
            required
          />

          <div className="form-grid">

            <div>
              <label>Branch</label>

              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                required
              >
                <option value="">Select branch</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label>Graduation year</label>

              <select
                name="graduationYear"
                value={form.graduationYear}
                onChange={handleChange}
              >
                {[2026, 2027, 2028, 2029, 2030, 2031].map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>

          <label>Password</label>

          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="icon-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <label>Confirm password</label>

          <div className="input-box">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="icon-button"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="primary-auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR SIGN UP WITH</span>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        <p className="auth-switch">
          Already have an account?
          <Link to="/login"> Sign in</Link>
        </p>

      </div>
    </AuthLayout>
  );
}

// Google icon
function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />

      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.23 5.6c4.22-3.9 7.53-9.66 7.53-17.25z"
      />

      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.28-3.12.78-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
      />

      <path
        fill="#34A853"
        d="M24 48c6.47 0 11.9-2.13 15.86-6.2l-7.23-5.6c-2 1.35-4.55 2.15-8.63 2.15-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default Signup;
