"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  brl,
  downloadCSV,
  fetchProtectedAssetBlobUrl,
  supplierName,
  type Order,
} from "@/lib/data";
import { Stat, StatusPill } from "@/components/Shared";
import { BarChart, RevenueChart, type BarDatum } from "@/components/charts";

type Period = "7d" | "30d" | "tudo";
type StatusFilter =
  | "todos"
  | "aguardando"
  | "confirmados"
  | "em_separacao"
  | "pronto_retirada"
  | "entregue"
  | "reembolso_solicitado"
  | "reembolsados";

const CONFIRMED_STATUSES = new Set([
  "Confirmado",
  "Em separação",
  "Pronto para retirada",
  "Entregue",
]);

const PACKING_STATUSES = new Set([
  "Confirmado",
  "Em separação",
  "Pronto para retirada",
]);

const CHECKLIST_STORAGE_KEY = "diacom_packing_checklist";

function isPdfUrl(url: string) {
  return /\.pdf($|\?)/i.test(url);
}

function getOrderStatus(o: Order): string {
  return o.status || o.fulfillments[0]?.status || "Confirmado";
}

function normalizeCode(v: string) {
  return v.trim().toUpperCase().replace(/^#/, "");
}

export function AdminControle() {
  const {
    orders,
    suppliers,
    confirmarPagamentoPedido,
    updateFulfillmentStatus,
    uploadComprovante,
    efetivarReembolso,
  } = useStore();

  const [period, setPeriod] = useState<Period>("30d");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Check-list físico por pedido (aparece ao clicar no pedido)
  const [checkedItems, setCheckedItems] = useState<
    Record<string, Record<string, boolean>>
  >({});

  // Busca por código para confirmar saída/entrega
  const [deliveryCode, setDeliveryCode] = useState("");
  const [deliveryFeedback, setDeliveryFeedback] = useState<string | null>(null);

  // Modal de visualização de comprovante (autenticado via JWT + Blob URL)
  const [viewer, setViewer] = useState<{
    title: string;
    url: string;
    blobUrl?: string;
    isPdf?: boolean;
    loading?: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (!viewer || viewer.blobUrl || viewer.error) return;
    let active = true;
    setViewer((prev) => (prev ? { ...prev, loading: true } : prev));
    fetchProtectedAssetBlobUrl(viewer.url)
      .then(({ blobUrl, isPdf }) => {
        if (!active) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        setViewer((prev) =>
          prev ? { ...prev, blobUrl, isPdf, loading: false } : prev,
        );
      })
      .catch((err: any) => {
        if (!active) return;
        setViewer((prev) =>
          prev
            ? {
                ...prev,
                loading: false,
                error: err?.message || "Erro ao carregar comprovante.",
              }
            : prev,
        );
      });
    return () => {
      active = false;
    };
  }, [viewer?.url]);

  function closeViewer() {
    if (viewer?.blobUrl) {
      URL.revokeObjectURL(viewer.blobUrl);
    }
    setViewer(null);
  }

  // Modal de efetivação de reembolso (exige comprovante do admin)
  const [refundTarget, setRefundTarget] = useState<Order | null>(null);
  const [refundFile, setRefundFile] = useState<File | null>(null);
  const [refundPreview, setRefundPreview] = useState<string | null>(null);
  const [refundObs, setRefundObs] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (saved) setCheckedItems(JSON.parse(saved));
    } catch {
      // ignora erro de parse
    }
  }, []);

  function togglePackingItem(orderId: string, itemKey: string) {
    setCheckedItems((prev) => {
      const nextOrder = {
        ...(prev[orderId] ?? {}),
        [itemKey]: !prev[orderId]?.[itemKey],
      };
      const next = { ...prev, [orderId]: nextOrder };
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignora erro de storage
      }
      return next;
    });
  }

  function markAllPackingItems(order: Order, value: boolean) {
    const map: Record<string, boolean> = {};
    order.fulfillments.forEach((f, fi) => {
      f.items.forEach((it, ii) => {
        map[`${fi}-${ii}-${it.name}`] = value;
      });
    });
    setCheckedItems((prev) => {
      const next = { ...prev, [order.id]: map };
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignora
      }
      return next;
    });
  }

  const matchedDeliveryOrder = useMemo(() => {
    const q = deliveryCode.trim();
    if (!q) return null;
    return orders.find((o) => o.pin === q) ?? null;
  }, [orders, deliveryCode]);

  const refDate = useMemo(() => {
    const dates = orders.map((o) => new Date(`${o.date}T12:00:00`).getTime());
    return dates.length ? Math.max(...dates, Date.now()) : Date.now();
  }, [orders]);

  const cutoff = useMemo(() => {
    if (period === "tudo") return 0;
    const days = period === "7d" ? 7 : 30;
    return refDate - days * 86400000;
  }, [period, refDate]);

  const inPeriod = (d: string) => new Date(`${d}T12:00:00`).getTime() >= cutoff;

  const periodAllOrders = useMemo(
    () => orders.filter((o) => inPeriod(o.date)),
    [orders, cutoff],
  );

  const counts = useMemo(() => {
    const c = {
      todos: periodAllOrders.length,
      aguardando: 0,
      confirmados: 0,
      em_separacao: 0,
      pronto_retirada: 0,
      entregue: 0,
      reembolso_solicitado: 0,
      reembolsados: 0,
    };
    for (const o of periodAllOrders) {
      const st = getOrderStatus(o);
      if (st === "Aguardando confirmação") c.aguardando++;
      if (CONFIRMED_STATUSES.has(st)) c.confirmados++;
      if (st === "Em separação") c.em_separacao++;
      if (st === "Pronto para retirada") c.pronto_retirada++;
      if (st === "Entregue") c.entregue++;
      if (st === "Solicitação de reembolso") c.reembolso_solicitado++;
      if (st === "Reembolsado") c.reembolsados++;
    }
    return c;
  }, [periodAllOrders]);

  const confirmedOrders = useMemo(
    () =>
      periodAllOrders.filter((o) => CONFIRMED_STATUSES.has(getOrderStatus(o))),
    [periodAllOrders],
  );

  const visibleOrders = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return periodAllOrders.filter((o) => {
      const st = getOrderStatus(o);
      const matchStatus =
        statusFilter === "todos"
          ? true
          : statusFilter === "aguardando"
            ? st === "Aguardando confirmação"
            : statusFilter === "confirmados"
              ? CONFIRMED_STATUSES.has(st)
              : statusFilter === "em_separacao"
                ? st === "Em separação"
                : statusFilter === "pronto_retirada"
                  ? st === "Pronto para retirada"
                  : statusFilter === "entregue"
                    ? st === "Entregue"
                    : statusFilter === "reembolso_solicitado"
                      ? st === "Solicitação de reembolso"
                      : st === "Reembolsado";

      if (!matchStatus) return false;
      if (!term) return true;
      return (
        o.id.toLowerCase().includes(term) ||
        o.buyer.toLowerCase().includes(term) ||
        o.pin.toLowerCase().includes(term)
      );
    });
  }, [periodAllOrders, statusFilter, searchQuery]);

  // KPIs e gráficos baseados nos pedidos confirmados do período
  const arrecadado = confirmedOrders.reduce((s, o) => s + o.total, 0);
  const nPedidos = confirmedOrders.length;
  const ticket = nPedidos ? arrecadado / nPedidos : 0;
  const itensVendidos = confirmedOrders.reduce(
    (s, o) =>
      s +
      o.fulfillments.reduce(
        (a, f) => a + f.items.reduce((x, i) => x + i.qty, 0),
        0,
      ),
    0,
  );

  const revenueByDay: BarDatum[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of confirmedOrders) {
      map.set(o.date, (map.get(o.date) ?? 0) + o.total);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({
        label: new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        value,
      }));
  }, [confirmedOrders]);

  const topProdutos: BarDatum[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of confirmedOrders) {
      for (const f of o.fulfillments) {
        for (const i of f.items) {
          map.set(i.name, (map.get(i.name) ?? 0) + i.qty);
        }
      }
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [confirmedOrders]);

  async function handleConfirmPayment(order: Order) {
    if (
      !window.confirm(
        `Confirmar o pagamento do pedido ${order.id} (${brl(order.total)})?`,
      )
    ) {
      return;
    }
    try {
      setBusyId(order.id);
      await confirmarPagamentoPedido(order.id);
    } catch (err: any) {
      alert(err.message || "Erro ao confirmar pagamento.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleChangeOrderStatus(
    order: Order,
    newStatus: string,
    pinRetirada?: string,
  ) {
    try {
      setBusyId(order.id);
      const supId = order.fulfillments[0]?.supplierId ?? "1";
      await updateFulfillmentStatus(order.id, supId, newStatus, pinRetirada);
      if (newStatus === "Entregue") {
        setDeliveryFeedback(
          `Pedido ${order.id} marcado como Entregue com sucesso!`,
        );
        setTimeout(() => setDeliveryFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || `Erro ao atualizar status para "${newStatus}".`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejectOrder(order: Order) {
    if (
      !window.confirm(
        `Recusar o comprovante e cancelar o pedido ${order.id}? O estoque será devolvido.`,
      )
    ) {
      return;
    }
    await handleChangeOrderStatus(order, "Cancelado");
  }

  function handleSelectRefundFile(file: File | null) {
    if (refundPreview) URL.revokeObjectURL(refundPreview);
    setRefundFile(file);
    if (file && file.type.startsWith("image/")) {
      setRefundPreview(URL.createObjectURL(file));
    } else {
      setRefundPreview(null);
    }
  }

  async function handleSubmitRefund(e: React.FormEvent) {
    e.preventDefault();
    if (!refundTarget) return;
    if (!refundFile) {
      alert("É obrigatório anexar o comprovante de reembolso.");
      return;
    }

    try {
      setSubmittingRefund(true);
      const url = await uploadComprovante(refundFile);
      await efetivarReembolso(refundTarget.id, url, refundObs);
      setRefundTarget(null);
      handleSelectRefundFile(null);
      setRefundObs("");
      setStatusFilter("reembolsados");
    } catch (err: any) {
      alert(err.message || "Erro ao efetivar reembolso.");
    } finally {
      setSubmittingRefund(false);
    }
  }

  function exportCSV() {
    const rows = visibleOrders.map((o) => [
      o.id,
      o.date,
      o.buyer,
      o.method,
      getOrderStatus(o),
      o.fulfillments
        .map(
          (f) =>
            `${supplierName(f.supplierId, suppliers)}: ${f.items.map((i) => `${i.name} x${i.qty}`).join(" / ")} [${f.status}]`,
        )
        .join(" | "),
      o.total,
    ]);
    downloadCSV(
      `relatorio-${statusFilter}-${period}.csv`,
      [
        "Pedido",
        "Data",
        "Comprador",
        "Método",
        "Status",
        "Itens",
        "Total (R$)",
      ],
      rows,
    );
  }

  const periodLabel =
    period === "tudo"
      ? "todo o período"
      : period === "7d"
        ? "últimos 7 dias"
        : "últimos 30 dias";

  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4 print:mb-6">
        <div>
          <p className="label text-cyan">Painel administrativo</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            Controle
          </h1>
          <p className="mt-1 text-sm text-muted">
            Validação de comprovantes, pedidos confirmados e gestão de
            reembolsos — {periodLabel}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            aria-label="Filtrar período"
            className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-fg outline-none focus:border-cyan"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="tudo">Todo o período</option>
          </select>
          <button
            onClick={exportCSV}
            className="rounded-lg border border-line px-3.5 py-2 text-sm text-fg transition-colors hover:border-cyan hover:text-cyan"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-cyan px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
          >
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Arrecadado (confirmados)" value={brl(arrecadado)} big />
        <Stat label="Pedidos confirmados" value={String(nPedidos)} />
        <Stat label="Ticket médio" value={brl(ticket)} accent />
        <Stat label="Itens vendidos" value={String(itensVendidos)} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="label text-muted">Arrecadação confirmada por dia</p>
          <div className="mt-5">
            <RevenueChart data={revenueByDay} />
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="label text-muted">Produtos mais vendidos</p>
          <div className="mt-5">
            <BarChart data={topProdutos} />
          </div>
        </div>
      </div>

      {/* Confirmar saída / entrega pelo código do pedido */}
      <div className="mt-10 rounded-2xl border border-cyan/30 bg-panel p-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label text-cyan">Confirmar saída / entrega</p>
            <p className="mt-0.5 text-xs text-muted">
              Digite o PIN de retirada (4 dígitos) informado pelo comprador para
              conferir os dados e marcar como entregue.
            </p>
          </div>
          <div className="flex w-full max-w-sm items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={deliveryCode}
              onChange={(e) => {
                setDeliveryCode(e.target.value.replace(/\D/g, ""));
                setDeliveryFeedback(null);
              }}
              placeholder="PIN de retirada informado pelo cliente..."
              className="w-full rounded-xl border border-line bg-ink px-3.5 py-2 font-mono text-sm uppercase text-cyan outline-none placeholder:normal-case placeholder:text-muted/60 focus:border-cyan"
            />
            {deliveryCode && (
              <button
                type="button"
                onClick={() => {
                  setDeliveryCode("");
                  setDeliveryFeedback(null);
                }}
                className="rounded-xl border border-line px-3 py-2 text-xs text-muted hover:text-fg"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {deliveryFeedback && (
          <div className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-2 text-xs font-medium text-emerald-300">
            ✓ {deliveryFeedback}
          </div>
        )}

        {deliveryCode.trim() && !matchedDeliveryOrder && (
          <p className="mt-3 text-xs text-muted">
            Nenhum pedido encontrado para{" "}
            <span className="font-mono text-fg">{deliveryCode.trim()}</span>.
          </p>
        )}

        {matchedDeliveryOrder && (
          <div className="mt-4 rounded-xl border border-line bg-ink/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold text-cyan">
                    {matchedDeliveryOrder.id}
                  </span>
                  <StatusPill status={getOrderStatus(matchedDeliveryOrder)} />
                </div>
                <p className="mt-1 text-sm text-fg">
                  Comprador:{" "}
                  <strong className="text-cyan">
                    {matchedDeliveryOrder.buyer}
                  </strong>{" "}
                  ·{" "}
                  <span className="font-mono text-xs text-muted">
                    {new Date(
                      `${matchedDeliveryOrder.date}T12:00:00`,
                    ).toLocaleDateString("pt-BR")}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-base font-bold">
                  {brl(matchedDeliveryOrder.total)}
                </p>
                <p className="text-xs text-muted">
                  {matchedDeliveryOrder.method}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              {matchedDeliveryOrder.fulfillments.map((f, fi) =>
                f.items.map((it, ii) => (
                  <div
                    key={`${fi}-${ii}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {it.name}{" "}
                      <span className="text-xs text-muted">
                        ({supplierName(f.supplierId, suppliers)})
                      </span>
                    </span>
                    <span className="font-mono text-cyan">{it.qty}×</span>
                  </div>
                )),
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
              {getOrderStatus(matchedDeliveryOrder) === "Entregue" ? (
                <span className="text-xs font-semibold text-emerald-300">
                  ✓ Este pedido já foi entregue.
                </span>
              ) : PACKING_STATUSES.has(getOrderStatus(matchedDeliveryOrder)) ? (
                <>
                  <span className="text-xs text-muted">
                    Confira os itens acima com o comprador antes de entregar.
                  </span>
                  <button
                    type="button"
                    disabled={busyId === matchedDeliveryOrder.id}
                    onClick={() =>
                      handleChangeOrderStatus(
                        matchedDeliveryOrder,
                        "Entregue",
                        deliveryCode.trim(),
                      )
                    }
                    className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-ink transition-colors hover:bg-emerald-300 disabled:opacity-40"
                  >
                    {busyId === matchedDeliveryOrder.id
                      ? "Salvando..."
                      : "✓ Marcar como Entregue"}
                  </button>
                </>
              ) : (
                <span className="text-xs text-amber-300">
                  Status atual &ldquo;{getOrderStatus(matchedDeliveryOrder)}
                  &rdquo; — não elegível para entrega.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filtro por lista de opções (<select>) + busca */}
      <div className="mt-8 grid gap-3 rounded-2xl border border-line bg-panel p-4 md:grid-cols-12 print:hidden">
        <div className="md:col-span-5">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            Filtrar pedidos por status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setOpen(null);
            }}
            className="w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm font-medium text-fg outline-none focus:border-cyan"
          >
            <option value="aguardando">
              Aguardando confirmação ({counts.aguardando})
            </option>
            <option value="confirmados">
              Confirmados ({counts.confirmados})
            </option>
            <option value="em_separacao">
              Em separação ({counts.em_separacao})
            </option>
            <option value="pronto_retirada">
              Prontos para retirada ({counts.pronto_retirada})
            </option>
            <option value="entregue">Entregues ({counts.entregue})</option>
            <option value="reembolso_solicitado">
              Solicitação de reembolso ({counts.reembolso_solicitado})
            </option>
            <option value="reembolsados">
              Reembolsos dados ({counts.reembolsados})
            </option>
            <option value="todos">Todos os pedidos ({counts.todos})</option>
          </select>
        </div>

        <div className="md:col-span-5">
          <label className="mb-1 block font-mono text-[11px] uppercase text-muted">
            Buscar pedido
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Código (#DC-12) ou comprador..."
            className="w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-cyan"
          />
        </div>

        <div className="flex flex-col justify-end md:col-span-2">
          <div className="rounded-xl border border-line bg-ink/70 px-3 py-2 text-center">
            <span className="block font-mono text-[10px] uppercase text-muted">
              Exibindo
            </span>
            <span className="font-mono text-base font-bold text-cyan">
              {visibleOrders.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de pedidos (clique no pedido para abrir o check-list de montagem) */}
      <div className="mt-5">
        {visibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-muted">
            Nenhum pedido encontrado nesta categoria no período selecionado.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="label border-b border-line bg-panel text-muted">
                    <th className="px-4 py-3 font-medium">Pedido</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Comprador</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Comprovante</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-right font-medium print:hidden">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((o) => {
                    const isOpen = open === o.id;
                    const statusAtual = getOrderStatus(o);
                    const showChecklist = PACKING_STATUSES.has(statusAtual);

                    const flatItems = o.fulfillments.flatMap((f, fi) =>
                      f.items.map((it, ii) => ({
                        key: `${fi}-${ii}-${it.name}`,
                        name: it.name,
                        qty: it.qty,
                        supplier: supplierName(f.supplierId, suppliers),
                      })),
                    );
                    const orderChecks = checkedItems[o.id] ?? {};
                    const doneCount = flatItems.filter(
                      (item) => orderChecks[item.key],
                    ).length;
                    const allChecked =
                      flatItems.length > 0 && doneCount === flatItems.length;

                    return (
                      <Fragment key={o.id}>
                        <tr
                          className="cursor-pointer border-b border-line/60 bg-panel/40 transition-colors hover:bg-panel-2"
                          onClick={() => setOpen(isOpen ? null : o.id)}
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-cyan">
                            {o.id}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                            {new Date(`${o.date}T12:00:00`).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short",
                              },
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>{o.buyer}</div>
                            <div className="font-mono text-[11px] text-muted">
                              {o.method}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill status={statusAtual} />
                          </td>
                          <td
                            className="px-4 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-wrap gap-1.5">
                              {o.comprovanteUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewer({
                                      title: `Comprovante de pagamento — ${o.id}`,
                                      url: o.comprovanteUrl!,
                                    })
                                  }
                                  className="rounded-lg border border-line px-2.5 py-1 text-xs text-fg hover:border-cyan hover:text-cyan"
                                >
                                  📎 Pagamento
                                </button>
                              ) : (
                                <span className="text-xs text-muted">—</span>
                              )}
                              {o.comprovanteReembolsoUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewer({
                                      title: `Comprovante de reembolso — ${o.id}`,
                                      url: o.comprovanteReembolsoUrl!,
                                    })
                                  }
                                  className="rounded-lg border border-cyan/40 bg-cyan/10 px-2.5 py-1 text-xs font-semibold text-cyan hover:bg-cyan/20"
                                >
                                  💸 Reembolso
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                            {brl(o.total)}
                          </td>
                          <td
                            className="whitespace-nowrap px-4 py-3 text-right print:hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              {statusAtual === "Aguardando confirmação" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={busyId === o.id}
                                    onClick={() => handleConfirmPayment(o)}
                                    className="rounded-lg bg-cyan px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-[#5cebf5] disabled:opacity-40"
                                  >
                                    {busyId === o.id ? "..." : "Confirmar"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyId === o.id}
                                    onClick={() => handleRejectOrder(o)}
                                    className="rounded-lg border border-red-400/40 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-400/10 disabled:opacity-40"
                                  >
                                    Recusar
                                  </button>
                                </>
                              )}
                              {statusAtual === "Solicitação de reembolso" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRefundTarget(o);
                                    handleSelectRefundFile(null);
                                    setRefundObs("");
                                  }}
                                  className="rounded-lg bg-orange-400 px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-orange-300"
                                >
                                  Anexar e reembolsar
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setOpen(isOpen ? null : o.id)}
                                className="px-1.5 text-muted hover:text-fg"
                                aria-label="Expandir detalhes"
                              >
                                {isOpen ? "▲" : "▼"}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="border-b border-line/60 bg-ink/40">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="space-y-3">
                                {o.motivoReembolso && (
                                  <div className="rounded-xl border border-orange-400/30 bg-orange-400/10 px-3.5 py-2.5 text-xs text-orange-200">
                                    <strong className="text-orange-300">
                                      Dados do reembolso:{" "}
                                    </strong>
                                    {o.motivoReembolso}
                                  </div>
                                )}
                                {o.dataReembolso && (
                                  <p className="font-mono text-xs text-cyan">
                                    Reembolsado em{" "}
                                    {new Date(
                                      `${o.dataReembolso}T12:00:00`,
                                    ).toLocaleDateString("pt-BR")}
                                  </p>
                                )}

                                {/* Check-list de montagem aparece ao clicar no pedido */}
                                {showChecklist ? (
                                  <div className="rounded-xl border border-line bg-panel/60 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <p className="label text-cyan">
                                          Check-list de montagem física
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted">
                                          Itens separados:{" "}
                                          <strong className="font-mono text-fg">
                                            {doneCount}/{flatItems.length}
                                          </strong>
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          markAllPackingItems(o, !allChecked)
                                        }
                                        className="text-xs text-cyan hover:underline"
                                      >
                                        {allChecked
                                          ? "Desmarcar todos"
                                          : "Marcar todos"}
                                      </button>
                                    </div>

                                    <div className="mt-3 space-y-1.5">
                                      {flatItems.map((item) => {
                                        const checked = Boolean(
                                          orderChecks[item.key],
                                        );
                                        return (
                                          <label
                                            key={item.key}
                                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                              checked
                                                ? "border-cyan/30 bg-cyan/10 text-muted line-through"
                                                : "border-line/70 bg-ink/60 text-fg hover:border-cyan/40"
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() =>
                                                togglePackingItem(
                                                  o.id,
                                                  item.key,
                                                )
                                              }
                                              className="size-4 accent-cyan"
                                            />
                                            <span className="font-mono text-xs font-bold text-cyan no-underline">
                                              {item.qty}×
                                            </span>
                                            <span className="flex-1">
                                              {item.name}
                                            </span>
                                            <span className="text-xs text-muted no-underline">
                                              {item.supplier}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                                      {statusAtual ===
                                      "Pronto para retirada" ? (
                                        <>
                                          <span className="text-xs font-semibold text-cyan">
                                            📦 Empacotado e pronto para retirada
                                          </span>
                                          <span className="text-[11px] text-muted">
                                            Valide pelo código/PIN acima para
                                            confirmar a entrega
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          {statusAtual === "Confirmado" && (
                                            <button
                                              type="button"
                                              disabled={busyId === o.id}
                                              onClick={() =>
                                                handleChangeOrderStatus(
                                                  o,
                                                  "Em separação",
                                                )
                                              }
                                              className="rounded-lg border border-amber-400/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/10 disabled:opacity-40"
                                            >
                                              Iniciar separação
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            disabled={busyId === o.id}
                                            onClick={() => {
                                              if (!allChecked) {
                                                const ok = window.confirm(
                                                  `Nem todos os itens do pedido ${o.id} foram marcados (${doneCount}/${flatItems.length}). Marcar como empacotado e pronto para retirada mesmo assim?`,
                                                );
                                                if (!ok) return;
                                                markAllPackingItems(o, true);
                                              }
                                              handleChangeOrderStatus(
                                                o,
                                                "Pronto para retirada",
                                              );
                                            }}
                                            className={`ml-auto rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-40 ${
                                              allChecked
                                                ? "bg-cyan text-ink hover:bg-[#5cebf5]"
                                                : "border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20"
                                            }`}
                                          >
                                            {busyId === o.id
                                              ? "Salvando..."
                                              : "📦 Empacotado — Pronto p/ retirada"}
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  o.fulfillments.map((f, i) => (
                                    <div key={i}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-fg">
                                          {supplierName(
                                            f.supplierId,
                                            suppliers,
                                          )}
                                        </span>
                                        <StatusPill status={f.status} />
                                      </div>
                                      <ul className="mt-1.5 space-y-0.5 pl-1">
                                        {f.items.map((it, j) => (
                                          <li
                                            key={j}
                                            className="flex justify-between text-sm text-muted"
                                          >
                                            <span>{it.name}</span>
                                            <span className="font-mono">
                                              {it.qty}×
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Visualizador de Comprovante */}
      {viewer && (
        <div
          onClick={closeViewer}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-cyan/40 bg-panel p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-lg font-bold">{viewer.title}</h3>
              <button
                type="button"
                onClick={closeViewer}
                className="text-muted hover:text-fg"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center gap-4">
              {viewer.loading ? (
                <div className="py-12 text-xs text-muted">
                  Carregando comprovante...
                </div>
              ) : viewer.error ? (
                <div className="py-12 text-xs text-red-400">{viewer.error}</div>
              ) : viewer.blobUrl ? (
                <>
                  {viewer.isPdf ? (
                    <iframe
                      src={viewer.blobUrl}
                      title={viewer.title}
                      className="h-[65vh] w-full rounded-xl border border-line bg-white"
                    />
                  ) : (
                    <img
                      src={viewer.blobUrl}
                      alt={viewer.title}
                      className="max-h-[65vh] rounded-xl border border-line object-contain"
                    />
                  )}
                  <a
                    href={viewer.blobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-2 text-xs font-semibold text-cyan hover:bg-cyan/20"
                  >
                    Abrir em nova aba ↗
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Efetivar Reembolso (Admin anexa comprovante obrigatório) */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-orange-400/40 bg-panel p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <p className="label text-orange-300">Efetivar reembolso</p>
                <h3 className="font-display text-xl font-bold">
                  Pedido {refundTarget.id} · {brl(refundTarget.total)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="text-muted hover:text-fg"
              >
                ✕
              </button>
            </div>

            {refundTarget.motivoReembolso && (
              <div className="mt-4 rounded-xl border border-orange-400/30 bg-orange-400/10 p-3 text-xs text-orange-200">
                <p className="font-semibold text-orange-300">
                  Dados informados por {refundTarget.buyer}:
                </p>
                <p className="mt-1">{refundTarget.motivoReembolso}</p>
              </div>
            )}

            <form onSubmit={handleSubmitRefund} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted">
                  Comprovante do reembolso (PNG, JPG, WEBP ou PDF) *
                </label>
                <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-ink px-4 py-5 text-center transition-colors hover:border-cyan">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      handleSelectRefundFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {refundFile ? (
                    <div className="w-full space-y-2">
                      {refundPreview ? (
                        <img
                          src={refundPreview}
                          alt="Prévia do comprovante de reembolso"
                          className="mx-auto max-h-36 rounded-lg border border-line object-contain"
                        />
                      ) : (
                        <div className="mx-auto inline-flex items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-2 font-mono text-xs text-cyan">
                          📄 {refundFile.name}
                        </div>
                      )}
                      <p className="truncate font-mono text-[11px] text-cyan">
                        {refundFile.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      <span className="text-xl text-cyan">📎</span>
                      <span className="mt-1 text-xs font-semibold text-fg">
                        Anexar comprovante do reembolso
                      </span>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted">
                  Observação (opcional)
                </label>
                <input
                  type="text"
                  value={refundObs}
                  onChange={(e) => setRefundObs(e.target.value)}
                  placeholder="Ex.: Pix devolvido via conta DIACOM"
                  className="mt-1 w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-fg outline-none focus:border-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="rounded-xl border border-line px-4 py-2 text-sm text-fg hover:border-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!refundFile || submittingRefund}
                  className="rounded-xl bg-cyan px-5 py-2 text-sm font-bold text-ink transition-colors hover:bg-[#5cebf5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submittingRefund
                    ? "Confirmando..."
                    : "Confirmar reembolso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
