"use client";

import { useSubscription } from "@/lib/hooks";
import { useDemo } from "@/lib/demo-context";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function SubscriptionGate() {
  const { active, status, loading } = useSubscription();
  const { isDemo } = useDemo();
  const router = useRouter();
  const pathname = usePathname();

  // Don't gate on these pages
  if (isDemo || loading || active) return null;
  if (pathname === "/suscripcion" || pathname === "/ajustes") return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[var(--color-bg-primary)]/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-sm mx-6 text-center">
        <div className="text-5xl mb-4">
          {status === "canceled" ? "😢" : "⏰"}
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
          {status === "canceled"
            ? "Suscripción cancelada"
            : "Tu prueba gratuita terminó"}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed">
          {status === "canceled"
            ? "Reactiva tu suscripción para seguir registrando gastos e ingresos."
            : "Suscríbete para seguir usando Gastify. Incluye 7 días gratis."}
        </p>

        <button
          onClick={() => router.push("/suscripcion")}
          className="w-full py-3.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90 mb-3"
        >
          Ver planes — $45 MXN/mes
        </button>

        <button
          onClick={() => router.push("/ajustes")}
          className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          Ir a ajustes
        </button>
      </div>
    </div>
  );
}
