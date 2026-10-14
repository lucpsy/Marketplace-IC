"use client"
import { createContext, useContext, useRef, useState, type ReactNode } from "react"
import {
  PRODUCTS,
  PROMOTIONS,
  TRANSACTIONS,
  INITIAL_ORDERS,
  PAYMENT_FEE,
  genPin,
  type Product,
  type Promotion,
  type Txn,
  type Order,
  type Fulfillment,
  type OrderItem,
} from "./data"

export type Role = "cliente" | "admin"

export type CartLine = { product: Product; qty: number }

export type CheckoutPayload = {
  items: CartLine[]
  total: number
  method: "Pix" | "Cartão"
  couponCode?: string
}

type Store = {
  role: Role
  setRole: (r: Role) => void

  products: Product[]
  addProduct: (p: Product) => void
  updateProduct: (p: Product) => void
  removeProduct: (id: string) => void

  promotions: Promotion[]
  addPromotion: (p: Promotion) => void
  updatePromotion: (p: Promotion) => void
  removePromotion: (id: string) => void

  orders: Order[]
  txns: Txn[]
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
  const [role, setRole] = useState<Role>("cliente")
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [promotions, setPromotions] = useState<Promotion[]>(PROMOTIONS)
  const [txns, setTxns] = useState<Txn[]>(TRANSACTIONS)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [cart, setCart] = useState<CartLine[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const nextOrderNo = useRef(1043)

  const cartCount = cart.reduce((n, l) => n + l.qty, 0)

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

  function addPromotion(p: Promotion) {
    setPromotions((prev) => [p, ...prev])
  }
  function updatePromotion(p: Promotion) {
    setPromotions((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  }
  function removePromotion(id: string) {
    setPromotions((prev) => prev.filter((x) => x.id !== id))
  }

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
      ([supplierId, items]) => ({ supplierId, items, status: "Confirmado" }),
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
      buyer: "Você",
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
    products,
    addProduct,
    updateProduct,
    removeProduct,
    promotions,
    addPromotion,
    updatePromotion,
    removePromotion,
    orders,
    txns,
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
