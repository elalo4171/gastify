"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import NuevoRegistro from "@/components/NuevoRegistro";
import Onboarding from "@/components/Onboarding";

export function ClientLayout({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/landing";

  useEffect(() => {
    setMounted(true);
    const done = localStorage.getItem("gastify_onboarding_done");
    if (!done && !isLanding) setShowOnboarding(true);

    // One-time cleanup: unregister old service workers and clear caches
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) =>
        regs.forEach((r) => r.unregister())
      );
    }
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }, [isLanding]);

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
    window.dispatchEvent(new CustomEvent("registro-saved"));
  };

  if (isLanding) {
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
              setRefreshKey((k) => k + 1);
            }}
          />
        )}
        <main className="app-container" key={refreshKey}>
          {children}
        </main>
        <Navbar onFabClick={() => setModalOpen(true)} />
        <NuevoRegistro
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}
