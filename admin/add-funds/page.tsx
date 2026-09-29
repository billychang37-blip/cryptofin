"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
const supabase = createClient();

export default function AdminAddFundsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  
  // Wallet selection
  const [walletType, setWalletType] = useState("main"); // 'main', 'btc', 'eth', 'usdt'
  
  // Form fields
  const [amount, setAmount] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromBank, setFromBank] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [date, setDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.users) setUsers(data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || isNaN(Number(amount))) {
      alert("Please select a user and enter a valid amount.");
      return;
    }

    setSubmitting(true);
    
    let finalDate = date;
    const todayString = new Date().toISOString().split('T')[0];
    if (customTime) {
      finalDate = new Date(`${date}T${customTime}:00`).toISOString();
    } else if (date === todayString) {
      finalDate = new Date().toISOString();
    } else {
      const now = new Date();
      const hr = now.getHours().toString().padStart(2, '0');
      const mn = now.getMinutes().toString().padStart(2, '0');
      finalDate = `${date}T${hr}:${mn}:00.000Z`;
    }
    
    try {
      const res = await fetch('/api/admin/add-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedUser, walletType, amount, fromName, fromBank,
          fromAddress, txHash, date: finalDate, sendEmail
        })
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Failed to add funds.");
      } else {
        alert(sendEmail ? "Funds successfully added and email notification sent!" : "Funds successfully added!");
        setAmount("");
        setFromName("");
        setFromBank("");
        setFromAddress("");
        setTxHash("");
        
        // Refresh users
        const usersRes = await fetch('/api/admin/users');
        const usersData = await usersRes.json();
        if (usersData.users) setUsers(usersData.users);
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    }
    
    setSubmitting(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full animate-in fade-in duration-300 max-w-3xl">
      <div className="bg-white border border-[#4EA7F8] rounded-sm shadow-sm overflow-hidden mb-8 relative">
        <div className="px-6 py-5 border-b border-[#EAEAEA] flex justify-between items-center">
          <h3 className="font-bold text-gray-600 text-[15px] uppercase tracking-wider">Add Funds</h3>
          <a href="/admin/deposits" className="text-[#3498db] text-xs font-bold hover:underline">Go to Manage Deposits</a>
        </div>
        
        <form onSubmit={handleAddFunds} className="p-6 p-8 space-y-6">
          
          <div className="flex flex-col mb-4">
            <label className="text-sm font-bold text-gray-700 mb-2">Fund Type: <span className="text-red-500">*</span></label>
            <div className="flex space-x-6 mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="walletType" value="main" checked={walletType === 'main'} onChange={() => setWalletType('main')} className="w-4 h-4 text-[#3498db]" />
                <span className="text-sm font-medium text-gray-600">Main Wallet (Fiat USD)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="walletType" value="crypto" checked={walletType.startsWith('usd')} onChange={() => setWalletType('usdt_erc20')} className="w-4 h-4 text-[#3498db]" />
                <span className="text-sm font-medium text-gray-600">Crypto Deposit</span>
              </label>
            </div>
          </div>

          {walletType.startsWith('usd') && (
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Crypto Asset: <span className="text-red-500">*</span></label>
                <select 
                  value={walletType}
                  onChange={e => setWalletType(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-sm bg-gray-50 outline-none focus:border-[#3498db] text-sm text-gray-700"
                >
                  <option value="usdt_erc20">USDT (ERC20)</option>
                  <option value="usdt_trc20">USDT (TRC20)</option>
                  <option value="usdt_bep20">USDT (BEP20)</option>
                  <option value="usdc_solana">USDC (Solana)</option>
                  <option value="usdc_bep20">USDC (BEP20)</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">User: <span className="text-red-500">*</span></label>
            <div 
              onClick={() => setShowUserModal(true)}
              className="w-full border border-gray-300 p-3 rounded-sm bg-gray-50 text-sm text-gray-700 cursor-pointer flex justify-between items-center hover:border-[#3498db] transition-colors"
            >
              <span>
                {selectedUser 
                  ? (() => {
                      const u = users.find(x => x.id === selectedUser);
                      return u ? `${u.first_name} ${u.last_name} (${u.email})` : 'Select a user...';
                    })()
                  : 'Select a user...'}
              </span>
              <span className="text-gray-400 font-bold">▼</span>
            </div>
            
            {selectedUser && (() => {
              const u = users.find(x => x.id === selectedUser);
              if (!u) return null;
              const formatAccount = (acc: string) => {
                if (!acc) return 'Not Generated';
                const clean = String(acc).replace(/\D/g, '');
                return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
              };
              return (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-sm text-sm text-blue-800 flex gap-6">
                  <div><span className="font-semibold text-blue-900">Account:</span> {formatAccount(u.account_number)}</div>
                  <div><span className="font-semibold text-blue-900">Base Currency:</span> {u.currency || 'USD'}</div>
                </div>
              );
            })()}
          </div>

          {walletType === 'main' ? (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">From Bank Name: <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input 
                  type="text"
                  value={fromBank}
                  onChange={e => setFromBank(e.target.value)}
                  placeholder="e.g. Chase Bank, Bank of America"
                  className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sender Name: <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input 
                  type="text"
                  value={fromName}
                  onChange={e => setFromName(e.target.value)}
                  placeholder="e.g. John Doe, ACME Corp"
                  className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-sm text-gray-700"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sending Wallet Address: <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input 
                  type="text"
                  value={fromAddress}
                  onChange={e => setFromAddress(e.target.value)}
                  placeholder="The crypto address the funds were sent from"
                  className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-sm text-gray-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID / Blockchain ID: <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input 
                  type="text"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  placeholder="TxHash"
                  className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-sm text-gray-700 font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Amount / Quantity: <span className="text-red-500">*</span></label>
            <input 
              type="number"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={walletType === 'main' ? "e.g. 5000" : "e.g. 0.5"}
              className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-sm text-gray-700 font-bold"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Date: <span className="text-red-500">*</span></label>
              <input 
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-sm text-gray-700"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Custom Time: <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input 
                type="time"
                value={customTime}
                onChange={e => setCustomTime(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-sm text-gray-700"
              />
            </div>
          </div>

          <div className="flex flex-col mt-4 gap-4 border-t border-gray-100 pt-6">
            <div className="bg-gray-100 px-4 py-2 inline-flex self-start rounded border border-gray-200">
              <span className="text-gray-600 text-sm font-bold">Usable Balance: </span>
              {selectedUser && users.find(u => u.id === selectedUser) ? (
                <span className="ml-2 text-[#3498db] font-bold">
                  {walletType === 'main' ? `$${Number(users.find(u => u.id === selectedUser)?.wallet_balance || 0).toLocaleString()}` : ''}
                  {walletType === 'usdt_erc20' ? `${Number(users.find(u => u.id === selectedUser)?.usdt_erc20_balance || 0)} USDT` : ''}
                  {walletType === 'usdt_trc20' ? `${Number(users.find(u => u.id === selectedUser)?.usdt_trc20_balance || 0)} USDT` : ''}
                  {walletType === 'usdt_bep20' ? `${Number(users.find(u => u.id === selectedUser)?.usdt_bep20_balance || 0)} USDT` : ''}
                  {walletType === 'usdc_solana' ? `${Number(users.find(u => u.id === selectedUser)?.usdc_solana_balance || 0)} USDC` : ''}
                  {walletType === 'usdc_bep20' ? `${Number(users.find(u => u.id === selectedUser)?.usdc_bep20_balance || 0)} USDC` : ''}
                </span>
              ) : <span className="ml-2 text-gray-400">Select a user</span>}
            </div>

            <label className="flex items-center space-x-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={sendEmail} 
                onChange={e => setSendEmail(e.target.checked)} 
                className="w-4 h-4 text-[#3498db] border-gray-300 rounded cursor-pointer" 
              />
              <span className="text-sm font-bold text-red-600 group-hover:text-red-700">Send Email Notification</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-[#00BFA5] text-white font-bold py-2.5 px-8 rounded-sm hover:bg-[#00a38c] transition-colors disabled:bg-gray-400 shadow-sm text-sm uppercase tracking-wide"
            >
              {submitting ? 'Processing...' : 'Submit'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setAmount("");
                setSelectedUser("");
                setFromName("");
                setFromBank("");
                setFromAddress("");
                setTxHash("");
              }}
              className="bg-white border border-gray-300 text-gray-600 font-bold py-2.5 px-8 rounded-sm hover:bg-gray-50 transition-colors shadow-sm text-sm uppercase tracking-wide"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showUserModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[100] flex items-center justify-center bg-black/60 p-4 min-w-[980px]">
          <div className="bg-white rounded shadow-xl w-[500px] flex flex-col max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-white border-b-2 border-blue-500 px-4 py-3">
              <h2 className="text-blue-500 text-sm font-bold tracking-widest uppercase">Select Users</h2>
              <button 
                onClick={() => setShowUserModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-sm transition-colors text-xs font-bold"
              >
                X
              </button>
            </div>
            
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <input 
                type="text"
                placeholder="Search..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full border border-blue-200 p-2 rounded outline-none focus:border-blue-500 text-sm"
              />
            </div>
            
            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {users.filter(u => {
                const search = userSearch.toLowerCase();
                const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
                const email = (u.email || '').toLowerCase();
                const acct = (u.account_number || '').toLowerCase();
                return name.includes(search) || email.includes(search) || acct.includes(search);
              }).map(u => (
                <div 
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u.id);
                    setShowUserModal(false);
                    setUserSearch("");
                  }}
                  className={`p-3 border rounded cursor-pointer transition-colors ${selectedUser === u.id ? 'bg-blue-50 border-blue-400' : 'bg-gray-200 border-gray-300 hover:bg-gray-300'}`}
                >
                  <div className="font-bold text-gray-800 text-sm">{u.first_name} {u.last_name}</div>
                  <div className="text-blue-600 text-xs font-bold font-mono my-0.5">{u.account_number || 'No Account #'}</div>
                  <div className="text-gray-600 text-xs">{u.email}</div>
                </div>
              ))}
              {users.length > 0 && users.filter(u => {
                const search = userSearch.toLowerCase();
                const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
                const email = (u.email || '').toLowerCase();
                const acct = (u.account_number || '').toLowerCase();
                return name.includes(search) || email.includes(search) || acct.includes(search);
              }).length === 0 && (
                <div className="text-center text-sm text-gray-500 py-4">No users found.</div>
              )}
            </div>
            
            {/* Footer Buttons */}
            <div className="p-4 bg-white border-t border-gray-200 flex gap-4">
              <button 
                onClick={() => setShowUserModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-bold text-xs rounded hover:bg-gray-50"
              >
                Submit ({selectedUser ? '1' : '0'})
              </button>
              <button 
                onClick={() => setSelectedUser("")}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-bold text-xs rounded hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




