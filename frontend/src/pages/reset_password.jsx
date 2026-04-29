import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/userLogin.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password has been reset successfully. You can now log in.");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password.");
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
        <h1>New Password</h1>
        <p>Set up your new password to regain access.</p>
      </div>

      <div className="login-right">
        <h2>Enter New Password</h2>

        <form onSubmit={handleResetPassword} className="login-form">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="6"
          />

          {error && <p className="error" style={{ color: "red" }}>{error}</p>}
          {message && <p className="success" style={{ color: "green" }}>{message}</p>}

          <button className="btn login-submit" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
