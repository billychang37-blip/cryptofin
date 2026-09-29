'use client';
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How fast does account setup take?',
      a: 'Less than 45 seconds. Download the app, verify with Apple Face ID or Android Biometrics, and your multi-chain vault is immediately active. No seed phrases to write down, no waiting for days for manual approval.'
    },
    {
      q: 'How does the CRYPTOFIN Mastercard work?',
      a: 'Once you download the app, an instant virtual card is issued to your account. You can tap "Add to Apple Wallet" or "Add to Google Pay" in one click. You can also request our physical matte black metal card delivered to your doorstep with zero shipping fees.'
    },
    {
      q: 'Are my funds safe? Is this self-custody?',
      a: '100% non-custodial. Your funds are secured by institutional Multi-Party Computation (MPC) audited by CertiK and Halborn. Your private key is never stored in one place, and only your biometric device can sign transactions. Even if CRYPTOFIN servers were down, you own full mathematical sovereignty.'
    },
    {
      q: 'Are there any hidden fees or deposit charges?',
      a: 'Zero. We charge 0% on deposits, 0% on standard transfers, and 0% foreign transaction fees when you swipe your card internationally. You always see the exact exchange rate with zero hidden spread.'
    },
    {
      q: 'Which cryptocurrencies and networks are supported?',
      a: 'We support over 500+ tokens across 14 networks including Bitcoin (Taproot), Ethereum, Solana, Base, Arbitrum, Polygon, Avalanche, and Sui.'
    }
  ]

  return (
    <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0052FF] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-display">
            Frequently Asked Questions
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-black text-slate-950">
            Got questions? We’ve got answers.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Everything you need to know before installing CRYPTOFIN.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-display text-base font-bold text-slate-900 transition-colors hover:text-[#0052FF]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#0052FF]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600 border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
