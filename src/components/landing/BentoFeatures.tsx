'use client';
import { useState } from 'react'
import {
  Zap,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight
} from 'lucide-react'
import { BENTO_FEATURES } from './data/mockData'

export const BentoFeatures = () => {
  const [filter, setFilter] = useState<string>('all')

  const filteredFeatures =
    filter === 'all'
      ? BENTO_FEATURES
      : BENTO_FEATURES.filter((f) => f.category === filter)

  const getIcon = (category: string) => {
    switch (category) {
      case 'trading':
        return <Zap className="h-5 w-5 text-[#0052FF]" />
      case 'security':
        return <ShieldCheck className="h-5 w-5 text-[#0052FF]" />
      case 'card':
        return <CreditCard className="h-5 w-5 text-[#0052FF]" />
      default:
        return <Layers className="h-5 w-5 text-slate-800" />
    }
  }

  return (
    <section id="features" className="px-4 py-24 md:px-8 md:py-32 bg-[#FAFAFA]">
      <div className="mx-auto max-w-5xl">
        {/* Section Header - Dottaa Light Style */}
        <div className="text-center">
          <p className="font-hand text-xl text-[#0052FF] md:text-2xl -rotate-1">
            Considered architecture
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Engineered for pure clarity.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-slate-600">
            A look under the hood of CRYPTOFIN. Every interaction is designed to get out of your way and let your assets work.
          </p>

          {/* Dottaa-style Filter Pill Dock */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full bg-slate-100 p-1.5 border border-slate-200/80 shadow-inner">
              {[
                { id: 'all', label: 'All Craft' },
                { id: 'trading', label: 'Speed & Swaps' },
                { id: 'security', label: 'Biometrics & MPC' },
                { id: 'card', label: 'Virtual Card' },
                { id: 'wallet', label: 'Interface' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`relative rounded-full px-4 py-2 font-display text-xs md:text-sm font-bold transition-all ${
                    filter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Filtered Bento Grid - Light Theme */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 transition-all duration-300 hover:border-slate-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-xs font-bold text-[#0052FF] font-display">
                    {feature.tag}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    {getIcon(feature.category)}
                  </div>
                </div>

                <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                {feature.note && (
                  <p className={`font-hand text-xl text-[#0052FF] ${feature.noteRotation || ''}`}>
                    {feature.note}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-[#0052FF] transition-colors ml-auto font-medium">
                  <span>Explore craft</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
