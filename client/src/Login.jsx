import { useState } from "react";
import { motion } from "framer-motion";
import Verify from "./Verify";
import ForgotPassword from "./ForgotPassword";
import { validateEmail, validatePassword, validateUsername } from "./utils/validation";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ═══ VALIDATION ═══
    if (isSignup) {
      // Validate username
      if (!form.username || form.username.trim().length === 0) {
        setError("Username is required");
        return;
      }
      if (!validateUsername(form.username)) {
        setError("Username must be 3+ characters (letters, numbers, underscore only)");
        return;
      }

      // Validate email
      if (!form.email || form.email.trim().length === 0) {
        setError("Email is required");
        return;
      }
      if (!validateEmail(form.email)) {
        setError("Invalid email format");
        return;
      }

      // Validate password
      if (!form.password || form.password.length === 0) {
        setError("Password is required");
        return;
      }
      if (!validatePassword(form.password)) {
        setError("Password must be at least 6 characters");
        return;
      }

      // Validate confirm password
      if (!form.confirmPassword || form.confirmPassword.length === 0) {
        setError("Please confirm your password");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    } else {
      // Login validation
      if (!form.email || form.email.trim().length === 0) {
        setError("Email is required");
        return;
      }
      if (!validateEmail(form.email)) {
        setError("Invalid email format");
        return;
      }

      if (!form.password || form.password.length === 0) {
        setError("Password is required");
        return;
      }
    }

    // ═══ API CALL ═══
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-xrxj.onrender.com';
      const endpoint = isSignup 
        ? `${API_URL}/api/auth/signup` 
        : `${API_URL}/api/auth/login`;
      
      const payload = isSignup
        ? {
            username: form.username.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            confirmPassword: form.confirmPassword
          }
        : {
            email: form.email.trim().toLowerCase(),
            password: form.password
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          setVerifyEmail(data.email || form.email);
          setNeedsVerification(true);
        } else {
          setError(data.message || "Authentication failed");
        }
        setLoading(false);
        return;
      }

      if (isSignup && data.needsVerification) {
        setVerifyEmail(form.email);
        setNeedsVerification(true);
      } else {
        // Store JWT token for authenticated API calls
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('authUsername', data.username);
        }
        onLoginSuccess(data.username);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPassword 
        onBack={() => setShowForgotPassword(false)}
        onSuccess={() => {
          setShowForgotPassword(false);
          setIsSignup(false);
        }}
      />
    );
  }

  if (needsVerification) {
    return <Verify email={verifyEmail} onVerifySuccess={onLoginSuccess} />;
  }

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
          <h1 className="login-title">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="login-subtitle">
            {isSignup
              ? "Join us to track your expenses"
              : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username (3+ chars)"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}>
              ⚠️ {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : isSignup
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {!isSignup && (
          <div style={{textAlign: 'center', marginBottom: '10px'}}>
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}>
              Forgot Password?
            </button>
          </div>
        )}

        <div className="login-toggle">
          <span>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setIsSignup(!isSignup);
              setForm({
                username: "",
                email: "",
                password: "",
                confirmPassword: ""
              });
              setError("");
            }}
            disabled={loading}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}