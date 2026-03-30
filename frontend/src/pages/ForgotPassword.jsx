import React, { useState } from "react";
import "../styles/userLogin.css";

function ForgotPassword({ close, showLogin }) {
    const [email, setEmail] = useState("");
    const [userType, setUserType] = useState("player");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:5000/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, userType }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("If this email exists, a reset link has been sent. Check your inbox.");
            } else {
                setError(data.error || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-modal-container">
            <button className="close-btn" onClick={close}>×</button>

            <div className="login-left">
                <h1>Forgot Password?</h1>
                <p>Enter your email and we'll send you a link to reset your password.</p>
            </div>

            <div className="login-right">
                <h2>Reset Password</h2>

                <div className="user-type-selector">
                    <button
                        type="button"
                        className={`type-btn ${userType === 'player' ? 'active' : ''}`}
                        onClick={() => setUserType('player')}
                    >Player</button>
                    <button
                        type="button"
                        className={`type-btn ${userType === 'owner' ? 'active' : ''}`}
                        onClick={() => setUserType('owner')}
                    >Owner</button>
                </div>

                {message ? (
                    <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px', color: '#2e7d32', marginTop: '1rem' }}>
                        <p>{message}</p>
                        <button className="btn login-submit" style={{ marginTop: '1rem' }} onClick={() => { close(); showLogin(); }}>
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <input
                            type="email"
                            placeholder="Your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {error && <p className="error">{error}</p>}
                        <button className="btn login-submit" type="submit" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <div className="signup-link" style={{ marginTop: '1rem' }}>
                    <p>Remember your password? <span onClick={() => { close(); showLogin(); }}>Login</span></p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
