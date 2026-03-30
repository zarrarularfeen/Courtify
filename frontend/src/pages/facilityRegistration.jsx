import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authcontext';
import { Navbar } from '../components/NavBar.jsx';
import '../styles/global.css';

export default function FacilityRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    pricePerHour: '',
    timing: '',
    description: '',
    amenities: [],
    rules: []
  });

  const [amenityInput, setAmenityInput] = useState('');
  const [ruleInput, setRuleInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const addRule = () => {
    if (ruleInput.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, ruleInput.trim()]
      }));
      setRuleInput('');
    }
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/arenas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          owner_id: user.userId,
          pricePerHour: parseInt(formData.pricePerHour)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Facility registered successfully!');
        navigate('/owner/dashboard');
      } else {
        alert(data.error || 'Failed to register facility');
      }
    } catch (error) {
      console.error('Error registering facility:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={user} />
      <div className="container" style={{ padding: '2rem' }}>
        <h1>Register New Facility</h1>
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-group">
            <label>Arena Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Price Per Hour (PKR)</label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Timing (e.g., 9 AM - 12 AM)</label>
            <input
              type="text"
              name="timing"
              value={formData.timing}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Amenities</label>
            <div className="input-group">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                className="form-input"
                placeholder="e.g., Parking, Showers"
              />
              <button type="button" onClick={addAmenity} className="btn btn-secondary">Add</button>
            </div>
            <div className="tags-container">
              {formData.amenities.map((item, index) => (
                <span key={index} className="tag">
                  {item} <button type="button" onClick={() => removeAmenity(index)}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Rules</label>
            <div className="input-group">
              <input
                type="text"
                value={ruleInput}
                onChange={(e) => setRuleInput(e.target.value)}
                className="form-input"
                placeholder="e.g., No smoking"
              />
              <button type="button" onClick={addRule} className="btn btn-secondary">Add</button>
            </div>
            <div className="tags-container">
              {formData.rules.map((item, index) => (
                <span key={index} className="tag">
                  {item} <button type="button" onClick={() => removeRule(index)}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/owner/dashboard')} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Registering...' : 'Register Facility'}
            </button>
          </div>
        </form>

        <style jsx>{`
          .form-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .form-group { margin-bottom: 1.5rem; }
          .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
          }
          .input-group { display: flex; gap: 0.5rem; }
          .tags-container { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
          .tag {
            background: #f0f0f0;
            padding: 0.25rem 0.75rem;
            border-radius: 16px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
          }
          .tag button { border: none; background: none; cursor: pointer; font-weight: bold; }
          .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
        `}</style>
      </div>
    </>
  );
}
