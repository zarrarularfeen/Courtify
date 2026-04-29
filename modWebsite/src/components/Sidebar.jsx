import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Moderator Tools</h3>
        <nav>
          <NavLink to="/dashboard">Dashboard Overview</NavLink>
          <NavLink to="/flags">Flagged Review</NavLink>
          <NavLink to="/users">Manage Users</NavLink>
          <NavLink to="/admins">Manage Admins</NavLink>
        </nav>
      </div>
    </aside>
  );
}
