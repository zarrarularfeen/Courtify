import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VenueCard from "../components/VenueCard";
import { SearchBar } from "../components/SearchBar";
import { Navbar } from "../components/NavBar";
import { useAuth } from "../Authcontext.jsx";
import UserLogin from "./user_login";
import UserSignup from "./user_signup";
import "../styles/dashboard.css";
import Logo from '../assets/logo.png';


export default function Dashboard() {

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cityInput, setCityInput] = useState("");
  const [filteredVenues, setFilteredVenues] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearchVenue = (searchTerm) => {
    const q = searchTerm.trim().toLowerCase();
    
    if (q === "") {
      setFilteredVenues(venues);
      return;
    }
    
    const filtered = venues.filter(v =>
      v.name?.toLowerCase().includes(q) ||
      v.location?.toLowerCase().includes(q)
    );

    setFilteredVenues(filtered);
  };

  const handleFilterChange = (sortType) => {
    let sorted = [...filteredVenues];
    
    switch(sortType) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case 'rating-desc':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        sorted = [...venues];
    }

    setFilteredVenues(sorted);
  };

  const handleSearchCity = () => {
    // trim to avoid matching accidental whitespace
    const q = cityInput.trim().toLowerCase();

    if (q === "") {
      // empty input -> show all venues
      setFilteredVenues(venues);
      return;
    }

    const filtered = venues.filter(v =>
      // using location field; adjust if your API stores city separately
      v.location?.toLowerCase().includes(q)
    );

    setFilteredVenues(filtered);
  };

  const handleShowSignup = () => {
    setShowSignup(true);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  // Fetch venues from API
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('http://localhost:5000/arenas');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API data to match your VenueCard component structure
      const venue = data.map(arena => ({
        id: arena.id,
        name: arena.name,
        location: arena.location,
        pricePerHour: arena.pricePerHour,
        availability: arena.availability,
        rating: arena.rating,
        image: arena.image_path
      }));
      
      setVenues(venue);
      setFilteredVenues(venue);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setError("Failed to load venues. Please try again later.");
    } finally {
      setLoading(false);
    }
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

      {/* Dashboard */}
      <div className={`dashboard-wrapper ${showLogin || showSignup ? "blurred" : ""}`}>

        <Navbar
          onLoginClick={() => setShowLogin(true)}
          user={user}
        />

        {/* Owner CTA section */}
        {!user && (
          <div className="owner-cta-banner">
            <div className="owner-cta-content">
              <h2>Are you a facility owner?</h2>
              <p>List your sports facilities and reach thousands of players across Pakistan</p>
              <button 
                className="btn btn-secondary btn"
                onClick={handleShowSignup}
              >
                Register as Owner
              </button>
            </div>
          </div>
        )}

        <section className="hero-section">
          <div className="hero-left">
            <h1>Find & Book Sports Venues Across Pakistan</h1>
            <p>Search courts, grounds, and arenas in your city. Play anytime, anywhere.</p>

            <div className="hero-search">
              <input
                type="text"
                placeholder="Search by city (Karachi, Lahore, Islamabad...)"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
              <button className="btn" onClick={handleSearchCity}>Search</button>
            </div>
          </div>

          <div className="hero-right">
            <img src={Logo} alt="Sports Banner" />
          </div>
        </section>

        <div className="dashboard-header">
          <SearchBar 
            onSearch={handleSearchVenue}
            onFilterChange={handleFilterChange}
          />
        </div>

        <h1 className="dashboard-title">Available Venues</h1>

        <div className="venue-grid">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} {...venue} />
          ))}
        </div>
      </div>
    </>
  );
}
