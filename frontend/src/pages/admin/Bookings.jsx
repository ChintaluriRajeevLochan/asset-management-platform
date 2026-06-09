import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [remarks, setRemarks] = useState({});

  const load = () => api.get(`/bookings?status=${filter}`).then(r => setBookings(r.data));
  useEffect(() => { load(); }, [filter]);

  const review = async (id, action) => {
    try {
      await api.patch(`/bookings/${id}/review`, { action, admin_remarks: remarks[id] || '' });
      toast.success(`Booking ${action.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">User</th>
              <th className="pb-3">Asset</th>
              <th className="pb-3">Qty</th>
              <th className="pb-3">Dates</th>
              <th className="pb-3">Purpose</th>
              <th className="pb-3">Status</th>
              {filter === 'PENDING' && <th className="pb-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map(b => (
              <tr key={b.id}>
                <td className="py-3">
                  <p className="font-medium">{b.user_name}</p>
                  <p className="text-xs text-gray-400">{b.user_email}</p>
                </td>
                <td className="py-3">{b.asset_name}</td>
                <td className="py-3">{b.quantity_requested}</td>
                <td className="py-3 text-gray-500 text-xs">{b.start_date?.slice(0,10)} → {b.end_date?.slice(0,10)}</td>
                <td className="py-3 text-gray-500 text-xs max-w-32 truncate">{b.purpose || '—'}</td>
                <td className="py-3"><span className={`badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                {filter === 'PENDING' && (
                  <td className="py-3">
                    <div className="flex flex-col gap-1">
                      <input className="input text-xs py-1" placeholder="Remarks (optional)"
                        value={remarks[b.id] || ''} onChange={e => setRemarks({ ...remarks, [b.id]: e.target.value })} />
                      <div className="flex gap-1">
                        <button onClick={() => review(b.id, 'APPROVED')} className="bg-green-500 text-white text-xs px-2 py-1 rounded">Approve</button>
                        <button onClick={() => review(b.id, 'REJECTED')} className="bg-red-500 text-white text-xs px-2 py-1 rounded">Reject</button>
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="text-gray-500 text-sm mt-4">No {filter.toLowerCase()} bookings.</p>}
      </div>
    </div>
  );
}