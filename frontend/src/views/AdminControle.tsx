"use client";
import { Fragment, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { brl, downloadCSV, supplierName } from "@/lib/data";
import { Stat, StatusPill } from "@/components/Shared";
import { BarChart, RevenueChart, type BarDatum } from "@/components/charts";

type Period = "7d" | "30d" | "tudo";

export function AdminControle() {
  const { orders } = useStore();
  const [period, setPeriod] = useState<Period>("30d");
  const [open, setOpen] = useState<string | null>(null);

  // 1. Usa a data atual real (ou a data do pedido mais recente) como referência
  const refDate = useMemo(() => {
    const dates = orders.map((o) => new Date(`${o.date}T12:00:00`).getTime());
    return dates.length ? Math.max(...dates, Date.now()) : Date.now();
  }, [orders]);

  const cutoff = useMemo(() => {
    if (period === "tudo") return 0;
    const days = period === "7d" ? 7 : 30;
    return refDate - days * 86400000;
  }, [period, refDate]);

  // Adiciona T12:00:00 para evitar bug de fuso horário (UTC vs Brasília) voltar 1 dia
  const inPeriod = (d: string) => new Date(`${d}T12:00:00`).getTime() >= cutoff;

  // 2. Filtra apenas os pedidos reais do período (ignora cancelados)
  const periodOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        inPeriod(o.date) &&
        !o.fulfillments.every((f) => f.status.toLowerCase().includes("cancel")),
    );
  }, [orders, cutoff]);

  // 3. Calcula TODOS os cards a partir de periodOrders
  const arrecadado = periodOrders.reduce((s, o) => s + o.total, 0);
  const nPedidos = periodOrders.length;
  const ticket = nPedidos ? arrecadado / nPedidos : 0;
  const itensVendidos = periodOrders.reduce(
    (s, o) =>
      s +
      o.fulfillments.reduce(
        (a, f) => a + f.items.reduce((x, i) => x + i.qty, 0),
        0,
      ),
    0,
  );

  // 4. Gráfico de Arrecadação por dia
  const revenueByDay: BarDatum[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of periodOrders) {
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
  }, [periodOrders]);

  // 5. Top produtos por quantidade (que estava faltando!)
  const topProdutos: BarDatum[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of periodOrders) {
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
  }, [periodOrders]);

  function exportCSV() {
    const rows = periodOrders.map((o) => [
      o.id,
      o.date,
      o.buyer,
      o.method,
      o.pin,
      o.fulfillments
        .map(
          (f) =>
            `${supplierName(f.supplierId)}: ${f.items.map((i) => `${i.name} x${i.qty}`).join(" / ")} [${f.status}]`,
        )
        .join(" | "),
      o.total,
    ]);
    downloadCSV(
      `relatorio-pedidos-${period}.csv`,
      ["Pedido", "Data", "Comprador", "Método", "PIN", "Itens", "Total (R$)"],
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
            Resumo de vendas — {periodLabel}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex rounded-lg border border-line p-0.5">
            {(["7d", "30d", "tudo"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  period === p ? "bg-cyan text-ink" : "text-muted hover:text-fg"
                }`}
              >
                {p === "tudo" ? "Tudo" : p}
              </button>
            ))}
          </div>
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
        <Stat label="Total arrecadado" value={brl(arrecadado)} big />
        <Stat label="Pedidos" value={String(nPedidos)} />
        <Stat label="Ticket médio" value={brl(ticket)} accent />
        <Stat label="Itens vendidos" value={String(itensVendidos)} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="label text-muted">Arrecadação por dia</p>
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

      <div className="mt-10 mb-4 flex items-center justify-between">
        <p className="label text-muted">Pedidos do período</p>
        <span className="font-mono text-xs text-muted">
          {periodOrders.length} pedidos
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="label border-b border-line bg-panel text-muted">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Comprador</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 print:hidden" />
              </tr>
            </thead>
            <tbody>
              {periodOrders.map((o) => {
                const isOpen = open === o.id;
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
                        {new Date(o.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">{o.buyer}</td>
                      <td className="px-4 py-3 text-muted">{o.method}</td>
                      <td className="px-4 py-3">
                        <StatusPill
                          status={o.fulfillments[0]?.status ?? "Confirmado"}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono">
                        {brl(o.total)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted print:hidden">
                        {isOpen ? "▲" : "▼"}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-line/60 bg-ink/40">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="space-y-3">
                            {o.fulfillments.map((f, i) => (
                              <div key={i}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-fg">
                                    {supplierName(f.supplierId)}
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
                            ))}
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
    </section>
  );
}
