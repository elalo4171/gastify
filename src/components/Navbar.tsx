"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface NavbarProps {
  onFabClick: () => void;
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export default function Navbar({ onFabClick }: NavbarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Only show on home
  if (!mounted || pathname !== "/") return null;

  return (
    <nav className="fixed bottom-safe left-0 right-0 z-40">
      <div className="max-w-[430px] mx-auto px-5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[var(--color-bg-card)] rounded-full px-2 py-2">
            <button onClick={onFabClick} className="w-10 h-10 flex items-center justify-center text-[var(--color-text-primary)] text-xl" aria-label="Nuevo registro">
              +
            </button>
            <Link href="/movimientos" className="w-10 h-10 flex items-center justify-center text-[var(--color-text-secondary)]" aria-label="Buscar">
              <IconSearch />
            </Link>
          </div>
          <button
            onClick={onFabClick}
            className="w-14 h-14 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-[0_0_30px_rgba(232,93,93,0.4)] transition-all duration-200 active:scale-90"
            aria-label="Nuevo registro"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
