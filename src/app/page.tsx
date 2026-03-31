"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useRegistros, useBalanceMes, useCategorias } from "@/lib/hooks";
import BalanceCard from "@/components/BalanceCard";
import RegistroItem from "@/components/RegistroItem";
import { formatMonto, formatFechaGrupo, getMonedaFromStorage } from "@/lib/utils";
import Link from "next/link";

export default function Dashboard() {
  const { registros, loading: loadingRegistros, refetch: refetchRegistros } = useRegistros(10);
  const { entradas, salidas, balance, loading: loadingBalance, refetch: refetchBalance } = useBalanceMes();
  const { categorias } = useCategorias();
  const [mounted, setMounted] = useState(false);
  const [simbolo, setSimbolo] = useState("$");

  const handleRefresh = useCallback(() => {
    refetchRegistros();
    refetchBalance();
  }, [refetchRegistros, refetchBalance]);

  useEffect(() => {
    setMounted(true);
    setSimbolo(getMonedaFromStorage().simbolo);
    window.addEventListener("registro-saved", handleRefresh);
    window.addEventListener("moneda-changed", () => setSimbolo(getMonedaFromStorage().simbolo));
    return () => { window.removeEventListener("registro-saved", handleRefresh); };
  }, [handleRefresh]);

  const categorySpending = useMemo(() => {
    const map = new Map<string, { emoji: string; nombre: string; total: number }>();
    for (const r of registros) {
      if (r.tipo !== "salida" || !r.categoria_id) continue;
      const existing = map.get(r.categoria_id);
      if (existing) existing.total += Number(r.monto);
      else map.set(r.categoria_id, { emoji: r.categoria?.emoji || "💸", nombre: r.categoria?.nombre || "Otro", total: Number(r.monto) });
    }
    for (const cat of categorias) {
      if (!map.has(cat.id)) map.set(cat.id, { emoji: cat.emoji, nombre: cat.nombre, total: 0 });
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [registros, categorias]);

  const maxSpending = Math.max(...categorySpending.map((c) => c.total), 1);

  const groupedRegistros = useMemo(() => {
    const groups: { label: string; total: number; items: typeof registros }[] = [];
    const map = new Map<string, { total: number; items: typeof registros }>();
    for (const r of registros) {
      const amount = r.tipo === "salida" ? -Number(r.monto) : Number(r.monto);
      const existing = map.get(r.fecha);
      if (existing) { existing.items.push(r); existing.total += amount; }
      else map.set(r.fecha, { items: [r], total: amount });
    }
    for (const [dateKey, data] of map) {
      groups.push({ label: formatFechaGrupo(dateKey), total: data.total, items: data.items });
    }
    return groups;
  }, [registros]);

  const categoryColorMap = useMemo(() => {
    const map = new Map<string, number>();
    categorias.forEach((cat, i) => map.set(cat.nombre, i));
    return map;
  }, [categorias]);

  const formatShort = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
    return String(Math.round(n));
  };

  if (!mounted) return null;

  const fullBarH = window.innerHeight * 0.3;

  return (
    <div className="dashboard-root flex flex-col h-[100dvh] -mx-5 animate-fade-in">
      {/* FIXED — balance */}
      <div className="shrink-0 px-5 pt-8 pb-2">
        <div className="flex justify-end mb-2">
          <Link href="/ajustes" className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </Link>
        </div>
        <BalanceCard balance={balance} entradas={entradas} salidas={salidas} loading={loadingBalance} />
      </div>

      {/* SINGLE SCROLL — bars + list in same flow */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5">
        {/* Bars — normal flow, scroll up naturally */}
        {categorySpending.length > 0 && !loadingRegistros && (
          <div className="pt-2 pb-4">
            <div className="flex gap-3 overflow-x-auto no-scrollbar items-end">
              {categorySpending.map((cat) => {
                const ratio = cat.total > 0 ? cat.total / maxSpending : 0;
                const barH = ratio > 0 ? Math.max(ratio * fullBarH, 80) : 48;

                if (cat.total === 0) {
                  return (
                    <div key={cat.nombre} className="shrink-0 bg-[var(--color-bg-secondary)] rounded-2xl flex items-center gap-2 px-4 py-3">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-sm font-semibold text-[var(--color-text-secondary)] tabular-nums">0</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.nombre}
                    className="shrink-0 bg-[var(--color-bg-secondary)] rounded-2xl flex flex-col items-center justify-end"
                    style={{ width: 90, height: barH }}
                  >
                    <span className="text-xl mb-0.5">{cat.emoji}</span>
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] tabular-nums pb-3">
                      {formatShort(cat.total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transactions — same scroll flow */}
        <div className="pb-24">
          {loadingRegistros ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--color-bg-secondary)] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">💸</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Sin movimientos aún</p>
              <p className="text-[var(--color-text-tertiary)] text-xs mt-1">
                Presiona <span className="text-[var(--color-accent)] font-bold">+</span> para empezar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedRegistros.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--color-text-secondary)] capitalize">{group.label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${group.total < 0 ? "text-[var(--color-text-secondary)]" : "text-[var(--color-income)]"}`}>
                      {group.total < 0 ? "-" : "+"}{formatMonto(Math.abs(group.total), simbolo)}
                    </span>
                  </div>
                  {group.items.map((r) => (
                    <RegistroItem key={r.id} registro={r} colorIndex={categoryColorMap.get(r.categoria?.nombre || "") ?? 0} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
