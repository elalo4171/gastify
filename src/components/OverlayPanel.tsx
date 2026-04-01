"use client";

import type { ReactNode } from "react";

interface OverlayPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function OverlayPanel({ open, onClose, title, children }: OverlayPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-overlay">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-[90%] max-w-lg max-h-[80vh] bg-[var(--color-bg-primary)] rounded-2xl overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3 shrink-0">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] shrink-0"
          >
            ✕
          </button>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h2>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
