// pages/OwnerDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Authcontext.jsx";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/NavBar";
import "../styles/ownerDash.css";
import "../styles/global.css";
import "../styles/dashboard.css";
import Logo from '../assets/logo.png';

export default function OwnerDash() {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const facilitiesSectionRef = useRef(null);

  useEffect(() => {
    if (!user || !isOwner()) {
      navigate('/');
      return;
    }
    fetchOwnerData();
  }, [user, isOwner, navigate]);

  const fetchOwnerData = async () => {
    try {
      if (!user?.userId) return;
      const facilitiesRes = await fetch(`http://localhost:5000/owner/arenas?ownerId=${user.userId}`);
      const facilitiesData = await facilitiesRes.json();
      if (facilitiesRes.ok) setFacilities(facilitiesData);
    } catch (error) {
      console.error("Error fetching owner data:", error);
    }
  };

  const scrollToFacilities = () => {
    facilitiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar user={user} />

      <section className="hero-section">
        <div className="hero-left">
          <h1>Manage Your Sports Facility</h1>
          <p>List your courts and reach players across Pakistan with Courtify.</p>
        </div>
        <div className="hero-right">
          <img src={Logo} alt="Sports Banner" />
        </div>
      </section>

      <div className="owner-dashboard-content" style={{ padding: '2rem 5%' }}>
        <div className="dashboard-header">
          <h1>Owner Dashboard</h1>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <h3>Total Facilities</h3>
            <p className="stat-number">{facilities.length}</p>
            <span className="stat-label">Registered venues</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions" style={{ marginTop: '2rem' }}>
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={() => navigate('/owner/register-facility')}
            >
              <span className="action-icon">+</span>
              <div className="action-text">
                <strong>Register New Facility</strong>
                <small>Add a new sports venue</small>
              </div>
            </button>
            <button
              className="action-btn secondary"
              onClick={scrollToFacilities}
            >
              <span className="action-icon">🏢</span>
              <div className="action-text">
                <strong>Manage Facilities</strong>
                <small>View and edit all venues</small>
              </div>
            </button>
          </div>
        </div>

        {/* Facilities List */}
        <div className="recent-facilities" ref={facilitiesSectionRef} style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <h2>Your Facilities</h2>
          </div>

          {facilities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>No facilities registered yet</h3>
              <p>Start by registering your first sports facility</p>
              <button
                className="btn-primary btn"
                onClick={() => navigate('/owner/register-facility')}
              >
                Register Your First Facility
              </button>
            </div>
          ) : (
            <div className="facilities-grid">
              {facilities.map(facility => (
                <div key={facility.id} className={`facility-card ${facility.availability}`}>
                  <div className="facility-header">
                    <h4>{facility.name}</h4>
                    <span className={`status-badge ${facility.availability}`}>
                      {facility.availability}
                    </span>
                  </div>
                  <p className="facility-location">{facility.city}</p>
                  <div className="sports-tags">
                    {Array.isArray(facility.amenities) && facility.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="sport-tag">{amenity}</span>
                    ))}
                  </div>
                  <div className="facility-stats">
                    <div className="stat">
                      <span className="stat-value">PKR {facility.pricePerHour}</span>
                      <span className="stat-label">Per Hour</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}