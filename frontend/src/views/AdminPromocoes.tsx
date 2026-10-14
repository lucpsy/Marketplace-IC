"use client"
import { useState } from "react"
import { useStore } from "@/lib/store"
import { brl, type Promotion } from "@/lib/data"
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

export function AdminPromocoes() {
  const { promotions, products, addPromotion, updatePromotion, removePromotion } =
    useStore()
  const [draft, setDraft] = useState<Promotion | null>(null)

  const isNew = draft !== null && !promotions.some((p) => p.id === draft.id)
  const set = (patch: Partial<Promotion>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d))

  function save() {
    if (!draft) return
    const clean: Promotion = {
      ...draft,
      id: draft.id || `promo-${Date.now()}`,
      title: draft.title.trim() || "Promoção",
    }
    if (isNew) addPromotion(clean)
    else updatePromotion(clean)
    setDraft(null)
  }

  const valid = draft && draft.title.trim() && draft.discountPct > 0 && draft.productIds.length > 0

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-cyan">Marketing</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            Promoções
          </h1>
          <p className="mt-1 text-sm text-muted">
            Crie campanhas, escolha produtos e publique banners na loja.
          </p>
        </div>
        {!draft && (
          <button
            onClick={() => setDraft(blankPromo())}
            className="rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
          >
            + Nova promoção
          </button>
        )}
      </div>

      {draft && (
        <div className="mt-8 rounded-2xl border border-cyan/40 bg-panel p-5">
          <p className="label text-cyan">{isNew ? "Nova promoção" : "Editando promoção"}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Field
                label="Título"
                value={draft.title}
                onChange={(v) => set({ title: v })}
              />
              <label className="block">
                <span className="label text-muted">Descrição</span>
                <textarea
                  value={draft.description}
                  onChange={(e) => set({ description: e.target.value })}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Desconto (%)"
                  type="number"
                  value={draft.discountPct}
                  onChange={(v) => set({ discountPct: Math.min(90, Math.max(0, +v || 0)) })}
                />
                <label className="block">
                  <span className="label text-muted">Encerra em</span>
                  <input
                    type="date"
                    value={draft.endsAt ? draft.endsAt.slice(0, 10) : ""}
                    onChange={(e) =>
                      set({ endsAt: e.target.value ? `${e.target.value}T23:59:59` : undefined })
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
                      onClick={() => set({ accent: a })}
                      className={`size-8 rounded-full border-2 transition-transform ${
                        draft.accent === a ? "scale-110 border-fg" : "border-transparent"
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
                  checked={draft.active}
                  onChange={(e) => set({ active: e.target.checked })}
                  className="size-4 accent-cyan"
                />
                <span className="text-sm text-fg">Ativa (aparece na loja)</span>
              </label>
            </div>

            <div>
              <span className="label text-muted">Produtos ({draft.productIds.length})</span>
              <div className="mt-1.5 max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-line bg-ink p-2">
                {products.map((p) => {
                  const checked = draft.productIds.includes(p.id)
                  return (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-panel-2"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          set({
                            productIds: e.target.checked
                              ? [...draft.productIds, p.id]
                              : draft.productIds.filter((id) => id !== p.id),
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

          {draft.title.trim() && draft.productIds.length > 0 && (
            <div className="mt-5">
              <span className="label text-muted">Pré-visualização</span>
              <div className="mt-1.5">
                <PromoBanner promo={draft} />
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button
              onClick={save}
              disabled={!valid}
              className="rounded-lg bg-cyan px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5] disabled:opacity-40"
            >
              {isNew ? "Publicar" : "Salvar"}
            </button>
            <button
              onClick={() => setDraft(null)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 space-y-4">
        {promotions.length === 0 && !draft && (
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
                  onClick={() => setDraft(p)}
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
    </section>
  )
}
