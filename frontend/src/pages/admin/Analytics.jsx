import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

export default function AdminAnalytics() {
  const [mostUsed, setMostUsed] = useState([]);
  const [utilization, setUtilization] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    api.get('/analytics/most-used').then(r => setMostUsed(r.data));
    api.get('/analytics/utilization').then(r => setUtilization(r.data));
    api.get('/analytics/trends').then(r => setTrends(r.data.map(t => ({
      ...t, month: new Date(t.month).toLocaleDateString('en', { month: 'short', year: '2-digit' })
    }))));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Most Used Assets</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mostUsed}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="booking_count" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Utilization by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={utilization} dataKey="total_bookings" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category }) => category}>
                {utilization.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Booking Trends (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trends}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}