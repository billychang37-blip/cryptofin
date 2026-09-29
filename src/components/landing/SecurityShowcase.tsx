export const SecurityShowcase = () => {
  return (
    <section id="security-showcase" className="py-14 sm:py-24 bg-[#0A0A14] text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">

        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="h-2 w-2 rounded-full bg-[#D4FF00]" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-white/40 uppercase font-semibold">
            INSTITUTIONAL SECURITY
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6 mb-8 sm:mb-14">
          <h2 className="font-sans text-2xl sm:text-4xl lg:text-[54px] font-black tracking-tight text-white leading-[1.05] max-w-2xl">
            Built like a vault,{' '}
            <span className="font-serif italic font-normal text-white/50">
              designed for humans.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-white/40 max-w-xs leading-relaxed">
            MPC cryptography, biometric authentication, and zero single points of failure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">

          {/* Card 1: MPC Vault */}
          <div className="rounded-[22px] sm:rounded-[28px] bg-white/5 border border-white/8 p-4 sm:p-8 flex flex-col justify-between overflow-hidden relative group backdrop-blur-sm">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full border border-[#0052FF]/20 pointer-events-none" />

            <div>
              <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase mb-3 sm:mb-5">
                01 / MPC CUSTODY
              </div>

              <div className="flex justify-center mb-3 sm:mb-6">
                <img
                  src="/landing/vis-secure-token.png"
                  alt="Secure Token"
                  className="w-28 h-28 sm:w-48 lg:w-52 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                />
              </div>

              <h3 className="font-sans text-lg sm:text-2xl font-black text-white leading-tight mb-1.5 sm:mb-3">
                MPC Vault Architecture
              </h3>
              <p className="text-xs sm:text-sm text-white/40 leading-relaxed mb-3 sm:mb-5">
                Your private key never exists in one place. Shards are distributed between your local enclave, our HSM, and encrypted cloud.
              </p>

              <ul className="space-y-1.5 sm:space-y-2">
                {[
                  'Threshold Signature Scheme (2-of-3)',
                  'Hardware Security Module (HSM) backed',
                  'Biometric lock: Face ID + Passkey',
                  'Audited by CertiK & Halborn',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs sm:text-sm text-white/50">
                    <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#0052FF]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 sm:mt-7 pt-3 sm:pt-5 border-t border-white/8 flex items-center justify-between">
              <span className="font-hand text-sm sm:text-base text-white/25 -rotate-1">your keys, always yours</span>
              <span className="rounded-full bg-[#0052FF]/20 border border-[#0052FF]/30 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-mono font-bold text-[#6699FF]">
                SOC 2 TYPE II
              </span>
            </div>
          </div>

          {/* Card 2: Identity & Compliance */}
          <div className="rounded-[22px] sm:rounded-[28px] bg-white/5 border border-white/8 p-4 sm:p-8 flex flex-col justify-between overflow-hidden relative group backdrop-blur-sm">
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full border border-[#D4FF00]/10 pointer-events-none" />

            <div>
              <div className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-white/30 uppercase mb-3 sm:mb-5">
                02 / IDENTITY & COMPLIANCE
              </div>

              <div className="flex justify-center mb-3 sm:mb-6">
                <img
                  src="/landing/vis-nodes.png"
                  alt="Connected Nodes"
                  className="w-28 h-28 sm:w-48 lg:w-52 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                />
              </div>

              <h3 className="font-sans text-lg sm:text-2xl font-black text-white leading-tight mb-1.5 sm:mb-3">
                Instant Biometric Verification
              </h3>
              <p className="text-xs sm:text-sm text-white/40 leading-relaxed mb-3 sm:mb-5">
                Onboard in under 3 minutes with device liveness verification. Real-time AML compliance covering 120+ jurisdictions automatically.
              </p>

              <ul className="space-y-1.5 sm:space-y-2">
                {[
                  'Liveness detection — no static photo spoofing',
                  'Real-time AML & OFAC screening',
                  '120+ jurisdiction compliance coverage',
                  'GDPR & CCPA privacy-first handling',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs sm:text-sm text-white/50">
                    <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#D4FF00]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 sm:mt-7 pt-3 sm:pt-5 border-t border-white/8 flex items-center justify-between">
              <span className="font-hand text-sm sm:text-base text-white/25 rotate-1">onboard in 3 mins :)</span>
              <span className="rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/20 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-mono font-bold text-[#D4FF00]">
                GLOBAL COVERAGE
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
