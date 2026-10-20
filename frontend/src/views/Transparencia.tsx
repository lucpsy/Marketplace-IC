"use client"

import { useState } from "react"
import { useStore, type Role } from "@/lib/store"
import { brl, type Txn } from "@/lib/data"
import { Stat, StatusPill } from "@/components/Shared"
import { OfferDeadline } from "@/components/OfferDeadline"
import { useRouter } from "next/navigation"

const VALIDATOR_PRESETS = [
  { name: "Lucas Amorim", role: "Diretor Financeiro DIACOM" },
  { name: "Prof. Dr. Willy Tiengo", role: "Coordenação de Computação" },
  { name: "Conselho Fiscal DIACOM", role: "Auditoria Estudantil" },
  { name: "Profa. Dra. Raquel Cabral", role: "Comitê de Ética e Transparência" },
]

export function Transparencia() {
  const router = useRouter()
  const onGoLoja = () => router.push("/")
  const { txns, role, addRepasse, removeTxn } = useStore()

  const [filter, setFilter] = useState<
    "Todos" | "Vendas" | "Custo" | "Repasse" | "Taxa"
  >("Todos")

  // Repasse Modal / Form state
  const [showRepasseModal, setShowRepasseModal] = useState(false)
  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [method, setMethod] = useState<"Pix" | "Cartão" | "Dinheiro">("Pix")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [validatorName, setValidatorName] = useState("")
  const [validatorRole, setValidatorRole] = useState("")
  const [status, setStatus] = useState<"Concluído" | "Processando">("Concluído")

  const entradas = txns
    .filter((t) => t.amount > 0 && t.status !== "Estornado")
    .reduce((s, t) => s + t.amount, 0)
  const saidas = txns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const saldo = entradas + saidas
  const pedidos = new Set(txns.filter((t) => t.order !== "—").map((t) => t.order)).size

  const rows = filter === "Todos" ? txns : txns.filter((t) => t.category === filter)

  function handleAddRepasse(e: React.FormEvent) {
    e.preventDefault()
    if (!desc.trim() || !amount || +amount <= 0 || !validatorName.trim()) {
      alert("Por favor, preencha a descrição, valor e o validador do repasse.")
      return
    }

    addRepasse({
      description: desc.trim(),
      amount: +amount,
      method,
      date,
      validator: validatorName.trim(),
      validatorRole: validatorRole.trim() || "Conselho Fiscal / DIACOM",
      status,
    })

    // Reset
    setDesc("")
    setAmount("")
    setValidatorName("")
    setValidatorRole("")
    setShowRepasseModal(false)
    setFilter("Repasse")
  }

  function handleRemove(t: Txn) {
    const isRepasse = t.category === "Repasse"
    const confirmMsg = isRepasse
      ? `Deseja remover o repasse "${t.description}" (${brl(Math.abs(t.amount))})${
          t.validator ? ` validado por ${t.validator}` : ""
        }?`
      : `Deseja remover o lançamento "${t.description}" (${brl(Math.abs(t.amount))})?`

    if (window.confirm(confirmMsg)) {
      removeTxn(t.id)
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-cyan">Prestação de contas</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            Transparência
          </h1>
          <p className="max-w-md text-sm text-muted">
            Todo movimento financeiro dos pedidos e repasses da loja, com auditoria e
            validador institucional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRepasseModal(true)}
            className="flex items-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
          >
            <span>+ Novo Repasse</span>
            <span className="rounded bg-ink/20 px-1.5 py-0.5 text-[10px] font-mono font-bold">
              com Validador
            </span>
          </button>
        </div>
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

      {/* Filter Chips & Action Bar */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["Todos", "Vendas", "Taxa", "Custo", "Repasse"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === f
                  ? "border-cyan bg-cyan/10 text-cyan font-semibold"
                  : "border-line text-muted hover:text-fg"
              }`}
            >
              {f}
              {f === "Repasse" && (
                <span className="ml-1.5 font-mono text-xs opacity-75">
                  ({txns.filter((t) => t.category === "Repasse").length})
                </span>
              )}
            </button>
          ))}
        </div>

        <span className="font-mono text-xs text-muted">
          Mostrando {rows.length} lançamento{rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Modal / Form for New Repasse with Validator */}
      {showRepasseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-cyan/40 bg-panel p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <p className="label text-cyan">Novo Lançamento</p>
                <h3 className="font-display text-xl font-bold">Registrar Repasse Financeiro</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRepasseModal(false)}
                className="text-muted hover:text-fg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRepasse} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted">
                  Finalidade / Descrição do Repasse *
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ex.: Repasse p/ evento Semana da Computação ou C.A."
                  required
                  className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none focus:border-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted">Valor do Repasse (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? +e.target.value : "")}
                    placeholder="Ex.: 300.00"
                    required
                    className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none focus:border-cyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted">Método de Repasse *</label>
                  <select
                    value={method}
                    onChange={(e) =>
                      setMethod(e.target.value as "Pix" | "Cartão" | "Dinheiro")
                    }
                    className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none focus:border-cyan"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão / Débito</option>
                    <option value="Dinheiro">Dinheiro em Espécie</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted">Data do Repasse *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none focus:border-cyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted">Status</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "Concluído" | "Processando")
                    }
                    className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none focus:border-cyan"
                  >
                    <option value="Concluído">Concluído</option>
                    <option value="Processando">Processando</option>
                  </select>
                </div>
              </div>

              {/* Validator Section */}
              <div className="rounded-xl border border-cyan/30 bg-ink/70 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-cyan text-sm">🛡️</span>
                  <label className="label text-cyan font-bold">Validador Institucional *</label>
                </div>
                <p className="mt-0.5 text-[11px] text-muted">
                  Responsável formal que aprovou e auditou a liberação deste repasse.
                </p>

                <div className="mt-2.5 space-y-2.5">
                  <div>
                    <input
                      type="text"
                      value={validatorName}
                      onChange={(e) => setValidatorName(e.target.value)}
                      placeholder="Nome do validador (ex.: Prof. Dr. Willy Tiengo)"
                      required
                      className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-xs text-fg outline-none focus:border-cyan"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={validatorRole}
                      onChange={(e) => setValidatorRole(e.target.value)}
                      placeholder="Cargo / Órgão (ex.: Conselho Fiscal DIACOM)"
                      className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-xs text-fg outline-none focus:border-cyan"
                    />
                  </div>

                  {/* Preset chips */}
                  <div className="pt-1">
                    <span className="text-[10px] text-muted">Sugestões de Validadores:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {VALIDATOR_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setValidatorName(p.name)
                            setValidatorRole(p.role)
                          }}
                          className="rounded-md border border-line bg-panel px-2 py-0.5 text-[10px] text-muted hover:border-cyan hover:text-cyan"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setShowRepasseModal(false)}
                  className="rounded-xl border border-line px-4 py-2 text-sm text-fg hover:border-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan px-5 py-2 text-sm font-bold text-ink transition-colors hover:bg-[#5cebf5]"
                >
                  Registrar Repasse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-panel/30">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="label border-b border-line bg-panel text-muted">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Pedido / Ref</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Validador</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-muted">
                    Nenhuma transação encontrada nesta categoria.
                  </td>
                </tr>
              ) : (
                rows.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-line/60 bg-panel/40 transition-colors last:border-0 hover:bg-panel-2"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                      {new Date(t.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-cyan">
                      {t.order}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-fg">{t.description}</span>
                        {t.category === "Repasse" && (
                          <span className="ml-2 rounded-full border border-purple-400/40 bg-purple-400/10 px-2 py-0.2 font-mono text-[10px] text-purple-300">
                            Repasse
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Validator Column */}
                    <td className="px-4 py-3">
                      {t.validator ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs" title="Transação auditada e validada">
                            🛡️
                          </span>
                          <div>
                            <p className="font-medium text-xs text-fg leading-tight">
                              {t.validator}
                            </p>
                            {t.validatorRole && (
                              <p className="font-mono text-[10px] text-muted leading-tight">
                                {t.validatorRole}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-muted/60">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-muted">{t.method}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={t.status} />
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-mono font-medium ${
                        t.amount >= 0 ? "text-cyan" : "text-fg"
                      }`}
                    >
                      {t.amount >= 0 ? "+" : "−"}
                      {brl(Math.abs(t.amount))}
                    </td>

                    {/* Actions Column */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {t.category === "Repasse" || role === "admin" ? (
                        <button
                          onClick={() => handleRemove(t)}
                          className="rounded px-2.5 py-1 text-xs text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                          title="Remover este lançamento"
                        >
                          Remover
                        </button>
                      ) : (
                        <span className="text-muted/40 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        Documentos, atas e notas fiscais completas disponíveis na sede do DIACOM mediante
        solicitação na Ouvidoria Estudantil. Repasses contam com auditoria do validador designado.
      </p>
    </section>
  )
}
