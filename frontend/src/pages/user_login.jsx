import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authcontext.jsx";
import "../styles/userLogin.css";
import ForgotPassword from "./ForgotPassword";

function UserLogin({ close, showSignup }) {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ email, password, userType });
      const response = await fetch(`http://localhost:5000/auth/validate?${params}`, {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setUser(data);
        close();
        if (data.userType === "owner") {
          navigate('/owner/dashboard');
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    close();
    showSignup();
  };

  // Show forgot password modal
  if (showForgot) {
    return (
      <ForgotPassword
        close={close}
        showLogin={() => setShowForgot(false)}
      />
    );
  }

  return (
    <div className="login-modal-container">
      <button className="close-btn" onClick={close}>×</button>

      <div className="login-left">
        <h1>Welcome to Courtify</h1>
        <p>
          {userType === 'player'
            ? "Book sports venues instantly. Fast, simple, reliable."
            : "Manage your sports facilities efficiently. Grow your business."
          }
        </p>
      </div>

      <div className="login-right">
        <h2>Login to Courtify</h2>

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

        <form onSubmit={login} className="login-form">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="remember-row">
            <label className="label">
              <input type="checkbox" />
              Remember me
            </label>
            <span
              className="forgot"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </span>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn login-submit" type="submit">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="signup-link">
          <p>Don't have an account? <span onClick={handleSignupClick}>Sign up</span></p>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
