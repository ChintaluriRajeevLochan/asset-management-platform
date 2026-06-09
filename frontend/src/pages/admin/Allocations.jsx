import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [tab, setTab] = useState('active');
  const [returnForm, setReturnForm] = useState({});

  const load = () => {
    const endpoint = tab === 'overdue' ? '/allocations/overdue' : '/allocations';
    api.get(endpoint).then(r => setAllocations(r.data));
  };
  useEffect(() => { load(); }, [tab]);

  const handleReturn = async (id) => {
    try {
      await api.patch(`/allocations/${id}/return`, returnForm[id] || { return_condition: 'GOOD' });
      toast.success('Asset returned');
      load();
    } catch (err) {
      toast.error('Failed to process return');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['active', 'overdue'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {t}
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
              <th className="pb-3">Issued</th>
              <th className="pb-3">Due Date</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allocations.map(a => (
              <tr key={a.id} className={a.due_date < new Date().toISOString().slice(0,10) ? 'bg-red-50' : ''}>
                <td className="py-3">
                  <p className="font-medium">{a.user_name}</p>
                  <p className="text-xs text-gray-400">{a.user_email}</p>
                </td>
                <td className="py-3">{a.asset_name}</td>
                <td className="py-3">{a.quantity_issued}</td>
                <td className="py-3 text-gray-500">{a.issued_at?.slice(0,10)}</td>
                <td className="py-3 font-medium text-red-600">{a.due_date?.slice(0,10)}</td>
                <td className="py-3">
                  <div className="flex flex-col gap-1">
                    <select className="input text-xs py-1 w-28"
                      value={returnForm[a.id]?.return_condition || 'GOOD'}
                      onChange={e => setReturnForm({ ...returnForm, [a.id]: { ...returnForm[a.id], return_condition: e.target.value } })}>
                      <option>GOOD</option>
                      <option>DAMAGED</option>
                      <option>LOST</option>
                    </select>
                    <button onClick={() => handleReturn(a.id)} className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Mark Returned
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {allocations.length === 0 && <p className="text-gray-500 text-sm mt-4">No {tab} allocations.</p>}
      </div>
    </div>
  );
}