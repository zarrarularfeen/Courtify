import { useEffect, useState } from 'react';
import { fetchFlaggedEntries, takeFlagAction } from '../services/api';

export default function FlaggedReview({ moderator }) {
  const [flags, setFlags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFlags = async () => {
    try {
      const data = await fetchFlaggedEntries();
      setFlags(data);
    } catch (err) {
      setError(err.message || 'Could not load flagged entries');
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleAction = async (id, action) => {
    setLoading(true);
    setError('');
    try {
      await takeFlagAction(id, action, moderator?.moderatorId, `${action} via moderator panel`);
      await loadFlags();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-panel">
      <div className="page-heading">
        <h1>Flagged User Review Center</h1>
        <p>Review reports, send warnings, ban users, and resolve flagged cases.</p>
      </div>

      {error && <div className="form-error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Primary Reason</th>
              <th>Total Flags</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id}>
                <td>{`P-${flag.player_id}`}</td>
                <td>{flag.player_name}</td>
                <td>{flag.email}</td>
                <td>{flag.reason}</td>
                <td>{flag.total_flags}</td>
                <td>{flag.status}</td>
                <td>
                  <button disabled={loading} onClick={() => handleAction(flag.id, 'warned')}>Send Warning</button>
                  <button disabled={loading} onClick={() => handleAction(flag.id, 'banned')}>Ban User</button>
                  <button disabled={loading} onClick={() => handleAction(flag.id, 'resolved')}>Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
