"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SUGGESTED_CATEGORIES = [
  { nombre: "Comida", emoji: "🍔" },
  { nombre: "Hogar", emoji: "🏠" },
  { nombre: "Transporte", emoji: "🚗" },
  { nombre: "Compras", emoji: "🛒" },
  { nombre: "Salud", emoji: "💊" },
  { nombre: "Entretenimiento", emoji: "🎮" },
  { nombre: "Educación", emoji: "📚" },
  { nombre: "Trabajo", emoji: "👔" },
  { nombre: "Servicios", emoji: "💳" },
  { nombre: "Regalos", emoji: "🎁" },
  { nombre: "Salario", emoji: "💰" },
  { nombre: "Inversiones", emoji: "📈" },
  { nombre: "Otros", emoji: "✨" },
];

type CategoryItem = { nombre: string; emoji: string };

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [custom, setCustom] = useState<CategoryItem[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [saving, setSaving] = useState(false);

  // If user already has categories, skip onboarding
  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          document.cookie = "gastify_onboarded=true;path=/;max-age=31536000";
          router.replace("/dashboard");
        } else {
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, [router]);

  const toggleCategory = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === SUGGESTED_CATEGORIES.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(SUGGESTED_CATEGORIES.map((_, i) => i)));
    }
  };

  const addCustom = () => {
    if (!newNombre.trim() || !newEmoji.trim()) return;
    setCustom((prev) => [...prev, { nombre: newNombre.trim(), emoji: newEmoji.trim() }]);
    setNewNombre("");
    setNewEmoji("");
    setShowNew(false);
  };

  const removeCustom = (index: number) => {
    setCustom((prev) => prev.filter((_, i) => i !== index));
  };

  const totalSelected = selected.size + custom.length;

  const handleFinish = async () => {
    if (totalSelected === 0) return;
    setSaving(true);

    const categories: CategoryItem[] = [
      ...SUGGESTED_CATEGORIES.filter((_, i) => selected.has(i)),
      ...custom,
    ];

    // Create all selected categories in one request (no subscription guard)
    await fetch("/api/auth/seed-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
    });

    // Mark onboarding as complete
    document.cookie = "gastify_onboarded=true;path=/;max-age=31536000";

    router.push("/dashboard");
    router.refresh();
  };

  if (!ready) {
    return <div className="min-h-[100dvh] bg-[var(--color-bg-primary)]" />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Elige tus categorías
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
          Selecciona las categorías que usarás para organizar tus gastos e ingresos. Puedes cambiarlas después en ajustes.
        </p>
      </div>

      {/* Suggested categories */}
      <div className="flex-1 px-6 overflow-y-auto pb-32">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Sugeridas
          </p>
          <button
            onClick={selectAll}
            className="text-xs text-[var(--color-accent)] font-semibold"
          >
            {selected.size === SUGGESTED_CATEGORIES.length ? "Quitar todas" : "Seleccionar todas"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SUGGESTED_CATEGORIES.map((cat, i) => {
            const isSelected = selected.has(i);
            return (
              <button
                key={cat.nombre}
                onClick={() => toggleCategory(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? "bg-[var(--color-accent)]/10 ring-2 ring-[var(--color-accent)]/40"
                    : "bg-[var(--color-bg-card)]"
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span
                  className={`text-sm font-medium ${
                    isSelected
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {cat.nombre}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom categories */}
        {custom.length > 0 && (
          <>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mt-6 mb-3">
              Personalizadas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {custom.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-accent)]/10 ring-2 ring-[var(--color-accent)]/40"
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-sm font-medium text-[var(--color-accent)] flex-1">
                    {cat.nombre}
                  </span>
                  <button
                    onClick={() => removeCustom(i)}
                    className="text-[var(--color-text-tertiary)] text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add custom category */}
        {showNew ? (
          <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg-card)] space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="😀"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                maxLength={2}
                className="w-14 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] text-center text-xl outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
              />
              <input
                type="text"
                placeholder="Nombre de categoría"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowNew(false); setNewNombre(""); setNewEmoji(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Cancelar
              </button>
              <button
                onClick={addCustom}
                disabled={!newNombre.trim() || !newEmoji.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-40 transition-all active:scale-[0.98]"
              >
                Agregar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] transition-all active:scale-[0.98]"
          >
            + Crear categoría personalizada
          </button>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent pt-12">
        <button
          onClick={handleFinish}
          disabled={totalSelected === 0 || saving}
          className="w-full max-w-sm mx-auto block py-3.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {saving
            ? "Guardando..."
            : `Continuar con ${totalSelected} categoría${totalSelected !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
