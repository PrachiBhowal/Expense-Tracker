import { useState } from "react";
import { motion } from "framer-motion";
import "./Login.css";

export default function Verify({ email, onVerifySuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-xrxj.onrender.com';
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => onVerifySuccess(), 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg" />

      <motion.div className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>
        <div className="login-header">
          <h1 className="login-title">Verify Your Email</h1>
          <p className="login-subtitle">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        {success ? (
          <div style={{textAlign: 'center', color: '#34c77b', padding: '20px'}}>
            <div style={{fontSize: '28px', marginBottom: '10px'}}>✓</div>
            Email verified! Logging you in...
          </div>
        ) : (
          <form onSubmit={handleVerify} className="login-form">
            <div className="form-group">
              <label>6-Digit Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                required
                style={{fontSize: '24px', letterSpacing: '10px', textAlign: 'center'}}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}