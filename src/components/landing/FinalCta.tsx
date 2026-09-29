'use client';
import { ArrowUpRight } from 'lucide-react'

interface FinalCtaProps {
  onOpenDownload: () => void
}

export const FinalCta = ({ onOpenDownload }: FinalCtaProps) => {
  return (
    <section className="py-20 sm:py-24 bg-[#0A0A14] relative overflow-hidden">
      {/* Background concentric rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/4" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/4" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/6" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Left: Heading + stats */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#D4FF00]" />
              <span className="text-[11px] font-mono tracking-widest text-white/30 uppercase font-semibold">
                START TODAY
              </span>
            </div>

            {/* Brand mark */}
            <img src="/landing/logo.png" alt="CRYPTOFIN" className="h-8 w-auto object-contain mb-6 opacity-90" />

            <h2 className="font-sans font-black tracking-tight text-white leading-[1.03]"
                style={{ fontSize: 'clamp(40px,7vw,80px)' }}>
              Your wallet,{' '}
              <span className="font-serif italic font-normal text-white/50">
                ready in minutes.
              </span>
            </h2>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-white/8 pt-8">
              {[
                { value: '45k+', label: 'Active wallets' },
                { value: '$180M', label: 'Assets secured' },
                { value: '< 3 min', label: 'Onboarding' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-sans text-xl sm:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-white/30 font-mono mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: CTA card */}
          <div className="rounded-[28px] bg-white/5 border border-white/10 p-7 sm:p-10">
            {/* Digital orbit visual */}
            <div className="flex justify-center mb-6">
              <img
                src="/landing/hero-orbit.png"
                alt=""
                aria-hidden
                className="w-28 h-28 object-contain opacity-80 drop-shadow-2xl"
              />
            </div>

            <h3 className="font-sans text-xl sm:text-2xl font-black text-white leading-tight mb-4">
              Join 45,000+ people who chose{' '}
              <span className="font-serif italic font-normal text-[#D4FF00]">clarity.</span>
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-7">
              Create your CRYPTOFIN account in under 3 minutes. No seed phrases, no hardware wallets, no jargon. Just your balance, clearly in view.
            </p>

            <button
              onClick={onOpenDownload}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D4FF00] px-7 py-4 text-base font-black text-slate-950 hover:bg-[#c8f200] hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
              <span>Download CRYPTOFIN</span>
              <ArrowUpRight className="h-5 w-5 stroke-[3]" />
            </button>

            <div className="mt-5 flex items-center justify-center gap-5">
              {['iOS', 'Android', 'macOS'].map((p) => (
                <div key={p} className="flex items-center gap-1.5 text-xs text-white/20 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                  {p}
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-[11px] text-white/15 leading-relaxed">
              Free to download. No monthly fees. Regulated & insured up to $250,000.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
