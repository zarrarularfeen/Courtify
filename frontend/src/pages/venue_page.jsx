import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Authcontext.jsx";
import { Navbar } from "../components/NavBar";
import "../styles/venue.css";
import "../styles/global.css";
import UserLogin from "./user_login";
import UserSignup from "./user_signup";

function VenueDetail() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  const venueID = location.state?.id;

  const fetchVenue = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://localhost:5000/arena/${venueID}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      setVenue({
        id: data.id,
        name: data.name,
        address: data.address,
        city: data.city,
        rating: data.rating,
        price: data.pricePerHour,
        availability: data.availability,
        timing: data.timing,
        amenities: data.amenities,
        description: data.description,
        rules: data.rules,
        images: Array.isArray(data.images) && data.images.length > 0
          ? data.images.map(img => img.startsWith('http') ? img : `http://localhost:5000/${img}`)
          : [],
        courts: data.courts,
        sports: Object.keys(data.courts || {}),
      });
    } catch (err) {
      setError("Failed to fetch venue details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (venueID) fetchVenue();
  }, []);

  const handleShowSignup = () => setShowSignup(true);
  const handleShowLogin = () => setShowLogin(true);

  if (loading || !venue) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading venue details...</p>
      </div>
    );
  }

  return (
    <>
      {showLogin && (
        <div className="modal-overlay">
          <UserLogin close={() => setShowLogin(false)} showSignup={handleShowSignup} />
        </div>
      )}
      {showSignup && (
        <div className="modal-overlay">
          <UserSignup close={() => setShowSignup(false)} showLogin={handleShowLogin} />
        </div>
      )}

      <Navbar onLoginClick={() => setShowLogin(true)} user={user} />

      <div className={`venue-detail-wrapper ${showLogin || showSignup ? "blurred" : ""}`}>
        <div className="venue-layout-grid">
          {/* Left Column - Images */}
          <div className="venue-images-column">
            <h1>{venue.name}</h1>
            <div className="venue-address">{venue.address}</div>
            {venue.images.length > 0 && (
              <div className="gallery-main">
                <img src={venue.images[0]} alt={venue.name} />
              </div>
            )}
            <div className="gallery-thumbnails">
              {venue.images.map((img, index) => (
                <img key={index} src={img} alt={`${venue.name} ${index + 1}`} />
              ))}
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="venue-booking-column">
            <div className="venue-header">
              <div className="venue-meta">
                <div className="venue-rating-price">
                  <span className="rating">⭐ {venue.rating}</span>
                  <span className="price">Rs.{venue.price}/hour</span>
                </div>
              </div>
            </div>

            <div className="booking-card">
              <div className="info-section">
                <h3>🕒 Timing</h3>
                <p>{venue.timing}</p>
              </div>
              <div className="info-section">
                <h3>📍 Location</h3>
                <p>{venue.address}, {venue.city}</p>
              </div>
              <div className="info-section">
                <h3>🏟️ Available Courts</h3>
                {Object.entries(venue.courts || {}).map(([type, courts]) => (
                  <div key={type}>
                    <strong>{type}</strong>
                    <ul>
                      {courts.map(c => <li key={c.id}>{c.name}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="venue-description">
          <h2>About this venue</h2>
          <p>{venue.description}</p>
        </section>

        {venue.amenities?.length > 0 && (
          <section className="amenities-section">
            <h2>Amenities</h2>
            <div className="amenities-grid">
              {venue.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">{amenity}</div>
              ))}
            </div>
          </section>
        )}

        {venue.rules?.length > 0 && (
          <section className="venue-rules">
            <h2>Rules & Guidelines</h2>
            <ul>
              {venue.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

export default VenueDetail;