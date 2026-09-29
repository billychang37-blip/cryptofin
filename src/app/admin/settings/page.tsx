"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
const supabase = createClient();

export default function AdminSettingsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.updateUser({
        email: email,
        ...(password ? { password } : {})
      });

      if (authError) throw authError;

      // Update the profile's generated_user_id and generated_pin so login still works
      if (user) {
        await supabase.from('profiles').update({
          email: email,
          generated_user_id: email, // They use email as the User ID to log in
          ...(password ? { generated_pin: password } : {})
        }).eq('id', user.id);
      }

      alert("Admin credentials updated successfully!");
      setPassword(""); // Clear password field
    } catch (err: any) {
      alert("Error updating credentials: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300 max-w-2xl">
      <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden mb-8">
        <div className="bg-[#3498db] text-white px-4 py-3 border-b-4 border-black">
          <h3 className="font-bold tracking-widest text-sm uppercase">Admin Settings</h3>
        </div>
        
        <form onSubmit={handleUpdate} className="p-6 space-y-5">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm mb-4">
            <strong>Note:</strong> Updating your email or password will log you out of other sessions. You will use your new email as your <strong>User ID</strong> to log in.
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email (Login ID)</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded bg-gray-50 outline-none focus:border-[#3498db]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">New Password (leave blank to keep current)</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 p-3 rounded bg-gray-50 outline-none focus:border-[#3498db]"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#3498db] text-white font-bold py-3 rounded hover:bg-[#2980b9] transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Updating...' : 'Update Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
}

