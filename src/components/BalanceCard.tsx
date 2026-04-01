"use client";

import { formatMonto, getMonedaFromStorage } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDemo } from "@/lib/demo-context";
import { demoStore } from "@/lib/demo-store";

interface BalanceCardProps {
  balance: number;
  entradas: number;
  salidas: number;
  loading: boolean;
  onMonthChange?: (month: Date) => void;
  availableYears?: number[];
}

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function BalanceCard({ balance, entradas, salidas, loading, onMonthChange, availableYears = [] }: BalanceCardProps) {
  const { isDemo } = useDemo();
  const [simbolo, setSimbolo] = useState("$");
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState<Record<number, number>>({});

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

  const fetchMonthlySummary = useCallback(async (year: number) => {
    if (isDemo) {
      setMonthlySummary(demoStore.getMonthlySummary(year));
      return;
    }
    const res = await fetch(`/api/registros/monthly-summary?year=${year}`);
    if (res.ok) setMonthlySummary(await res.json());
  }, [isDemo]);

  // Fetch summary when picker year changes
  useEffect(() => {
    if (showPicker) fetchMonthlySummary(pickerYear);
  }, [showPicker, pickerYear, fetchMonthlySummary]);

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth.getMonth() === now.getMonth() && selectedMonth.getFullYear() === now.getFullYear();
  };

  const handleOpenPicker = () => {
    setPickerYear(selectedMonth.getFullYear());
    setPickerMonth(selectedMonth.getMonth());
    setShowYearSelector(false);
    setShowPicker(true);
  };

  const handleApply = () => {
    const newDate = new Date(pickerYear, pickerMonth, 1);
    setSelectedMonth(newDate);
    setShowPicker(false);
    onMonthChange?.(newDate);
  };

  const currentYear = new Date().getFullYear();
  const yearsToShow = availableYears.length > 0
    ? [...new Set([...availableYears, currentYear])].sort((a, b) => b - a)
    : [currentYear];

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

  const periodLabel = isCurrentMonth()
    ? "este mes"
    : format(selectedMonth, "MMMM yyyy", { locale: es });

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

      {/* Period pill — clickable */}
      <div className="relative mt-3">
        <button
          onClick={handleOpenPicker}
          className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-card)] px-3 py-1.5 rounded-full flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors capitalize"
        >
          {periodLabel}
          <span className="text-[10px]">▾</span>
        </button>
      </div>

      {/* ── Month picker bottom-sheet ── */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end animate-overlay">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowPicker(false)} />

          <div className="relative bg-[var(--color-bg-card)] rounded-t-3xl animate-slide-up pb-[env(safe-area-inset-bottom,0px)]">
            <div className="px-6 pt-6 pb-5">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Mes</h3>

              {/* Year pill */}
              <div className="flex gap-2 mb-5 relative">
                <button
                  onClick={() => setShowYearSelector(!showYearSelector)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                >
                  {pickerYear}
                  <span className="text-[10px] ml-1">▾</span>
                </button>

                {showYearSelector && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowYearSelector(false)} />
                    <div className="absolute left-0 top-full mt-1 z-20 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-1.5 shadow-lg animate-scale-in min-w-[120px]">
                      {yearsToShow.map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setPickerYear(y);
                            setShowYearSelector(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            pickerYear === y
                              ? "bg-[var(--color-accent)] text-white"
                              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Month grid 3x4 */}
              <div className="grid grid-cols-3 gap-2">
                {MONTH_LABELS.map((label, i) => {
                  const selected = i === pickerMonth;
                  const monthBalance = monthlySummary[i];
                  const hasData = monthBalance !== undefined;
                  return (
                    <button
                      key={i}
                      onClick={() => setPickerMonth(i)}
                      className={`py-4 rounded-2xl text-center transition-all ${
                        selected
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                      }`}
                    >
                      <span className={`text-base font-semibold ${selected ? "text-white" : ""}`}>
                        {label}
                      </span>
                      {hasData && (
                        <p className={`text-xs mt-0.5 ${selected ? "opacity-90" : "text-[var(--color-text-tertiary)]"}`}>
                          {monthBalance < 0 ? "-" : "+"}{formatMonto(Math.abs(monthBalance), simbolo)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply button */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={handleApply}
                className="mx-auto flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--color-accent)] text-white font-semibold text-sm transition-all active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
