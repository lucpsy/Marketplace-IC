"use client"
import { useState } from "react"
import { useStore } from "@/lib/store"
import { brl } from "@/lib/data"
import { Stat, StatusPill } from "@/components/Shared"
import { OfferDeadline } from "@/components/OfferDeadline"
import { useRouter } from "next/navigation"

export function Transparencia() {
  const router = useRouter()
  const onGoLoja = () => router.push("/")
  const { txns } = useStore()
  const [filter, setFilter] = useState<
    "Todos" | "Vendas" | "Custo" | "Repasse" | "Taxa"
  >("Todos")

  const entradas = txns
    .filter((t) => t.amount > 0 && t.status !== "Estornado")
    .reduce((s, t) => s + t.amount, 0)
  const saidas = txns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const saldo = entradas + saidas
  const pedidos = new Set(txns.filter((t) => t.order !== "—").map((t) => t.order)).size

  const rows = filter === "Todos" ? txns : txns.filter((t) => t.category === filter)

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <p className="label text-cyan">Prestação de contas</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Transparência
        </h1>
        <p className="max-w-sm text-sm text-muted">
          Todo movimento financeiro dos pedidos da loja, atualizado a cada venda.
        </p>
      </div>

      <div className="mt-8">
        <OfferDeadline onGoLoja={onGoLoja} />
      </div>

      <div className="mt-12 mb-6 flex items-center justify-between">
        <p className="label text-muted">Fluxo financeiro</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Entradas" value={brl(entradas)} accent />
        <Stat label="Saídas" value={brl(saidas)} />
        <Stat label="Saldo em caixa" value={brl(saldo)} big />
        <Stat label="Pedidos" value={String(pedidos)} />
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {(["Todos", "Vendas", "Taxa", "Custo", "Repasse"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === f
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-line text-muted hover:text-fg"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="label border-b border-line bg-panel text-muted">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-line/60 bg-panel/40 transition-colors last:border-0 hover:bg-panel-2"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                    {new Date(t.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-cyan">
                    {t.order}
                  </td>
                  <td className="px-4 py-3">{t.description}</td>
                  <td className="px-4 py-3 text-muted">{t.method}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={t.status} />
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-mono ${
                      t.amount >= 0 ? "text-cyan" : "text-fg"
                    }`}
                  >
                    {t.amount >= 0 ? "+" : "−"}
                    {brl(Math.abs(t.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">
        Documentos e notas fiscais completas disponíveis na sede do DIACOM mediante
        solicitação na Ouvidoria.
      </p>
    </section>
  )
}
