"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ChevronRight, GlobeLock } from 'lucide-react';

export default function StakingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-8 pt-[max(env(safe-area-inset-top),1.5rem)] md:pt-12 lg:pt-16 pb-32 animate-in fade-in duration-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* BREADCRUMB HEADER */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6 px-1">
         <span onClick={() => router.push('/dashboard')} className={`cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>DASHBOARD</span>
         <ChevronRight size={12} className="text-zinc-500" />
         <span className={isDark ? 'text-primary' : 'text-emerald-600'}>STAKING</span>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         {/* Minimalist Unavailable Card */}
         <div className={`flex flex-col items-center text-center max-w-md p-10 rounded-3xl border transition-all ${isDark ? 'bg-[#151515] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
               <GlobeLock size={24} className={isDark ? 'text-zinc-400' : 'text-slate-500'} />
            </div>
            
            <h1 className={`text-xl font-bold tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
               Region Restricted
            </h1>
            
            <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
               This feature is currently unavailable in your region due to local regulatory guidelines. We are actively expanding our staking operations globally.
            </p>

            <button 
               onClick={() => router.push('/dashboard')}
               className={`mt-8 px-6 py-2.5 rounded-full text-xs font-bold transition-colors border ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'}`}
            >
               Return to Dashboard
            </button>
         </div>
      </div>

    </div>
  );
}
