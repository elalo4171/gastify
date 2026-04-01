"use client";

import { useState, useEffect } from "react";
import { useAllCategorias, actualizarCategoria, crearCategoria } from "@/lib/hooks";
import { useDemo } from "@/lib/demo-context";
import { useToast } from "./Toast";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { categorias, loading, refetch } = useAllCategorias();
  const { show } = useToast();
  const { isDemo } = useDemo();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"categories" | "addNew">("categories");
  const [newEmoji, setNewEmoji] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  // Retry fetching if categories are empty (seed may not have finished), max 3 times
  const [retries, setRetries] = useState(0);
  useEffect(() => {
    if (!loading && categorias.length === 0 && retries < 3) {
      const timer = setTimeout(() => {
        setRetries((r) => r + 1);
        refetch();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, categorias.length, retries]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const { data } = await crearCategoria({ nombre: newName.trim(), emoji: newEmoji.trim() }, isDemo);
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
        await actualizarCategoria(cat.id, { visible: shouldBeVisible }, isDemo);
      }
    }
    setSaving(false);
    localStorage.setItem("gastify_onboarding_done", "true");
    onComplete();
  };

  if (step === "addNew") {
    return (
      <div className="fixed inset-0 z-[70] bg-[var(--color-bg-primary)] flex items-center justify-center animate-fade-in px-5">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold tracking-tighter text-[var(--color-accent)]">Gastify</div>
            <button onClick={() => setStep("categories")} className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              ✕
            </button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Nombre de categoría"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="text-3xl md:text-4xl font-bold bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] mb-6 w-full"
            />
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="😀"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                maxLength={2}
                className="w-14 h-14 text-center text-2xl rounded-2xl bg-[var(--color-bg-secondary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
              />
              <p className="text-sm text-[var(--color-text-secondary)]">Elige un emoji para identificarla</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            disabled={saving || !newEmoji.trim() || !newName.trim()}
            className="w-full py-4 bg-[var(--color-accent)] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-30 active:scale-[0.98] hover:opacity-90"
          >
            {saving ? "Guardando..." : "Agregar categoría"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[var(--color-bg-primary)] flex flex-col animate-fade-in overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-[20px] border-b border-[var(--color-border)]/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 md:px-10 h-14">
          <div className="text-xl font-bold tracking-tighter text-[var(--color-accent)]">Gastify</div>
          <button
            onClick={handleFinish}
            disabled={saving}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Omitir
          </button>
        </div>
      </header>

      {/* Content — desktop: side by side, mobile: stacked */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-5 md:px-10 py-8 md:py-16 md:flex md:gap-16 md:items-start">
        {/* Left — headline */}
        <div className="md:w-72 md:shrink-0 md:sticky md:top-24 mb-8 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight mb-3">
            Elige tus categorías
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Selecciona las que usarás para organizar tus gastos e ingresos. Puedes cambiarlas después en ajustes.
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-3">
            {selected.size} de {categorias.length} seleccionadas
          </p>
        </div>

        {/* Right — grid */}
        <div className="flex-1 pb-28 md:pb-24">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(13)].map((_, i) => (
                <div key={i} className="aspect-square bg-[var(--color-bg-card)] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {categorias.map((cat) => {
                const isSelected = selected.has(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-3 transition-all active:scale-95 bg-[var(--color-bg-card)] border ${
                      isSelected
                        ? "border-[var(--color-accent)]/40"
                        : "border-[var(--color-border)] opacity-[0.35]"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--color-accent)] rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold leading-none">✓</span>
                      </div>
                    )}
                    <span className="text-4xl md:text-[44px] mb-1.5 leading-none">{cat.emoji}</span>
                    <span className="text-[11px] font-semibold text-[var(--color-text-primary)] tracking-wide">{cat.nombre}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setStep("addNew")}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center p-3 border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-text-secondary)] transition-colors active:scale-95"
              >
                <span className="text-3xl text-[var(--color-text-secondary)] mb-1.5">+</span>
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] tracking-wide">Agregar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/90 to-transparent">
        <div className="max-w-5xl mx-auto px-5 md:px-10 pb-8 pt-4 md:flex md:justify-end">
          <button
            onClick={handleFinish}
            disabled={saving || selected.size === 0}
            className="w-full md:w-auto md:px-12 py-4 bg-[var(--color-accent)] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-30 active:scale-[0.98] hover:opacity-90"
          >
            {saving ? "Guardando..." : `Continuar con ${selected.size} categorías`}
          </button>
        </div>
      </div>
    </div>
  );
}
