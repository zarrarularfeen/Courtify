import React, { useState, useEffect } from "react";
import { useAuth } from "../Authcontext.jsx";
import { Navbar } from "../components/NavBar";
import UserLogin from "./user_login";
import UserSignup from "./user_signup";
import "../styles/playerBooking.css";
import "../styles/global.css";

function Bookings() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !user.userId) return;

      setLoadingBookings(true);
      setBookingsError("");

      try {
        const res = await fetch(`http://localhost:5000/bookings/${user.userId}`);
        const data = await res.json();

        if (!res.ok) {
          setBookingsError(data.error || "Failed to load bookings");
          setBookings([]);
        } else if (data && data.success) {
          setBookings(data.bookings || []);
        } else {
          // in case backend returns bookings directly
          setBookings(data.bookings || data || []);
        }
      } catch (err) {
        console.error(err);
        setBookingsError("An error occurred while fetching bookings.");
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleShowSignup = () => {
    setShowSignup(true);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  return (
    <>
      {/* Modals */}
      {showLogin && (
        <div className="modal-overlay">
          <UserLogin 
            close={() => setShowLogin(false)} 
            showSignup={handleShowSignup} 
          />
        </div>
      )}

      {showSignup && (
        <div className="modal-overlay">
          <UserSignup 
            close={() => setShowSignup(false)} 
            showLogin={handleShowLogin} 
          />
        </div>
      )}

      <Navbar
        onLoginClick={() => setShowLogin(true)}
        user={user}
      />

      <div className={`bookings-wrapper ${showLogin || showSignup ? "blurred" : ""}`}>
        <div className="bookings-container">
          <h1>My Bookings</h1>
          <div className="bookings-list">
            {!user ? (
              <div className="no-bookings">
                <p>Please log in to view your bookings.</p>
                <button className="btn" onClick={() => setShowLogin(true)}>Login</button>
              </div>
            ) : loadingBookings ? (
              <div className="loading">Loading bookings...</div>
            ) : bookingsError ? (
              <div className="error">{bookingsError}</div>
            ) : bookings.length === 0 ? (
              <div className="no-bookings">No bookings found.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.bookingId} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.arenaName}</h3>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">Booking ID:</span>
                      <span className="detail-value">{booking.bookingId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Court:</span>
                      <span className="detail-value">Court {booking.courtNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{formatDate(booking.bookingDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{formatTime(booking.startTime)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{booking.duration} minutes</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Bookings;