import { useEffect, useState } from 'react';
import { fetchModeratorOverview } from '../services/api';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModeratorOverview()
      .then(setOverview)
      .catch((err) => setError(err.message || 'Could not load dashboard'));
  }, []);

  return (
    <section className="page-panel">
      <div className="page-heading">
        <h1>Moderator Dashboard</h1>
        <p>Review flagged content, admins, and user reports quickly.</p>
      </div>
      {error && <div className="form-error">{error}</div>}
      {overview ? (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Flagged Content</h3>
            <strong>{overview.flaggedCount}</strong>
          </div>
          <div className="stat-card">
            <h3>New Admin Sign-ups</h3>
            <strong>{overview.newAdminSignups}</strong>
          </div>
          <div className="stat-card">
            <h3>Reported Users</h3>
            <strong>{overview.reportedUsers}</strong>
          </div>
          <div className="stat-card full-width">
            <h3>Recent Moderator Activity</h3>
            <ul className="activity-list">
              {overview.recentActivity.map((activity) => (
                <li key={activity.id}>
                  <span className="activity-action">{activity.action}</span>
                  <span>{activity.note || 'No details provided.'}</span>
                  <small>{new Date(activity.created_at).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div>Loading overview…</div>
      )}
    </section>
  );
}
