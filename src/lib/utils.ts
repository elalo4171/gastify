import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

export function formatMonto(monto: number, simbolo: string = "$"): string {
  return `${simbolo}${monto.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatFechaRelativa(fecha: string): string {
  const date = parseISO(fecha);
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  const dias = differenceInDays(new Date(), date);
  if (dias < 7) return `Hace ${dias} días`;
  return format(date, "d MMM yyyy", { locale: es });
}

export function formatFechaGrupo(fecha: string): string {
  const date = parseISO(fecha);
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

export function formatFechaCorta(fecha: string): string {
  return format(parseISO(fecha), "d MMM", { locale: es });
}

export function getRangoPeriodo(
  periodo: string,
  fechaPersonalizadaInicio?: string,
  fechaPersonalizadaFin?: string
): { inicio: Date; fin: Date } {
  const hoy = new Date();
  switch (periodo) {
    case "semana":
      return {
        inicio: startOfWeek(hoy, { weekStartsOn: 1 }),
        fin: endOfWeek(hoy, { weekStartsOn: 1 }),
      };
    case "mes":
      return { inicio: startOfMonth(hoy), fin: endOfMonth(hoy) };
    case "ano":
      return { inicio: startOfYear(hoy), fin: endOfYear(hoy) };
    case "personalizado":
      return {
        inicio: fechaPersonalizadaInicio
          ? parseISO(fechaPersonalizadaInicio)
          : startOfMonth(hoy),
        fin: fechaPersonalizadaFin
          ? parseISO(fechaPersonalizadaFin)
          : endOfMonth(hoy),
      };
    default:
      return { inicio: startOfMonth(hoy), fin: endOfMonth(hoy) };
  }
}

export function getMonedaFromStorage(): { codigo: string; simbolo: string } {
  if (typeof window === "undefined") return { codigo: "MXN", simbolo: "$" };
  const saved = localStorage.getItem("gastify_moneda");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { codigo: "MXN", simbolo: "$" };
    }
  }
  return { codigo: "MXN", simbolo: "$" };
}

export function setMonedaToStorage(codigo: string, simbolo: string): void {
  localStorage.setItem(
    "gastify_moneda",
    JSON.stringify({ codigo, simbolo })
  );
}

// Colors for chart categories
const CHART_COLORS = [
  "#E85D5D",
  "#4CD964",
  "#5AC8FA",
  "#FF9500",
  "#AF52DE",
  "#FFCC00",
  "#FF6482",
  "#30B0C7",
  "#FF2D55",
  "#AC8E68",
  "#007AFF",
  "#8E8E93",
  "#34C759",
];

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function generarCSV(
  registros: Array<{
    fecha: string;
    tipo: string;
    descripcion: string;
    monto: number;
    categorias?: { nombre: string; emoji: string } | null;
  }>
): string {
  const header = "Fecha,Tipo,Descripción,Monto,Categoría\n";
  const rows = registros
    .map(
      (r) =>
        `${r.fecha},${r.tipo},"${r.descripcion}",${r.monto},"${r.categorias ? `${r.categorias.emoji} ${r.categorias.nombre}` : ""}"`
    )
    .join("\n");
  return header + rows;
}

export function descargarCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
