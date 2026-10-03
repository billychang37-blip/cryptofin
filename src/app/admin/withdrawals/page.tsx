"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
const supabase = createClient();

export default function AdminWithdrawalsPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(first_name, last_name, email, wallet_balance)')
      .in('type', ['transfer', 'domestic_transfer', 'international_transfer', 'internal_transfer', 'crypto_transfer', 'crypto_withdrawal'])
      .order('created_at', { ascending: false });
      
    if (data && !error) {
      setTransfers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleUpdateStatus = async (txId: string, newStatus: string, userId: string, amount: number) => {
    if (!confirm(`Are you sure you want to ${newStatus} this transaction?`)) return;

    try {
        const res = await fetch('/api/admin/transactions/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txId, newStatus })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        alert(`Transaction ${newStatus} successfully.`);
        fetchWithdrawals();
    } catch (err: any) {
        alert(`Error updating status: ${err.message}`);
    }
  };

  if (loading) return <div>Loading withdrawals...</div>;

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden mb-8">
        <div className="bg-[#3498db] text-white px-4 py-3 border-b-4 border-black">
          <h3 className="font-bold tracking-widest text-sm uppercase">Manage Withdrawals</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EAEAEA] border-b border-gray-300 text-xs uppercase tracking-widest text-gray-700">
                <th className="p-3 border-r border-white font-bold">Date</th>
                <th className="p-3 border-r border-white font-bold">User</th>
                <th className="p-3 border-r border-white font-bold">Amount</th>
                <th className="p-3 border-r border-white font-bold">Type/Details</th>
                <th className="p-3 border-r border-white font-bold">Status</th>
                <th className="p-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500 text-sm">No withdrawals found.</td>
                </tr>
              ) : (
                transfers.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-sm border-r border-gray-100">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm font-medium border-r border-gray-100">
                      {tx.profiles?.first_name} {tx.profiles?.last_name} <br/>
                      <span className="text-gray-500 text-xs">{tx.profiles?.email}</span>
                    </td>
                    <td className="p-3 text-sm font-bold border-r border-gray-100 text-red-600">
                      ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-sm border-r border-gray-100 max-w-[200px] truncate">
                      <strong>{tx.type}</strong><br/>
                      <span className="text-gray-500 text-xs" title={tx.description}>{tx.description}</span>
                    </td>
                    <td className="p-3 text-sm border-r border-gray-100">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        tx.status === 'failed' || tx.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {tx.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'completed', tx.user_id, tx.amount)}
                            className="bg-[#2ecc71] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#27ae60] transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'rejected', tx.user_id, tx.amount)}
                            className="bg-[#e74c3c] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#c0392b] transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Processed</span>
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

