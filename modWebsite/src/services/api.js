const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const headers = { 'Content-Type': 'application/json' };

export const loginModerator = async (email, password) => {
  const res = await fetch(`${API_URL}/moderator/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
};

export const fetchModeratorOverview = async () => {
  const res = await fetch(`${API_URL}/moderator/overview`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load dashboard');
  return data;
};

export const fetchFlaggedEntries = async () => {
  const res = await fetch(`${API_URL}/moderator/flags`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load flags');
  return data;
};

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/moderator/users`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load users');
  return data;
};

export const fetchAdmins = async () => {
  const res = await fetch(`${API_URL}/moderator/admins`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load admins');
  return data;
};

export const toggleAdminStatus = async (id) => {
  const res = await fetch(`${API_URL}/moderator/admins/${id}/toggle`, {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not toggle admin');
  return data;
};

export const takeUserAction = async (id, action, moderatorId, note = '') => {
  const res = await fetch(`${API_URL}/moderator/users/${id}/action`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, moderatorId, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not update user');
  return data;
};

export const takeFlagAction = async (id, action, moderatorId, note = '') => {
  const res = await fetch(`${API_URL}/moderator/flags/${id}/action`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, moderatorId, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not update flag');
  return data;
};
