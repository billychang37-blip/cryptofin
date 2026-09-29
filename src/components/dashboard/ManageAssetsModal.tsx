"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { CRYPTO_ASSETS } from '@/lib/constants';
import { useTheme } from '@/context/ThemeContext';
import { AssetIcon } from './AssetIcon';

interface ManageAssetsModalProps {
  onClose: () => void;
  onUpdate: (visibleIds: string[]) => void;
}

export function ManageAssetsModal({ onClose, onUpdate }: ManageAssetsModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [visibleAssets, setVisibleAssets] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('visible_assets');
    if (stored) {
      setVisibleAssets(JSON.parse(stored));
    } else {
      setVisibleAssets(CRYPTO_ASSETS.map(a => a.id));
    }
  }, []);

  const toggleAsset = (id: string) => {
    setVisibleAssets(prev => {
      const isVisible = prev.includes(id);
      let newVisible;
      if (isVisible) {
         if (prev.length <= 1) return prev; // prevent hiding all
         newVisible = prev.filter(x => x !== id);
      } else {
         newVisible = [...prev, id];
      }
      return newVisible;
    });
  };

  const saveAndClose = () => {
    localStorage.setItem('visible_assets', JSON.stringify(visibleAssets));
    onUpdate(visibleAssets);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[80] flex flex-col ${isDark ? 'bg-[#151515] text-white' : 'bg-slate-50 text-slate-900'} animate-in slide-in-from-right-8 duration-300`}>
       
       {/* HEADER */}
       <div className={`flex items-center p-4 border-b ${isDark ? 'border-white/5 bg-[#1a1a1a]' : 'border-slate-200 bg-white'}`}>
         <button onClick={saveAndClose} className="flex items-center gap-1 font-bold hover:opacity-70 transition-opacity">
            <ChevronLeft size={20} />
            <span className="text-sm">back</span>
         </button>
       </div>

       {/* TABLE HEADER */}
       <div className={`flex items-center justify-between px-6 py-3 text-xs font-bold ${isDark ? 'text-zinc-500 bg-[#151515]' : 'text-slate-500 bg-slate-50'}`}>
         <span>Asset</span>
         <span>Actions</span>
       </div>

       {/* LIST */}
       {/* padding bottom 24 to account for the MobileNav so the last item can be scrolled fully into view */}
       <div className="flex-1 overflow-y-auto pb-24">
         {CRYPTO_ASSETS.map(asset => {
           const isActive = visibleAssets.includes(asset.id);
           return (
             <div key={asset.id} className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/5 bg-[#181818]' : 'border-slate-100 bg-white'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8"><AssetIcon symbol={asset.id.split('_')[0]} size="sm" /></div>
                  <span className="font-bold text-[13px] tracking-wide uppercase">{asset.name}</span>
                </div>
                
                {/* TOGGLE SWITCH */}
                <button 
                  onClick={() => toggleAsset(asset.id)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-300 ease-in-out ${isActive ? 'bg-[#21c55e]' : (isDark ? 'bg-zinc-700' : 'bg-slate-300')}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
             </div>
           )
         })}
       </div>
    </div>
  );
}

