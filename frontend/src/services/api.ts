import type {
  Product,
  Supplier,
  Promotion,
  Coupon,
  Order,
  Txn,
} from "@/lib/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Erro na requisição ${options?.method || "GET"} para ${endpoint} (${response.status}): ${errorText || response.statusText}`,
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (null as unknown as T);
}

export const api = {
  // --- Produtos (GET, POST, PUT, DELETE) ---
  getProducts: () => request<Product[]>("/products"),
  getProductById: (id: string) =>
    request<Product>(`/products/${encodeURIComponent(id)}`),
  createProduct: (product: Product) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
  updateProduct: (product: Product) =>
    request<Product>(`/products/${encodeURIComponent(product.id)}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),
  deleteProduct: (id: string) =>
    request<void>(`/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // --- Fornecedores (GET, POST, PUT, DELETE) ---
  getSuppliers: () => request<Supplier[]>("/suppliers"),
  createSupplier: (supplier: Supplier) =>
    request<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplier),
    }),
  updateSupplier: (supplier: Supplier) =>
    request<Supplier>(`/suppliers/${encodeURIComponent(supplier.id)}`, {
      method: "PUT",
      body: JSON.stringify(supplier),
    }),
  deleteSupplier: (id: string) =>
    request<void>(`/suppliers/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // --- Promoções (GET, POST, PUT, DELETE) ---
  getPromotions: () => request<Promotion[]>("/promotions"),
  createPromotion: (promo: Promotion) =>
    request<Promotion>("/promotions", {
      method: "POST",
      body: JSON.stringify(promo),
    }),
  updatePromotion: (promo: Promotion) =>
    request<Promotion>(`/promotions/${encodeURIComponent(promo.id)}`, {
      method: "PUT",
      body: JSON.stringify(promo),
    }),
  deletePromotion: (id: string) =>
    request<void>(`/promotions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // --- Cupons (GET, POST, DELETE) ---
  getCoupons: () => request<Coupon[]>("/coupons"),
  createCoupon: (coupon: Coupon) => {
    const formatted = { ...coupon, id: coupon.code };
    return request<Coupon>("/coupons", {
      method: "POST",
      body: JSON.stringify(formatted),
    });
  },
  deleteCoupon: (code: string) =>
    request<void>(`/coupons/${encodeURIComponent(code)}`, {
      method: "DELETE",
    }),

  // --- Pedidos (GET, POST, PUT) ---
  getOrders: () => request<Order[]>("/orders"),
  createOrder: (order: Order) =>
    request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),
  updateOrder: (order: Order) =>
    request<Order>(`/orders/${encodeURIComponent(order.id)}`, {
      method: "PUT",
      body: JSON.stringify(order),
    }),

  // --- Transações / Financeiro (GET, POST, DELETE) ---
  getTransactions: () => request<Txn[]>("/transactions"),
  createTransaction: (txn: Txn) =>
    request<Txn>("/transactions", {
      method: "POST",
      body: JSON.stringify(txn),
    }),
  deleteTransaction: (id: string) =>
    request<void>(`/transactions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // --- Usuários (GET) ---
  getUsers: () => request<MockUser[]>("/users"),
};
