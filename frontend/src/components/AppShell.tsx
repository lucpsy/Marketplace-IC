"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useStore } from "@/lib/store"
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
  { label: "Fornecedores", href: "/admin/fornecedores" },
  { label: "Promoções & Cupons", href: "/admin/promocoes" },
  { label: "Transparência", href: "/transparencia" },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const { user } = useStore()
  const nav = user?.role === "admin" ? ADMIN_NAV : CLIENT_NAV

  return (
    <div className="min-h-screen bg-ink text-fg font-sans">
      <Header nav={nav} />
      <main className="print:pt-0">{children}</main>
      <Footer nav={nav} />
      {user?.role !== "admin" && <CartDrawer />}
    </div>
  )
}

function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, cartCount, setCartOpen } = useStore()

  function handleLogout() {
    logout()
    setCartOpen(false)
    if (pathname.startsWith("/admin")) {
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border border-line bg-panel/85 px-4 py-2.5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2" aria-label="Início">
          <span className="grid size-9 place-items-center rounded-lg bg-cyan font-display text-base font-black tracking-tight text-ink shadow-[0_0_12px_rgba(34,224,238,0.2)]">
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

        <div className="ml-auto flex items-center gap-2.5">
          {/* User Account State: Disconnected vs Logged In */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl border border-line bg-panel-2/70 px-2.5 py-1.5 text-xs transition-colors hover:border-cyan/40 hover:bg-panel-2"
                title="Ver perfil / Alternar conta"
              >
                <span className="grid size-5 place-items-center rounded-full bg-cyan/15 font-mono text-[10px] font-bold text-cyan">
                  {user.name[0].toUpperCase()}
                </span>
                <span className="hidden max-w-[110px] truncate text-fg font-medium sm:inline">
                  {user.name}
                </span>
                <span
                  className={`rounded-full border px-1.5 py-0.2 font-mono text-[9px] uppercase ${
                    user.role === "admin"
                      ? "border-cyan/40 bg-cyan/10 text-cyan font-bold"
                      : "border-muted/40 text-muted"
                  }`}
                >
                  {user.role}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-line/80 px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-red-400 hover:text-red-400"
                title="Desconectar"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl border border-cyan/40 bg-cyan/10 px-3.5 py-1.5 text-xs font-semibold text-cyan transition-colors hover:bg-cyan/20"
            >
              <span>Entrar</span>
            </Link>
          )}

          {/* Cart button (only for visitors or clients, not admin) */}
          {user?.role !== "admin" && (
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

function Footer({ nav }: { nav: NavItem[] }) {
  const { user } = useStore()

  return (
    <footer className="border-t border-line px-4 py-10 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <div>
          <p className="font-display font-bold text-fg">
            DIACOM<span className="text-cyan"> Loja</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Diretório Acadêmico do Instituto de Computação — UFAL
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          {nav
            .filter((n) => !n.href.startsWith("/admin"))
            .map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-fg">
                {n.label}
              </Link>
            ))}
          <Link href="/login" className="hover:text-cyan text-xs">
            {user ? `Conta (${user.name})` : "Entrar no sistema"}
          </Link>
        </div>
      </div>
    </footer>
  )
}
