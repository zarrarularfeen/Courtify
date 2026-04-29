import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Authcontext.jsx";
import { Navbar } from "../components/NavBar";
import "../styles/venue.css";
import "../styles/global.css";

import UserLogin from "./user_login";
import UserSignup from "./user_signup";

import viteLogo from "../../public/vite.svg";

function VenueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const venueID = location.state.id;
  console.log("VenueDetail venueID from state:", venueID);

  // Helper function to convert image path to URL
  const convertImagePath = (path) => {
    if (!path) return viteLogo;
    if (path.startsWith('http') || path.startsWith('data:')) {
      return path; // Already a full URL
    }
    
    try {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const adjustedPath = `../${cleanPath}`;
      return new URL(adjustedPath, import.meta.url).href;
    } catch (error) {
      console.error("Error converting image path:", error);
      return viteLogo;
    }
  };

  const fetchVenue = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`http://localhost:5000/arena/${venueID}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw API data:", data);
      
      // Transform the API data to match your VenueDetail component structure
      const venue = {
        id: data.id,
        name: data.name,
        address: data.address,
        city: data.city,
        rating: data.rating,
        price: data.pricePerHour,
        priceUnit: "hour",
        availability: data.availability,
        timing: data.timing,
        amenities: data.amenities,
        description: data.description,
        rules: data.rules,

        images: Array.isArray(data.images)
          ? data.images.map(img => convertImagePath(img))
          : [convertImagePath(data.image)],

        courts: data.courts,
        sports: Object.keys(data.courts || {}),
      };

      console.log("Final transformed venue:", venue);
      setVenue(venue);
    } catch (err) {
      setError("Failed to fetch venue details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch venues from API
  useEffect(() => {
    fetchVenue();
  }, []);

  if (loading || !venue) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading venue details...</p>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    navigate("/booking",{ state: { venue } });
  }

  const formatPrice = (price) => {
    return `Rs.${price}/hour`;
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

      <div className={`venue-detail-wrapper ${showLogin || showSignup ? "blurred" : ""}`}>
        
        {/* Main Content Grid */}
        <div className="venue-layout-grid">
          
          {/* Left Column - Images */}
          <div className="venue-images-column">
            <h1>{venue.name}</h1>
            <div className="venue-address">{venue.address}</div>
            <div className="gallery-main">
              <img src={venue.images[0]} alt={venue.name} />
            </div>
            <div className="gallery-thumbnails">
              {venue.images.map((img, index) => (
                <img key={index} src={img} alt={`${venue.name} ${index + 1}`} />
              ))}
            </div>
          </div>

          {/* Right Column - Booking Info */}
          <div className="venue-booking-column">
            
            {/* Venue Header */}
            <div className="venue-header">
              <div className="venue-meta">
                <div className="venue-rating-price">
                  <span className="rating">⭐ {venue.rating}</span>
                  <span className="price">{formatPrice(venue.price)}</span>
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="booking-card">
              <div className="booking-header">
                <h2>Book Now</h2>
                <button className="share-btn">Share ↗</button>
              </div>

              {/* Timing Section */}
              <div className="info-section">
                <h3>🕒 Timing</h3>
                <p>{venue.timing}</p>
              </div>

              {/* Location Section */}
              <div className="info-section">
                <h3>📍 Location</h3>
                <p>{venue.address}, {venue.city}</p>
              </div>

              {/* Book Now Button */}
              <button className="book-now-btn-large btn" onClick={handleBookNow}>
                Book Now
              </button>
            </div>

          </div>
        </div>

        {/* Additional Info Sections */}
        <section className="venue-description">
          <h2>About this venue</h2>
          <p>{venue.description}</p>
        </section>

        <section className="amenities-section">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {venue.amenities.map((amenity, index) => (
              <div key={index} className="amenity-item">
                {amenity}
              </div>
            ))}
          </div>
        </section>

        <section className="venue-rules">
          <h2>Rules & Guidelines</h2>
          <ul>
            {venue.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default VenueDetail;