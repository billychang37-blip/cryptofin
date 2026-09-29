'use client';
import { useState } from 'react'
import {
  X,
  Apple,
  Play,
  ArrowDownToLine,
  CheckCircle2,
  Copy,
  Globe
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DownloadModal = ({ isOpen, onClose }: DownloadModalProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'web' | 'ios' | 'android'>('web')
  const [downloading, setDownloading] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  if (!isOpen) return null

  const handleStartDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      setDownloadComplete(true)
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4FF00', '#0052FF', '#111111']
      })
    }, 1000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText('https://cryptofin.io/app')
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-[#FBF9F1] p-5 sm:p-7 text-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-2xs"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <img src="/landing/logo.png" alt="CRYPTOFIN" className="h-7 w-auto object-contain" />
          <div>
            <h3 className="font-sans text-lg font-black text-slate-950">
              Get CRYPTOFIN
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Instant non-custodial web wallet
            </p>
          </div>
        </div>

        {/* Platform Selector Pills */}
        <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-200/60 p-1 border border-slate-200">
          <button
            onClick={() => {
              setSelectedPlatform('web')
              setDownloadComplete(false)
            }}
            className={`flex flex-col items-center gap-1 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              selectedPlatform === 'web'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Globe className="h-4 w-4 text-[#0052FF]" />
            <span className="text-[11px]">Web Wallet</span>
          </button>

          <button
            onClick={() => {
              setSelectedPlatform('ios')
              setDownloadComplete(false)
            }}
            className={`flex flex-col items-center gap-1 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              selectedPlatform === 'ios'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Apple className="h-4 w-4" />
            <span className="text-[11px]">Apple iOS</span>
          </button>

          <button
            onClick={() => {
              setSelectedPlatform('android')
              setDownloadComplete(false)
            }}
            className={`flex flex-col items-center gap-1 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
              selectedPlatform === 'android'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Play className="h-4 w-4 fill-current text-slate-700" />
            <span className="text-[11px]">Android APK</span>
          </button>
        </div>

        {/* Selected Platform Details */}
        <div className="mt-4 rounded-2xl bg-white border border-slate-200/80 p-3.5 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-600">
            <span>Environment</span>
            <span className="font-bold text-slate-900">
              {selectedPlatform === 'web' && 'All modern browsers (PWA supported)'}
              {selectedPlatform === 'ios' && 'iOS 16.0+ (Face ID / Passkey)'}
              {selectedPlatform === 'android' && 'Android 10.0+ (Biometric unlock)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Authentication</span>
            <span className="font-mono font-medium text-slate-900">Biometric / Passkey</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Security Model</span>
            <span className="flex items-center gap-1 text-[#0052FF] font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> MPC 2-of-3 Sharded
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          {downloadComplete ? (
            <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">Setup Initialized!</div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Complete your 30-second biometric keygen to activate your balance.
              </p>
            </div>
          ) : (
            <button
              onClick={handleStartDownload}
              disabled={downloading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4FF00] py-3.5 px-6 text-xs sm:text-sm font-black text-slate-950 transition-all hover:bg-[#c8f200] hover:scale-[1.01] active:scale-95 shadow-xs disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4 stroke-[3]" />
              <span>
                {downloading
                  ? 'Connecting Enclave...'
                  : selectedPlatform === 'web'
                  ? 'Launch Web Wallet Free'
                  : `Download for ${selectedPlatform.toUpperCase()}`}
              </span>
            </button>
          )}
        </div>

        {/* Share Link Copy */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200 text-[11px] text-slate-400">
          <span>Direct Access:</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[#0052FF] hover:underline font-mono font-medium"
          >
            <Copy className="h-3 w-3" />
            <span>{copiedLink ? 'Copied!' : 'cryptofin.io/app'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
