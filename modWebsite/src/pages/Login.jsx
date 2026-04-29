import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginModerator } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginModerator(email, password);
      onLogin({ moderatorId: data.moderatorId, name: data.name, email: data.email });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Moderator Login</h1>
        <p>Access limited to Courtify Club moderators.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Moderator Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@courtify.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Signing in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
