"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import { Toaster, toast } from 'sonner';

export default function AdminAddFundsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  
  // Wallet selection
  const [walletType, setWalletType] = useState("main"); 
  
  // Form fields
  const [amount, setAmount] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [inputMode, setInputMode] = useState<"crypto" | "usd">("crypto");
  
  const [fromName, setFromName] = useState("");
  const [fromBank, setFromBank] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [date, setDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [isGasFee, setIsGasFee] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [prices, setPrices] = useState<Record<string, number>>({});

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
    
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin,solana,tron,binancecoin,matic-network,avalanche-2&vs_currencies=usd');
        const data = await res.json();
        setPrices({
          btc: data.bitcoin?.usd || 0,
          eth: data.ethereum?.usd || 0,
          usdt_erc20: data.tether?.usd || 1,
          usdt_trc20: data.tether?.usd || 1,
          usdt_bep20: data.tether?.usd || 1,
          usdc_solana: data['usd-coin']?.usd || 1,
          usdc_bep20: data['usd-coin']?.usd || 1,
          sol: data.solana?.usd || 0,
          trx: data.tron?.usd || 0,
          bnb: data.binancecoin?.usd || 0,
          matic: data['matic-network']?.usd || 0,
          avax: data['avalanche-2']?.usd || 0,
          main: 1, // USD is 1
        });
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    };
    fetchPrices();
    
  }, []);
  
  // Calculate equivalent amounts
  useEffect(() => {
    const rate = prices[walletType] || 0;
    if (!rate) return;
    
    if (inputMode === 'crypto') {
        if (!amount) setAmountUsd("");
        else setAmountUsd((parseFloat(amount) * rate).toFixed(2));
    } else {
        if (!amountUsd) setAmount("");
        else setAmount((parseFloat(amountUsd) / rate).toFixed(6));
    }
  }, [amount, amountUsd, inputMode, walletType, prices]);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0 || !amount || isNaN(Number(amount))) {
      toast.error("Please select at least one user and enter a valid amount.");
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
          selectedUsers: selectedUsers.map(u => u.value),
          walletType, 
          amount, 
          fromName, 
          fromBank,
          fromAddress, 
          txHash, 
          date: finalDate, 
          sendEmail, 
          isGasFee
        })
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to add funds.");
      } else {
        toast.success(`Funds successfully added to ${result.count} user(s)!`);
        if (sendEmail) toast.success("Email notifications sent!");
        
        setAmount("");
        setAmountUsd("");
        setFromName("");
        setFromBank("");
        setFromAddress("");
        setTxHash("");
        setSelectedUsers([]);
        
        // Refresh users
        const usersRes = await fetch('/api/admin/users');
        const usersData = await usersRes.json();
        if (usersData.users) setUsers(usersData.users);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
    
    setSubmitting(false);
  };
  
  // Format for React Select
  const userOptions = users.map(u => {
    const name = u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'User';
    return {
      value: u.id,
      label: `${name} (${u.email || u.id})`,
      data: u
    };
  });
  
  const getBalanceDisplay = (u: any, type: string) => {
    if (type === 'main') return `$${Number(u.wallet_balance || 0).toLocaleString()}`;
    if (type === 'usdt_erc20') return `${Number(u.usdt_erc20_balance || 0)} USDT`;
    if (type === 'usdt_trc20') return `${Number(u.usdt_trc20_balance || 0)} USDT`;
    if (type === 'usdt_bep20') return `${Number(u.usdt_bep20_balance || 0)} USDT`;
    if (type === 'usdc_solana') return `${Number(u.usdc_solana_balance || 0)} USDC`;
    if (type === 'usdc_bep20') return `${Number(u.usdc_bep20_balance || 0)} USDC`;
    if (type === 'btc') return `${Number(u.btc_balance || 0)} BTC`;
    if (type === 'eth') return `${Number(u.balance || 0)} ETH`;
    if (type === 'bnb') return `${Number(u.bnb_balance || 0)} BNB`;
    if (type === 'sol') return `${Number(u.sol_balance || 0)} SOL`;
    if (type === 'trx') return `${Number(u.trx_balance || 0)} TRX`;
    if (type === 'matic') return `${Number(u.matic_balance || 0)} MATIC`;
    if (type === 'avax') return `${Number(u.avax_balance || 0)} AVAX`;
    return '0';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full animate-in fade-in duration-300 max-w-3xl">
      <Toaster position="top-center" richColors />
      <div className="bg-white border border-[#4EA7F8] rounded-sm shadow-sm overflow-hidden mb-8 relative">
        <div className="px-4 md:px-6 py-5 border-b border-[#EAEAEA] flex justify-between items-center">
          <h3 className="font-bold text-gray-600 text-sm md:text-[15px] uppercase tracking-wider">Add Funds</h3>
          <a href="/admin/deposits" className="text-[#3498db] text-xs font-bold hover:underline">Manage Deposits</a>
        </div>
        
        <form onSubmit={handleAddFunds} className="p-4 md:p-8 space-y-6">
          <div className="flex flex-col mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Crypto Asset: <span className="text-red-500">*</span></label>
            <select 
              value={walletType}
              onChange={e => setWalletType(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-sm bg-gray-50 outline-none focus:border-[#3498db] text-base text-gray-700"
            >
              <option value="btc">Bitcoin (BTC)</option>
              <option value="eth">Ethereum (ETH)</option>
              <option value="usdt_erc20">USDT (ERC20)</option>
              <option value="usdt_trc20">USDT (TRC20)</option>
              <option value="usdt_bep20">USDT (BEP20)</option>
              <option value="usdc_solana">USDC (Solana)</option>
              <option value="usdc_bep20">USDC (BEP20)</option>
              <option value="bnb">BNB (BEP20)</option>
              <option value="sol">Solana (SOL)</option>
              <option value="trx">Tron (TRX)</option>
              <option value="matic">Polygon (MATIC)</option>
              <option value="avax">Avalanche (AVAX)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select User(s): <span className="text-red-500">*</span></label>
            <Select
              isMulti
              options={userOptions}
              value={selectedUsers}
              onChange={(v: any) => setSelectedUsers(v)}
              className="text-base"
              styles={{
                control: (base) => ({
                    ...base,
                    minHeight: '48px',
                    borderRadius: '2px',
                    borderColor: '#D1D5DB'
                })
              }}
              placeholder="Search by name, email, or UID..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sending Wallet Address: <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input 
              type="text"
              value={fromAddress}
              onChange={e => setFromAddress(e.target.value)}
              placeholder="The crypto address the funds were sent from"
              className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-base text-gray-700 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID / Blockchain ID: <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input 
              type="text"
              value={txHash}
              onChange={e => setTxHash(e.target.value)}
              placeholder="TxHash"
              className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-base text-gray-700 font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-bold text-gray-700">Amount / Quantity: <span className="text-red-500">*</span></label>
                <div className="flex bg-gray-100 rounded-sm p-1 border border-gray-200">
                    <button 
                        type="button"
                        onClick={() => setInputMode('crypto')}
                        className={`text-xs px-3 py-1 font-bold rounded-sm ${inputMode === 'crypto' ? 'bg-white shadow-sm text-[#3498db]' : 'text-gray-500'}`}
                    >
                        CRYPTO
                    </button>
                    <button 
                        type="button"
                        onClick={() => setInputMode('usd')}
                        className={`text-xs px-3 py-1 font-bold rounded-sm ${inputMode === 'usd' ? 'bg-white shadow-sm text-[#3498db]' : 'text-gray-500'}`}
                    >
                        USD
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    {inputMode === 'usd' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</div>
                    )}
                    <input 
                      type="number"
                      step="any"
                      value={inputMode === 'crypto' ? amount : amountUsd}
                      onChange={e => {
                          if (inputMode === 'crypto') setAmount(e.target.value);
                          else setAmountUsd(e.target.value);
                      }}
                      placeholder="0.00"
                      className={`w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-base text-gray-700 font-bold ${inputMode === 'usd' ? 'pl-7' : ''}`}
                      required
                    />
                </div>
                <div className="text-sm font-bold text-gray-400 whitespace-nowrap">
                    ? {inputMode === 'crypto' ? `$${amountUsd || '0.00'}` : `${amount || '0'} ${walletType.split('_')[0].toUpperCase()}`}
                </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Date: <span className="text-red-500">*</span></label>
              <input 
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-base text-gray-700"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Custom Time: <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input 
                type="time"
                value={customTime}
                onChange={e => setCustomTime(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-sm outline-none focus:border-[#3498db] text-base text-gray-700"
              />
            </div>
          </div>

          <div className="flex flex-col mt-4 gap-4 border-t border-gray-100 pt-6">
            <div className="bg-gray-100 px-4 py-3 rounded-sm border border-gray-200 w-full overflow-x-auto">
              <span className="text-gray-600 text-sm font-bold block mb-2">Current Usable Balances (Selected Asset): </span>
              {selectedUsers.length > 0 ? (
                <div className="space-y-1">
                    {selectedUsers.map(su => (
                        <div key={su.value} className="text-sm flex justify-between">
                            <span className="text-gray-600">{su.label.split(' (')[0]}:</span>
                            <span className="text-[#3498db] font-bold">{getBalanceDisplay(su.data, walletType)}</span>
                        </div>
                    ))}
                </div>
              ) : <span className="text-sm text-gray-400 italic">Select users to view their balances</span>}
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={sendEmail} 
                    onChange={e => setSendEmail(e.target.checked)} 
                    className="w-4 h-4 text-[#3498db] border-gray-300 rounded cursor-pointer" 
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">Send Email Notification</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={isGasFee} 
                    onChange={e => setIsGasFee(e.target.checked)} 
                    className="w-4 h-4 text-[#3498db] border-gray-300 rounded cursor-pointer" 
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">Mark as Gas Fee Deposit</span>
                </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full sm:w-auto bg-[#00BFA5] text-white font-bold py-3 sm:py-2.5 px-8 rounded-sm hover:bg-[#00a38c] transition-colors disabled:bg-gray-400 shadow-sm text-sm uppercase tracking-wide"
            >
              {submitting ? 'Processing...' : 'Submit'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setAmount("");
                setAmountUsd("");
                setSelectedUsers([]);
                setFromAddress("");
                setTxHash("");
              }}
              className="w-full sm:w-auto bg-white border border-gray-300 text-gray-600 font-bold py-3 sm:py-2.5 px-8 rounded-sm hover:bg-gray-50 transition-colors shadow-sm text-sm uppercase tracking-wide"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
