"use client";

import { useState, useEffect, useRef } from "react";
import type { Registro } from "@/lib/types";
import { useCategorias, crearRegistro, actualizarRegistro, crearCategoria } from "@/lib/hooks";
import { useDemo } from "@/lib/demo-context";
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
  const { isDemo } = useDemo();
  const [tipo, setTipo] = useState<"entrada" | "salida">("salida");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [fecha, setFecha] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [simbolo, setSimbolo] = useState("$");
  const [addingCat, setAddingCat] = useState(false);
  const [newCatEmoji, setNewCatEmoji] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
      setFecha(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10));
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
      await actualizarRegistro(editando.id, payload, isDemo);
      show("Registro actualizado");
    } else {
      await crearRegistro(payload, isDemo);
      show("Registro guardado");
    }

    setSaving(false);
    onSaved();
    handleClose();
  };

  // ── Voice recognition ──
  const parseVoiceInput = (text: string) => {
    const lower = text.toLowerCase().trim();

    // Extract number (supports "500", "mil", "mil quinientos", "1,500", "1.500")
    let amount = "";
    const numMatch = lower.match(/(\d[\d,._]*)/);
    if (numMatch) {
      amount = numMatch[1].replace(/[,_]/g, "");
    } else {
      // Spanish number words
      const wordNums: Record<string, number> = {
        cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400,
        quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900,
        mil: 1000, dos: 2, tres: 3, cuatro: 4, cinco: 5, diez: 10, veinte: 20,
        treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
      };
      let total = 0;
      for (const [word, val] of Object.entries(wordNums)) {
        if (lower.includes(word)) {
          total = val === 1000 ? (total || 1) * 1000 : total + val;
        }
      }
      if (total > 0) amount = String(total);
    }

    // Remove the number part to get description
    let desc = lower
      .replace(/(\d[\d,._]*)\s*(pesos|dólares|dolares|euros|varos|bolas)?/g, "")
      .replace(/\b(de|en|por|para|el|la|los|las|un|una|unos|unas)\b/g, " ")
      .trim()
      .replace(/\s+/g, " ");

    // Detect tipo
    let detectedTipo: "entrada" | "salida" = "salida";
    if (lower.includes("ingreso") || lower.includes("entrada") || lower.includes("nómina") || lower.includes("nomina") || lower.includes("salario") || lower.includes("cobr")) {
      detectedTipo = "entrada";
    }

    // Match category by keywords
    const categoryKeywords: Record<string, string[]> = {
      comida: ["comida", "comer", "restaurante", "hamburguesa", "pizza", "tacos", "sushi", "desayuno", "almuerzo", "cena", "uber eats", "rappi"],
      transporte: ["gas", "gasolina", "uber", "taxi", "camión", "metro", "estacionamiento", "carro", "coche", "auto"],
      hogar: ["renta", "luz", "agua", "internet", "cable", "limpieza", "casa", "hogar"],
      salud: ["doctor", "medicina", "farmacia", "hospital", "dentista", "lentes", "salud"],
      entretenimiento: ["cine", "netflix", "spotify", "juego", "fiesta", "bar", "concierto"],
      educación: ["libro", "curso", "escuela", "universidad", "clase", "educación"],
      compras: ["ropa", "zapatos", "amazon", "tienda", "shopping", "compra"],
      trabajo: ["salario", "nómina", "nomina", "sueldo", "trabajo", "freelance", "cobr"],
      servicios: ["teléfono", "celular", "suscripción", "membresía", "servicio"],
    };

    let matchedCatId: string | null = null;
    for (const cat of categorias) {
      const keywords = categoryKeywords[cat.nombre.toLowerCase()] || [];
      const catNameLower = cat.nombre.toLowerCase();
      if (lower.includes(catNameLower) || keywords.some((kw) => lower.includes(kw))) {
        matchedCatId = cat.id;
        break;
      }
    }

    // Clean up description - capitalize first letter
    if (desc) {
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    }

    return { amount, desc, tipo: detectedTipo, catId: matchedCatId };
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      show("Tu navegador no soporta reconocimiento de voz", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-MX";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const parsed = parseVoiceInput(transcript);

      if (parsed.desc) setDescripcion(parsed.desc);
      if (parsed.amount) setMonto(parsed.amount);
      if (parsed.catId) setCategoriaId(parsed.catId);
      setTipo(parsed.tipo);

      show(`"${transcript}"`);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  if (!open) return null;

  const fechaLabel = (() => {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (fecha === today) return "Hoy";
    return format(parseISO(fecha), "d MMM", { locale: es });
  })();

  const selectedCat = categorias.find((c) => c.id === categoriaId);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      closing ? "animate-slide-down" : "animate-fade-in"
    }`}>
      {/* Backdrop on desktop */}
      <div className="hidden md:block absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* Panel — fullscreen on mobile, centered card on desktop */}
      <div className="relative w-full h-full md:w-[480px] md:h-auto md:max-h-[90vh] md:rounded-2xl bg-[var(--color-bg-primary)] flex flex-col md:overflow-auto">
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
                const { data } = await crearCategoria({ nombre: newCatName.trim(), emoji: newCatEmoji.trim() }, isDemo);
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
          <button
            onClick={listening ? stopListening : startListening}
            className={`w-12 h-12 flex items-center justify-center rounded-xl border text-lg transition-all ${
              listening
                ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(232,93,93,0.4)] animate-pulse"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
            }`}
          >
            🎙️
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
    </div>
  );
}
