
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";
import { Copy } from "lucide-react";

const supabase = createClient();

const formatNetwork = (currency: string) => {
    if (!currency) return 'Unknown';
    if (currency === 'USDT' || currency === 'USDC') return `${currency} (ERC20)`;
    if (currency.includes('_TRX')) return `${currency.split('_')[0]} (TRC20)`;
    if (currency.includes('_BNB')) return `${currency.split('_')[0]} (BEP20)`;
    if (currency.includes('_SOL')) return `${currency.split('_')[0]} (SOLANA)`;
    if (currency.includes('_MATIC')) return `${currency.split('_')[0]} (POLYGON)`;
    if (currency.includes('_AVAX')) return `${currency.split('_')[0]} (AVALANCHE)`;
    return currency;
}

export default function AdminWithdrawalsPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      const res = await fetch('/api/admin/transactions?type=withdrawal');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTransfers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        
        toast.success(`Transaction ${newStatus} successfully.`);
        fetchTransfers();
    } catch (err: any) {
        toast.error(`Error updating status: ${err.message}`);
    }
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      toast.success("Address copied");
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading withdrawals...</div>;

  return (
    <div className="w-full animate-in fade-in duration-300 pb-12">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="bg-[#1f2937] text-white px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold tracking-wider text-[15px] uppercase flex items-center gap-2">
             Manage Withdrawals
          </h3>
          <span className="bg-blue-500/20 text-blue-100 text-xs px-3 py-1 rounded-full border border-blue-500/30">
              {transfers.filter(t => t.status === 'pending').length} Pending
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600">
                <th className="p-4 font-bold border-r border-gray-100">Date</th>
                <th className="p-4 font-bold border-r border-gray-100">User</th>
                <th className="p-4 font-bold border-r border-gray-100">Amount</th>
                <th className="p-4 font-bold border-r border-gray-100">Token & Network</th>
                <th className="p-4 font-bold border-r border-gray-100">Status</th>
                <th className="p-4 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">No withdrawals found.</td>
                </tr>
              ) : (
                transfers.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-[13px] border-r border-gray-50 text-gray-900 font-medium whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 border-r border-gray-50">
                      <Link href={`/admin/members/${tx.user_id}`} className="block group">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {tx.profiles?.first_name || 'Unknown'} {tx.profiles?.last_name || 'User'}
                          </span>
                          <span className="text-gray-500 text-xs block mt-0.5 group-hover:text-blue-500">{tx.profiles?.email}</span>
                      </Link>
                    </td>
                    <td className="p-4 text-sm font-bold border-r border-gray-50 text-red-600">
                      ${Math.abs(Number(tx.amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className="p-4 border-r border-gray-50">
                      <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center text-[13px] font-bold text-gray-900 bg-gray-100 w-max px-2 py-0.5 rounded border border-gray-200">
                              {formatNetwork(tx.currency)}
                          </span>
                          
                          {tx.to_address && (
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500 font-medium">To:</span>
                                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
                                      <code className="text-[11px] text-gray-700 font-mono">
                                          {tx.to_address.slice(0,6)}...{tx.to_address.slice(-6)}
                                      </code>
                                      <button 
                                        onClick={() => handleCopy(tx.to_address)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Copy full address"
                                      >
                                          <Copy size={13} />
                                      </button>
                                  </div>
                              </div>
                          )}
                      </div>
                    </td>
                    <td className="p-4 text-sm border-r border-gray-50">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        tx.status === 'failed' || tx.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {tx.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {tx.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'completed', tx.user_id, tx.amount)}
                            className="bg-[#10b981] text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-[#059669] transition-all shadow-sm active:scale-95"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(tx.id, 'rejected', tx.user_id, tx.amount)}
                            className="bg-red-500 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-red-600 transition-all shadow-sm active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs font-medium italic">Processed</span>
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
