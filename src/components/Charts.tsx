"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getChartColor } from "@/lib/utils";

interface DonutData {
  nombre: string;
  emoji: string;
  total: number;
  porcentaje: number;
}

export function DonutChart({ data }: { data: DonutData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="w-36 h-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={65}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={getChartColor(i)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1.5">
        {data.slice(0, 5).map((item, i) => (
          <div key={item.nombre} className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getChartColor(i) }}
            />
            <span className="text-[var(--color-text-secondary)] truncate">
              {item.emoji} {item.nombre}
            </span>
            <span className="ml-auto font-semibold text-[var(--color-text-primary)] tabular-nums">
              {item.porcentaje}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BarData {
  label: string;
  entradas: number;
  salidas: number;
}

export function BarrasChart({ data }: { data: BarData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar dataKey="entradas" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="salidas" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
