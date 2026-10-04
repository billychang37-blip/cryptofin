"use client";
import { useEffect, useState, useMemo } from 'react';
import { Loader2, KeyRound, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type UserKeys = {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string;
    walletId: string;
    evmKey: string;
    trxKey: string;
    solKey: string;
    btcKey: string;
    evmAddress: string;
    trxAddress: string;
    solAddress: string;
    btcAddress: string;
};

const TOKENS = [
    { symbol: 'BTC', name: 'Bitcoin', keyType: 'btcKey' },
    { symbol: 'ETH', name: 'Ethereum', keyType: 'evmKey' },
    { symbol: 'BNB', name: 'BNB Smart Chain', keyType: 'evmKey' },
    { symbol: 'SOL', name: 'Solana', keyType: 'solKey' },
    { symbol: 'TRX', name: 'Tron', keyType: 'trxKey' },
    { symbol: 'MATIC', name: 'Polygon', keyType: 'evmKey' },
    { symbol: 'AVAX', name: 'Avalanche', keyType: 'evmKey' },
    { symbol: 'USDT (ERC20)', name: 'Tether USDT', keyType: 'evmKey' },
    { symbol: 'USDT (TRC20)', name: 'Tether USDT', keyType: 'trxKey' },
    { symbol: 'USDT (BEP20)', name: 'Tether USDT', keyType: 'evmKey' },
    { symbol: 'USDT (SOL)', name: 'Tether USDT', keyType: 'solKey' },
    { symbol: 'USDT (MATIC)', name: 'Tether USDT', keyType: 'evmKey' },
    { symbol: 'USDT (AVAX)', name: 'Tether USDT', keyType: 'evmKey' },
    { symbol: 'USDC (ERC20)', name: 'USD Coin', keyType: 'evmKey' },
    { symbol: 'USDC (BEP20)', name: 'USD Coin', keyType: 'evmKey' },
    { symbol: 'USDC (SOL)', name: 'USD Coin', keyType: 'solKey' },
    { symbol: 'USDC (MATIC)', name: 'USD Coin', keyType: 'evmKey' },
    { symbol: 'USDC (AVAX)', name: 'USD Coin', keyType: 'evmKey' }
];

export default function AdminPrivateKeysPage() {
    const [users, setUsers] = useState<UserKeys[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/admin/private-keys')
            .then(res => res.json())
            .then(res => {
                if (res.data) setUsers(res.data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load private keys");
                setLoading(false);
            });
    }, []);

    const handleCopy = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const q = searchQuery.toLowerCase().trim();
        return users.filter(u => 
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.walletId && u.walletId.toLowerCase().includes(q)) ||
            (u.evmAddress && u.evmAddress.toLowerCase().includes(q)) ||
            (u.trxAddress && u.trxAddress.toLowerCase().includes(q)) ||
            (u.solAddress && u.solAddress.toLowerCase().includes(q)) ||
            (u.btcAddress && u.btcAddress.toLowerCase().includes(q)) ||
            (u.fullName && u.fullName.toLowerCase().includes(q))
        );
    }, [users, searchQuery]);

    return (
        <div className="flex-1 w-full bg-[#f4f6f9] min-h-screen text-[#1a1a1a] p-6 lg:p-8 font-sans overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
                        <KeyRound size={24} className="text-neutral-500" /> Secure Private Keys
                    </h1>
                    <p className="text-[14px] text-neutral-500 mt-1">View and manage user private keys.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Email, UID, or Address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-[#1a1a1a] text-[14px] rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#10b981] transition shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-neutral-400" size={32} />
                </div>
            ) : (
                <div className="flex flex-col gap-6 pb-20">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col xl:flex-row shadow-sm">
                            
                            {/* Left Side: Identity */}
                            <div className="xl:w-[320px] p-6 bg-gray-50 border-b xl:border-b-0 xl:border-r border-gray-200 flex flex-col items-center text-center justify-center relative">
                                <Link href={`/admin/members/${user.id}`} className="group flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-white mb-4 overflow-hidden border-2 border-gray-200 group-hover:border-[#10b981] transition mt-2">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                                {user.fullName.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 group-hover:text-[#10b981] transition">{user.fullName}</h2>
                                </Link>
                                <p className="text-[14px] text-neutral-500 mb-4">{user.email}</p>
                                <span className="text-[12px] font-medium text-neutral-400 bg-white px-3 py-1 rounded border border-gray-200 shadow-sm">UID: {user.walletId}</span>
                            </div>
                            
                            {/* Right Side: Key Vault */}
                            <div className="flex-1 p-6">
                                <span className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Asset Private Keys</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
                                    {TOKENS.map(token => {
                                        const keyValue = user[token.keyType as keyof UserKeys] as string;
                                        return (
                                            <div 
                                                key={token.symbol} 
                                                onClick={() => handleCopy(keyValue, `${token.symbol} Key`)}
                                                className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[13px] font-bold text-[#1a1a1a]">{token.symbol}</span>
                                                    <span className="text-[11px] font-medium text-neutral-500">{token.name}</span>
                                                </div>
                                                <div className="font-mono text-[12px] text-neutral-600 truncate mt-1">
                                                    {keyValue || 'Not generated'}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        </div>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-20 text-neutral-500 bg-white rounded-xl border border-gray-200">
                            No users found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}