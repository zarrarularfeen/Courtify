import { useEffect, useState } from 'react';
import { fetchUsers, takeUserAction } from '../services/api';

export default function ManageUsers({ moderator }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Unable to load users');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(true);
    setError('');
    try {
      await takeUserAction(id, action, moderator?.moderatorId, `${action} by moderator`);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="page-panel">
      <div className="page-heading">
        <h1>Manage Users</h1>
        <p>Review players, issue warnings, and ban accounts when necessary.</p>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Warnings</th>
              <th>Banned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{`P-${user.id}`}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.warning_count}</td>
                <td>{user.is_banned ? 'Yes' : 'No'}</td>
                <td>
                  <button disabled={actionLoading} onClick={() => handleAction(user.id, 'warn')}>
                    Warn
                  </button>
                  <button disabled={actionLoading} onClick={() => handleAction(user.id, 'ban')}>
                    Ban
                  </button>
                  <button disabled={actionLoading} onClick={() => handleAction(user.id, 'resolve')}>
                    Unban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
