"use client"
import { useEffect, useState } from "react"
import { OFFER_DEADLINE } from "@/lib/data"

export function useCountdown(target: string) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s, ended: diff === 0 }
}

export function OfferDeadline({ onGoLoja }: { onGoLoja?: () => void }) {
  const { d, h, m, s, ended } = useCountdown(OFFER_DEADLINE)
  const deadline = new Date(OFFER_DEADLINE).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  })
  const parts: [string, number][] = [
    ["dias", d],
    ["h", h],
    ["min", m],
    ["seg", s],
  ]
  return (
    <div className="overflow-hidden rounded-2xl border border-cyan/30 bg-linear-to-r from-cyan/10 to-transparent p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label text-cyan">Campanha de encomendas · Loja DIACOM</p>
          <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight">
            {ended ? "Prazo encerrado" : "Pedidos abertos até " + deadline}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {ended
              ? "As encomendas desta leva foram fechadas para produção."
              : "Feche seu pedido antes do prazo para entrar no lote de produção."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {ended ? (
            <span className="rounded-xl border border-line px-4 py-3 font-mono text-sm text-muted">
              00 : 00 : 00
            </span>
          ) : (
            parts.map(([label, val]) => (
              <div
                key={label}
                className="min-w-14 rounded-xl border border-line bg-panel px-3 py-2 text-center"
              >
                <div className="font-mono text-xl font-semibold text-cyan tabular-nums">
                  {String(val).padStart(2, "0")}
                </div>
                <div className="label text-muted">{label}</div>
              </div>
            ))
          )}
          {!ended && onGoLoja && (
            <button
              onClick={onGoLoja}
              className="ml-1 rounded-xl bg-cyan px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
            >
              Fazer pedido
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
