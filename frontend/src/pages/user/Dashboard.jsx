import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Package, BookOpen, Clock, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data)).catch(() => {});
    api.get('/assets').then(r => setAssets(r.data)).catch(() => {});
  }, []);

  const pending = bookings.filter(b => b.status === 'PENDING').length;
  const approved = bookings.filter(b => b.status === 'APPROVED').length;
  const available = assets.filter(a => a.status === 'AVAILABLE').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h2>
        <p className="text-gray-500">Here's what's happening with your assets.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Available Assets', value: available, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Bookings', value: pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approved Bookings', value: approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${bg} ${color} p-3 rounded-xl`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex gap-3">
          <Link to="/assets" className="btn-primary">Browse Assets</Link>
          <Link to="/bookings" className="btn-secondary">My Bookings</Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings yet. <Link to="/assets" className="text-primary-600">Browse assets</Link> to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Asset</th>
                  <th className="pb-2">Dates</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td className="py-3 font-medium">{b.asset_name}</td>
                    <td className="py-3 text-gray-500">{b.start_date?.slice(0,10)} → {b.end_date?.slice(0,10)}</td>
                    <td className="py-3">
                      <span className={`badge-${b.status.toLowerCase()}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}