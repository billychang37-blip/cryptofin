"use client";
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AuthPageWrapper } from '@/components/auth/AuthPageWrapper';
import { createClient } from '@/lib/supabase';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Simple countdown timer
  const [timer, setTimer] = useState(45);
  
  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(prev => prev - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length < 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email || '',
      token: otp,
      type: 'signup'
    });

    if (error) {
      toast.error(error.message || "Invalid code");
      setLoading(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      toast.success("Email verified successfully!");
      router.push(`/auth/recovery-phrase?email=${encodeURIComponent(email || '')}`); 
    }
  };

  const titleMain = (
    <>
      Confirm your<br />
      <span className="font-serif italic text-slate-500 font-normal">OTP</span>
    </>
  );

  return (
    <AuthPageWrapper
      titleTop="SECURITY"
      titleMain={titleMain}
      subtitle={`We've sent a 6-digit code to your email (${email || 'your email'}).`}
      imageSrc="/otpimg.png"
    >
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
        <h2 className="text-3xl font-black text-[#111111] mb-2 tracking-tight w-full">Enter OTP</h2>
        <p className="text-slate-500 font-medium text-sm mb-10 w-full">Please enter the 6-digit code sent to your email.</p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex justify-between gap-2 sm:gap-3 mb-10">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-[#FBF9F1] border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4FF00] focus:ring-2 focus:ring-[#D4FF00]/20 transition-all placeholder:text-slate-400"
              />
            ))}
          </div>

          <div className="flex justify-center mb-10">
            <button 
              type="button" 
              disabled={timer > 0}
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#0052FF] hover:text-blue-700'}`}
            >
              <RefreshCw className={`w-4 h-4 ${timer === 0 ? '' : 'animate-spin-slow'}`} />
              Resend code {timer > 0 ? `in 00:${timer.toString().padStart(2, '0')}` : ''}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4FF00] hover:bg-[#c8f200] text-[#111111] font-black text-sm py-3.5 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm mb-6"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify →'}
          </button>

          <div className="text-center">
            <Link href="/auth/login" className="text-sm font-bold text-[#0052FF] hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </AuthPageWrapper>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF9F1] flex items-center justify-center"><Loader2 className="animate-spin text-[#0052FF]" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
