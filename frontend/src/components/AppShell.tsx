"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useStore, type Role } from "@/lib/store"
import { CartIcon } from "./Shared"
import { CartDrawer } from "@/components/CartDrawer"

type NavItem = { label: string; href: string }

const CLIENT_NAV: NavItem[] = [
  { label: "Loja", href: "/" },
  { label: "Meus Pedidos", href: "/meus-pedidos" },
  { label: "Transparência", href: "/transparencia" },
]

const ADMIN_NAV: NavItem[] = [
  { label: "Loja", href: "/" },
  { label: "Controle", href: "/admin/controle" },
  { label: "Promoções", href: "/admin/promocoes" },
  { label: "Transparência", href: "/transparencia" },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const { role } = useStore()
  const nav = role === "admin" ? ADMIN_NAV : CLIENT_NAV

  return (
    <div className="min-h-screen bg-ink text-fg font-sans">
      <Header nav={nav} />
      <main className="print:pt-0">{children}</main>
      <Footer nav={nav} />
      {role === "cliente" && <CartDrawer />}
    </div>
  )
}

function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role, setRole, cartCount, setCartOpen } = useStore()

  function switchRole(r: Role) {
    setRole(r)
    setCartOpen(false)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-4 rounded-2xl border border-line bg-panel/80 px-4 py-2.5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2" aria-label="Início">
          <span className="grid size-9 place-items-center rounded-lg bg-cyan font-display text-base font-black tracking-tight text-ink">
            DC
          </span>
          <span className="hidden font-display text-lg font-extrabold tracking-tight sm:block">
            DIACOM<span className="text-cyan"> Loja</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === n.href ? "bg-panel-2 text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <RoleToggle role={role} onSwitch={switchRole} />
          {role === "cliente" && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-fg"
              aria-label="Carrinho"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-4.5 place-items-center rounded-full bg-cyan px-1 font-mono text-[10px] font-semibold text-ink">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Nav mobile */}
      <div className="mx-auto mt-2 flex max-w-6xl gap-1 overflow-x-auto px-1 md:hidden">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
              pathname === n.href ? "bg-panel-2 text-fg" : "text-muted"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </div>
    </header>
  )
}

function RoleToggle({ role, onSwitch }: { role: Role; onSwitch: (r: Role) => void }) {
  return (
    <div className="flex rounded-lg border border-line p-0.5">
      {(["cliente", "admin"] as const).map((r) => (
        <button
          key={r}
          onClick={() => onSwitch(r)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
            role === r ? "bg-cyan text-ink" : "text-muted hover:text-fg"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

function Footer({ nav }: { nav: NavItem[] }) {
  return (
    <footer className="border-t border-line px-4 py-10 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <p className="font-display font-bold text-fg">
          DIACOM<span className="text-cyan"> Loja</span>
        </p>
        <div className="flex gap-4">
          {nav
            .filter((n) => !n.href.startsWith("/admin"))
            .map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-fg">
                {n.label}
              </Link>
            ))}
        </div>
      </div>
    </footer>
  )
}
