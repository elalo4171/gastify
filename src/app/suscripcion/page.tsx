"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SuscripcionPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-accent)] mb-2">
          Gastify
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10">
          Tu prueba gratuita terminó
        </p>

        {/* Plan card */}
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 mb-6 border border-[var(--color-border)]">
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">$45</span>
            <span className="text-sm text-[var(--color-text-secondary)]">MXN/mes</span>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-5">7 días gratis al suscribirte</p>

          <ul className="space-y-3 text-left mb-6">
            {[
              "Registros ilimitados",
              "Estadísticas detalladas",
              "Exportar a CSV",
              "Registro por voz",
              "Categorías personalizadas",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm text-[var(--color-text-primary)]">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {feat}
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Redirigiendo..." : "Suscribirse"}
          </button>
        </div>

        <button
          onClick={() => router.push("/ajustes")}
          className="text-xs text-[var(--color-text-tertiary)]"
        >
          Volver a ajustes
        </button>
      </div>
    </div>
  );
}
