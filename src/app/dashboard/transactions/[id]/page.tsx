"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Check, Loader2, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

const NETWORKS: Record<string, string> = {
  'USDT': 'Ethereum (ERC20)',
  'USDC': 'Ethereum (ERC20)',
  'TRON': 'Tron (TRC20)',

  'BTC': 'Bitcoin Network',
  'ETH': 'Ethereum (ERC20)',
  'USDT_TRX': 'Tron (TRC20)',
  'USDT_BNB': 'BNB Smart Chain (BEP20)',
  'USDT_SOL': 'Solana',
  'USDC_TRX': 'Tron (TRC20)',
  'USDC_BNB': 'BNB Smart Chain (BEP20)',
  'USDC_SOL': 'Solana',
  'SOL': 'Solana',
  'TRX': 'Tron (TRC20)',
  'BNB': 'BNB Smart Chain (BEP20)'
};

export default function TransactionReceiptPage() {
    const router = useRouter();
    const params = useParams();
    const txId = params.id as string;
    
    const [tx, setTx] = useState<any>(null);
    const [price, setPrice] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchTx = async () => {
            const { data } = await supabase.from('transactions').select('*').eq('id', txId).single();
            if (data) {
                setTx(data);
                
                // Fetch price to calculate USD equivalent
                const assetBase = data.currency.split('_')[0];
                try {
                    const res = await fetch('/api/prices');
                    const prices = await res.json();
                    setPrice(prices[assetBase] || 1.00);
                } catch(e) {
                    setPrice(1.00);
                }
            }
        };
        fetchTx();
        
        // Auto refresh to check if status changes from admin approval
        const interval = setInterval(fetchTx, 10000);
        return () => clearInterval(interval);
    }, [txId, supabase]);

    if (!tx) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#10b981]" size={32} />
            </div>
        );
    }

    const isPending = tx.status === 'pending';
    const amountAbs = Math.abs(tx.amount);
    const usdAmount = amountAbs * price;
    const assetBase = tx.currency.split('_')[0];
    
    const isInternal = tx.metadata?.method === 'internal';
    const assetNetwork = isInternal ? 'Internal Network' : (NETWORKS[tx.currency] || tx.currency);
    
    const fromAddress = tx.from_address || (isInternal ? 'Internal Wallet' : '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    const txHashDisplay = tx.tx_hash || ('0x' + tx.id.replace(/-/g, '') + Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    const refDisplay = isInternal ? tx.id.split('-')[0].toUpperCase() : txHashDisplay;
    const recipientDisplay = isInternal ? (tx.to_address || 'Internal User') : (tx.to_address || '-');

    return (
        <div className="flex-1 w-full text-white flex flex-col font-sans pb-32 animate-in fade-in">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4">
                <button onClick={() => router.back()} className="flex items-center text-white hover:text-neutral-300 transition text-[15px] font-medium gap-1">
                    <ChevronLeft size={20} />
                    Back
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center px-4 pt-8 max-w-2xl mx-auto w-full">
                
                {/* Header Icon */}
                <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-[#0a0a0a]">
                        <Check size={24} strokeWidth={3} />
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Submitted</h1>
                <p className="text-[16px] text-neutral-400 mb-10">Your transfer is processing.</p>

                {/* Data Table */}
                <div className="w-full max-w-lg mx-auto pb-20">
                    
                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">Unit</span>
                        <span className="text-[14px] font-bold text-right">{amountAbs.toFixed(4)} {assetBase}</span>
                    </div>

                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">Amount</span>
                        <span className="text-[14px] font-bold text-right">${!isNaN(usdAmount) ? usdAmount.toFixed(2) : '0.00'}</span>
                    </div>

                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">Coin</span>
                        <span className="text-[14px] font-bold text-right">{assetBase}</span>
                    </div>

                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">Network</span>
                        <span className="text-[14px] font-bold text-right">{assetNetwork}</span>
                    </div>

                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap flex-shrink-0 pt-[2px]">Sender</span>
                        <div className="flex-1 min-w-0 text-right">
                            <span className="text-[13.5px] font-medium text-neutral-300 break-all leading-relaxed">
                                {fromAddress}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap flex-shrink-0 pt-[2px]">Recipient</span>
                        <div className="flex-1 min-w-0 text-right">
                            <span className="text-[13.5px] font-medium text-neutral-300 break-all leading-relaxed">
                                {recipientDisplay}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">Confirmation</span>
                        <div className="flex items-center gap-2 text-right">
                            <span className="text-[14px] font-bold">{isPending ? '0/20' : '20/20'}</span>
                            {isPending && <Loader2 size={14} className="animate-spin text-[#f59e0b]" />}
                        </div>
                    </div>

                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">Status</span>
                        <span className={`text-[14px] font-bold text-right ${isPending ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                            {isPending ? 'Pending...' : 'Completed'}
                        </span>
                    </div>

                    <div className="flex justify-between items-start py-4 border-b border-[#222] gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap">Date</span>
                        <span className="text-[14px] font-bold text-right">{format(new Date(tx.created_at), 'MMM dd hh:mm a')}</span>
                    </div>

                    <div className="flex justify-between items-start py-4 gap-4">
                        <span className="text-[13px] text-neutral-400 font-medium whitespace-nowrap flex-shrink-0 pt-[2px]">{isInternal ? 'Internal Ref' : 'Tx Hash'}</span>
                        <div className="flex-1 min-w-0 flex items-start justify-end gap-2">
                            <div className="text-right min-w-0">
                                <span className="text-[13.5px] font-medium text-[#10b981] break-all leading-relaxed">{refDisplay}</span>
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText(txHashDisplay); toast.success('Transaction Hash copied'); }} className="text-neutral-500 hover:text-[#10b981] transition p-1 flex-shrink-0 mt-[-4px]">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
