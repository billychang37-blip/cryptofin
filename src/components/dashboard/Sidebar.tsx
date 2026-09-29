"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Wallet, ArrowRightLeft, Settings, Link2, TrendingUp, Sun, Moon, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase';

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const menu = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
    { name: 'My Wallet', icon: Wallet, href: '/dashboard/wallet' },
    { name: 'Transactions', icon: ArrowRightLeft, href: '/dashboard/transactions' },
    { name: 'Connect Wallet', icon: Link2, href: '/dashboard/connect' },
    { name: 'Staking', icon: TrendingUp, href: '/dashboard/staking' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <aside className={`hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 border-r transition-colors duration-300 ${isDark ? 'bg-[#0A0E17] border-white/5' : 'bg-[#FAFAFA] border-slate-200'}`}>
      
      {/* HEADER + LOGO */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-2">
          <img src="/new logo cryptofin.png" alt="Cryptofin Icon" className="w-8 h-8 object-contain" />
          <span className="text-[22px] font-bold text-white tracking-tight lowercase">cryptofin</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`group flex items-center justify-between px-4 py-3 w-full rounded-xl transition-all text-sm font-medium relative overflow-hidden ${
                isActive 
                  ? (isDark ? 'bg-[#102447] text-white' : 'bg-blue-50 text-blue-600')
                  : (isDark ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              {/* Left active border indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}
              
              <div className="flex items-center gap-3">
                <item.icon size={18} className={isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300'} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-4 space-y-3 mt-auto">
        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm border ${
            isDark ? 'border-white/5 bg-[#111827] text-zinc-300 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <ChevronRight size={16} className="text-zinc-500" />
        </button>

        <div className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
          isDark ? 'border-white/5 bg-[#111827]' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2ecc71] shadow-[0_0_8px_#2ecc71]" />
            <span className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>Connected</span>
          </div>
          <Wallet size={16} className="text-zinc-500" />
        </div>
      </div>
    </aside>
  );
}
