"use client";

import { useState, useEffect } from "react";
import { useAllCategorias, actualizarCategoria, crearCategoria } from "@/lib/hooks";
import { useToast } from "./Toast";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { categorias, loading, refetch } = useAllCategorias();
  const { show } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"categories" | "addNew">("categories");
  const [newEmoji, setNewEmoji] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categorias.length > 0 && selected.size === 0) {
      setSelected(new Set(categorias.map((c) => c.id)));
    }
  }, [categorias, selected.size]);

  const toggleCategory = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddNew = async () => {
    if (!newEmoji.trim() || !newName.trim()) return;
    setSaving(true);
    const { data } = await crearCategoria({ nombre: newName.trim(), emoji: newEmoji.trim() });
    setSaving(false);
    if (data) {
      setSelected((prev) => new Set(prev).add(data.id));
      setNewEmoji("");
      setNewName("");
      setStep("categories");
      refetch();
      show("Categoría creada");
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    for (const cat of categorias) {
      const shouldBeVisible = selected.has(cat.id);
      if (cat.visible !== shouldBeVisible) {
        await actualizarCategoria(cat.id, { visible: shouldBeVisible });
      }
    }
    setSaving(false);
    localStorage.setItem("gastify_onboarding_done", "true");
    onComplete();
  };

  if (step === "addNew") {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-[70] bg-[var(--color-bg-primary)] flex flex-col animate-fade-in px-5">
        <div className="w-full max-w-[390px] mx-auto flex flex-col flex-1">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold tracking-tighter text-[var(--color-accent)]">Gastify</div>
            <button onClick={() => setStep("categories")} className="text-[var(--color-text-primary)] hover:opacity-80 active:scale-95">✕</button>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <input
              type="text"
              placeholder="Categoría"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="text-3xl font-bold bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] mb-4"
            />
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="😀"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                maxLength={2}
                className="w-14 h-14 text-center text-2xl rounded-full bg-[var(--color-bg-secondary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
              <p className="text-sm text-[var(--color-text-secondary)]">Elige un emoji</p>
            </div>
          </div>
          <div className="pb-10">
            <button
              onClick={handleAddNew}
              disabled={saving || !newEmoji.trim() || !newName.trim()}
              className="w-full h-16 bg-gradient-to-br from-[#ffb3b0] to-[var(--color-accent)] text-white font-bold text-base rounded-xl flex items-center justify-center shadow-[0_8px_32px_rgba(232,93,93,0.2)] transition-all disabled:opacity-30 active:scale-95"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[70] bg-[var(--color-bg-primary)] flex flex-col animate-fade-in overflow-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-[20px]">
        <div className="max-w-[390px] mx-auto flex items-center justify-between px-5 h-16">
          <div className="text-2xl font-bold tracking-tighter text-[var(--color-accent)]">Gastify</div>
          <button onClick={handleFinish} disabled={saving} className="text-[var(--color-text-primary)] hover:opacity-80 active:scale-95">✕</button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[390px] mx-auto w-full px-5 pt-4 mb-10">
        <h1 className="text-[2.5rem] leading-[1.1] font-extrabold tracking-tight text-[var(--color-text-primary)] mb-4">
          Elige tus<br />categorías
        </h1>
        <p className="text-base font-medium text-[var(--color-text-secondary)]">
          Selecciona las que usarás. Puedes cambiarlas después.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-[390px] mx-auto w-full px-5 pb-32">
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-[var(--color-bg-card)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {categorias.map((cat) => {
              const isSelected = selected.has(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-4 transition-all active:scale-95 bg-[var(--color-bg-card)] border border-[var(--color-border)] ${
                    isSelected ? "" : "opacity-[0.35]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--color-accent)] rounded-full flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold leading-none">✓</span>
                    </div>
                  )}
                  <span className="text-[48px] mb-2 leading-none">{cat.emoji}</span>
                  <span className="text-xs font-semibold text-[var(--color-text-primary)] tracking-wide">{cat.nombre}</span>
                </button>
              );
            })}
            <button
              onClick={() => setStep("addNew")}
              className="aspect-square rounded-xl flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-text-secondary)] transition-colors active:scale-95"
            >
              <span className="text-[32px] text-[var(--color-text-secondary)] mb-2">+</span>
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide">Agregar</span>
            </button>
          </div>
        )}
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/90 to-transparent">
        <div className="max-w-[390px] mx-auto px-5 pb-8 pt-4">
          <button
            onClick={handleFinish}
            disabled={saving || selected.size === 0}
            className="w-full h-16 bg-gradient-to-br from-[#ffb3b0] to-[var(--color-accent)] text-white font-bold text-base rounded-xl flex items-center justify-center shadow-[0_8px_32px_rgba(232,93,93,0.2)] transition-all disabled:opacity-30 active:scale-95"
          >
            {saving ? "Guardando..." : `Continuar con ${selected.size} categorías`}
          </button>
        </div>
      </div>
    </div>
  );
}
