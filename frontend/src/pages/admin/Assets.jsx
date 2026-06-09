import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const empty = { name: '', category_id: '', description: '', total_quantity: 1, status: 'AVAILABLE' };

export default function AdminAssets() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/assets').then(r => setAssets(r.data));
    api.get('/categories').then(r => setCategories(r.data));
  };
  useEffect(() => { load(); }, []);

  const openEdit = (asset) => {
    setEditing(asset);
    setForm({ name: asset.name, category_id: asset.category_id, description: asset.description, total_quantity: asset.total_quantity, status: asset.status });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/assets/${editing.id}`, form);
        toast.success('Asset updated');
      } else {
        await api.post('/assets', form);
        toast.success('Asset created');
      }
      setShowModal(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Manage Assets</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditing(null); setForm(empty); setShowModal(true); }}>
          <Plus size={16} /> Add Asset
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Name</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Available</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assets.map(a => (
              <tr key={a.id}>
                <td className="py-3 font-medium">{a.name}</td>
                <td className="py-3 text-gray-500">{a.category_name}</td>
                <td className="py-3">{a.total_quantity}</td>
                <td className="py-3">{a.available_quantity}</td>
                <td className="py-3"><span className={`badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => openEdit(a)} className="text-blue-500 hover:text-blue-700"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit Asset' : 'Add Asset'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="input" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" className="input" min="1" value={form.total_quantity} onChange={e => setForm({ ...form, total_quantity: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>AVAILABLE</option>
                  <option>UNAVAILABLE</option>
                  <option>MAINTENANCE</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}