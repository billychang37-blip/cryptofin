'use client';
import { ArrowUpRight, Download } from 'lucide-react'

interface HeroProps {
  onOpenDownload: () => void
}

export const Hero = ({ onOpenDownload }: HeroProps) => {
  return (
    <section
      id="home"
      className="relative bg-[#FBF9F1] overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-28"
    >
      {/* Subtle orbit rings top-right */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full border border-slate-200/50" />
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-[320px] w-[320px] rounded-full border border-slate-200/50" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

        {/* Top eyebrow */}
        <div className="flex items-center gap-2 mb-6 sm:mb-7">
          <span className="h-2 w-2 rounded-full bg-[#0052FF]" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
            CRYPTOFIN — YOUR CRYPTO WALLET
          </span>
        </div>

        {/* Main two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 lg:gap-14 items-start">

          {/* ── LEFT: Headline + CTA ── */}
          <div className="flex flex-col gap-5 lg:pt-4">

            {/* 
              Tagline rework:
              "Hold. Move. Grow." was too vague.
              New: direct, wallet-specific, confident.
            */}
            <h1
              className="font-sans font-black tracking-tighter text-[#111111] leading-[0.95]"
              style={{ fontSize: 'clamp(48px, 8.5vw, 96px)' }}
            >
              Your crypto,{' '}
              <span className="font-serif italic font-normal tracking-normal text-slate-400">
                finally clear.
              </span>
            </h1>

            {/* Token pills */}
            <div className="flex flex-wrap gap-2">
              {['BTC', 'ETH', 'SOL', 'USDC', 'BNB', '500+ tokens'].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-mono font-bold text-slate-500 shadow-2xs"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* 
              Subheading rework:
              Old: "One account for your entire crypto life — custody, swap, earn, and spend 
              with institutional-grade security and zero seed-phrase anxiety."
              → Too long, jargon-heavy, vague.
              
              New: Short, clear, addresses the core pain point of crypto wallets 
              (complexity, fear, fragmentation). Reflects the web wallet nature.
            */}
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-[400px]">
              Hold, swap, earn, and spend — in one clean web wallet. No seed phrases,
              no confusion, no missing funds.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={onOpenDownload}
                className="inline-flex items-center gap-2 rounded-full bg-[#D4FF00] px-6 sm:px-7 py-3.5 sm:py-4 text-sm font-black text-slate-950 hover:bg-[#c8f200] hover:scale-[1.03] active:scale-95 transition-all shadow-sm"
              >
                <Download className="h-4 w-4 stroke-[3]" />
                Download Free
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-[#111111] transition-colors"
              >
                See all features
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center">
                {['#2D6A4F', '#C07D4A', '#5A4079', '#1A1A2E'].map((bg, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-[#FBF9F1] flex items-center justify-center text-white text-[9px] font-black shadow-2xs"
                    style={{ background: bg, marginLeft: i === 0 ? 0 : '-7px' }}
                  >
                    {['R', 'S', 'A', '+'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-black text-[#111111]">45,000+ wallets created</div>
                <div className="text-[11px] text-slate-400 font-mono">$180M+ secured globally</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Card Stack ── */}
          <div className="w-full flex flex-col gap-3 sm:gap-4">

            {/* ① Main dark balance card */}
            <div className="rounded-[24px] sm:rounded-[28px] bg-[#0A0A14] text-white p-5 sm:p-6 relative overflow-hidden shadow-2xl">
              <img
                src="/landing/hero-dual-fin.png"
                alt=""
                aria-hidden
                className="absolute -top-6 -right-6 w-36 sm:w-44 h-36 sm:h-44 object-contain opacity-60 pointer-events-none select-none"
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
                      TOTAL PORTFOLIO
                    </div>
                    <div
                      className="font-sans font-black tracking-tight"
                      style={{ fontSize: 'clamp(28px,5vw,44px)' }}
                    >
                      $12,480
                      <span className="text-lg sm:text-2xl text-white/30 font-normal">.50</span>
                    </div>
                  </div>
                  <img src="/landing/logo.png" alt="CRYPTOFIN" className="h-6 sm:h-7 w-auto object-contain mt-1 opacity-90" />
                </div>

                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <mark className="bg-[#D4FF00] text-black px-2 py-0.5 rounded-md text-xs font-black">
                    +12.4%
                  </mark>
                  <span className="text-xs text-white/30 font-mono">this week</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/30">Live</span>
                  </span>
                </div>

                {/* Coin grid */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { symbol: '₿', name: 'BTC', val: '$8,200', color: '#F7931A' },
                    { symbol: 'Ξ', name: 'ETH', val: '$3,100', color: '#627EEA' },
                    { symbol: '◎', name: 'SOL', val: '$1,180', color: '#9945FF' },
                  ].map((coin) => (
                    <div key={coin.name} className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/8 p-2.5 sm:p-3">
                      <div className="text-sm sm:text-base font-black" style={{ color: coin.color }}>{coin.symbol}</div>
                      <div className="text-[9px] sm:text-[10px] font-mono text-white/30 mt-0.5">{coin.name}</div>
                      <div className="text-[11px] sm:text-xs font-bold text-white mt-1">{coin.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ② Two mini cards — smaller on mobile */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">

              {/* Lime card */}
              <div className="rounded-[18px] sm:rounded-[24px] bg-[#D4FF00] p-3.5 sm:p-5 relative overflow-hidden min-h-[110px] sm:min-h-[140px] flex flex-col justify-between">
                <img
                  src="/landing/hero-gateway.png"
                  alt=""
                  aria-hidden
                  className="absolute -right-4 -bottom-4 w-20 sm:w-28 h-20 sm:h-28 object-contain opacity-70 pointer-events-none select-none"
                />
                <div>
                  <div className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest mb-1.5 sm:mb-2">
                    CRYPTO CARD
                  </div>
                  <div className="font-sans text-base sm:text-lg font-black text-slate-950 leading-tight">
                    Spend<br />anywhere
                  </div>
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-700">Apple Pay ↗</div>
              </div>

              {/* White card */}
              <div className="rounded-[18px] sm:rounded-[24px] bg-white border border-slate-200 p-3.5 sm:p-5 relative overflow-hidden min-h-[110px] sm:min-h-[140px] flex flex-col justify-between shadow-xs">
                <img
                  src="/landing/hero-orbit.png"
                  alt=""
                  aria-hidden
                  className="absolute -right-4 -bottom-4 w-20 sm:w-28 h-20 sm:h-28 object-contain opacity-80 pointer-events-none select-none"
                />
                <div>
                  <div className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">
                    INSTANT SWAP
                  </div>
                  <div className="font-sans text-base sm:text-lg font-black text-[#111111] leading-tight">
                    500+<br />tokens
                  </div>
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400">0% fees ↗</div>
              </div>
            </div>

            {/* ③ Handwritten note */}
            <div className="flex items-center justify-between px-1">
              <span className="font-hand text-base sm:text-lg text-slate-400 -rotate-1">
                built for humans, not just degens :)
              </span>
              <button
                onClick={onOpenDownload}
                className="text-[11px] font-mono font-bold text-[#0052FF] hover:underline"
              >
                Download ↗
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
