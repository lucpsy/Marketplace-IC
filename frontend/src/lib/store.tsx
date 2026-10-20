"use client"
import { createContext, useContext, useRef, useState, type ReactNode } from "react"
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
  login: (email: string, password?: string, forceRole?: Role) => boolean
  logout: () => void

  products: Product[]
  addProduct: (p: Product) => void
  updateProduct: (p: Product) => void
  removeProduct: (id: string) => void

  suppliers: Supplier[]
  addSupplier: (s: Supplier) => void
  updateSupplier: (s: Supplier) => void
  removeSupplier: (id: string) => void
  updateFulfillmentStatus: (orderId: string, supplierId: string, status: string) => void

  coupons: Coupon[]
  addCoupon: (c: Coupon) => void
  removeCoupon: (code: string) => void

  promotions: Promotion[]
  addPromotion: (p: Promotion) => void
  updatePromotion: (p: Promotion) => void
  removePromotion: (id: string) => void

  orders: Order[]
  txns: Txn[]
  addRepasse: (p: RepassePayload) => void
  removeTxn: (id: string) => void
  checkout: (p: CheckoutPayload) => { id: string; pin: string }

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
  const [role, setRoleState] = useState<Role>("cliente")
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS)
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS)
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS)
  const [txns, setTxns] = useState<Txn[]>(TRANSACTIONS)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [cart, setCart] = useState<CartLine[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const nextOrderNo = useRef(1043)

  const cartCount = cart.reduce((n, l) => n + l.qty, 0)

  function setRole(r: Role) {
    setRoleState(r)
    if (user) {
      const matchingUser = MOCK_USERS.find((u) => u.role === r)
      if (matchingUser) {
        setUser(matchingUser)
      } else {
        setUser({ ...user, role: r })
      }
    }
  }

  function login(email: string, _password?: string, forceRole?: Role): boolean {
    const cleanEmail = email.trim().toLowerCase()
    const targetRole = forceRole || (cleanEmail.includes("admin") ? "admin" : "cliente")
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.role === targetRole,
    )

    if (found) {
      setUser(found)
      setRoleState(found.role)
    } else {
      const newUser: MockUser = {
        id: `u-${Date.now()}`,
        name: cleanEmail.split("@")[0] || "Usuário",
        email: cleanEmail,
        role: targetRole,
        courseOrDept: targetRole === "admin" ? "Diretoria DIACOM" : "Instituto de Computação",
      }
      setUser(newUser)
      setRoleState(targetRole)
    }
    return true
  }

  function logout() {
    setUser(null)
    setRoleState("cliente")
  }

  /* Suppliers */
  function addSupplier(s: Supplier) {
    setSuppliers((prev) => [s, ...prev])
  }

  function updateSupplier(s: Supplier) {
    setSuppliers((prev) => prev.map((x) => (x.id === s.id ? s : x)))
  }

  function removeSupplier(id: string) {
    setSuppliers((prev) => prev.filter((x) => x.id !== id))
  }

  function updateFulfillmentStatus(orderId: string, supplierId: string, status: string) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        return {
          ...order,
          fulfillments: order.fulfillments.map((f) =>
            f.supplierId === supplierId ? { ...f, status: status as any } : f,
          ),
        }
      }),
    )
  }

  /* Coupons */
  function addCoupon(c: Coupon) {
    const formatted: Coupon = {
      ...c,
      code: c.code.trim().toUpperCase(),
    }
    setCoupons((prev) => [
      formatted,
      ...prev.filter((x) => x.code.toUpperCase() !== formatted.code),
    ])
  }

  function removeCoupon(code: string) {
    const normalized = code.trim().toUpperCase()
    setCoupons((prev) => prev.filter((x) => x.code.toUpperCase() !== normalized))
  }

  /* Products */
  function addProduct(p: Product) {
    setProducts((prev) => [p, ...prev])
  }
  function updateProduct(p: Product) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  }
  function removeProduct(id: string) {
    setProducts((prev) => prev.filter((x) => x.id !== id))
    setPromotions((prev) =>
      prev.map((pr) => ({
        ...pr,
        productIds: pr.productIds.filter((pid) => pid !== id),
      })),
    )
  }

  /* Promotions */
  function addPromotion(p: Promotion) {
    setPromotions((prev) => [p, ...prev])
  }
  function updatePromotion(p: Promotion) {
    setPromotions((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  }
  function removePromotion(id: string) {
    setPromotions((prev) => prev.filter((x) => x.id !== id))
  }

  /* Repasses & Transactions */
  function addRepasse(payload: RepassePayload) {
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
    setTxns((prev) => [newTxn, ...prev])
  }

  function removeTxn(id: string) {
    setTxns((prev) => prev.filter((t) => t.id !== id))
  }

  /* Cart */
  function addToCart(product: Product) {
    setCart((prev) => {
      const found = prev.find((l) => l.product.id === product.id)
      if (found)
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l,
        )
      return [...prev, { product, qty: 1 }]
    })
    setCartOpen(true)
  }

  function setQty(id: string, qty: number) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.product.id !== id)
        : prev.map((l) => (l.product.id === id ? { ...l, qty } : l)),
    )
  }

  function clearCart() {
    setCart([])
  }

  function checkout(p: CheckoutPayload) {
    const id = `#DC-${nextOrderNo.current++}`
    const pin = genPin()
    const today = new Date().toISOString().slice(0, 10)
    const fee = +(p.total * PAYMENT_FEE[p.method]).toFixed(2)

    // Agrupa itens do carrinho por fornecedor -> fulfillments
    const bySupplier = new Map<string, OrderItem[]>()
    for (const l of p.items) {
      const arr = bySupplier.get(l.product.supplierId) ?? []
      arr.push({ productId: l.product.id, name: l.product.name, qty: l.qty })
      bySupplier.set(l.product.supplierId, arr)
    }
    const fulfillments: Fulfillment[] = Array.from(bySupplier.entries()).map(
      ([supplierId, items]) => {
        const sup = suppliers.find((s) => s.id === supplierId)
        const initialStatus = sup?.preparationFlow[0] ?? "Confirmado"
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
      buyer: user?.name || "Você",
      total: p.total,
      method: p.method,
      pin,
      fulfillments,
    }

    setTxns((prev) => [saleTxn, feeTxn, ...prev])
    setOrders((prev) => [order, ...prev])
    setCart([])
    return { id, pin }
  }

  const value: Store = {
    role,
    setRole,
    user,
    login,
    logout,
    products,
    addProduct,
    updateProduct,
    removeProduct,
    suppliers,
    addSupplier,
    updateSupplier,
    removeSupplier,
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

