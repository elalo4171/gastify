"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAllCategorias } from "@/lib/hooks";
import { MONEDAS } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getMonedaFromStorage, setMonedaToStorage, generarCSV, descargarCSV } from "@/lib/utils";

function SettingsItem({
  icon, label, sub, onClick, right, destructive,
}: {
  icon: string; label: string; sub?: string;
  onClick?: () => void; right?: React.ReactNode; destructive?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className="w-full flex items-center gap-4 py-3.5 px-1 text-left transition-colors hover:bg-[var(--color-bg-secondary)] rounded-xl -mx-1"
    >
      <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-lg shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${destructive ? "text-[var(--color-expense)]" : "text-[var(--color-text-primary)]"}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-[var(--color-text-secondary)] truncate">{sub}</p>}
      </div>
      {right || <span className="text-[var(--color-text-tertiary)] text-sm">›</span>}
    </Tag>
  );
}

export default function AjustesPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { categorias, refetch } = useAllCategorias();
  const { show } = useToast();
  const [moneda, setMoneda] = useState(getMonedaFromStorage());
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteAllFinal, setConfirmDeleteAllFinal] = useState(false);

  useEffect(() => {
    setMoneda(getMonedaFromStorage());
  }, []);

  const handleMonedaChange = (codigo: string) => {
    const m = MONEDAS.find((m) => m.codigo === codigo);
    if (!m) return;
    setMonedaToStorage(m.codigo, m.simbolo);
    setMoneda({ codigo: m.codigo, simbolo: m.simbolo });
    window.dispatchEvent(new CustomEvent("moneda-changed"));
    show(`Moneda: ${m.nombre}`);
  };

  const handleExport = async () => {
    const res = await fetch("/api/exportar");
    const data = await res.json();
    if (data.length === 0) { show("No hay datos", "error"); return; }
    const csv = generarCSV(data);
    descargarCSV(csv, `gastify-${new Date().toISOString().slice(0, 10)}.csv`);
    show("CSV descargado");
  };

  const handleDeleteAll = async () => {
    await fetch("/api/registros/delete-all", { method: "DELETE" });
    setConfirmDeleteAllFinal(false);
    show("Todos los registros eliminados");
    window.dispatchEvent(new CustomEvent("registro-saved"));
  };

  const temaLabels = [
    { value: "light" as const, label: "Claro" },
    { value: "dark" as const, label: "Oscuro" },
    { value: "system" as const, label: "Auto" },
  ];

  return (
    <div className="pt-8 animate-fade-in max-w-lg mx-auto">
      {/* Header with close button */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] shrink-0"
        >
          ✕
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Ajustes</h1>
      </div>

      <div className="space-y-1">
        {/* Navigation */}
        <SettingsItem icon="📋" label="Movimientos" sub="Ver todos los gastos" onClick={() => router.push("/movimientos")} />

        <div className="h-3" />

        {/* Currency */}
        <SettingsItem
          icon="💱"
          label="Moneda"
          sub={`${moneda.simbolo} ${moneda.codigo}`}
          right={
            <div className="relative">
              <select
                value={moneda.codigo}
                onChange={(e) => handleMonedaChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              >
                {MONEDAS.map((m) => (
                  <option key={m.codigo} value={m.codigo}>{m.simbolo} {m.codigo} — {m.nombre}</option>
                ))}
              </select>
              <span className="text-sm text-[var(--color-text-secondary)]">{moneda.codigo} ›</span>
            </div>
          }
        />

        {/* Theme */}
        <SettingsItem
          icon="🎨"
          label="Tema"
          sub={theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Automático"}
          right={
            <div className="flex gap-1">
              {temaLabels.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    theme === t.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          }
        />

        {/* Categories */}
        <SettingsItem
          icon="🏷️"
          label="Categorías"
          sub={`${categorias.filter((c) => c.visible).length} activas`}
          onClick={() => router.push("/categorias")}
        />

        {/* Export */}
        <SettingsItem icon="📤" label="Exportar datos" sub="Descargar CSV" onClick={handleExport} />

        {/* Delete all */}
        <SettingsItem
          icon="🗑️"
          label="Eliminar todo"
          sub="Borrar todos los registros"
          destructive
          onClick={() => setConfirmDeleteAll(true)}
        />

        <div className="h-3" />

        {/* Logout */}
        <SettingsItem
          icon="🚪"
          label="Cerrar sesión"
          destructive
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
          }}
        />
      </div>

      {/* Version */}
      <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-12">Gastify v1.0.0</p>

      <ConfirmDialog
        open={confirmDeleteAll}
        title="¿Estás seguro?"
        message="Se eliminarán todos los registros. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar todo"
        destructive
        onConfirm={() => { setConfirmDeleteAll(false); setConfirmDeleteAllFinal(true); }}
        onCancel={() => setConfirmDeleteAll(false)}
      />
      <ConfirmDialog
        open={confirmDeleteAllFinal}
        title="Última confirmación"
        message="¿Realmente deseas eliminar TODOS los registros?"
        confirmLabel="Eliminar definitivamente"
        destructive
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteAllFinal(false)}
      />
    </div>
  );
}
