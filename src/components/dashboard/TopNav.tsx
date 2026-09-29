"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TbUser, TbHeadset, TbBell } from 'react-icons/tb';

export function TopNav() {
   const router = useRouter();
   const [isOnline, setIsOnline] = useState(true);

   useEffect(() => {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
         window.removeEventListener('online', handleOnline);
         window.removeEventListener('offline', handleOffline);
      };
   }, []);

   return (
      <div className="w-full bg-[#1e1e1e] border-b border-[#111111] sticky top-0 z-50">
         <div className="flex items-center justify-between px-5 py-4 w-full max-w-4xl mx-auto">
            <button onClick={() => router.push('/dashboard/profile')} className="w-8 h-8 rounded-full bg-[#fce4c4] flex items-center justify-center overflow-hidden">
               <TbUser size={20} className="text-[#966d42]" />
            </button>
         <div className="flex items-center gap-4">
            {isOnline ? (
               <div className="flex items-center gap-1 text-[#10b981] text-[12px] font-medium transition-colors">
                  <span>Online</span>
                  <span className="text-[14px]">⚡</span>
               </div>
            ) : (
               <div className="flex items-center gap-1 text-red-500 text-[12px] font-medium transition-colors">
                  <span>Offline</span>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full ml-0.5"></span>
               </div>
            )}
            <button className="text-white hover:text-neutral-300 transition-colors">
               <TbHeadset size={20} />
            </button>
            <button className="text-white hover:text-neutral-300 transition-colors relative">
               <TbBell size={20} />
               <span className="absolute 1 top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
         </div>
         </div>
      </div>
   );
}
