"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, LineChart, ArrowUpRight, ArrowDownLeft, Link2, Database, Coins } from 'lucide-react';
import { CRYPTO_ASSETS } from '@/lib/constants';
import { createClient } from '@/lib/supabase';
import { AssetIcon } from '@/components/dashboard/AssetIcon';
import { SendModal } from '@/components/dashboard/SendModal';

export default function IndividualWalletPage() {
   const router = useRouter();
   const params = useParams();
   const assetId = (params?.assetId as string) || 'ETH';
   
   const supabase = createClient();
   const [wallet, setWallet] = useState<any>(null);
   const [price, setPrice] = useState<number>(0);
   const [showSend, setShowSend] = useState(false);
   const [showChart, setShowChart] = useState(false);
   const [transactions, setTransactions] = useState<any[]>([]);

   const assetMeta = CRYPTO_ASSETS.find(a => a.id === assetId) || CRYPTO_ASSETS[1]; // default ETH

   const fetchWallet = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data } = await supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
         if (data) setWallet(data);

         // Fetch transactions for this exact asset to prevent clashing
         const { data: txs } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('currency', assetId)
            .order('created_at', { ascending: false });
         if (txs) setTransactions(txs);
      }
   };

   useEffect(() => {
      fetchWallet();
   }, []);

   useEffect(() => {
      const fetchPrice = async () => {
         if (assetId.includes('USD')) {
            setPrice(1);
            return;
         }
         try {
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tron,binancecoin,polygon-ecosystem-token,avalanche-2&vs_currencies=usd`);
            const data = await res.json();
            const map: any = {
               'ETH': data.ethereum?.usd, 'BTC': data.bitcoin?.usd, 'SOL': data.solana?.usd,
               'TRX': data.tron?.usd, 'BNB': data.binancecoin?.usd, 'MATIC': data['polygon-ecosystem-token']?.usd,
               'AVAX': data['avalanche-2']?.usd
            };
            setPrice(map[assetId.split('_')[0]] || 0);
         } catch (e) { }
      };
      fetchPrice();
   }, [assetId]);

   const getBalance = () => {
      if (!wallet) return 0;
      const map: Record<string, number> = {
         'BTC': wallet.btc_balance, 'ETH': wallet.balance, 'USDT': wallet.usdt_balance,
         'SOL': wallet.sol_balance, 'TRX': wallet.trx_balance, 'BNB': wallet.bnb_balance, 
         'MATIC': wallet.matic_balance, 'AVAX': wallet.avax_balance, 'USDC': wallet.usdc_balance
      };
      return map[assetId] || 0;
   };

   const balance = getBalance();

   return (
      <div className="flex-1 bg-transparent text-white">
         <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
            <div className="px-5 pt-6 pb-4 w-full">
               <button onClick={() => router.back()} className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
                  <ChevronLeft size={20} />
                  <span className="font-medium text-sm">back</span>
               </button>
            </div>

            <div className="bg-[#1e1e1e] w-full flex flex-col items-center pt-8 pb-8 border-b border-[#121212]">
               <div className="w-12 h-12 mb-4">
                  <AssetIcon symbol={assetId.split('_')[0]} size="lg" />
               </div>
               
               <h1 className="text-[32px] font-bold tracking-tight text-white mb-2">
                  {balance > 0 ? balance.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.000000'} <span className="text-[16px] font-medium tracking-normal text-white">{assetId}</span>
               </h1>
               
               <div className="flex items-center gap-2 text-sm font-bold text-[#10b981] tracking-tight">
                  <span>${balance > 0 ? (balance * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                  <span className="text-neutral-500 font-medium">|</span>
                  <span className="text-white">${price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</span>
               </div>

               <div className="flex items-center justify-around w-full px-4 md:px-16 mt-10">
                  <div className="flex flex-col items-center gap-3">
                     <button onClick={() => router.push(`/dashboard/wallet/${assetId}/send`)} className="w-12 h-12 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-white hover:bg-[#252525] transition shadow-lg">
                        <ArrowUpRight size={18} strokeWidth={1.5} />
                     </button>
                     <span className="text-xs font-medium text-white">Send</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                     <button onClick={() => router.push(`/dashboard/wallet/${assetId}/receive`)} className="w-12 h-12 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-white hover:bg-[#252525] transition shadow-lg">
                        <ArrowDownLeft size={18} strokeWidth={1.5} />
                     </button>
                     <span className="text-xs font-medium text-white">Receive</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                     <button className="w-12 h-12 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-white hover:bg-[#252525] transition shadow-lg">
                        <Link2 size={18} strokeWidth={1.5} />
                     </button>
                     <span className="text-xs font-medium text-white">Buy</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                     <button onClick={() => setShowChart(true)} className="w-12 h-12 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-white hover:bg-[#252525] transition shadow-lg">
                        <LineChart size={18} strokeWidth={1.5} />
                     </button>
                     <span className="text-xs font-medium text-white">Chart</span>
                  </div>
               </div>
            </div>

            <div className="bg-[#1e1e1e] w-full mb-8 flex flex-col">
               <div className="p-4 flex items-center gap-1.5 text-[#10b981] font-bold text-[13px] tracking-tight border-b border-[#121212]">
                  <Coins size={15} className="text-[#fbbf24] fill-[#fbbf24]" />
                  Transaction
               </div>
               
               <div className="px-4 py-4 text-[13px] font-medium text-neutral-600">
                  {transactions.length === 0 ? (
                     "No Record Found!"
                  ) : (
                     <div className="flex flex-col gap-2">
                        {transactions.map(tx => {
                           const isDeposit = tx.amount > 0 || tx.type === 'deposit';
                           const isInternal = tx.metadata?.method === 'internal';
                           const absAmount = Math.abs(tx.amount);
                           const title = isInternal ? (isDeposit ? 'Internal Receipt' : 'Internal Transfer') : (isDeposit ? 'Received' : 'Sent');
                           
                           return (
                              <div 
                                 key={tx.id} 
                                 onClick={() => router.push(`/dashboard/transactions/${tx.id}`)}
                                 className="flex items-center justify-between p-3.5 bg-[#141414] hover:bg-[#1a1a1a] cursor-pointer rounded-xl border border-white/[0.03] transition-colors"
                              >
                                 <div className="flex items-center gap-3.5">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeposit ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-white/5 text-neutral-300'}`}>
                                       {isDeposit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                       <div className="text-white font-medium text-[14.5px] tracking-tight">{title}</div>
                                       <div className="text-[12px] text-neutral-500 font-medium">
                                          {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(tx.created_at))}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right flex flex-col gap-0.5">
                                    <div className={`font-bold text-[14.5px] tracking-tight ${isDeposit ? 'text-[#10b981]' : 'text-white'}`}>
                                       {isDeposit ? '+' : '-'}{absAmount} {tx.currency}
                                    </div>
                                    <div className={`text-[12px] font-medium ${tx.status === 'completed' || tx.status === 'confirmed' ? 'text-[#10b981]' : tx.status === 'failed' ? 'text-red-400' : 'text-yellow-500'}`}>
                                       {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>
         </div>
         {/* MODALS */}
         {showChart && (
            <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
               <div className="w-full max-w-4xl bg-[#131722] rounded-xl overflow-hidden border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between p-3 border-b border-white/10">
                     <div className="text-white font-medium text-sm flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4 cursor-pointer" onClick={() => setShowChart(false)} />
                        {assetMeta.name} / USD
                     </div>
                     <button onClick={() => setShowChart(false)} className="text-neutral-400 hover:text-white transition">
                        ✕
                     </button>
                  </div>
                  <div className="h-[500px] w-full">
                     <iframe 
                        src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=BINANCE:${assetId}USDT&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`} 
                        className="w-full h-full"
                        frameBorder="0"
                     ></iframe>
                  </div>
               </div>
            </div>
         )}

         {showSend && (
            <SendModal 
               wallet={wallet} 
               prices={{ [assetId.split('_')[0]]: price }}
               onClose={() => setShowSend(false)} 
               onSuccess={async () => { setShowSend(false); await fetchWallet(); }}
            />
         )}
      </div>
   );
}
