"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useDemo } from "@/lib/demo-context";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { resolved, setTheme } = useTheme();
  const { enterDemo } = useDemo();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => setTheme(resolved === "dark" ? "light" : "dark");

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg-primary)] overflow-x-hidden">
      {/* ─── Top bar ─── */}
      <div className="flex justify-end px-6 pt-6 md:px-10 md:pt-8">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Cambiar tema"
        >
          {resolved === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* ─── Hero ─── */}
      <header className="relative flex flex-col items-center justify-center text-center px-6 pt-10 pb-16 md:pt-20 md:pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-accent)] opacity-[0.04] blur-[100px]" />
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--color-accent)] mb-4">
            Gastify
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
            Tus finanzas personales, simples y claras. Registra gastos e ingresos en segundos.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90 text-center"
            >
              Comenzar ahora
            </Link>
            <button
              onClick={enterDemo}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-semibold transition-all active:scale-[0.98] hover:border-[var(--color-accent)] text-center"
            >
              Probar demo
            </button>
          </div>
          <p className="mt-3 text-sm text-[var(--color-text-tertiary)]">
            Solo <span className="text-[var(--color-text-primary)] font-bold">$45 MXN</span>/mes
          </p>
        </div>
      </header>

      {/* ─── Features ─── */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[var(--color-text-primary)]">
            Todo lo que necesitas para controlar tu dinero
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              emoji="💰"
              title="Balance mensual"
              description="Ve tus ingresos, gastos y balance del mes de un vistazo. Navega entre meses para comparar."
            />
            <FeatureCard
              emoji="📝"
              title="Registro rápido"
              description="Agrega gastos e ingresos en segundos con el botón flotante. Descripción, monto y categoría."
            />
            <FeatureCard
              emoji="🎙️"
              title="Registro por voz"
              description="Dicta tus gastos y la app los registra automáticamente. Manos libres, sin complicaciones."
            />
            <FeatureCard
              emoji="🏷️"
              title="Categorías personalizadas"
              description="Crea y organiza tus propias categorías con emojis. Oculta las que no uses."
            />
            <FeatureCard
              emoji="📊"
              title="Estadísticas visuales"
              description="Gráficas de pastel y barras para entender en qué gastas más. Filtra por rango de fechas."
            />
            <FeatureCard
              emoji="🔍"
              title="Buscar movimientos"
              description="Encuentra cualquier registro por descripción. Filtra por tipo (entrada/salida) y por mes."
            />
            <FeatureCard
              emoji="📤"
              title="Exportar a CSV"
              description="Descarga todos tus datos en formato CSV para analizarlos en Excel o Google Sheets."
            />
            <FeatureCard
              emoji="🌙"
              title="Modo oscuro"
              description="Interfaz clara u oscura según tu preferencia. También se adapta al sistema automáticamente."
            />
            <FeatureCard
              emoji="💱"
              title="Multi-moneda"
              description="Elige entre MXN, USD, EUR y más. Cambia de moneda en cualquier momento desde ajustes."
            />
          </div>
        </div>
      </section>

      {/* ─── Dispositivos ─── */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--color-text-primary)]">
            Disponible en todos tus dispositivos
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-10 max-w-md mx-auto">
            Usa Gastify desde donde quieras. Se adapta perfectamente a cualquier pantalla.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 transition-all hover:border-[var(--color-accent)]/30">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">Celular</span>
            </div>

            <div className="flex flex-col items-center gap-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 transition-all hover:border-[var(--color-accent)]/30">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">Tablet / iPad</span>
            </div>

            <div className="flex flex-col items-center gap-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 transition-all hover:border-[var(--color-accent)]/30">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">Web</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="max-w-md mx-auto">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Plan mensual</p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-5xl font-extrabold text-[var(--color-text-primary)]">$45</span>
              <span className="text-lg text-[var(--color-text-secondary)]">MXN</span>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-6">por mes</p>

            <ul className="text-left space-y-3 mb-8">
              <PricingItem text="Registros ilimitados de gastos e ingresos" />
              <PricingItem text="Categorías personalizadas con emojis" />
              <PricingItem text="Estadísticas y gráficas mensuales" />
              <PricingItem text="Registro por voz" />
              <PricingItem text="Exportación a CSV" />
              <PricingItem text="Modo oscuro y multi-moneda" />
              <PricingItem text="App instalable (PWA) en tu celular" />
            </ul>

            <Link
              href="/login"
              className="block w-full py-3.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90"
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[var(--color-border)] px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-[var(--color-accent)]">Gastify</span>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Finanzas personales, simples y claras.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 transition-all hover:border-[var(--color-accent)]/30">
      <span className="text-3xl mb-3 block">{emoji}</span>
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
      <span className="text-[var(--color-income)] mt-0.5 shrink-0">&#10003;</span>
      {text}
    </li>
  );
}
