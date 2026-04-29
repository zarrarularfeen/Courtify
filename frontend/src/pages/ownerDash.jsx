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
  const [stats, setStats] = useState({
    totalFacilities: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0
  });

  const facilitiesSectionRef = useRef(null);

  // Redirect if not owner
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (!isOwner()) {
      navigate('/');
      return;
    }
    
    // Fetch owner data
    fetchOwnerData();
  }, [user, isOwner, navigate]);

  const fetchOwnerData = async () => {
    try {
      if (!user?.userId) return;

      // Fetch Facilities
      const facilitiesRes = await fetch(`http://localhost:5000/owner/arenas?ownerId=${user.userId}`);
      const facilitiesData = await facilitiesRes.json();

      // Fetch Bookings
      const bookingsRes = await fetch(`http://localhost:5000/owner/bookings?ownerId=${user.userId}`);
      const bookingsData = await bookingsRes.json();

      if (facilitiesRes.ok && bookingsRes.ok) {
        setFacilities(facilitiesData);

        // Calculate Stats
        const totalFacilities = facilitiesData.length;
        
        // Filter today's bookings
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookingsData.filter(b => b.bookingDate && b.bookingDate.startsWith(today)).length;

        // Calculate monthly revenue
        const currentMonth = new Date().getMonth();
        const monthlyRevenue = bookingsData
          .filter(b => b.bookingDate && new Date(b.bookingDate).getMonth() === currentMonth)
          .reduce((sum, b) => sum + parseFloat(b.revenue || 0), 0);

        const pendingApprovals = bookingsData.filter(b => b.status === 'pending').length;

        setStats({
          totalFacilities,
          todayBookings,
          monthlyRevenue,
          pendingApprovals
        });
      }
    } catch (error) {
      console.error("Error fetching owner data:", error);
    }
  };

  const scrollToFacilities = () => {
    if (facilitiesSectionRef.current) {
      facilitiesSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar user={user} />

      <section className="hero-section">
        <div className="hero-left">
          <h1>Manage Your Sports Facility</h1>
          <p>Track bookings, manage arenas, and grow your business with Courtify.</p>
        </div>
        <div className="hero-right">
          <img src={Logo} alt="Sports Banner" />
        </div>
      </section>

      <div className="owner-dashboard-content" style={{ padding: '2rem 5%' }}>
        <div className="dashboard-header">
          <h1>Business Dashboard</h1>
          <p>Overview of your performance</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <h3>Total Facilities</h3>
            <p className="stat-number">{stats.totalFacilities}</p>
            <span className="stat-label">Registered venues</span>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <h3>Today's Bookings</h3>
            <p className="stat-number">{stats.todayBookings}</p>
            <span className="stat-label">Sessions booked</span>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <h3>Monthly Revenue</h3>
            <p className="stat-number">PKR {stats.monthlyRevenue.toLocaleString()}</p>
            <span className="stat-label">This month</span>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <h3>Pending</h3>
            <p className="stat-number">{stats.pendingApprovals}</p>
            <span className="stat-label">Approvals needed</span>
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

        {/* Recent Facilities */}
        <div className="recent-facilities" ref={facilitiesSectionRef} style={{ marginTop: '3rem' }}>
          <div className="section-header">
            <h2>Your Facilities</h2>
            <button 
              className="btn-text btn"
              onClick={() => navigate('/owner/facilities')}
            >
              View All →
            </button>
          </div>
          
          {facilities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>No facilities registered yet</h3>
              <p>Start by registering your first sports facility to get bookings</p>
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
                  <div className="facility-actions">
                    <button className="btn-small btn">View Details</button>
                    <button className="btn-small outline btn">Edit</button>
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