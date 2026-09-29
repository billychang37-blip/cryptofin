import { TrendingUp } from 'lucide-react'

export const LiveRatesTicker = () => {
  const tickerItems = [
    { label: 'BTC/USD', val: '$94,280.50', change: '+3.42%' },
    { label: 'ETH/USD', val: '$3,418.20', change: '+5.14%' },
    { label: 'SOL/USD', val: '$184.75', change: '+8.65%' },
    { label: 'SUI/USD', val: '$3.84', change: '+12.30%' },
    { label: 'Multi-Chain TPS', val: '4,892 tx/s', change: 'Peak' },
    { label: 'Uniswap v4 Gas', val: '11 Gwei', change: 'Optimized' },
    { label: 'MPC Security Audit', val: '100% Passed', change: 'Audited' },
  ]

  return (
    <div className="relative w-full border-y border-slate-200/80 bg-white/70 py-3 backdrop-blur-md overflow-hidden">
      <div className="flex w-max animate-[shimmer_20s_linear_infinite] gap-8 px-4 items-center">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <div key={index} className="flex items-center gap-2.5 shrink-0 text-xs">
            <span className="font-semibold text-slate-400 font-display uppercase tracking-wider">
              {item.label}
            </span>
            <span className="font-mono font-bold text-slate-900">{item.val}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
              <TrendingUp className="h-2.5 w-2.5" />
              {item.change}
            </span>
            <span className="text-slate-300 ml-2">•</span>
          </div>
        ))}
      </div>
    </div>
  )
}
