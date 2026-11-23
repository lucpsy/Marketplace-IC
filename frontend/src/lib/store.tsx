"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useEffect } from "react";
import {
  PRODUCTS,
  PROMOTIONS,
  TRANSACTIONS,
  INITIAL_ORDERS,
  SUPPLIERS,
  COUPONS,
  MOCK_USERS,
  PAYMENT_FEE,
  genPin,
  OFFER_DEADLINE,
  type Product,
  type Promotion,
  type Txn,
  type Order,
  type Fulfillment,
  type OrderItem,
  type Supplier,
  type Coupon,
  type MockUser,
} from "./data";

export type Role = "cliente" | "admin";

export type CartLine = { product: Product; qty: number };

export type CheckoutPayload = {
  items: CartLine[];
  total: number;
  method: "Pix" | "Cartão";
  couponCode?: string;
};

export type RepassePayload = {
  description: string;
  amount: number;
  method: "Pix" | "Cartão" | "Dinheiro";
  validator: string;
  validatorRole?: string;
  date?: string;
  status?: "Concluído" | "Processando";
};

type Store = {
  role: Role;
  setRole: (r: Role) => void;
  user: MockUser | null;
  login: (
    email: string,
    password?: string,
    forceRole?: Role,
  ) => Promise<boolean>;
  logout: () => void;

  offerDeadline: string;
  setOfferDeadline: (deadline: string) => void;

  products: Product[];
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;

  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  updateSupplier: (s: Supplier) => void;
  removeSupplier: (id: string) => void;
  updateSupplierStage: (
    supplierId: string,
    newStage: string,
    syncOrders?: boolean,
  ) => void;
  updateFulfillmentStatus: (
    orderId: string,
    supplierId: string,
    status: string,
  ) => void;

  coupons: Coupon[];
  addCoupon: (c: Coupon) => void;
  removeCoupon: (code: string) => void;

  promotions: Promotion[];
  addPromotion: (p: Promotion) => void;
  updatePromotion: (p: Promotion) => void;
  removePromotion: (id: string) => void;

  orders: Order[];
  txns: Txn[];
  addRepasse: (p: RepassePayload) => void;
  removeTxn: (id: string) => void;
  checkout: (p: CheckoutPayload) => Promise<{ id: string; pin: string }>;

  cart: CartLine[];
  cartCount: number;
  addToCart: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
};

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore precisa estar dentro de <AppStore>");
  return s;
}
function mapBackendOrder(raw: any): Order {
  const statusNome = (raw.status?.nome || "Confirmado") as any;
  const firstPay = Array.isArray(raw.pagamentos) ? raw.pagamentos[0] : null;
  const rawMethod = String(firstPay?.metodo || "Pix").toLowerCase();
  const method: "Pix" | "Cartão" | "Dinheiro" = rawMethod.includes("cart")
    ? "Cartão"
    : rawMethod.includes("din")
      ? "Dinheiro"
      : "Pix";

  // Agrupa itens por fornecedor usando o idFornecedor numérico do banco
  const bySupplier = new Map<string, OrderItem[]>();
  for (const item of raw.itens ?? []) {
    const supId = item.produto?.fornecedor?.idFornecedor
      ? String(item.produto.fornecedor.idFornecedor)
      : "1";
    const arr = bySupplier.get(supId) ?? [];
    arr.push({
      productId: item.produto?.idProduto
        ? String(item.produto.idProduto)
        : undefined,
      name: item.nomeProdutoSnapshot || item.produto?.nome || "Produto",
      qty: Number(item.quantidade ?? 1),
    });
    bySupplier.set(supId, arr);
  }

  const fulfillments: Fulfillment[] =
    bySupplier.size > 0
      ? Array.from(bySupplier.entries()).map(([supplierId, items]) => ({
          supplierId,
          items,
          status: statusNome,
        }))
      : [{ supplierId: "1", items: [], status: statusNome }];

  return {
    id: `#DC-${raw.idPedido}`,
    date: raw.dataPedido
      ? new Date(raw.dataPedido).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    buyer: raw.usuario?.nome || "Cliente",
    buyerId: raw.usuario?.idUsuario ? String(raw.usuario.idUsuario) : undefined,
    total: Number(raw.valorTotal ?? 0),
    method,
    pin: String(raw.idPedido).padStart(4, "0").slice(-4),
    fulfillments,
  };
}

export function AppStore({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [role, setRoleState] = useState<Role>("cliente");
  const [offerDeadline, setOfferDeadline] = useState<string>(OFFER_DEADLINE);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [products, setProducts] = useState<Product[]>([]);
  const [backendCategories, setBackendCategories] = useState<
    { idCategoria: string; nome: string }[]
  >([]);
  const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [userCarts, setUserCarts] = useState<Record<string, CartLine[]>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const nextOrderNo = useRef(1043);
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);

  /* Products */
  function buildProdutoPayload(p: Product) {
    // Garante um idFornecedor numérico válido do banco
    const validSupplier =
      suppliers.find((s) => s.id === p.supplierId) || suppliers[0];
    const idFornecedor = /^\d+$/.test(String(validSupplier?.id))
      ? String(validSupplier.id)
      : "1";

    // Mapeia os nomes das categorias para os IDs reais do banco
    const categoriaIds = (p.category ?? [])
      .map(
        (catName) =>
          backendCategories.find(
            (c) => c.nome.toLowerCase() === catName.toLowerCase(),
          )?.idCategoria,
      )
      .filter((id): id is string => Boolean(id))
      .map(String);

    // Monta o array de imagens no formato ImagemProdutoDto
    const allImgs = Array.from(
      new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
    );
    const imagens = allImgs.map((urlImagem, index) => ({
      urlImagem,
      ordem: index,
      imagemPrincipal: index === 0,
    }));

    return {
      nome: p.name,
      descricao: p.blurb || undefined,
      selo: p.badge || undefined,
      precoCusto: Number((p.price * 0.5).toFixed(2)),
      precoVenda: Number(p.price),
      estoque: Number(p.stock ?? 0),
      idFornecedor,
      categoriaIds: categoriaIds.length > 0 ? categoriaIds : undefined,
      imagens,
    };
  }

  async function addProduct(p: Product) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const payload = {
      ...buildProdutoPayload(p),
      sku: `prod-${Date.now()}`,
    };

    const res = await fetch("http://localhost:3001/api/catalogo/produtos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao cadastrar produto no banco.");
      return;
    }

    await refreshCatalog();
  }

  async function updateProduct(p: Product) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const payload = buildProdutoPayload(p);

    const res = await fetch(
      `http://localhost:3001/api/catalogo/produtos/${p.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao atualizar produto no banco.");
      return;
    }

    await refreshCatalog();
  }

  async function removeProduct(id: string) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const res = await fetch(
      `http://localhost:3001/api/catalogo/produtos/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao remover produto do banco.");
      return;
    }

    setProducts((prev) => prev.filter((x) => x.id !== id));
    setPromotions((prev) =>
      prev.map((pr) => ({
        ...pr,
        productIds: pr.productIds.filter((pid) => pid !== id),
      })),
    );
  }

  async function refreshOrders(targetRole: Role) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const endpoint =
      targetRole === "admin"
        ? "http://localhost:3001/api/pedido"
        : "http://localhost:3001/api/pedido/meus";

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      if (Array.isArray(data)) {
        const mappedOrders = data.map(mapBackendOrder);
        setOrders(mappedOrders);

        // Transforma os pedidos reais do banco em lançamentos na Transparência
        const vendasTxns: Txn[] = mappedOrders.map((o) => ({
          id: `ped-${o.id}`,
          date: o.date,
          order: o.id,
          description: `Pedido ${o.id} — ${o.buyer}`,
          category: "Vendas",
          method: o.method,
          amount: o.total,
          status: o.fulfillments.some((f) =>
            f.status.toLowerCase().includes("cancel"),
          )
            ? "Estornado"
            : "Concluído",
        }));

        setTxns((prev) => {
          const repassesLocais = prev.filter((t) => t.category === "Repasse");
          return [...vendasTxns, ...repassesLocais];
        });
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos reais:", err);
    }
  }

  async function refreshCatalog() {
    try {
      const [resProd, resCat, resForn] = await Promise.all([
        fetch("http://localhost:3001/api/catalogo/produtos"),
        fetch("http://localhost:3001/api/catalogo/categorias"),
        fetch("http://localhost:3001/api/fornecedor").catch(() => null),
      ]);

      let loadedSuppliers = suppliers;
      if (resForn && resForn.ok) {
        const forns = await resForn.json();
        if (Array.isArray(forns) && forns.length > 0) {
          loadedSuppliers = forns.map((f: any) => {
            const nome = f.nomeFantasia || f.nomeRazaoSocial;
            const mockMatch = SUPPLIERS.find(
              (s) => s.name.toLowerCase() === nome.toLowerCase(),
            );
            return {
              id: String(f.idFornecedor),
              name: nome,
              pickupLocation:
                mockMatch?.pickupLocation || "Sala do DIACOM — Bloco 4",
              contact: f.email || mockMatch?.contact,
              preparationFlow: mockMatch?.preparationFlow || [
                "Confirmado",
                "Em separação",
                "Pronto para retirada",
                "Entregue",
              ],
              currentStage: mockMatch?.currentStage || "Confirmado",
            };
          });
          setSuppliers(loadedSuppliers);
        }
      }

      if (resCat && resCat.ok) {
        const cats = await resCat.json();
        if (Array.isArray(cats)) setBackendCategories(cats);
      }

      if (resProd && resProd.ok) {
        const prods = await resProd.json();
        if (Array.isArray(prods)) {
          setProducts(
            prods.map((raw: any) => {
              const imgs = Array.isArray(raw.imagens)
                ? raw.imagens
                    .sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0))
                    .map((img: any) => img.urlImagem || img.url)
                    .filter(Boolean)
                : [];
              return {
                id: String(raw.idProduto),
                name: raw.nome,
                category: Array.isArray(raw.categorias)
                  ? raw.categorias.map((c: any) => c.nome)
                  : ["Geral"],
                supplierId: String(
                  raw.fornecedor?.idFornecedor || loadedSuppliers[0]?.id || "1",
                ),
                price: Number(raw.precoVenda ?? 0),
                stock: Number(raw.estoque ?? 0),
                badge: raw.selo || undefined,
                image:
                  imgs[0] ||
                  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&auto=format",
                images: imgs,
                blurb: raw.descricao || "",
              };
            }),
          );
        }
      }
    } catch (err) {
      console.error("Erro ao carregar catálogo:", err);
    }
  }

  useEffect(() => {
    refreshCatalog();

    try {
      const savedToken = localStorage.getItem("diacom_token");
      const savedUserRaw = localStorage.getItem("diacom_user");
      if (savedToken && savedUserRaw) {
        const parsed: MockUser = JSON.parse(savedUserRaw);
        const restoredRole: Role = parsed.role === "admin" ? "admin" : "cliente";
        setUser(parsed);
        setRoleState(restoredRole);
        refreshOrders(restoredRole);
      }
    } catch {
      localStorage.removeItem("diacom_token");
      localStorage.removeItem("diacom_user");
    }
  }, []);

  function setRole(r: Role) {
    setRoleState(r);
    if (user) {
      const matchingUser = MOCK_USERS.find((u) => u.role === r);
      if (matchingUser) {
        setUser(matchingUser);
      } else {
        setUser({ ...user, role: r });
      }
    }
  }

  async function login(
    email: string,
    password?: string,
    _forceRole?: Role,
  ): Promise<boolean> {
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha: password,
        }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      const targetRole: Role = data.user?.cargo?.toLowerCase().includes("admin")
        ? "admin"
        : "cliente";

      const authenticatedUser: MockUser = {
        id: String(data.user.id),
        name: data.user.nome,
        email: data.user.email,
        role: targetRole,
        courseOrDept:
          targetRole === "admin"
            ? "Diretoria DIACOM"
            : "Instituto de Computação",
      };

      localStorage.setItem("diacom_token", data.access_token);
      localStorage.setItem("diacom_user", JSON.stringify(authenticatedUser));

      setUser(authenticatedUser);
      setRoleState(targetRole);
      setCart(userCarts[authenticatedUser.id] ?? []);
      await refreshOrders(targetRole);
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("diacom_token");
    localStorage.removeItem("diacom_user");
    setUser(null);
    setRoleState("cliente");
    setOrders([]);
    setCart([]);
    setCartOpen(false);
  }

  /* Suppliers */
  function addSupplier(s: Supplier) {
    setSuppliers((prev) => [s, ...prev]);
  }

  function updateSupplier(s: Supplier) {
    setSuppliers((prev) => prev.map((x) => (x.id === s.id ? s : x)));
  }

  function removeSupplier(id: string) {
    setSuppliers((prev) => prev.filter((x) => x.id !== id));
  }

  /**
   * Altera o estágio global atual de um fornecedor (currentStage)
   * e, opcionalmente, sincroniza todos os fulfillments ativos daquele
   * fornecedor para o mesmo estágio — útil para avançar o batch inteiro.
   */
  function updateSupplierStage(
    supplierId: string,
    newStage: string,
    syncOrders = false,
  ) {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId ? { ...s, currentStage: newStage } : s,
      ),
    );
    if (syncOrders) {
      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          fulfillments: order.fulfillments.map((f) =>
            f.supplierId === supplierId ? { ...f, status: newStage as any } : f,
          ),
        })),
      );
    }
  }

  function updateFulfillmentStatus(
    orderId: string,
    supplierId: string,
    status: string,
  ) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          fulfillments: order.fulfillments.map((f) =>
            f.supplierId === supplierId ? { ...f, status: status as any } : f,
          ),
        };
      }),
    );
  }

  /* Coupons */
  function addCoupon(c: Coupon) {
    const formatted: Coupon = {
      ...c,
      code: c.code.trim().toUpperCase(),
    };
    setCoupons((prev) => [
      formatted,
      ...prev.filter((x) => x.code.toUpperCase() !== formatted.code),
    ]);
  }

  function removeCoupon(code: string) {
    const normalized = code.trim().toUpperCase();
    setCoupons((prev) =>
      prev.filter((x) => x.code.toUpperCase() !== normalized),
    );
  }

  /* Promotions */
  function addPromotion(p: Promotion) {
    setPromotions((prev) => [p, ...prev]);
  }
  function updatePromotion(p: Promotion) {
    setPromotions((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }
  function removePromotion(id: string) {
    setPromotions((prev) => prev.filter((x) => x.id !== id));
  }

  /* Repasses & Transactions */
  function addRepasse(payload: RepassePayload) {
    const id = `rep-${Date.now()}`;
    const today = payload.date || new Date().toISOString().slice(0, 10);
    const newTxn: Txn = {
      id,
      date: today,
      order: "—",
      description: payload.description,
      category: "Repasse",
      method: payload.method,
      amount: -Math.abs(payload.amount),
      status: payload.status || "Concluído",
      validator: payload.validator,
      validatorRole: payload.validatorRole || "Conselho Fiscal / DIACOM",
    };
    setTxns((prev) => [newTxn, ...prev]);
  }

  function removeTxn(id: string) {
    setTxns((prev) => prev.filter((t) => t.id !== id));
  }

  /* Cart */
  function addToCart(product: Product) {
    setCart((prev) => {
      const found = prev.find((l) => l.product.id === product.id);
      const next = found
        ? prev.map((l) =>
            l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l,
          )
        : [...prev, { product, qty: 1 }];
      if (user) {
        setUserCarts((all) => ({ ...all, [user.id]: next }));
      }
      return next;
    });
  }

  function setQty(id: string, qty: number) {
    setCart((prev) => {
      const next =
        qty <= 0
          ? prev.filter((l) => l.product.id !== id)
          : prev.map((l) => (l.product.id === id ? { ...l, qty } : l));
      if (user) {
        setUserCarts((all) => ({ ...all, [user.id]: next }));
      }
      return next;
    });
  }

  function clearCart() {
    setCart([]);
    if (user) {
      setUserCarts((all) => ({ ...all, [user.id]: [] }));
    }
  }

  async function checkout(p: CheckoutPayload) {
    const token = localStorage.getItem("diacom_token");
    if (!token) {
      throw new Error("Você precisa estar logado para finalizar o pedido.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 1. Garante que o carrinho no banco começa limpo
    await fetch("http://localhost:3001/api/carrinho", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2. Insere cada item do carrinho no banco de dados
    for (const item of p.items) {
      const resItem = await fetch("http://localhost:3001/api/carrinho/itens", {
        method: "POST",
        headers,
        body: JSON.stringify({
          idProduto: String(item.product.id),
          quantidade: item.qty,
        }),
      });

      if (!resItem.ok) {
        const errData = await resItem.json().catch(() => ({}));
        throw new Error(
          errData.message ||
            `Erro ao adicionar ${item.product.name} no carrinho.`,
        );
      }
    }

    // 3. Cria o pedido real no banco a partir do carrinho salvo
    const metodoPagamento = p.method === "Cartão" ? "cartao" : "pix";
    const resPedido = await fetch("http://localhost:3001/api/pedido", {
      method: "POST",
      headers,
      body: JSON.stringify({
        codigoCupom: p.couponCode || undefined,
        metodoPagamento,
      }),
    });

    if (!resPedido.ok) {
      const errData = await resPedido.json().catch(() => ({}));
      throw new Error(
        errData.message || "Erro ao finalizar o pedido no servidor.",
      );
    }

    const pedidoCriado = await resPedido.json();
    const id = `#DC-${pedidoCriado.idPedido}`;
    const pin = String(pedidoCriado.idPedido).padStart(4, "0").slice(-4);

    // 4. Atualiza pedidos e estoque do catálogo direto do banco e limpa o carrinho local
    await Promise.all([refreshOrders(role), refreshCatalog()]);
    setCart([]);
    if (user) {
      setUserCarts((all) => ({ ...all, [user.id]: [] }));
    }

    return { id, pin };
  }

  const value: Store = {
    role,
    setRole,
    user,
    login,
    logout,
    offerDeadline,
    setOfferDeadline,
    products,
    addProduct,
    updateProduct,
    removeProduct,
    suppliers,
    addSupplier,
    updateSupplier,
    removeSupplier,
    updateSupplierStage,
    updateFulfillmentStatus,
    coupons,
    addCoupon,
    removeCoupon,
    promotions,
    addPromotion,
    updatePromotion,
    removePromotion,
    orders,
    txns,
    addRepasse,
    removeTxn,
    checkout,
    cart,
    cartCount,
    addToCart,
    setQty,
    clearCart,
    cartOpen,
    setCartOpen,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
