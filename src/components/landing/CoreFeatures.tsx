'use client';
import { ArrowUpRight } from 'lucide-react'

interface CoreFeaturesProps {
  onOpenDownload: () => void
}

export const CoreFeatures = ({ onOpenDownload }: CoreFeaturesProps) => {
  return (
    <section id="features" className="py-14 sm:py-24 bg-[#FBF9F1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">

        {/* Section Header */}
        <div className="max-w-2xl mb-8 sm:mb-16 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0052FF]" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              SIMPLICITY BY DEFAULT
            </span>
          </div>
          <h2 className="font-sans text-2xl sm:text-4xl lg:text-[54px] font-black tracking-tight text-[#111111] leading-[1.05]">
            Everything you need,{' '}
            <span className="font-serif italic font-normal text-slate-400">
              without the clutter.
            </span>
          </h2>
          <p className="text-xs sm:text-base text-slate-500 leading-relaxed max-w-xl">
            A single, calm web wallet designed for holding, swapping, and spending digital balance with complete clarity.
          </p>
        </div>

        {/* Dense Responsive Bento Grid: 2-col on mobile, 3-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">

          {/* ── Card 1: Custody (Span 2) ── */}
          <div className="col-span-2 lg:col-span-2 rounded-[22px] sm:rounded-[28px] bg-[#0A0A14] text-white p-4 sm:p-8 flex flex-col sm:flex-row gap-4 sm:gap-8 overflow-hidden relative group">
            <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full border border-[#0052FF]/20 pointer-events-none" />

            <div className="flex flex-col justify-between flex-1 relative z-10">
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase">
                    01 / CUSTODY
                  </span>
                  <span className="sm:hidden text-[9px] font-mono text-[#D4FF00] font-bold">1:1 BACKED</span>
                </div>
                
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2.5 sm:mb-4">
                  {['BTC', 'ETH', 'SOL', 'USDC'].map((c) => (
                    <span key={c} className="rounded-full bg-white/8 border border-white/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold text-white/60">
                      {c}
                    </span>
                  ))}
                </div>

                <h3 className="font-sans text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-1.5 sm:mb-3">
                  Hold your balance. Clean and separated.
                </h3>
                <p className="text-xs sm:text-sm text-white/40 leading-relaxed">
                  100% 1:1 reserve-backed custody. Assets remain segregated in audited multi-party vaults insured up to $250k.
                </p>
              </div>

              <div className="mt-4 sm:mt-8 pt-3 sm:pt-5 border-t border-white/8 flex items-center justify-between">
                <span className="font-hand text-sm sm:text-base text-white/30 -rotate-1">your keys, always yours</span>
                <button
                  onClick={onOpenDownload}
                  className="inline-flex items-center gap-1 rounded-full bg-[#D4FF00] px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black text-slate-950 hover:bg-[#c8f200] transition-colors"
                >
                  Download <ArrowUpRight className="h-3 w-3 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Prism reserve visual */}
            <div className="flex items-center justify-center sm:w-48 lg:w-52 flex-shrink-0 relative z-10">
              <img
                src="/landing/hero-prism.png"
                alt="Prism Reserve"
                className="w-24 h-24 sm:w-44 sm:h-44 object-contain group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-500 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* ── Card 2: Instant Swap (Col 1 on mobile) ── */}
          <div className="col-span-1 rounded-[20px] sm:rounded-[28px] bg-[#D4FF00] p-3.5 sm:p-7 flex flex-col justify-between overflow-hidden relative group">
            <div>
              <div className="text-[8px] sm:text-[10px] font-mono font-bold tracking-widest text-slate-700 uppercase mb-2 sm:mb-4">
                02 / SWAP
              </div>
              <div className="flex justify-center mb-2 sm:mb-5">
                <img
                  src="/landing/vis-transfer.png"
                  alt="Swap"
                  className="w-16 h-16 sm:w-36 sm:h-36 object-contain group-hover:scale-105 group-hover:rotate-2 transition-transform duration-500 drop-shadow-md"
                />
              </div>
              <h3 className="font-sans text-sm sm:text-xl font-black text-slate-950 leading-tight mb-1 sm:mb-2">
                Swap 500+ tokens
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-700 leading-snug line-clamp-2 sm:line-clamp-none">
                Smart routing across 14 chains. 0% platform fee.
              </p>
            </div>
            <div className="mt-3 sm:mt-6 pt-2.5 sm:pt-4 border-t border-black/10 flex items-center justify-between">
              <span className="hidden sm:inline font-hand text-sm text-slate-700 rotate-1">best rate guaranteed</span>
              <button onClick={onOpenDownload} className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-full bg-slate-950 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black text-white hover:bg-slate-800 transition-colors">
                Swap <ArrowUpRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* ── Card 3: Earn Yield (Col 2 on mobile) ── */}
          <div className="col-span-1 rounded-[20px] sm:rounded-[28px] bg-white border border-slate-200 p-3.5 sm:p-7 flex flex-col justify-between overflow-hidden relative group shadow-xs hover:shadow-md transition-shadow">
            <div>
              <div className="text-[8px] sm:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-2 sm:mb-4">
                03 / EARN
              </div>
              <div className="flex justify-center mb-2 sm:mb-5">
                <img
                  src="/landing/vis-growth.png"
                  alt="Growth"
                  className="w-16 h-16 sm:w-36 sm:h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                />
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] sm:text-xs font-mono font-bold text-emerald-700 mb-1.5 sm:mb-3">
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500" />
                8.5% APY
              </div>
              <h3 className="font-sans text-sm sm:text-xl font-black text-[#111111] leading-tight mb-1 sm:mb-2">
                Daily crypto yield
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug line-clamp-2 sm:line-clamp-none">
                Staking and treasury yield credited every 24h.
              </p>
            </div>
            <div className="mt-3 sm:mt-6 pt-2.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="hidden sm:inline font-hand text-sm text-slate-400 -rotate-1">paid daily :)</span>
              <button onClick={onOpenDownload} className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-full bg-[#D4FF00] px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black text-slate-950 hover:bg-[#c8f200] transition-colors">
                Earn <ArrowUpRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* ── Card 4: MPC Security (Span 2) ── */}
          <div className="col-span-2 lg:col-span-2 rounded-[22px] sm:rounded-[28px] bg-[#F8F6EF] border border-slate-200 p-4 sm:p-8 flex flex-col sm:flex-row gap-4 sm:gap-8 overflow-hidden relative group">
            <div className="flex-1">
              <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-2 sm:mb-4">
                04 / MPC SECURITY
              </div>
              <h3 className="font-sans text-lg sm:text-2xl font-black text-[#111111] leading-tight mb-1.5 sm:mb-3">
                No seed phrases. Zero single points of failure.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3 sm:mb-5">
                Multi-Party Computation (MPC) shards your private key between your biometric device and audited HSM enclaves. Sign with Face ID or Passkey in under a second.
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
                {[
                  { label: 'MPC Threshold Sig', icon: '🔐' },
                  { label: 'Face ID / Passkey', icon: '⚡' },
                  { label: 'HSM Sharded Keys', icon: '🛡️' },
                  { label: 'CertiK Audited', icon: '✓' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-white border border-slate-100 px-2 sm:px-3 py-1.5 sm:py-2.5">
                    <span className="text-xs sm:text-sm">{f.icon}</span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-700">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-center sm:w-48 lg:w-52 flex-shrink-0">
              <img
                src="/landing/vis-secure-arch.png"
                alt="Secure Architecture"
                className="w-24 h-24 sm:w-44 sm:h-44 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
