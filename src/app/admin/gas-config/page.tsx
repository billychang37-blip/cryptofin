'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';

export default function GasConfigPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [gasOverride, setGasOverride] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialFetch, setInitialFetch] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data } = await supabase.from('profiles').select('id, first_name, last_name, email');
            const { data: wallets } = await supabase.from('wallets').select('user_id, readable_id, gas_override');
            
            if (data && wallets) {
                const combined = data.map(u => {
                    const w = wallets.find(w => w.user_id === u.id);
                    return { ...u, readable_id: w?.readable_id, gas_override: w?.gas_override || false };
                });
                setUsers(combined);
            }
            setInitialFetch(false);
        };
        fetchUsers();
    }, []);

    const handleSelectUser = (user: any) => {
        setSelectedUser(user);
        setGasOverride(user.gas_override);
        setSearchTerm('');
    };

    const handleToggle = async () => {
        if (!selectedUser) {
            toast.error('Please select a user first');
            return;
        }

        setLoading(true);
        const newValue = !gasOverride;
        const { error } = await supabase.from('wallets').update({ gas_override: newValue }).eq('user_id', selectedUser.id);
        
        if (error) {
            toast.error('Failed to update gas config');
        } else {
            setGasOverride(newValue);
            toast.success(`Gas fee config saved for ${selectedUser.first_name || 'User'}`);
            // Update local state
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, gas_override: newValue } : u));
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(u => {
        const s = searchTerm.toLowerCase();
        const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const uid = (u.readable_id || u.id || '').toLowerCase();
        return name.includes(s) || email.includes(s) || uid.includes(s);
    });

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Network Gas Fees Configuration</h1>
            <p className="text-gray-500 mb-8">Manage the artificial gas fee lock for specific users. When standard fees are turned ON, the user experiences normal real-world gas fees (pennies). When OFF, the system triggers the 3.0 ETH lock.</p>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-semibold mb-4">Select User</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name, email, or Account ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded outline-none focus:border-blue-500"
                    />
                    {searchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                            {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                <div 
                                    key={u.id}
                                    onClick={() => handleSelectUser(u)}
                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-800">{u.first_name} {u.last_name}</div>
                                        <div className="text-sm text-gray-500">{u.email}</div>
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">ID: {u.readable_id || 'N/A'}</div>
                                </div>
                            )) : (
                                <div className="p-4 text-center text-gray-500">No users found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedUser && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedUser.first_name} {selectedUser.last_name}</h2>
                            <p className="text-gray-500">{selectedUser.email}</p>
                            <p className="text-sm font-mono text-gray-400 mt-1">ID: {selectedUser.readable_id}</p>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="text-sm text-gray-400 hover:text-gray-600">
                            Clear Selection
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
                        <div>
                            <h3 className="font-semibold text-gray-800 text-lg">Enable Standard Gas Fees</h3>
                            <p className="text-sm text-gray-500 mt-1">If enabled, this user will pay real network fees (approx $0.05). If disabled, they will hit the artificial 3.0 ETH lock.</p>
                        </div>
                        
                        <button 
                            onClick={handleToggle}
                            disabled={loading}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${gasOverride ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${gasOverride ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
