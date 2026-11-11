"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminProductCard, AddProductCard } from "@/components/ProductEditor";

export function AdminLoja() {
  const { products, addProduct, updateProduct, removeProduct } = useStore();

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

  function createCategory() {
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
      alert("Selecione pelo menos um produto para associar à nova categoria.");
      return;
    }

    products
      .filter((p) => selectedProducts.includes(p.id))
      .forEach((product) => {
        updateProduct({
          ...product,
          category: [...(product.category ?? []), category],
        });
      });

    setCat(category);
    setNewCategory("");
    setSelectedProducts([]);
    setShowCategoryManager(false);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <p className="label text-cyan">Gestão de catálogo</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Catálogo de Produtos
          </h1>
          <p className="mt-1 text-sm text-muted">
            Edite, remova ou adicione produtos ao catálogo da loja.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCategoryManager((open) => !open)}
          className="rounded-xl border border-cyan px-4 py-2 text-sm font-semibold text-cyan transition-colors hover:bg-cyan/10"
        >
          {showCategoryManager ? "Fechar gerenciador" : "+ Gerenciar categorias"}
        </button>
      </div>

      {/* Category Manager Panel */}
      {showCategoryManager && (
        <div className="mt-6 rounded-2xl border border-line bg-panel p-5">
          <p className="label text-cyan">Nova categoria</p>
          <h2 className="mt-0.5 font-display text-lg font-bold">
            Criar e atribuir categoria
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted">
                Nome da categoria
              </label>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex.: Camisetas"
                className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={createCategory}
                disabled={!newCategory.trim() || selectedProducts.length === 0}
                className="w-full rounded-xl bg-cyan py-2.5 text-sm font-bold text-ink transition-colors hover:bg-[#5cebf5] disabled:opacity-40"
              >
                Criar categoria e atribuir
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted">
            Selecione os produtos que receberão essa categoria:
          </p>
          <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
            {products.map((product) => (
              <label
                key={product.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-cyan"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={(e) => {
                    setSelectedProducts((cur) =>
                      e.target.checked
                        ? [...cur, product.id]
                        : cur.filter((id) => id !== product.id),
                    );
                  }}
                  className="accent-cyan"
                />
                <span className="flex-1 text-sm text-fg">{product.name}</span>
                <span className="font-mono text-xs text-muted">
                  {Array.isArray(product.category)
                    ? product.category.join(", ") || "Sem categoria"
                    : product.category || "Sem categoria"}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              cat === c
                ? "border-cyan bg-cyan/10 text-cyan font-semibold"
                : "border-line text-muted hover:text-fg"
            }`}
          >
            {c}
            {c !== "Tudo" && (
              <span className="ml-1.5 font-mono text-xs opacity-60">
                ({products.filter((p) => (p.category ?? []).includes(c)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <AdminProductCard
            key={p.id}
            product={p}
            onSave={updateProduct}
            onRemove={removeProduct}
          />
        ))}
        {cat === "Tudo" && <AddProductCard onAdd={addProduct} />}
      </div>
    </section>
  );
}
