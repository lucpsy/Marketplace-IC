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

export const SUPPLIERS: Supplier[] = [
  {
    id: "confeccoes-ic",
    name: "Confecções IC",
    pickupLocation: "Sala do DIACOM — Bloco 4",
    contact: "confeccoes@diacom.ic.ufal.br",
    preparationFlow: [
      "Confirmado",
      "Corte & Estamparia",
      "Em separação",
      "Pronto para retirada",
      "Entregue",
    ],
    currentStage: "Corte & Estamparia",
  },
  {
    id: "grafica-campus",
    name: "Gráfica Campus",
    pickupLocation: "Gráfica Central — Bloco 1",
    contact: "grafica@campus.ufal.br",
    preparationFlow: [
      "Confirmado",
      "Impressão / Acabamento",
      "Pronto para retirada",
      "Entregue",
    ],
    currentStage: "Impressão / Acabamento",
  },
  {
    id: "brindes-ufal",
    name: "Brindes UFAL",
    pickupLocation: "Centro de Convivência — Térreo",
    contact: "brindes@ufal.br",
    preparationFlow: [
      "Confirmado",
      "Em separação",
      "Pronto para retirada",
      "Entregue",
    ],
    currentStage: "Em separação",
  },
];

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

// Product photography — apparel & merch, dark tonal.
export const PRODUCTS: Product[] = [
  {
    id: "camisa-diacom",
    name: "Camisa DIACOM 2026",
    category: ["Vestuário"],
    supplierId: "confeccoes-ic",
    price: 55,
    stock: 42,
    badge: "Mais vendido",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop&auto=format",
    ],
    blurb:
      "Malha premium, estampa serigrafada com o brasão do Instituto de Computação.",
  },
  {
    id: "moletom-ic",
    name: "Moletom IC+ Canguru",
    category: ["Vestuário"],
    supplierId: "confeccoes-ic",
    price: 129,
    stock: 18,
    badge: "Edição limitada",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1614495039153-2f8c68e57bab?w=800&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=800&fit=crop&auto=format",
    ],
    blurb:
      "Flanelado interno, capuz forrado e bolso canguru. Aguenta o ar-condicionado do LabII.",
  },
  {
    id: "caneca-compila",
    name: 'Caneca "Compila na Primeira"',
    category: ["Acessórios"],
    supplierId: "brindes-ufal",
    price: 39,
    stock: 60,
    image:
      "https://i.pinimg.com/736x/f9/df/7a/f9df7a3eed23b730b2d63063b954eeca.jpg",
    blurb:
      "Porcelana 330ml. Para o café que sustenta as madrugadas de entrega.",
  },
  {
    id: "ecobag-diacom",
    name: "Ecobag DIACOM",
    category: ["Acessórios"],
    supplierId: "brindes-ufal",
    price: 32,
    stock: 55,
    image:
      "https://i.pinimg.com/736x/8c/08/e6/8c08e679951ebcd33028dc14e5726d33.jpg",
    blurb:
      "Algodão cru, alça reforçada. Leva livro, notebook e o lanche do bandejão.",
  },
  {
    id: "adesivos-pack",
    name: "Pack de Adesivos (12un)",
    category: ["Papelaria"],
    supplierId: "grafica-campus",
    price: 18,
    stock: 120,
    badge: "Novo",
    image:
      "https://i.pinimg.com/736x/8b/da/c4/8bdac4563881279b6ab376ec821b7d68.jpg",
    blurb:
      "Vinil resistente à água. Bugs, linguagens e memes de CS para o notebook.",
  },
  {
    id: "bone-icup",
    name: "Boné ICup Champions",
    category: ["Vestuário"],
    supplierId: "confeccoes-ic",
    price: 49,
    stock: 27,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop&auto=format",
    blurb: "Aba curva bordada. Comemore a taça do ICup com estilo.",
  },
  {
    id: "caderno-dev",
    name: "Caderno Dev Grid",
    category: ["Papelaria"],
    supplierId: "grafica-campus",
    price: 27,
    stock: 74,
    image:
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&h=800&fit=crop&auto=format",
    blurb:
      "Pautado em grid pontilhado, capa dura. Ideal para diagramas e pseudocódigo.",
  },
  {
    id: "garrafa-termica",
    name: "Garrafa Térmica IC 500ml",
    category: ["Acessórios"],
    supplierId: "brindes-ufal",
    price: 68,
    stock: 33,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop&auto=format",
    blurb:
      "Inox parede dupla, mantém gelado por 12h. Gravação a laser do logo.",
  },
];

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

export const PROMOTIONS: Promotion[] = [
  {
    id: "promo-semana-comp",
    title: "Semana da Computação",
    description:
      "Vista o IC com estilo: vestuário oficial com desconto especial.",
    discountPct: 25,
    productIds: ["camisa-diacom", "moletom-ic", "bone-icup"],
    accent: "#22e0ee",
    active: true,
    endsAt: "2026-09-20T23:59:59",
  },
];

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

export const MOCK_USERS: MockUser[] = [
  {
    id: "u-cliente",
    name: "Lucas Tenório",
    email: "aluno@ic.ufal.br",
    role: "cliente",
    courseOrDept: "Ciência da Computação (2023.1)",
  },
  {
    id: "u-admin",
    name: "Coordenação DIACOM",
    email: "admin@diacom.ic.ufal.br",
    role: "admin",
    courseOrDept: "Diretoria Executiva / DIACOM",
  },
];
