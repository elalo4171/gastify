"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error";

const ToastContext = createContext<{
  show: (message: string, type?: ToastType) => void;
}>({ show: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const show = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <ToastContext value={{ show }}>
      {children}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-toast">
          <div
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg"
            style={{
              backgroundColor: toast.type === "error"
                ? "var(--color-expense)"
                : "var(--color-income)",
            }}
          >
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext>
  );
}
