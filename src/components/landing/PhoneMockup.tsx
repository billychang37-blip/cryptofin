'use client';
import { useState } from 'react'
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Zap,
  TrendingUp,
  ShieldCheck
} from 'lucide-react'
import { CRYPTO_ASSETS, RECENT_ACTIVITIES } from './data/mockData'

export const PhoneMockup = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'activity' | 'yield'>('tokens')
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false)
  const [selectedAsset, setSelectedAsset] = useState<string>('bitcoin')
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false)

  const handleCopyAddress = () => {
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] select-none text-left">
      {/* Soft ambient background glow behind the phone */}
      <div className="absolute -inset-4 rounded-[50px] bg-gradient-to-tr from-[#0052FF]/10 via-[#00D2FF]/10 to-indigo-100/50 blur-2xl -z-10 opacity-70"></div>

      {/* Titanium Silver Phone Chassis */}
      <div className="relative rounded-[44px] border-[6px] border-[#E2E8F0] bg-[#F1F5F9] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]">
        {/* Screen Bezel */}
        <div className="relative overflow-hidden rounded-[36px] bg-white border border-slate-200 text-[#0F172A] font-sans pb-4 shadow-inner">
          
          {/* Top Speaker / Dynamic Island */}
          <div className="relative pt-3 pb-2 flex items-center justify-between px-6 z-20">
            <span className="text-[11px] font-semibold tracking-tight text-slate-700">9:41</span>
            
            {/* Pill Notch */}
            <div className="flex items-center gap-1.5 bg-black px-3 py-1 rounded-full shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00D2FF] animate-pulse"></span>
              <span className="text-[9px] font-mono font-medium text-white/90">CRYPTOFIN</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-700">
              <span>5G</span>
              <div className="h-2.5 w-4 rounded-sm border border-slate-400 p-0.5 flex items-center">
                <div className="h-full w-full bg-slate-800 rounded-xs"></div>
              </div>
            </div>
          </div>

          {/* App Top Bar */}
          <div className="px-5 pt-2 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0052FF] to-[#00D2FF] p-[1.5px] shadow-xs">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#0052FF]">
                  CF
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <span>Main Vault</span>
                  <ShieldCheck className="h-3 w-3 text-[#0052FF]" />
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="text-[11px] font-mono text-slate-600 hover:text-[#0052FF] transition-colors flex items-center gap-1"
                >
                  <span>0x8F9a...4B2c</span>
                  {copiedAddress && <span className="text-[9px] text-[#0052FF] font-semibold">copied!</span>}
                </button>
              </div>
            </div>

            <div className="rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF]"></span>
              <span className="text-[10px] font-semibold text-[#0052FF]">Multi-Chain</span>
            </div>
          </div>

          {/* Total Net Worth Card */}
          <div className="mx-4 mb-3 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 p-4 shadow-sm relative overflow-hidden">
            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Total Net Worth</span>
              <button
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                aria-label="Toggle balance visibility"
              >
                {isBalanceHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900">
                {isBalanceHidden ? '••••••••••' : '$142,850.40'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-medium">USD</span>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                <TrendingUp className="h-2.5 w-2.5" />
                <span>+$18,420.25 (14.8%)</span>
              </div>
              <span className="text-[10px] text-slate-400">Past 30 days</span>
            </div>
          </div>

          {/* 4 Action Pills */}
          <div className="mx-4 mb-4 grid grid-cols-4 gap-2 text-center">
            <button className="group flex flex-col items-center gap-1 rounded-xl bg-slate-50 border border-slate-200/70 p-2 transition-all hover:bg-slate-100 active:scale-95 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-xs group-hover:scale-105 transition-transform">
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-semibold text-slate-700">Send</span>
            </button>

            <button className="group flex flex-col items-center gap-1 rounded-xl bg-slate-50 border border-slate-200/70 p-2 transition-all hover:bg-slate-100 active:scale-95 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/80 text-slate-800 shadow-xs group-hover:scale-105 transition-transform">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-700">Receive</span>
            </button>

            <button className="group flex flex-col items-center gap-1 rounded-xl bg-slate-50 border border-slate-200/70 p-2 transition-all hover:bg-slate-100 active:scale-95 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/80 text-slate-800 shadow-xs group-hover:scale-105 transition-transform">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-slate-700">Swap</span>
            </button>

            <button className="group flex flex-col items-center gap-1 rounded-xl bg-slate-50 border border-slate-200/70 p-2 transition-all hover:bg-slate-100 active:scale-95 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052FF]/10 text-[#0052FF] shadow-xs group-hover:scale-105 transition-transform border border-[#0052FF]/20">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <span className="text-[10px] font-semibold text-[#0052FF]">Stake</span>
            </button>
          </div>

          {/* Segmented Pill Tabs */}
          <div className="mx-4 mb-3 flex rounded-full bg-slate-100 p-1 border border-slate-200/80">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 rounded-full py-1 text-[11px] font-bold transition-all ${
                activeTab === 'tokens'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Assets
            </button>
            <button
              onClick={() => setActiveTab('yield')}
              className={`flex-1 rounded-full py-1 text-[11px] font-bold transition-all ${
                activeTab === 'yield'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Yield (7.8%)
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 rounded-full py-1 text-[11px] font-bold transition-all ${
                activeTab === 'activity'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Feed
            </button>
          </div>

          {/* Tab Content */}
          <div className="mx-4 min-h-[190px] space-y-2">
            {activeTab === 'tokens' && (
              <>
                {CRYPTO_ASSETS.map((asset) => {
                  const isSelected = selectedAsset === asset.id
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset.id)}
                      className={`group flex items-center justify-between rounded-xl p-2.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-50/40 border-[#0052FF]/30 shadow-xs'
                          : 'bg-white border-slate-200/70 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 font-bold text-sm text-slate-800">
                          {asset.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{asset.symbol}</span>
                            <span className="text-[10px] text-slate-400">{asset.name}</span>
                          </div>
                          <div className="text-[10px] font-mono font-medium text-slate-500">
                            ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">
                          {asset.balance} {asset.symbol}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-600">
                          <TrendingUp className="h-2.5 w-2.5" />
                          <span>+{asset.change24h}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {activeTab === 'yield' && (
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Auto-Compounding Pools</span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Live</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Solana Liquid Staking</div>
                    <div className="text-[10px] text-slate-500">No lockup • Daily payouts</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-[#0052FF]">7.85% APY</div>
                    <div className="text-[9px] text-slate-400">85 SOL deposited</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">USDC Treasury Yield</div>
                    <div className="text-[10px] text-slate-500">RWA T-Bills Backed</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-indigo-600">5.20% APY</div>
                    <div className="text-[9px] text-slate-400">Insured Vault</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-2">
                {RECENT_ACTIVITIES.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{act.title}</div>
                      <div className="text-[9px] text-slate-400">{act.subtitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#0052FF]">{act.amount}</div>
                      <div className="text-[9px] text-slate-400">{act.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Micro Footer inside Phone */}
          <div className="mt-3 mx-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
            <span>Encrypted with Hardware MPC</span>
            <span className="flex items-center gap-1 text-[#0052FF] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0052FF]"></span>
              Node Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
