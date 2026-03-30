import React, { useState } from "react";
import "../styles/userLogin.css";

const formatPhoneNumber = (value) => {
  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, "");

  // Ensure it starts with +92
  if (!cleaned.startsWith("+92")) {
    cleaned = "+92" + cleaned.replace(/^\+?/, "");
  }

  // Add spaces after 3 and 6 digits following +92
  // +92 300 1234567
  if (cleaned.length > 3) {
    cleaned = cleaned.slice(0, 3) + " " + cleaned.slice(3);
  }
  if (cleaned.length > 7) {
    cleaned = cleaned.slice(0, 7) + " " + cleaned.slice(7, 15);
  }

  // Limit length to max 14 chars (+92 xxx xxxxxxx)
  return cleaned.slice(0, 15);
};

function UserSignup({ close, showLogin }) {
  // States for form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType , setUserType] = useState("player"); // owner or player
  const [loading, setLoading] = useState(false);

  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  // Pakistan phone number regex: +92 xxx xxxxxxx
  const validatePhone = (number) => {
    const regex = /^\+92\s\d{3}\s\d{7}$/;
    return regex.test(number);
  };

  const handleLoginClick = () => {
    close(); // Close signup modal
    showLogin(); // Open login modal
  };

  const signup = async (e) => {
    e.preventDefault();
    setError("");

    // Validate phone
    if (!validatePhone(phone)) {
      setPhoneError("Phone number must be in format +92 xxx xxxxxxx");
      return;
    } else {
      setPhoneError("");
    }

    // Validate password length
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    } else {
      setPasswordError("");
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          phone,
          userType
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        console.log("Signup successful:", data);
        close();
        showLogin();

        if (data.userType == "owner") {
          // redirect or show owner options on navbar
        }

      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-container">
      <button className="close-btn" onClick={close}>×</button>

      <div className="login-left">
        <h1>Join Courtify Today</h1>
        <p>
          {userType === 'player' 
            ? "Create your account and start booking sports venues instantly. Fast, simple, reliable."
            : "Register your sports facility and start managing bookings efficiently. Grow your business with Courtify."
          }
        </p>
      </div>

      <div className="login-right">
        <h2>Create Account</h2>

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

        <form onSubmit={signup} className="login-form">
          <input
            type="text"
            value={fullName}
            placeholder="Full Name"
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="text"
            value={phone}
            placeholder="Phone (+92 xxx xxxxxxx)"
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            required
          />
          {phoneError && <p className="error">{phoneError}</p>}

          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {passwordError && <p className="error">{passwordError}</p>}

          {error && <p className="error">{error}</p>}

          <button className="btn login-submit" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login link */}
        <div className="signup-link">
          <p>Already have an account? <span onClick={handleLoginClick}>Log in</span></p>
        </div>
      </div>
    </div>
  );
}

export default UserSignup;