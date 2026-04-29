import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authcontext';
import { Navbar } from '../components/NavBar.jsx';
import '../styles/global.css';

export default function OwnerFacilities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, [user]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`http://localhost:5000/owner/arenas?ownerId=${user.userId}`);
      const data = await response.json();
      if (response.ok) {
        setFacilities(data);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={user} />
      <div className="container" style={{ padding: '2rem' }}>
        <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>My Facilities</h1>
          <button onClick={() => navigate('/owner/register-facility')} className="btn btn-primary">
            + Add New Facility
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : facilities.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '12px' }}>
            <h3>No facilities found</h3>
            <p>You haven't registered any facilities yet.</p>
          </div>
        ) : (
          <div className="facilities-grid">
            {facilities.map(facility => (
              <div key={facility.id} className="facility-card">
                <div className="card-header">
                  <h3>{facility.name}</h3>
                  <span className={`status-badge ${facility.availability}`}>
                    {facility.availability}
                  </span>
                </div>
                <p><strong>Location:</strong> {facility.city}</p>
                <p><strong>Price:</strong> PKR {facility.pricePerHour}/hr</p>
                <p><strong>Timing:</strong> {facility.timing}</p>
                
                <div className="card-actions">
                  <button className="btn btn-small btn-outline">Edit</button>
                  <button className="btn btn-small btn-secondary">View Bookings</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .facilities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
          }
          .facility-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid #eee;
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1rem;
          }
          .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            text-transform: uppercase;
            font-weight: bold;
          }
          .status-badge.available { background: #e6f4ea; color: #1e7e34; }
          .status-badge.unavailable { background: #fce8e6; color: #c53030; }
          .card-actions {
            margin-top: 1.5rem;
            display: flex;
            gap: 0.5rem;
          }
        `}</style>
      </div>
    </>
  );
}
