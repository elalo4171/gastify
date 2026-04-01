import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gastify — Tus finanzas personales, simples y claras",
  description:
    "Registra gastos e ingresos en segundos. Categorías personalizadas, estadísticas visuales, registro por voz, modo oscuro y multi-moneda. Solo $45 MXN/mes.",
  keywords: [
    "finanzas personales",
    "control de gastos",
    "registro de ingresos",
    "presupuesto",
    "app de gastos",
    "personal finance",
    "expense tracker",
    "Gastify",
  ],
  authors: [{ name: "Gastify" }],
  creator: "Gastify",
  openGraph: {
    type: "website",
    locale: "es_MX",
    alternateLocale: "en_US",
    url: "https://gastify.app",
    siteName: "Gastify",
    title: "Gastify — Tus finanzas personales, simples y claras",
    description:
      "Registra gastos e ingresos en segundos. Categorías, estadísticas, voz y más.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gastify - App de finanzas personales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gastify — Finanzas personales, simples y claras",
    description:
      "Registra gastos e ingresos en segundos. Categorías, estadísticas, voz y más.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://gastify.app/landing",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
