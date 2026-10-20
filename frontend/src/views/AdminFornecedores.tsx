"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { DEFAULT_PREPARATION_FLOW, type Supplier } from "@/lib/data"
import { OrderStepper } from "@/components/OrderStepper"
import { StatusPill } from "@/components/Shared"

const FLOW_PRESETS: { name: string; stages: string[] }[] = [
  {
    name: "Padrão",
    stages: ["Confirmado", "Em separação", "Pronto para retirada", "Entregue"],
  },
  {
    name: "Confecção & Vestuário",
    stages: [
      "Confirmado",
      "Corte & Modelagem",
      "Estamparia / Bordado",
      "Controle de Qualidade",
      "Pronto para retirada",
      "Entregue",
    ],
  },
  {
    name: "Gráfica & Impressão",
    stages: [
      "Confirmado",
      "Prova de Impressão",
      "Impressão & Acabamento",
      "Pronto para retirada",
      "Entregue",
    ],
  },
  {
    name: "Brindes & Acessórios",
    stages: [
      "Confirmado",
      "Separação de Lote",
      "Gravação / Embalagem",
      "Pronto para retirada",
      "Entregue",
    ],
  },
]

function blankSupplier(): Supplier {
  return {
    id: "",
    name: "",
    pickupLocation: "",
    contact: "",
    preparationFlow: [...DEFAULT_PREPARATION_FLOW],
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function AdminFornecedores() {
  const {
    suppliers,
    products,
    orders,
    addSupplier,
    updateSupplier,
    removeSupplier,
    updateSupplierStage,
    updateFulfillmentStatus,
  } = useStore()

  const [draft, setDraft] = useState<Supplier | null>(null)
  const [expandedOrdersSupplierId, setExpandedOrdersSupplierId] = useState<string | null>(null)
  const [syncOnStageChange, setSyncOnStageChange] = useState<Record<string, boolean>>({})

  const isNew = draft !== null && !suppliers.some((s) => s.id === draft.id)

  function startEdit(s: Supplier) {
    setDraft({ ...s, preparationFlow: [...s.preparationFlow] })
  }

  function saveSupplier() {
    if (!draft || !draft.name.trim() || !draft.pickupLocation.trim()) return

    const cleanId = draft.id || slugify(draft.name) || `fornecedor-${Date.now()}`
    const cleanFlow =
      draft.preparationFlow.length > 0 ? draft.preparationFlow : [...DEFAULT_PREPARATION_FLOW]

    const payload: Supplier = {
      ...draft,
      id: cleanId,
      name: draft.name.trim(),
      pickupLocation: draft.pickupLocation.trim(),
      contact: draft.contact?.trim() || undefined,
      preparationFlow: cleanFlow,
    }

    if (isNew) {
      addSupplier(payload)
    } else {
      updateSupplier(payload)
    }
    setDraft(null)
  }

  function handleDeleteSupplier(id: string, name: string) {
    const productsCount = products.filter((p) => p.supplierId === id).length
    let msg = `Tem certeza que deseja remover o fornecedor "${name}"?`
    if (productsCount > 0) {
      msg += `\nAtenção: Existem ${productsCount} produto(s) vinculados a este fornecedor.`
    }
    if (window.confirm(msg)) {
      removeSupplier(id)
      if (draft?.id === id) setDraft(null)
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-cyan">Gestão Operacional</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            Fornecedores & Fluxos
          </h1>
          <p className="mt-1 text-sm text-muted">
            Gerencie fornecedores parceiros, seus locais de retirada e customize as etapas
            do fluxo de preparação de cada um.
          </p>
        </div>
        {!draft && (
          <button
            onClick={() => setDraft(blankSupplier())}
            className="rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
          >
            + Novo Fornecedor
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-panel p-4">
          <p className="label text-muted">Fornecedores Cadastrados</p>
          <p className="mt-2 font-mono text-2xl text-cyan">{suppliers.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-4">
          <p className="label text-muted">Produtos no Catálogo</p>
          <p className="mt-2 font-mono text-2xl text-fg">{products.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-4">
          <p className="label text-muted">Pedidos Ativos</p>
          <p className="mt-2 font-mono text-2xl text-cyan">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-4">
          <p className="label text-muted">Etapas Médias de Fluxo</p>
          <p className="mt-2 font-mono text-2xl text-fg">
            {suppliers.length > 0
              ? (
                  suppliers.reduce((s, sup) => s + sup.preparationFlow.length, 0) /
                  suppliers.length
                ).toFixed(1)
              : "0"}
          </p>
        </div>
      </div>

      {/* Form for adding a brand new supplier (appears at top when clicking + Novo Fornecedor) */}
      {draft && isNew && (
        <div className="mt-8">
          <SupplierEditorCard
            draft={draft}
            setDraft={setDraft}
            onSave={saveSupplier}
            onCancel={() => setDraft(null)}
            isNew={true}
          />
        </div>
      )}

      {/* Supplier Cards List */}
      <div className="mt-10 space-y-6">
        {suppliers.map((supplier) => {
          const supplierProducts = products.filter((p) => p.supplierId === supplier.id)
          const supplierFulfillments = orders.flatMap((o) =>
            o.fulfillments
              .filter((f) => f.supplierId === supplier.id)
              .map((f) => ({ order: o, fulfillment: f })),
          )
          const isManagingOrders = expandedOrdersSupplierId === supplier.id
          const isEditingThisSupplier = draft !== null && draft.id === supplier.id

          return (
            <div key={supplier.id} className="space-y-4">
              {/* Main Supplier Card */}
              <div
                className={`rounded-2xl border bg-panel p-6 transition-all ${
                  isEditingThisSupplier
                    ? "border-cyan/70 shadow-[0_0_20px_rgba(34,224,238,0.12)]"
                    : "border-line hover:border-line/90"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-2xl font-bold">{supplier.name}</h2>
                      <span className="font-mono text-xs text-muted">ID: {supplier.id}</span>
                      {isEditingThisSupplier && (
                        <span className="rounded-full border border-cyan/40 bg-cyan/10 px-2 py-0.5 font-mono text-[10px] text-cyan uppercase font-bold">
                          Editando abaixo
                        </span>
                      )}
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-sm text-cyan">
                      <span>📍</span>
                      <span>Retirada: {supplier.pickupLocation}</span>
                    </p>

                    {supplier.contact && (
                      <p className="mt-0.5 text-xs text-muted">Contato: {supplier.contact}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedOrdersSupplierId(
                          isManagingOrders ? null : supplier.id,
                        )
                      }
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        isManagingOrders
                          ? "border-cyan bg-cyan/10 text-cyan"
                          : "border-line text-muted hover:border-cyan hover:text-cyan"
                      }`}
                    >
                      {isManagingOrders
                        ? "Ocultar Pedidos"
                        : `Pedidos Ativos (${supplierFulfillments.length})`}
                    </button>
                    <button
                      onClick={() => (isEditingThisSupplier ? setDraft(null) : startEdit(supplier))}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        isEditingThisSupplier
                          ? "border-cyan bg-cyan text-ink"
                          : "border-line text-fg hover:border-cyan hover:text-cyan"
                      }`}
                    >
                      {isEditingThisSupplier ? "Fechar Edição ▲" : "Editar Fornecedor & Fluxo ▼"}
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                      className="rounded-xl border border-red-400/40 px-3.5 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-400/10"
                    >
                      Remover
                    </button>
                  </div>
                </div>

                {/* Visual Workflow — Estágio Atual + Stepper */}
                <div className="mt-6 rounded-xl border border-line/60 bg-ink/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="label text-muted">
                        Fluxo de Preparamento ({supplier.preparationFlow.length} etapas)
                      </span>
                    </div>
                    <span className="text-[11px] text-muted">
                      {supplierProducts.length} produtos cadastrados
                    </span>
                  </div>

                  {/* Controle de Estágio Atual */}
                  <div className="mb-4 rounded-lg border border-cyan/20 bg-cyan/5 p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-cyan shrink-0"
                        >
                          <path d="M12 3v3m0 12v3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M3 12h3m12 0h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                        <span className="label text-cyan text-[11px]">Estágio Global do Fornecedor</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={supplier.currentStage ?? supplier.preparationFlow[0] ?? ""}
                          onChange={(e) =>
                            updateSupplierStage(
                              supplier.id,
                              e.target.value,
                              syncOnStageChange[supplier.id] ?? false,
                            )
                          }
                          className="rounded-lg border border-cyan/40 bg-ink px-3 py-1.5 font-mono text-xs text-cyan outline-none focus:border-cyan"
                        >
                          {supplier.preparationFlow.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>

                        {/* Botões de atalho: Anterior / Próximo */}
                        <button
                          type="button"
                          title="Etapa anterior"
                          disabled={
                            supplier.preparationFlow.indexOf(
                              supplier.currentStage ?? supplier.preparationFlow[0],
                            ) <= 0
                          }
                          onClick={() => {
                            const cur = supplier.currentStage ?? supplier.preparationFlow[0]
                            const idx = supplier.preparationFlow.indexOf(cur)
                            if (idx > 0)
                              updateSupplierStage(
                                supplier.id,
                                supplier.preparationFlow[idx - 1],
                                syncOnStageChange[supplier.id] ?? false,
                              )
                          }}
                          className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-cyan hover:text-cyan disabled:opacity-30"
                        >
                          ← Anterior
                        </button>
                        <button
                          type="button"
                          title="Próxima etapa"
                          disabled={
                            supplier.preparationFlow.indexOf(
                              supplier.currentStage ?? supplier.preparationFlow[0],
                            ) >= supplier.preparationFlow.length - 1
                          }
                          onClick={() => {
                            const cur = supplier.currentStage ?? supplier.preparationFlow[0]
                            const idx = supplier.preparationFlow.indexOf(cur)
                            if (idx < supplier.preparationFlow.length - 1)
                              updateSupplierStage(
                                supplier.id,
                                supplier.preparationFlow[idx + 1],
                                syncOnStageChange[supplier.id] ?? false,
                              )
                          }}
                          className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-cyan hover:text-cyan disabled:opacity-30"
                        >
                          Próximo →
                        </button>
                      </div>
                    </div>

                    {/* Opção de sincronização com pedidos */}
                    <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-xs text-muted">
                      <input
                        type="checkbox"
                        checked={syncOnStageChange[supplier.id] ?? false}
                        onChange={(e) =>
                          setSyncOnStageChange((prev) => ({
                            ...prev,
                            [supplier.id]: e.target.checked,
                          }))
                        }
                        className="size-3.5 accent-cyan"
                      />
                      <span>
                        Sincronizar automaticamente todos os pedidos ativos deste fornecedor ao mudar o estágio
                      </span>
                    </label>
                  </div>

                  {/* Stepper visual mostrando o estágio atual */}
                  <OrderStepper
                    status={supplier.currentStage ?? supplier.preparationFlow[0] ?? "Confirmado"}
                    stages={supplier.preparationFlow}
                  />
                </div>

                {/* Sub-panel: Manage Active Orders along this flow */}
                {isManagingOrders && (
                  <div className="mt-5 rounded-xl border border-cyan/30 bg-ink/80 p-4">
                    <div className="flex items-center justify-between border-b border-line pb-3">
                      <p className="label text-cyan">
                        Atualizar Status dos Pedidos — {supplier.name}
                      </p>
                      <span className="font-mono text-xs text-muted">
                        {supplierFulfillments.length} pedidos pendentes
                      </span>
                    </div>

                    {supplierFulfillments.length === 0 ? (
                      <p className="py-6 text-center text-xs text-muted">
                        Nenhum pedido pendente para este fornecedor no momento.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {supplierFulfillments.map(({ order, fulfillment }, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel p-3 text-sm"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-cyan">
                                  {order.id}
                                </span>
                                <span className="text-xs text-muted">({order.buyer})</span>
                                <StatusPill status={fulfillment.status} />
                              </div>
                              <p className="mt-1 text-xs text-muted">
                                {fulfillment.items
                                  .map((i) => `${i.name} (x${i.qty})`)
                                  .join(", ")}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted">Avançar etapa:</span>
                              <select
                                value={fulfillment.status}
                                onChange={(e) =>
                                  updateFulfillmentStatus(
                                    order.id,
                                    supplier.id,
                                    e.target.value,
                                  )
                                }
                                className="rounded-lg border border-line bg-ink px-2.5 py-1 font-mono text-xs text-fg outline-none focus:border-cyan"
                              >
                                {supplier.preparationFlow.map((stage) => (
                                  <option key={stage} value={stage}>
                                    {stage}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARD DE EDIÇÃO DO FORNECEDOR (aparece diretamente embaixo do card correspondente) */}
              {isEditingThisSupplier && (
                <div className="ml-2 border-l-2 border-cyan/60 pl-3 sm:ml-4 sm:pl-4">
                  <SupplierEditorCard
                    draft={draft}
                    setDraft={setDraft}
                    onSave={saveSupplier}
                    onCancel={() => setDraft(null)}
                    isNew={false}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SupplierEditorCard({
  draft,
  setDraft,
  onSave,
  onCancel,
  isNew,
}: {
  draft: Supplier
  setDraft: (s: Supplier) => void
  onSave: () => void
  onCancel: () => void
  isNew?: boolean
}) {
  const [newStageInput, setNewStageInput] = useState("")

  function addStageToDraft() {
    if (!newStageInput.trim()) return
    const stage = newStageInput.trim()
    if (draft.preparationFlow.includes(stage)) {
      alert("Esta etapa já existe no fluxo.")
      return
    }
    setDraft({
      ...draft,
      preparationFlow: [...draft.preparationFlow, stage],
    })
    setNewStageInput("")
  }

  function removeStageFromDraft(index: number) {
    if (draft.preparationFlow.length <= 2) {
      alert("O fluxo precisa de no mínimo 2 etapas (ex.: Início e Conclusão).")
      return
    }
    setDraft({
      ...draft,
      preparationFlow: draft.preparationFlow.filter((_, i) => i !== index),
    })
  }

  function moveStage(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= draft.preparationFlow.length) return

    const newStages = [...draft.preparationFlow]
    const temp = newStages[index]
    newStages[index] = newStages[target]
    newStages[target] = temp
    setDraft({ ...draft, preparationFlow: newStages })
  }

  function applyPreset(presetStages: string[]) {
    setDraft({ ...draft, preparationFlow: [...presetStages] })
  }

  return (
    <div className="rounded-2xl border border-cyan/40 bg-panel-2 p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="label text-cyan">{isNew ? "Novo Fornecedor" : "Editando Fornecedor"}</p>
          <h2 className="font-display text-xl font-bold">
            {draft.name.trim() ? draft.name : "Cadastro de Parceiro"}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-muted hover:text-fg"
        >
          ✕ Fechar
        </button>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        {/* Left: Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted">Nome do Fornecedor *</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ex.: Confecções Alagoas"
              className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none focus:border-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted">
              Local de Retirada do Aluno *
            </label>
            <input
              type="text"
              value={draft.pickupLocation}
              onChange={(e) => setDraft({ ...draft, pickupLocation: e.target.value })}
              placeholder="Ex.: Sala do DIACOM — Bloco 4 ou Gráfica Central"
              className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none focus:border-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted">
              Contato / Responsável (Opcional)
            </label>
            <input
              type="text"
              value={draft.contact ?? ""}
              onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
              placeholder="Ex.: contato@fornecedor.com ou (82) 99999-9999"
              className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none focus:border-cyan"
            />
          </div>

          {/* Presets */}
          <div className="pt-2">
            <span className="label text-muted">Modelos Prontos de Fluxo</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {FLOW_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p.stages)}
                  className="rounded-lg border border-line bg-ink px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-cyan hover:text-cyan"
                >
                  {p.name} ({p.stages.length} etapas)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preparation Flow Builder */}
        <div>
          <div className="flex items-center justify-between">
            <span className="label text-cyan">
              Fluxo de Preparamento ({draft.preparationFlow.length} etapas)
            </span>
            <span className="text-[11px] text-muted">Sequência do pedido</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Adicione, remova ou reordene as etapas que o cliente verá no acompanhamento de pedidos
            deste fornecedor.
          </p>

          {/* Add Stage Input */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newStageInput}
              onChange={(e) => setNewStageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addStageToDraft()
                }
              }}
              placeholder="Nova etapa (ex.: Embalagem, Gravação a laser)"
              className="flex-1 rounded-xl border border-line bg-ink px-3.5 py-2 text-sm text-fg outline-none focus:border-cyan"
            />
            <button
              type="button"
              onClick={addStageToDraft}
              className="rounded-xl border border-cyan/40 bg-cyan/10 px-3.5 py-2 text-xs font-semibold text-cyan hover:bg-cyan/20"
            >
              + Adicionar
            </button>
          </div>

          {/* Stage List */}
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-line bg-ink/60 p-2.5">
            {draft.preparationFlow.map((stage, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 rounded-lg border border-line bg-panel p-2.5 transition-colors hover:border-line/90"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cyan/10 font-mono text-xs font-semibold text-cyan">
                    {idx + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-fg">{stage}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStage(idx, "up")}
                    disabled={idx === 0}
                    className="rounded p-1 text-xs text-muted hover:text-fg disabled:opacity-30"
                    title="Mover para cima"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStage(idx, "down")}
                    disabled={idx === draft.preparationFlow.length - 1}
                    className="rounded p-1 text-xs text-muted hover:text-fg disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStageFromDraft(idx)}
                    className="ml-1 rounded px-2 py-0.5 text-xs text-red-400 hover:bg-red-400/10"
                    title="Remover etapa"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Live Preview Stepper */}
          <div className="mt-4 rounded-xl border border-line/60 bg-ink/40 p-3">
            <span className="label text-[10px] text-muted">Prévia do Stepper</span>
            <div className="mt-2">
              <OrderStepper
                status={draft.preparationFlow[0] ?? "Confirmado"}
                stages={draft.preparationFlow}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-muted"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!draft.name.trim() || !draft.pickupLocation.trim()}
          className="rounded-xl bg-cyan px-6 py-2 text-sm font-bold text-ink transition-colors hover:bg-[#5cebf5] disabled:opacity-40"
        >
          {isNew ? "Criar Fornecedor" : "Salvar Alterações"}
        </button>
      </div>
    </div>
  )
}
