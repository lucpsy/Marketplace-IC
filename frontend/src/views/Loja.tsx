"use client"
import { useState } from "react"
import { useStore } from "@/lib/store"
import { ProductCard } from "@/components/ProductCard"
import { PromoBanner } from "@/components/PromoBanner"
import { AdminProductCard, AddProductCard } from "@/components/ProductEditor"

export function Loja() {
  const { role, products, promotions, addToCart, addProduct, updateProduct, removeProduct } =
    useStore()
  const isAdmin = role === "admin"

  const categories = ["Tudo", ...Array.from(new Set(products.map((p) => p.category)))]
  const [cat, setCat] = useState("Tudo")
  const list = cat === "Tudo" ? products : products.filter((p) => p.category === cat)

  const activePromos = promotions.filter((p) => p.active && p.productIds.length > 0)

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <p className="label text-cyan">{isAdmin ? "Gestão de catálogo" : "Vitrine"}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          {isAdmin ? "Editar loja" : "Loja do DIACOM"}
        </h1>
        <p className="text-sm text-muted">
          {isAdmin
            ? "Edite, remova ou adicione produtos ao catálogo."
            : "Renda revertida para eventos e projetos do IC."}
        </p>
      </div>

      {!isAdmin && activePromos.length > 0 && (
        <div className="mt-8 space-y-3">
          {activePromos.map((p) => (
            <PromoBanner key={p.id} promo={p} />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              cat === c
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-line text-muted hover:text-fg"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin ? (
          <>
            {list.map((p) => (
              <AdminProductCard
                key={p.id}
                product={p}
                onSave={updateProduct}
                onRemove={removeProduct}
              />
            ))}
            {cat === "Tudo" && <AddProductCard onAdd={addProduct} />}
          </>
        ) : (
          list.map((p) => (
            <ProductCard key={p.id} product={p} promotions={promotions} onAdd={addToCart} />
          ))
        )}
      </div>
    </section>
  )
}
