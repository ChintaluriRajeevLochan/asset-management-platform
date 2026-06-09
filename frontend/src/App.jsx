import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/user/Dashboard';
import UserAssets from './pages/user/Assets';
import UserBookings from './pages/user/Bookings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAssets from './pages/admin/Assets';
import AdminBookings from './pages/admin/Bookings';
import AdminAllocations from './pages/admin/Allocations';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import AdminAudit from './pages/admin/Audit';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><UserDashboard /></Layout></PrivateRoute>} />
      <Route path="/assets" element={<PrivateRoute><Layout><UserAssets /></Layout></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute><Layout><UserBookings /></Layout></PrivateRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
      <Route path="/admin/assets" element={<AdminRoute><Layout><AdminAssets /></Layout></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><Layout><AdminBookings /></Layout></AdminRoute>} />
      <Route path="/admin/allocations" element={<AdminRoute><Layout><AdminAllocations /></Layout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><Layout><AdminAnalytics /></Layout></AdminRoute>} />
      <Route path="/admin/audit" element={<AdminRoute><Layout><AdminAudit /></Layout></AdminRoute>} />

      <Route path="/" element={<Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}