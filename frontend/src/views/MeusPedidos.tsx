"use client"
import { useStore } from "@/lib/store"
import { brl, type Order, type Fulfillment } from "@/lib/data"
import { OrderStepper } from "@/components/OrderStepper"
import { StatusPill, PinBadge } from "@/components/Shared"
import { useRouter } from "next/navigation"

type FlowEntry = { order: Order; fulfillment: Fulfillment }

export function MeusPedidos() {
  const router = useRouter()
  const onGoLoja = () => router.push("/")
  const { orders, suppliers, user } = useStore()

  // Filtra apenas pedidos associados ao usuário logado
  const mine = user
    ? orders.filter(
        (o) =>
          (o.buyerId && o.buyerId === user.id) ||
          o.buyer.trim().toLowerCase() === user.name.trim().toLowerCase(),
      )
    : []

  // Agrupa fulfillments por fornecedor cadastrado na store.
  const bySupplier = suppliers
    .map((supplier) => {
      const entries: FlowEntry[] = []
      for (const order of mine) {
        for (const f of order.fulfillments) {
          if (f.supplierId === supplier.id) entries.push({ order, fulfillment: f })
        }
      }
      return { supplier, entries }
    })
    .filter((g) => g.entries.length > 0)

  // Caso o usuário não esteja logado
  if (!user) {
    return (
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-24">
        <p className="label text-cyan">Acompanhamento</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            Meus pedidos
          </h1>
          <p className="max-w-sm text-sm text-muted">
            Faça login para acompanhar o status e o código PIN de retirada das suas encomendas.
          </p>
        </div>

        <div className="mt-16 grid place-items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-cyan/10 text-xl text-cyan">
            🔒
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Nenhuma conta conectada</h3>
            <p className="mt-1 max-w-md text-sm text-muted">
              Entre com sua conta institucional para visualizar seus pedidos realizados, histórico e código PIN de retirada.
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
    )
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
            Pedidos de <span className="font-semibold text-cyan">{user.name}</span> ({user.email})
          </p>
        </div>
        <p className="max-w-sm text-sm text-muted">
          Cada fornecedor tem seu próprio fluxo de preparo. Use o PIN do pedido para
          retirar em qualquer um deles.
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
                  {entries.length} fluxo{entries.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {entries.map(({ order, fulfillment }) => (
                  <article
                    key={order.id + supplier.id}
                    className="rounded-2xl border border-line bg-panel p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm text-cyan">{order.id}</p>
                        <p className="mt-0.5 label text-muted">
                          {new Date(order.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <StatusPill status={fulfillment.status} />
                    </div>

                    <ul className="mt-4 space-y-1.5">
                      {fulfillment.items.map((it, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-fg">{it.name}</span>
                          <span className="font-mono text-muted">{it.qty}×</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5">
                      <OrderStepper
                        status={fulfillment.status}
                        stages={supplier.preparationFlow}
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <PinBadge pin={order.pin} />
                      <span className="font-mono text-sm text-muted">
                        {brl(order.total)} · {order.method}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
