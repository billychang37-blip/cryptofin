"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Wallet, Navigation, Link2, Settings, Power } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function MobileNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

    const router = useRouter();
  const supabase = createClientComponentClient();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      router.push('/auth/login');
    } catch (err) {
      console.error(err);
    }
  };

  const menu = [
    { 
      name: 'Home', 
      href: '/dashboard',
      icon: <Wallet size={18} />
    },
    { 
      name: 'SEND', 
      action: () => { /* Handle later */ },
      icon: <Navigation size={18} />
    },
    { 
      name: 'Connect', 
      href: '/dashboard/connect',
      icon: <Link2 size={18} />
    },
    { 
      name: 'Settings', 
      href: '/dashboard/settings',
      icon: <Settings size={18} />
    },
    { 
      name: 'Logout', 
      action: handleLogout,
      icon: <Power size={18} />
    },
  ];

  return (
    <nav className={`fixed bottom-0 inset-x-0 z-50 py-2.5 px-4 pb-[max(env(safe-area-inset-bottom),0.625rem)] ${isDark ? 'bg-[#161618] border-t border-neutral-800' : 'bg-white border-t border-slate-200'}`}>
      <div className="flex items-center justify-around w-full max-w-4xl mx-auto">
        {menu.map((item) => {
          return (
            <Link 
              key={item.name} 
              href={item.href || '#'}
              onClick={item.action}
              className="flex flex-col items-center gap-1.5 min-w-[64px] transition-opacity hover:opacity-80"
            >
              <div className="text-[#10b981]">
                 {item.icon}
              </div>
              <span className="text-[10px] font-medium capitalize tracking-wide text-[#10b981]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
