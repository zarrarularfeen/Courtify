import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/userLogin.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("player");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Reset link sent to your email.");
      } else {
        setError(data.error || "Failed to send reset link.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-container" style={{ position: "relative", margin: "100px auto" }}>
      <button className="close-btn" onClick={() => navigate("/")}>×</button>

      <div className="login-left">
        <h1>Forgot Password</h1>
        <p>Enter your email to receive a password reset link.</p>
      </div>

      <div className="login-right">
        <h2>Reset Password</h2>
        
        {/* User Type Selector */}
        <div className="user-type-selector">
          <button 
            type="button"
            className={`type-btn ${userType === 'player' ? 'active' : ''}`}
            onClick={() => setUserType('player')}
          >Player
          </button>
          
          <button 
            type="button"
            className={`type-btn ${userType === 'owner' ? 'active' : ''}`}
            onClick={() => setUserType('owner')}
          >Owner
          </button>
        </div>

        <form onSubmit={handleForgotPassword} className="login-form">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="error" style={{ color: "red" }}>{error}</p>}
          {message && <p className="success" style={{ color: "green" }}>{message}</p>}

          <button className="btn login-submit" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
