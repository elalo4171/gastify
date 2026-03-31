"use client";

import { useState } from "react";
import { useAllCategorias, actualizarCategoria, eliminarCategoria, crearCategoria } from "@/lib/hooks";
import { useToast } from "@/components/Toast";
import { getChartColor } from "@/lib/utils";

export default function CategoriasPage() {
  const { categorias, loading, refetch } = useAllCategorias();
  const { show } = useToast();
  const [adding, setAdding] = useState(false);
  const [newEmoji, setNewEmoji] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newEmoji.trim() || !newName.trim()) return;
    setSaving(true);
    const { data } = await crearCategoria({ nombre: newName.trim(), emoji: newEmoji.trim() });
    setSaving(false);
    if (data) {
      setNewEmoji("");
      setNewName("");
      setAdding(false);
      refetch();
      show("Categoría creada");
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await eliminarCategoria(id);
    refetch();
    show("Categoría eliminada");
  };

  const handleToggleVisible = async (id: string, visible: boolean) => {
    await actualizarCategoria(id, { visible: !visible });
    refetch();
  };

  return (
    <div className="pt-8 animate-fade-in">
      {/* Header with close */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] shrink-0"
        >
          ✕
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Elige tus categorías</h1>
      </div>

      {/* Category grid — 3 columns like Monai */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="aspect-square rounded-2xl bg-[var(--color-bg-secondary)] animate-pulse" />
              <div className="h-3 bg-[var(--color-bg-secondary)] rounded mt-2 mx-4 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {categorias.map((cat, i) => {
            const color = getChartColor(i);
            return (
              <div key={cat.id} className="flex flex-col items-center">
                <button
                  onClick={() => handleToggleVisible(cat.id, cat.visible)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!cat.es_predeterminada) handleDelete(cat.id, cat.nombre);
                  }}
                  className={`aspect-square w-full rounded-2xl flex items-center justify-center text-4xl transition-all active:scale-95 ${
                    cat.visible ? "" : "opacity-30"
                  }`}
                  style={{ backgroundColor: `${color}33` }}
                >
                  {cat.emoji}
                </button>
                <span className={`text-sm font-medium mt-2 ${
                  cat.visible ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
                }`}>
                  {cat.nombre}
                </span>
              </div>
            );
          })}

          {/* Add category */}
          {adding ? (
            <div className="flex flex-col items-center">
              <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-2 p-2">
                <input
                  type="text"
                  placeholder="😀"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  maxLength={2}
                  autoFocus
                  className="w-12 h-12 text-center text-2xl rounded-xl bg-[var(--color-bg-elevated)] outline-none"
                />
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-8 px-2 text-center text-xs rounded-lg bg-[var(--color-bg-elevated)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setAdding(false); setNewEmoji(""); setNewName(""); }}
                  className="text-xs text-[var(--color-text-secondary)]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving || !newEmoji.trim() || !newName.trim()}
                  className="text-xs text-[var(--color-accent)] font-semibold disabled:opacity-30"
                >
                  {saving ? "..." : "Guardar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setAdding(true)}
                className="aspect-square w-full rounded-2xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-3xl text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-text-secondary)] active:scale-95"
              >
                +
              </button>
              <span className="text-sm font-medium mt-2 text-[var(--color-text-secondary)]">
                Agregar
              </span>
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-8">
        Toca para ocultar/mostrar. Mantén presionado para eliminar.
      </p>
    </div>
  );
}
