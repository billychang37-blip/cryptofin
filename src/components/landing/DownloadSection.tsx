'use client';
import { useState, type FormEvent } from 'react'
import {
  Apple,
  Play,
  CheckCircle2,
  Sparkles,
  Send
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface DownloadSectionProps {
  onOpenDownload: () => void
}

export const DownloadSection = ({ onOpenDownload }: DownloadSectionProps) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [sentLink, setSentLink] = useState(false)

  const handleSendLink = (e: FormEvent) => {
    e.preventDefault()
    if (!phoneNumber) return
    setSentLink(true)
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#0052FF', '#00D2FF', '#0F172A', '#E2E8F0']
    })
    setTimeout(() => {
      setSentLink(false)
      setPhoneNumber('')
    }, 4000)
  }

  const triggerDownloadConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#0052FF', '#00D2FF', '#0F172A', '#E2E8F0']
    })
    onOpenDownload()
  }

  return (
    <section id="download" className="px-4 py-24 md:px-8 bg-[#FAFAFA]">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-4xl border border-slate-200/90 bg-white p-8 sm:p-12 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
        {/* Glow ambient background elements - Light Theme */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-50/60 blur-3xl pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Urgency & Direct Buttons */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-bold text-[#0052FF] font-display">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Available Globally in 120+ Countries</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.08]">
              Ready for crypto that gets out of your way?
            </h2>

            <p className="text-base text-slate-600 leading-relaxed max-w-lg">
              Download CRYPTOFIN today. Setup takes under 45 seconds with biometric passkeys. No verification delay, no credit card required to start self-custody.
            </p>

            {/* Hand-drawn note */}
            <div>
              <p className="font-hand text-2xl text-[#0052FF] -rotate-1">
                no 24 words to write down, just FaceID :)
              </p>
            </div>

            {/* Download Pills Grid */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => triggerDownloadConfetti()}
                className="group flex items-center gap-3 rounded-2xl bg-black px-6 py-3.5 text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.15)] font-display"
              >
                <Apple className="h-6 w-6" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-white/70 tracking-wider">
                    Download on the
                  </div>
                  <div className="text-sm font-black leading-tight">App Store</div>
                </div>
              </button>

              <button
                onClick={() => triggerDownloadConfetti()}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-slate-900 transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-95 shadow-xs font-display"
              >
                <Play className="h-5 w-5 fill-current text-[#0052FF]" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Get it on
                  </div>
                  <div className="text-sm font-black leading-tight">Google Play</div>
                </div>
              </button>
            </div>

            {/* Alternative options: Desktop / APK */}
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
              <button
                onClick={() => triggerDownloadConfetti()}
                className="hover:text-[#0052FF] transition-colors underline underline-offset-4"
              >
                Direct Android APK (v2.4)
              </button>
              <span>•</span>
              <button
                onClick={() => triggerDownloadConfetti()}
                className="hover:text-[#0052FF] transition-colors underline underline-offset-4"
              >
                macOS App (Apple Silicon)
              </button>
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleSendLink} className="pt-4 max-w-md">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 font-display">
                Or text download link to your phone:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0052FF] focus:bg-white focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 hover:bg-[#0052FF] text-white px-5 py-2.5 text-xs font-bold font-display transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="h-3 w-3" />
                  <span>Send</span>
                </button>
              </div>
              {sentLink && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Download link sent! Check your messages.</span>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: High-Craft QR Code Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group rounded-3xl border border-slate-200/90 bg-slate-50 p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
              {/* QR Code Container */}
              <div className="relative rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                {/* Clean Crisp QR Code */}
                <svg
                  className="h-48 w-48 text-slate-900"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="26" height="26" rx="3" />
                  <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="13" width="10" height="10" rx="1.5" />

                  <rect x="69" y="5" width="26" height="26" rx="3" />
                  <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                  <rect x="77" y="13" width="10" height="10" rx="1.5" />

                  <rect x="5" y="69" width="26" height="26" rx="3" />
                  <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                  <rect x="13" y="77" width="10" height="10" rx="1.5" />

                  {/* High density matrix blocks */}
                  <rect x="36" y="8" width="5" height="5" />
                  <rect x="44" y="8" width="5" height="5" />
                  <rect x="54" y="8" width="5" height="5" />
                  <rect x="36" y="18" width="5" height="5" />
                  <rect x="50" y="18" width="5" height="5" />
                  <rect x="42" y="26" width="5" height="5" />
                  <rect x="54" y="26" width="5" height="5" />

                  <rect x="8" y="36" width="5" height="5" />
                  <rect x="18" y="36" width="5" height="5" />
                  <rect x="8" y="46" width="5" height="5" />
                  <rect x="22" y="46" width="5" height="5" />
                  <rect x="14" y="54" width="5" height="5" />

                  <rect x="72" y="36" width="5" height="5" />
                  <rect x="82" y="36" width="5" height="5" />
                  <rect x="88" y="44" width="5" height="5" />
                  <rect x="72" y="50" width="5" height="5" />
                  <rect x="82" y="56" width="5" height="5" />

                  <rect x="36" y="72" width="5" height="5" />
                  <rect x="48" y="72" width="5" height="5" />
                  <rect x="56" y="80" width="5" height="5" />
                  <rect x="40" y="86" width="5" height="5" />
                  <rect x="50" y="86" width="5" height="5" />
                  <rect x="72" y="72" width="5" height="5" />
                  <rect x="84" y="76" width="5" height="5" />
                  <rect x="76" y="86" width="5" height="5" />
                  <rect x="88" y="86" width="5" height="5" />
                </svg>

                {/* Center Badge with Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-11 w-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-md">
                    <img src="/landing/logo.png" alt="CRYPTOFIN" className="h-4 w-auto object-contain" />
                  </div>
                </div>
              </div>

              {/* QR Helper Label */}
              <div className="mt-4 text-center">
                <div className="text-xs font-bold text-slate-900 font-display">
                  Scan to Install on Mobile
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Point camera to open App Store / Play Store
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="font-hand text-xl text-[#0052FF] rotate-2">
                instant scan & download :)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
