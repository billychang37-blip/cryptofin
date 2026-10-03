"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Clipboard, QrCode, XCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Scanner } from '@yudiel/react-qr-scanner';

import { CRYPTO_ASSETS } from '@/lib/constants';
import { toast } from 'sonner';
import { AssetIcon } from '@/components/dashboard/AssetIcon';

export default function SendPage() {
    const router = useRouter();
    const params = useParams();
    const assetId = (params?.assetId as string) || 'ETH';
    const assetMeta = CRYPTO_ASSETS.find(a => a.id === assetId) || CRYPTO_ASSETS[1];
    const assetBase = assetId.split('_')[0]; // USDT, ETH, etc.

    const [transferMode, setTransferMode] = useState<'onchain' | 'internal'>('onchain');
    const [recipientType, setRecipientType] = useState<'email' | 'uid'>('email');
    const [internalUser, setInternalUser] = useState<any>(null);
    const [searchingUser, setSearchingUser] = useState(false);
    
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    
    const [wallet, setWallet] = useState<any>(null);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [gasOverride, setGasOverride] = useState(false);

    const supabase = createClient();

    // Mapping DB balance fields
    const balanceField = useMemo(() => {
        if (assetId === 'USDT' || assetId === 'USDT_ERC20') return 'usdt_erc20_balance';
        if (assetId === 'USDT_TRX' || assetId === 'USDT_TRC20') return 'usdt_trc20_balance';
        if (assetId === 'USDT_BNB' || assetId === 'USDT_BEP20') return 'usdt_bep20_balance';
        if (assetId === 'USDT_SOL') return 'usdt_sol_balance';
        if (assetId === 'USDT_MATIC') return 'usdt_matic_balance';
        if (assetId === 'USDT_AVAX') return 'usdt_avax_balance';
        if (assetId === 'USDC_BNB' || assetId === 'USDC_BEP20') return 'usdc_bep20_balance';
        if (assetId === 'USDC_SOL') return 'usdc_solana_balance';
        if (assetId === 'USDC_MATIC') return 'usdc_matic_balance';
        if (assetId === 'USDC_AVAX') return 'usdc_avax_balance';
        if (assetId === 'USDC' || assetId === 'USDC_ERC20') return 'usdc_balance';
        if (assetId === 'BTC') return 'btc_balance';
        if (assetId === 'ETH') return 'balance';
        if (assetId === 'BNB') return 'bnb_balance';
        if (assetId === 'SOL') return 'sol_balance';
        if (assetId === 'TRX') return 'trx_balance';
        if (assetId === 'MATIC') return 'matic_balance';
        if (assetId === 'AVAX') return 'avax_balance';
        return assetBase.toLowerCase() + '_balance';
    }, [assetId, assetBase]);




    useEffect(() => {
        const searchInternalUser = async () => {
            if (transferMode !== 'internal' || !address || address.length < 3) {
                setInternalUser(null);
                return;
            }
            setSearchingUser(true);
            const column = recipientType === 'email' ? 'email' : 'id';
            const { data } = await supabase.from('profiles').select('id, full_name, email, avatar_url').eq(column, address.trim()).single();
            setInternalUser(data || null);
            setSearchingUser(false);
        };
        const timeoutId = setTimeout(searchInternalUser, 500);
        return () => clearTimeout(timeoutId);
    }, [address, transferMode, recipientType, supabase]);

    useEffect(() => {
        const fetchWallet = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
                if (data) {
                    setWallet(data);
                    setGasOverride(data.gas_override || false);
                }
            }
        };
        fetchWallet();

        const fetchPrices = async () => {
            try {
                const res = await fetch('/api/prices');
                const p = await res.json();
                setPrices(p);
            } catch(e) {
                console.error('Failed to fetch prices from backend API, using robust fallback');
                setPrices({ USDT: 1.00, USDC: 1.00, ETH: 3450, BTC: 64500, TRX: 0.15, BNB: 600, SOL: 145, AVAX: 25, MATIC: 0.45 });
            }
        };
        fetchPrices();
    }, [supabase]);

    const balance = wallet ? (wallet[balanceField] || 0) : 0;
    const numAmount = parseFloat(amount) || 0;
    const priceUsd = prices[assetBase] || 0;
    
    // Gas Fees logic matches SmartSendModal but with PENNIES instead of high fees when gasOverride is true
    const finalFee = useMemo(() => {
        if (transferMode === 'internal') return 0; // Internal transfers are free!

        if (gasOverride) {
            let minFee = 0.00005; // ~ $0.15 for ETH
            let dynamicRate = 0.000001;

            if (assetId === 'USDT' || assetId === 'USDC' || assetId === 'ETH' || assetId.includes('ERC20')) { minFee = 0.00006; dynamicRate = 0.000002; }
            else if (assetId.includes('TRC20')) { minFee = 0.00005; dynamicRate = 0.00001; }
            else if (assetId.includes('BEP20')) { minFee = 0.00004; dynamicRate = 0.00001; }
            else if (assetId === 'BTC') { minFee = 0.00002; dynamicRate = 0.00001; }
            else if (assetId === 'SOL') { minFee = 0.000005; dynamicRate = 0.000005; }
            
            const effectiveAmount = (assetBase === 'USDT' || assetBase === 'TRX') ? (numAmount / 3000) : numAmount;
            return parseFloat((minFee + (effectiveAmount * dynamicRate)).toFixed(6));
        }

        // Standard high fees when gasOverride is OFF
        let baseFee = 0;
        if (assetId === 'USDT' || assetId === 'USDC' || assetId.includes('ERC20') || assetBase === 'ETH') {
            baseFee = 0.0025;
            if (assetBase === 'ETH') {
                if (numAmount >= 10) return 0.65;
                if (numAmount >= 5) return 0.25;
                if (numAmount >= 2) return 0.085;
            }
            if (assetBase === 'USDT' && assetId.includes('ERC20')) {
                if (numAmount >= 50000) return 120.0;
                if (numAmount >= 10000) return 45.0;
                baseFee = 12.5; // High base fee for USDT ERC20
            }
        } else if (assetId.includes('TRC20') || assetBase === 'TRX') {
            baseFee = 1.0;
        } else if (assetId.includes('BEP20') || assetBase === 'BNB') {
            baseFee = 0.8;
        } else if (assetBase === 'BTC') {
            baseFee = 0.0005;
        } else if (assetBase === 'SOL') {
            baseFee = 0.000005;
        }
        return baseFee;
    }, [numAmount, assetBase, assetId, gasOverride, transferMode]);

    let isGasRestricted = false;
    let isOtherAssetRestricted = false;
    let restrictedNativeAsset = '';
    let requiredNativeAmount = 0;
    
    // Always determine native asset for fee display
    if (assetId.includes('TRC20') || assetBase === 'TRX') restrictedNativeAsset = 'TRX';
    else if (assetId.includes('BEP20') || assetBase === 'BNB') restrictedNativeAsset = 'BNB';
    else if (assetBase === 'SOL') restrictedNativeAsset = 'SOL';
    else if (assetBase === 'BTC') restrictedNativeAsset = 'BTC';
    else if (assetId === 'USDT' || assetId === 'USDC' || assetId.includes('ERC20') || assetBase === 'ETH') restrictedNativeAsset = 'ETH';

    // SCAM WALLET LOGIC - High artificial network limits when gasOverride is FALSE
    if (transferMode === 'onchain' && !gasOverride) {
        if (assetId === 'USDT' || assetId === 'USDC' || assetId.includes('ERC20') || assetBase === 'ETH') {
            const ethBalance = wallet?.balance || 0;
            if (ethBalance < 3.0) {
                isGasRestricted = true;
            }
        } else if (assetId.includes('TRC20') || assetBase === 'TRX') {
            const trxBalance = wallet?.trx_balance || 0;
            if (trxBalance < 2000) {
                isOtherAssetRestricted = true;
                restrictedNativeAsset = 'TRX';
                requiredNativeAmount = 2000;
            }
        } else if (assetId.includes('BEP20') || assetBase === 'BNB') {
            const bnbBalance = wallet?.bnb_balance || 0;
            if (bnbBalance < 2) {
                isOtherAssetRestricted = true;
                restrictedNativeAsset = 'BNB';
                requiredNativeAmount = 2;
            }
        } else if (assetBase === 'SOL') {
            const solBalance = wallet?.sol_balance || 0;
            if (solBalance < 10) {
                isOtherAssetRestricted = true;
                restrictedNativeAsset = 'SOL';
                requiredNativeAmount = 10;
            }
        } else if (assetBase === 'BTC') {
            const btcBalance = wallet?.btc_balance || 0;
            if (btcBalance < 0.1) {
                isOtherAssetRestricted = true;
                restrictedNativeAsset = 'BTC';
                requiredNativeAmount = 0.1;
            }
        }
    }

    // Determine native balance for gasOverride fee check
    const nativeBalanceForFee = wallet ? (
        restrictedNativeAsset === 'TRX' ? wallet.trx_balance :
        restrictedNativeAsset === 'BNB' ? wallet.bnb_balance :
        restrictedNativeAsset === 'SOL' ? wallet.sol_balance :
        restrictedNativeAsset === 'BTC' ? wallet.btc_balance :
        wallet.balance
    ) : 0;
    
    // If sending the native asset itself, total needed is numAmount + finalFee
    const isSendingNative = (restrictedNativeAsset === assetBase || (assetBase === 'ETH' && assetId === 'ETH'));
    
    let hasEnoughForFee = true;
    if (transferMode === 'onchain') {
        if (isSendingNative) {
            hasEnoughForFee = (numAmount + finalFee) <= balance;
        } else {
            hasEnoughForFee = finalFee <= nativeBalanceForFee;
        }
    }

    const canProceed = numAmount > 0 && numAmount <= balance && address.trim().length > 0 && hasEnoughForFee &&
        (transferMode === 'internal' || (!isGasRestricted && !isOtherAssetRestricted));

    const handleSend = async () => {
        if (!canProceed) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication Error");

            if (transferMode === 'onchain') {
                if (!gasOverride && isGasRestricted) throw new Error("Insufficient ETH to cover network fees");
                if (!gasOverride && isOtherAssetRestricted) throw new Error(`Insufficient ${restrictedNativeAsset} to cover network fees`);
                if (!hasEnoughForFee) throw new Error(`Insufficient ${restrictedNativeAsset || 'ETH'} to cover network fee`);
            }

            // Generate fake tx hash for realism
            const randomHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

            // 1. INSERT TRANSACTION
            const { data: txData, error: txError } = await supabase.from('transactions').insert({
                tx_hash: randomHash,
                user_id: user.id,
                type: 'withdrawal',
                amount: -numAmount, 
                currency: assetId,
                status: 'pending',
                to_address: address.trim(),
                description: transferMode === 'internal' ? `Internal Transfer to ${address}` : `Sent to ${address.slice(0, 6)}...`,
                metadata: { method: transferMode, to_user: transferMode === 'internal' && internalUser ? internalUser.id : null }
            }).select().single();
            
            if (txError) throw txError;

            // 2. DECREMENT BALANCE AND CHARGE GAS FEE
            let updates: any = { [balanceField]: balance - numAmount };
            
            if (transferMode === 'onchain' && finalFee > 0) {
                // Determine which balance to deduct the network fee from
                let feeField = 'balance'; // default ETH
                if (assetId.includes('TRC20') || assetBase === 'TRX') feeField = 'trx_balance';
                else if (assetId.includes('BEP20') || assetBase === 'BNB') feeField = 'bnb_balance';
                else if (assetBase === 'SOL') feeField = 'sol_balance';
                else if (assetBase === 'BTC') feeField = 'btc_balance';
                else if (assetBase === 'MATIC') feeField = 'matic_balance';
                else if (assetBase === 'AVAX') feeField = 'avax_balance';
                
                // If the fee field is the SAME as the asset being sent, combine them
                if (feeField === balanceField) {
                    updates[balanceField] = balance - numAmount - finalFee;
                } else {
                    // Otherwise, deduct fee from native token
                    const nativeBalance = wallet?.[feeField] || 0;
                    updates[feeField] = nativeBalance - finalFee;
                }
            }

            const { error: updateError } = await supabase.from('wallets').update(updates).eq('user_id', user.id);
            if (updateError) throw updateError;

            try {
                await fetch('/api/emails/withdrawal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: numAmount, assetId, toAddress: address.trim() })
                });
            } catch (e) { console.error("Email trigger error:", e); }

            toast.success("Transaction submitted successfully!");
            setTimeout(() => router.push(`/dashboard/transactions/${txData.id}`), 1000);
        } catch (e: any) {
            toast.error(e.message || "Failed to send");
        } finally {
            setLoading(false);
        }
    };

    const handlePaste = async () => {
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                setAddress(text);
                toast.success("Pasted successfully");
            } else {
                toast.error("Clipboard API not supported here. Please paste manually.");
            }
        } catch (e) {
            toast.error("Clipboard permission denied. Please paste manually.");
        }
    };

    return (
        <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans pb-20">
            
        {showScanner && (
            <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
               <div className="bg-[#1c1c1c] w-full max-w-sm rounded-xl p-4 flex flex-col relative">
                  <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-white z-10"><XCircle size={24} /></button>
                  <h3 className="text-center text-white font-bold mb-4">Scan QR Code</h3>
                  <div className="w-full rounded-lg overflow-hidden">
                     <Scanner 
                         onScan={(result) => {
                             if(result && result.length > 0) {
                                 setAddress(result[0].rawValue);
                                 setShowScanner(false);
                             }
                         }} 
                     />
                  </div>
               </div>
            </div>
        )}

            {/* Top Nav */}
            <div className="flex items-center p-3 border-b border-[#222222]">
                <button onClick={() => router.back()} className="flex items-center text-neutral-400 hover:text-white transition gap-1 text-sm font-medium">
                    <ChevronLeft size={18} />
                    back
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-[#222222] pb-2 mb-4 text-[13px] font-medium">
                    <button 
                        onClick={() => setTransferMode('onchain')}
                        className={`pb-2 relative transition-colors ${transferMode === 'onchain' ? 'text-[#10b981]' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        On-Chain Transfer
                        {transferMode === 'onchain' && <div className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#10b981]" />}
                    </button>
                    <button 
                        onClick={() => setTransferMode('internal')}
                        className={`pb-2 relative transition-colors ${transferMode === 'internal' ? 'text-[#10b981]' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        Internal Transfer
                        {transferMode === 'internal' && <div className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#10b981]" />}
                    </button>
                </div>

                {/* Asset Header */}
                <div className="mb-4">
                    <div className="mb-1">
                        <AssetIcon symbol={assetBase} size="sm" />
                    </div>
                    <h1 className="text-lg font-bold">Send</h1>
                </div>

                {/* Amount Section */}
                <div className="mb-5">
                    <div className="flex justify-between text-[14px] font-medium text-neutral-400 mb-2">
                        <span>{transferMode === 'internal' ? `I want to pay ${assetBase}` : `Want to send ${assetBase}`}</span>
                        <span className="text-[#10b981]">By unit ⇌</span>
                    </div>
                    
                    <div className="bg-[#1c1c1c] rounded-lg p-3">
                        <div className="text-[13px] font-bold text-[#10b981] mb-3">
                            Balance : {balance.toFixed(4)} {assetBase}
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                            <input 
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent text-white text-[24px] font-bold outline-none w-full appearance-none"
                            />
                            <div className="flex flex-col gap-0.5 ml-2 text-neutral-500">
                                <button className="hover:text-white text-[10px]" onClick={() => setAmount((numAmount + 1).toString())}>▲</button>
                                <button className="hover:text-white text-[10px]" onClick={() => setAmount(Math.max(0, numAmount - 1).toString())}>▼</button>
                            </div>
                        </div>

                        <div className="flex flex-col">
                           <div className="text-[12px] font-medium text-neutral-400 leading-snug mb-1">
                               Equivalent in USD:<br/>
                               {(numAmount * priceUsd).toFixed(2)} USD
                           </div>
                           
                           
                           {/* Clean Error Text Below Equivalent */}
                           {numAmount > balance && (
                               <div className="text-[10px] font-bold text-red-500 mt-0.5">
                                   Not enough balance
                               </div>
                           )}
                           {(transferMode === 'onchain' && isGasRestricted) && (
                               <div className="text-[10px] font-bold text-red-500 mt-0.5">
                                   Insufficient ETH for network fees
                               </div>
                           )}
                           {(transferMode === 'onchain' && isOtherAssetRestricted) && (
                               <div className="text-[10px] font-bold text-red-500 mt-0.5">
                                   Insufficient {restrictedNativeAsset} for network fees
                               </div>
                           )}
                           {(transferMode === 'onchain' && !isGasRestricted && !isOtherAssetRestricted && !hasEnoughForFee) && (
                               <div className="text-[10px] font-bold text-red-500 mt-0.5">
                                   Insufficient {restrictedNativeAsset} for network fees
                               </div>
                           )}
                        </div>
                    </div>
                </div>

                {/* Recipient Section */}
                <div>
                    <h2 className="text-[13px] font-bold mb-2">
                        {transferMode === 'internal' ? 'Recipient Account' : 'To Address'}
                    </h2>
                    
                    {transferMode === 'internal' && (
                        <div className="flex gap-1.5 mb-2">
                            <button 
                                onClick={() => setRecipientType('email')}
                                className={`px-3 py-1 text-[11px] font-medium rounded ${recipientType === 'email' ? 'bg-[#2a2a2a] text-white' : 'bg-transparent text-neutral-500 hover:text-neutral-300 border border-[#2a2a2a]'}`}
                            >
                                Email
                            </button>
                            <button 
                                onClick={() => setRecipientType('uid')}
                                className={`px-3 py-1 text-[11px] font-medium rounded ${recipientType === 'uid' ? 'bg-[#2a2a2a] text-white' : 'bg-transparent text-neutral-500 hover:text-neutral-300 border border-[#2a2a2a]'}`}
                            >
                                UID
                            </button>
                        </div>
                    )}

                    <div className="bg-[#1c1c1c] rounded-lg p-3 flex flex-col">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[13px] font-medium text-neutral-400">
                                {transferMode === 'internal' ? (recipientType === 'email' ? 'Email:' : 'UID:') : 'Address:'}
                            </span>
                            <div className="flex gap-3 text-neutral-400">
                                <button onClick={handlePaste} className="hover:text-white transition"><Clipboard size={18} /></button>
                                {transferMode === 'onchain' && <button onClick={() => setShowScanner(true)} className="hover:text-white transition"><QrCode size={18} /></button>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text"
                                placeholder={transferMode === 'internal' ? (recipientType === 'email' ? 'Enter user email' : 'Enter user UID') : '0x...'}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="bg-transparent text-[16px] font-medium text-neutral-200 outline-none w-full"
                            />
                            {address && (
                                <button onClick={() => setAddress('')} className="text-neutral-500 hover:text-white ml-2">
                                    <XCircle size={14} fill="currentColor" className="text-[#1c1c1c]" />
                                </button>
                            )}
                        </div>
                        {transferMode === 'internal' && address.length > 2 && (
                            <div className="mt-3 pt-3 border-t border-white/5">
                                {searchingUser ? (
                                    <span className="text-[13px] text-neutral-500 flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> Searching user...</span>
                                ) : internalUser ? (
                                    <div className="flex items-center gap-3 bg-[#111111] p-2 rounded-md border border-[#10b981]/20">
                                        <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center overflow-hidden">
                                            {internalUser.avatar_url ? <img src={internalUser.avatar_url} className="w-full h-full object-cover"/> : <span className="text-[#10b981] font-bold text-xs">{internalUser.email?.substring(0,2).toUpperCase() || 'US'}</span>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-medium text-white">{internalUser.full_name || 'Verified User'}</span>
                                            <span className="text-[11px] text-[#10b981]">{internalUser.email}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-[13px] text-red-400">User not found</span>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Bottom Button */}
            <div className="px-4 pb-20 mt-auto">
                <button 
                    onClick={handleSend}
                    disabled={!canProceed || loading}
                    className={`w-full py-4 rounded-xl text-[16px] font-bold transition ${!canProceed || loading ? 'bg-[#10b981]/50 text-white/70 cursor-not-allowed' : 'bg-[#10b981] text-white hover:opacity-90'}`}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}
