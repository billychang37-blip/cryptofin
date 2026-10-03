"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { CRYPTO_ASSETS } from '@/lib/constants';
import { createClient } from '@/lib/supabase';
import { AssetIcon } from '@/components/dashboard/AssetIcon';

export default function AssetsPage() {
   const router = useRouter();
   const supabase = createClient();
   const [prices, setPrices] = useState<Record<string, number>>({});
   const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
   const [wallet, setWallet] = useState<any>(null);

   useEffect(() => {
      const fetchWallet = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            const { data } = await supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
            if (data) setWallet(data);
         }
      };
      fetchWallet();
   }, []);

   useEffect(() => {
      const fetchPrices = async () => {
         try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,tron,binancecoin,polygon-ecosystem-token,avalanche-2&vs_currencies=usd&include_24hr_change=true');
            const data = await res.json();
            setPrices({
               ETH: data.ethereum?.usd || 0, BTC: data.bitcoin?.usd || 0, SOL: data.solana?.usd || 0,
               TRX: data.tron?.usd || 0, BNB: data.binancecoin?.usd || 0, MATIC: data['polygon-ecosystem-token']?.usd || 0,
               AVAX: data['avalanche-2']?.usd || 0, USDC: 1.00, USDT: 1.00
            });
            setPriceChanges({
               ETH: data.ethereum?.usd_24h_change || 0, BTC: data.bitcoin?.usd_24h_change || 0, SOL: data.solana?.usd_24h_change || 0,
               TRX: data.tron?.usd_24h_change || 0, BNB: data.binancecoin?.usd_24h_change || 0, MATIC: data['polygon-ecosystem-token']?.usd_24h_change || 0,
               AVAX: data['avalanche-2']?.usd_24h_change || 0, USDC: 0, USDT: 0
            });
         } catch (e) {
            console.error(e);
         }
      };
      fetchPrices();
   }, []);

   const getBalance = (assetId: string) => {
      if (!wallet) return 0;
      const map: Record<string, number> = {
         'BTC': wallet.btc_balance, 'ETH': wallet.balance, 
         'USDT': wallet.usdt_erc20_balance ?? wallet.usdt_balance, 
         'USDT_TRX': wallet.usdt_trc20_balance ?? wallet.usdt_balance,
         'USDT_BNB': wallet.usdt_bep20_balance ?? wallet.usdt_balance,
         'USDC_BNB': wallet.usdc_bep20_balance ?? wallet.usdc_balance,
         'USDC_SOL': wallet.usdc_solana_balance ?? wallet.usdc_balance,
         'USDC': wallet.usdc_balance,
         'SOL': wallet.sol_balance, 'TRX': wallet.trx_balance, 'BNB': wallet.bnb_balance, 
         'MATIC': wallet.matic_balance, 'AVAX': wallet.avax_balance,
         'USDT_SOL': wallet.usdt_sol_balance ?? wallet.usdt_balance,
         'USDT_MATIC': wallet.usdt_matic_balance ?? wallet.usdt_balance,
         'USDT_AVAX': wallet.usdt_avax_balance ?? wallet.usdt_balance,
      };
      return map[assetId] || 0;
   };

   return (
      <div className="flex-1 bg-transparent text-white">
         <div className="px-6 py-4 border-b border-[#111111]">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
               <ChevronLeft size={20} />
               <span className="font-medium text-sm">back</span>
            </button>
         </div>

         <div className="w-full">
            <div className="flex items-center justify-between p-5 border-b border-[#111111]">
               <div className="text-sm font-medium text-neutral-400">Name</div>
               <div className="flex flex-col items-end w-[140px]">
                  <button className="text-[#10b981] text-[13px] font-bold hover:opacity-80 transition-opacity mb-1">
                     +Add Asset
                  </button>
                  <div className="flex items-center justify-end w-full">
                     <span className="text-[11px] font-medium text-neutral-500">price</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col">
               {CRYPTO_ASSETS.map(asset => {
                  const balance = getBalance(asset.id);
                  const price = asset.id.startsWith('USDT') || asset.id.startsWith('USDC') ? 1 : (prices[asset.id] || 0);
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
                                 <span className={`text-[11px] font-bold tracking-tight ${isPositive ? 'text-[#10b981]' : 'text-red-500'}`}>
                                    {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(3)}%
                                 </span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="text-right flex flex-col justify-center items-end">
                           <div className="font-bold tracking-tight text-[14px] text-white font-sans">
                              {balance > 0 ? balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '0.0000'}
                           </div>
                           <div className="text-[12px] font-bold tracking-tight text-neutral-500 mt-0.5">
                              ${(balance * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </div>
                        </div>
                     </div>
                  )
               })}
            </div>
         </div>
      </div>
   );
}
