"use client"
import { useEffect, useState } from "react"
import { OFFER_DEADLINE } from "@/lib/data"
import { useStore } from "@/lib/store"

export function useCountdown(target: string) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const currentNow = now ?? (typeof window !== "undefined" ? Date.now() : 0)
  const targetTime = new Date(target).getTime()
  const diff = Math.max(0, isNaN(targetTime) ? 0 : targetTime - currentNow)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s, ended: diff === 0 }
}

export function OfferDeadline({
  onGoLoja,
  onEditDeadline,
}: {
  onGoLoja?: () => void
  onEditDeadline?: () => void
}) {
  const { offerDeadline, role } = useStore()
  const target = offerDeadline || OFFER_DEADLINE
  const { d, h, m, s, ended } = useCountdown(target)

  const dateObj = new Date(target)
  const formattedDate = isNaN(dateObj.getTime())
    ? "Data inválida"
    : dateObj.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: dateObj.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
        hour: "2-digit",
        minute: "2-digit",
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
          <div className="flex items-center gap-2">
            <p className="label text-cyan">Campanha de encomendas · Loja DIACOM</p>
            {role === "admin" && (
              <span className="rounded-full border border-cyan/40 bg-cyan/15 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan">
                Painel Admin
              </span>
            )}
          </div>
          <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight">
            {ended ? "Prazo encerrado" : "Pedidos abertos até " + formattedDate}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {ended
              ? "As encomendas desta leva foram fechadas para produção."
              : "Feche seu pedido antes do prazo para entrar no lote de produção."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

          {/* Botão de Alteração de Prazo (disponível para Admin) */}
          {role === "admin" && onEditDeadline && (
            <button
              onClick={onEditDeadline}
              className="flex items-center gap-1.5 rounded-xl border border-cyan/50 bg-cyan/15 px-3.5 py-3 text-sm font-semibold text-cyan transition-colors hover:bg-cyan/25"
              title="Configurar prazo limite de compras e pedidos"
            >
              <span>⏱️</span>
              <span>{ended ? "Reabrir Prazo" : "Alterar Prazo"}</span>
            </button>
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
