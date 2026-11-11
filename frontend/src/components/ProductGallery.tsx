"use client"
import { useEffect, useState } from "react"
import {
  effectivePrice,
  productImages,
  supplierName,
  type Product,
  type Promotion,
} from "@/lib/data"
import { PriceTag } from "./Shared"

export function ProductGallery({
  product,
  promotions,
  onClose,
  onAdd,
}: {
  product: Product
  promotions: Promotion[]
  onClose: () => void
  onAdd?: (p: Product) => void
}) {
  const images = productImages(product)
  const [idx, setIdx] = useState(0)
  const price = effectivePrice(product, promotions)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length)
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [images.length, onClose])

  const go = (d: number) => setIdx((i) => (i + d + images.length) % images.length)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl border border-line bg-panel shadow-2xl md:flex-row md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visualizador */}
        <div className="relative flex flex-1 flex-col justify-between bg-ink min-h-0 overflow-hidden">
          <div className="relative aspect-square w-full min-h-0 flex-1 overflow-hidden flex items-center justify-center bg-black/20">
            <img
              src={images[idx]}
              alt={`${product.name} — foto ${idx + 1}`}
              className="size-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink/70 text-fg backdrop-blur transition-colors hover:border-cyan hover:text-cyan"
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink/70 text-fg backdrop-blur transition-colors hover:border-cyan hover:text-cyan"
                  aria-label="Próxima foto"
                >
                  ›
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-2.5 py-0.5 font-mono text-[11px] text-fg backdrop-blur">
                  {idx + 1} / {images.length}
                </span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="shrink-0 flex gap-2 overflow-x-auto p-3 border-t border-line/40 bg-panel/30">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setIdx(i)}
                  className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === idx
                      ? "border-cyan ring-2 ring-cyan/30"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="flex w-full flex-col p-6 md:max-w-xs md:overflow-y-auto shrink-0">
          <div className="flex items-start justify-between gap-3">
            <p className="label text-cyan">{supplierName(product.supplierId)}</p>
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-lg text-muted hover:text-fg"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            {product.name}
          </h2>
          <div className="mt-3">
            <PriceTag price={price} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">{product.blurb}</p>
          <p className="mt-3 label text-muted">{product.stock} em estoque</p>
          {onAdd && (
            <button
              onClick={() => {
                onAdd(product)
                onClose()
              }}
              className="mt-auto w-full rounded-xl bg-cyan py-3 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
            >
              Adicionar ao carrinho
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
