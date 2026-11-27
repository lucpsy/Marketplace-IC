"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { API_URL, apiFetch } from "@/lib/data";

type LogAuditoriaItem = {
  idLog: string;
  acao: string;
  entidade: string;
  idRegistro: string | null;
  detalhes: string | null;
  ip: string | null;
  dataRegistro: string;
  usuario: {
    idUsuario: string;
    nome: string;
    email: string;
    cargo: string;
  } | null;
};

type PaginacaoAuditoria = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

const ENTIDADES = [
  { value: "", label: "Todas as entidades" },
  { value: "auth", label: "Autenticação (auth)" },
  { value: "seguranca", label: "Segurança (401 / 403 / 429)" },
  { value: "usuario", label: "Usuários" },
  { value: "pedido", label: "Pedidos" },
  { value: "pagamento", label: "Pagamentos & Repasses" },
  { value: "catalogo", label: "Catálogo & Categorias" },
  { value: "fornecedor", label: "Fornecedores" },
  { value: "promocao", label: "Promoções & Cupons" },
];

function estiloAcao(acao: string): string {
  const upper = acao.toUpperCase();
  if (
    upper.includes("FALHA") ||
    upper.includes("NEGADO") ||
    upper.includes("401") ||
    upper.includes("403") ||
    upper.includes("429")
  ) {
    return "border-red-500/40 bg-red-500/10 text-red-300";
  }
  if (upper.includes("REMOVIDO") || upper.includes("DESATIVADO")) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }
  if (
    upper.includes("CRIADO") ||
    upper.includes("CRIADA") ||
    upper.includes("CONFIRMADO") ||
    upper.includes("REATIVADO") ||
    upper.includes("SUCESSO")
  ) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }
  return "border-cyan/40 bg-cyan/10 text-cyan";
}

function formatarDetalhes(raw: string | null): string {
  if (!raw) return "—";
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const pares = Object.entries(parsed)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => {
          const valStr =
            typeof v === "object" ? JSON.stringify(v) : String(v);
          return `${k}: ${valStr}`;
        });
      return pares.length > 0 ? pares.join(" · ") : "—";
    }
  } catch {
    // texto simples
  }
  return raw;
}

export function AdminAuditoriaView() {
  const router = useRouter();
  const { user } = useStore();

  const [logs, setLogs] = useState<LogAuditoriaItem[]>([]);
  const [paginacao, setPaginacao] = useState<PaginacaoAuditoria>({
    pagina: 1,
    limite: 50,
    total: 0,
    totalPaginas: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [entidade, setEntidade] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pagina, setPagina] = useState(1);

  const carregarLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("pagina", String(pagina));
      params.set("limite", "50");
      if (busca.trim()) params.set("busca", busca.trim());
      if (entidade) params.set("entidade", entidade);
      if (dataInicio) {
        params.set("dataInicio", new Date(`${dataInicio}T00:00:00`).toISOString());
      }
      if (dataFim) {
        params.set("dataFim", new Date(`${dataFim}T23:59:59.999`).toISOString());
      }

      const res = await apiFetch(`${API_URL}/auditoria?${params.toString()}`);

      if (res.status === 401 || res.status === 403) {
        router.push("/login?redirect=/admin/auditoria");
        return;
      }

      if (!res.ok) {
        throw new Error("Não foi possível carregar os registros de auditoria.");
      }

      const payload = await res.json();
      setLogs(Array.isArray(payload?.dados) ? payload.dados : []);
      if (payload?.paginacao) {
        setPaginacao(payload.paginacao);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao consultar trilha de auditoria.");
    } finally {
      setIsLoading(false);
    }
  }, [busca, entidade, dataInicio, dataFim, pagina, router]);

  useEffect(() => {
    const savedUser = localStorage.getItem("diacom_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/auditoria");
      return;
    }
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed.role !== "admin") {
        router.push("/");
        return;
      }
    } catch {
      router.push("/login?redirect=/admin/auditoria");
      return;
    }

    const timer = window.setTimeout(() => {
      carregarLogs();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [carregarLogs, router]);

  if (user && user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-cyan">
            Painel Administrativo · Segurança
          </span>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-fg">
            Trilha de Auditoria
          </h1>
          <p className="mt-1 text-sm text-muted">
            Registro imutável de autenticações, ações administrativas, movimentações
            financeiras e alertas de acesso.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => carregarLogs()}
            className="rounded-xl border border-line bg-panel px-4 py-2.5 font-mono text-xs text-fg transition-colors hover:border-cyan hover:text-cyan"
          >
            Atualizar
          </button>
          <div className="rounded-xl border border-line bg-panel px-4 py-2 text-right">
            <span className="block font-mono text-[11px] uppercase text-muted">
              Eventos registrados
            </span>
            <span className="font-display text-xl font-bold text-cyan">
              {paginacao.total}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-panel p-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            Buscar evento
          </label>
          <input
            type="text"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
            placeholder="Ação, usuário, e-mail, IP ou detalhe..."
            className="w-full rounded-xl border border-line bg-ink px-3.5 py-2 text-sm text-fg placeholder:text-muted/60 focus:border-cyan focus:outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            Entidade
          </label>
          <select
            value={entidade}
            onChange={(e) => {
              setEntidade(e.target.value);
              setPagina(1);
            }}
            className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-sm text-fg focus:border-cyan focus:outline-none"
          >
            {ENTIDADES.map((ent) => (
              <option key={ent.value} value={ent.value}>
                {ent.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            De
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => {
              setDataInicio(e.target.value);
              setPagina(1);
            }}
            className="w-full rounded-xl border border-line bg-ink px-3 py-2 font-mono text-xs text-fg focus:border-cyan focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            Até
          </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => {
              setDataFim(e.target.value);
              setPagina(1);
            }}
            className="w-full rounded-xl border border-line bg-ink px-3 py-2 font-mono text-xs text-fg focus:border-cyan focus:outline-none"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-panel">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-8 animate-spin rounded-full border-2 border-line border-t-cyan" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => carregarLogs()}
              className="mt-3 rounded-xl border border-line bg-panel-2 px-4 py-2 text-xs text-fg hover:border-cyan/40"
            >
              Tentar novamente
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-fg">Nenhum evento encontrado</p>
            <p className="mt-1 text-xs text-muted">
              Ajuste os filtros ou aguarde novas ações registradas no sistema.
            </p>
            {(busca || entidade || dataInicio || dataFim) && (
              <button
                type="button"
                onClick={() => {
                  setBusca("");
                  setEntidade("");
                  setDataInicio("");
                  setDataFim("");
                  setPagina(1);
                }}
                className="mt-4 rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-2 text-xs font-semibold text-cyan hover:bg-cyan/20"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-panel-2/60 font-mono text-[11px] uppercase text-muted">
                    <th className="px-4 py-3">Data / Hora</th>
                    <th className="px-4 py-3">Ação</th>
                    <th className="px-4 py-3">Alvo</th>
                    <th className="px-4 py-3">Responsável</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {logs.map((log) => (
                    <tr
                      key={log.idLog}
                      className="transition-colors hover:bg-panel-2/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                        {log.dataRegistro
                          ? new Date(log.dataRegistro).toLocaleString("pt-BR")
                          : "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${estiloAcao(
                            log.acao,
                          )}`}
                        >
                          {log.acao}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                        <span className="text-fg">{log.entidade}</span>
                        {log.idRegistro && (
                          <span className="ml-1 text-cyan">
                            #{log.idRegistro}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {log.usuario ? (
                          <div>
                            <p className="text-xs font-medium text-fg">
                              {log.usuario.nome}
                            </p>
                            <p className="font-mono text-[11px] text-muted">
                              {log.usuario.email}
                            </p>
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-muted">
                            Não autenticado
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                        {log.ip || "—"}
                      </td>

                      <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-muted" title={formatarDetalhes(log.detalhes)}>
                        {formatarDetalhes(log.detalhes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginacao.totalPaginas > 1 && (
              <div className="flex items-center justify-between border-t border-line bg-panel-2/40 px-4 py-3 text-xs text-muted">
                <span className="font-mono">
                  Página {paginacao.pagina} de {paginacao.totalPaginas}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={paginacao.pagina <= 1}
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-line px-3 py-1 font-mono text-fg transition-colors hover:border-cyan disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={paginacao.pagina >= paginacao.totalPaginas}
                    onClick={() =>
                      setPagina((p) => Math.min(paginacao.totalPaginas, p + 1))
                    }
                    className="rounded-lg border border-line px-3 py-1 font-mono text-fg transition-colors hover:border-cyan disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
