"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useStore, type Role } from "@/lib/store"
import { MOCK_USERS, type MockUser } from "@/lib/data"

export function LoginView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/"

  const { user, login, logout } = useStore()

  const [activeTab, setActiveTab] = useState<Role>(user?.role ?? "cliente")
  const [email, setEmail] = useState(
    user?.role === "admin" ? "admin@diacom.ic.ufal.br" : "aluno@ic.ufal.br",
  )
  const [password, setPassword] = useState("••••••••")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  )

  function handleTabChange(targetRole: Role) {
    setActiveTab(targetRole)
    const targetUser = MOCK_USERS.find((u) => u.role === targetRole)
    if (targetUser) {
      setEmail(targetUser.email)
      setPassword("123456")
    }
    setFeedback(null)
  }

  function fillMockUser(mockUser: MockUser) {
    setActiveTab(mockUser.role)
    setEmail(mockUser.email)
    setPassword("123456")
    setFeedback({
      type: "success",
      message: `Credenciais de teste preenchidas para ${mockUser.name} (${mockUser.role})`,
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setFeedback({ type: "error", message: "Informe seu e-mail institucional." })
      return
    }

    setIsLoading(true)
    setFeedback(null)

    setTimeout(() => {
      login(email, password, activeTab)
      setIsLoading(false)
      setFeedback({
        type: "success",
        message: `Bem-vindo(a)! Conectado como ${activeTab === "admin" ? "Administrador" : "Cliente"}.`,
      })

      setTimeout(() => {
        router.push(activeTab === "admin" ? "/admin/controle" : redirectPath)
      }, 700)
    }, 600)
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand / Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="grid size-12 place-items-center rounded-xl bg-cyan font-display text-xl font-black text-ink shadow-[0_0_24px_rgba(34,224,238,0.25)]">
              DC
            </span>
          </Link>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
            DIACOM<span className="text-cyan"> Acesso</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Portal unificado da Loja do Instituto de Computação
          </p>
        </div>

        {/* Current session info banner if logged in */}
        {user && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-panel p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-cyan" />
              </span>
              <div>
                <p className="font-medium text-fg">
                  Conectado como <span className="font-semibold text-cyan">{user.name}</span>
                </p>
                <p className="text-muted capitalize">Perfil ativo: {user.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout()
                setFeedback({ type: "success", message: "Sessão encerrada." })
              }}
              className="rounded-lg border border-line px-2.5 py-1 text-muted transition-colors hover:border-red-400 hover:text-red-400"
            >
              Sair
            </button>
          </div>
        )}

        {/* Login Card */}
        <div className="mt-6 rounded-2xl border border-line bg-panel p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-ink/70 p-1">
            <button
              type="button"
              onClick={() => handleTabChange("cliente")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                activeTab === "cliente"
                  ? "bg-cyan text-ink shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              <span>🎓</span>
              <span>Cliente (Aluno)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("admin")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                activeTab === "admin"
                  ? "bg-cyan text-ink shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              <span>⚡</span>
              <span>Admin (DIACOM)</span>
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-line/60 bg-ink/30 px-3.5 py-2.5 text-xs text-muted">
            {activeTab === "cliente" ? (
              <p>
                Área do cliente: navegue na vitrine, realize pedidos, aplique cupons e acompanhe
                a preparação de produtos por PIN.
              </p>
            ) : (
              <p>
                Área administrativa: controle de vendas, fornecedores e fluxos, emissão de
                promoções, cupons de desconto e repasses.
              </p>
            )}
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`mt-4 rounded-xl border px-3.5 py-2.5 text-xs transition-all ${
                feedback.type === "success"
                  ? "border-cyan/40 bg-cyan/10 text-cyan"
                  : "border-red-400/40 bg-red-400/10 text-red-300"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted">
                E-mail institucional
              </label>
              <div className="relative mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === "admin" ? "admin@diacom.ic.ufal.br" : "seu.nome@ic.ufal.br"
                  }
                  required
                  className="w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted">Senha de acesso</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-cyan/80 hover:text-cyan"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan py-3 text-sm font-bold text-ink transition-all hover:bg-[#5cebf5] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  <span>Autenticando…</span>
                </>
              ) : (
                <span>Entrar como {activeTab === "admin" ? "Administrador" : "Cliente"}</span>
              )}
            </button>
          </form>

          {/* Preset Fill Accounts for Evaluation */}
          <div className="mt-6 border-t border-line/80 pt-5">
            <p className="label text-[10px] text-muted">Acesso rápido (dados mockados)</p>
            <div className="mt-2.5 space-y-2">
              {MOCK_USERS.map((mockUser) => (
                <button
                  key={mockUser.id}
                  type="button"
                  onClick={() => fillMockUser(mockUser)}
                  className="flex w-full items-center justify-between rounded-xl border border-line/70 bg-ink/40 p-2.5 text-left transition-colors hover:border-cyan/40 hover:bg-panel-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-fg text-xs">{mockUser.name}</span>
                      <span
                        className={`rounded-full border px-1.5 py-0.2 font-mono text-[9px] uppercase ${
                          mockUser.role === "admin"
                            ? "border-cyan/40 text-cyan bg-cyan/5"
                            : "border-muted/40 text-muted"
                        }`}
                      >
                        {mockUser.role}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-muted">{mockUser.email}</p>
                  </div>
                  <span className="text-xs text-cyan opacity-80">Usar →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="transition-colors hover:text-cyan">
            ← Voltar para a loja sem autenticar
          </Link>
        </p>
      </div>
    </div>
  )
}

