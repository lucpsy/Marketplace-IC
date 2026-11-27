"use client";
import { useState } from "react";
import {
  MAX_PRODUCT_IMAGES,
  brl,
  productImages,
  type Product,
} from "@/lib/data";
import { useStore } from "@/lib/store";
import { Field } from "./Shared";

const BLANK: Product = {
  id: "",
  name: "",
  category: ["Vestuário"],
  supplierId: "confeccoes-ic",
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
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel">
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
          <h3 className="line-clamp-2 font-display text-base font-bold leading-tight">
            {product.name}
          </h3>
          <span className="shrink-0 font-mono text-sm text-cyan">
            {brl(product.price)}
          </span>
        </div>
        <p className="mt-1 label text-muted">
          {Array.isArray(product.category)
            ? product.category.join(", ")
            : product.category}{" "}
          · {product.stock} un
        </p>
        <div className="mt-auto flex gap-2 pt-4">
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
  const { suppliers, categories: availableCategories } = useStore();
  const set = (patch: Partial<Product>) => onChange({ ...value, ...patch });
  const valid = value.name.trim() && value.price > 0 && value.stock >= 0;
  const selectedCategories = (value.category ?? []).filter(Boolean);

  function toggleCategory(catName: string) {
    const exists = selectedCategories.some(
      (c) => c.toLowerCase() === catName.toLowerCase(),
    );
    const next = exists
      ? selectedCategories.filter(
          (c) => c.toLowerCase() !== catName.toLowerCase(),
        )
      : [...selectedCategories, catName];
    set({ category: next });
  }
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
          onChange={(v) => set({ price: Math.max(0, +v || 0) })}
        />
        <Field
          label="Estoque"
          type="number"
          value={value.stock}
          onChange={(v) => set({ stock: Math.max(0, Math.floor(+v || 0)) })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="block">
          <span className="label text-muted">Categorias</span>

          <div className="mt-1 flex flex-wrap gap-1.5 rounded-lg border border-line bg-ink p-2">
            {availableCategories.length === 0 ? (
              <span className="text-xs text-muted">
                Nenhuma categoria cadastrada.
              </span>
            ) : (
              availableCategories.map((catName) => {
                const isSelected = selectedCategories.some(
                  (c) => c.toLowerCase() === catName.toLowerCase(),
                );
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => toggleCategory(catName)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                      isSelected
                        ? "border-cyan bg-cyan/15 font-semibold text-cyan"
                        : "border-line text-muted hover:border-cyan/60 hover:text-fg"
                    }`}
                  >
                    {catName}
                  </button>
                );
              })
            )}
          </div>
        </div>
        <label className="block">
          <span className="label text-muted">Fornecedor</span>
          <select
            value={value.supplierId}
            onChange={(e) => set({ supplierId: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm outline-none focus:border-cyan"
          >
            {suppliers.map((s) => (
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

// Editor de várias imagens por upload. A primeira da lista é a capa. Limite MAX_PRODUCT_IMAGES.
function ImagesField({
  value,
  onChange,
}: {
  value: Product;
  onChange: (p: Product) => void;
}) {
  const { uploadProdutoImagem } = useStore();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lista unificada: capa + galeria.
  const list = [value.image, ...(value.images ?? [])].filter(Boolean);
  const remaining = Math.max(0, MAX_PRODUCT_IMAGES - list.length);
  const canAdd = remaining > 0;

  function commit(next: string[]) {
    const clean = next.filter(Boolean).slice(0, MAX_PRODUCT_IMAGES);
    onChange({ ...value, image: clean[0] ?? "", images: clean.slice(1) });
  }

  function remove(i: number) {
    commit(list.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length || !canAdd) return;

    const selected = files.slice(0, remaining);
    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const file of selected) {
        const url = await uploadProdutoImagem(file);
        uploadedUrls.push(url);
      }
      commit([...list, ...uploadedUrls]);
    } catch (err: any) {
      setUploadError(err?.message || "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="label text-muted">
          Imagens ({list.length}/{MAX_PRODUCT_IMAGES})
        </span>
        <span className="text-[11px] text-muted">1ª é a capa · PNG/JPG/WEBP até 5 MB</span>
      </div>

      {list.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {list.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-ink"
            >
              <img src={url} alt="" className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-cyan px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                  Capa
                </span>
              )}
              <div className="absolute inset-x-1 bottom-1 flex justify-end gap-1">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="grid size-6 place-items-center rounded bg-ink/85 text-xs text-fg backdrop-blur transition-colors hover:text-cyan"
                    title="Mover para frente"
                    aria-label="Mover imagem para frente"
                  >
                    ↑
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="grid size-6 place-items-center rounded bg-ink/85 text-xs text-red-300 backdrop-blur transition-colors hover:bg-red-500/30"
                  title="Remover imagem"
                  aria-label="Remover imagem"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <p className="mt-1.5 text-xs text-red-400">{uploadError}</p>
      )}

      {canAdd && (
        <label
          className={`mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-line py-2.5 text-xs transition-colors ${
            uploading
              ? "cursor-wait opacity-60"
              : "text-muted hover:border-cyan hover:text-cyan"
          }`}
        >
          <span>
            {uploading
              ? "Enviando imagem..."
              : `+ Enviar imagem (${remaining} restante${remaining > 1 ? "s" : ""})`}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple={remaining > 1}
            disabled={uploading}
            onChange={handleFiles}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
