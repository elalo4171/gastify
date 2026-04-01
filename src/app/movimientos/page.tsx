"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRegistros, useCategorias, eliminarRegistro, actualizarRegistro } from "@/lib/hooks";
import type { Registro, FiltroTipo } from "@/lib/types";
import RegistroItem from "@/components/RegistroItem";
import NuevoRegistro from "@/components/NuevoRegistro";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { formatFechaGrupo, formatMonto, getMonedaFromStorage } from "@/lib/utils";

export default function MovimientosPage() {
  const { registros, loading, refetch } = useRegistros();
  const { categorias } = useCategorias();
  const { show } = useToast();
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [editando, setEditando] = useState<Registro | null>(null);
  const [eliminando, setEliminando] = useState<Registro | null>(null);
  const [simbolo, setSimbolo] = useState("$");

  useEffect(() => {
    setSimbolo(getMonedaFromStorage().simbolo);
    window.addEventListener("registro-saved", refetch);
    return () => window.removeEventListener("registro-saved", refetch);
  }, [refetch]);

  const filtered = useMemo(() => {
    return registros.filter((r) => {
      if (filtroTipo !== "todos" && r.tipo !== filtroTipo) return false;
      if (catFilter && r.categoria_id !== catFilter) return false;
      if (search && !r.descripcion.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [registros, filtroTipo, catFilter, search]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: Registro[] }[] = [];
    const map = new Map<string, Registro[]>();
    for (const r of filtered) {
      const existing = map.get(r.fecha);
      if (existing) existing.push(r);
      else map.set(r.fecha, [r]);
    }
    for (const [dateKey, items] of map) {
      groups.push({ label: formatFechaGrupo(dateKey), items });
    }
    return groups;
  }, [filtered]);

  const handleDelete = async () => {
    if (!eliminando) return;
    await eliminarRegistro(eliminando.id);
    show("Registro eliminado");
    setEliminando(null);
    refetch();
    window.dispatchEvent(new CustomEvent("registro-saved"));
  };

  const tipos: { label: string; value: FiltroTipo }[] = [
    { label: "Todos", value: "todos" },
    { label: "Entradas", value: "entrada" },
    { label: "Salidas", value: "salida" },
  ];

  return (
    <div className="pt-8 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] shrink-0"
        >
          ✕
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Movimientos</h1>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-4">
        {tipos.map((t) => (
          <button
            key={t.value}
            onClick={() => setFiltroTipo(t.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filtroTipo === t.value
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full py-3 px-4 rounded-xl bg-[var(--color-bg-secondary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] mb-4"
      />

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        <button
          onClick={() => setCatFilter("")}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
            !catFilter ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
          }`}
        >
          Todas
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCatFilter(cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
              catFilter === cat.id ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
            }`}
          >
            {cat.emoji} {cat.nombre}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-[var(--color-bg-secondary)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-[var(--color-text-secondary)] text-sm">No se encontraron movimientos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-secondary)] mb-1 capitalize">
                {group.label}
              </p>
              {group.items.map((r) => (
                <RegistroItem
                  key={r.id}
                  registro={r}
                  onClick={() => {
                    // Simple toggle: tap once to edit, long-press concept simplified
                    const action = confirm("¿Qué deseas hacer?\n\nOK = Editar\nCancelar = Eliminar");
                    if (action) setEditando(r);
                    else setEliminando(r);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <NuevoRegistro
        open={!!editando}
        onClose={() => setEditando(null)}
        onSaved={() => {
          refetch();
          window.dispatchEvent(new CustomEvent("registro-saved"));
        }}
        editando={editando}
      />

      <ConfirmDialog
        open={!!eliminando}
        title="Eliminar registro"
        message={`¿Eliminar "${eliminando?.descripcion}"?`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setEliminando(null)}
      />
    </div>
  );
}
