'use client';
import { Home, Smartphone, LayoutGrid, Calculator, Download } from 'lucide-react'

interface MobileNavProps {
  onOpenDownload: () => void
}

export const MobileNav = ({ onOpenDownload }: MobileNavProps) => {
  return (
    <nav className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 md:hidden" aria-label="Mobile navigation">
      <div className="flex items-center gap-1 rounded-full border border-black/[0.08] bg-white/90 p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <a
          href="#home"
          aria-label="Home"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
        >
          <Home className="h-5 w-5" />
        </a>
        <a
          href="#preview"
          aria-label="App Preview"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
        >
          <Smartphone className="h-5 w-5" />
        </a>
        <a
          href="#features"
          aria-label="Features"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
        >
          <LayoutGrid className="h-5 w-5" />
        </a>
        <a
          href="#calculator"
          aria-label="Yield Engine"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
        >
          <Calculator className="h-5 w-5" />
        </a>
        <button
          onClick={onOpenDownload}
          aria-label="Download"
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#0052FF] text-white transition-transform active:scale-95 shadow-[0_4px_14px_rgba(0,82,255,0.35)]"
        >
          <Download className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>
    </nav>
  )
}
