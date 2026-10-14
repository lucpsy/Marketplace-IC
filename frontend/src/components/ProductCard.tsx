"use client"
import { useState } from "react"
import {
  effectivePrice,
  productImages,
  supplierName,
  type Product,
  type Promotion,
} from "@/lib/data"
import { PriceTag } from "./Shared"
import { ProductGallery } from "./ProductGallery"

export function ProductCard({
  product,
  promotions,
  onAdd,
}: {
  product: Product
  promotions: Promotion[]
  onAdd: (p: Product) => void
}) {
  const price = effectivePrice(product, promotions)
  const photos = productImages(product)
  const [open, setOpen] = useState(false)

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-muted">
        <button
          onClick={() => setOpen(true)}
          className="relative aspect-[4/5] overflow-hidden bg-panel-2 text-left"
          aria-label={`Ver fotos de ${product.name}`}
        >
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {photos.length > 1 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 font-mono text-[10px] text-fg backdrop-blur">
              <PhotoIcon />
              {photos.length}
            </span>
          )}
          {price.promo ? (
            <span className="absolute left-3 top-3 rounded-full bg-cyan px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
              −{price.promo.discountPct}% · {price.promo.title}
            </span>
          ) : (
            product.badge && (
              <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan backdrop-blur">
                {product.badge}
              </span>
            )
          )}
        </button>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={() => setOpen(true)}
              className="text-left font-display text-lg font-bold leading-tight tracking-tight transition-colors hover:text-cyan"
            >
              {product.name}
            </button>
            <div className="shrink-0">
              <PriceTag price={price} />
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{product.blurb}</p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="label text-muted">{supplierName(product.supplierId)}</span>
            <button
              onClick={() => onAdd(product)}
              className="rounded-lg bg-cyan px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
            >
              Adicionar
            </button>
          </div>
        </div>
      </article>

      {open && (
        <ProductGallery
          product={product}
          promotions={promotions}
          onAdd={onAdd}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function PhotoIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20" />
    </svg>
  )
}
