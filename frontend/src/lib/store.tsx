"use client"
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { api } from "@/services/api"
import {
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
} from "./data"

export type Role = "cliente" | "admin"

export type CartLine = { product: Product; qty: number }

export type CheckoutPayload = {
  items: CartLine[]
  total: number
  method: "Pix" | "Cartão"
  couponCode?: string
}

export type RepassePayload = {
  description: string
  amount: number
  method: "Pix" | "Cartão" | "Dinheiro"
  validator: string
  validatorRole?: string
  date?: string
  status?: "Concluído" | "Processando"
}

type Store = {
  role: Role
  setRole: (r: Role) => void
  user: MockUser | null
  users: MockUser[]
  login: (email: string, password?: string, forceRole?: Role) => Promise<boolean>
  logout: () => void

  // Estados de Carregamento e Erro
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  clearError: () => void

  offerDeadline: string
  setOfferDeadline: (deadline: string) => void

  products: Product[]
  addProduct: (p: Product) => Promise<Product>
  updateProduct: (p: Product) => Promise<Product>
  removeProduct: (id: string) => Promise<void>

  suppliers: Supplier[]
  addSupplier: (s: Supplier) => Promise<Supplier>
  updateSupplier: (s: Supplier) => Promise<Supplier>
  removeSupplier: (id: string) => Promise<void>
  updateSupplierStage: (supplierId: string, newStage: string, syncOrders?: boolean) => Promise<void>
  updateFulfillmentStatus: (orderId: string, supplierId: string, status: string) => Promise<void>

  coupons: Coupon[]
  addCoupon: (c: Coupon) => Promise<Coupon>
  removeCoupon: (code: string) => Promise<void>

  promotions: Promotion[]
  addPromotion: (p: Promotion) => Promise<Promotion>
  updatePromotion: (p: Promotion) => Promise<Promotion>
  removePromotion: (id: string) => Promise<void>

  orders: Order[]
  txns: Txn[]
  addRepasse: (p: RepassePayload) => Promise<Txn>
  removeTxn: (id: string) => Promise<void>
  checkout: (p: CheckoutPayload) => Promise<{ id: string; pin: string }>

  cart: CartLine[]
  cartCount: number
  addToCart: (p: Product) => void
  setQty: (id: string, qty: number) => void
  clearCart: () => void
  cartOpen: boolean
  setCartOpen: (v: boolean) => void
}

const Ctx = createContext<Store | null>(null)

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error("useStore precisa estar dentro de <AppStore>")
  return s
}

export function AppStore({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [users, setUsers] = useState<MockUser[]>([])
  const [role, setRoleState] = useState<Role>("cliente")
  const [offerDeadline, setOfferDeadline] = useState<string>(OFFER_DEADLINE)

  // SEM FALLBACK: Inicializados com arrays vazios
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [txns, setTxns] = useState<Txn[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [userCarts, setUserCarts] = useState<Record<string, CartLine[]>>({})
  const [cartOpen, setCartOpen] = useState(false)

  // Estados de Carregamento e Erro de Conexão à API
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [
        remoteProducts,
        remoteSuppliers,
        remotePromotions,
        remoteCoupons,
        remoteOrders,
        remoteTxns,
        remoteUsers,
      ] = await Promise.all([
        api.getProducts().catch((err) => {
          console.warn("[AppStore] Falha ao carregar produtos:", err)
          return [] as Product[]
        }),
        api.getSuppliers().catch((err) => {
          console.warn("[AppStore] Falha ao carregar fornecedores:", err)
          return [] as Supplier[]
        }),
        api.getPromotions().catch((err) => {
          console.warn("[AppStore] Falha ao carregar promoções:", err)
          return [] as Promotion[]
        }),
        api.getCoupons().catch(() => [] as Coupon[]),
        api.getOrders().catch((err) => {
          console.warn("[AppStore] Falha ao carregar pedidos:", err)
          return [] as Order[]
        }),
        api.getTransactions().catch((err) => {
          console.warn("[AppStore] Falha ao carregar transações:", err)
          return [] as Txn[]
        }),
        api.getUsers().catch(() => [] as MockUser[]),
      ])

      setProducts(remoteProducts)
      setSuppliers(remoteSuppliers)
      setPromotions(remotePromotions)
      setCoupons(remoteCoupons)
      setOrders(remoteOrders)
      setTxns(remoteTxns)
      setUsers(remoteUsers)
    } catch (err: any) {
      console.error("[AppStore] Erro ao carregar dados da API:", err)
      setError(
        err?.message ||
          "Não foi possível conectar à API NestJS em http://localhost:3001/api.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Restaura sessão existente a partir do token JWT salvo
  useEffect(() => {
    const token = api.getToken()
    if (token) {
      api
        .getProfile()
        .then((profile) => {
          if (profile) {
            const restoredUser: MockUser = {
              id: String(profile.idUsuario),
              name: profile.nome,
              email: profile.email,
              role: (profile.cargo as Role) || "cliente",
              courseOrDept:
                profile.cargo === "admin"
                  ? "Diretoria DIACOM"
                  : "Instituto de Computação",
            }
            setUser(restoredUser)
            setRoleState(restoredUser.role)
          }
        })
        .catch(() => {
          api.removeToken()
        })
    }
    loadData()
  }, [])

  const cartCount = cart.reduce((n, l) => n + l.qty, 0)

  function setRole(r: Role) {
    setRoleState(r)
    if (user) {
      const matchingUser = users.find((u) => u.role === r)
      if (matchingUser) {
        setUser(matchingUser)
      } else {
        setUser({ ...user, role: r })
      }
    }
  }

  async function login(email: string, password?: string, forceRole?: Role): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase()
    try {
      await api.login({
        email: cleanEmail,
        senha: password || "",
      })

      let authenticatedUser: MockUser
      try {
        const profile = await api.getProfile()
        authenticatedUser = {
          id: String(profile.idUsuario),
          name: profile.nome,
          email: profile.email,
          role: (profile.cargo as Role) || "cliente",
          courseOrDept:
            profile.cargo === "admin"
              ? "Diretoria DIACOM"
              : "Instituto de Computação",
        }
      } catch {
        const targetRole = forceRole || (cleanEmail.includes("admin") ? "admin" : "cliente")
        authenticatedUser = {
          id: `u-${Date.now()}`,
          name: cleanEmail.split("@")[0] || "Usuário",
          email: cleanEmail,
          role: targetRole,
          courseOrDept:
            targetRole === "admin" ? "Diretoria DIACOM" : "Instituto de Computação",
        }
      }

      setUser(authenticatedUser)
      setRoleState(authenticatedUser.role)
      setCart(userCarts[authenticatedUser.id] ?? [])
      return true
    } catch (err: any) {
      console.error("[AppStore] Erro ao autenticar na API:", err)
      throw err
    }
  }

  function logout() {
    api.removeToken()
    setUser(null)
    setRoleState("cliente")
    setCart([])
    setCartOpen(false)
  }

  /* --- Fornecedores (POST, PUT, DELETE) --- */
  async function addSupplier(s: Supplier): Promise<Supplier> {
    try {
      const created = await api.createSupplier(s)
      setSuppliers((prev) => [created, ...prev])
      return created
    } catch (err: any) {
      setError(`Erro ao cadastrar fornecedor: ${err.message}`)
      throw err
    }
  }

  async function updateSupplier(s: Supplier): Promise<Supplier> {
    try {
      const updated = await api.updateSupplier(s)
      setSuppliers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      return updated
    } catch (err: any) {
      setError(`Erro ao atualizar fornecedor: ${err.message}`)
      throw err
    }
  }

  async function removeSupplier(id: string): Promise<void> {
    try {
      await api.deleteSupplier(id)
      setSuppliers((prev) => prev.filter((x) => x.id !== id))
    } catch (err: any) {
      setError(`Erro ao remover fornecedor: ${err.message}`)
      throw err
    }
  }

  async function updateSupplierStage(supplierId: string, newStage: string, syncOrders = false): Promise<void> {
    const sup = suppliers.find((s) => s.id === supplierId)
    if (!sup) return
    const updatedSup: Supplier = { ...sup, currentStage: newStage }

    try {
      await api.updateSupplier(updatedSup)
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplierId ? updatedSup : s)),
      )

      if (syncOrders) {
        const affected = orders.filter((o) =>
          o.fulfillments.some((f) => f.supplierId === supplierId),
        )
        const updatedList: Order[] = []
        for (const order of affected) {
          const updatedOrder: Order = {
            ...order,
            fulfillments: order.fulfillments.map((f) =>
              f.supplierId === supplierId ? { ...f, status: newStage as any } : f,
            ),
          }
          await api.updateOrder(updatedOrder)
          updatedList.push(updatedOrder)
        }
        setOrders((prev) =>
          prev.map((o) => updatedList.find((u) => u.id === o.id) || o),
        )
      }
    } catch (err: any) {
      setError(`Erro ao atualizar etapa do fornecedor: ${err.message}`)
      throw err
    }
  }

  async function updateFulfillmentStatus(orderId: string, supplierId: string, status: string): Promise<void> {
    const target = orders.find((o) => o.id === orderId)
    if (!target) return
    const updatedOrder: Order = {
      ...target,
      fulfillments: target.fulfillments.map((f) =>
        f.supplierId === supplierId ? { ...f, status: status as any } : f,
      ),
    }

    try {
      await api.updateOrder(updatedOrder)
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order)),
      )
    } catch (err: any) {
      setError(`Erro ao atualizar status do pedido: ${err.message}`)
      throw err
    }
  }

  /* --- Cupons (POST, DELETE) --- */
  async function addCoupon(c: Coupon): Promise<Coupon> {
    const formatted: Coupon = {
      ...c,
      code: c.code.trim().toUpperCase(),
    }
    try {
      const created = await api.createCoupon(formatted)
      setCoupons((prev) => [
        created,
        ...prev.filter((x) => x.code.toUpperCase() !== formatted.code),
      ])
      return created
    } catch (err: any) {
      setError(`Erro ao cadastrar cupom: ${err.message}`)
      throw err
    }
  }

  async function removeCoupon(code: string): Promise<void> {
    const normalized = code.trim().toUpperCase()
    try {
      await api.deleteCoupon(normalized)
      setCoupons((prev) => prev.filter((x) => x.code.toUpperCase() !== normalized))
    } catch (err: any) {
      setError(`Erro ao remover cupom: ${err.message}`)
      throw err
    }
  }

  /* --- Produtos (POST, PUT, DELETE) --- */
  async function addProduct(p: Product): Promise<Product> {
    try {
      const created = await api.createProduct(p)
      setProducts((prev) => [created, ...prev])
      return created
    } catch (err: any) {
      setError(`Erro ao salvar produto: ${err.message}`)
      throw err
    }
  }

  async function updateProduct(p: Product): Promise<Product> {
    try {
      const updated = await api.updateProduct(p)
      setProducts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      return updated
    } catch (err: any) {
      setError(`Erro ao atualizar produto: ${err.message}`)
      throw err
    }
  }

  async function removeProduct(id: string): Promise<void> {
    try {
      await api.deleteProduct(id)
      setProducts((prev) => prev.filter((x) => x.id !== id))
      setPromotions((prev) =>
        prev.map((pr) => ({
          ...pr,
          productIds: pr.productIds.filter((pid) => pid !== id),
        })),
      )
    } catch (err: any) {
      setError(`Erro ao remover produto: ${err.message}`)
      throw err
    }
  }

  /* --- Promoções (POST, PUT, DELETE) --- */
  async function addPromotion(p: Promotion): Promise<Promotion> {
    try {
      const created = await api.createPromotion(p)
      setPromotions((prev) => [created, ...prev])
      return created
    } catch (err: any) {
      setError(`Erro ao criar promoção: ${err.message}`)
      throw err
    }
  }

  async function updatePromotion(p: Promotion): Promise<Promotion> {
    try {
      const updated = await api.updatePromotion(p)
      setPromotions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      return updated
    } catch (err: any) {
      setError(`Erro ao atualizar promoção: ${err.message}`)
      throw err
    }
  }

  async function removePromotion(id: string): Promise<void> {
    try {
      await api.deletePromotion(id)
      setPromotions((prev) => prev.filter((x) => x.id !== id))
    } catch (err: any) {
      setError(`Erro ao remover promoção: ${err.message}`)
      throw err
    }
  }

  /* --- Repasses & Transações (POST, DELETE) --- */
  async function addRepasse(payload: RepassePayload): Promise<Txn> {
    const id = `rep-${Date.now()}`
    const today = payload.date || new Date().toISOString().slice(0, 10)
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
    }

    try {
      const created = await api.createTransaction(newTxn)
      setTxns((prev) => [created, ...prev])
      return created
    } catch (err: any) {
      setError(`Erro ao salvar repasse: ${err.message}`)
      throw err
    }
  }

  async function removeTxn(id: string): Promise<void> {
    try {
      await api.deleteTransaction(id)
      setTxns((prev) => prev.filter((t) => t.id !== id))
    } catch (err: any) {
      setError(`Erro ao remover transação: ${err.message}`)
      throw err
    }
  }

  /* --- Carrinho --- */
  function addToCart(product: Product) {
    setCart((prev) => {
      const found = prev.find((l) => l.product.id === product.id)
      const next = found
        ? prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { product, qty: 1 }]
      if (user) {
        setUserCarts((all) => ({ ...all, [user.id]: next }))
      }
      return next
    })
  }

  function setQty(id: string, qty: number) {
    setCart((prev) => {
      const next =
        qty <= 0
          ? prev.filter((l) => l.product.id !== id)
          : prev.map((l) => (l.product.id === id ? { ...l, qty } : l))
      if (user) {
        setUserCarts((all) => ({ ...all, [user.id]: next }))
      }
      return next
    })
  }

  function clearCart() {
    setCart([])
    if (user) {
      setUserCarts((all) => ({ ...all, [user.id]: [] }))
    }
  }

  /* --- Checkout / Pedido (POST) --- */
  async function checkout(p: CheckoutPayload): Promise<{ id: string; pin: string }> {
    const id = `#DC-${Date.now().toString().slice(-4)}`
    const pin = genPin()
    const today = new Date().toISOString().slice(0, 10)
    const fee = +(p.total * PAYMENT_FEE[p.method]).toFixed(2)

    const bySupplier = new Map<string, OrderItem[]>()
    for (const l of p.items) {
      const arr = bySupplier.get(l.product.supplierId) ?? []
      arr.push({ productId: l.product.id, name: l.product.name, qty: l.qty })
      bySupplier.set(l.product.supplierId, arr)
    }

    const fulfillments: Fulfillment[] = Array.from(bySupplier.entries()).map(
      ([supplierId, items]) => {
        const sup = suppliers.find((s) => s.id === supplierId)
        const initialStatus = sup?.preparationFlow?.[0] ?? "Confirmado"
        return { supplierId, items, status: initialStatus as any }
      },
    )

    const itemsLabel = p.items
      .map((l) => `${l.product.name} (${l.qty}un)`)
      .join(", ")

    const saleTxn: Txn = {
      id: `${id}-v`,
      date: today,
      order: id,
      description: `Venda — ${itemsLabel}${p.couponCode ? ` · cupom ${p.couponCode}` : ""}`,
      category: "Vendas",
      method: p.method,
      amount: p.total,
      status: "Concluído",
    }
    const feeTxn: Txn = {
      id: `${id}-t`,
      date: today,
      order: id,
      description: `Taxa de processamento ${p.method}`,
      category: "Taxa",
      method: p.method,
      amount: -fee,
      status: "Concluído",
    }

    const order: Order = {
      id,
      date: today,
      buyer: user?.name || "Cliente Convidado",
      buyerId: user?.id,
      total: p.total,
      method: p.method,
      pin,
      fulfillments,
    }

    try {
      const [savedSale, savedFee, savedOrder] = await Promise.all([
        api.createTransaction(saleTxn),
        api.createTransaction(feeTxn),
        api.createOrder(order),
      ])

      setTxns((prev) => [savedSale, savedFee, ...prev])
      setOrders((prev) => [savedOrder, ...prev])
      setCart([])
      if (user) {
        setUserCarts((all) => ({ ...all, [user.id]: [] }))
      }
      return { id: savedOrder.id, pin: savedOrder.pin }
    } catch (err: any) {
      setError(`Erro ao finalizar pedido na API: ${err.message}`)
      throw err
    }
  }

  const value: Store = {
    role,
    setRole,
    user,
    users,
    login,
    logout,
    isLoading,
    error,
    refetch: loadData,
    clearError,
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
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
