"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { brl, type Order, type Fulfillment } from "@/lib/data";
import { OrderStepper } from "@/components/OrderStepper";
import { StatusPill, PinBadge } from "@/components/Shared";
import { useRouter } from "next/navigation";

type FlowEntry = { order: Order; fulfillment: Fulfillment };

const REFUNDABLE_STATUSES = new Set([
  "Confirmado",
  "Em separação",
  "Pronto para retirada",
  "Entregue",
]);

export function MeusPedidos() {
  const router = useRouter();
  const onGoLoja = () => router.push("/");
  const { orders, suppliers, user, role, solicitarReembolso } = useStore();

  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [motivo, setMotivo] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Para cliente, /api/pedido/meus já retorna apenas os pedidos do próprio usuário.
  // Para admin, /api/pedido retorna todos — filtramos pelos pedidos do próprio admin aqui.
  const mine = useMemo(() => {
    if (!user) return [];
    if (role !== "admin") return orders;
    return orders.filter(
      (o) =>
        (o.buyerId && o.buyerId === user.id) ||
        o.buyer.trim().toLowerCase() === user.name.trim().toLowerCase(),
    );
  }, [orders, user, role]);

  const bySupplier = useMemo(() => {
    const groups = suppliers
      .map((supplier) => {
        const entries: FlowEntry[] = [];
        for (const order of mine) {
          for (const f of order.fulfillments) {
            if (
              f.supplierId === supplier.id ||
              f.supplierId.toLowerCase() === supplier.name.toLowerCase()
            ) {
              entries.push({ order, fulfillment: f });
            }
          }
        }
        return { supplier, entries };
      })
      .filter((g) => g.entries.length > 0);

    // Garante que nenhum pedido fique invisível caso o fornecedor não esteja na lista
    const matchedIds = new Set(
      groups.flatMap((g) => g.entries.map((e) => e.order.id)),
    );
    const unmatched = mine.filter((o) => !matchedIds.has(o.id));
    if (unmatched.length > 0) {
      groups.push({
        supplier: {
          id: "geral",
          name: "Loja DIACOM",
          pickupLocation: "Sala do DIACOM — Bloco 4",
          preparationFlow: [
            "Confirmado",
            "Em separação",
            "Pronto para retirada",
            "Entregue",
          ],
        },
        entries: unmatched.map((order) => ({
          order,
          fulfillment: order.fulfillments[0] ?? {
            supplierId: "geral",
            items: [],
            status: order.status,
          },
        })),
      });
    }

    return groups;
  }, [suppliers, mine]);

  async function handleRequestRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!refundOrder) return;
    if (!chavePix.trim()) {
      alert("Informe sua chave Pix para receber o reembolso.");
      return;
    }

    try {
      setSubmittingRefund(true);
      await solicitarReembolso(refundOrder.id, motivo, chavePix);
      setRefundOrder(null);
      setMotivo("");
      setChavePix("");
    } catch (err: any) {
      alert(err.message || "Erro ao solicitar reembolso.");
    } finally {
      setSubmittingRefund(false);
    }
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
        <p className="label text-cyan">Acompanhamento</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Meus pedidos
          </h1>
          <p className="max-w-sm text-sm text-muted">
            Faça login para acompanhar o status e o código PIN de retirada das
            suas encomendas.
          </p>
        </div>

        <div className="mt-16 grid place-items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-cyan/10 text-xl text-cyan">
            🔒
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">
              Nenhuma conta conectada
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted">
              Entre com sua conta institucional para visualizar seus pedidos
              realizados, histórico e código PIN de retirada.
            </p>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => router.push("/login?redirect=/meus-pedidos")}
              className="rounded-xl bg-cyan px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
            >
              Fazer login
            </button>
            <button
              onClick={onGoLoja}
              className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-cyan hover:text-cyan"
            >
              Ir para a loja
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <p className="label text-cyan">Acompanhamento</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Meus pedidos
          </h1>
          <p className="mt-1 text-xs text-muted">
            Pedidos de{" "}
            <span className="font-semibold text-cyan">{user.name}</span> (
            {user.email})
          </p>
        </div>
        <p className="max-w-sm text-sm text-muted">
          Acompanhe a validação do comprovante, o preparo e os eventuais
          reembolsos dos seus pedidos.
        </p>
      </div>

      {bySupplier.length === 0 ? (
        <div className="mt-16 grid place-items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="text-muted">Você ainda não tem pedidos.</p>
          <button
            onClick={onGoLoja}
            className="rounded-xl bg-cyan px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
          >
            Ir para a loja
          </button>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {bySupplier.map(({ supplier, entries }) => (
            <div key={supplier.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    {supplier.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">
                    Retirada: {supplier.pickupLocation}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted">
                  {entries.length} pedido{entries.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {entries.map(({ order, fulfillment }) => {
                  const statusAtual = order.status || fulfillment.status;
                  const canRequestRefund = REFUNDABLE_STATUSES.has(statusAtual);

                  return (
                    <article
                      key={order.id + supplier.id}
                      className="rounded-2xl border border-line bg-panel p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm text-cyan">
                            {order.id}
                          </p>
                          <p className="mt-0.5 label text-muted">
                            {new Date(
                              `${order.date}T12:00:00`,
                            ).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <StatusPill status={statusAtual} />
                      </div>

                      {statusAtual === "Aguardando confirmação" && (
                        <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                          Comprovante enviado. Aguardando confirmação do
                          pagamento pela administração.
                        </div>
                      )}

                      {statusAtual === "Solicitação de reembolso" && (
                        <div className="mt-3 rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-xs text-orange-200">
                          Solicitação de reembolso em análise pela diretoria.
                          {order.motivoReembolso && (
                            <p className="mt-1 opacity-80">
                              {order.motivoReembolso}
                            </p>
                          )}
                        </div>
                      )}

                      {statusAtual === "Reembolsado" && (
                        <div className="mt-3 rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs text-cyan">
                          Reembolso efetuado
                          {order.dataReembolso
                            ? ` em ${new Date(`${order.dataReembolso}T12:00:00`).toLocaleDateString("pt-BR")}`
                            : ""}
                          .
                        </div>
                      )}

                      <ul className="mt-4 space-y-1.5">
                        {fulfillment.items.map((it, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-fg">{it.name}</span>
                            <span className="font-mono text-muted">
                              {it.qty}×
                            </span>
                          </li>
                        ))}
                      </ul>

                      {REFUNDABLE_STATUSES.has(statusAtual) && (
                        <div className="mt-5">
                          <OrderStepper
                            status={statusAtual}
                            stages={supplier.preparationFlow}
                          />
                        </div>
                      )}

                      {/* Links de comprovantes e ação de reembolso */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {order.comprovanteUrl && (
                          <a
                            href={order.comprovanteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-line px-3 py-1.5 text-xs text-fg transition-colors hover:border-cyan hover:text-cyan"
                          >
                            📎 Ver comprovante enviado
                          </a>
                        )}
                        {order.comprovanteReembolsoUrl && (
                          <a
                            href={order.comprovanteReembolsoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-xs font-semibold text-cyan transition-colors hover:bg-cyan/20"
                          >
                            💸 Ver comprovante de reembolso
                          </a>
                        )}
                        {canRequestRefund && (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundOrder(order);
                              setMotivo("");
                              setChavePix("");
                            }}
                            className="ml-auto rounded-lg border border-orange-400/40 px-3 py-1.5 text-xs font-semibold text-orange-300 transition-colors hover:bg-orange-400/10"
                          >
                            Solicitar reembolso
                          </button>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                        <PinBadge pin={order.pin} />
                        <span className="font-mono text-sm text-muted">
                          {brl(order.total)} · {order.method}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Solicitação de Reembolso */}
      {refundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-orange-400/40 bg-panel p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <p className="label text-orange-300">Reembolso</p>
                <h3 className="font-display text-xl font-bold">
                  Solicitar reembolso {refundOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRefundOrder(null)}
                className="text-muted hover:text-fg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestRefund} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted">
                  Chave Pix para devolução *
                </label>
                <input
                  type="text"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  required
                  className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted">
                  Motivo da solicitação
                </label>
                <textarea
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva brevemente o motivo do reembolso..."
                  className="mt-1 w-full resize-none rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none focus:border-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setRefundOrder(null)}
                  className="rounded-xl border border-line px-4 py-2 text-sm text-fg hover:border-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="rounded-xl bg-orange-400 px-5 py-2 text-sm font-bold text-ink transition-colors hover:bg-orange-300 disabled:opacity-50"
                >
                  {submittingRefund ? "Enviando..." : "Enviar solicitação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
