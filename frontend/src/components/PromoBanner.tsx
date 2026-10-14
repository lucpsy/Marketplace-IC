"use client"
import { type Promotion } from "@/lib/data"

export function PromoBanner({ promo }: { promo: Promotion }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line p-6"
      style={{
        background: `linear-gradient(110deg, ${promo.accent}22, transparent 65%)`,
        borderColor: `${promo.accent}55`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-ink"
              style={{ background: promo.accent }}
            >
              −{promo.discountPct}%
            </span>
            <span className="label" style={{ color: promo.accent }}>
              Promoção ativa
            </span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            {promo.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{promo.description}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-4xl font-black" style={{ color: promo.accent }}>
            -{promo.discountPct}%
          </p>
          <p className="label mt-1 text-muted">
            {promo.productIds.length} produtos
          </p>
        </div>
      </div>
    </div>
  )
}
