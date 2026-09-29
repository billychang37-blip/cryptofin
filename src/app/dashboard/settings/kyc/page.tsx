"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase';
import { ChevronLeft, Upload, Info, Loader2, CheckCircle, Lock, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
];

const DOC_TYPES = [
  "National ID card",
  "International Passport",
  "Driver's Licence"
];

function CustomSelect({ value, onChange, options, placeholder, isDark }: any) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative w-full">
      <div 
        onClick={() => setOpen(!open)}
        className={`w-full p-4 rounded-xl text-sm font-medium outline-none transition-colors border cursor-pointer flex items-center justify-between ${isDark ? 'bg-[#151515] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} ${open ? 'border-primary/50' : ''}`}
      >
        <span className={value ? '' : 'text-zinc-500'}>{value || placeholder}</span>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute left-0 right-0 top-full mt-2 z-50 max-h-64 overflow-y-auto rounded-xl border shadow-xl ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-200'}`}>
            {options.map((opt: string) => (
               <div 
                 key={opt}
                 onClick={() => { onChange(opt); setOpen(false); }}
                 className={`p-3 text-sm cursor-pointer transition-colors ${value === opt ? (isDark ? 'bg-primary/10 text-primary font-bold' : 'bg-emerald-50 text-emerald-600 font-bold') : (isDark ? 'text-zinc-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50')}`}
               >
                 {opt}
               </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function KYCPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const supabase = createClient();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>('unverified');

  const [country, setCountry] = useState('');
  const [docType, setDocType] = useState('National ID card');
  const [docNumber, setDocNumber] = useState('');
  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data } = await supabase.from('kyc_applications').select('status').eq('user_id', user.id).maybeSingle();
      if (data) setStatus(data.status || 'unverified');
      setLoading(false);
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !docType || !docNumber || !file) {
      toast.error("Please fill all fields and upload a document.");
      return;
    }
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('kyc_applications')
        .insert({
          user_id: user.id,
          country,
          document_type: docType,
          document_number: docNumber,
          image_url: publicUrlData.publicUrl,
          status: 'pending'
        });

      if (insertError) {
        if (insertError.code === '23505') {
            await supabase.from('kyc_applications').update({
                country, document_type: docType, document_number: docNumber, image_url: publicUrlData.publicUrl, status: 'pending'
            }).eq('user_id', user.id);
        } else {
            throw insertError;
        }
      }

      toast.success("Identity verification submitted successfully.");
      setStatus('pending');
    } catch (error: any) {
      toast.error(error.message || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 md:p-8 pt-[max(env(safe-area-inset-top),1.5rem)] pb-32 animate-in fade-in duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      
      <div className="flex items-center gap-4 mb-10">
         <button onClick={() => router.back()} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}>
            <ChevronLeft size={20} />
         </button>
         <h1 className="text-xl md:text-2xl font-bold tracking-tight">Identity Verification</h1>
      </div>

      {status === 'pending' ? (
         <div className={`flex flex-col items-center justify-center text-center p-12 rounded-3xl border ${isDark ? 'bg-[#151515] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
               <Loader2 size={32} className="text-blue-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-2">Verification Pending</h2>
            <p className="text-sm text-zinc-500 max-w-md">Your identity documents have been submitted and are currently under review by our compliance team. This process usually takes 24-48 hours.</p>
         </div>
      ) : status === 'approved' ? (
         <div className={`flex flex-col items-center justify-center text-center p-12 rounded-3xl border ${isDark ? 'bg-[#151515] border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
               <CheckCircle size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Identity Verified</h2>
            <p className="text-sm text-zinc-500 max-w-md">Your account is fully verified. You have full access to all features and maximum withdrawal limits.</p>
         </div>
      ) : (
         <form onSubmit={handleSubmit} className="space-y-10">
            
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
               <Info size={16} className="mt-0.5 flex-shrink-0" />
               <p className="text-xs font-medium leading-relaxed">
                  Confirm your identity to unlock full account access and withdrawals. Use a clear photo of a government ID — driver's licence, passport, or national ID. All text must be legible.
               </p>
            </div>

            {/* SECTION 1 */}
            <div>
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 px-1">1 - Document Details</h3>
               <div className={`p-6 rounded-2xl border space-y-5 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-20">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 px-1">Issuing country</label>
                        <CustomSelect 
                           value={country} 
                           onChange={setCountry} 
                           options={COUNTRIES} 
                           placeholder="Select Country..." 
                           isDark={isDark} 
                        />
                     </div>

                     <div className="space-y-1.5 relative z-10">
                        <label className="text-xs font-bold text-zinc-500 px-1">Document type</label>
                        <CustomSelect 
                           value={docType} 
                           onChange={setDocType} 
                           options={DOC_TYPES} 
                           placeholder="Select Type..." 
                           isDark={isDark} 
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-zinc-500 px-1">Document ID number</label>
                     <input required type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="Enter the number on your document" className={`w-full p-4 rounded-xl text-sm font-medium outline-none transition-colors border ${isDark ? 'bg-[#151515] border-white/10 text-white focus:border-primary/50 placeholder:text-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-primary/50 placeholder:text-slate-400'}`} />
                  </div>
               </div>
            </div>

            {/* SECTION 2 */}
            <div>
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 px-1">2 - Document Photo</h3>
               <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                  
                  <div className={`relative w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors overflow-hidden ${isDark ? 'border-zinc-800 hover:border-zinc-700 bg-[#151515]' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}>
                     <input required type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                     
                     {file ? (
                        <div className="flex flex-col items-center pointer-events-none w-full">
                           <div className="w-32 h-32 md:w-48 md:h-32 mb-4 rounded-xl overflow-hidden border border-primary/30 relative">
                              {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                   <CheckCircle size={32} className="text-primary" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <span className="bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md">Change</span>
                              </div>
                           </div>
                           <p className="text-sm font-bold text-primary">{file.name}</p>
                           <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center pointer-events-none">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-white/5' : 'bg-white shadow-sm border border-slate-200'}`}>
                              <Upload size={20} className="text-zinc-400" />
                           </div>
                           <p className="font-bold text-sm mb-1">Add document photo</p>
                           <p className="text-xs font-medium text-zinc-500 mb-4">JPG, PNG or WEBP · Max 4MB</p>
                           <div className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                              Choose file
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
               {submitting ? <Loader2 size={18} className="animate-spin" /> : "Submit verification"}
            </button>

            <p className="text-[10px] text-center font-bold text-zinc-500 flex items-center justify-center gap-1.5 uppercase tracking-widest mt-4">
               <Lock size={10} /> Stored securely for compliance review only.
            </p>

         </form>
      )}

    </div>
  );
}
