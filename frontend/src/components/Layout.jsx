import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  LayoutDashboard, Package, BookOpen, Users, BarChart3,
  ClipboardList, ScrollText, LogOut, Menu, X, Bell
} from 'lucide-react';
import api from '../api/axios';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/assets', icon: Package, label: 'Browse Assets' },
    { to: '/bookings', icon: BookOpen, label: 'My Bookings' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/assets', icon: Package, label: 'Assets' },
    { to: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
    { to: '/admin/allocations', icon: ClipboardList, label: 'Allocations' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/audit', icon: ScrollText, label: 'Audit Logs' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    setNotifications(res.data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchNotifications();
}, []);

  const unread = notifications.filter(n => !n.is_read).length;
  const markAllRead = async () => {
  try {
    await api.patch('/notifications/read-all');

    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        is_read: true
      }))
    );
  } catch (err) {
    console.error(err);
  }
};

const clearAllNotifications = async () => {
  try {
    await api.delete('/notifications');
    setNotifications([]);
  } catch (err) {
    console.error(err);
  }
};

const deleteNotification = async (id) => {
  try {
    await api.delete(`/notifications/${id}`);

    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  } catch (err) {
    console.error(err);
  }
};
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside style={{ background: '#1c1c1e' }} className={`${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div style={{ borderBottom: '1px solid #2a2a2a' }} className="flex items-center justify-between p-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div style={{ background: '#d97706', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={16} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>AssetFlow</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', textDecoration: 'none',
                  background: active ? '#2a2a2a' : 'transparent',
                  borderRight: active ? '3px solid #d97706' : '3px solid transparent',
                  color: active ? '#fff' : '#888',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '16px' }}>
          {sidebarOpen && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{user?.name}</p>
              <p style={{ color: '#d97706', fontSize: 11, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: '1px solid #333', borderRadius: 6,
              color: '#888', cursor: 'pointer', padding: '7px 12px',
              fontSize: 13, width: sidebarOpen ? '100%' : 'auto',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888'; }}
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            {links.find(l => l.to === location.pathname)?.label || 'Asset Management'}
          </h1>
          <div className="relative">
            <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} className="text-gray-600" />
              {unread > 0 && (
                <span style={{ background: '#d97706' }} className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            {showNotif && (
  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 max-h-96 overflow-y-auto">
    
    <div className="p-4 border-b flex justify-between items-center">
      <span className="font-semibold text-sm">
        Notifications
      </span>

      <div className="flex gap-3">
        <button
          onClick={markAllRead}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Read All
        </button>

        <button
          onClick={clearAllNotifications}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Clear All
        </button>
      </div>
    </div>

    {notifications.length === 0 ? (
      <p className="p-4 text-gray-500 text-sm">
        No notifications
      </p>
    ) : (
      notifications.map(n => (
        <div
          key={n.id}
          className={`p-4 border-b hover:bg-gray-50 ${
            !n.is_read ? 'bg-amber-50' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">
                {n.title}
              </p>

              <p className="text-xs text-gray-500">
                {n.message}
              </p>
            </div>

            <button
              onClick={() => deleteNotification(n.id)}
              className="text-red-500 text-xs hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      ))
    )}
  </div>
)}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}