import { Link } from 'react-router-dom';

export default function Topbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">Courtify Club</div>
      <nav className="topbar-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/flags">Flags</Link>
        <Link to="/users">Users</Link>
        <Link to="/admins">Admins</Link>
      </nav>
      <div className="topbar-actions">
        <span>{user?.name || 'Moderator'}</span>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
