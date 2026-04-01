import type { Categoria, Registro } from "./types";
import { DEMO_CATEGORIAS, generateDemoRegistros } from "./demo-data";

let registros: Registro[] = [];
let categorias: Categoria[] = [];
let initialized = false;

function init() {
  if (initialized) return;
  registros = generateDemoRegistros();
  categorias = [...DEMO_CATEGORIAS];
  initialized = true;
}

function notify() {
  window.dispatchEvent(new CustomEvent("registro-saved"));
}

function newId() {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const demoStore = {
  // ── Reads ──
  getRegistros(limit?: number): Registro[] {
    init();
    const sorted = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.created_at.localeCompare(a.created_at));
    return limit ? sorted.slice(0, limit) : sorted;
  },

  getCategorias(visibleOnly = true): Categoria[] {
    init();
    return visibleOnly ? categorias.filter((c) => c.visible) : [...categorias];
  },

  getBalance(month: number, year: number) {
    init();
    let entradas = 0;
    let salidas = 0;
    for (const r of registros) {
      const d = new Date(r.fecha + "T12:00:00");
      if (d.getMonth() === month && d.getFullYear() === year) {
        if (r.tipo === "entrada") entradas += Number(r.monto);
        else salidas += Number(r.monto);
      }
    }
    return { entradas, salidas };
  },

  getYears(): number[] {
    init();
    const years = new Set<number>();
    for (const r of registros) {
      years.add(new Date(r.fecha + "T12:00:00").getFullYear());
    }
    return [...years].sort((a, b) => b - a);
  },

  getMonthlySummary(year: number): Record<number, number> {
    init();
    const summary: Record<number, number> = {};
    for (const r of registros) {
      const d = new Date(r.fecha + "T12:00:00");
      if (d.getFullYear() !== year) continue;
      const m = d.getMonth();
      const amount = r.tipo === "entrada" ? Number(r.monto) : -Number(r.monto);
      summary[m] = (summary[m] || 0) + amount;
    }
    return summary;
  },

  getExportData(): Registro[] {
    init();
    return [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  // ── Mutations ──
  addRegistro(data: { tipo: "entrada" | "salida"; monto: number; descripcion: string; categoria_id: string | null; fecha: string }): Registro {
    init();
    const cat = categorias.find((c) => c.id === data.categoria_id) || null;
    const registro: Registro = {
      id: newId(),
      ...data,
      user_id: "demo",
      created_at: new Date().toISOString(),
      categoria: cat,
    };
    registros.push(registro);
    notify();
    return registro;
  },

  updateRegistro(id: string, updates: Partial<{ tipo: "entrada" | "salida"; monto: number; descripcion: string; categoria_id: string | null; fecha: string }>): Registro | null {
    init();
    const r = registros.find((r) => r.id === id);
    if (!r) return null;
    Object.assign(r, updates);
    if (updates.categoria_id) {
      r.categoria = categorias.find((c) => c.id === updates.categoria_id) || null;
    }
    notify();
    return r;
  },

  deleteRegistro(id: string) {
    init();
    registros = registros.filter((r) => r.id !== id);
    notify();
  },

  addCategoria(data: { nombre: string; emoji: string }): Categoria {
    init();
    const cat: Categoria = {
      id: newId(),
      ...data,
      es_predeterminada: false,
      visible: true,
      user_id: "demo",
      created_at: new Date().toISOString(),
    };
    categorias.push(cat);
    return cat;
  },

  updateCategoria(id: string, updates: Partial<{ nombre: string; emoji: string; visible: boolean }>) {
    init();
    const cat = categorias.find((c) => c.id === id);
    if (cat) Object.assign(cat, updates);
  },

  deleteAllRegistros() {
    init();
    registros = [];
    notify();
  },

  reset() {
    initialized = false;
    init();
  },
};
