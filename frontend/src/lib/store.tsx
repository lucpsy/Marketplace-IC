"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  API_URL,
  resolveAssetUrl,
  SUPPLIERS,
  MOCK_USERS,
  OFFER_DEADLINE,
  DEFAULT_PREPARATION_FLOW,
  type Product,
  type Promotion,
  type Txn,
  type Order,
  type OrderStatus,
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
  comprovanteUrl: string;
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

export type ValidateCouponResult = {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
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
  createCategory: (name: string) => Promise<boolean>;

  suppliers: Supplier[];
  addSupplier: (s: Supplier) => Promise<void>;
  updateSupplier: (s: Supplier) => Promise<void>;
  removeSupplier: (id: string) => Promise<void>;
  updateSupplierStage: (
    supplierId: string,
    newStage: string,
    syncOrders?: boolean,
  ) => Promise<void>;
  updateFulfillmentStatus: (
    orderId: string,
    supplierId: string,
    status: string,
  ) => Promise<void>;

  coupons: Coupon[];
  addCoupon: (c: Coupon) => Promise<void>;
  removeCoupon: (code: string) => Promise<void>;
  validateCoupon: (
    code: string,
    subtotal: number,
  ) => Promise<ValidateCouponResult>;

  promotions: Promotion[];
  addPromotion: (p: Promotion) => Promise<void>;
  updatePromotion: (p: Promotion) => Promise<void>;
  removePromotion: (id: string) => Promise<void>;

  orders: Order[];
  txns: Txn[];
  addRepasse: (p: RepassePayload) => Promise<void>;
  removeTxn: (id: string) => Promise<void>;
  checkout: (p: CheckoutPayload) => Promise<{ id: string; pin: string }>;
  uploadComprovante: (file: File) => Promise<string>;
  confirmarPagamentoPedido: (orderId: string) => Promise<void>;
  solicitarReembolso: (
    orderId: string,
    motivo: string,
    chavePix?: string,
  ) => Promise<void>;
  efetivarReembolso: (
    orderId: string,
    comprovanteReembolsoUrl: string,
    observacao?: string,
  ) => Promise<void>;

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

/* ------------------------------------------------------------------ Helpers */

function getAuthHeaders(withJson = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (withJson) headers["Content-Type"] = "application/json";
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("diacom_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
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
    status: statusNome as OrderStatus,
    paymentStatus: firstPay?.status || undefined,
    comprovanteUrl: resolveAssetUrl(firstPay?.comprovanteUrl),
    comprovanteReembolsoUrl: resolveAssetUrl(firstPay?.comprovanteReembolsoUrl),
    motivoReembolso: firstPay?.motivoReembolso || undefined,
    dataReembolso: firstPay?.dataReembolso
      ? new Date(firstPay.dataReembolso).toISOString().slice(0, 10)
      : undefined,
    fulfillments,
  };
}

function mapBackendPromotion(raw: any): Promotion {
  const productIds = Array.isArray(raw.produtosPromocao)
    ? raw.produtosPromocao
        .map((pp: any) => pp.produto?.idProduto)
        .filter(Boolean)
        .map(String)
    : [];

  return {
    id: String(raw.idPromocao),
    title: raw.titulo || "Promoção",
    description: raw.descricao || "",
    discountPct: Number(raw.valorDesconto ?? 0),
    productIds,
    accent: raw.cor || "#22e0ee",
    active: raw.status === "ativa",
    endsAt: raw.dataFim ? new Date(raw.dataFim).toISOString() : undefined,
  };
}

function mapBackendCoupon(raw: any): Coupon {
  const rawTipo = String(raw.tipoDesconto || "percentual").toLowerCase();
  const kind: Coupon["kind"] =
    rawTipo === "fixo"
      ? "fixed"
      : rawTipo === "frete_gratis"
        ? "shipping"
        : "percent";

  const value = Number(raw.valorDesconto ?? 0);
  const label =
    raw.descricao?.trim() ||
    raw.titulo?.trim() ||
    (kind === "percent"
      ? `${value}% de desconto`
      : kind === "fixed"
        ? `R$ ${value.toFixed(2)} de desconto`
        : "Frete grátis");

  return {
    id: raw.idPromocao ? String(raw.idPromocao) : undefined,
    code: String(raw.codigo || "").toUpperCase(),
    kind,
    value,
    label,
    minSubtotal:
      raw.valorMinimo !== null &&
      raw.valorMinimo !== undefined &&
      Number(raw.valorMinimo) > 0
        ? Number(raw.valorMinimo)
        : undefined,
  };
}

function mapBackendTxn(raw: any): Txn {
  const rawCat = String(raw.categoria || "venda").toLowerCase();
  const category: Txn["category"] =
    rawCat === "repasse"
      ? "Repasse"
      : rawCat === "estorno"
        ? "Reembolso"
        : rawCat === "taxa"
          ? "Taxa"
          : rawCat === "custo" || rawCat === "outro"
            ? "Custo"
            : "Vendas";

  const rawMethod = String(raw.metodo || "pix").toLowerCase();
  const method: Txn["method"] = rawMethod.includes("cart")
    ? "Cartão"
    : rawMethod.includes("din")
      ? "Dinheiro"
      : "Pix";

  const rawStatus = String(raw.status || "concluido").toLowerCase();
  const status: Txn["status"] =
    rawStatus === "estornado" || rawStatus === "cancelado"
      ? "Estornado"
      : rawStatus === "processando" || rawStatus === "pendente"
        ? "Processando"
        : "Concluído";

  const valorNum = Number(raw.valor ?? 0);
  const amount =
    raw.valorAssinado !== undefined
      ? Number(raw.valorAssinado)
      : raw.tipo === "saida"
        ? -Math.abs(valorNum)
        : Math.abs(valorNum);

  const dataStr = raw.data || raw.dataPagamento || raw.dataCriacao;

  return {
    id: String(raw.idPagamento),
    date: dataStr
      ? new Date(dataStr).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    order: raw.idPedido ? `#DC-${raw.idPedido}` : "—",
    description:
      raw.descricao ||
      (raw.idPedido ? `Pedido #DC-${raw.idPedido}` : "Lançamento financeiro"),
    category,
    method,
    amount,
    status,
    validator: raw.validadorNome || undefined,
    validatorRole: raw.validadorCargo || undefined,
    comprovanteUrl: resolveAssetUrl(
      rawCat === "estorno"
        ? raw.comprovanteReembolsoUrl
        : raw.comprovanteUrl,
    ),
  };
}

function parseSupplierMeta(rawDadosPagamento: string | null | undefined): {
  pickupLocation?: string;
  preparationFlow?: string[];
  currentStage?: string;
} {
  if (!rawDadosPagamento) return {};
  try {
    const parsed = JSON.parse(rawDadosPagamento);
    if (parsed && typeof parsed === "object") {
      return {
        pickupLocation:
          typeof parsed.pickupLocation === "string"
            ? parsed.pickupLocation
            : undefined,
        preparationFlow: Array.isArray(parsed.preparationFlow)
          ? parsed.preparationFlow
          : undefined,
        currentStage:
          typeof parsed.currentStage === "string"
            ? parsed.currentStage
            : undefined,
      };
    }
  } catch {
    // dadosPagamento não é JSON — ignora
  }
  return {};
}

function mapBackendSupplier(f: any): Supplier {
  const nome = f.nomeFantasia || f.nomeRazaoSocial || "Fornecedor";
  const mockMatch = SUPPLIERS.find(
    (s) => s.name.toLowerCase() === nome.toLowerCase(),
  );
  const meta = parseSupplierMeta(f.dadosPagamento);
  const flow =
    meta.preparationFlow && meta.preparationFlow.length > 0
      ? meta.preparationFlow
      : mockMatch?.preparationFlow || [...DEFAULT_PREPARATION_FLOW];

  return {
    id: String(f.idFornecedor),
    name: nome,
    pickupLocation:
      meta.pickupLocation ||
      mockMatch?.pickupLocation ||
      "Sala do DIACOM — Bloco 4",
    contact: f.email || f.telefone || mockMatch?.contact,
    preparationFlow: flow,
    currentStage: meta.currentStage || mockMatch?.currentStage || flow[0],
  };
}

export function AppStore({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [role, setRoleState] = useState<Role>("cliente");
  const [offerDeadline, setOfferDeadlineState] = useState<string>(OFFER_DEADLINE);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [backendCategories, setBackendCategories] = useState<
    { idCategoria: string; nome: string }[]
  >([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [userCarts, setUserCarts] = useState<Record<string, CartLine[]>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = cart.reduce((n, l) => n + l.qty, 0);

  function setOfferDeadline(deadline: string) {
    setOfferDeadlineState(deadline);
    if (typeof window !== "undefined") {
      localStorage.setItem("diacom_offer_deadline", deadline);
    }
  }

  /* ------------------------------------------------------------- Refreshers */

  async function refreshPromotions() {
    try {
      const res = await fetch(`${API_URL}/promocao`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const promos: Promotion[] = [];
      const coups: Coupon[] = [];

      for (const raw of data) {
        if (raw.codigo) {
          // Para cupons, exibimos apenas os ativos no store (removeCoupon desativa no back)
          if (raw.status === "ativa") {
            coups.push(mapBackendCoupon(raw));
          }
        } else {
          promos.push(mapBackendPromotion(raw));
        }
      }

      setPromotions(promos);
      setCoupons(coups);
    } catch (err) {
      console.error("Erro ao carregar promoções e cupons:", err);
    }
  }

  async function refreshTransparencia() {
    try {
      const res = await fetch(
        `${API_URL}/pagamento/transparencia/lancamentos?limite=200`,
      );
      if (!res.ok) return;
      const payload = await res.json();
      const lista = Array.isArray(payload?.dados)
        ? payload.dados
        : Array.isArray(payload)
          ? payload
          : [];
      setTxns(lista.map(mapBackendTxn));
    } catch (err) {
      console.error("Erro ao carregar transparência financeira:", err);
    }
  }

  async function refreshOrders(targetRole: Role) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const endpoint =
      targetRole === "admin"
        ? `${API_URL}/pedido`
        : `${API_URL}/pedido/meus`;

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      if (Array.isArray(data)) {
        setOrders(data.map(mapBackendOrder));
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos reais:", err);
    }
  }

  async function refreshCatalog() {
    try {
      const [resProd, resCat, resForn] = await Promise.all([
        fetch(`${API_URL}/catalogo/produtos`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/catalogo/categorias`),
        fetch(`${API_URL}/fornecedor`).catch(() => null),
      ]);

      let loadedSuppliers = suppliers;
      if (resForn && resForn.ok) {
        const forns = await resForn.json();
        if (Array.isArray(forns)) {
          loadedSuppliers = forns.map(mapBackendSupplier);
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
    const savedDeadline = localStorage.getItem("diacom_offer_deadline");
    if (savedDeadline) setOfferDeadlineState(savedDeadline);

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

    refreshCatalog();
    refreshPromotions();
    refreshTransparencia();
  }, []);

  /* --------------------------------------------------------------- Products */

  function buildProdutoPayload(
    p: Product,
    categoriesList = backendCategories,
  ) {
    const validSupplier =
      suppliers.find((s) => s.id === p.supplierId) || suppliers[0];
    const idFornecedor = /^\d+$/.test(String(validSupplier?.id))
      ? String(validSupplier.id)
      : "1";

    const categoriaIds = (p.category ?? [])
      .map(
        (catName) =>
          categoriesList.find(
            (c) => c.nome.toLowerCase() === catName.toLowerCase(),
          )?.idCategoria,
      )
      .filter((id): id is string => Boolean(id))
      .map(String);

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

  async function createCategory(name: string): Promise<boolean> {
    const token = localStorage.getItem("diacom_token");
    if (!token) return false;

    const res = await fetch(`${API_URL}/catalogo/categorias`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ nome: name.trim() }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao criar categoria no banco.");
      return false;
    }

    const created = await res.json();
    setBackendCategories((prev) => [...prev, created]);
    return true;
  }

  async function addProduct(p: Product) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const payload = {
      ...buildProdutoPayload(p),
      sku: `prod-${Date.now()}`,
    };

    const res = await fetch(`${API_URL}/catalogo/produtos`, {
      method: "POST",
      headers: getAuthHeaders(true),
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

    // Garante que temos a lista de categorias atualizada do banco
    let cats = backendCategories;
    try {
      const resCat = await fetch(`${API_URL}/catalogo/categorias`);
      if (resCat.ok) {
        const data = await resCat.json();
        if (Array.isArray(data)) {
          cats = data;
          setBackendCategories(data);
        }
      }
    } catch {
      // usa cache local
    }

    const payload = buildProdutoPayload(p, cats);

    const res = await fetch(`${API_URL}/catalogo/produtos/${p.id}`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

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

    const res = await fetch(`${API_URL}/catalogo/produtos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao remover produto do banco.");
      return;
    }

    setProducts((prev) => prev.filter((x) => x.id !== id));
    await refreshPromotions();
  }

  /* ------------------------------------------------------------------- Auth */

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
      const res = await fetch(`${API_URL}/auth/login`, {
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

      await Promise.all([
        refreshOrders(targetRole),
        refreshPromotions(),
        refreshTransparencia(),
        refreshCatalog(),
      ]);
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
    refreshPromotions();
  }

  /* -------------------------------------------------------------- Suppliers */

  function buildFornecedorPayload(s: Supplier) {
    const contact = s.contact?.trim() || "";
    const isEmail = contact.includes("@");
    return {
      nomeRazaoSocial: s.name.trim(),
      nomeFantasia: s.name.trim(),
      email: isEmail ? contact : undefined,
      telefone: !isEmail && contact ? contact : undefined,
      dadosPagamento: JSON.stringify({
        pickupLocation: s.pickupLocation,
        preparationFlow: s.preparationFlow,
        currentStage: s.currentStage ?? s.preparationFlow[0],
      }),
    };
  }

  async function addSupplier(s: Supplier) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const res = await fetch(`${API_URL}/fornecedor`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(buildFornecedorPayload(s)),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao cadastrar fornecedor no banco.");
      return;
    }

    await refreshCatalog();
  }

  async function updateSupplier(s: Supplier) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const res = await fetch(`${API_URL}/fornecedor/${s.id}`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(buildFornecedorPayload(s)),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao atualizar fornecedor no banco.");
      return;
    }

    await refreshCatalog();
  }

  async function removeSupplier(id: string) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const res = await fetch(`${API_URL}/fornecedor/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao remover fornecedor no banco.");
      return;
    }

    await refreshCatalog();
  }

  async function updateSupplierStage(
    supplierId: string,
    newStage: string,
    syncOrders = false,
  ) {
    const target = suppliers.find((s) => s.id === supplierId);
    if (target) {
      const updated = { ...target, currentStage: newStage };
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplierId ? updated : s)),
      );
      await updateSupplier(updated);
    }

    if (syncOrders) {
      const affectedOrders = orders.filter((order) =>
        order.fulfillments.some((f) => f.supplierId === supplierId),
      );
      for (const order of affectedOrders) {
        await updateFulfillmentStatus(order.id, supplierId, newStage);
      }
    }
  }

  async function updateFulfillmentStatus(
    orderId: string,
    supplierId: string,
    status: string,
  ) {
    const token = localStorage.getItem("diacom_token");
    const numericId = orderId.replace(/^#DC-/i, "");

    // Atualização otimista local
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: status as OrderStatus,
          fulfillments: order.fulfillments.map((f) =>
            f.supplierId === supplierId ? { ...f, status: status as any } : f,
          ),
        };
      }),
    );

    if (!token || !/^\d+$/.test(numericId)) return;

    try {
      const res = await fetch(`${API_URL}/pedido/${numericId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ nomeStatus: status }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(
          (Array.isArray(err?.message) ? err.message[0] : err?.message) ||
            `Não foi possível alterar o status para "${status}".`,
        );
        await refreshOrders(role);
        return;
      }

      await Promise.all([refreshOrders(role), refreshTransparencia()]);
    } catch (err) {
      console.error("Erro ao atualizar status do pedido:", err);
      await refreshOrders(role);
    }
  }

  /* ---------------------------------------------------------------- Coupons */

  async function addCoupon(c: Coupon) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const code = c.code.trim().toUpperCase();
    const tipoDesconto =
      c.kind === "fixed"
        ? "fixo"
        : c.kind === "shipping"
          ? "frete_gratis"
          : "percentual";

    const existing = coupons.find((x) => x.code.toUpperCase() === code);
    const now = new Date(Date.now() - 60_000).toISOString();
    const oneYear = new Date(Date.now() + 365 * 86400_000).toISOString();

    const payload = {
      titulo: c.label?.trim() || `Cupom ${code}`,
      descricao: c.label?.trim() || `Cupom ${code}`,
      tipoDesconto,
      valorDesconto: tipoDesconto === "frete_gratis" ? 0 : Number(c.value || 0),
      dataInicio: now,
      dataFim: oneYear,
      codigo: code,
      valorMinimo:
        c.minSubtotal && c.minSubtotal > 0 ? Number(c.minSubtotal) : undefined,
      status: "ativa",
    };

    const url = existing?.id
      ? `${API_URL}/promocao/${existing.id}`
      : `${API_URL}/promocao`;
    const method = existing?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao salvar cupom no servidor.");
      return;
    }

    await refreshPromotions();
  }

  async function removeCoupon(code: string) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const normalized = code.trim().toUpperCase();
    const found = coupons.find((x) => x.code.toUpperCase() === normalized);
    if (!found?.id) return;

    const res = await fetch(`${API_URL}/promocao/${found.id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao remover cupom no servidor.");
      return;
    }

    await refreshPromotions();
  }

  async function validateCoupon(
    code: string,
    subtotal: number,
  ): Promise<ValidateCouponResult> {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { valid: false, error: "Informe um código de cupom." };
    }

    try {
      const res = await fetch(`${API_URL}/promocao/cupons/validar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: clean, subtotal }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          valid: false,
          error:
            (Array.isArray(data?.message)
              ? data.message[0]
              : data?.message) || "Cupom inválido.",
        };
      }

      if (data?.valido && data?.cupom) {
        return {
          valid: true,
          coupon: mapBackendCoupon(data.cupom),
        };
      }

      return { valid: false, error: "Cupom inválido." };
    } catch {
      return { valid: false, error: "Erro ao validar cupom no servidor." };
    }
  }

  /* ------------------------------------------------------------- Promotions */

  function buildPromotionPayload(p: Promotion) {
    const startMs = Date.now() - 60_000;
    const defaultEndMs = Date.now() + 90 * 86400_000;
    let endDate = new Date(defaultEndMs);

    if (p.endsAt) {
      const parsed = new Date(p.endsAt);
      if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > startMs) {
        endDate = parsed;
      }
    }

    return {
      titulo: p.title.trim() || "Promoção",
      descricao: p.description?.trim() || undefined,
      tipoDesconto: "percentual",
      valorDesconto: Number(p.discountPct || 0),
      dataInicio: new Date(startMs).toISOString(),
      dataFim: endDate.toISOString(),
      cor: p.accent || "#22e0ee",
      status: p.active ? "ativa" : "inativa",
      produtoIds: p.productIds.map(String),
    };
  }

  async function addPromotion(p: Promotion) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const res = await fetch(`${API_URL}/promocao`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(buildPromotionPayload(p)),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao criar promoção no servidor.");
      return;
    }

    await refreshPromotions();
  }

  async function updatePromotion(p: Promotion) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const res = await fetch(`${API_URL}/promocao/${p.id}`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(buildPromotionPayload(p)),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao atualizar promoção no servidor.");
      return;
    }

    await refreshPromotions();
  }

  async function removePromotion(id: string) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const res = await fetch(`${API_URL}/promocao/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao remover promoção no servidor.");
      return;
    }

    await refreshPromotions();
  }

  /* ------------------------------------------------ Repasses & Transactions */

  async function addRepasse(payload: RepassePayload) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const metodo =
      payload.method === "Cartão"
        ? "cartao"
        : payload.method === "Dinheiro"
          ? "dinheiro"
          : "pix";

    const status =
      payload.status === "Processando" ? "processando" : "concluido";

    const body = {
      descricao: payload.description.trim(),
      valor: Math.abs(Number(payload.amount)),
      metodo,
      dataPagamento: payload.date
        ? new Date(`${payload.date}T12:00:00.000Z`).toISOString()
        : undefined,
      validadorNome: payload.validator.trim(),
      validadorCargo:
        payload.validatorRole?.trim() || "Conselho Fiscal / DIACOM",
      status,
    };

    const res = await fetch(`${API_URL}/pagamento/repasses`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao registrar repasse no servidor.");
      return;
    }

    await refreshTransparencia();
  }

  async function removeTxn(id: string) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const res = await fetch(`${API_URL}/pagamento/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message || "Erro ao remover lançamento financeiro.");
      return;
    }

    await refreshTransparencia();
  }

  /* ------------------------------------------------------------------- Cart */

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

    const headers = getAuthHeaders(true);

    // 1. Garante que o carrinho no banco começa limpo
    await fetch(`${API_URL}/carrinho`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    // 2. Insere cada item do carrinho no banco de dados
    for (const item of p.items) {
      const resItem = await fetch(`${API_URL}/carrinho/itens`, {
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
    const resPedido = await fetch(`${API_URL}/pedido`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        codigoCupom: p.couponCode || undefined,
        metodoPagamento,
        comprovanteUrl: p.comprovanteUrl,
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

    // 4. Atualiza pedidos, catálogo e transparência direto do banco
    await Promise.all([
      refreshOrders(role),
      refreshCatalog(),
      refreshTransparencia(),
    ]);
    setCart([]);
    if (user) {
      setUserCarts((all) => ({ ...all, [user.id]: [] }));
    }

    return { id, pin };
  }

  async function uploadComprovante(file: File): Promise<string> {
    const token = localStorage.getItem("diacom_token");
    if (!token) {
      throw new Error("Você precisa estar logado para enviar um comprovante.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/pedido/upload-comprovante`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        (Array.isArray(errData?.message)
          ? errData.message[0]
          : errData?.message) || "Erro ao enviar comprovante.",
      );
    }

    const data = await res.json();
    return data.url;
  }

  async function confirmarPagamentoPedido(orderId: string) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;
    const numericId = orderId.replace(/^#DC-/i, "");

    const res = await fetch(
      `${API_URL}/pedido/${numericId}/confirmar-pagamento`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      },
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData?.message || "Erro ao confirmar pagamento do pedido.",
      );
    }

    await Promise.all([refreshOrders(role), refreshTransparencia()]);
  }

  async function solicitarReembolso(
    orderId: string,
    motivo: string,
    chavePix?: string,
  ) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;
    const numericId = orderId.replace(/^#DC-/i, "");

    const res = await fetch(
      `${API_URL}/pedido/${numericId}/solicitar-reembolso`,
      {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          motivo: motivo.trim() || undefined,
          chavePix: chavePix?.trim() || undefined,
        }),
      },
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData?.message || "Erro ao solicitar reembolso do pedido.",
      );
    }

    await refreshOrders(role);
  }

  async function efetivarReembolso(
    orderId: string,
    comprovanteReembolsoUrl: string,
    observacao?: string,
  ) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;
    const numericId = orderId.replace(/^#DC-/i, "");

    const res = await fetch(`${API_URL}/pedido/${numericId}/reembolsar`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        comprovanteReembolsoUrl,
        observacao: observacao?.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData?.message || "Erro ao efetivar reembolso do pedido.",
      );
    }

    await Promise.all([
      refreshOrders(role),
      refreshCatalog(),
      refreshTransparencia(),
    ]);
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
    createCategory,
    suppliers,
    addSupplier,
    updateSupplier,
    removeSupplier,
    updateSupplierStage,
    updateFulfillmentStatus,
    coupons,
    addCoupon,
    removeCoupon,
    validateCoupon,
    promotions,
    addPromotion,
    updatePromotion,
    removePromotion,
    orders,
    txns,
    addRepasse,
    removeTxn,
    checkout,
    uploadComprovante,
    confirmarPagamentoPedido,
    solicitarReembolso,
    efetivarReembolso,
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
