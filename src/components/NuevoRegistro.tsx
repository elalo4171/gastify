"use client";

import { useState, useEffect, useRef } from "react";
import type { Registro } from "@/lib/types";
import { useCategorias, crearRegistro, actualizarRegistro, crearCategoria } from "@/lib/hooks";
import { getMonedaFromStorage } from "@/lib/utils";
import { useToast } from "./Toast";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface NuevoRegistroProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editando?: Registro | null;
}

export default function NuevoRegistro({ open, onClose, onSaved, editando }: NuevoRegistroProps) {
  const { categorias, refetch: refetchCats } = useCategorias();
  const { show } = useToast();
  const [tipo, setTipo] = useState<"entrada" | "salida">("salida");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [simbolo, setSimbolo] = useState("$");
  const [addingCat, setAddingCat] = useState(false);
  const [newCatEmoji, setNewCatEmoji] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSimbolo(getMonedaFromStorage().simbolo);
  }, [open]);

  useEffect(() => {
    if (editando) {
      setTipo(editando.tipo);
      setMonto(String(editando.monto));
      setDescripcion(editando.descripcion);
      setCategoriaId(editando.categoria_id);
      setFecha(editando.fecha);
    } else if (open) {
      setTipo("salida");
      setMonto("");
      setDescripcion("");
      setCategoriaId(null);
      setFecha(new Date().toISOString().slice(0, 10));
      setTimeout(() => descRef.current?.focus(), 100);
    }
  }, [open, editando]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  const handleSave = async () => {
    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0 || !descripcion.trim()) return;
    setSaving(true);

    const payload = {
      tipo,
      monto: montoNum,
      descripcion: descripcion.trim(),
      categoria_id: categoriaId,
      fecha,
    };

    if (editando) {
      await actualizarRegistro(editando.id, payload);
      show("Registro actualizado");
    } else {
      await crearRegistro(payload);
      show("Registro guardado");
    }

    setSaving(false);
    onSaved();
    handleClose();
  };

  if (!open) return null;

  const fechaLabel = (() => {
    const today = new Date().toISOString().slice(0, 10);
    if (fecha === today) return "Hoy";
    return format(parseISO(fecha), "d MMM", { locale: es });
  })();

  const selectedCat = categorias.find((c) => c.id === categoriaId);

  return (
    <div className={`fixed inset-0 z-50 bg-[var(--color-bg-primary)] flex flex-col ${
      closing ? "animate-slide-down" : "animate-fade-in"
    }`}>
      {/* Close button */}
      <div className="px-5 pt-4">
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
        >
          ✕
        </button>
      </div>

      {/* Content — pushed to vertical center-bottom */}
      <div className="flex-1 flex flex-col justify-end px-5 pb-4">
        {/* Meta pills row */}
        <div className="flex items-center gap-2 mb-4">
          {/* Date pill */}
          <button
            onClick={() => dateRef.current?.showPicker()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-bg-elevated)] text-sm text-[var(--color-text-secondary)]"
          >
            {fechaLabel}
            <span className="text-[10px]">▾</span>
          </button>
          <input
            ref={dateRef}
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="absolute opacity-0 w-0 h-0"
          />

          {/* Type pills */}
          <button
            onClick={() => setTipo(tipo === "salida" ? "entrada" : "salida")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
              tipo === "entrada"
                ? "bg-[var(--color-income-bg)] text-[var(--color-income)]"
                : "bg-[var(--color-expense-bg)] text-[var(--color-expense)]"
            }`}
          >
            {tipo === "entrada" ? "Entrada" : "Salida"}
            <span className="text-[10px]">▾</span>
          </button>
        </div>

        {/* Description — large inline input */}
        <input
          ref={descRef}
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="text-3xl font-bold bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] mb-1 w-full"
        />

        {/* Amount — large inline input in accent color */}
        <input
          type="text"
          inputMode="decimal"
          placeholder="Monto"
          value={monto ? `${monto}${simbolo}` : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, "");
            setMonto(raw);
          }}
          className="text-3xl font-bold bg-transparent outline-none text-[var(--color-accent)] placeholder:text-[var(--color-text-tertiary)] mb-4 w-full"
        />

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setAddingCat(!addingCat)}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] text-lg"
          >
            +
          </button>
          {categorias.map((cat) => {
            const isSelected = categoriaId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaId(isSelected ? null : cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all border ${
                  isSelected
                    ? "border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                }`}
              >
                <span className="text-base">{cat.emoji}</span>
                {cat.nombre}
                {isSelected && <span className="text-xs ml-0.5">›</span>}
              </button>
            );
          })}
        </div>

        {/* Inline new category form */}
        {addingCat && (
          <div className="flex gap-2 mt-3 items-center">
            <input
              type="text"
              placeholder="😀"
              value={newCatEmoji}
              onChange={(e) => setNewCatEmoji(e.target.value)}
              maxLength={2}
              className="w-10 h-10 text-center text-lg rounded-full bg-[var(--color-bg-elevated)] outline-none"
            />
            <input
              type="text"
              placeholder="Nombre"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              autoFocus
              className="flex-1 h-10 px-3 rounded-xl bg-[var(--color-bg-elevated)] text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
            <button
              onClick={async () => {
                if (!newCatEmoji.trim() || !newCatName.trim()) return;
                setSavingCat(true);
                const { data } = await crearCategoria({ nombre: newCatName.trim(), emoji: newCatEmoji.trim() });
                setSavingCat(false);
                if (data) {
                  setCategoriaId(data.id);
                  setNewCatEmoji("");
                  setNewCatName("");
                  setAddingCat(false);
                  refetchCats();
                  show("Categoría creada");
                }
              }}
              disabled={savingCat || !newCatEmoji.trim() || !newCatName.trim()}
              className="h-10 px-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-30"
            >
              {savingCat ? "..." : "✓"}
            </button>
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="px-5 pb-6 pt-3 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-lg font-mono">
            #
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !monto || !descripcion.trim() || !categoriaId}
            className="flex-1 h-12 rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-semibold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-30 active:scale-[0.98]"
          >
            <span className="text-[var(--color-text-secondary)]">✓</span>
            {saving ? "Guardando..." : editando ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
