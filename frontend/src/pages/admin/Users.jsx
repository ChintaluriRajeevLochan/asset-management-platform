import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      toast.success('User status updated');
      load();
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Role</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Joined</th>
            <th className="pb-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map(u => (
            <tr key={u.id}>
              <td className="py-3 font-medium">{u.name}</td>
              <td className="py-3 text-gray-500">{u.email}</td>
              <td className="py-3"><span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{u.role}</span></td>
              <td className="py-3">
                <span className={u.is_active ? 'badge-available' : 'badge-unavailable'}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 text-gray-500">{u.created_at?.slice(0,10)}</td>
              <td className="py-3">
                <button onClick={() => toggle(u.id)}
                  className={`text-xs px-3 py-1 rounded-lg ${u.is_active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {u.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}