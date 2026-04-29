import { useEffect, useState } from 'react';
import { fetchAdmins, toggleAdminStatus } from '../services/api';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdmins = async () => {
    try {
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err.message || 'Unable to load admins');
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleToggle = async (id) => {
    setActionLoading(true);
    setError('');
    try {
      await toggleAdminStatus(id);
      await loadAdmins();
    } catch (err) {
      setError(err.message || 'Could not update admin');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="page-panel">
      <div className="page-heading">
        <h1>Manage Admins</h1>
        <p>Activate or deactivate facility admins and review their contact details.</p>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Admin ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{`A-${admin.id}`}</td>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>{admin.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  <button disabled={actionLoading} onClick={() => handleToggle(admin.id)}>
                    {admin.is_active ? 'Deactivate' : 'Activate'}
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
