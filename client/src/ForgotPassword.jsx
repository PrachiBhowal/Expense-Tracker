import { useState } from "react";
import { motion } from "framer-motion";
import "./Login.css";

export default function ForgotPassword({ onBack, onSuccess }) {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Step 1: Send reset code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-xrxj.onrender.com';
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send reset code");
        setLoading(false);
        return;
      }

      setStep(2);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-xrxj.onrender.com';
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Password reset failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg" />

      <motion.div
        className="login-card"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <div className="login-header">
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">
            {step === 1
              ? "Enter your email to receive a reset code"
              : "Enter the code and your new password"}
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", color: "#34c77b", padding: "20px" }}>
            <div style={{ fontSize: "28px", marginBottom: "10px" }}>✓</div>
            Password reset successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={step === 1 ? handleSendCode : handleResetPassword} className="login-form">
            {step === 1 && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label>Reset Code (6 digits)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    required
                    style={{ fontSize: "24px", letterSpacing: "10px", textAlign: "center" }}
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading
                ? "Loading..."
                : step === 1
                ? "Send Reset Code"
                : "Reset Password"}
            </button>
          </form>
        )}

        <div className="login-toggle">
          <button
            type="button"
            className="toggle-btn"
            onClick={onBack}
            style={{ textDecoration: "underline" }}>
            ← Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}