"use client";

import Link from "next/link";
import { useDemo } from "@/lib/demo-context";

export default function DemoBanner() {
  const { isDemo, exitDemo } = useDemo();

  if (!isDemo) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-accent)] text-white text-center py-2 px-4 flex items-center justify-center gap-3 text-sm">
      <span className="font-medium">Modo demo</span>
      <span className="opacity-70 hidden sm:inline">— los datos no se guardan</span>
      <Link
        href="/login"
        onClick={() => { sessionStorage.removeItem("gastify_demo"); document.cookie = "gastify_demo=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT"; }}
        className="px-3 py-0.5 rounded-full bg-white text-[var(--color-accent)] text-xs font-semibold"
      >
        Crear cuenta
      </Link>
      <button
        onClick={exitDemo}
        className="px-3 py-0.5 rounded-full border border-white/40 text-xs font-medium hover:bg-white/10 transition-colors"
      >
        Salir
      </button>
    </div>
  );
}
