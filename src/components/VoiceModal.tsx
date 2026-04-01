"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCategorias, crearRegistro } from "@/lib/hooks";
import { useDemo } from "@/lib/demo-context";
import { useToast } from "./Toast";

interface VoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// Animated spectrum visualizer (no mic capture — avoids conflict with SpeechRecognition on Android)
function AudioSpectrum({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    cancelAnimationFrame(animRef.current);

    if (!active) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;
      ctx.strokeStyle = "#444444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();
      return;
    }

    let running = true;
    const barCount = 40;
    const barWidth = canvas.width / barCount;
    const centerY = canvas.height / 2;

    const draw = () => {
      if (!running) return;
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() / 1000;
      for (let i = 0; i < barCount; i++) {
        const wave = Math.abs(Math.sin(t * 3 + i * 0.3));
        const h = wave * centerY * 0.6 + 2;
        ctx.fillStyle = `rgba(232, 93, 93, ${0.3 + wave * 0.5})`;
        const x = i * barWidth + 1;
        const w = barWidth - 2;
        const r = Math.min(w / 2, 3);
        // Top bar
        ctx.beginPath();
        ctx.roundRect(x, centerY - h, w, h, r);
        ctx.fill();
        // Bottom bar (mirror)
        ctx.beginPath();
        ctx.roundRect(x, centerY, w, h, r);
        ctx.fill();
      }
    };

    draw();
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={120}
      className="w-full max-w-xs h-[120px]"
    />
  );
}

export default function VoiceModal({ open, onClose, onSaved }: VoiceModalProps) {
  const { categorias } = useCategorias();
  const { show } = useToast();
  const { isDemo } = useDemo();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [parsed, setParsed] = useState<{ desc: string; amount: string; tipo: "entrada" | "salida"; catName: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastInterimRef = useRef("");
  const processedRef = useRef(false);

  const parseVoice = useCallback((text: string) => {
    const lower = text.toLowerCase().trim();

    let amount = "";
    const numMatch = lower.match(/(\d[\d,._]*)/);
    if (numMatch) {
      amount = numMatch[1].replace(/[,_]/g, "");
    } else {
      const wordNums: Record<string, number> = {
        cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400,
        quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900,
        mil: 1000, dos: 2, tres: 3, cuatro: 4, cinco: 5, diez: 10, veinte: 20,
        treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
      };
      let total = 0;
      for (const [word, val] of Object.entries(wordNums)) {
        if (lower.includes(word)) total = val === 1000 ? (total || 1) * 1000 : total + val;
      }
      if (total > 0) amount = String(total);
    }

    let desc = lower
      .replace(/(\d[\d,._]*)\s*(pesos|dólares|dolares|euros|varos|bolas)?/g, "")
      .replace(/\b(de|en|por|para|el|la|los|las|un|una|unos|unas)\b/g, " ")
      .trim().replace(/\s+/g, " ");
    if (desc) desc = desc.charAt(0).toUpperCase() + desc.slice(1);

    let tipo: "entrada" | "salida" = "salida";
    if (lower.includes("ingreso") || lower.includes("entrada") || lower.includes("nómina") || lower.includes("nomina") || lower.includes("salario")) {
      tipo = "entrada";
    }

    const categoryKeywords: Record<string, string[]> = {
      comida: ["comida", "comer", "restaurante", "hamburguesa", "pizza", "tacos", "desayuno", "almuerzo", "cena"],
      transporte: ["gas", "gasolina", "uber", "taxi", "metro", "carro", "coche"],
      hogar: ["renta", "luz", "agua", "internet", "casa", "hogar"],
      salud: ["doctor", "medicina", "farmacia", "hospital", "dentista"],
      entretenimiento: ["cine", "netflix", "spotify", "juego", "fiesta", "bar"],
      educación: ["libro", "curso", "escuela", "universidad"],
      compras: ["ropa", "zapatos", "amazon", "tienda", "compra"],
      trabajo: ["salario", "nómina", "nomina", "sueldo", "trabajo"],
      servicios: ["teléfono", "celular", "suscripción", "servicio"],
    };

    let catName = "";
    for (const cat of categorias) {
      const keywords = categoryKeywords[cat.nombre.toLowerCase()] || [];
      if (lower.includes(cat.nombre.toLowerCase()) || keywords.some((kw) => lower.includes(kw))) {
        catName = cat.nombre;
        break;
      }
    }

    return { desc, amount, tipo, catName };
  }, [categorias]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) { show("Tu navegador no soporta voz", "error"); onClose(); return; }

    const recognition = new SR();
    recognition.lang = "es-MX";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      lastInterimRef.current = "";
      processedRef.current = false;
    };
    recognition.onerror = () => setListening(false);

    // Android fix: when recognition ends without a final result,
    // use the last interim transcript as the result
    recognition.onend = () => {
      setListening(false);
      if (lastInterimRef.current && !processedRef.current) {
        processedRef.current = true;
        const text = lastInterimRef.current;
        lastInterimRef.current = "";
        setTranscript(text);
        setParsed(parseVoice(text));
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setInterimText(interim);
      if (interim) lastInterimRef.current = interim;
      if (final) {
        processedRef.current = true;
        lastInterimRef.current = "";
        setTranscript(final);
        setParsed(parseVoice(final));
        recognition.stop();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [parseVoice, show, onClose]);

  useEffect(() => {
    if (open) {
      setTranscript("");
      setInterimText("");
      setParsed(null);
      setTimeout(startListening, 300);
    } else {
      recognitionRef.current?.stop();
    }
    return () => { recognitionRef.current?.stop(); };
  }, [open, startListening]);

  const handleSave = async () => {
    if (!parsed?.amount || !parsed?.desc) return;
    const cat = categorias.find((c) => c.nombre === parsed.catName);
    setSaving(true);
    await crearRegistro({
      tipo: parsed.tipo,
      monto: parseFloat(parsed.amount),
      descripcion: parsed.desc,
      categoria_id: cat?.id || null,
      fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    }, isDemo);
    setSaving(false);
    show("Registro guardado");
    onSaved();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-overlay">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { recognitionRef.current?.stop(); onClose(); }} />

      <div className="relative flex flex-col items-center gap-6 px-8 max-w-sm w-full">
        {/* Mic button */}
        <button
          onClick={() => {
            if (listening) recognitionRef.current?.stop();
            else { setParsed(null); setTranscript(""); startListening(); }
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all z-10 ${
            listening
              ? "bg-[var(--color-accent)] shadow-[0_0_40px_rgba(232,93,93,0.5)]"
              : "bg-[var(--color-bg-elevated)]"
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={listening ? "white" : "var(--color-text-secondary)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="1" width="6" height="11" rx="3" />
            <path d="M19 10v1a7 7 0 01-14 0v-1M12 18v4M8 22h8" />
          </svg>
        </button>

        {/* Audio spectrum visualizer */}
        <AudioSpectrum active={listening} />

        {/* Live transcript */}
        <div className="text-center min-h-[40px]">
          {listening && !transcript && (
            <p className="text-lg text-[var(--color-text-secondary)]">
              {interimText || "Escuchando..."}
            </p>
          )}
          {transcript && (
            <p className="text-xl font-semibold text-[var(--color-text-primary)]">
              &ldquo;{transcript}&rdquo;
            </p>
          )}
        </div>

        {/* Parsed result card */}
        {parsed && (
          <div className="w-full bg-[var(--color-bg-card)] rounded-2xl p-5 animate-fade-in space-y-3">
            <div>
              <span className="text-xs text-[var(--color-text-secondary)] mb-1 block">Descripción</span>
              <input
                type="text"
                value={parsed.desc}
                onChange={(e) => setParsed({ ...parsed, desc: e.target.value })}
                placeholder="¿Qué fue?"
                className="w-full py-2 px-3 rounded-lg bg-[var(--color-bg-secondary)] text-sm font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
              />
            </div>
            <div>
              <span className="text-xs text-[var(--color-text-secondary)] mb-1 block">Monto</span>
              <input
                type="number"
                inputMode="decimal"
                value={parsed.amount}
                onChange={(e) => setParsed({ ...parsed, amount: e.target.value })}
                placeholder="0.00"
                className={`w-full py-2 px-3 rounded-lg bg-[var(--color-bg-secondary)] text-sm font-bold outline-none placeholder:text-[var(--color-text-tertiary)] focus:ring-2 focus:ring-[var(--color-accent)]/30 ${parsed.tipo === "entrada" ? "text-[var(--color-income)]" : "text-[var(--color-accent)]"}`}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">Tipo</span>
              <button
                onClick={() => setParsed({ ...parsed, tipo: parsed.tipo === "entrada" ? "salida" : "entrada" })}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all active:scale-95 ${
                  parsed.tipo === "entrada" ? "bg-[var(--color-income-bg)] text-[var(--color-income)]" : "bg-[var(--color-expense-bg)] text-[var(--color-expense)]"
                }`}
              >
                {parsed.tipo === "entrada" ? "Entrada ↔" : "Salida ↔"}
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-[var(--color-text-secondary)]">Categoría</span>
                {!parsed.catName && <span className="text-xs text-[var(--color-accent)]">* Requerida</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setParsed({ ...parsed, catName: cat.nombre })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      parsed.catName === cat.nombre
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {cat.emoji} {cat.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setParsed(null); setTranscript(""); startListening(); }}
                className="flex-1 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-sm font-semibold text-[var(--color-text-primary)] active:scale-[0.97]"
              >
                Reintentar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !parsed.amount || !parsed.desc || !parsed.catName}
                className="flex-1 py-3 rounded-xl bg-[var(--color-accent)] text-sm font-semibold text-white active:scale-[0.97] disabled:opacity-30"
              >
                {saving ? "..." : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {!parsed && (
          <p className="text-xs text-[var(--color-text-tertiary)] text-center">
            Di algo como &ldquo;500 pesos de gasolina&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
