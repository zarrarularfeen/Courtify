import { useNavigate } from "react-router-dom";
import React , { useState } from "react";
import "./navbar.css";
import { useAuth } from "../Authcontext";

import logo from "../logo.png";

const LogoutIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const Navbar = ({ onLoginClick, user }) => {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { isPlayer, isOwner, logout } = useAuth();

  const handleBookingsClick = () => {
    if (!user) {
      // If user is not logged in, show login modal
      onLoginClick();
    } else if (isOwner()) {
      navigate("/owner/dashboard");
    } else if (!isPlayer()) {
      alert("Only players can access bookings page");
    } else {
      navigate("/playerBook");
    }
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      {/* Left section */}
      <div className="nav-left">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <span className="brand">Courtify</span>
      </div>

      {/* Right section */}
      <ul className="nav-right">
        <li onClick={() => navigate(isOwner() ? "/owner/dashboard" : "/")}>Home</li>
        {isOwner() ? (
          <>
             <li onClick={() => navigate("/owner/facilities")}>My Facilities</li>
             <li onClick={() => navigate("/owner/register-facility")}>Add Facility</li>
          </>
        ) : (
          <li onClick={handleBookingsClick}>Bookings</li>
        )}
        <li onClick={() => navigate("/about")}>About</li>
        <div className="separator">|</div>
        {user ? (
          <li className="user-info" onClick={toggleDropdown}>
            <span className="user-icon">👤</span>
            <span className="user-name">{user.name}</span>
            {dropdownOpen && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleLogout}>
                  <LogoutIcon />
                  Logout
                </button>
              </div>
            )}
          </li>
        ) : (
          <button className="btn login-btn" onClick={onLoginClick}>
            Login
          </button>
        )}
      </ul>
    </nav>
  );
};
