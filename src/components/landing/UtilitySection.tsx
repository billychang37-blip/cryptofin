'use client';
import { Download } from 'lucide-react'

interface UtilitySectionProps {
  onOpenDownload: () => void
}

export const UtilitySection = ({ onOpenDownload }: UtilitySectionProps) => {
  return (
    <section id="utility" className="py-14 sm:py-24 bg-[#F5F3EC]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">

        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            EVERYDAY UTILITY
          </span>
        </div>

        <h2 className="font-sans text-2xl sm:text-4xl lg:text-[54px] font-black tracking-tight text-[#111111] leading-[1.05] mb-8 sm:mb-12 max-w-xl">
          Utility that fits{' '}
          <span className="font-serif italic font-normal text-slate-400">in your browser & pocket.</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">

          {/* ── Download & Platforms ── */}
          <div className="rounded-[22px] sm:rounded-[28px] bg-[#0A0A14] text-white p-4 sm:p-8 relative overflow-hidden group">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full border border-[#D4FF00]/10 pointer-events-none" />

            <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase mb-3 sm:mb-5">
              DOWNLOAD — FREE WEB & MOBILE
            </div>

            {/* Hero visual */}
            <div className="flex justify-center mb-3 sm:mb-6">
              <img
                src="/landing/hero-dual-fin.png"
                alt="CRYPTOFIN"
                className="w-28 h-28 sm:w-44 lg:w-48 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Platform buttons */}
            <div className="flex flex-col gap-2 mb-4 sm:mb-6">
              {[
                { label: 'Web Wallet (Browser)', sub: 'Chrome, Safari, Brave' },
                { label: 'Apple iOS App', sub: 'iPhone & iPad' },
                { label: 'Android APK', sub: 'Google Play & Direct' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={onOpenDownload}
                  className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-white/5 border border-white/8 px-3.5 py-2.5 sm:px-4 sm:py-3 hover:bg-white/10 hover:border-white/15 transition-all text-left group/btn"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">{p.label}</div>
                    <div className="text-[9px] sm:text-[10px] text-white/30 font-mono">{p.sub}</div>
                  </div>
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/20 group-hover/btn:text-white transition-colors" />
                </button>
              ))}
            </div>

            <h3 className="font-sans text-lg sm:text-2xl font-black text-white leading-tight mb-1.5 sm:mb-3">
              One wallet across all devices.
            </h3>
            <p className="text-xs sm:text-sm text-white/40 leading-relaxed">
              Your balance, transaction history, and settings sync securely via encrypted MPC shards across desktop and mobile.
            </p>

            <div className="mt-5 sm:mt-7 pt-3 sm:pt-5 border-t border-white/8 flex items-center justify-between">
              <span className="font-hand text-sm sm:text-base text-white/25 -rotate-1">zero subscription :)</span>
              <span className="rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/20 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-mono font-bold text-[#D4FF00]">
                FREE FOREVER
              </span>
            </div>
          </div>

          {/* ── Universal Connect ── */}
          <div className="rounded-[22px] sm:rounded-[28px] bg-white border border-slate-200/70 p-4 sm:p-8 relative overflow-hidden group shadow-xs hover:shadow-md transition-all duration-300">

            <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-3 sm:mb-5">
              UNIVERSAL CONNECT
            </div>

            {/* Nodes visual */}
            <div className="flex justify-center mb-3 sm:mb-6">
              <img
                src="/landing/vis-nodes.png"
                alt="Connected dApps"
                className="w-28 h-28 sm:w-44 lg:w-48 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* dApp list */}
            <div className="flex flex-col gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {[
                { name: 'Uniswap', type: 'DEX Trading', icon: '🦄', color: '#FF007A' },
                { name: 'Aave', type: 'DeFi Lending', icon: '👻', color: '#B6509E' },
                { name: 'OpenSea', type: 'NFT Marketplace', icon: '🌊', color: '#2081E2' },
                { name: 'Arbitrum Bridge', type: 'L2 Bridge', icon: '🌀', color: '#28A0F0' },
              ].map((app) => (
                <div
                  key={app.name}
                  className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 sm:px-4 sm:py-2.5"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm flex-shrink-0"
                      style={{ background: `${app.color}18` }}
                    >
                      {app.icon}
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-bold text-[#111111]">{app.name}</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono">{app.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">active</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-sans text-lg sm:text-2xl font-black text-[#111111] leading-tight mb-1.5 sm:mb-3">
              One-tap connection to any dApp.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Native WalletConnect v2 & EIP-6963 support. Authorize on-chain signatures directly with biometric approval.
            </p>

            <div className="mt-5 sm:mt-7 pt-3 sm:pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="font-hand text-sm sm:text-base text-slate-400 rotate-1">one wallet, everywhere</span>
              <span className="rounded-full bg-[#D4FF00] px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-mono font-bold text-slate-950 shadow-xs">
                WalletConnect v2
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
