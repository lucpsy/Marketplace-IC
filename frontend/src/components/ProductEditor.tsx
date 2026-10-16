"use client";
import { useState } from "react";
import {
  MAX_PRODUCT_IMAGES,
  SUPPLIERS,
  brl,
  productImages,
  type Product,
} from "@/lib/data";
import { Field } from "./Shared";

const BLANK: Product = {
  id: "",
  name: "",
  category: ["Vestuário"],
  supplierId: SUPPLIERS[0].id,
  price: 0,
  stock: 0,
  image: "",
  images: [],
  blurb: "",
};

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Card editável de um produto existente (modo admin).
export function AdminProductCard({
  product,
  onSave,
  onRemove,
}: {
  product: Product;
  onSave: (p: Product) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(product);

  if (editing) {
    return (
      <div className="rounded-2xl border border-cyan/40 bg-panel p-4">
        <ProductForm
          value={draft}
          onChange={setDraft}
          onSubmit={() => {
            onSave(draft);
            setEditing(false);
          }}
          onCancel={() => {
            setDraft(product);
            setEditing(false);
          }}
          submitLabel="Salvar"
        />
      </div>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative aspect-video overflow-hidden bg-panel-2">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted">
            sem imagem
          </div>
        )}
        {productImages(product).length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[10px] text-fg backdrop-blur">
            {productImages(product).length} fotos
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight">
            {product.name}
          </h3>
          <span className="shrink-0 font-mono text-sm text-cyan">
            {brl(product.price)}
          </span>
        </div>
        <p className="mt-1 label text-muted">
          {product.category} · {product.stock} un
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setDraft(product);
              setEditing(true);
            }}
            className="flex-1 rounded-lg border border-line py-2 text-sm text-fg transition-colors hover:border-cyan hover:text-cyan"
          >
            Editar
          </button>
          <button
            onClick={() => onRemove(product.id)}
            className="rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-400/10"
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}

// Card para adicionar um novo produto (modo admin).
export function AddProductCard({ onAdd }: { onAdd: (p: Product) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Product>(BLANK);

  if (!open) {
    return (
      <button
        onClick={() => {
          setDraft(BLANK);
          setOpen(true);
        }}
        className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-line text-muted transition-colors hover:border-cyan hover:text-cyan"
      >
        <span className="text-center">
          <span className="block text-3xl">+</span>
          <span className="mt-1 block text-sm">Adicionar produto</span>
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan/40 bg-panel p-4">
      <ProductForm
        value={draft}
        onChange={setDraft}
        onSubmit={() => {
          const id = draft.id || slug(draft.name) || `prod-${Date.now()}`;
          onAdd({ ...draft, id });
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        submitLabel="Adicionar"
        isNew
      />
    </div>
  );
}

function ProductForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isNew,
}: {
  value: Product;
  onChange: (p: Product) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isNew?: boolean;
}) {
  const set = (patch: Partial<Product>) => onChange({ ...value, ...patch });
  const valid = value.name.trim() && value.price > 0;
  return (
    <div className="space-y-2.5">
      <p className="label text-cyan">
        {isNew ? "Novo produto" : "Editando produto"}
      </p>
      <Field
        label="Nome"
        value={value.name}
        onChange={(v) => set({ name: v })}
      />
      <div className="grid grid-cols-2 gap-2.5">
        <Field
          label="Preço (R$)"
          type="number"
          value={value.price}
          onChange={(v) => set({ price: +v || 0 })}
        />
        <Field
          label="Estoque"
          type="number"
          value={value.stock}
          onChange={(v) => set({ stock: +v || 0 })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="block">
          <span className="label text-muted">Categorias</span>

          <div className="mt-1 space-y-2">
            {(value.category ?? []).map((category, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={category}
                  onChange={(e) => {
                    const categories = [...(value.category ?? [])];
                    categories[index] = e.target.value;
                    set({ category: categories });
                  }}
                  placeholder={`Categoria ${index + 1}`}
                  className="w-full min-w-0 rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm outline-none focus:border-cyan"
                />

                <button
                  type="button"
                  onClick={() => {
                    set({
                      category: (value.category ?? []).filter(
                        (_, i) => i !== index,
                      ),
                    });
                  }}
                  className="rounded-lg border border-line px-3 text-sm text-muted transition-colors hover:border-red-400 hover:text-red-400"
                  aria-label={`Remover categoria ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                set({
                  category: [...(value.category ?? []), ""],
                });
              }}
              className="w-full rounded-lg border border-dashed border-line px-3 py-2 text-sm text-cyan transition-colors hover:border-cyan"
            >
              + Adicionar categoria
            </button>
          </div>
        </label>
        <label className="block">
          <span className="label text-muted">Fornecedor</span>
          <select
            value={value.supplierId}
            onChange={(e) => set({ supplierId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm outline-none focus:border-cyan"
          >
            {SUPPLIERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ImagesField value={value} onChange={onChange} />
      <Field
        label="Selo (opcional)"
        value={value.badge ?? ""}
        onChange={(v) => set({ badge: v || undefined })}
      />
      <label className="block">
        <span className="label text-muted">Descrição</span>
        <textarea
          value={value.blurb}
          onChange={(e) => set({ blurb: e.target.value })}
          rows={2}
          className="mt-1 w-full resize-none rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
        />
      </label>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSubmit}
          disabled={!valid}
          className="flex-1 rounded-lg bg-cyan py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5] disabled:opacity-40"
        >
          {submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Editor de várias imagens. A primeira da lista é a capa. Limite MAX_PRODUCT_IMAGES.
function ImagesField({
  value,
  onChange,
}: {
  value: Product;
  onChange: (p: Product) => void;
}) {
  // Lista unificada: capa + galeria.
  const list = [value.image, ...(value.images ?? [])].filter(Boolean);
  const canAdd = list.length < MAX_PRODUCT_IMAGES;

  function commit(next: string[]) {
    const clean = next.filter(Boolean);
    onChange({ ...value, image: clean[0] ?? "", images: clean.slice(1) });
  }

  // Trabalha sobre um espelho editável que preserva campos em branco enquanto digita.
  const draft = list.length ? list : [""];

  function update(i: number, v: string) {
    const next = [...draft];
    next[i] = v;
    commit(next);
  }
  function remove(i: number) {
    commit(draft.filter((_, idx) => idx !== i));
  }
  function add() {
    commit([...draft, ""]);
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= draft.length) return;
    const next = [...draft];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label text-muted">
          Imagens ({list.length}/{MAX_PRODUCT_IMAGES})
        </span>
        <span className="text-[11px] text-muted">1ª é a capa</span>
      </div>
      <div className="mt-1.5 space-y-2">
        {draft.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-ink">
              {url ? (
                <img src={url} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-[10px] text-muted">{i + 1}</span>
              )}
            </div>
            <input
              value={url}
              onChange={(e) => update(i, e.target.value)}
              placeholder="https://…"
              className="min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2 font-mono text-xs outline-none placeholder:text-muted/60 focus:border-cyan"
            />
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="grid size-7 place-items-center rounded-md border border-line text-muted transition-colors hover:border-cyan hover:text-cyan disabled:opacity-30"
                aria-label="Mover para cima"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid size-7 place-items-center rounded-md border border-red-400/40 text-red-300 transition-colors hover:bg-red-400/10"
                aria-label="Remover imagem"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      {canAdd && (
        <button
          type="button"
          onClick={add}
          className="mt-2 w-full rounded-lg border border-dashed border-line py-1.5 text-xs text-muted transition-colors hover:border-cyan hover:text-cyan"
        >
          + Adicionar imagem
        </button>
      )}
    </div>
  );
}
