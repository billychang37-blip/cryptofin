export const FiatBridge = () => {
  return (
    <section id="fiat-bridge" className="py-14 sm:py-24 bg-[#FBF9F1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">

        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="h-2 w-2 rounded-full bg-[#0052FF]" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            GLOBAL INFRASTRUCTURE
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6 mb-8 sm:mb-14">
          <h2 className="font-sans text-2xl sm:text-4xl lg:text-[54px] font-black tracking-tight text-[#111111] leading-[1.05] max-w-xl">
            Fiat & crypto,{' '}
            <span className="font-serif italic font-normal text-slate-400">
              seamlessly connected.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
            Move balance between bank accounts and web wallet rails in seconds with zero spread.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">

          {/* Card 1: Bank Bridge */}
          <div className="rounded-[22px] sm:rounded-[28px] bg-white border border-slate-200/80 p-4 sm:p-8 overflow-hidden relative group shadow-xs hover:shadow-md transition-all duration-300">
            <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-3 sm:mb-5">
              01 / BANK BRIDGE
            </div>

            <div className="flex justify-center mb-3 sm:mb-6">
              <img
                src="/landing/hero-facets.png"
                alt="Bank Bridge"
                className="w-28 h-28 sm:w-44 lg:w-48 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
              />
            </div>

            <h3 className="font-sans text-lg sm:text-2xl font-black text-[#111111] leading-tight mb-1.5 sm:mb-3">
              Direct Bank Bridge
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3 sm:mb-5">
              Connect US, UK, or EU accounts. Deposit fiat, receive crypto instantly via ACH, SEPA, or Faster Payments with zero conversion markup.
            </p>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
              {['ACH', 'SEPA', 'FPS'].map((rail) => (
                <div key={rail} className="rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 py-2 sm:py-3 text-center">
                  <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-700">{rail}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Instant</div>
                </div>
              ))}
            </div>

            <div className="mt-5 sm:mt-7 pt-3 sm:pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="font-hand text-sm sm:text-base text-slate-400 -rotate-1">no wire fees</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">Live settlements</span>
              </div>
            </div>
          </div>

          {/* Card 2: Global Network */}
          <div className="rounded-[22px] sm:rounded-[28px] bg-[#0A0A14] text-white border border-white/5 p-4 sm:p-8 overflow-hidden relative group shadow-xl">
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[22px] sm:rounded-[28px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full border border-[#0052FF]/12" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-[#0052FF]/12" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-full border border-[#0052FF]/18" />
            </div>

            <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase mb-3 sm:mb-5 relative z-10">
              02 / GLOBAL NETWORK
            </div>

            <div className="flex justify-center mb-3 sm:mb-6 relative z-10">
              <img
                src="/landing/hero-gateway.png"
                alt="Global Gateway"
                className="w-28 h-28 sm:w-44 lg:w-48 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
              />
            </div>

            <h3 className="font-sans text-lg sm:text-2xl font-black text-white leading-tight mb-1.5 sm:mb-3 relative z-10">
              Global Multi-Rail Network
            </h3>
            <p className="text-xs sm:text-sm text-white/40 leading-relaxed mb-3 sm:mb-5 relative z-10">
              Send crypto or fiat globally in under 2 seconds. The settlement engine automatically selects the optimal, lowest-fee pathway.
            </p>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 relative z-10">
              {[
                { val: '180+', label: 'Countries' },
                { val: '< 2s', label: 'Settlement' },
                { val: '$0', label: 'Platform fee' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/8 py-2 sm:py-3 text-center">
                  <div className="text-xs sm:text-sm font-black text-white font-mono">{s.val}</div>
                  <div className="text-[9px] sm:text-[10px] text-white/30 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 sm:mt-7 pt-3 sm:pt-5 border-t border-white/8 flex items-center justify-between relative z-10">
              <span className="font-hand text-sm sm:text-base text-white/30 rotate-1">always the best route</span>
              <span className="rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/20 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-mono font-bold text-[#D4FF00]">
                LIVE
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
