"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { createClient } from '@/lib/supabase';
import { AuthPageWrapper } from '@/components/auth/AuthPageWrapper';

export default function RecoveryPhrasePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [phrase, setPhrase] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate a new 12-word recovery phrase using ethers
    const wallet = ethers.Wallet.createRandom();
    const words = wallet.mnemonic?.phrase.split(' ') || [];
    setPhrase(words);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(phrase.join(' '));
    setCopied(true);
    toast.success("Recovery phrase copied!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save to profiles
      const { error } = await supabase
        .from('profiles')
        .update({ recovery_phrase: phrase.join(' ') })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Phrase saved successfully!");
      router.push('/auth/create-pin');
    } catch (err: any) {
      toast.error(err.message || "Failed to save recovery phrase");
      setLoading(false);
    }
  };

  const titleMain = (
    <>
      Save your<br />
      <span className="font-serif italic text-slate-500 font-normal">recovery phrase</span>
    </>
  );

  return (
    <AuthPageWrapper
      titleTop="SECURITY"
      titleMain={titleMain}
      subtitle="Write down these 12 words in order. Never share them with anyone."
      imageSrc="/recoveryimg.png"
    >
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3 items-start w-full">
          <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 font-medium">
            If you lose this phrase, you will lose access to your account forever. We cannot recover it for you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6">
          {phrase.map((word, index) => (
            <div key={index} className="relative flex items-center bg-[#FBF9F1] border border-slate-200 rounded-lg py-2.5 px-3">
              <span className="w-5 text-xs font-black text-slate-400 select-none mr-2">
                {index + 1}
              </span>
              <span className="text-sm font-bold text-[#111111]">
                {word}
              </span>
            </div>
          ))}
        </div>

        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm font-bold text-[#0052FF] hover:text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-full transition-colors mb-8"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copied to clipboard' : 'Copy Phrase'}
        </button>

        <button
          onClick={handleNext}
          disabled={loading || phrase.length === 0}
          className="w-full bg-[#D4FF00] hover:bg-[#c8f200] text-[#111111] font-black text-sm py-3.5 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'I have saved it securely →'}
        </button>
      </div>
    </AuthPageWrapper>
  );
}
