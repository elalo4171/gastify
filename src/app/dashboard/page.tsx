"use client";

import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import { useRegistros, useBalanceMes, useCategorias, useAllCategorias, useYears, crearRegistro, actualizarCategoria, eliminarCategoria, crearCategoria, eliminarRegistro } from "@/lib/hooks";
import BalanceCard from "@/components/BalanceCard";
import RegistroItem from "@/components/RegistroItem";
import { formatMonto, formatFechaGrupo, getMonedaFromStorage, setMonedaToStorage, generarCSV, descargarCSV, getChartColor } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MONEDAS } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/Toast";
import { useDemo } from "@/lib/demo-context";
import { demoStore } from "@/lib/demo-store";
import ConfirmDialog from "@/components/ConfirmDialog";
import OverlayPanel from "@/components/OverlayPanel";
import Link from "next/link";

export default function Dashboard() {
  const { registros, loading: loadingRegistros, refetch: refetchRegistros } = useRegistros(10);
  const { categorias } = useCategorias();
  const { years: availableYears, refetch: refetchYears } = useYears();
  const { theme, setTheme } = useTheme();
  const { isDemo } = useDemo();
  const [mounted, setMounted] = useState(false);
  const [simbolo, setSimbolo] = useState("$");
  const [showSettings, setShowSettings] = useState(false);
  const [moneda, setMoneda] = useState({ codigo: "MXN", simbolo: "$" });
  const [winHeight, setWinHeight] = useState(800);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { entradas, salidas, balance, loading: loadingBalance, refetch: refetchBalance } = useBalanceMes(selectedMonth.getMonth(), selectedMonth.getFullYear());
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteFinal, setConfirmDeleteFinal] = useState(false);
  const [quickTipo, setQuickTipo] = useState<"salida" | "entrada">("salida");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickMonto, setQuickMonto] = useState("");
  const [quickCatId, setQuickCatId] = useState<string | null>(null);
  const [quickSaving, setQuickSaving] = useState(false);
  const [showCatsModal, setShowCatsModal] = useState(false);
  const [showMovsModal, setShowMovsModal] = useState(false);
  const { show } = useToast();

  const handleRefresh = useCallback(() => {
    refetchRegistros();
    refetchBalance();
    refetchYears();
  }, [refetchRegistros, refetchBalance, refetchYears]);

  // Keep a ref so the event listener always calls the latest version
  const handleRefreshRef = useRef(handleRefresh);
  handleRefreshRef.current = handleRefresh;

  useEffect(() => {
    setMounted(true);
    const m = getMonedaFromStorage();
    setSimbolo(m.simbolo);
    setMoneda(m);
    setWinHeight(window.innerHeight);
    const onResize = () => setWinHeight(window.innerHeight);
    const onSaved = () => handleRefreshRef.current();
    window.addEventListener("resize", onResize);
    window.addEventListener("registro-saved", onSaved);
    window.addEventListener("moneda-changed", () => setSimbolo(getMonedaFromStorage().simbolo));
    return () => {
      window.removeEventListener("registro-saved", onSaved);
      window.removeEventListener("resize", onResize);
    };
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

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
  const fullBarH = isDesktop ? winHeight * 0.45 : winHeight * 0.3;

  // --- Shared components ---

  const settingsIcon = (
    <Link href="/ajustes" className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    </Link>
  );

  const categoryBars = categorySpending.length > 0 && !loadingRegistros && (
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
  );

  const transactionList = (
    <>
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
    </>
  );

  return (
    <div className="dashboard-root animate-fade-in">
      {/* ═══ MOBILE LAYOUT (< 768px) ═══ */}
      <div className="md:hidden flex flex-col h-[100dvh] -mx-5">
        {/* Fixed balance */}
        <div className="shrink-0 px-5 pt-8 pb-2">
          <div className="flex justify-end mb-2">{settingsIcon}</div>
          <BalanceCard balance={balance} entradas={entradas} salidas={salidas} loading={loadingBalance} onMonthChange={setSelectedMonth} availableYears={availableYears} />
        </div>
        {/* Scrollable bars + list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5">
          <div className="pt-2 pb-4">{categoryBars}</div>
          <div className="pb-24">{transactionList}</div>
        </div>
      </div>

      {/* ═══ DESKTOP LAYOUT (>= 768px) ═══ */}
      <div className="hidden md:flex h-[100dvh] -mx-5">
        {/* LEFT SIDEBAR — fixed balance */}
        <aside className="w-80 lg:w-96 shrink-0 overflow-y-auto p-8 border-r border-[var(--color-border)]">
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">Gastify</span>
            </div>
            <BalanceCard balance={balance} entradas={entradas} salidas={salidas} loading={loadingBalance} onMonthChange={setSelectedMonth} availableYears={availableYears} />

            {/* Quick add form */}
            <div className="mt-8 mb-4">
              <div className="flex gap-1.5 mb-3">
                {(["salida", "entrada"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuickTipo(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      quickTipo === t
                        ? t === "entrada" ? "bg-[var(--color-income)] text-white" : "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {t === "entrada" ? "Entrada" : "Salida"}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Descripción"
                value={quickDesc}
                onChange={(e) => setQuickDesc(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] mb-2"
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder={`Monto (${simbolo})`}
                value={quickMonto}
                onChange={(e) => setQuickMonto(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full py-2 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] mb-2"
              />
              <div className="flex gap-1.5 flex-wrap mb-3">
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setQuickCatId(quickCatId === cat.id ? null : cat.id)}
                    className={`px-2 py-1 rounded-lg text-xs transition-all ${
                      quickCatId === cat.id
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {cat.emoji} {cat.nombre}
                  </button>
                ))}
              </div>
              <button
                onClick={async () => {
                  const monto = parseFloat(quickMonto);
                  if (!monto || !quickDesc.trim() || !quickCatId) return;
                  setQuickSaving(true);
                  await crearRegistro({
                    tipo: quickTipo,
                    monto,
                    descripcion: quickDesc.trim(),
                    categoria_id: quickCatId,
                    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
                  }, isDemo);
                  setQuickSaving(false);
                  setQuickDesc("");
                  setQuickMonto("");
                  setQuickCatId(null);
                  show("Registro guardado");
                  handleRefresh();
                  window.dispatchEvent(new CustomEvent("registro-saved"));
                }}
                disabled={quickSaving || !quickMonto || !quickDesc.trim() || !quickCatId}
                className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all disabled:opacity-30 active:scale-[0.98]"
              >
                {quickSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4" />

            {/* Settings toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-3 mt-6 py-3 px-1 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors w-full text-left"
            >
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </span>
              <span className="text-sm font-medium flex-1">Ajustes</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">{showSettings ? "▼" : "›"}</span>
            </button>

            {/* Inline settings panel */}
            {showSettings && (
              <div className="mt-2 space-y-4 animate-fade-in">
                {/* Currency */}
                <div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Moneda</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MONEDAS.map((m) => (
                      <button
                        key={m.codigo}
                        onClick={() => {
                          setMonedaToStorage(m.codigo, m.simbolo);
                          setMoneda({ codigo: m.codigo, simbolo: m.simbolo });
                          setSimbolo(m.simbolo);
                          window.dispatchEvent(new CustomEvent("moneda-changed"));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          moneda.codigo === m.codigo
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {m.simbolo} {m.codigo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Tema</p>
                  <div className="flex gap-1.5">
                    {([["light", "Claro"], ["dark", "Oscuro"], ["system", "Auto"]] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setTheme(val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          theme === val
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-1">
                  <button onClick={() => setShowCatsModal(true)} className="flex items-center gap-2 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors w-full text-left">
                    <span>🏷️</span> Categorías
                  </button>
                  <button onClick={() => setShowMovsModal(true)} className="flex items-center gap-2 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors w-full text-left">
                    <span>📋</span> Movimientos
                  </button>
                </div>

                {/* Export */}
                <button
                  onClick={async () => {
                    let data;
                    if (isDemo) {
                      data = demoStore.getExportData();
                    } else {
                      const res = await fetch("/api/exportar");
                      data = await res.json();
                    }
                    if (data.length === 0) { show("No hay datos", "error"); return; }
                    descargarCSV(generarCSV(data), `gastify-${new Date().toISOString().slice(0, 10)}.csv`);
                    show("CSV descargado");
                  }}
                  className="flex items-center gap-2 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors w-full text-left"
                >
                  <span>📤</span> Exportar datos
                </button>

                {/* Delete all */}
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  className="flex items-center gap-2 py-2 text-sm text-[var(--color-expense)] hover:opacity-80 transition-colors w-full text-left"
                >
                  <span>🗑️</span> Eliminar todo
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN — bars + transactions */}
        <main className="flex-1 min-w-0 overflow-y-auto p-8">
          {/* Category bars */}
          <div className="mb-8">{categoryBars}</div>
          {/* Transactions */}
          <div className="max-w-2xl">{transactionList}</div>
        </main>
      </div>
      {/* Categories modal */}
      <CategoriesModal open={showCatsModal} onClose={() => setShowCatsModal(false)} />

      {/* Movimientos modal */}
      <MovimientosModal open={showMovsModal} onClose={() => setShowMovsModal(false)} onRefresh={handleRefresh} />

      <ConfirmDialog
        open={confirmDeleteAll}
        title="¿Estás seguro?"
        message="Se eliminarán todos los registros. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar todo"
        destructive
        onConfirm={() => { setConfirmDeleteAll(false); setConfirmDeleteFinal(true); }}
        onCancel={() => setConfirmDeleteAll(false)}
      />
      <ConfirmDialog
        open={confirmDeleteFinal}
        title="Última confirmación"
        message="¿Realmente deseas eliminar TODOS los registros?"
        confirmLabel="Eliminar definitivamente"
        destructive
        onConfirm={async () => {
          if (isDemo) { demoStore.deleteAllRegistros(); } else { await fetch("/api/registros/delete-all", { method: "DELETE" }); }
          setConfirmDeleteFinal(false);
          show("Todos los registros eliminados");
          handleRefresh();
          window.dispatchEvent(new CustomEvent("registro-saved"));
        }}
        onCancel={() => setConfirmDeleteFinal(false)}
      />
    </div>
  );
}

// ─── Categories Modal ──────────────────────────────
function CategoriesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categorias, loading, refetch } = useAllCategorias();
  const { show } = useToast();
  const { isDemo } = useDemo();
  const [adding, setAdding] = useState(false);
  const [newEmoji, setNewEmoji] = useState("");
  const [newName, setNewName] = useState("");

  return (
    <OverlayPanel open={open} onClose={onClose} title="Categorías">
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-[var(--color-bg-secondary)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {categorias.map((cat, i) => (
            <div key={cat.id} className="flex flex-col items-center">
              <button
                onClick={async () => {
                  await actualizarCategoria(cat.id, { visible: !cat.visible }, isDemo);
                  refetch();
                }}
                className={`aspect-square w-full rounded-2xl flex items-center justify-center text-3xl transition-all active:scale-95 ${
                  cat.visible ? "" : "opacity-30"
                }`}
                style={{ backgroundColor: `${getChartColor(i)}33` }}
              >
                {cat.emoji}
              </button>
              <span className={`text-xs font-medium mt-1.5 ${cat.visible ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"}`}>
                {cat.nombre}
              </span>
            </div>
          ))}

          {adding ? (
            <div className="flex flex-col items-center">
              <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-1.5 p-2">
                <input type="text" placeholder="😀" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} maxLength={2} autoFocus
                  className="w-10 h-10 text-center text-xl rounded-xl bg-[var(--color-bg-elevated)] outline-none" />
                <input type="text" placeholder="Nombre" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-7 px-1.5 text-center text-[11px] rounded-lg bg-[var(--color-bg-elevated)] outline-none placeholder:text-[var(--color-text-tertiary)]" />
              </div>
              <div className="flex gap-2 mt-1.5">
                <button onClick={() => { setAdding(false); setNewEmoji(""); setNewName(""); }} className="text-[11px] text-[var(--color-text-secondary)]">Cancelar</button>
                <button
                  onClick={async () => {
                    if (!newEmoji.trim() || !newName.trim()) return;
                    await crearCategoria({ nombre: newName.trim(), emoji: newEmoji.trim() }, isDemo);
                    setNewEmoji(""); setNewName(""); setAdding(false); refetch(); show("Categoría creada");
                  }}
                  className="text-[11px] text-[var(--color-accent)] font-semibold"
                >Guardar</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button onClick={() => setAdding(true)} className="aspect-square w-full rounded-2xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-2xl text-[var(--color-text-secondary)] active:scale-95">+</button>
              <span className="text-xs font-medium mt-1.5 text-[var(--color-text-secondary)]">Agregar</span>
            </div>
          )}
        </div>
      )}
      <p className="text-[11px] text-[var(--color-text-tertiary)] text-center mt-4">Toca para ocultar/mostrar</p>
    </OverlayPanel>
  );
}

// ─── Movimientos Modal ─────────────────────────────
function MovimientosModal({ open, onClose, onRefresh }: { open: boolean; onClose: () => void; onRefresh: () => void }) {
  const { registros, loading, refetch } = useRegistros();
  const { categorias } = useCategorias();
  const { show } = useToast();
  const { isDemo } = useDemo();
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "entrada" | "salida">("todos");
  const [mesOffset, setMesOffset] = useState(0); // 0 = este mes, -1 = anterior, etc.
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + mesOffset);
    return d;
  }, [mesOffset]);

  const monthLabel = useMemo(() => {
    if (mesOffset === 0) return "Este mes";
    return format(selectedDate, "MMMM yyyy", { locale: es });
  }, [mesOffset, selectedDate]);

  const filtered = useMemo(() => {
    const mesInicio = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const mesFin = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    return registros.filter((r) => {
      const fecha = new Date(r.fecha);
      if (fecha < mesInicio || fecha > mesFin) return false;
      if (filtroTipo !== "todos" && r.tipo !== filtroTipo) return false;
      if (search && !r.descripcion.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [registros, filtroTipo, search, selectedDate]);

  const months = Array.from({ length: 12 }, (_, i) => -i);

  return (
    <OverlayPanel open={open} onClose={onClose} title="Movimientos">
      {/* Month picker */}
      <div className="relative mb-3">
        <button
          onClick={() => setShowMonthPicker(!showMonthPicker)}
          className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-full flex items-center gap-1 capitalize"
        >
          {monthLabel}
          <span className="text-[10px]">▾</span>
        </button>
        {showMonthPicker && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMonthPicker(false)} />
            <div className="absolute left-0 top-full mt-1 z-20 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-2 shadow-lg animate-scale-in w-48">
              {months.map((offset) => {
                const d = new Date();
                d.setMonth(d.getMonth() + offset);
                const label = offset === 0 ? "Este mes" : format(d, "MMM yyyy", { locale: es });
                return (
                  <button
                    key={offset}
                    onClick={() => { setMesOffset(offset); setShowMonthPicker(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                      mesOffset === offset ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        {(["todos", "salida", "entrada"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filtroTipo === t ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
            }`}
          >
            {t === "todos" ? "Todos" : t === "entrada" ? "Entradas" : "Salidas"}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full py-2 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] mb-4"
      />

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-[var(--color-bg-secondary)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Sin movimientos</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((r) => (
            <RegistroItem
              key={r.id}
              registro={r}
              onClick={() => {
                if (confirm(`¿Eliminar "${r.descripcion}"?`)) {
                  eliminarRegistro(r.id, isDemo).then(() => {
                    refetch();
                    onRefresh();
                    show("Registro eliminado");
                    window.dispatchEvent(new CustomEvent("registro-saved"));
                  });
                }
              }}
            />
          ))}
        </div>
      )}
    </OverlayPanel>
  );
}
