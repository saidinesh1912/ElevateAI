
import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebase";
import AuthLayout from "../../components/AuthLayout";
import { Mail, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("If an account exists for this email, a reset link has been sent.");
    } catch (err) {
      setError("Unable to process the reset request. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="form-heading">
          <span className="form-eyebrow">ACCOUNT RECOVERY</span>
          <h2>Forgot your password?</h2>
          <p>Enter your registered email to request a password reset.</p>
        </div>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleReset}>
          <label>Email address</label>

          <div className="input-box">
            <Mail size={18} />
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className="primary-auth-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/login" className="back-login">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
