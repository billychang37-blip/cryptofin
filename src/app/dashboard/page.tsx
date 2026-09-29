"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import {
  TbNavigation, TbTriangle, TbTriangleInverted, TbHistory, TbGridDots, TbHeadset, TbBell, TbCopy, TbUser, TbArrowUpRight, TbArrowDownLeft
} from 'react-icons/tb';
import { useSecurity } from '@/context/SecurityContext';
import { useTheme } from '@/context/ThemeContext';

import { ReceiveModal } from '@/components/dashboard/ReceiveModal';
import { SendModal } from '@/components/dashboard/SendModal';
import { AssetIcon } from '@/components/dashboard/AssetIcon';
import { ManageAssetsModal } from '@/components/dashboard/ManageAssetsModal';
import { CRYPTO_ASSETS } from '@/lib/constants';
import { toast } from 'sonner';

const FALLBACK_PRICES: Record<string, number> = {
  ETH: 2950.00, BTC: 65000.00, SOL: 145.00, TRX: 0.15, USDT: 1.00,
  BNB: 580.00, MATIC: 0.50, AVAX: 25.00, USDC: 1.00
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const { theme } = useTheme();
  const { requiresSetup, isLoading: isSecurityLoading } = useSecurity();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  const [userId, setUserId] = useState<string>('...');
  const [wallet, setWallet] = useState<any>(null);

  const [prices, setPrices] = useState<Record<string, number>>(FALLBACK_PRICES);
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({
     ETH: 2.704, BTC: 0.039, SOL: 2.216, TRX: -0.31, BNB: 1.448, MATIC: 0, AVAX: 0, USDT: 0, USDC: 0
  }); 

  const [showQR, setShowQR] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showManageAssets, setShowManageAssets] = useState(false);
  const [activeAsset, setActiveAsset] = useState('ETH');
  
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof window !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [visibleAssets, setVisibleAssets] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem('visible_assets');
    if (stored) {
      setVisibleAssets(JSON.parse(stored));
    } else {
      setVisibleAssets(['BTC', 'ETH', 'USDT', 'USDC', 'SOL']);
    }
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
      if (walletData) {
        setWallet(walletData); 
        setUserId(walletData.readable_id || 'Generating...'); 
        if (!walletData.trx_address) { 
          fetch('/api/wallet/upgrade', { method: 'POST', body: JSON.stringify({ userId: user.id }) })
          .then(() => supabase.from('wallets').select('*').eq('user_id', user.id).single())
          .then(({ data: updatedW }) => { if (updatedW) setWallet(updatedW); }); 
        }
      }
    } catch (e) { console.error(e); } finally { setCheckingAuth(false); }
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana,tron,binancecoin,polygon-ecosystem-token,avalanche-2&vs_currencies=usd&include_24hr_change=true');
      if (!res.ok) throw new Error("API Limit");
      const data = await res.json();
      setPrices({
        ETH: data.ethereum?.usd || FALLBACK_PRICES.ETH,
        BTC: data.bitcoin?.usd || FALLBACK_PRICES.BTC,
        SOL: data.solana?.usd || FALLBACK_PRICES.SOL,
        TRX: data.tron?.usd || FALLBACK_PRICES.TRX,
        BNB: data.binancecoin?.usd || FALLBACK_PRICES.BNB,
        MATIC: data['polygon-ecosystem-token']?.usd || FALLBACK_PRICES.MATIC,
        AVAX: data['avalanche-2']?.usd || FALLBACK_PRICES.AVAX,
        USDC: 1.00, USDT: 1.00
      });
      setPriceChanges({
        ETH: data.ethereum?.usd_24h_change || 2.704,
        BTC: data.bitcoin?.usd_24h_change || 0.039,
        SOL: data.solana?.usd_24h_change || 2.216,
        TRX: data.tron?.usd_24h_change || -0.31,
        BNB: data.binancecoin?.usd_24h_change || 1.448,
        MATIC: data['polygon-ecosystem-token']?.usd_24h_change || 0,
        AVAX: data['avalanche-2']?.usd_24h_change || 0,
        USDC: 0, USDT: 0
      });
    } catch (e) { console.log("Using fallback prices"); }
  };

  useEffect(() => {
    if (!wallet?.user_id) return;
    const syncChain = async () => {
      try {
        const resEth = await fetch('/api/wallet/sync', { method: 'POST', body: JSON.stringify({ userId: wallet.user_id, asset: 'ETH' }) });
        const resUsdt = await fetch('/api/wallet/sync', { method: 'POST', body: JSON.stringify({ userId: wallet.user_id, asset: 'USDT' }) });
        const dataEth = await resEth.json(); const dataUsdt = await resUsdt.json();
        if ((dataEth.success && dataEth.message?.includes("Deposit")) || (dataUsdt.success && dataUsdt.message?.includes("Deposit"))) {
          toast.success("New Deposit Received!");
          fetchData();
        }
      } catch (e) { console.error("Sync error"); }
    };
    syncChain();
    const interval = setInterval(syncChain, 30000);
    return () => clearInterval(interval);
  }, [wallet?.user_id]);

  useEffect(() => {
    fetchData();
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getBalance = (assetId: string) => {
    if (!wallet) return 0;
    const map: Record<string, number> = {
      'BTC': wallet.btc_balance, 'ETH': wallet.balance, 'USDT': wallet.usdt_balance,
      'SOL': wallet.sol_balance, 'TRX': wallet.trx_balance,
      'BNB': wallet.bnb_balance, 'MATIC': wallet.matic_balance,
      'AVAX': wallet.avax_balance, 'USDC': wallet.usdc_balance
    };
    return map[assetId] || 0;
  };

  const totalBalance = CRYPTO_ASSETS.reduce((acc, asset) => {
    return acc + (getBalance(asset.id) * (prices[asset.id] || 0));
  }, 0);

  if (isSecurityLoading || checkingAuth) {
    return <div className="min-h-[80vh] flex items-center justify-center p-4"><Loader2 className="animate-spin text-[#10b981]" size={32} /></div>;
  }

  const shouldShowSetup = (!wallet || requiresSetup) && !setupComplete;
  
  useEffect(() => {
    if (requiresSetup && !checkingAuth) {
      router.push('/auth/recovery-phrase');
    }
  }, [requiresSetup, checkingAuth, router]);

  if (shouldShowSetup) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-[#D4FF00] mb-4" size={32} />
        <p className="text-white text-sm font-semibold">Redirecting to complete account setup...</p>
      </div>
    );
  }

  const topGainers = [...CRYPTO_ASSETS]
    .filter(a => !a.id.includes('USD'))
    .sort((a, b) => (priceChanges[b.id] || 0) - (priceChanges[a.id] || 0))
    .slice(0, 7);

  const sortedAssets = CRYPTO_ASSETS.sort((a, b) => {
     const balA = getBalance(a.id);
     const balB = getBalance(b.id);
     if (balA > 0 && balB === 0) return -1;
     if (balB > 0 && balA === 0) return 1;
     return 0; 
  });

  return (
    <div className="w-full flex flex-col gap-[2px] flex-1 bg-transparent">

      {/* MODALS */}
      {showQR && wallet && <ReceiveModal asset={activeAsset} userAddress={wallet.address} onClose={() => setShowQR(false)} />}
      {showSend && <SendModal wallet={wallet} prices={prices} onClose={() => setShowSend(false)} onSuccess={fetchData} />}
      {showManageAssets && <ManageAssetsModal onClose={() => setShowManageAssets(false)} onUpdate={setVisibleAssets} />}

      {/* SECTION B: MAIN BALANCE CARD */}
      <div className="p-6 bg-[#1e1e1e] overflow-hidden">
         <div className="flex flex-col mb-2">
            <h3 className="text-[#10b981] font-bold text-base tracking-tight mb-1">Wallet</h3>
            <div 
               onClick={() => { navigator.clipboard.writeText(userId); toast.success("ID Copied"); }}
               className="flex items-center gap-1.5 text-[11px] font-medium text-white cursor-pointer hover:text-gray-300 transition-colors w-fit"
            >
               <span className="font-mono">{userId}</span>
               <TbCopy size={14} className="text-white" />
            </div>
         </div>

         <div className="text-left mt-2 mb-8 w-full">
            <h1 className="text-[28px] md:text-[30px] font-medium text-white break-all leading-tight">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
         </div>

         <div className="flex items-center justify-between w-full px-6 md:px-16 mt-2">
            {[
               { icon: <TbArrowUpRight size={20} strokeWidth={2} />, label: "Send", action: () => router.push('/dashboard/assets') },
               { icon: <TbArrowDownLeft size={20} strokeWidth={2} />, label: "Receive", action: () => router.push('/dashboard/assets') },
               { icon: <TbHistory size={20} strokeWidth={2} />, label: "History", action: () => router.push('/dashboard/transactions') },
               { icon: <TbGridDots size={20} strokeWidth={2} />, label: "More", action: () => toast.info("More features coming") }
            ].map((btn, i) => (
                 <button key={i} onClick={btn.action} className="flex flex-col items-center gap-2 group">
                    <div className="w-[38px] h-[38px] rounded-full bg-[#111111] flex items-center justify-center text-white hover:bg-[#252525] transition shadow-sm">
                      {btn.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-white tracking-wide group-hover:text-neutral-300 transition-colors">{btn.label}</span>
                 </button>
              ))}
         </div>
      </div>

      {/* SECTION C: TOP GAINERS */}
      <div className="p-5 bg-[#1e1e1e]">
         <h3 className="text-[15px] font-bold text-white mb-4">Top Gainers</h3>
         
         <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x">
            {topGainers.map((asset) => {
               const change = priceChanges[asset.id] || 0;
               const isPositive = change >= 0;
               return (
                  <div key={asset.id} className="snap-start flex-shrink-0 w-[160px] p-4 rounded-2xl bg-[#252525] border border-[#333333] shadow-sm">
                     <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 bg-[#1e1e1e] rounded-full p-1"><AssetIcon symbol={asset.id.split('_')[0]} size="sm" /></div>
                        <div className="flex flex-col">
                           <span className="text-[12px] font-bold text-white uppercase tracking-wider">{asset.id}</span>
                           <span className={`text-[10px] font-bold tracking-tight ${isPositive ? '+' : ''}`}>
                              {isPositive ? '+' : ''} {Math.abs(change).toFixed(3)}%
                           </span>
                        </div>
                     </div>
                     <div className="text-[14px] font-bold text-white tracking-tight">
                        ${(prices[asset.id] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                     </div>
                  </div>
               )
            })}
         </div>
      </div>

      {/* SECTION D: ASSETS LIST */}
      <div className="w-full bg-[#1e1e1e] flex-1 min-h-[300px]">
         <div className="flex items-center justify-between p-5 border-b border-[#111111]">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">NAME</div>
            <div className="flex flex-col items-end">
               <button onClick={() => setShowManageAssets(true)} className="text-[#10b981] text-[13px] font-bold hover:opacity-80 transition-opacity">
                  +Add Asset
               </button>
               <span className="text-[10px] font-medium text-neutral-500 mt-1 uppercase tracking-wider">LAST PRICE CHANGE</span>
            </div>
         </div>

         <div className="flex flex-col">
            {sortedAssets.map(asset => {
               const balance = getBalance(asset.id);
               const price = asset.id === 'USDT' || asset.id === 'USDC' ? 1 : (prices[asset.id] || 0);
               const change = priceChanges[asset.id] || 0;
               const isPositive = change >= 0;
               
               return (
                  <div 
                     key={asset.id}
                     onClick={() => router.push(`/dashboard/wallet/${asset.id}`)}
                     className="w-full flex items-center justify-between px-5 py-4 bg-[#1e1e1e] border-b border-[#111111] cursor-pointer hover:bg-[#252525] transition-colors"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-9 h-9"><AssetIcon symbol={asset.id.split('_')[0]} size="sm" /></div>
                        <div className="text-left flex flex-col">
                           <h3 className="font-bold text-[14px] text-white uppercase tracking-wide">{asset.name}</h3>
                           <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[12px] font-bold tracking-tight text-neutral-400">
                                 ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                              </span>
                              <span className={`text-[11px] font-bold tracking-tight ${isPositive ? '+' : ''}`}>
                                 {isPositive ? '+' : ''} {Math.abs(change).toFixed(3)}%
                              </span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="text-right flex flex-col justify-center items-end">
                        <div className="font-bold tracking-tight text-[14px] text-white font-sans">
                           {balance > 0 ? balance.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.0000'}
                        </div>
                        <div className="text-[12px] font-bold tracking-tight text-neutral-500 mt-0.5">
                           ${balance > 0 ? (balance * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* Bottom Manage Asset Button */}
         <div className="w-full bg-[#1e1e1e] p-5 flex items-center">
            <button 
               onClick={() => setShowManageAssets(true)}
               className="text-[#888888] font-bold text-[14px] hover:text-white transition-colors flex items-center gap-1"
            >
               Manage Asset <span className="text-lg leading-none">+</span>
            </button>
         </div>
      </div>
    </div>
  );
}


