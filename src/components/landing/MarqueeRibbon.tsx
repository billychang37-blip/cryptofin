export const MarqueeRibbon = () => {
  const items = [
    'HOLD', 'SPEND', 'SWAP', 'STAKE', 'SETTLE', 'MULTI-CHAIN',
    'SECURITY', 'APPLE PAY', 'CUSTODY', 'ZERO FEES'
  ]

  return (
    <div className="relative w-full border-y border-slate-200/80 bg-[#141416] text-[#F5F5F3] py-3.5 overflow-hidden select-none">
      <div className="flex w-max animate-[shimmer_25s_linear_infinite] gap-8 items-center text-xs font-mono font-bold tracking-widest uppercase">
        {[...items, ...items, ...items].map((word, i) => (
          <span key={i} className="flex items-center gap-6 shrink-0">
            <span className={i % 3 === 0 ? 'text-[#D4FF00]' : 'text-slate-300'}>{word}</span>
            <span className="text-[#00D2FF] text-[10px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
