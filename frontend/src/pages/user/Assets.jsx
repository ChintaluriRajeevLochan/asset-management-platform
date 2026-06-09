import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, QrCode } from 'lucide-react';

export default function UserAssets() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ quantity_requested: 1, start_date: '', end_date: '', purpose: '' });
  const [loading, setLoading] = useState(false);
  const [qrAsset, setQrAsset] = useState(null);

  useEffect(() => {
    api.get('/assets').then(r => setAssets(r.data));
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCat ? a.category_name === filterCat : true)
  );

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/bookings', { asset_id: selected.id, ...form });
      toast.success('Booking request submitted!');
      setSelected(null);
      setForm({ quantity_requested: 1, start_date: '', end_date: '', purpose: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const showQR = async (asset) => {
    const { data } = await api.get(`/assets/${asset.id}/qr`);
    setQrAsset(data);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input className="input pl-9" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(asset => (
          <div key={asset.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-800">{asset.name}</h3>
              <span className={`badge-${asset.status.toLowerCase()}`}>{asset.status}</span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{asset.category_name}</p>
            <p className="text-sm text-gray-600 mb-3">{asset.description}</p>
            <p className="text-sm font-medium text-gray-700 mb-4">
              Available: <span className="text-green-600">{asset.available_quantity}</span> / {asset.total_quantity}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(asset)}
                disabled={asset.available_quantity === 0}
                className="btn-primary flex-1 text-sm py-1.5"
              >
                Book Now
              </button>
              <button onClick={() => showQR(asset)} className="btn-secondary px-3 py-1.5">
                <QrCode size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Book: {selected.name}</h3>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" className="input" min="1" max={selected.available_quantity}
                  value={form.quantity_requested} onChange={e => setForm({ ...form, quantity_requested: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input type="date" className="input" value={form.start_date}
                  onChange={e => setForm({ ...form, start_date: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input type="date" className="input" value={form.end_date}
                  onChange={e => setForm({ ...form, end_date: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purpose</label>
                <textarea className="input" rows="2" value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 text-center">
            <h3 className="font-semibold mb-4">{qrAsset.name}</h3>
            <img src={qrAsset.qr_code} alt="QR Code" className="mx-auto mb-4" />
            <button className="btn-secondary" onClick={() => setQrAsset(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}