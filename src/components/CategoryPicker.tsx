"use client";

import type { Categoria } from "@/lib/types";
import { useState } from "react";
import { crearCategoria } from "@/lib/hooks";

interface CategoryPickerProps {
  categorias: Categoria[];
  selected: string | null;
  onSelect: (id: string) => void;
  onCategoriaCreated?: () => void;
}

export default function CategoryPicker({
  categorias, selected, onSelect, onCategoriaCreated,
}: CategoryPickerProps) {
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
      onSelect(data.id);
      setNewEmoji("");
      setNewName("");
      setAdding(false);
      onCategoriaCreated?.();
    }
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all ${
              selected === cat.id
                ? "bg-[var(--color-accent)] text-white font-semibold"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
            }`}
          >
            <span className="text-lg">{cat.emoji}</span>
            {cat.nombre}
          </button>
        ))}
        <button
          onClick={() => setAdding(!adding)}
          className="shrink-0 px-3 py-2 rounded-xl text-sm bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
        >
          + Nueva
        </button>
      </div>
      {adding && (
        <div className="flex gap-2 mt-3 items-center">
          <input
            type="text"
            placeholder="😀"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            maxLength={2}
            className="w-10 h-10 text-center text-lg rounded-xl bg-[var(--color-bg-secondary)] outline-none"
          />
          <input
            type="text"
            placeholder="Nombre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 h-10 px-3 rounded-xl bg-[var(--color-bg-secondary)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newEmoji.trim() || !newName.trim()}
            className="h-10 px-4 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-30"
          >
            {saving ? "..." : "✓"}
          </button>
        </div>
      )}
    </div>
  );
}
