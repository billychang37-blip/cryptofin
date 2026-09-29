"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
const supabase = createClient();

export default function AdminSavingsPage() {
  const [savings, setSavings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavings = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(first_name, last_name, email)')
      .eq('type', 'savings_deposit')
      .order('created_at', { ascending: false });
    
    if (data) setSavings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const handleUpdateStatus = async (txId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this savings pocket?`)) return;

    const { error } = await supabase
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', txId);
      
    if (!error) {
      alert(`Savings pocket ${newStatus}`);
      fetchSavings();
    } else {
      alert(`Error updating status: ${error.message}`);
    }
  };

  if (loading) return <div>Loading savings...</div>;

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden mb-8">
        <div className="bg-[#3498db] text-white px-4 py-3 border-b-4 border-black">
          <h3 className="font-bold tracking-widest text-sm uppercase">Manage Savings Pockets</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EAEAEA] border-b border-gray-300 text-xs uppercase tracking-widest text-gray-700">
                <th className="p-3 border-r border-white font-bold">Date</th>
                <th className="p-3 border-r border-white font-bold">User</th>
                <th className="p-3 border-r border-white font-bold">Pocket Name / Details</th>
                <th className="p-3 border-r border-white font-bold">Deposit Amount</th>
                <th className="p-3 border-r border-white font-bold">Status</th>
                <th className="p-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {savings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500 text-sm">No savings deposits found.</td>
                </tr>
              ) : (
                savings.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-sm border-r border-gray-100">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm font-medium border-r border-gray-100">
                      {tx.profiles?.first_name} {tx.profiles?.last_name} <br/>
                      <span className="text-gray-500 text-xs">{tx.profiles?.email}</span>
                    </td>
                    <td className="p-3 text-sm border-r border-gray-100 max-w-[200px] truncate">
                      <strong>{tx.description}</strong>
                    </td>
                    <td className="p-3 text-sm font-bold border-r border-gray-100 text-green-600">
                      ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                      {tx.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'completed')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'rejected')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {tx.status !== 'pending' && (
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

