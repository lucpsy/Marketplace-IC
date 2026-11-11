"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { MOCK_USERS } from "@/lib/data"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Detecta o role pelo e-mail, usando os mocks como lookup (provisório). */
function resolveRole(email: string) {
  const found = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  )
  return found?.role ?? "cliente"
}

// ---------------------------------------------------------------------------
// Sub-component: Register Form
// ---------------------------------------------------------------------------

function RegisterForm({ onCancel }: { onCancel: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Informe seu nome completo." })
      return
    }
    if (!email.includes("@")) {
      setFeedback({ type: "error", message: "Informe um e-mail válido." })
      return
    }
    if (password.length < 6) {
      setFeedback({ type: "error", message: "A senha deve ter ao menos 6 caracteres." })
      return
    }
    if (password !== confirm) {
      setFeedback({ type: "error", message: "As senhas não coincidem." })
      return
    }

    setIsLoading(true)
    setFeedback(null)

    // Simula chamada de API
    setTimeout(() => {
      setIsLoading(false)
      setFeedback({
        type: "success",
        message: "Conta criada com sucesso! Você já pode fazer login.",
      })
      setTimeout(onCancel, 1500)
    }, 800)
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-panel p-6 shadow-2xl backdrop-blur-sm sm:p-8">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="label text-cyan">Novo acesso</p>
          <h2 className="mt-0.5 font-display text-xl font-bold">Criar conta</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted transition-colors hover:text-fg"
          aria-label="Fechar cadastro"
        >
          ✕
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-4 rounded-xl border px-3.5 py-2.5 text-xs ${feedback.type === "success"
            ? "border-cyan/40 bg-cyan/10 text-cyan"
            : "border-red-400/40 bg-red-400/10 text-red-300"
            }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-muted">Nome completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Maria da Silva"
            required
            className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-muted">E-mail institucional</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.nome@ic.ufal.br"
            required
            className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-muted">Senha</label>
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-[11px] text-cyan/80 hover:text-cyan"
            >
              {showPass ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
          />
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-xs font-medium text-muted">Confirmar senha</label>
          <input
            type={showPass ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            required
            className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted transition-colors hover:border-muted hover:text-fg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan py-2.5 text-sm font-bold text-ink transition-all hover:bg-[#5cebf5] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                <span>Criando conta…</span>
              </>
            ) : (
              <span>Criar conta</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component: LoginView
// ---------------------------------------------------------------------------

export function LoginView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/"

  const { user, login, logout } = useStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setFeedback({ type: "error", message: "Informe seu e-mail institucional." })
      return
    }
    if (!password) {
      setFeedback({ type: "error", message: "Informe sua senha." })
      return
    }

    setIsLoading(true)
    setFeedback(null)

    const role = resolveRole(email)

    setTimeout(() => {
      login(email, password, role)
      setIsLoading(false)
      setFeedback({
        type: "success",
        message: `Bem-vindo(a)! Acesso como ${role === "admin" ? "Administrador" : "Cliente"} confirmado.`,
      })
      setTimeout(() => {
        router.push(role === "admin" ? "/admin/loja" : redirectPath)
      }, 700)
    }, 600)
  }

  if (showRegister) {
    return (
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
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

          <RegisterForm onCancel={() => setShowRegister(false)} />

          <p className="mt-6 text-center text-xs text-muted">
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              className="transition-colors hover:text-cyan"
            >
              ← Voltar para o login
            </button>
          </p>
        </div>
      </div>
    )
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

        {/* Active session banner */}
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
                <p className="capitalize text-muted">Perfil ativo: {user.role}</p>
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
          <div className="border-b border-line pb-4">
            <p className="label text-cyan">Autenticação</p>
            <h2 className="mt-0.5 font-display text-xl font-bold">Entrar na sua conta</h2>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`mt-4 rounded-xl border px-3.5 py-2.5 text-xs transition-all ${feedback.type === "success"
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : "border-red-400/40 bg-red-400/10 text-red-300"
                }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-muted">E-mail institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@ic.ufal.br"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
              />
            </div>

            {/* Password */}
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
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-cyan"
              />
            </div>

            {/* Submit + Cadastro link */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan py-3 text-sm font-bold text-ink transition-all hover:bg-[#5cebf5] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                    <span>Autenticando…</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="shrink-0 rounded-xl border border-line px-4 py-3 text-xs font-medium text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
              >
                Criar conta
              </button>
            </div>
          </form>

          {/* ----------------------------------------------------------------
              Credenciais de Teste — REMOVER ANTES DO DEPLOY
          ---------------------------------------------------------------- */}
          <div className="mt-6 rounded-xl border border-dashed border-line/60 bg-ink/40 p-3.5">
            <p className="label text-[10px] text-muted/60">
              🔧 Credenciais de teste — remover antes do deploy
            </p>
            <table className="mt-2 w-full text-[11px]">
              <thead>
                <tr className="text-left text-muted/50">
                  <th className="pb-1 pr-3 font-medium">Perfil</th>
                  <th className="pb-1 pr-3 font-medium">E-mail</th>
                  <th className="pb-1 font-medium">Senha</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {MOCK_USERS.map((u) => (
                  <tr
                    key={u.id}
                    className="cursor-pointer transition-colors hover:text-cyan"
                    onClick={() => {
                      setEmail(u.email)
                      setPassword("123456")
                      setFeedback(null)
                    }}
                    title="Clique para preencher"
                  >
                    <td className="py-0.5 pr-3 capitalize text-muted">{u.role}</td>
                    <td className="py-0.5 pr-3 text-fg/80">{u.email}</td>
                    <td className="py-0.5 text-muted/70">123456</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
