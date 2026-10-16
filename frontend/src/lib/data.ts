/* ---------------------------------------------------------------- Suppliers */

export type Supplier = {
  id: string;
  name: string;
  pickupLocation: string;
};

export const SUPPLIERS: Supplier[] = [
  {
    id: "confeccoes-ic",
    name: "Confecções IC",
    pickupLocation: "Sala do DIACOM — Bloco 4",
  },
  {
    id: "grafica-campus",
    name: "Gráfica Campus",
    pickupLocation: "Gráfica Central — Bloco 1",
  },
  {
    id: "brindes-ufal",
    name: "Brindes UFAL",
    pickupLocation: "Centro de Convivência — Térreo",
  },
];

export function supplierName(id: string) {
  return SUPPLIERS.find((s) => s.id === id)?.name ?? id;
}

export function supplierOf(id: string) {
  return SUPPLIERS.find((s) => s.id === id);
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

export const COUPONS: Coupon[] = [
  {
    code: "CALOURO10",
    kind: "percent",
    value: 10,
    label: "10% para calouros 2026.1",
  },
  {
    code: "DIACOM15",
    kind: "percent",
    value: 15,
    label: "15% na semana da computação",
    minSubtotal: 100,
  },
  {
    code: "FRETEGRATIS",
    kind: "shipping",
    value: 0,
    label: "Retirada/entrega sem taxa",
  },
  {
    code: "MENOS20",
    kind: "fixed",
    value: 20,
    label: "R$ 20 off em compras acima de R$ 150",
    minSubtotal: 150,
  },
];

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
};

export const TRANSACTIONS: Txn[] = [
  {
    id: "t1",
    date: "2026-09-08",
    order: "#DC-1042",
    description: "Venda — Moletom IC+ (2un)",
    category: "Vendas",
    method: "Pix",
    amount: 258,
    status: "Concluído",
  },
  {
    id: "t2",
    date: "2026-09-08",
    order: "#DC-1042",
    description: "Taxa de processamento Pix",
    category: "Taxa",
    method: "Pix",
    amount: -2.58,
    status: "Concluído",
  },
  {
    id: "t3",
    date: "2026-09-07",
    order: "#DC-1041",
    description: "Venda — Camisa DIACOM (3un)",
    category: "Vendas",
    method: "Cartão",
    amount: 165,
    status: "Concluído",
  },
  {
    id: "t4",
    date: "2026-09-07",
    order: "#DC-1041",
    description: "Taxa cartão de crédito",
    category: "Taxa",
    method: "Cartão",
    amount: -6.6,
    status: "Concluído",
  },
  {
    id: "t5",
    date: "2026-09-06",
    order: "#DC-1040",
    description: "Venda — Kit calouro (caneca+adesivos)",
    category: "Vendas",
    method: "Pix",
    amount: 57,
    status: "Concluído",
  },
  {
    id: "t6",
    date: "2026-09-05",
    order: "—",
    description: "Reposição de estoque — Camisas",
    category: "Custo",
    method: "Pix",
    amount: -840,
    status: "Concluído",
  },
  {
    id: "t7",
    date: "2026-09-04",
    order: "#DC-1039",
    description: "Venda — Garrafa térmica (1un)",
    category: "Vendas",
    method: "Dinheiro",
    amount: 68,
    status: "Concluído",
  },
  {
    id: "t8",
    date: "2026-09-03",
    order: "#DC-1038",
    description: "Venda — Boné ICup (2un)",
    category: "Vendas",
    method: "Cartão",
    amount: 98,
    status: "Processando",
  },
  {
    id: "t9",
    date: "2026-09-02",
    order: "#DC-1037",
    description: "Estorno — Ecobag (defeito)",
    category: "Vendas",
    method: "Pix",
    amount: -32,
    status: "Estornado",
  },
  {
    id: "t10",
    date: "2026-09-01",
    order: "—",
    description: "Repasse p/ evento IChampions",
    category: "Repasse",
    method: "Pix",
    amount: -300,
    status: "Concluído",
  },
  {
    id: "t11",
    date: "2026-08-30",
    order: "#DC-1036",
    description: "Venda — Pack de adesivos (8un)",
    category: "Vendas",
    method: "Pix",
    amount: 144,
    status: "Concluído",
  },
  {
    id: "t12",
    date: "2026-08-29",
    order: "#DC-1035",
    description: "Venda — Cadernos Dev Grid (4un)",
    category: "Vendas",
    method: "Cartão",
    amount: 108,
    status: "Concluído",
  },
];

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
  total: number;
  method: "Pix" | "Cartão" | "Dinheiro";
  pin: string; // PIN único de retirada por pedido
  fulfillments: Fulfillment[];
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: "#DC-1042",
    date: "2026-09-08",
    buyer: "Você",
    total: 258,
    method: "Pix",
    pin: "4827",
    fulfillments: [
      {
        supplierId: "confeccoes-ic",
        items: [
          { productId: "moletom-ic", name: "Moletom IC+ Canguru", qty: 2 },
        ],
        status: "Pronto para retirada",
      },
    ],
  },
  {
    id: "#DC-1041",
    date: "2026-09-07",
    buyer: "Você",
    total: 197,
    method: "Cartão",
    pin: "1593",
    fulfillments: [
      {
        supplierId: "confeccoes-ic",
        items: [
          { productId: "camisa-diacom", name: "Camisa DIACOM 2026", qty: 3 },
        ],
        status: "Em separação",
      },
      {
        supplierId: "grafica-campus",
        items: [{ productId: "caderno-dev", name: "Caderno Dev Grid", qty: 1 }],
        status: "Confirmado",
      },
    ],
  },
  {
    id: "#DC-1039",
    date: "2026-09-04",
    buyer: "Lucas Tenório",
    total: 68,
    method: "Dinheiro",
    pin: "7210",
    fulfillments: [
      {
        supplierId: "brindes-ufal",
        items: [
          {
            productId: "garrafa-termica",
            name: "Garrafa Térmica IC 500ml",
            qty: 1,
          },
        ],
        status: "Entregue",
      },
    ],
  },
];

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
