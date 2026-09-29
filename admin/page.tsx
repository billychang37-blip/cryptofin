"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
const supabase = createClient();
import { Users, Box, X, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    suspendedUsers: 0
  });

  const [activeUsersList, setActiveUsersList] = useState<any[]>([]);

  const [txToday, setTxToday] = useState<Record<string, {d: number, w: number}>>({});
  const [txMonth, setTxMonth] = useState<Record<string, {d: number, w: number}>>({});

  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(true);
  const [adminName, setAdminName] = useState("Admin");

  // Standard display list
  const assetOrder = [
    { id: 'main', name: 'Main Wallet (Fiat USD)' },
    { id: 'eth', name: 'Ethereum' },
    { id: 'usdt_erc20', name: 'USDT (ERC20)' },
    { id: 'usdt_trc20', name: 'USDT (TRC20)' },
    { id: 'usdt_bep20', name: 'USDT (BEP20)' },
    { id: 'usdc_solana', name: 'USDC (Solana)' },
    { id: 'usdc_bep20', name: 'USDC (BEP20)' },
    { id: 'bnb', name: 'BNB' },
    { id: 'trx', name: 'TRX' },
    { id: 'btc', name: 'BTC' },
    { id: 'aave', name: 'AAVE' },
    { id: 'sol', name: 'SOL' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Admin Profile for Welcome Message
        const { data: { session } } = await supabase.auth.getSession();
        let name = "Admin";
        if (session) {
          const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', session.user.id).single();
          if (profile?.first_name) {
            name = profile.first_name;
            setAdminName(name);
          }
        }

        // Play voice greeting on mount
        try {
          const msg = new SpeechSynthesisUtterance(`Good morning ${name}, it's good to have you today.`);
          msg.rate = 0.9;
          window.speechSynthesis.speak(msg);
        } catch (e) {
          console.log("SpeechSynthesis not supported or blocked");
        }

        const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
        const data = await res.json();
        
        if (data.users) {
          const users = data.users;
          let active = 0, blocked = 0, suspended = 0;
          users.forEach((u: any) => {
            if (u.status === 'blocked') blocked++;
            else if (u.status === 'suspended') suspended++;
            else active++; // Default to active
          });
          
          setStats({
            totalUsers: users.length, 
            activeUsers: active,
            blockedUsers: blocked,
            suspendedUsers: suspended
          });

          const getCountryName = (countryCode: string) => {
            if (!countryCode) return '';
            try {
              const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
              return regionNames.of(countryCode);
            } catch (e) {
              return countryCode;
            }
          };

          // Show real active users based on last_active_at if it exists, otherwise fallback to recent users
          const activeUsers = users
            .filter((u: any) => u.last_ip || u.last_active_at)
            .sort((a: any, b: any) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime());
          
          const displayUsers = activeUsers.length > 0 ? activeUsers.slice(0, 10) : users.slice(0, 5);

          const formattedOnline = displayUsers.map((u: any) => {
            let status = "Active";
            let lastSeen = "Just now";
            
            if (u.last_active_at) {
              const minutesAgo = Math.floor((new Date().getTime() - new Date(u.last_active_at).getTime()) / 60000);
              if (minutesAgo > 60) {
                status = "Idle";
                lastSeen = `${Math.floor(minutesAgo/60)} hours ago`;
              } else if (minutesAgo > 5) {
                status = "Idle";
                lastSeen = `${minutesAgo} mins ago`;
              }
            } else {
              status = "Idle";
            }
            
            const countryName = getCountryName(u.last_country || '');

            return {
              ...u,
              ip: u.last_ip || "Unknown (Waiting for login)",
              countryCode: u.last_country ? u.last_country.toLowerCase() : null,
              countryName: countryName,
              statusText: status,
              lastSeen: lastSeen
            };
          });
          setActiveUsersList(formattedOnline);
        }

        if (data.txs) {
          const txs = data.txs;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        const todayAgg: Record<string, {d: number, w: number}> = {};
        const monthAgg: Record<string, {d: number, w: number}> = {};
        assetOrder.forEach(a => {
          todayAgg[a.id] = {d: 0, w: 0};
          monthAgg[a.id] = {d: 0, w: 0};
        });

        txs.forEach((tx: any) => {
          const txTime = new Date(tx.created_at).getTime();
          const amt = Number(tx.amount) || 0;
          const isToday = txTime >= startOfDay;
          const isThisMonth = txTime >= startOfMonth;
          
          let w = (tx.wallet_used || 'main').toLowerCase();
          // Normalize legacy/mismatched wallets
          if (w === 'usdt') w = 'usdt_erc20';
          if (w === 'usdc') w = 'usdc_solana';
          
          if (!todayAgg[w]) {
            todayAgg[w] = {d: 0, w: 0};
            monthAgg[w] = {d: 0, w: 0};
            // Add to assetOrder dynamically if it's a completely new wallet type
            if (!assetOrder.find(a => a.id === w)) {
              assetOrder.push({ id: w, name: w.toUpperCase() });
            }
          }

          if (tx.type === 'deposit') {
            if (isToday) todayAgg[w].d += amt;
            if (isThisMonth) monthAgg[w].d += amt;
          } else if (tx.type === 'transfer' || tx.type === 'crypto_transfer' || tx.type === 'withdrawal') {
            if (isToday) todayAgg[w].w += amt;
            if (isThisMonth) monthAgg[w].w += amt;
          }
        });

        setTxToday(todayAgg);
        setTxMonth(monthAgg);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const formatCryptoAmount = (amt: number, id: string) => {
    if (id === 'main') return `$${amt.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    let symbol = id.split('_')[0].toUpperCase();
    if (amt === 0) return `0.000 ${symbol}`;
    return `${amt.toLocaleString('en-US', {maximumFractionDigits: 6})} ${symbol}`;
  };

  if (loading) return <div className="p-8 text-gray-500 font-semibold">Loading dashboard data...</div>;

  return (
    <div className="w-full animate-in fade-in duration-300 relative font-sans">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-white border border-gray-200 shadow-xl rounded-sm flex items-start gap-3 px-6 py-4 z-50 w-max max-w-full animate-in slide-in-from-top-4">
          <span className="text-yellow-500 text-2xl">👋</span>
          <div className="text-left pr-8">
            <p className="text-[15px] font-bold text-gray-700">Good Morning, {adminName}. It's Good</p>
            <p className="text-[15px] font-bold text-gray-700 text-center">To Have You Today.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Top Stats Cards */}
      <div className="flex flex-row mt-16 mb-8 bg-white border border-gray-200 shadow-sm w-full overflow-hidden">
        
        <div className="flex flex-1 border-r border-gray-200">
          <div className="w-32 bg-[#00AEEF] flex flex-col items-center justify-center text-white py-5 px-2">
            <Users className="w-10 h-10 mb-2 text-white fill-current" />
            <span className="font-bold text-sm tracking-wide">Users</span>
            <span className="text-xs">[Total]</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-white">
            <span className="text-[26px] font-normal text-gray-700">{stats.totalUsers}</span>
          </div>
        </div>

        <div className="flex flex-1 border-r border-gray-200">
          <div className="w-32 bg-[#B8703C] flex flex-col items-center justify-center text-white py-5 px-2">
            <Users className="w-10 h-10 mb-2 text-white fill-current" />
            <span className="font-bold text-sm tracking-wide">Users</span>
            <span className="text-xs">[Active]</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-white">
            <span className="text-[26px] font-normal text-gray-700">{stats.activeUsers}</span>
          </div>
        </div>

        <div className="flex flex-1 border-r border-gray-200">
          <div className="w-32 bg-[#E94B35] flex flex-col items-center justify-center text-white py-5 px-2">
            <Users className="w-10 h-10 mb-2 text-white fill-current" />
            <span className="font-bold text-sm tracking-wide">Users</span>
            <span className="text-xs">[Blocked]</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-white">
            <span className="text-[26px] font-normal text-gray-700">{stats.blockedUsers}</span>
          </div>
        </div>

        <div className="flex flex-1">
          <div className="w-32 bg-[#25B89A] flex flex-col items-center justify-center text-white py-5 px-2">
            <Users className="w-10 h-10 mb-2 text-white fill-current" />
            <span className="font-bold text-sm tracking-wide">Users</span>
            <span className="text-xs">[Suspended]</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-white">
            <span className="text-[26px] font-normal text-gray-700">{stats.suspendedUsers}</span>
          </div>
        </div>

      </div>

      {/* Transaction Information Panel */}
      <div className="bg-white border border-[#4EA7F8] rounded-sm shadow-sm overflow-hidden mb-8">
        
        {/* Header */}
        <div className="bg-[#3498db] text-white px-4 py-3 flex items-center gap-2 border-b-2 border-[#1A252F]">
          <Box className="w-4 h-4" />
          <h3 className="font-bold text-[13px] uppercase tracking-wider">Transaction Information</h3>
        </div>

        {/* TODAY SECTION */}
        <div className="border-b border-gray-200">
          <div className="px-5 py-4">
            <h4 className="text-red-600 font-bold text-[13px] tracking-wide uppercase">Today:</h4>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f2f5] border-y border-gray-200 text-gray-500 text-[11px] font-bold tracking-wider">
                <th className="px-5 py-3 w-1/3">MEDIUM</th>
                <th className="px-5 py-3 w-1/3 text-center">DEPOSITS</th>
                <th className="px-5 py-3 w-1/3 text-center">WITHDRAWAL</th>
              </tr>
            </thead>
            <tbody>
              {assetOrder.map((asset, idx) => {
                const isEven = idx % 2 === 0;
                const deposits = txToday[asset.id]?.d || 0;
                const withdraws = txToday[asset.id]?.w || 0;
                // Only hide if it's completely zero and not one of the main ones we always want to show
                if (deposits === 0 && withdraws === 0 && !['main', 'eth', 'usdt_erc20'].includes(asset.id)) return null;

                return (
                  <tr key={`today-${asset.id}`} className={`${isEven ? 'bg-white' : 'bg-[#fafafa]'} border-b border-gray-100 text-gray-600 text-[13px] font-semibold hover:bg-gray-50`}>
                    <td className="px-5 py-4">{asset.name}</td>
                    <td className="px-5 py-4 text-center">{formatCryptoAmount(deposits, asset.id)}</td>
                    <td className="px-5 py-4 text-center">{formatCryptoAmount(withdraws, asset.id)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* THIS MONTH SECTION */}
        <div>
          <div className="px-5 py-4">
            <h4 className="text-red-600 font-bold text-[13px] tracking-wide uppercase">This Month:</h4>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f2f5] border-y border-gray-200 text-gray-500 text-[11px] font-bold tracking-wider">
                <th className="px-5 py-3 w-1/3">MEDIUM</th>
                <th className="px-5 py-3 w-1/3 text-center">DEPOSITS</th>
                <th className="px-5 py-3 w-1/3 text-center">WITHDRAWAL</th>
              </tr>
            </thead>
            <tbody>
              {assetOrder.map((asset, idx) => {
                const isEven = idx % 2 === 0;
                const deposits = txMonth[asset.id]?.d || 0;
                const withdraws = txMonth[asset.id]?.w || 0;
                // Only hide if it's completely zero and not one of the main ones we always want to show
                if (deposits === 0 && withdraws === 0 && !['main', 'eth', 'usdt_erc20'].includes(asset.id)) return null;

                return (
                  <tr key={`month-${asset.id}`} className={`${isEven ? 'bg-white' : 'bg-[#fafafa]'} border-b border-gray-100 text-gray-600 text-[13px] font-semibold hover:bg-gray-50`}>
                    <td className="px-5 py-4">{asset.name}</td>
                    <td className="px-5 py-4 text-center">{formatCryptoAmount(deposits, asset.id)}</td>
                    <td className="px-5 py-4 text-center">{formatCryptoAmount(withdraws, asset.id)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Real-time Users & IPs Section */}
      <div className="bg-white border border-[#4EA7F8] rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="bg-[#3498db] text-white px-4 py-3 flex items-center gap-2 border-b-2 border-[#1A252F]">
          <Activity className="w-4 h-4" />
          <h3 className="font-bold text-[13px] uppercase tracking-wider">Real-Time Active Users & Traffic</h3>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f2f5] border-b border-gray-200 text-gray-500 text-[11px] font-bold tracking-wider">
              <th className="px-5 py-3">USER</th>
              <th className="px-5 py-3">EMAIL</th>
              <th className="px-5 py-3">IP ADDRESS</th>
              <th className="px-5 py-3">STATUS</th>
              <th className="px-5 py-3">LAST SEEN</th>
            </tr>
          </thead>
          <tbody>
            {activeUsersList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-[13px]">No users currently active.</td>
              </tr>
            ) : (
              activeUsersList.map((u, idx) => (
                <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'} border-b border-gray-100 text-gray-600 text-[13px] font-semibold`}>
                  <td className="px-5 py-3">{u.first_name} {u.last_name}</td>
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3 font-mono text-blue-600">
                    <div>{u.ip}</div>
                    {u.countryCode && (
                      <div className="text-xs text-gray-500 font-sans mt-0.5 flex items-center gap-1.5">
                        <img 
                          src={`https://flagcdn.com/w20/${u.countryCode}.png`} 
                          alt={u.countryCode} 
                          className="w-4 h-auto rounded-sm shadow-sm"
                        />
                        {u.countryName}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`flex items-center gap-2 ${u.statusText === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${u.statusText === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      {u.statusText}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.lastSeen}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

