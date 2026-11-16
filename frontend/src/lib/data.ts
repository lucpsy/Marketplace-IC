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
  image: string; // capa
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

/* ------------------------------------------------------------------ Coupons */

export type Coupon = {
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
  category: "Vendas" | "Taxa" | "Repasse" | "Custo";
  method: "Pix" | "Cartão" | "Dinheiro";
  amount: number; // positive = entrada, negative = saída
  status: "Concluído" | "Processando" | "Estornado";
  validator?: string; // Nome do validador (ex.: Lucas Amorim, Prof. Dr. Willy Tiengo)
  validatorRole?: string; // Cargo ou conselho validador (ex.: Conselho Fiscal DIACOM)
};

export const TRANSACTIONS: Txn[] = [];

/* ------------------------------------------------------------------ Pedidos */

export type OrderStatus =
  | "Confirmado"
  | "Em separação"
  | "Pronto para retirada"
  | "Entregue";

export const ORDER_STAGES: OrderStatus[] = [
  "Confirmado",
  "Em separação",
  "Pronto para retirada",
  "Entregue",
];

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
  fulfillments: Fulfillment[];
};

export const INITIAL_ORDERS: Order[] = [];

// Prazo da campanha de ofertas atual da loja (venda por encomenda).
export const OFFER_DEADLINE = "2026-09-20T23:59:59";

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

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: "cliente" | "admin";
  courseOrDept?: string;
};

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
