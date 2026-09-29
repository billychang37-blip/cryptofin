'use client';
import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

interface YieldCalculatorProps {
  onOpenDownload: () => void
}

export const YieldCalculator = ({ onOpenDownload }: YieldCalculatorProps) => {
  const [asset, setAsset] = useState<'SOL' | 'ETH' | 'USDC'>('SOL')
  const [amount, setAmount] = useState<number>(50)

  const rates: Record<'SOL' | 'ETH' | 'USDC', { apy: number; price: number; name: string }> = {
    SOL: { apy: 7.85, price: 184.75, name: 'Solana Liquid Staking' },
    ETH: { apy: 4.25, price: 3418.2, name: 'Ethereum Validator Yield' },
    USDC: { apy: 5.2, price: 1.0, name: 'USDC Treasury Yield (T-Bills)' },
  }

  const selectedRate = rates[asset]
  const principalUsd = amount * selectedRate.price
  const yearlyYieldUsd = principalUsd * (selectedRate.apy / 100)
  const monthlyYieldUsd = yearlyYieldUsd / 12
  const dailyYieldUsd = yearlyYieldUsd / 365

  return (
    <section id="calculator" className="px-4 py-20 md:px-8 bg-[#FAFAFA]">
      <div className="mx-auto max-w-4xl rounded-4xl border border-slate-200/90 bg-white p-6 sm:p-10 md:p-14 shadow-[0_12px_45px_rgba(0,0,0,0.04)] relative overflow-hidden">
        {/* Soft glow accent in top right */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center max-w-xl mx-auto">
          <p className="font-hand text-xl text-[#0052FF] md:text-2xl rotate-1">
            Yield engine simulator
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Put idle capital to work.
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Real institutional yields directly in your self-custody wallet. No lockups, interest paid daily.
          </p>
        </div>

        {/* Calculator Control Panel */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="md:col-span-6 space-y-6 text-left">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 font-display">
                Select Asset
              </label>
              <div className="flex gap-2">
                {(['SOL', 'ETH', 'USDC'] as const).map((coin) => (
                  <button
                    key={coin}
                    onClick={() => {
                      setAsset(coin)
                      if (coin === 'SOL') setAmount(50)
                      if (coin === 'ETH') setAmount(5)
                      if (coin === 'USDC') setAmount(5000)
                    }}
                    className={`flex-1 rounded-2xl py-3 px-3 sm:px-4 font-display text-sm font-bold border transition-all ${
                      asset === coin
                        ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-[0_4px_14px_rgba(0,82,255,0.25)]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {coin} ({rates[coin].apy}%)
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">
                  Deposit Amount
                </label>
                <span className="font-mono text-xs font-bold text-[#0052FF]">
                  {amount} {asset} ≈ ${principalUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
                </span>
              </div>
              <input
                type="range"
                min={asset === 'USDC' ? 500 : 1}
                max={asset === 'USDC' ? 50000 : asset === 'ETH' ? 25 : 300}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0052FF]"
              />
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0052FF]" />
                <span>Zero deposit or withdrawal fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0052FF]" />
                <span>Non-custodial, you keep full private key access</span>
              </div>
            </div>
          </div>

          {/* Earnings Outcome Bento Tile */}
          <div className="md:col-span-6 rounded-3xl bg-slate-50 border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                Projected Returns ({selectedRate.apy}% APY)
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display font-black text-3xl sm:text-4xl text-[#0052FF]">
                  +${yearlyYieldUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ year</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/70">
                <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-xs">
                  <div className="text-[10px] font-medium text-slate-500">Per Month</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    +${monthlyYieldUsd.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-xs">
                  <div className="text-[10px] font-medium text-slate-500">Per Day</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    +${dailyYieldUsd.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenDownload}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 px-6 font-display text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              <span>Download CRYPTOFIN to Stake</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
