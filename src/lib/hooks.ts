"use client";

import { useState, useEffect, useCallback } from "react";
import type { Categoria, Registro } from "./types";

// ── Categorías ──────────────────────────────────────────
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categorias");
    if (res.ok) setCategorias(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return { categorias, loading, refetch: fetchCategorias };
}

export function useAllCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categorias?all=true");
    if (res.ok) setCategorias(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return { categorias, loading, refetch: fetchCategorias };
}

// ── Registros ───────────────────────────────────────────
export function useRegistros(limit?: number) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (limit) params.set("limit", limit.toString());
    const res = await fetch(`/api/registros?${params}`);
    if (res.ok) setRegistros(await res.json());
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  return { registros, loading, refetch: fetchRegistros };
}

// ── Balance del mes ─────────────────────────────────────
export function useBalanceMes(month?: number, year?: number) {
  const [entradas, setEntradas] = useState(0);
  const [salidas, setSalidas] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (month !== undefined) params.set("month", month.toString());
    if (year !== undefined) params.set("year", year.toString());
    const res = await fetch(`/api/registros/balance?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEntradas(data.entradas);
      setSalidas(data.salidas);
    }
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { entradas, salidas, balance: entradas - salidas, loading, refetch: fetchBalance };
}

// ── Años con registros ──────────────────────────────────
export function useYears() {
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchYears = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/registros/years");
    if (res.ok) setYears(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  return { years, loading, refetch: fetchYears };
}

// ── CRUD ────────────────────────────────────────────────
export async function crearRegistro(registro: {
  tipo: "entrada" | "salida";
  monto: number;
  descripcion: string;
  categoria_id: string | null;
  fecha: string;
}) {
  const res = await fetch("/api/registros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registro),
  });
  const data = await res.json();
  return { data: res.ok ? (data as Registro) : null, error: res.ok ? null : data };
}

export async function actualizarRegistro(
  id: string,
  updates: Partial<{
    tipo: "entrada" | "salida";
    monto: number;
    descripcion: string;
    categoria_id: string | null;
    fecha: string;
  }>
) {
  const res = await fetch("/api/registros", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  const data = await res.json();
  return { data: res.ok ? (data as Registro) : null, error: res.ok ? null : data };
}

export async function eliminarRegistro(id: string) {
  const res = await fetch(`/api/registros?id=${id}`, { method: "DELETE" });
  return { error: res.ok ? null : await res.json() };
}

export async function crearCategoria(categoria: {
  nombre: string;
  emoji: string;
}) {
  const res = await fetch("/api/categorias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  });
  const data = await res.json();
  return { data: res.ok ? (data as Categoria) : null, error: res.ok ? null : data };
}

export async function actualizarCategoria(
  id: string,
  updates: Partial<{ nombre: string; emoji: string; visible: boolean }>
) {
  const res = await fetch("/api/categorias", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  return { error: res.ok ? null : await res.json() };
}

export async function eliminarCategoria(id: string) {
  const res = await fetch(`/api/categorias?id=${id}`, { method: "DELETE" });
  return { error: res.ok ? null : await res.json() };
}
