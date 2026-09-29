export const PartnersStrip = () => {
  const partners = [
    { name: 'Mastercard Rails', desc: 'Direct POS Card Issuance' },
    { name: 'Apple Pay', desc: 'Instant Tap-to-Pay' },
    { name: 'Google Pay', desc: 'Global Contactless' },
    { name: 'CertiK Audited', desc: '100% Security Score' },
    { name: 'Fireblocks MPC', desc: 'Institutional Custody' },
    { name: '14+ Blockchains', desc: 'Multi-Chain Engine' },
  ]

  return (
    <div className="border-y border-slate-200/80 bg-[#FBF9F1] py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <p className="text-center text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-6">
          INSTITUTIONAL SECURITY • GLOBAL PAYMENT INFRASTRUCTURE
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {partners.map((p, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs"
            >
              <div className="font-display text-xs sm:text-sm font-bold text-slate-900">
                {p.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
