"use client";
import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { MarqueeRibbon } from '@/components/landing/MarqueeRibbon'
import { CoreFeatures } from '@/components/landing/CoreFeatures'
import { SecurityShowcase } from '@/components/landing/SecurityShowcase'
import { FiatBridge } from '@/components/landing/FiatBridge'
import { UtilitySection } from '@/components/landing/UtilitySection'
import { ManifestoQuote } from '@/components/landing/ManifestoQuote'
import { FaqSection } from '@/components/landing/FaqSection'
import { FinalCta } from '@/components/landing/FinalCta'
import { Footer } from '@/components/landing/Footer'
import { DownloadModal } from '@/components/landing/DownloadModal'

export default function LandingPage() {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const open = () => setIsDownloadOpen(true);
  const close = () => setIsDownloadOpen(false);

  return (
    
    <div className="min-h-screen bg-[#FBF9F1] text-[#111111] font-sans selection:bg-[#0052FF] selection:text-white">

      {/* ─── Navigation ─── */}
      <Navbar onOpenDownload={open} />

      <main>
        {/* ─── 1. Hero ─── */}
        <Hero onOpenDownload={open} />

        {/* ─── 2. Marquee Ribbon ─── */}
        <MarqueeRibbon />

        {/* ─── 3. Feature Grid (3-card asymmetric layout) ─── */}
        <CoreFeatures onOpenDownload={open} />

        {/* ─── 4. Security Showcase (dark section, 2 spotlight cards) ─── */}
        <SecurityShowcase />

        {/* ─── 5. Fiat Bridge (bank bridge + global network) ─── */}
        <FiatBridge />

        {/* ─── 6. Utility (Download + Universal Connect) ─── */}
        <UtilitySection onOpenDownload={open} />

        {/* ─── 7. Manifesto Quote (editorial blockquote) ─── */}
        <ManifestoQuote />

        {/* ─── 8. FAQ Accordion ─── */}
        <FaqSection />

        {/* ─── 9. Closing CTA (2-col split layout) ─── */}
        <FinalCta onOpenDownload={open} />
      </main>

      {/* ─── Footer ─── */}
      <Footer />

      {/* ─── Download Modal ─── */}
      <DownloadModal isOpen={isDownloadOpen} onClose={close} />
    </div>
  
  );
}
