"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg-primary)] overflow-x-hidden">
      {/* ─── Hero ─── */}
      <header className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 md:pt-32 md:pb-24">
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
            <span className="text-sm text-[var(--color-text-tertiary)]">
              Solo <span className="text-[var(--color-text-primary)] font-bold">$45 MXN</span>/mes
            </span>
          </div>
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
