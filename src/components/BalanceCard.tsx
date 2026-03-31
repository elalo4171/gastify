"use client";

import { formatMonto, getMonedaFromStorage } from "@/lib/utils";
import { useEffect, useState } from "react";

interface BalanceCardProps {
  balance: number;
  entradas: number;
  salidas: number;
  loading: boolean;
}

export default function BalanceCard({ balance, entradas, salidas, loading }: BalanceCardProps) {
  const [simbolo, setSimbolo] = useState("$");

  useEffect(() => {
    setSimbolo(getMonedaFromStorage().simbolo);
    const handler = () => setSimbolo(getMonedaFromStorage().simbolo);
    window.addEventListener("storage", handler);
    window.addEventListener("moneda-changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("moneda-changed", handler);
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-12" />
        <div className="h-20 bg-[var(--color-bg-secondary)] rounded w-56" />
        <div className="h-9 bg-[var(--color-bg-secondary)] rounded-full w-52" />
      </div>
    );
  }

  const absBalance = Math.abs(balance);
  const intPart = Math.floor(absBalance).toLocaleString("es-MX");
  const decPart = (absBalance % 1).toFixed(2).slice(1);

  return (
    <div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total</p>
      <div className="flex items-baseline">
        {balance < 0 && (
          <span className="w-6 h-6 rounded-full bg-[var(--color-expense)] flex items-center justify-center text-white text-xs font-bold mr-1 mb-2 self-center">
            &minus;
          </span>
        )}
        <span className="text-[72px] leading-none font-extrabold tracking-tighter text-[var(--color-text-primary)]">
          {intPart}
        </span>
        <span className="text-2xl font-semibold text-[var(--color-text-tertiary)] ml-0.5">
          {decPart}{simbolo}
        </span>
      </div>

      {/* Income/Expense pill */}
      <div className="flex items-center mt-3 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden w-fit">
        <span className="px-4 py-2 text-sm text-[var(--color-text-primary)] font-medium">
          &minus; {formatMonto(salidas, simbolo)}
        </span>
        <span className="px-4 py-2 text-sm text-[var(--color-text-secondary)] font-medium">
          + {formatMonto(entradas, simbolo)}
        </span>
      </div>

      {/* Period pill */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-card)] px-3 py-1.5 rounded-full">
          este mes
        </span>
      </div>
    </div>
  );
}
