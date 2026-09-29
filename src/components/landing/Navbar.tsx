'use client';
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Download } from 'lucide-react'

interface NavbarProps {
  onOpenDownload?: () => void
}

export const Navbar = ({ onOpenDownload }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Security', href: '#security-showcase' },
    { label: 'Fiat Bridge', href: '#fiat-bridge' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F1]/95 backdrop-blur-md border-b border-slate-200/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12 py-4">

        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/landing/logo.png"
            alt="CRYPTOFIN"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </a>

        {/* Desktop center nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-500">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-[#111111] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-bold text-slate-500 hover:text-[#111111] transition-colors">
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#D4FF00] px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-black text-slate-950 hover:bg-[#c8f200] hover:scale-[1.02] active:scale-95 transition-all shadow-xs"
          >
            <span className="hidden sm:inline">Create Account</span>
            <span className="sm:hidden">Get Started</span>
          </Link>


          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FBF9F1] border-t border-slate-200/60 px-5 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-slate-600 hover:text-[#111111] py-3 border-b border-slate-100 last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setMobileOpen(false); onOpenDownload?.() }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D4FF00] py-3.5 text-sm font-black text-slate-950 hover:bg-[#c8f200] transition-colors"
          >
            <Download className="h-4 w-4 stroke-[3]" />
            Download CRYPTOFIN
          </button>
        </div>
      )}
    </header>
  )
}
