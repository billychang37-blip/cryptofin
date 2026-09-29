"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthPageWrapper } from '@/components/auth/AuthPageWrapper';

export default function LoginRecoveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedWords = pastedText.trim().split(/[\s,]+/);
    
    if (pastedWords.length === 12) {
      setWords(pastedWords);
      toast.success("Phrase pasted successfully");
    } else {
      toast.error("Please paste exactly 12 words");
    }
  };

  const handleChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value.toLowerCase().trim();
    setWords(newWords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (words.some(w => !w)) {
      toast.error("Please enter all 12 words");
      return;
    }
    
    setLoading(true);
    
    try {
      const phrase = words.join(' ');
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      
      // Look up user by recovery phrase (in a real app, hash this!)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('recovery_phrase', phrase)
        .limit(1);

      if (error) throw error;
      if (!profiles || profiles.length === 0) {
        throw new Error("Invalid recovery phrase. No account found.");
      }

      toast.success("Recovery phrase matched! You'd normally be authenticated here.");
      // Note: Supabase doesn't support direct login with just a phrase out-of-the-box,
      // you'd typically have a custom RPC or backend edge function that mints a token.
      // For now, we simulate success:
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to recover account');
      setLoading(false);
    }
  };

  const titleMain = (
    <>
      Enter your<br />
      <span className="font-serif italic text-slate-500 font-normal">12 seed phrase</span>
    </>
  );

  return (
    <AuthPageWrapper
      titleTop="RECOVERY"
      titleMain={titleMain}
      subtitle="This helps us verify your identity and restore your account."
      imageSrc="/recoveryimg.png"
    >
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl sm:text-3xl font-black text-[#111111] mb-2 tracking-tight">Input 12 Seed Phrase</h2>
        <p className="text-slate-500 font-medium text-sm mb-8">Enter the 12 words in the correct order.</p>

        <form onSubmit={handleSubmit} className="space-y-6" onPaste={handlePaste}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {words.map((word, index) => (
              <div key={index} className="relative flex items-center">
                <div className="absolute left-3 w-6 text-center text-xs font-black text-slate-400 select-none">
                  {index + 1}
                </div>
                <input
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  value={word}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-full bg-[#FBF9F1] border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#D4FF00] focus:ring-2 focus:ring-[#D4FF00]/20 transition-all placeholder:text-slate-300"
                  placeholder={`Word ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4FF00] hover:bg-[#c8f200] text-[#111111] font-black text-sm py-3.5 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm mt-4"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Continue →'}
          </button>
        </form>
      </div>
    </AuthPageWrapper>
  );
}
