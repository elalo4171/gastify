"use client";

import type { Registro } from "@/lib/types";
import { formatMonto, getMonedaFromStorage, getChartColor } from "@/lib/utils";
import { useEffect, useState } from "react";

interface RegistroItemProps {
  registro: Registro;
  onClick?: () => void;
  colorIndex?: number;
}

export default function RegistroItem({ registro, onClick, colorIndex = 0 }: RegistroItemProps) {
  const [simbolo, setSimbolo] = useState("$");

  useEffect(() => {
    setSimbolo(getMonedaFromStorage().simbolo);
    const handler = () => setSimbolo(getMonedaFromStorage().simbolo);
    window.addEventListener("moneda-changed", handler);
    return () => window.removeEventListener("moneda-changed", handler);
  }, []);

  const esEntrada = registro.tipo === "entrada";
  const emoji = registro.categoria?.emoji ?? (esEntrada ? "💰" : "💸");
  const catName = registro.categoria?.nombre;
  const bgColor = esEntrada ? "var(--color-income)" : getChartColor(colorIndex);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-1 py-3 transition-all duration-150 active:scale-[0.98] text-left"
    >
      <span
        className="text-2xl w-12 h-12 flex items-center justify-center rounded-full shrink-0"
        style={{ backgroundColor: `${bgColor}33` }}
      >
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        {catName && (
          <p className="text-xs text-[var(--color-text-secondary)] leading-tight">{catName}</p>
        )}
        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate leading-tight">
          {registro.descripcion}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {!esEntrada && (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: `${bgColor}66` }}
          >
            &minus;
          </span>
        )}
        <span className={`text-sm font-bold tabular-nums ${
          esEntrada ? "text-[var(--color-income)]" : "text-[var(--color-text-primary)]"
        }`}>
          {esEntrada && "+"}{formatMonto(registro.monto, simbolo)}
        </span>
      </div>
    </button>
  );
}
