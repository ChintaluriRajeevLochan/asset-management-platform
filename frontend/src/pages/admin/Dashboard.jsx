import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Package, Users, BookOpen, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/analytics/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Assets', value: stats.totalAssets, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Allocations', value: stats.activeBookings, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Approvals', value: stats.pendingBookings, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Overdue Returns', value: stats.overdueAssets, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Available Assets', value: stats.availableAssets, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-gray-500">Platform overview at a glance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${bg} ${color} p-3 rounded-xl`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value ?? '—'}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}