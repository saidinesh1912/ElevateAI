
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import { auth } from "../../services/firebase";
import { saveUserProfile } from "../../services/api";

import AuthLayout from "../../components/AuthLayout";

import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email and password login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Set Firebase login persistence
      await setPersistence(
        auth,
        remember
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      // Authenticate user through Firebase
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = credential.user;

      // Synchronize student profile with PostgreSQL
      await saveUserProfile({
        full_name:
          user.displayName ||
          user.email?.split("@")[0] ||
          "Student",
        college: null,
        branch: null,
        graduation_year: null,
      });

      // Redirect after successful synchronization
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Unable to synchronize your profile. Please try again."
        );
      } else {
        const messages = {
          "auth/invalid-credential":
            "Incorrect email or password.",
          "auth/user-disabled":
            "This account has been disabled.",
          "auth/too-many-requests":
            "Too many attempts. Please try again later.",
          "auth/network-request-failed":
            "Network error. Check your internet connection.",
        };

        setError(messages[err.code] || err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // Authenticate through Google
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      // Save or retrieve the student's PostgreSQL profile
      await saveUserProfile({
        full_name:
          user.displayName ||
          user.email?.split("@")[0] ||
          "Student",
        college: null,
        branch: null,
        graduation_year: null,
      });

      // Redirect after successful synchronization
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Google login error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Unable to synchronize your profile. Please try again."
        );
      } else {
        setError(err.message);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">

        <div className="form-heading">
          <span className="form-eyebrow">
            WELCOME BACK
          </span>

          <h2>Sign in to Elevate AI</h2>

          <p>Continue building your future.</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <label>Email address</label>

          <div className="input-box">
            <Mail size={18} />

            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="label-row">
            <label>Password</label>

            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="input-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="icon-button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <label className="remember-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) =>
                setRemember(e.target.checked)
              }
            />

            Remember me
          </label>

          <button
            type="submit"
            className="primary-auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="auth-switch">
          New to Elevate AI?
          <Link to="/signup"> Create an account</Link>
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

export default Login;
