"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { brl, type Promotion, type Coupon } from "@/lib/data"
import { Field } from "@/components/Shared"
import { PromoBanner } from "@/components/PromoBanner"

const ACCENTS = ["#22e0ee", "#a78bfa", "#f472b6", "#f59e0b", "#34d399"]

function blankPromo(): Promotion {
  return {
    id: "",
    title: "",
    description: "",
    discountPct: 10,
    productIds: [],
    accent: ACCENTS[0],
    active: true,
  }
}

function blankCoupon(): Coupon {
  return {
    code: "",
    kind: "percent",
    value: 10,
    label: "",
    minSubtotal: undefined,
  }
}

export function AdminPromocoes() {
  const {
    promotions,
    products,
    addPromotion,
    updatePromotion,
    removePromotion,
    coupons,
    addCoupon,
    removeCoupon,
  } = useStore()

  const [activeTab, setActiveTab] = useState<"promos" | "coupons">("promos")

  // Promotion draft state
  const [draftPromo, setDraftPromo] = useState<Promotion | null>(null)
  const isNewPromo = draftPromo !== null && !promotions.some((p) => p.id === draftPromo.id)
  const setPromoPatch = (patch: Partial<Promotion>) =>
    setDraftPromo((d) => (d ? { ...d, ...patch } : d))

  // Coupon draft state
  const [draftCoupon, setDraftCoupon] = useState<Coupon | null>(null)
  const isNewCoupon = draftCoupon !== null && !coupons.some((c) => c.code === draftCoupon.code)

  function savePromo() {
    if (!draftPromo) return
    const clean: Promotion = {
      ...draftPromo,
      id: draftPromo.id || `promo-${Date.now()}`,
      title: draftPromo.title.trim() || "Promoção",
    }
    if (isNewPromo) addPromotion(clean)
    else updatePromotion(clean)
    setDraftPromo(null)
  }

  function saveCoupon() {
    if (!draftCoupon || !draftCoupon.code.trim()) return
    const cleanCode = draftCoupon.code.trim().toUpperCase()
    const cleanLabel =
      draftCoupon.label.trim() ||
      (draftCoupon.kind === "percent"
        ? `${draftCoupon.value}% de desconto`
        : draftCoupon.kind === "fixed"
        ? `${brl(draftCoupon.value)} de desconto`
        : "Frete grátis")

    const newC: Coupon = {
      ...draftCoupon,
      code: cleanCode,
      label: cleanLabel,
      value: draftCoupon.kind === "shipping" ? 0 : Math.max(0, +draftCoupon.value || 0),
      minSubtotal: draftCoupon.minSubtotal && +draftCoupon.minSubtotal > 0 ? +draftCoupon.minSubtotal : undefined,
    }

    addCoupon(newC)
    setDraftCoupon(null)
  }

  function handleDeleteCoupon(code: string) {
    if (window.confirm(`Tem certeza que deseja remover o cupom "${code}"?`)) {
      removeCoupon(code)
    }
  }

  const validPromo =
    draftPromo && draftPromo.title.trim() && draftPromo.discountPct > 0 && draftPromo.productIds.length > 0
  const validCoupon =
    draftCoupon &&
    draftCoupon.code.trim().length >= 3 &&
    (draftCoupon.kind === "shipping" || draftCoupon.value > 0)

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-cyan">Marketing & Descontos</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            Promoções & Cupons
          </h1>
          <p className="mt-1 text-sm text-muted">
            Crie campanhas de vitrine e cupons promocionais para aplicar no checkout do carrinho.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl border border-line bg-panel p-1">
          <button
            onClick={() => setActiveTab("promos")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === "promos" ? "bg-cyan text-ink" : "text-muted hover:text-fg"
            }`}
          >
            Campanhas ({promotions.length})
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === "coupons" ? "bg-cyan text-ink" : "text-muted hover:text-fg"
            }`}
          >
            Cupons ({coupons.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAMPANHAS PROMOCIONAIS */}
      {/* ========================================================================= */}
      {activeTab === "promos" && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Campanhas Promocionais</h2>
              <p className="text-xs text-muted">Banners exibidos no topo da loja e descontos diretos nos produtos.</p>
            </div>
            {!draftPromo && (
              <button
                onClick={() => setDraftPromo(blankPromo())}
                className="rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
              >
                + Nova promoção
              </button>
            )}
          </div>

          {/* Promotion Editor */}
          {draftPromo && (
            <div className="mt-6 rounded-2xl border border-cyan/40 bg-panel p-5 shadow-xl">
              <p className="label text-cyan">{isNewPromo ? "Nova promoção" : "Editando promoção"}</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Field
                    label="Título"
                    value={draftPromo.title}
                    onChange={(v) => setPromoPatch({ title: v })}
                  />
                  <label className="block">
                    <span className="label text-muted">Descrição</span>
                    <textarea
                      value={draftPromo.description}
                      onChange={(e) => setPromoPatch({ description: e.target.value })}
                      rows={2}
                      className="mt-1 w-full resize-none rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Desconto (%)"
                      type="number"
                      value={draftPromo.discountPct}
                      onChange={(v) =>
                        setPromoPatch({ discountPct: Math.min(90, Math.max(0, +v || 0)) })
                      }
                    />
                    <label className="block">
                      <span className="label text-muted">Encerra em</span>
                      <input
                        type="date"
                        value={draftPromo.endsAt ? draftPromo.endsAt.slice(0, 10) : ""}
                        onChange={(e) =>
                          setPromoPatch({
                            endsAt: e.target.value ? `${e.target.value}T23:59:59` : undefined,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm outline-none focus:border-cyan"
                      />
                    </label>
                  </div>
                  <div>
                    <span className="label text-muted">Cor do banner</span>
                    <div className="mt-1.5 flex gap-2">
                      {ACCENTS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setPromoPatch({ accent: a })}
                          className={`size-8 rounded-full border-2 transition-transform ${
                            draftPromo.accent === a ? "scale-110 border-fg" : "border-transparent"
                          }`}
                          style={{ background: a }}
                          aria-label={a}
                        />
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={draftPromo.active}
                      onChange={(e) => setPromoPatch({ active: e.target.checked })}
                      className="size-4 accent-cyan"
                    />
                    <span className="text-sm text-fg">Ativa (aparece na loja)</span>
                  </label>
                </div>

                <div>
                  <span className="label text-muted">Produtos ({draftPromo.productIds.length})</span>
                  <div className="mt-1.5 max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-line bg-ink p-2">
                    {products.map((p) => {
                      const checked = draftPromo.productIds.includes(p.id)
                      return (
                        <label
                          key={p.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-panel-2"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setPromoPatch({
                                productIds: e.target.checked
                                  ? [...draftPromo.productIds, p.id]
                                  : draftPromo.productIds.filter((id) => id !== p.id),
                              })
                            }
                            className="size-4 accent-cyan"
                          />
                          <span className="flex-1 truncate">{p.name}</span>
                          <span className="font-mono text-xs text-muted">{brl(p.price)}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              {draftPromo.title.trim() && draftPromo.productIds.length > 0 && (
                <div className="mt-5">
                  <span className="label text-muted">Pré-visualização do Banner</span>
                  <div className="mt-1.5">
                    <PromoBanner promo={draftPromo} />
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={savePromo}
                  disabled={!validPromo}
                  className="rounded-lg bg-cyan px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5] disabled:opacity-40"
                >
                  {isNewPromo ? "Publicar" : "Salvar"}
                </button>
                <button
                  onClick={() => setDraftPromo(null)}
                  className="rounded-lg border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-muted"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Promotion Cards */}
          <div className="mt-8 space-y-4">
            {promotions.length === 0 && !draftPromo && (
              <p className="rounded-2xl border border-dashed border-line py-12 text-center text-muted">
                Nenhuma promoção cadastrada.
              </p>
            )}
            {promotions.map((p) => (
              <div key={p.id} className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 rounded-full"
                      style={{ background: p.accent }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold">{p.title}</h3>
                        <span
                          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                            p.active
                              ? "border-cyan/40 text-cyan"
                              : "border-line text-muted"
                          }`}
                        >
                          {p.active ? "ativa" : "inativa"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">
                        −{p.discountPct}% · {p.productIds.length} produtos
                        {p.endsAt &&
                          ` · até ${new Date(p.endsAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePromotion({ ...p, active: !p.active })}
                      className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg transition-colors hover:border-cyan hover:text-cyan"
                    >
                      {p.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => setDraftPromo(p)}
                      className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg transition-colors hover:border-cyan hover:text-cyan"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => removePromotion(p.id)}
                      className="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-red-400/10"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUPONS DE DESCONTO */}
      {/* ========================================================================= */}
      {activeTab === "coupons" && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Cupons de Desconto</h2>
              <p className="text-xs text-muted">
                Códigos de desconto aplicáveis no carrinho de compras pelos alunos.
              </p>
            </div>
            {!draftCoupon && (
              <button
                onClick={() => setDraftCoupon(blankCoupon())}
                className="rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
              >
                + Novo cupom
              </button>
            )}
          </div>

          {/* Coupon Form Modal/Panel */}
          {draftCoupon && (
            <div className="mt-6 rounded-2xl border border-cyan/40 bg-panel p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <p className="label text-cyan">{isNewCoupon ? "Novo Cupom" : "Editar Cupom"}</p>
                <button
                  onClick={() => setDraftCoupon(null)}
                  className="text-xs text-muted hover:text-fg"
                >
                  ✕ Fechar
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted">Código do Cupom *</label>
                  <input
                    type="text"
                    value={draftCoupon.code}
                    onChange={(e) =>
                      setDraftCoupon({ ...draftCoupon, code: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex.: PROMO2026, CALOURO10"
                    className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm uppercase text-cyan outline-none focus:border-cyan"
                  />
                  <p className="mt-1 text-[11px] text-muted">Será convertido para letras maiúsculas.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted">Tipo de Desconto *</label>
                  <select
                    value={draftCoupon.kind}
                    onChange={(e) =>
                      setDraftCoupon({
                        ...draftCoupon,
                        kind: e.target.value as "percent" | "fixed" | "shipping",
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none focus:border-cyan"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                    <option value="shipping">Frete Grátis / Retirada Zero</option>
                  </select>
                </div>

                {draftCoupon.kind !== "shipping" && (
                  <div>
                    <label className="block text-xs font-medium text-muted">
                      {draftCoupon.kind === "percent" ? "Porcentagem de Desconto (%) *" : "Valor do Desconto (R$) *"}
                    </label>
                    <input
                      type="number"
                      value={draftCoupon.value}
                      onChange={(e) =>
                        setDraftCoupon({ ...draftCoupon, value: +e.target.value || 0 })
                      }
                      min={1}
                      max={draftCoupon.kind === "percent" ? 100 : 1000}
                      className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none focus:border-cyan"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-muted">
                    Subtotal Mínimo do Pedido (R$, opcional)
                  </label>
                  <input
                    type="number"
                    value={draftCoupon.minSubtotal ?? ""}
                    onChange={(e) =>
                      setDraftCoupon({
                        ...draftCoupon,
                        minSubtotal: e.target.value ? +e.target.value : undefined,
                      })
                    }
                    placeholder="Ex.: 100 (vazio para sem mínimo)"
                    className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none focus:border-cyan"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted">
                    Rótulo / Descrição do Cupom *
                  </label>
                  <input
                    type="text"
                    value={draftCoupon.label}
                    onChange={(e) =>
                      setDraftCoupon({ ...draftCoupon, label: e.target.value })
                    }
                    placeholder="Ex.: 15% de desconto para calouros na Semana da Computação"
                    className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none focus:border-cyan"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setDraftCoupon(null)}
                  className="rounded-lg border border-line px-4 py-2 text-sm text-fg hover:border-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveCoupon}
                  disabled={!validCoupon}
                  className="rounded-lg bg-cyan px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5] disabled:opacity-40"
                >
                  Salvar Cupom
                </button>
              </div>
            </div>
          )}

          {/* Coupons List */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="flex flex-col justify-between rounded-2xl border border-line bg-panel p-4 transition-all hover:border-line/80"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-cyan">
                        {c.code}
                      </span>
                      <span className="rounded-md border border-line bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-muted uppercase">
                        {c.kind === "percent"
                          ? `${c.value}% OFF`
                          : c.kind === "fixed"
                          ? `${brl(c.value)} OFF`
                          : "FRETE GRÁTIS"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="rounded p-1 text-xs text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                      title="Remover cupom"
                    >
                      Remover
                    </button>
                  </div>

                  <p className="mt-3 text-sm font-medium text-fg">{c.label}</p>

                  {c.minSubtotal && (
                    <p className="mt-1 text-xs text-muted">
                      Válido a partir de compras de <span className="font-mono text-fg">{brl(c.minSubtotal)}</span>
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[11px] text-muted">
                  <span>Disponível no carrinho</span>
                  <span className="text-cyan font-mono">Código ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
