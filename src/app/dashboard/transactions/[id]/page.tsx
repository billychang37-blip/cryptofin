"use client";

import { createClient } from '@/lib/supabase';
import { Loader2, ChevronLeft, Check, Copy, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const NETWORKS: Record<string, string> = {
    'USDT': 'Ethereum (ERC20)',
    'USDT_TRX': 'Tron (TRC20)',
    'USDT_BNB': 'BNB Smart Chain (BEP20)',
    'USDT_SOL': 'Solana',
    'USDT_MATIC': 'Polygon',
    'USDT_AVAX': 'Avalanche',
    'USDC': 'Ethereum (ERC20)',
    'USDC_BNB': 'BNB Smart Chain (BEP20)',
    'USDC_SOL': 'Solana',
    'USDC_MATIC': 'Polygon',
    'USDC_AVAX': 'Avalanche',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum (ERC20)',
    'BNB': 'BNB Smart Chain (BEP20)',
    'SOL': 'Solana',
    'TRX': 'Tron (TRC20)',
    'MATIC': 'Polygon',
    'AVAX': 'Avalanche'
};

export default function TransactionReceipt({ params }: { params: { id: string } }) {
    const router = useRouter();
    const supabase = createClient();
    const [tx, setTx] = useState<any>(null);
    const [price, setPrice] = useState(0);
    const [senderAddr, setSenderAddr] = useState<string>('');
    const txId = params.id;

    useEffect(() => {
        const fetchTx = async () => {
            const { data, error } = await supabase.from('transactions').select('*').eq('id', txId).single();
            if (data) {
                setTx(data);
                const assetBase = data.currency.split('_')[0];
                try {
                    const res = await fetch('/api/prices');
                    const prices = await res.json();
                    setPrice(prices[assetBase] || 1.00);
                } catch(e) {
                    setPrice(1.00);
                }
                
                // Get wallet for from address
                const { data: w } = await supabase.from('wallets').select('*').eq('user_id', data.user_id).single();
                if (w) {
                    let addr = '';
                    if (['BTC'].includes(data.currency)) addr = w.btc_address;
                    else if (['TRX', 'USDT_TRX'].includes(data.currency)) addr = w.trx_address;
                    else if (['SOL', 'USDT_SOL', 'USDC_SOL'].includes(data.currency)) addr = w.sol_address;
                    else addr = w.address;
                    setSenderAddr(addr);
                }
            }
        };
        fetchTx();
        
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

    const isPending = tx.status === 'pending' || tx.status === 'processing';
    const isCompleted = tx.status === 'completed';
    const isFailed = tx.status === 'failed' || tx.status === 'rejected';

    const amountAbs = Math.abs(tx.amount);
    const usdAmount = amountAbs * price;
    const assetBase = tx.currency.split('_')[0];
    
    const isInternal = tx.metadata?.method === 'internal';
    const assetNetwork = isInternal ? 'Internal Network' : (NETWORKS[tx.currency] || tx.currency);
    
    // For deposits, tx.from_address comes from blockchain or user input, otherwise it's their wallet address
    let displaySenderAddr = '';
    if (tx.type === 'deposit') {
         displaySenderAddr = tx.from_address || 'External Network';
    } else {
         displaySenderAddr = isInternal ? 'Internal Wallet' : (tx.from_address || senderAddr || 'Unknown Address');
    }

    const txHashDisplay = tx.tx_hash || ('0x' + tx.id.replace(/-/g, '') + Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    const refDisplay = isInternal ? tx.id.split('-')[0].toUpperCase() : txHashDisplay;
    const recipientDisplay = isInternal ? (tx.to_address || 'Internal User') : (tx.to_address || '-');

    let statusText = 'Processing';
    let statusIcon = <Check size={24} strokeWidth={3} />;
    let iconBg = 'bg-[#f59e0b]';
    let iconColor = 'text-[#0a0a0a]';
    let subtitleText = 'Your transfer is processing.';

    if (isCompleted) {
        statusText = tx.type === 'deposit' ? 'Deposit Received' : 'Transfer Completed';
        iconBg = 'bg-[#10b981]';
        statusIcon = <Check size={24} strokeWidth={3} />;
        subtitleText = tx.type === 'deposit' ? 'Your funds have arrived.' : 'Your transfer was successful.';
    } else if (isFailed) {
        statusText = 'Transfer Failed';
        iconBg = 'bg-red-500';
        statusIcon = <X size={24} strokeWidth={3} />;
        subtitleText = 'Your transaction was rejected.';
    }

    return (
        <div className="flex-1 w-full text-white flex flex-col font-sans pb-32 animate-in fade-in">
            <div className="flex items-center justify-between p-4">
                <button onClick={() => router.back()} className="flex items-center text-white hover:text-neutral-300 transition text-[15px] font-medium gap-1">
                    <ChevronLeft size={20} />
                    Back
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center px-4 pt-8 max-w-2xl mx-auto w-full">
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBg.replace('bg-', 'bg-')}/10`}>
                    <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
                        {statusIcon}
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold mb-2 tracking-tight">{statusText}</h1>
                <p className="text-[16px] text-neutral-400 mb-10">{subtitleText}</p>

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
                                {displaySenderAddr}
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
                        <span className={`text-[14px] font-bold text-right ${isCompleted ? 'text-[#10b981]' : isFailed ? 'text-red-500' : 'text-[#f59e0b]'}`}>
                            {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Processing...'}
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
                            <button onClick={() => { navigator.clipboard.writeText(refDisplay); toast.success('Hash copied'); }} className="text-neutral-500 hover:text-[#10b981] transition p-1 flex-shrink-0 mt-[-4px]">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
