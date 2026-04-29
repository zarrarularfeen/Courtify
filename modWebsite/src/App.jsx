import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FlaggedReview from './pages/FlaggedReview';
import ManageUsers from './pages/ManageUsers';
import ManageAdmins from './pages/ManageAdmins';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [moderator, setModerator] = useState(() => {
    const stored = window.localStorage.getItem('courtifyModerator');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (moderator) {
      window.localStorage.setItem('courtifyModerator', JSON.stringify(moderator));
    } else {
      window.localStorage.removeItem('courtifyModerator');
    }
  }, [moderator]);

  const handleLogout = () => {
    setModerator(null);
  };

  return (
    <Router>
      {moderator && <Topbar user={moderator} onLogout={handleLogout} />}
      <div className="app-shell">
        {moderator && <Sidebar />}
        <main className="main-view">
          <Routes>
            <Route path="/login" element={<Login onLogin={setModerator} />} />
            <Route path="/dashboard" element={moderator ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/flags" element={moderator ? <FlaggedReview moderator={moderator} /> : <Navigate to="/login" replace />} />
            <Route path="/users" element={moderator ? <ManageUsers moderator={moderator} /> : <Navigate to="/login" replace />} />
            <Route path="/admins" element={moderator ? <ManageAdmins /> : <Navigate to="/login" replace />} />
            <Route path="/*" element={<Navigate to={moderator ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
