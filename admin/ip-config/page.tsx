"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
const supabase = createClient();
import { ShieldAlert, CheckCircle, Search } from "lucide-react";

export default function IPConfigPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const getCountryName = (countryCode: string) => {
    if (!countryCode) return '';
    try {
      const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
      return regionNames.of(countryCode);
    } catch (e) {
      return countryCode;
    }
  };

  const filteredUsers = users.filter((u) => 
    (u.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.last_ip || "").includes(search)
  ).map(u => {
    const countryName = getCountryName(u.last_country || '');
    return {
      ...u,
      countryCode: u.last_country ? u.last_country.toLowerCase() : null,
      countryName: countryName
    };
  });

  return (
    <div className="w-full animate-in fade-in duration-300 max-w-5xl">
      <div className="bg-white border border-[#4EA7F8] rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-[#EAEAEA] flex justify-between items-center bg-[#3498db]">
          <h3 className="font-bold text-white text-[15px] uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            IP Configuration & Security
          </h3>
        </div>

        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3 bg-white border border-gray-300 rounded px-3 py-2 w-full max-w-md shadow-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by IP address, name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-[#f0f2f5] border-y border-gray-200 text-gray-500 text-[11px] font-bold tracking-wider">
              <th className="px-5 py-3 w-1/5">USER</th>
              <th className="px-5 py-3 w-1/4">EMAIL</th>
              <th className="px-5 py-3 w-1/4">LAST KNOWN IP</th>
              <th className="px-5 py-3 w-[15%]">STATUS</th>
              <th className="px-5 py-3 w-[15%] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">Loading data...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">No records found.</td></tr>
            ) : (
              filteredUsers.map((u, idx) => (
                <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'} border-b border-gray-100 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 transition-colors`}>
                  <td className="px-5 py-4">{u.first_name} {u.last_name}</td>
                  <td className="px-5 py-4 text-gray-500">{u.email}</td>
                  <td className="px-5 py-4 font-mono text-blue-600 font-bold">
                    <div>{u.last_ip || "Unknown (Waiting for login)"}</div>
                    {u.countryCode && (
                      <div className="text-xs text-gray-500 font-sans mt-0.5 flex items-center gap-1.5 font-normal">
                        <img 
                          src={`https://flagcdn.com/w20/${u.countryCode}.png`} 
                          alt={u.countryCode} 
                          className="w-4 h-auto rounded-sm shadow-sm"
                        />
                        {u.countryName}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {u.status === 'blocked' ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center w-max gap-1">
                        <ShieldAlert className="w-3 h-3" /> Blocked
                      </span>
                    ) : u.status === 'suspended' ? (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center w-max gap-1">
                        <ShieldAlert className="w-3 h-3" /> Suspended
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center w-max gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <select 
                      className="text-xs border border-gray-300 rounded px-2 py-1 outline-none bg-white"
                      value={u.status || 'active'}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        setUsers(users.map(user => user.id === u.id ? { ...user, status: newStatus } : user));
                        try {
                          await fetch('/api/admin/users/status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: u.id, status: newStatus })
                          });
                        } catch (err) {
                          console.error("Failed to update status", err);
                        }
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspend</option>
                      <option value="blocked">Block (Ban)</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

