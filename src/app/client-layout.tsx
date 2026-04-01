"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import NuevoRegistro from "@/components/NuevoRegistro";
import VoiceModal from "@/components/VoiceModal";
import Onboarding from "@/components/Onboarding";

export function ClientLayout({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/landing";
  const isLogin = pathname === "/login";
  const isSuscripcion = pathname === "/suscripcion";

  useEffect(() => {
    setMounted(true);
    const done = localStorage.getItem("gastify_onboarding_done");
    if (!done && !isLanding && !isLogin && !isSuscripcion) setShowOnboarding(true);

    // One-time cleanup: unregister old service workers and clear caches
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) =>
        regs.forEach((r) => r.unregister())
      );
    }
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }, [isLanding]);

  const handleSaved = () => {
    window.dispatchEvent(new CustomEvent("registro-saved"));
  };

  if (isLanding || isLogin || isSuscripcion) {
    return (
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        {mounted && showOnboarding && (
          <Onboarding
            onComplete={() => {
              setShowOnboarding(false);
              window.dispatchEvent(new CustomEvent("registro-saved"));
            }}
          />
        )}
        <main className="app-container">
          {children}
        </main>
        <Navbar onFabClick={() => setModalOpen(true)} onVoiceClick={() => setVoiceOpen(true)} />
        <NuevoRegistro
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
        <VoiceModal
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          onSaved={handleSaved}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}
