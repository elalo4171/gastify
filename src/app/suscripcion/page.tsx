"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/lib/hooks";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function SuscripcionPage() {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { active, status, loading: subLoading, trialEnd, periodEnd, hasSubscription } = useSubscription();

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(errData?.error || "Error al crear la sesion de pago. Intenta de nuevo.");
        setLoading(false);
        return;
      }
      const { url } = await res.json();
      if (url && typeof url === "string" && url.startsWith("https://checkout.stripe.com")) {
        window.location.href = url;
      } else {
        setError("No se pudo obtener el enlace de pago. Intenta de nuevo.");
        setLoading(false);
      }
    } catch {
      setError("Error de conexion. Verifica tu internet e intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) {
        setError("No se pudo abrir el portal. Intenta de nuevo.");
        setPortalLoading(false);
        return;
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
      setPortalLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return iso;
    }
  };

  const statusLabel: Record<string, string> = {
    active: "Activa",
    trialing: "Prueba gratuita",
    free_day: "Dia gratuito",
    canceled: "Cancelada",
    past_due: "Pago pendiente",
    none: "Sin suscripcion",
  };

  const statusColor: Record<string, string> = {
    active: "text-[var(--color-income)] bg-[var(--color-income)]/15",
    trialing: "text-blue-400 bg-blue-400/15",
    free_day: "text-blue-400 bg-blue-400/15",
    canceled: "text-[var(--color-accent)] bg-[var(--color-accent)]/15",
    past_due: "text-amber-400 bg-amber-400/15",
    none: "text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)]",
  };

  const isActive = !subLoading && active;
  const showManage = hasSubscription && (status === "active" || status === "trialing" || status === "canceled" || status === "past_due");

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-accent)] mb-2">
          Gastify
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10">
          {isActive ? "Tu suscripcion" : "Suscribete para continuar"}
        </p>

        {/* Plan card */}
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 mb-6 border border-[var(--color-border)]">
          {/* Status badge */}
          {!subLoading && (
            <div className={`mb-5 py-1.5 px-4 rounded-full inline-block ${statusColor[status] || statusColor.none}`}>
              <span className="text-sm font-semibold">
                {statusLabel[status] || status}
              </span>
            </div>
          )}

          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">$45</span>
            <span className="text-sm text-[var(--color-text-secondary)]">MXN/mes</span>
          </div>

          {/* Subscription details */}
          {!subLoading && hasSubscription && (
            <div className="mt-4 mb-5 space-y-2 text-left bg-[var(--color-bg-secondary)] rounded-xl p-4">
              {status === "trialing" && trialEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Prueba termina</span>
                  <span className="text-[var(--color-text-primary)] font-medium">{formatDate(trialEnd)}</span>
                </div>
              )}
              {periodEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">
                    {status === "canceled" ? "Acceso hasta" : "Proxima factura"}
                  </span>
                  <span className="text-[var(--color-text-primary)] font-medium">{formatDate(periodEnd)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">Plan</span>
                <span className="text-[var(--color-text-primary)] font-medium">Mensual</span>
              </div>
            </div>
          )}

          {!subLoading && !hasSubscription && (
            <p className="text-xs text-[var(--color-text-tertiary)] mb-5">7 dias gratis al suscribirte</p>
          )}

          {/* Features */}
          <ul className="space-y-3 text-left mb-6">
            {[
              "Registros ilimitados",
              "Estadisticas detalladas",
              "Exportar a CSV",
              "Registro por voz",
              "Categorias personalizadas",
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

          {/* Action buttons */}
          {showManage ? (
            <button
              onClick={handleManage}
              disabled={portalLoading}
              className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {portalLoading ? "Abriendo..." : "Administrar suscripcion"}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Redirigiendo..." : "Suscribirse"}
            </button>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-500 leading-relaxed">{error}</p>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          Volver al dashboard
        </button>
      </div>
    </div>
  );
}
