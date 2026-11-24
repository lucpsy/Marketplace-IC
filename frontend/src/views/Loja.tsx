"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { OFFER_DEADLINE } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { PromoBanner } from "@/components/PromoBanner";
import { useCountdown } from "@/components/OfferDeadline";

export function Loja() {
  const { products, promotions, addToCart, offerDeadline } = useStore();
  const { ended: offerEnded } = useCountdown(offerDeadline || OFFER_DEADLINE);

  const categories = [
    "Tudo",
    ...Array.from(new Set(products.flatMap((p) => p.category ?? []))).filter(
      Boolean,
    ),
  ];

  const [cat, setCat] = useState("Tudo");

  const list =
    cat === "Tudo"
      ? products
      : products.filter((p) => (p.category ?? []).includes(cat));

  const activePromos = promotions.filter(
    (p) => p.active && p.productIds.length > 0,
  );

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <p className="label text-cyan">Vitrine</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Loja do DIACOM
        </h1>
        <p className="text-sm text-muted">
          Renda revertida para eventos e projetos do IC.
        </p>
      </div>

      {offerEnded && (
        <div className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
          ⏱️ <strong>Prazo de compras encerrado.</strong> As encomendas desta
          leva foram fechadas — novos pedidos estão temporariamente bloqueados.
        </div>
      )}

      {activePromos.length > 0 && (
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
        {list.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            promotions={promotions}
            onAdd={addToCart}
          />
        ))}
      </div>
    </section>
  );
}
