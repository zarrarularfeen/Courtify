import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Authcontext.jsx';
import Dashboard from './pages/dashboard.jsx';
import OwnerDashboard from './pages/ownerDash';
import FacilityRegistration from './pages/facilityRegistration';
import VenueDetail from './pages/venue_page.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

function AppRoutes() {
  const { isOwner } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/venue" element={<VenueDetail />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Owner protected routes */}
      <Route
        path="/owner/dashboard"
        element={isOwner() ? <OwnerDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/owner/register-facility"
        element={isOwner() ? <FacilityRegistration /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;