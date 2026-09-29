import { Star, CheckCircle } from 'lucide-react'
import { TESTIMONIALS } from './data/mockData'

export const Testimonials = () => {
  return (
    <section id="reviews" className="px-4 py-20 md:px-8 bg-[#FAFAFA]">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="font-hand text-xl text-[#0052FF] md:text-2xl -rotate-1">
            Community feedback
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Loved by builders & traders.
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm sm:text-base text-slate-600">
            Over 150,000+ people use CRYPTOFIN as their primary daily crypto account.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] shadow-xs"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    <CheckCircle className="h-3.5 w-3.5 text-[#0052FF] fill-current" />
                  </div>
                  <div className="text-[11px] text-slate-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <p className="font-hand text-2xl text-[#0052FF] rotate-1">
            4.9 / 5 rating across 12,000+ App Store reviews :)
          </p>
        </div>
      </div>
    </section>
  )
}
