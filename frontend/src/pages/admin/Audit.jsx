import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/audit').then(r => setLogs(r.data));
  }, []);

  return (
    <div className="card overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Audit Logs</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-3">Time</th>
            <th className="pb-3">Actor</th>
            <th className="pb-3">Action</th>
            <th className="pb-3">Entity</th>
            <th className="pb-3">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map(l => (
            <tr key={l.id}>
              <td className="py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
              <td className="py-3">
                <p className="font-medium">{l.actor_name}</p>
                <p className="text-xs text-gray-400">{l.actor_email}</p>
              </td>
              <td className="py-3"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{l.action}</span></td>
              <td className="py-3 text-gray-500 text-xs">{l.entity_type}</td>
              <td className="py-3 text-gray-500 text-xs max-w-48 truncate">{JSON.stringify(l.details)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && <p className="text-gray-500 text-sm mt-4">No audit logs yet.</p>}
    </div>
  );
}