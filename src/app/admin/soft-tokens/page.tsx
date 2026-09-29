"use client";

import { useEffect, useState } from "react";

export default function AdminSoftTokensPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/admin/soft-tokens');
      const data = await res.json();
      if (data.tokens) setTokens(data.tokens);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleUpdateStatus = async (txId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus } this soft token request?`)) return;

    try {
      const res = await fetch('/api/admin/soft-tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, newStatus })
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      alert(`Soft Token Request ${newStatus }! `);
      fetchTokens();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  if (loading) return <div>Loading soft token requests...</div>;


  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden mb-8">
        <div className="bg-[#3498db] text-white px-4 py-3 border-b-4 border-black">
          <h3 className="font-bold tracking-widest text-sm uppercase">Manage Soft Token Requests</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EAEAEA] border-b border-gray-300 text-xs uppercase tracking-widest text-gray-700">
                <th className="p-3 border-r border-white font-bold">Date</th>
                <th className="p-3 border-r border-white font-bold">User</th>
                <th className="p-3 border-r border-white font-bold">Payment Method</th>
                <th className="p-3 border-r border-white font-bold">Amount Paid</th>
                <th className="p-3 border-r border-white font-bold">Token</th>
                <th className="p-3 border-r border-white font-bold">Status</th>
                <th className="p-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500 text-sm">No soft token requests found.</td>
                </tr>
              ) : (
                tokens.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-sm border-r border-gray-100">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm font-medium border-r border-gray-100">
                      {tx.profiles?.first_name} {tx.profiles?.last_name} <br/>
                      <span className="text-gray-500 text-xs">{tx.profiles?.email}</span>
                    </td>
                    <td className="p-3 text-sm border-r border-gray-100">
                      <span className="uppercase font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {tx.wallet_used === 'main' ? 'MAIN WALLET (FIAT)' : tx.wallet_used?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-bold border-r border-gray-100 text-gray-700">
                      ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-sm border-r border-gray-100 font-mono font-bold text-blue-600">
                      {tx.profiles?.soft_token || '---'}
                    </td>
                    <td className="p-3 text-sm border-r border-gray-100">
                      <span className={`px-2 py-1 rounded text-xs font-bold $|
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        tx.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                        tx.status === 'failed' || tx.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {tx.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'processing')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                          >
                            Review
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'rejected')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {tx.status === 'processing' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'completed')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700"
                          >
                            Approve & Deduct
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'rejected')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {tx.status === 'completed' && (
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

