export interface Categoria {
  id: string;
  nombre: string;
  emoji: string;
  es_predeterminada: boolean;
  visible: boolean;
  user_id: string | null;
  created_at: string;
}

export interface Registro {
  id: string;
  tipo: "entrada" | "salida";
  monto: number;
  descripcion: string;
  categoria_id: string | null;
  fecha: string;
  user_id: string | null;
  created_at: string;
  // Joined
  categoria?: Categoria | null;
}

export type Periodo = "semana" | "mes" | "ano" | "personalizado";
export type FiltroTipo = "todos" | "entrada" | "salida";

export interface Moneda {
  codigo: string;
  simbolo: string;
  nombre: string;
}

export const MONEDAS: Moneda[] = [
  { codigo: "MXN", simbolo: "$", nombre: "Peso Mexicano" },
  { codigo: "USD", simbolo: "$", nombre: "Dólar Americano" },
  { codigo: "EUR", simbolo: "€", nombre: "Euro" },
  { codigo: "COP", simbolo: "$", nombre: "Peso Colombiano" },
  { codigo: "ARS", simbolo: "$", nombre: "Peso Argentino" },
  { codigo: "CLP", simbolo: "$", nombre: "Peso Chileno" },
  { codigo: "PEN", simbolo: "S/", nombre: "Sol Peruano" },
];
