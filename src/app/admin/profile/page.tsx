"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
const supabase = createClient();

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/admin-avatar.png");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setUsername(data.first_name || "admin");
        setEmail(data.email || session.user.email || "");
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    };
    fetchAdminData();
  }, []);

  const handleSave = async () => {
    setMessage({ text: "", type: "" });
    
    if (newPassword && newPassword !== repeatPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      // Update Auth (Email & Password)
      const updates: any = {};
      if (email && email !== session.user.email) updates.email = email;
      if (newPassword) updates.password = newPassword;
      
      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) throw authError;
      }

      // Update Profile Table
      const { error: profileError } = await supabase.from('profiles')
        .update({ first_name: username, email: email, avatar_url: avatarUrl !== '/admin-avatar.png' ? avatarUrl : null })
        .eq('id', session.user.id);
        
      if (profileError) {
        if (profileError.code === '42703') {
           throw new Error("Please run the SQL script to create the 'avatar_url' column in the profiles table.");
        }
        throw profileError;
      }

      setMessage({ text: "Profile updated successfully!", type: "success" });
      setNewPassword("");
      setRepeatPassword("");
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="w-full bg-white min-h-[calc(100vh-130px)] shadow-sm relative pb-20">
      <div className="p-8">
        <h2 className="text-[15px] font-bold text-[#333333] uppercase tracking-wide mb-8 flex items-center">
          EDIT PROFILE <span className="text-red-500 ml-1">-</span>
        </h2>

        {message.text && (
          <div className={`mb-6 p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-row gap-12">
          {/* Left Column - Profile Picture (Exact match to reference) */}
          <div className="w-[280px] shrink-0">
            <div 
              className="bg-[#2196F3] relative overflow-hidden flex flex-col"
              style={{ borderBottomRightRadius: '120px' }}
            >
              <div className="p-4 bg-[#2196F3]">
                <div className="bg-white w-full aspect-square border-4 border-[#2196F3] relative overflow-hidden">
                  <img 
                    src={avatarUrl} 
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="pb-16 pt-2 text-center relative z-10">
                <input 
                  type="file" 
                  id="avatarUpload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAvatarUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button 
                  onClick={() => document.getElementById('avatarUpload')?.click()}
                  className="text-white text-sm font-semibold hover:underline bg-transparent outline-none"
                >
                  Upload a Photo
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 pt-6 px-4">
            <p className="text-center font-bold text-[#333333] text-[14px] mb-8">
              Input boxes marked with asterisk are required
            </p>

            <div className="flex flex-col gap-6">
              {/* Row 1 */}
              <div>
                <label className="block text-[#333333] text-[13px] font-bold mb-1">
                  Username: <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#337ab7] shadow-inner"
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[#333333] text-[13px] font-bold mb-1">
                    Email: <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#337ab7] shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[#333333] text-[13px] font-bold mb-1">
                    New Password:
                  </label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#337ab7] shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[#333333] text-[13px] font-bold mb-1">
                    Repeat Password:
                  </label>
                  <input 
                    type="password" 
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#337ab7] shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-6 right-8 flex items-center gap-3">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#337ab7] hover:bg-[#286090] disabled:bg-opacity-50 text-white px-5 py-2 text-sm font-semibold rounded"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button 
          onClick={() => {
            setNewPassword("");
            setRepeatPassword("");
          }}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 px-5 py-2 text-sm rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

