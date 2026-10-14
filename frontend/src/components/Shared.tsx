"use client"
import { type ReactNode } from "react"
import { brl, type EffectivePrice } from "@/lib/data"

export function Stat({
  label,
  value,
  accent,
  big,
  sub,
}: {
  label: string
  value: string
  accent?: boolean
  big?: boolean
  sub?: string
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        big ? "border-cyan/40 bg-cyan/5" : "border-line bg-panel"
      }`}
    >
      <p className="label text-muted">{label}</p>
      <p
        className={`mt-2 font-mono ${big ? "text-2xl" : "text-xl"} ${
          accent || big ? "text-cyan" : "text-fg"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  )
}

export function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${accent ? "text-cyan" : "text-fg"}`}>
        {value}
      </span>
    </div>
  )
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Concluído: "border-cyan/40 text-cyan",
    Processando: "border-amber-400/40 text-amber-300",
    Estornado: "border-red-400/40 text-red-300",
    Confirmado: "border-muted/40 text-muted",
    "Em separação": "border-amber-400/40 text-amber-300",
    "Pronto para retirada": "border-cyan/40 text-cyan",
    Entregue: "border-emerald-400/40 text-emerald-300",
  }
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${
        map[status] ?? "border-line text-muted"
      }`}
    >
      {status}
    </span>
  )
}

export function QtyBtn({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="grid size-6 place-items-center rounded-md border border-line text-muted hover:border-cyan hover:text-cyan"
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string
  placeholder?: string
  value?: string | number
  onChange?: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="label text-muted">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm outline-none placeholder:text-muted/60 focus:border-cyan"
      />
    </label>
  )
}

export function PriceTag({ price }: { price: EffectivePrice }) {
  if (!price.promo) {
    return <p className="font-mono text-cyan">{brl(price.current)}</p>
  }
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1.5">
        <span className="rounded bg-cyan px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
          −{price.promo.discountPct}%
        </span>
        <span className="font-mono text-xs text-muted line-through">
          {brl(price.original)}
        </span>
      </div>
      <span className="font-mono text-cyan">{brl(price.current)}</span>
    </div>
  )
}

export function PinBadge({ pin }: { pin: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-dashed border-cyan/50 bg-cyan/5 px-3 py-1.5">
      <span className="label text-muted">PIN retirada</span>
      <span className="font-mono text-base font-semibold tracking-[0.3em] text-cyan">
        {pin}
      </span>
    </div>
  )
}

export function CartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H5" />
    </svg>
  )
}
