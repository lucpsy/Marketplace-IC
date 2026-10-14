"use client"
import { brl } from "@/lib/data"

export type BarDatum = { label: string; value: number }

// Horizontal bars — usado para "produtos mais vendidos".
export function BarChart({
  data,
  unit = "un",
}: {
  data: BarDatum[]
  unit?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (data.length === 0)
    return <p className="text-sm text-muted">Sem dados no período.</p>
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-sm text-fg" title={d.label}>
            {d.label}
          </span>
          <div className="h-6 flex-1 overflow-hidden rounded-md bg-panel-2">
            <div
              className="flex h-full items-center justify-end rounded-md bg-cyan/80 pr-2"
              style={{ width: `${Math.max(6, (d.value / max) * 100)}%` }}
            >
              <span className="font-mono text-[11px] font-semibold text-ink">
                {d.value} {unit}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Colunas por dia — usado para arrecadação ao longo do tempo.
export function RevenueChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (data.length === 0)
    return <p className="text-sm text-muted">Sem arrecadação no período.</p>
  return (
    <div>
      <div className="flex h-44 items-end gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="group flex flex-1 flex-col items-center gap-1">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-cyan/70 transition-colors group-hover:bg-cyan"
                style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
              />
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] text-cyan opacity-0 transition-opacity group-hover:opacity-100">
                {brl(d.value)}
              </span>
            </div>
            <span className="font-mono text-[9px] text-muted">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
