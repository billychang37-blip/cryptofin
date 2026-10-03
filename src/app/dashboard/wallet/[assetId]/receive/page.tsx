"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Copy } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';
import { AssetIcon } from '@/components/dashboard/AssetIcon';

const NETWORKS: Record<string, string> = {
  'BTC': 'Bitcoin Network',
  'ETH': 'Ethereum (ERC20)',
  'USDT': 'Ethereum (ERC20)',
  'USDT_TRX': 'Tron (TRC20)',
  'USDT_BNB': 'BNB Smart Chain (BEP20)',
  'USDT_SOL': 'Solana',
  'USDT_MATIC': 'Polygon Network',
  'USDT_AVAX': 'Avalanche C-Chain',
  'USDC': 'Ethereum (ERC20)',
  'USDC_BNB': 'BNB Smart Chain (BEP20)',
  'USDC_SOL': 'Solana',
  'USDC_MATIC': 'Polygon Network',
  'USDC_AVAX': 'Avalanche C-Chain',
  'SOL': 'Solana',
  'TRX': 'Tron (TRC20)',
  'BNB': 'BNB Smart Chain (BEP20)',
  'MATIC': 'Polygon Network',
  'AVAX': 'Avalanche C-Chain'
};

export default function ReceivePage() {
   const router = useRouter();
   const params = useParams();
   const assetId = (params?.assetId as string) || 'ETH';
   const baseSymbol = assetId.split('_')[0];
   
   const supabase = createClient();
   const [wallet, setWallet] = useState<any>(null);
   const [amount, setAmount] = useState('');
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      const fetchWallet = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            const { data } = await supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
            
            // Auto-upgrade legacy wallets on the fly
            if (data && !data.trx_address) {
               try {
                  await fetch('/api/wallet/upgrade', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ userId: user.id })
                  });
                  const { data: upgraded } = await supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
                  if (upgraded) setWallet(upgraded);
               } catch (e) {
                  setWallet(data);
               }
            } else {
               setWallet(data);
            }
         }
      };
      fetchWallet();
   }, []);

   let address = '';
   if (wallet) {
      if (['BTC'].includes(assetId)) address = wallet.btc_address;
      else if (['TRX', 'USDT_TRX'].includes(assetId)) address = wallet.trx_address;
      else if (['SOL', 'USDT_SOL', 'USDC_SOL'].includes(assetId)) address = wallet.sol_address;
      else address = wallet.address; // EVM address
   }

   const handleCopy = () => {
      if (!address) return;
      navigator.clipboard.writeText(address);
      toast.success("Address Copied");
   };

   const handleDeposit = async () => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
         toast.error("Please enter a valid deposit amount");
         return;
      }
      setLoading(true);
      try {
         const res = await fetch('/api/wallet/transactions/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               type: 'deposit',
               assetId: assetId,
               amount: Number(amount),
               toAddress: address
            })
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         
         toast.success("Deposit request logged successfully!");
         setAmount('');
         router.push('/dashboard/transactions');
      } catch (err: any) {
         toast.error(err.message || 'Failed to log deposit');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex-1 bg-transparent text-white flex flex-col items-center">
         <div className="w-full px-6 pt-10 pb-4 self-start max-w-4xl mx-auto">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
               <ChevronLeft size={20} />
               <span className="font-medium text-sm">back</span>
            </button>
         </div>

         <div className="flex items-center gap-2 mt-4 mb-4">
            <div className="w-6 h-6"><AssetIcon symbol={baseSymbol} size="sm" /></div>
            <span className="font-bold text-[15px]">{NETWORKS[assetId] === 'Tron (TRC20)' ? 'TRC20' : assetId}</span>
         </div>

         <div className="border-[2px] border-[#10b981] p-2 rounded-[20px] bg-white mb-8 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            {address ? (
               <div className="relative">
                  <QRCode value={address} size={170} level="M" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="bg-white p-1 rounded-sm shadow-md">
                        <div className="w-4 h-4"><AssetIcon symbol={baseSymbol} size="sm" /></div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="w-[170px] h-[170px] flex items-center justify-center text-gray-500 font-medium text-sm">
                  Loading...
               </div>
            )}
         </div>

         <div className="w-full max-w-4xl mx-auto px-6 flex flex-col gap-4 mt-4 mb-6">
            <div className="bg-[#1c1c1c] rounded-xl p-4 border border-[#333]">
               <label className="text-neutral-400 text-xs uppercase tracking-widest font-bold mb-2 block">Amount Sent</label>
               <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-white text-lg font-mono outline-none border-b border-neutral-700 pb-2 mb-4 placeholder:text-neutral-600 focus:border-[#10b981] transition-colors"
               />
               <button 
                  onClick={handleDeposit}
                  disabled={loading}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
               >
                  {loading ? 'Processing...' : "I've Deposited"}
               </button>
            </div>
         </div>

         <div className="w-full max-w-4xl mx-auto px-6 flex flex-col gap-0 text-[13px] text-neutral-400 mt-2 pb-24">
            <div className="flex flex-col gap-0 border-b border-[#10b981]/60 py-2">
               <span className="font-medium text-neutral-500 mb-0.5">Address</span>
               <div className="flex items-center justify-between text-white cursor-pointer hover:text-gray-300" onClick={handleCopy}>
                  <span className="font-normal font-mono text-[12px] md:text-[13px] break-all tracking-wide text-neutral-200 pr-4 leading-none">{address || 'Loading...'}</span>
                  <Copy size={12} className="text-neutral-400 shrink-0" />
               </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#10b981]/60 py-2">
               <span className="font-medium text-neutral-500">Deposit Arrival</span>
               <span className="font-normal text-neutral-400">20 Confirmation</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#10b981]/60 py-2">
               <span className="font-medium text-neutral-500">Network</span>
               <span className="font-normal text-neutral-400 uppercase">{NETWORKS[assetId] || assetId}</span>
            </div>
         </div>
      </div>
   );
}
