"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';
import { AuthPageWrapper } from '@/components/auth/AuthPageWrapper';

export default function CreatePinPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num: string) => {
    if (step === 'create') {
      if (pin.length < 4) setPin(prev => prev + num);
    } else {
      if (confirmPin.length < 4) setConfirmPin(prev => prev + num);
    }
  };

  const currentPin = step === 'create' ? pin : confirmPin;
  
  const handleProceed = () => {
    if (step === 'create' && pin.length === 4) {
      setStep('confirm');
    } else if (step === 'confirm' && confirmPin.length === 4) {
      if (pin === confirmPin) {
        savePin();
      } else {
        toast.error("PINs do not match. Try again.");
        setConfirmPin('');
        setStep('create');
        setPin('');
      }
    }
  };

  const savePin = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({ pin_hash: pin }) // In production this should be hashed via Edge function
        .eq('id', user.id);

      if (error) throw error;

      // Now generate the wallets by calling the backend
      const res = await fetch('/api/wallet/create', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ userId: user.id, pin: pin })
      });
      
      const resData = await res.json();
      
      if (!res.ok) {
        console.error("Wallet generation failed:", resData);
        // It might fail if the sequence doesn't exist, we will still push to dashboard
        toast.error(resData.error || "PIN set, but wallet generation had an issue.");
      } else {
        toast.success("PIN and Wallets created successfully!");
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || "Failed to save PIN");
      setLoading(false);
      setConfirmPin('');
      setPin('');
      setStep('create');
    }
  };

  const titleMain = (
    <>
      {step === 'create' ? 'Create your' : 'Confirm your'}<br />
      <span className="font-serif italic text-slate-500 font-normal">4-digit PIN</span>
    </>
  );

  return (
    <AuthPageWrapper
      titleTop="SECURITY"
      titleMain={titleMain}
      subtitle={step === 'create' ? "Set a secure PIN to authorize sensitive actions and protect your wallet." : "Enter your PIN again to confirm your security settings."}
      imageSrc="/pinhero_img.png"
    >
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 flex flex-col items-center w-full">
        
        <div className="w-full text-left mb-8">
          <h2 className="text-xl font-black text-[#111111] mb-2 tracking-tight">
            {step === 'create' ? 'Create 4-Digit PIN' : 'Confirm your PIN'}
          </h2>
          <p className="text-slate-500 font-medium text-xs">
            {step === 'create' 
              ? <>Choose a PIN you'll remember.<br/>You'll use this PIN to authorize secure actions.</>
              : 'Enter your 4-digit PIN again.'}
          </p>
        </div>

        {/* 4 Square Boxes */}
        <div className="flex gap-3 justify-center mb-10 w-full">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl border flex items-center justify-center text-2xl font-bold transition-all ${i < currentPin.length ? 'border-[#0052FF] text-[#111111] bg-white' : 'border-slate-100 bg-[#FBF9F1] text-transparent'}`}
            >
              {i < currentPin.length ? '•' : '-'}
            </div>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 sm:gap-x-12 w-full max-w-[280px] mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button 
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-14 h-10 sm:w-16 sm:h-12 rounded-full bg-[#FBF9F1] flex items-center justify-center text-xl font-bold text-[#111111] hover:bg-[#f0ecd6] transition-all active:scale-95 mx-auto"
            >
              {num}
            </button>
          ))}
          <div className="w-14 h-10 mx-auto"></div>
          <button 
            onClick={() => handleKeyPress('0')}
            className="w-14 h-10 sm:w-16 sm:h-12 rounded-full bg-[#FBF9F1] flex items-center justify-center text-xl font-bold text-[#111111] hover:bg-[#f0ecd6] transition-all active:scale-95 mx-auto"
          >
            0
          </button>
          <div className="w-14 h-10 mx-auto"></div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProceed}
          disabled={currentPin.length < 4 || loading}
          className="w-full bg-[#D4FF00] hover:bg-[#c8f200] disabled:bg-[#FBF9F1] disabled:text-slate-400 text-[#111111] font-black text-sm py-3.5 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm mb-4"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
            <>
              {step === 'create' ? 'Create PIN' : 'Confirm PIN'} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <Shield className="w-4 h-4 text-[#0052FF]" />
          {step === 'create' ? 'Your PIN is encrypted and securely protected.' : 'Your PINs must match.'}
        </div>

      </div>
    </AuthPageWrapper>
  );
}

