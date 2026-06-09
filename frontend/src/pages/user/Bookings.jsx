import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);

  const load = () => api.get('/bookings/my').then(r => setBookings(r.data));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel');
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Asset</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Start</th>
                <th className="pb-3">End</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Remarks</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="py-3 font-medium">{b.asset_name}</td>
                  <td className="py-3 text-gray-500">{b.category_name}</td>
                  <td className="py-3">{b.quantity_requested}</td>
                  <td className="py-3">{b.start_date?.slice(0,10)}</td>
                  <td className="py-3">{b.end_date?.slice(0,10)}</td>
                  <td className="py-3"><span className={`badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td className="py-3 text-gray-500 text-xs">{b.admin_remarks || '—'}</td>
                  <td className="py-3">
                    {b.status === 'PENDING' && (
                      <button onClick={() => cancel(b.id)} className="text-red-500 hover:underline text-xs">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}