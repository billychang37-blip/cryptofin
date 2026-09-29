"use client";
import React from 'react';
import { LayoutGrid, Loader2 } from 'lucide-react';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#111111] flex items-center justify-center">
      <Loader2 size={24} className="text-[#10b981] animate-spin" />
    </div>
  );
}