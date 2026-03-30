import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/userLogin.css";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userType = params.get("type") || "player";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, userType, newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Password reset successfully! You can now log in.");
            } else {
                setError(data.error || "Something went wrong.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <div className="login-modal-container">
                <div className="login-left">
                    <h1>Reset Password</h1>
                    <p>Enter your new password below to regain access to your account.</p>
                </div>
                <div className="login-right">
                    <h2>Set New Password</h2>
                    {message ? (
                        <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px', color: '#2e7d32' }}>
                            <p>{message}</p>
                            <button className="btn login-submit" style={{ marginTop: '1rem' }} onClick={() => navigate("/")}>
                                Go to Home
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="login-form">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {error && <p className="error">{error}</p>}
                            <button className="btn login-submit" type="submit" disabled={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
