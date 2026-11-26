/* ---------------------------------------------------------------- Suppliers */

export const DEFAULT_PREPARATION_FLOW: string[] = [
  "Confirmado",
  "Em separação",
  "Pronto para retirada",
  "Entregue",
];

export type Supplier = {
  id: string;
  name: string;
  pickupLocation: string;
  contact?: string;
  preparationFlow: string[];
  currentStage?: string;
};

export const SUPPLIERS: Supplier[] = [];

export function supplierName(id: string, list?: Supplier[]) {
  const arr = list ?? SUPPLIERS;
  return arr.find((s) => s.id === id)?.name ?? id;
}

export function supplierOf(id: string, list?: Supplier[]) {
  const arr = list ?? SUPPLIERS;
  return arr.find((s) => s.id === id);
}

/* ----------------------------------------------------------------- Products */

export const MAX_PRODUCT_IMAGES = 10;

export type Product = {
  id: string;
  name: string;
  category: string[];
  supplierId: string;
  price: number;
  image: string; // capa (primeira imagem)
  images?: string[]; // galeria (até MAX_PRODUCT_IMAGES)
  badge?: string;
  stock: number;
  blurb: string;
};

// Lista de imagens do produto (capa + galeria), sem duplicatas e limitada.
export function productImages(p: Product): string[] {
  const all = [p.image, ...(p.images ?? [])].filter(Boolean);
  const unique = Array.from(new Set(all));
  return unique.slice(0, MAX_PRODUCT_IMAGES);
}

export const PRODUCTS: Product[] = [];

/* --------------------------------------------------------------- Promotions */

export type Promotion = {
  id: string;
  title: string;
  description: string;
  discountPct: number;
  productIds: string[];
  accent: string; // tailwind-ish hex for banner tint
  active: boolean;
  endsAt?: string;
};

export const PROMOTIONS: Promotion[] = [];

export type EffectivePrice = {
  current: number;
  original: number;
  promo?: Promotion;
};

export function effectivePrice(
  product: Product,
  promotions: Promotion[],
): EffectivePrice {
  const promo = promotions.find(
    (p) => p.active && p.productIds.includes(product.id),
  );
  if (!promo) return { current: product.price, original: product.price };
  const current = +(product.price * (1 - promo.discountPct / 100)).toFixed(2);
  return { current, original: product.price, promo };
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(input, {
    credentials: "include",
    ...init,
  });
}

export function isSafeHref(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(trimmed)) {
    return true;
  }
  return false;
}

export function resolveAssetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const normalized = url
    .trim()
    .replace(/\/api\/uploads\/comprovantes\//i, "/api/pedido/comprovantes/");

  if (!isSafeHref(normalized)) {
    return undefined;
  }

  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:image/")) {
    return normalized;
  }
  return `${API_ORIGIN}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
}

export async function fetchProtectedAssetBlobUrl(
  url: string,
): Promise<{ blobUrl: string; isPdf: boolean }> {
  if (!isSafeHref(url)) {
    throw new Error("URL de comprovante inválida.");
  }
  const res = await apiFetch(url);
  if (!res.ok) {
    throw new Error("Não foi possível carregar o comprovante.");
  }
  const blob = await res.blob();
  const isPdf =
    blob.type === "application/pdf" || /\.pdf(\?.*)?$/i.test(url);
  return { blobUrl: URL.createObjectURL(blob), isPdf };
}

/* ------------------------------------------------------------------ Coupons */

export type Coupon = {
  id?: string;
  code: string;
  kind: "percent" | "fixed" | "shipping";
  value: number;
  label: string;
  minSubtotal?: number;
};

export const COUPONS: Coupon[] = [];

/* ------------------------------------------------------------- Transactions */

export type Txn = {
  id: string;
  date: string;
  order: string;
  description: string;
  category: "Vendas" | "Taxa" | "Repasse" | "Custo" | "Reembolso";
  method: "Pix" | "Cartão" | "Dinheiro";
  amount: number; // positive = entrada, negative = saída
  status: "Concluído" | "Processando" | "Estornado";
  validator?: string; // Nome do validador (ex.: Lucas Amorim, Prof. Dr. Willy Tiengo)
  validatorRole?: string; // Cargo ou conselho validador (ex.: Conselho Fiscal DIACOM)
  comprovanteUrl?: string;
};

export const TRANSACTIONS: Txn[] = [];

/* ------------------------------------------------------------------ Pedidos */

export type OrderStatus =
  | "Aguardando confirmação"
  | "Confirmado"
  | "Em separação"
  | "Pronto para retirada"
  | "Entregue"
  | "Solicitação de reembolso"
  | "Reembolsado"
  | "Cancelado";

export const ORDER_STAGES: OrderStatus[] = [
  "Confirmado",
  "Em separação",
  "Pronto para retirada",
  "Entregue",
];

export type PaymentStatus =
  | "Aguardando comprovante"
  | "Em análise"
  | "Pago"
  | "Estorno solicitado"
  | "Estornado";

export type OrderItem = { productId?: string; name: string; qty: number };

export type Fulfillment = {
  supplierId: string;
  items: OrderItem[];
  status: OrderStatus;
};

export type Order = {
  id: string; // ex.: #DC-1043
  date: string; // ISO
  buyer: string;
  buyerId?: string; // id do MockUser comprador
  total: number;
  method: "Pix" | "Cartão" | "Dinheiro";
  pin: string; // PIN único de retirada por pedido
  status: OrderStatus;
  paymentStatus?: string;
  comprovanteUrl?: string;
  comprovanteReembolsoUrl?: string;
  motivoReembolso?: string;
  dataReembolso?: string;
  fulfillments: Fulfillment[];
};

export const INITIAL_ORDERS: Order[] = [];

// Prazo da campanha inicia fechado até o administrador definir uma data no backend.
export const OFFER_DEADLINE = "";

// Taxa artificial cobrada pelo meio de pagamento.
export const PAYMENT_FEE: Record<"Pix" | "Cartão", number> = {
  Pix: 0.01,
  Cartão: 0.04,
};

/* ------------------------------------------------------------------ Helpers */

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* --------------------------------------------------------------- Mock Users */

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: "cliente" | "admin";
  courseOrDept?: string;
};

export const MOCK_USERS: MockUser[] = [];
