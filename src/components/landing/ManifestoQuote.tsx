export const ManifestoQuote = () => {
  return (
    <section className="py-20 sm:py-28 bg-[#FBF9F1] border-y border-slate-200/60 relative overflow-hidden">
      {/* Decorative giant quote mark */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 font-serif select-none pointer-events-none text-slate-100 font-black leading-none"
        style={{ fontSize: 'clamp(160px, 25vw, 320px)', lineHeight: 0.8 }}
      >
        "
      </div>

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 lg:px-12 text-center">

        <div className="inline-flex items-center gap-3 mb-8 sm:mb-10">
          <span className="h-px w-6 sm:w-10 bg-slate-300" />
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
            OUR BELIEF
          </span>
          <span className="h-px w-6 sm:w-10 bg-slate-300" />
        </div>

        <blockquote>
          <p className="font-serif italic text-3xl sm:text-5xl lg:text-6xl xl:text-[72px] font-normal text-[#111111] leading-[1.15] tracking-tight">
            Your crypto deserves a calmer, clearer home.
          </p>

          <footer className="mt-8 sm:mt-10 flex flex-col items-center gap-4">
            <div className="h-px w-12 bg-slate-300" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              We built CRYPTOFIN because managing digital money shouldn't require a CS degree, three hardware wallets, and a prayer. Clean. Fast. Trustworthy.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <img src="/landing/logo.png" alt="CRYPTOFIN" className="h-5 w-auto object-contain" />
            </div>
          </footer>
        </blockquote>

      </div>
    </section>
  )
}
