"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { API_URL } from "@/lib/data";

type UsuarioAPI = {
  idUsuario: string;
  nome: string;
  email: string;
  telefone: string | null;
  status: string;
  cargo: string;
  dataCadastro: string;
};

export function AdminUsuariosView() {
  const router = useRouter();
  const { user } = useStore();
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<UsuarioAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [filtroCargo, setFiltroCargo] = useState<"todos" | "admin" | "cliente">(
    "todos",
  );
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "ativo" | "inativo"
  >("todos");

  useEffect(() => {
    const savedUser = localStorage.getItem("diacom_user");
    const token = localStorage.getItem("diacom_token");

    if (!savedUser || !token) {
      router.push("/login?redirect=/admin/usuarios");
      return;
    }

    const parsed = JSON.parse(savedUser);
    if (parsed.role !== "admin") {
      router.push("/");
      return;
    }

    async function fetchUsuarios() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/usuario`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Não foi possível carregar a lista de usuários.");
        }

        const data: UsuarioAPI[] = await res.json();
        setUsuarios(data);
      } catch (err: any) {
        setError(err.message || "Erro ao conectar com o servidor.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsuarios();
  }, [router]);

  async function handleAlterarCargo(alvo: UsuarioAPI) {
    const token = localStorage.getItem("diacom_token");
    if (!token) return;

    const isAdminAtual = alvo.cargo?.toLowerCase().includes("admin");
    const novoCargo = isAdminAtual ? "cliente" : "admin";

    try {
      setAtualizandoId(alvo.idUsuario);
      const res = await fetch(
        `${API_URL}/usuario/${alvo.idUsuario}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cargo: novoCargo }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(
          err?.message || "Não foi possível alterar o cargo do usuário.",
        );
      }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.idUsuario === alvo.idUsuario ? { ...u, cargo: novoCargo } : u,
        ),
      );
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar cargo.");
    } finally {
      setAtualizandoId(null);
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return usuarios.filter((u) => {
      const matchTexto =
        !termo ||
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        (u.telefone && u.telefone.toLowerCase().includes(termo));

      const isAdmin = u.cargo?.toLowerCase().includes("admin");
      const matchCargo =
        filtroCargo === "todos" ||
        (filtroCargo === "admin" && isAdmin) ||
        (filtroCargo === "cliente" && !isAdmin);

      const matchStatus =
        filtroStatus === "todos" || u.status?.toLowerCase() === filtroStatus;

      return matchTexto && matchCargo && matchStatus;
    });
  }, [usuarios, busca, filtroCargo, filtroStatus]);

  if (user && user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-cyan">
            Painel Administrativo
          </span>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-fg">
            Usuários Cadastrados
          </h1>
          <p className="mt-1 text-sm text-muted">
            Consulte clientes e administradores registrados no sistema da DIACOM
            Loja.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel px-4 py-2 text-right">
          <span className="block font-mono text-[11px] uppercase text-muted">
            Total encontrado
          </span>
          <span className="font-display text-xl font-bold text-cyan">
            {usuariosFiltrados.length}{" "}
            <span className="text-xs font-normal text-muted">
              / {usuarios.length}
            </span>
          </span>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-panel p-4 md:grid-cols-12">
        <div className="md:col-span-6">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            Buscar usuário
          </label>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome, e-mail institucional ou telefone..."
            className="w-full rounded-xl border border-line bg-ink px-3.5 py-2 text-sm text-fg placeholder:text-muted/60 focus:border-cyan focus:outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            Cargo
          </label>
          <select
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value as any)}
            className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm text-fg focus:border-cyan focus:outline-none"
          >
            <option value="todos">Todos os cargos</option>
            <option value="cliente">Clientes</option>
            <option value="admin">Administradores</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            Status
          </label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm text-fg focus:border-cyan focus:outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Conteúdo / Tabela */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-panel">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-8 animate-spin rounded-full border-2 border-line border-t-cyan" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-xl border border-line bg-panel-2 px-4 py-2 text-xs text-fg hover:border-cyan/40"
            >
              Tentar novamente
            </button>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-fg">Nenhum usuário encontrado</p>
            <p className="mt-1 text-xs text-muted">
              Tente limpar os filtros ou buscar por outro nome ou e-mail.
            </p>
            {(busca || filtroCargo !== "todos" || filtroStatus !== "todos") && (
              <button
                onClick={() => {
                  setBusca("");
                  setFiltroCargo("todos");
                  setFiltroStatus("todos");
                }}
                className="mt-4 rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-2 text-xs font-semibold text-cyan hover:bg-cyan/20"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-panel-2/60 font-mono text-[11px] uppercase text-muted">
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Cadastro</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {usuariosFiltrados.map((u) => {
                  const isAdmin = u.cargo?.toLowerCase().includes("admin");
                  const isAtivo = u.status?.toLowerCase() === "ativo";

                  return (
                    <tr
                      key={u.idUsuario}
                      className="transition-colors hover:bg-panel-2/40"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cyan/15 font-mono text-xs font-bold text-cyan">
                            {u.nome?.[0]?.toUpperCase() || "?"}
                          </span>
                          <div>
                            <p className="font-medium text-fg">{u.nome}</p>
                            <p className="text-xs text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-muted">
                        {u.telefone || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase ${
                            isAdmin
                              ? "border-cyan/40 bg-cyan/10 font-bold text-cyan"
                              : "border-line bg-panel-2 text-muted"
                          }`}
                        >
                          {u.cargo}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase ${
                            isAtivo
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isAtivo ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-muted">
                        {u.dataCadastro
                          ? new Date(u.dataCadastro).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {String(user?.id) === String(u.idUsuario) ? (
                          <span className="font-mono text-[11px] text-muted">
                            Você
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={atualizandoId === u.idUsuario}
                            onClick={() => handleAlterarCargo(u)}
                            className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                              isAdmin
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                : "border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20"
                            }`}
                          >
                            {atualizandoId === u.idUsuario
                              ? "Salvando..."
                              : isAdmin
                                ? "Rebaixar a Cliente"
                                : "Promover a Admin"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
