import type {
  Product,
  Supplier,
  Promotion,
  Coupon,
  Order,
  Txn,
  MockUser,
} from "@/lib/data";
import { DEFAULT_PREPARATION_FLOW } from "@/lib/data";

/* ==========================================================================
   DTOs & Entities matching NestJS Backend (@backend/src/...)
   ========================================================================== */

// --- Auth DTOs (@backend/src/auth/dto/...) ---
export interface CreateAccountDto {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface LoginAccountDto {
  email: string;
  senha: string;
}

export interface AuthResponse {
  access_token: string;
}

// --- Usuario DTOs & Entities (@backend/src/usuario/...) ---
export interface CreateUsuarioDto {
  nome: string;
  email: string;
  senhaHash: string;
  telefone?: string;
}

export interface UpdateUsuarioDto {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  senhaAntiga?: string;
}

export interface AdminUpdateUsuarioDto {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
}

export interface UsuarioEntity {
  idUsuario: string;
  nome: string;
  email: string;
  telefone?: string | null;
  status: string;
  cargo: "cliente" | "admin" | string;
  dataCadastro: string | Date;
  dataAtualizacao?: string | Date | null;
}

// --- Catalogo DTOs & Entities (@backend/src/catalogo/...) ---
export interface ImagemProdutoDto {
  urlImagem: string;
  textoAlternativo?: string;
  ordem?: number;
  imagemPrincipal?: boolean;
}

export interface CreateProdutoDto {
  nome: string;
  descricao?: string;
  marca?: string;
  selo?: string;
  sku?: string;
  precoCusto: number;
  precoVenda: number;
  estoque?: number;
  idFornecedor: string;
  categoriaIds?: string[];
  imagens?: ImagemProdutoDto[];
}

export interface UpdateProdutoDto extends Partial<CreateProdutoDto> {
  status?: string;
}

export interface ProdutoImagemEntity {
  idImagem: string;
  urlImagem: string;
  textoAlternativo: string | null;
  ordem: number;
  imagemPrincipal: boolean;
}

export interface CategoriaEntity {
  idCategoria: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  subcategorias?: CategoriaEntity[];
}

export interface ProdutoEntity {
  idProduto: string;
  nome: string;
  descricao: string | null;
  marca: string | null;
  selo: string | null;
  sku: string | null;
  precoCusto: string;
  precoVenda: string;
  estoque: number;
  status: string;
  dataCadastro: string | Date;
  dataAtualizacao: string | Date | null;
  fornecedor?: FornecedorEntity;
  categorias?: CategoriaEntity[];
  imagens?: ProdutoImagemEntity[];
}

export interface CreateCategoriaDto {
  nome: string;
  descricao?: string;
  categoriaPaiId?: string;
}

export interface UpdateCategoriaDto {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}

// --- Fornecedor DTOs & Entities (@backend/src/fornecedor/...) ---
export interface CreateFornecedorDto {
  nomeRazaoSocial?: string;
  nomeFantasia?: string;
  email?: string;
  telefone?: string;
  status?: string;
  dadosPagamento?: string;
  [key: string]: any;
}

export interface UpdateFornecedorDto extends Partial<CreateFornecedorDto> {}

export interface FornecedorEntity {
  idFornecedor: string;
  nomeRazaoSocial: string;
  nomeFantasia: string | null;
  email: string | null;
  telefone: string | null;
  status: string;
  dadosPagamento: string | null;
  dataCadastro: string | Date;
}

// --- Promoção DTOs & Entities (@backend/src/promo/...) ---
export interface CreatePromocaoDto {
  titulo?: string;
  descricao?: string;
  tipoDesconto?: string;
  valorDesconto?: string | number;
  dataInicio?: string | Date;
  dataFim?: string | Date;
  cor?: string;
  status?: string;
  [key: string]: any;
}

export interface UpdatePromocaoDto extends Partial<CreatePromocaoDto> {}

export interface PromocaoEntity {
  idPromocao: string;
  titulo: string;
  descricao: string | null;
  tipoDesconto: string;
  valorDesconto: string;
  dataInicio: string | Date;
  dataFim: string | Date;
  cor: string | null;
  status: string;
  dataCadastro: string | Date;
  produtosPromocao?: any[];
}

// --- Pedido DTOs & Entities (@backend/src/pedido/...) ---
export interface CreatePedidoDto {
  idUsuario?: string;
  idStatus?: string;
  subtotal?: number | string;
  valorDesconto?: number | string;
  frete?: number | string;
  valorTotal?: number | string;
  observacao?: string;
  itens?: any[];
  [key: string]: any;
}

export interface UpdatePedidoDto extends Partial<CreatePedidoDto> {}

export interface PedidoEntity {
  idPedido: string;
  dataPedido: string | Date;
  subtotal: string;
  valorDesconto: string;
  frete: string;
  valorTotal: string;
  observacao: string | null;
  dataAtualizacao?: string | Date | null;
  usuario?: UsuarioEntity;
  status?: any;
  itens?: any[];
  pagamentos?: any[];
}

// --- Pagamento DTOs & Entities (@backend/src/pagamento/...) ---
export interface CreatePagamentoDto {
  idPedido?: string;
  valor?: number | string;
  metodo?: string;
  status?: string;
  referenciaGateway?: string;
  descricao?: string;
  [key: string]: any;
}

export interface UpdatePagamentoDto extends Partial<CreatePagamentoDto> {}

export interface PagamentoEntity {
  idPagamento: string;
  valor: string;
  metodo: string;
  status: string;
  dataCriacao: string | Date;
  dataPagamento: string | Date | null;
  referenciaGateway: string | null;
  descricao: string | null;
  pedido?: PedidoEntity;
}

// --- Carrinho DTOs (@backend/src/carrinho/...) ---
export interface CreateCarrinhoDto {
  [key: string]: any;
}

export interface UpdateCarrinhoDto {
  [key: string]: any;
}

// --- Auditoria DTOs (@backend/src/auditoria/...) ---
export interface CreateAuditoriaDto {
  [key: string]: any;
}

export interface UpdateAuditoriaDto {
  [key: string]: any;
}

// --- Notificacao DTOs (@backend/src/notificacao/...) ---
export interface CreateNotificacaoDto {
  [key: string]: any;
}

export interface UpdateNotificacaoDto {
  [key: string]: any;
}

/* ==========================================================================
   Configuration, Token Storage & Base HTTP Request Client
   ========================================================================== */

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
// O backend NestJS possui app.setGlobalPrefix('api')
const API_BASE_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

export const TOKEN_STORAGE_KEY = "marketplace_jwt_token";

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  set: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/api") ? endpoint.slice(4) : endpoint;
  const path = cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    const errorText = await response.text().catch(() => "");
    try {
      errorData = errorText ? JSON.parse(errorText) : null;
    } catch {
      errorData = null;
    }

    const message =
      (Array.isArray(errorData?.message)
        ? errorData.message.join(", ")
        : errorData?.message) ||
      errorText ||
      response.statusText;

    throw new Error(
      `Erro na requisição ${options?.method || "GET"} para ${endpoint} (${response.status}): ${message}`,
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (null as unknown as T);
}

/* ==========================================================================
   Model Adapters (Backend Entities <-> Frontend UI Models)
   ========================================================================== */

function mapProdutoToProduct(p: any): Product {
  if (p.name && !p.nome) return p;

  const mainImage =
    p.imagens?.find((img: any) => img.imagemPrincipal)?.urlImagem ||
    p.imagens?.[0]?.urlImagem ||
    p.image ||
    "";
  const gallery = p.imagens
    ? p.imagens
        .map((img: any) => img.urlImagem)
        .filter((url: string) => url !== mainImage)
    : p.images || [];
  const categories = Array.isArray(p.categorias)
    ? p.categorias.map((c: any) => c.nome || c)
    : Array.isArray(p.category)
      ? p.category
      : [];

  return {
    id: String(p.idProduto || p.id),
    name: p.nome || p.name || "",
    category: categories.length > 0 ? categories : ["Geral"],
    supplierId: String(
      p.fornecedor?.idFornecedor || p.idFornecedor || p.supplierId || "",
    ),
    price:
      typeof p.precoVenda !== "undefined"
        ? Number(p.precoVenda)
        : Number(p.price) || 0,
    stock:
      typeof p.estoque !== "undefined"
        ? Number(p.estoque)
        : Number(p.stock) || 0,
    badge: p.selo || p.badge || undefined,
    image: mainImage,
    images: gallery,
    blurb: p.descricao || p.blurb || "",
  };
}

function productToCreateDto(p: Product): CreateProdutoDto {
  const imagens: ImagemProdutoDto[] = [];
  if (p.image) {
    imagens.push({
      urlImagem: p.image,
      imagemPrincipal: true,
      ordem: 0,
    });
  }
  if (p.images && p.images.length > 0) {
    p.images.forEach((img, idx) => {
      if (img && img !== p.image) {
        imagens.push({
          urlImagem: img,
          imagemPrincipal: false,
          ordem: idx + 1,
        });
      }
    });
  }

  return {
    nome: p.name,
    descricao: p.blurb || undefined,
    selo: p.badge || undefined,
    sku: p.id ? `SKU-${p.id}` : `SKU-${Date.now()}`,
    precoCusto: Number(p.price) > 0 ? +(Number(p.price) * 0.7).toFixed(2) : 0,
    precoVenda: Number(p.price) || 0,
    estoque: Number(p.stock) || 0,
    idFornecedor: p.supplierId ? String(p.supplierId) : "1",
    imagens: imagens.length > 0 ? imagens : undefined,
  };
}

function productToUpdateDto(p: Partial<Product>): UpdateProdutoDto {
  const dto: UpdateProdutoDto = {};
  if (p.name !== undefined) dto.nome = p.name;
  if (p.blurb !== undefined) dto.descricao = p.blurb;
  if (p.badge !== undefined) dto.selo = p.badge;
  if (p.price !== undefined) {
    dto.precoVenda = Number(p.price);
    dto.precoCusto = +(Number(p.price) * 0.7).toFixed(2);
  }
  if (p.stock !== undefined) dto.estoque = Number(p.stock);
  if (p.supplierId !== undefined) dto.idFornecedor = String(p.supplierId);

  if (p.image !== undefined || p.images !== undefined) {
    const imagens: ImagemProdutoDto[] = [];
    if (p.image) {
      imagens.push({ urlImagem: p.image, imagemPrincipal: true, ordem: 0 });
    }
    if (p.images) {
      p.images.forEach((img, idx) => {
        if (img && img !== p.image) {
          imagens.push({
            urlImagem: img,
            imagemPrincipal: false,
            ordem: idx + 1,
          });
        }
      });
    }
    if (imagens.length > 0) dto.imagens = imagens;
  }
  return dto;
}

function mapFornecedorToSupplier(f: any): Supplier {
  if (f.pickupLocation && !f.nomeRazaoSocial) return f;
  return {
    id: String(f.idFornecedor || f.id),
    name: f.nomeFantasia || f.nomeRazaoSocial || f.name || "Fornecedor",
    pickupLocation: f.dadosPagamento || f.pickupLocation || "Local padrão",
    contact: f.telefone || f.email || f.contact || "",
    preparationFlow: f.preparationFlow || DEFAULT_PREPARATION_FLOW,
    currentStage: f.status || f.currentStage || "Confirmado",
  };
}

function supplierToCreateDto(s: Supplier): CreateFornecedorDto {
  return {
    nomeRazaoSocial: s.name,
    nomeFantasia: s.name,
    dadosPagamento: s.pickupLocation,
    telefone: s.contact,
    email: s.contact?.includes("@") ? s.contact : undefined,
    status: s.currentStage || "pendente",
  };
}

function supplierToUpdateDto(s: Partial<Supplier>): UpdateFornecedorDto {
  const dto: UpdateFornecedorDto = {};
  if (s.name !== undefined) {
    dto.nomeRazaoSocial = s.name;
    dto.nomeFantasia = s.name;
  }
  if (s.pickupLocation !== undefined) dto.dadosPagamento = s.pickupLocation;
  if (s.contact !== undefined) {
    dto.telefone = s.contact;
    if (s.contact.includes("@")) dto.email = s.contact;
  }
  if (s.currentStage !== undefined) dto.status = s.currentStage;
  return dto;
}

function mapPromocaoToPromotion(pr: any): Promotion {
  if (pr.discountPct && !pr.valorDesconto) return pr;
  return {
    id: String(pr.idPromocao || pr.id),
    title: pr.titulo || pr.title || "",
    description: pr.descricao || pr.description || "",
    discountPct:
      typeof pr.valorDesconto !== "undefined"
        ? Number(pr.valorDesconto)
        : pr.discountPct || 0,
    productIds: Array.isArray(pr.produtosPromocao)
      ? pr.produtosPromocao.map((pp: any) =>
          String(pp.produto?.idProduto || pp.idProduto || pp),
        )
      : pr.productIds || [],
    accent: pr.cor || pr.accent || "#22e0ee",
    active: pr.status === "ativo" || pr.active || false,
    endsAt: pr.dataFim ? new Date(pr.dataFim).toISOString() : pr.endsAt,
  };
}

function promoToCreateDto(p: Promotion): CreatePromocaoDto {
  return {
    titulo: p.title,
    descricao: p.description,
    tipoDesconto: "percentual",
    valorDesconto: String(p.discountPct),
    dataInicio: new Date().toISOString(),
    dataFim:
      p.endsAt ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cor: p.accent,
    status: p.active ? "ativo" : "inativo",
  };
}

function promoToUpdateDto(p: Partial<Promotion>): UpdatePromocaoDto {
  const dto: UpdatePromocaoDto = {};
  if (p.title !== undefined) dto.titulo = p.title;
  if (p.description !== undefined) dto.descricao = p.description;
  if (p.discountPct !== undefined) dto.valorDesconto = String(p.discountPct);
  if (p.accent !== undefined) dto.cor = p.accent;
  if (p.active !== undefined) dto.status = p.active ? "ativo" : "inativo";
  if (p.endsAt !== undefined) dto.dataFim = p.endsAt;
  return dto;
}

function mapPedidoToOrder(o: any): Order {
  if (o.buyer && !o.usuario) return o;
  return {
    id: o.idPedido
      ? `#DC-${o.idPedido}`
      : o.id || `#DC-${Date.now().toString().slice(-4)}`,
    date: o.dataPedido
      ? new Date(o.dataPedido).toISOString().slice(0, 10)
      : o.date || new Date().toISOString().slice(0, 10),
    buyer: o.usuario?.nome || o.buyer || "Cliente",
    buyerId: o.usuario?.idUsuario ? String(o.usuario.idUsuario) : o.buyerId,
    total:
      typeof o.valorTotal !== "undefined"
        ? Number(o.valorTotal)
        : o.total || 0,
    method: o.pagamentos?.[0]?.metodo || o.method || "Pix",
    pin: o.observacao?.startsWith("PIN:")
      ? o.observacao.replace("PIN:", "")
      : o.pin || "0000",
    fulfillments: o.fulfillments || [],
  };
}

function orderToCreateDto(order: Order): CreatePedidoDto {
  return {
    idUsuario: order.buyerId || "1",
    subtotal: String(order.total),
    valorTotal: String(order.total),
    observacao: order.pin ? `PIN:${order.pin}` : undefined,
    itens:
      order.fulfillments?.flatMap((f) =>
        f.items.map((it) => ({
          idProduto: it.productId,
          quantidade: it.qty,
          nomeProdutoSnapshot: it.name,
        })),
      ) || [],
  };
}

function mapPagamentoToTxn(p: any): Txn {
  if (p.amount && !p.valor) return p;
  return {
    id: String(p.idPagamento || p.id),
    date: p.dataCriacao
      ? new Date(p.dataCriacao).toISOString().slice(0, 10)
      : p.date || new Date().toISOString().slice(0, 10),
    order: p.pedido?.idPedido ? `#DC-${p.pedido.idPedido}` : p.order || "—",
    description: p.descricao || p.description || "Transação",
    category: p.category || (Number(p.valor) < 0 ? "Repasse" : "Vendas"),
    method: (p.metodo as any) || p.method || "Pix",
    amount:
      typeof p.valor !== "undefined" ? Number(p.valor) : p.amount || 0,
    status: p.status === "pago" ? "Concluído" : p.status || "Processando",
    validator: p.validator,
    validatorRole: p.validatorRole,
  };
}

function txnToCreateDto(txn: Txn): CreatePagamentoDto {
  return {
    idPedido:
      txn.order && txn.order !== "—"
        ? txn.order.replace(/[^0-9]/g, "") || undefined
        : undefined,
    valor: String(txn.amount),
    metodo: txn.method || "Pix",
    status: txn.status === "Concluído" ? "pago" : "pendente",
    descricao: `${txn.category || "Transação"} — ${txn.description || ""}${txn.validator ? ` (Validador: ${txn.validator})` : ""}`,
  };
}

function mapUsuarioToMockUser(u: any): MockUser {
  return {
    id: String(u.idUsuario || u.id),
    name: u.nome || u.name || "",
    email: u.email || "",
    role: (u.cargo || u.role || "cliente") as "cliente" | "admin",
    courseOrDept:
      (u.cargo || u.role) === "admin"
        ? "Diretoria DIACOM"
        : "Instituto de Computação",
  };
}

/* ==========================================================================
   Exported Real API Service
   ========================================================================== */

export const api = {
  // --- Token & Sessão ---
  getToken: () => tokenStorage.get(),
  setToken: (token: string) => tokenStorage.set(token),
  removeToken: () => tokenStorage.remove(),

  // --- AuthController (@Controller('auth') -> /api/auth) ---
  register: async (dto: CreateAccountDto): Promise<AuthResponse> => {
    const res = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    if (res?.access_token) {
      tokenStorage.set(res.access_token);
    }
    return res;
  },

  login: async (dto: LoginAccountDto): Promise<AuthResponse> => {
    const res = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    if (res?.access_token) {
      tokenStorage.set(res.access_token);
    }
    return res;
  },

  // --- UsuarioController (@Controller('usuario') -> /api/usuario) ---
  createUser: (dto: CreateUsuarioDto) =>
    request<UsuarioEntity>("/usuario/create", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  getProfile: () => request<UsuarioEntity>("/usuario/profile"),

  updateProfile: (dto: UpdateUsuarioDto) =>
    request<{ message: string }>("/usuario/profile", {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  getUsers: async (): Promise<MockUser[]> => {
    const list = await request<UsuarioEntity[]>("/usuario");
    return Array.isArray(list) ? list.map(mapUsuarioToMockUser) : [];
  },

  getUserEntities: () => request<UsuarioEntity[]>("/usuario"),

  getUserById: (id: string) =>
    request<UsuarioEntity>(`/usuario/${encodeURIComponent(id)}`),

  updateUser: (id: string, dto: AdminUpdateUsuarioDto | UpdateUsuarioDto) =>
    request<{ message: string }>(`/usuario/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/usuario/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // --- CatalogoController (@Controller('catalogo') -> /api/catalogo) ---
  getProdutos: (filtros?: {
    categoriaId?: string;
    fornecedorId?: string;
    busca?: string;
  }) => {
    const params = new URLSearchParams();
    if (filtros?.categoriaId) params.append("categoriaId", filtros.categoriaId);
    if (filtros?.fornecedorId)
      params.append("fornecedorId", filtros.fornecedorId);
    if (filtros?.busca) params.append("busca", filtros.busca);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<ProdutoEntity[]>(`/catalogo/produtos${qs}`);
  },

  getProdutoById: (id: string) =>
    request<ProdutoEntity>(`/catalogo/produtos/${encodeURIComponent(id)}`),

  createProduto: (dto: CreateProdutoDto) =>
    request<ProdutoEntity>("/catalogo/produtos", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  updateProduto: (id: string, dto: UpdateProdutoDto) =>
    request<ProdutoEntity>(`/catalogo/produtos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  deleteProduto: (id: string) =>
    request<{ message: string }>(
      `/catalogo/produtos/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    ),

  getCategorias: () => request<CategoriaEntity[]>("/catalogo/categorias"),

  getCategoriaById: (id: string) =>
    request<CategoriaEntity>(`/catalogo/categorias/${encodeURIComponent(id)}`),

  createCategoria: (dto: CreateCategoriaDto) =>
    request<CategoriaEntity>("/catalogo/categorias", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  updateCategoria: (id: string, dto: UpdateCategoriaDto) =>
    request<CategoriaEntity>(`/catalogo/categorias/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  deleteCategoria: (id: string) =>
    request<any>(`/catalogo/categorias/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // --- Métodos de compatibilidade de Produtos para o AppStore ---
  getProducts: async (): Promise<Product[]> => {
    const entities = await api.getProdutos();
    return Array.isArray(entities) ? entities.map(mapProdutoToProduct) : [];
  },

  getProductById: async (id: string): Promise<Product> => {
    const entity = await api.getProdutoById(id);
    return mapProdutoToProduct(entity);
  },

  createProduct: async (product: Product): Promise<Product> => {
    const dto = productToCreateDto(product);
    const created = await api.createProduto(dto);
    return mapProdutoToProduct(created);
  },

  updateProduct: async (product: Product): Promise<Product> => {
    const dto = productToUpdateDto(product);
    const updated = await api.updateProduto(product.id, dto);
    return mapProdutoToProduct(updated);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.deleteProduto(id);
  },

  // --- FornecedorController (@Controller('fornecedor') -> /api/fornecedor) ---
  getFornecedores: () => request<FornecedorEntity[]>("/fornecedor"),

  getFornecedorById: (id: string | number) =>
    request<FornecedorEntity>(`/fornecedor/${encodeURIComponent(String(id))}`),

  createFornecedor: (dto: CreateFornecedorDto) =>
    request<any>("/fornecedor", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  updateFornecedor: (id: string | number, dto: UpdateFornecedorDto) =>
    request<any>(`/fornecedor/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  deleteFornecedor: (id: string | number) =>
    request<any>(`/fornecedor/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    }),

  // --- Métodos de compatibilidade de Fornecedores para o AppStore ---
  getSuppliers: async (): Promise<Supplier[]> => {
    const list = await api.getFornecedores();
    return Array.isArray(list) ? list.map(mapFornecedorToSupplier) : [];
  },

  createSupplier: async (supplier: Supplier): Promise<Supplier> => {
    const dto = supplierToCreateDto(supplier);
    const res = await api.createFornecedor(dto);
    return res && typeof res === "object"
      ? mapFornecedorToSupplier(res)
      : supplier;
  },

  updateSupplier: async (supplier: Supplier): Promise<Supplier> => {
    const dto = supplierToUpdateDto(supplier);
    const res = await api.updateFornecedor(supplier.id, dto);
    return res && typeof res === "object"
      ? mapFornecedorToSupplier(res)
      : supplier;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await api.deleteFornecedor(id);
  },

  // --- PromocaoController (@Controller('promocao') -> /api/promocao) ---
  getPromocoes: () => request<PromocaoEntity[]>("/promocao"),

  getPromocaoById: (id: string | number) =>
    request<PromocaoEntity>(`/promocao/${encodeURIComponent(String(id))}`),

  createPromocao: (dto: CreatePromocaoDto) =>
    request<any>("/promocao", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  updatePromocao: (id: string | number, dto: UpdatePromocaoDto) =>
    request<any>(`/promocao/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  deletePromocao: (id: string | number) =>
    request<any>(`/promocao/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    }),

  // --- Métodos de compatibilidade de Promoções para o AppStore ---
  getPromotions: async (): Promise<Promotion[]> => {
    const list = await api.getPromocoes();
    return Array.isArray(list) ? list.map(mapPromocaoToPromotion) : [];
  },

  createPromotion: async (promo: Promotion): Promise<Promotion> => {
    const dto = promoToCreateDto(promo);
    const res = await api.createPromocao(dto);
    return res && typeof res === "object"
      ? mapPromocaoToPromotion(res)
      : promo;
  },

  updatePromotion: async (promo: Promotion): Promise<Promotion> => {
    const dto = promoToUpdateDto(promo);
    const res = await api.updatePromocao(promo.id, dto);
    return res && typeof res === "object"
      ? mapPromocaoToPromotion(res)
      : promo;
  },

  deletePromotion: async (id: string): Promise<void> => {
    await api.deletePromocao(id);
  },

  // --- Cupons (Compatibilidade no frontend) ---
  getCoupons: async (): Promise<Coupon[]> => {
    return [];
  },

  createCoupon: async (coupon: Coupon): Promise<Coupon> => {
    return coupon;
  },

  deleteCoupon: async (_code: string): Promise<void> => {},

  // --- PedidoController (@Controller('pedido') -> /api/pedido) ---
  getPedidos: () => request<PedidoEntity[]>("/pedido"),

  getPedidoById: (id: string | number) =>
    request<PedidoEntity>(`/pedido/${encodeURIComponent(String(id))}`),

  createPedido: (dto: CreatePedidoDto) =>
    request<any>("/pedido", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  updatePedido: (id: string | number, dto: UpdatePedidoDto) =>
    request<any>(`/pedido/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  deletePedido: (id: string | number) =>
    request<any>(`/pedido/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    }),

  // --- Métodos de compatibilidade de Pedidos para o AppStore ---
  getOrders: async (): Promise<Order[]> => {
    const list = await api.getPedidos();
    return Array.isArray(list) ? list.map(mapPedidoToOrder) : [];
  },

  createOrder: async (order: Order): Promise<Order> => {
    const dto = orderToCreateDto(order);
    const res = await api.createPedido(dto);
    return res && typeof res === "object" ? mapPedidoToOrder(res) : order;
  },

  updateOrder: async (order: Order): Promise<Order> => {
    const dto: UpdatePedidoDto = {
      valorTotal: String(order.total),
      observacao: order.pin ? `PIN:${order.pin}` : undefined,
    };
    const res = await api.updatePedido(order.id.replace(/[^0-9]/g, "") || order.id, dto);
    return res && typeof res === "object" ? mapPedidoToOrder(res) : order;
  },

  // --- PagamentoController (@Controller('pagamento') -> /api/pagamento) ---
  getPagamentos: () => request<PagamentoEntity[]>("/pagamento"),

  getPagamentoById: (id: string | number) =>
    request<PagamentoEntity>(`/pagamento/${encodeURIComponent(String(id))}`),

  createPagamento: (dto: CreatePagamentoDto) =>
    request<any>("/pagamento", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  updatePagamento: (id: string | number, dto: UpdatePagamentoDto) =>
    request<any>(`/pagamento/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  deletePagamento: (id: string | number) =>
    request<any>(`/pagamento/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    }),

  // --- Métodos de compatibilidade de Transações para o AppStore ---
  getTransactions: async (): Promise<Txn[]> => {
    const list = await api.getPagamentos();
    return Array.isArray(list) ? list.map(mapPagamentoToTxn) : [];
  },

  createTransaction: async (txn: Txn): Promise<Txn> => {
    const dto = txnToCreateDto(txn);
    const res = await api.createPagamento(dto);
    return res && typeof res === "object" ? mapPagamentoToTxn(res) : txn;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.deletePagamento(id);
  },

  // --- CarrinhoController (@Controller('carrinho') -> /api/carrinho) ---
  getCarrinho: () => request<any>("/carrinho"),
  getCarrinhoById: (id: string | number) =>
    request<any>(`/carrinho/${encodeURIComponent(String(id))}`),
  createCarrinho: (dto: CreateCarrinhoDto) =>
    request<any>("/carrinho", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  updateCarrinho: (id: string | number, dto: UpdateCarrinhoDto) =>
    request<any>(`/carrinho/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),
  deleteCarrinho: (id: string | number) =>
    request<any>(`/carrinho/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    }),

  // --- AuditoriaController (@Controller('auditoria') -> /api/auditoria) ---
  getAuditorias: () => request<any[]>("/auditoria"),
  createAuditoria: (dto: CreateAuditoriaDto) =>
    request<any>("/auditoria", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  // --- NotificacaoController (@Controller('notificacao') -> /api/notificacao) ---
  getNotificacoes: () => request<any[]>("/notificacao"),
  createNotificacao: (dto: CreateNotificacaoDto) =>
    request<any>("/notificacao", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};
