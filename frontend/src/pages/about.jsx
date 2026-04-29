import React, { useState } from "react";
import { useAuth } from "../Authcontext.jsx";
import { Navbar } from "../components/NavBar";
import UserLogin from "./user_login";
import UserSignup from "./user_signup";
import "../styles/about.css";
import "../styles/global.css";

function About() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleShowSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleShowLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const teamMembers = [
    {
      name: "Wasiq Shaikh",
      role: "Team Member",
      image: "👨‍💻",
      socials: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com"
      }
    },
    {
      name: "Yusuf",
      role: "Team Member",
      image: "👨‍💻",
      socials: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com"
      }
    },
    {
      name: "Shaheer",
      role: "Team Member",
      image: "👨‍💻",
      socials: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com"
      }
    },
    {
      name: "Zarrar ul arfeen",
      role: "Team Member",
      image: "👨‍💻",
      socials: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com"
      }
    }
  ];

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

      <div className={`about-wrapper ${showLogin || showSignup ? "blurred" : ""}`}>
        <div className="about-container">
          <section className="about-hero">
            <h1>About Courtify</h1>
            <p className="about-tagline">
              Your one-stop solution for court bookings across Pakistan
            </p>
          </section>

          <section className="about-mission">
            <h2>Our Mission</h2>
            <p>
              At Courtify, we're dedicated to making badminton court bookings seamless and efficient. 
              We connect players with the best venues, ensuring a smooth booking experience for everyone. 
              Whether you're a casual player or a professional, we've got you covered.
            </p>
          </section>

          <section className="about-features">
            <h2>Why Choose Us?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Easy Booking</h3>
                <p>Book your favorite courts in just a few clicks</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Instant Confirmation</h3>
                <p>Get immediate booking confirmations</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>Secure Payments</h3>
                <p>Safe and secure payment processing</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Mobile Friendly</h3>
                <p>Book anywhere, anytime from any device</p>
              </div>
            </div>
          </section>

          <section className="about-team">
            <h2>Meet Our Team</h2>
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-image">{member.image}</div>
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <div className="social-links">
                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="about-contact">
            <h2>Get In Touch</h2>
            <p>Have questions? We'd love to hear from you!</p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <a href="mailto:courtify.support@gmail.com">courtify.support@gmail.com</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <a href="tel:+923318967433">+92 331-8967433</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Habib University</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default About;