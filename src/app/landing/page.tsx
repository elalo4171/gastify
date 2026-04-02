"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useDemo } from "@/lib/demo-context";

/* ═══════════════════════════════════════════════════
   i18n — Español / English
   ═══════════════════════════════════════════════════ */
const t = {
  es: {
    lang: "ES",
    langFull: "Español",
    altLang: "EN",
    nav: { features: "Funciones", pricing: "Precios", faq: "FAQ", cta: "Comenzar" },
    hero: {
      badge: "Finanzas personales simplificadas",
      title: "Controla tu dinero",
      titleAccent: "sin complicaciones",
      subtitle:
        "Registra gastos e ingresos en segundos. Visualiza tu balance, categoriza todo y toma mejores decisiones financieras.",
      cta: "Comenzar gratis",
      demo: "Ver demo",
      price: "Solo",
      pricePer: "/mes",
      trusted: "Hecho para personas reales, no contadores.",
    },
    features: {
      label: "Funciones",
      title: "Todo lo que necesitas,",
      titleAccent: "nada que no",
      items: [
        {
          icon: "chart",
          title: "Balance mensual",
          desc: "Ingresos, gastos y balance del mes de un vistazo. Navega entre meses para comparar.",
        },
        {
          icon: "bolt",
          title: "Registro en segundos",
          desc: "Agrega movimientos al instante. Descripción, monto y categoría — listo.",
        },
        {
          icon: "mic",
          title: "Registro por voz",
          desc: "Dicta tus gastos y la app los registra automáticamente. Manos libres.",
        },
        {
          icon: "tag",
          title: "Categorías con emojis",
          desc: "Crea y personaliza tus propias categorías. Oculta las que no necesites.",
        },
        {
          icon: "pie",
          title: "Estadísticas visuales",
          desc: "Gráficas de pastel y barras para entender en qué gastas más.",
        },
        {
          icon: "search",
          title: "Buscar movimientos",
          desc: "Encuentra cualquier registro. Filtra por tipo, descripción y mes.",
        },
        {
          icon: "download",
          title: "Exportar a CSV",
          desc: "Descarga tus datos para analizarlos en Excel o Google Sheets.",
        },
        {
          icon: "moon",
          title: "Modo oscuro",
          desc: "Interfaz clara u oscura según tu preferencia. Se adapta al sistema.",
        },
        {
          icon: "currency",
          title: "Multi-moneda",
          desc: "MXN, USD, EUR y más. Cambia de moneda cuando quieras.",
        },
      ],
    },
    mockup: {
      title: "Diseñado para tu día a día",
      subtitle:
        "Una interfaz limpia que te muestra exactamente lo que necesitas. Sin distracciones, sin curva de aprendizaje.",
      balance: "Balance",
      income: "Ingresos",
      expense: "Gastos",
      categories: "Por categoría",
    },
    pricing: {
      label: "Precios",
      title: "Simple y accesible",
      subtitle: "Un solo plan con todo incluido. Sin sorpresas.",
      plan: "Plan mensual",
      currency: "MXN",
      period: "por mes",
      cta: "Comenzar ahora",
      items: [
        "Registros ilimitados",
        "Categorías personalizadas",
        "Estadísticas y gráficas",
        "Registro por voz",
        "Exportación a CSV",
        "Modo oscuro y multi-moneda",
        "App instalable (PWA)",
      ],
    },
    faq: {
      label: "Preguntas frecuentes",
      title: "¿Tienes dudas?",
      items: [
        {
          q: "¿Puedo probar antes de pagar?",
          a: "Sí, puedes usar el modo demo sin crear cuenta para explorar todas las funciones de Gastify.",
        },
        {
          q: "¿Mis datos están seguros?",
          a: "Absolutamente. Usamos Supabase con cifrado y autenticación segura. Tus datos financieros nunca se comparten.",
        },
        {
          q: "¿Funciona en mi celular?",
          a: "Sí. Gastify es una Progressive Web App (PWA) que puedes instalar en cualquier dispositivo — celular, tablet o computadora.",
        },
        {
          q: "¿Puedo cancelar en cualquier momento?",
          a: "Sí, sin compromisos. Puedes cancelar tu suscripción cuando quieras desde la sección de ajustes.",
        },
        {
          q: "¿Qué monedas soportan?",
          a: "Soportamos MXN, USD, EUR, COP, ARS, CLP y PEN. Puedes cambiar de moneda en cualquier momento.",
        },
      ],
    },
    finalCta: {
      title: "Empieza a controlar tu dinero hoy",
      subtitle: "Sin tarjeta de crédito para probar. Configura tu cuenta en 30 segundos.",
      cta: "Crear cuenta gratis",
      demo: "O prueba la demo",
    },
    footer: {
      tagline: "Finanzas personales, simples y claras.",
      product: "Producto",
      links: { features: "Funciones", pricing: "Precios", demo: "Demo", login: "Iniciar sesión" },
      legal: "Legal",
      legalLinks: { privacy: "Privacidad", terms: "Términos" },
      rights: "Todos los derechos reservados.",
    },
  },
  en: {
    lang: "EN",
    langFull: "English",
    altLang: "ES",
    nav: { features: "Features", pricing: "Pricing", faq: "FAQ", cta: "Get Started" },
    hero: {
      badge: "Personal finance simplified",
      title: "Control your money",
      titleAccent: "effortlessly",
      subtitle:
        "Track expenses and income in seconds. Visualize your balance, categorize everything, and make better financial decisions.",
      cta: "Start for free",
      demo: "Try demo",
      price: "Just",
      pricePer: "/mo",
      trusted: "Built for real people, not accountants.",
    },
    features: {
      label: "Features",
      title: "Everything you need,",
      titleAccent: "nothing you don't",
      items: [
        {
          icon: "chart",
          title: "Monthly balance",
          desc: "Income, expenses and balance at a glance. Navigate between months to compare.",
        },
        {
          icon: "bolt",
          title: "Quick entry",
          desc: "Add transactions instantly. Description, amount and category — done.",
        },
        {
          icon: "mic",
          title: "Voice recording",
          desc: "Dictate your expenses and the app records them automatically. Hands-free.",
        },
        {
          icon: "tag",
          title: "Emoji categories",
          desc: "Create and customize your own categories. Hide the ones you don't need.",
        },
        {
          icon: "pie",
          title: "Visual statistics",
          desc: "Pie and bar charts to understand where your money goes.",
        },
        {
          icon: "search",
          title: "Search transactions",
          desc: "Find any record. Filter by type, description and month.",
        },
        {
          icon: "download",
          title: "Export to CSV",
          desc: "Download your data to analyze in Excel or Google Sheets.",
        },
        {
          icon: "moon",
          title: "Dark mode",
          desc: "Light or dark interface. Adapts to your system preference.",
        },
        {
          icon: "currency",
          title: "Multi-currency",
          desc: "MXN, USD, EUR and more. Switch currency anytime.",
        },
      ],
    },
    mockup: {
      title: "Designed for your daily life",
      subtitle:
        "A clean interface that shows you exactly what you need. No distractions, no learning curve.",
      balance: "Balance",
      income: "Income",
      expense: "Expenses",
      categories: "By category",
    },
    pricing: {
      label: "Pricing",
      title: "Simple & affordable",
      subtitle: "One plan with everything included. No surprises.",
      plan: "Monthly plan",
      currency: "MXN",
      period: "per month",
      cta: "Get started",
      items: [
        "Unlimited records",
        "Custom categories",
        "Stats & charts",
        "Voice recording",
        "CSV export",
        "Dark mode & multi-currency",
        "Installable app (PWA)",
      ],
    },
    faq: {
      label: "Frequently asked questions",
      title: "Got questions?",
      items: [
        {
          q: "Can I try before paying?",
          a: "Yes! Use the demo mode without an account to explore all of Gastify's features.",
        },
        {
          q: "Is my data secure?",
          a: "Absolutely. We use Supabase with encryption and secure authentication. Your financial data is never shared.",
        },
        {
          q: "Does it work on my phone?",
          a: "Yes. Gastify is a Progressive Web App (PWA) you can install on any device — phone, tablet or computer.",
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes, no commitments. Cancel your subscription anytime from the settings section.",
        },
        {
          q: "What currencies are supported?",
          a: "We support MXN, USD, EUR, COP, ARS, CLP and PEN. You can switch currency at any time.",
        },
      ],
    },
    finalCta: {
      title: "Start controlling your money today",
      subtitle: "No credit card needed to try. Set up your account in 30 seconds.",
      cta: "Create free account",
      demo: "Or try the demo",
    },
    footer: {
      tagline: "Personal finance, simple and clear.",
      product: "Product",
      links: { features: "Features", pricing: "Pricing", demo: "Demo", login: "Sign in" },
      legal: "Legal",
      legalLinks: { privacy: "Privacy", terms: "Terms" },
      rights: "All rights reserved.",
    },
  },
} as const;

type Lang = keyof typeof t;

/* ═══════════════════════════════════════════════════
   Icons (inline SVG to avoid dependencies)
   ═══════════════════════════════════════════════════ */
const icons: Record<string, React.ReactNode> = {
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 5-9" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  mic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0014 0" /><line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><circle cx="7" cy="7" r="1" />
    </svg>
  ),
  pie: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21.21 15.89A10 10 0 118 2.83" /><path d="M22 12A10 10 0 0012 2v10z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  currency: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════
   Landing Page Component
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("es");
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { resolved, setTheme } = useTheme();
  const { enterDemo } = useDemo();

  useEffect(() => {
    setMounted(true);
    // Detect browser language
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === "en") setLang("en");
  }, []);

  if (!mounted) return null;

  const c = t[lang];
  const toggleTheme = () => setTheme(resolved === "dark" ? "light" : "dark");
  const toggleLang = () => setLang(lang === "es" ? "en" : "es");

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-x-hidden">
      {/* ─── Structured Data (JSON-LD) ─── */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Gastify",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "45",
              priceCurrency: "MXN",
              billingDuration: "P1M",
            },
            description:
              lang === "es"
                ? "App de finanzas personales para registrar gastos e ingresos."
                : "Personal finance app to track expenses and income.",
            url: "https://gastify.app",
          }),
        }}
      />

      {/* ═══════════════════════════════════════════
          NAVBAR
          ═══════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-bg-primary)]/80 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold text-[var(--color-accent)]">Gastify</span>

          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--color-text-secondary)]">
            <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">
              {c.nav.features}
            </a>
            <a href="#pricing" className="hover:text-[var(--color-text-primary)] transition-colors">
              {c.nav.pricing}
            </a>
            <a href="#faq" className="hover:text-[var(--color-text-primary)] transition-colors">
              {c.nav.faq}
            </a>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="h-9 px-3 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)] transition-colors"
              aria-label="Switch language"
            >
              {c.altLang}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)] transition-colors"
              aria-label="Toggle theme"
            >
              {resolved === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* CTA */}
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 px-4 items-center rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {c.nav.cta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative px-6 pt-20 pb-24 md:pt-32 md:pb-36">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-accent)] opacity-[0.05] blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs font-medium text-[var(--color-text-secondary)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--color-income)] animate-pulse" />
            {c.hero.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            {c.hero.title}{" "}
            <span className="text-[var(--color-accent)]">{c.hero.titleAccent}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed mb-10">
            {c.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[var(--color-accent)]/20"
            >
              {c.hero.cta}
            </Link>
            <button
              onClick={enterDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-semibold transition-all hover:border-[var(--color-accent)] active:scale-[0.98]"
            >
              {c.hero.demo}
            </button>
          </div>

          <p className="text-sm text-[var(--color-text-tertiary)]">
            {c.hero.price} <span className="text-[var(--color-text-primary)] font-bold">$45 MXN</span>{c.hero.pricePer}
          </p>

          <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 backdrop-blur-sm">
            <span className="text-sm text-[var(--color-text-secondary)]">
              {lang === "es" ? "Creada por" : "Created by"}{" "}
              <span className="text-[var(--color-text-primary)] font-semibold">Eduardo García</span>
              {" "}{lang === "es" ? "con" : "with"}
            </span>
            <a
              href="https://claude.ai/code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold hover:bg-[var(--color-accent)]/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v15A2.5 2.5 0 0 0 4.5 22h15a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 19.5 2h-15ZM8.4 16.2a.75.75 0 0 1-.75.75H7a.75.75 0 0 1-.75-.75v-.6a.75.75 0 0 1 .75-.75h.65a.75.75 0 0 1 .75.75v.6Zm4.85-4.5L11 16.2a.75.75 0 0 1-.67.42h-.08a.75.75 0 0 1-.67-1.08l2.25-4.5a.75.75 0 0 1 .67-.42h.08a.75.75 0 0 1 .67 1.08Zm4.35 4.5a.75.75 0 0 1-.75.75h-.65a.75.75 0 0 1-.75-.75v-.6a.75.75 0 0 1 .75-.75h.65a.75.75 0 0 1 .75.75v.6Z" />
              </svg>
              Claude Code
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          APP MOCKUP
          ═══════════════════════════════════════════ */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{c.mockup.title}</h2>
            <p className="text-sm md:text-base text-[var(--color-text-secondary)] max-w-lg mx-auto">
              {c.mockup.subtitle}
            </p>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto max-w-4xl">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="h-6 rounded-md bg-[var(--color-bg-primary)] flex items-center justify-center text-[10px] text-[var(--color-text-tertiary)]">
                    gastify.app/dashboard
                  </div>
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance card */}
                <div className="md:col-span-1 space-y-4">
                  <div className="text-sm text-[var(--color-text-secondary)]">{c.mockup.balance}</div>
                  <div className="text-4xl font-extrabold">$7,066<span className="text-lg text-[var(--color-text-tertiary)]">.00</span></div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-[var(--color-text-tertiary)]">{c.mockup.income}</span>
                      <div className="text-[var(--color-income)] font-semibold">+$13,300</div>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-tertiary)]">{c.mockup.expense}</span>
                      <div className="text-[var(--color-expense)] font-semibold">-$6,234</div>
                    </div>
                  </div>
                </div>

                {/* Chart bars */}
                <div className="md:col-span-2">
                  <div className="text-sm text-[var(--color-text-secondary)] mb-4">{c.mockup.categories}</div>
                  <div className="flex items-end gap-3 h-32">
                    {[85, 72, 55, 45, 38, 20, 15, 10].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-lg transition-all duration-700"
                          style={{
                            height: `${h}%`,
                            backgroundColor:
                              i === 0
                                ? "var(--color-accent)"
                                : `color-mix(in srgb, var(--color-accent) ${70 - i * 8}%, var(--color-bg-secondary))`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction rows */}
                <div className="md:col-span-3 space-y-3">
                  {[
                    { emoji: "🍔", name: lang === "es" ? "Comida" : "Food", desc: lang === "es" ? "Tacos y refrescos" : "Lunch", amount: "-$185", color: "var(--color-expense)" },
                    { emoji: "💼", name: lang === "es" ? "Salario" : "Salary", desc: lang === "es" ? "Salario quincenal" : "Bi-weekly salary", amount: "+$8,500", color: "var(--color-income)" },
                    { emoji: "🚗", name: lang === "es" ? "Transporte" : "Transport", desc: "Uber", amount: "-$45", color: "var(--color-expense)" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]/50"
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[var(--color-text-tertiary)]">{item.name}</div>
                        <div className="text-sm font-medium truncate">{item.desc}</div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: item.color }}>
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════ */}
      <section id="features" className="px-6 pb-24 md:pb-32 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent)]/10 mb-4">
              {c.features.label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {c.features.title}{" "}
              <span className="text-[var(--color-text-secondary)]">{c.features.titleAccent}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.features.items.map((f, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/20 transition-colors">
                  {icons[f.icon]}
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════ */}
      <section id="pricing" className="px-6 pb-24 md:pb-32 scroll-mt-20">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent)]/10 mb-4">
              {c.pricing.label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{c.pricing.title}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{c.pricing.subtitle}</p>
          </div>

          <div className="relative rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-bg-card)] p-8 shadow-xl shadow-[var(--color-accent)]/10">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--color-accent)] text-white text-xs font-semibold">
              {lang === "es" ? "Recomendado" : "Recommended"}
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mb-4 text-center">{c.pricing.plan}</p>
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-5xl font-extrabold">$45</span>
              <span className="text-lg text-[var(--color-text-secondary)]">{c.pricing.currency}</span>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-8 text-center">{c.pricing.period}</p>

            <ul className="space-y-3 mb-8">
              {c.pricing.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                  <svg className="w-5 h-5 text-[var(--color-income)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block w-full py-4 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold text-center transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[var(--color-accent)]/20"
            >
              {c.pricing.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════ */}
      <section id="faq" className="px-6 pb-24 md:pb-32 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent)]/10 mb-4">
              {c.faq.label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">{c.faq.title}</h2>
          </div>

          <div className="space-y-3">
            {c.faq.items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-[var(--color-bg-secondary)]/50 transition-colors"
                >
                  {item.q}
                  <svg
                    className={`w-4 h-4 shrink-0 ml-4 text-[var(--color-text-tertiary)] transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{
                    maxHeight: openFaq === i ? "200px" : "0px",
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <p className="px-5 pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════ */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-10 md:p-16 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[var(--color-accent)] opacity-[0.04] blur-[80px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">{c.finalCta.title}</h2>
              <p className="text-sm md:text-base text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
                {c.finalCta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[var(--color-accent)]/20"
                >
                  {c.finalCta.cta}
                </Link>
                <button
                  onClick={enterDemo}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-semibold transition-all hover:border-[var(--color-accent)] active:scale-[0.98]"
                >
                  {c.finalCta.demo}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="border-t border-[var(--color-border)] px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <span className="text-xl font-extrabold text-[var(--color-accent)]">Gastify</span>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)] max-w-xs">
                {c.footer.tagline}
              </p>
            </div>

            {/* Product links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
                {c.footer.product}
              </p>
              <ul className="space-y-2.5 text-sm text-[var(--color-text-secondary)]">
                <li><a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">{c.footer.links.features}</a></li>
                <li><a href="#pricing" className="hover:text-[var(--color-text-primary)] transition-colors">{c.footer.links.pricing}</a></li>
                <li><button onClick={enterDemo} className="hover:text-[var(--color-text-primary)] transition-colors">{c.footer.links.demo}</button></li>
                <li><Link href="/login" className="hover:text-[var(--color-text-primary)] transition-colors">{c.footer.links.login}</Link></li>
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
                {c.footer.legal}
              </p>
              <ul className="space-y-2.5 text-sm text-[var(--color-text-secondary)]">
                <li><a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">{c.footer.legalLinks.privacy}</a></li>
                <li><a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">{c.footer.legalLinks.terms}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              &copy; {new Date().getFullYear()} Gastify. {c.footer.rights}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLang}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {lang === "es" ? "English" : "Español"}
              </button>
              <button
                onClick={toggleTheme}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {resolved === "dark"
                  ? lang === "es" ? "Modo claro" : "Light mode"
                  : lang === "es" ? "Modo oscuro" : "Dark mode"}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
