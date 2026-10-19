"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { PromoBanner } from "@/components/PromoBanner";
import { AdminProductCard, AddProductCard } from "@/components/ProductEditor";

export function Loja() {
  const {
    role,
    products,
    promotions,
    addToCart,
    addProduct,
    updateProduct,
    removeProduct,
  } = useStore();
  const isAdmin = role === "admin";

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

  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const createCategory = () => {
    const category = newCategory.trim();

    if (!category) {
      alert("Digite o nome da categoria.");
      return;
    }

    const alreadyExists = products.some((p) =>
      (p.category ?? []).some(
        (c) => c.trim().toLowerCase() === category.toLowerCase(),
      ),
    );

    if (alreadyExists) {
      alert("Essa categoria já existe.");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Selecione pelo menos um produto.");
      return;
    }

    const selected = products.filter((p) => selectedProducts.includes(p.id));

    selected.forEach((product) => {
      updateProduct({
        ...product,
        category: [...(product.category ?? []), category],
      });
    });

    setCat(category);
    setNewCategory("");
    setSelectedProducts([]);
    setShowCategoryManager(false);
  };

  const activePromos = promotions.filter(
    (p) => p.active && p.productIds.length > 0,
  );

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <p className="label text-cyan">
        {isAdmin ? "Gestão de catálogo" : "Vitrine"}
      </p>
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

      {isAdmin && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowCategoryManager((open) => !open)}
            className="rounded-lg border border-cyan px-4 py-2 text-sm font-semibold text-cyan transition-colors hover:bg-cyan/10"
          >
            {showCategoryManager
              ? "Fechar gerenciador"
              : "+ Gerenciar categorias"}
          </button>

          {showCategoryManager && (
            <div className="mt-4 rounded-xl border border-line bg-ink p-4">
              <h2 className="text-lg font-bold">Criar categoria</h2>

              <label className="mt-3 block">
                <span className="label text-muted">Nome da categoria</span>
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ex.: Camisetas"
                  className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
                />
              </label>

              <p className="mt-4 text-sm text-muted">
                Selecione os produtos que receberão essa categoria:
              </p>

              <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-line p-3 hover:border-cyan"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        setSelectedProducts((current) =>
                          e.target.checked
                            ? [...current, product.id]
                            : current.filter((id) => id !== product.id),
                        );
                      }}
                      className="accent-cyan"
                    />

                    <span className="text-sm">{product.name}</span>

                    <span className="ml-auto text-xs text-muted">
                      {Array.isArray(product.category)
                        ? product.category.join(", ")
                        : typeof product.category === "string" &&
                            product.category
                          ? product.category
                          : "Sem categoria"}
                    </span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={createCategory}
                disabled={!newCategory.trim()}
                className="mt-4 w-full rounded-lg bg-cyan py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5] disabled:opacity-40"
              >
                Criar categoria e atribuir
              </button>
            </div>
          )}
        </div>
      )}

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
            <ProductCard
              key={p.id}
              product={p}
              promotions={promotions}
              onAdd={addToCart}
            />
          ))
        )}
      </div>
    </section>
  );
}
