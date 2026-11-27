"use client";
import { useMemo, useState } from "react";
import { brl, effectivePrice, OFFER_DEADLINE, type Coupon } from "@/lib/data";
import { useStore } from "@/lib/store";
import { QtyBtn, Row, CartIcon, PinBadge } from "./Shared";
import { useCountdown } from "./OfferDeadline";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const router = useRouter();
  const onSeeOrders = () => router.push("/meus-pedidos");
  const {
    cart,
    setQty,
    checkout,
    uploadComprovante,
    promotions,
    validateCoupon,
    cartOpen,
    setCartOpen,
    offerDeadline,
  } = useStore();
  const { ended: offerEnded } = useCountdown(offerDeadline || OFFER_DEADLINE);
  const onClose = () => setCartOpen(false);

  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"cart" | "pay" | "processing" | "done">(
    "cart",
  );
  const [payMethod, setPayMethod] = useState<"Pix" | "Cartão">("Pix");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ id: string; pin: string } | null>(
    null,
  );

  const subtotal = cart.reduce(
    (s, l) => s + effectivePrice(l.product, promotions).current * l.qty,
    0,
  );
  const baseShipping = 0;

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.kind === "percent") return (subtotal * coupon.value) / 100;
    if (coupon.kind === "fixed") return Math.min(coupon.value, subtotal);
    return 0;
  }, [coupon, subtotal]);

  const shipping = coupon?.kind === "shipping" ? 0 : baseShipping;
  const total = Math.max(0, subtotal - discount) + shipping;

  async function applyCoupon() {
    setError("");
    const result = await validateCoupon(code, subtotal);
    if (!result.valid || !result.coupon) {
      setCoupon(null);
      setError(result.error || "Cupom inválido.");
      return;
    }
    setCoupon(result.coupon);
  }

  function handleSelectReceipt(file: File | null) {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptFile(file);
    if (file && file.type.startsWith("image/")) {
      setReceiptPreview(URL.createObjectURL(file));
    } else {
      setReceiptPreview(null);
    }
  }

  async function pay() {
    if (!receiptFile) {
      alert("Por favor, anexe o comprovante de pagamento antes de continuar.");
      return;
    }
    setStep("processing");
    try {
      const comprovanteUrl = await uploadComprovante(receiptFile);
      const res = await checkout({
        items: cart,
        total,
        method: payMethod,
        couponCode: coupon?.code,
        comprovanteUrl,
      });
      setPlaced(res);
      setStep("done");
    } catch (err: any) {
      alert(err.message || "Erro ao finalizar o pedido.");
      setStep("pay");
    }
  }

  function reset() {
    setStep("cart");
    setCoupon(null);
    setCode("");
    setError("");
    setPlaced(null);
    handleSelectReceipt(null);
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-panel transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="label text-cyan">Carrinho</p>
            <h2 className="font-display text-xl font-bold">Seu pedido</h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted hover:text-fg"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {step === "processing" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="size-10 animate-spin rounded-full border-2 border-line border-t-cyan" />
            <p className="text-sm text-muted">
              Enviando comprovante e registrando seu pedido…
            </p>
          </div>
        ) : step === "done" && placed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-amber-400/15 text-2xl text-amber-300">
              ✓
            </div>
            <h3 className="font-display text-xl font-bold">
              Comprovante enviado!
            </h3>
            <p className="font-mono text-sm text-cyan">{placed.id}</p>
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono text-[11px] text-amber-300">
              Aguardando confirmação
            </span>
            <PinBadge pin={placed.pin} />
            <p className="text-sm text-muted">
              Seu comprovante foi recebido e está em análise pela diretoria do
              DIACOM. Assim que confirmado, o pedido seguirá para separação.
            </p>
            <div className="mt-2 flex w-full flex-col gap-2">
              <button
                onClick={() => {
                  onSeeOrders();
                  onClose();
                  reset();
                }}
                className="w-full rounded-xl bg-cyan py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5]"
              >
                Acompanhar pedido
              </button>
              <button
                onClick={() => {
                  onClose();
                  reset();
                }}
                className="w-full rounded-xl border border-line py-2.5 text-sm text-fg transition-colors hover:border-muted"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center text-muted">
            <CartIcon />
            <p className="mt-2 text-sm">Seu carrinho está vazio.</p>
          </div>
        ) : step === "pay" ? (
          <PaymentScreen
            total={total}
            method={payMethod}
            setMethod={setPayMethod}
            receiptFile={receiptFile}
            receiptPreview={receiptPreview}
            onSelectReceipt={handleSelectReceipt}
            onBack={() => setStep("cart")}
            onPay={pay}
          />
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {cart.map((l) => {
                const price = effectivePrice(l.product, promotions);
                return (
                  <div
                    key={l.product.id}
                    className="flex gap-3 rounded-xl border border-line bg-panel-2 p-2.5"
                  >
                    <img
                      src={l.product.image}
                      alt={l.product.name}
                      className="size-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium leading-tight">
                        {l.product.name}
                      </p>
                      <p className="font-mono text-xs text-cyan">
                        {brl(price.current)}
                        {price.promo && (
                          <span className="ml-1 text-muted line-through">
                            {brl(price.original)}
                          </span>
                        )}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <QtyBtn onClick={() => setQty(l.product.id, l.qty - 1)}>
                          −
                        </QtyBtn>
                        <span className="w-6 text-center font-mono text-sm">
                          {l.qty}
                        </span>
                        <QtyBtn onClick={() => setQty(l.product.id, l.qty + 1)}>
                          +
                        </QtyBtn>
                        <button
                          onClick={() => setQty(l.product.id, 0)}
                          className="ml-auto text-xs text-muted hover:text-fg"
                        >
                          remover
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Cupom */}
              <div className="rounded-xl border border-line bg-panel-2 p-3">
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Código do cupom"
                    className="min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm uppercase outline-none placeholder:normal-case placeholder:text-muted focus:border-cyan"
                  />
                  <button
                    onClick={applyCoupon}
                    className="rounded-lg border border-line px-3 text-sm text-fg hover:border-cyan hover:text-cyan"
                  >
                    Aplicar
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                {coupon && (
                  <p className="mt-2 text-xs text-cyan">
                    {coupon.code} aplicado — {coupon.label}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-line px-5 py-4">
              <Row label="Subtotal" value={brl(subtotal)} />
              {discount > 0 && (
                <Row label="Desconto" value={`- ${brl(discount)}`} accent />
              )}
              <Row
                label="Entrega / retirada"
                value={shipping === 0 ? "Grátis" : brl(shipping)}
                accent={shipping === 0}
              />
              <div className="my-3 border-t border-line" />
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">Total</span>
                <span className="font-mono text-lg text-cyan">
                  {brl(total)}
                </span>
              </div>
              {offerEnded && (
                <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
                  Prazo de compras encerrado. Novos pedidos estão fechados no
                  momento.
                </div>
              )}
              <button
                onClick={() => !offerEnded && setStep("pay")}
                disabled={offerEnded}
                className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
                  offerEnded
                    ? "cursor-not-allowed border border-line bg-panel-2 text-muted"
                    : "bg-cyan text-ink hover:bg-[#5cebf5]"
                }`}
              >
                {offerEnded
                  ? "Prazo de compras encerrado"
                  : `Ir para pagamento · ${brl(total)}`}
              </button>
              <p className="mt-2 text-center text-[11px] text-muted">
                Pagamento simulado via Pix ou cartão.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function PaymentScreen({
  total,
  method,
  setMethod,
  receiptFile,
  receiptPreview,
  onSelectReceipt,
  onBack,
  onPay,
}: {
  total: number;
  method: "Pix" | "Cartão";
  setMethod: (m: "Pix" | "Cartão") => void;
  receiptFile: File | null;
  receiptPreview: string | null;
  onSelectReceipt: (file: File | null) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  const pixCode =
    "00020126DIACOM-IC-UFAL-PIX5204000053039865802BR6009MACEIO62070503***6304A1F2";
  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          {(["Pix", "Cartão"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                method === m
                  ? "border-cyan bg-cyan/10 text-cyan"
                  : "border-line text-muted hover:text-fg"
              }`}
            >
              {m}
              <span className="mt-0.5 block font-mono text-[10px] font-normal opacity-70">
                comprovante obrigatório
              </span>
            </button>
          ))}
        </div>

        {method === "Pix" ? (
          <div className="rounded-xl border border-line bg-panel-2 p-4 text-center">
            <div className="mx-auto grid size-32 place-items-center rounded-lg bg-fg">
              <QrPlaceholder />
            </div>
            <p className="mt-3 text-xs text-muted">
              Realize o Pix de <strong className="text-cyan">{brl(total)}</strong> e anexe o comprovante abaixo
            </p>
            <p className="mt-2 truncate rounded-lg border border-line bg-ink px-3 py-2 font-mono text-[10px] text-muted">
              {pixCode}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-panel-2 p-4 text-xs text-muted space-y-1.5">
            <p className="font-semibold text-fg">Pagamento via Cartão / Link</p>
            <p>
              Efetue o pagamento de <strong className="text-cyan">{brl(total)}</strong> na maquininha ou link do DIACOM e anexe a foto ou PDF do comprovante abaixo.
            </p>
          </div>
        )}

        {/* Upload de Comprovante */}
        <div className="rounded-xl border border-cyan/30 bg-panel-2 p-4">
          <p className="label text-cyan">Comprovante de pagamento *</p>
          <p className="mt-1 text-xs text-muted">
            Envie uma imagem (PNG, JPG, WEBP) ou PDF de até 5 MB.
          </p>

          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-ink px-4 py-5 text-center transition-colors hover:border-cyan">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => onSelectReceipt(e.target.files?.[0] ?? null)}
            />
            {receiptFile ? (
              <div className="w-full space-y-2">
                {receiptPreview ? (
                  <img
                    src={receiptPreview}
                    alt="Prévia do comprovante"
                    className="mx-auto max-h-36 rounded-lg border border-line object-contain"
                  />
                ) : (
                  <div className="mx-auto inline-flex items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-2 font-mono text-xs text-cyan">
                    📄 {receiptFile.name}
                  </div>
                )}
                <p className="truncate font-mono text-[11px] text-cyan">
                  {receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)
                </p>
                <p className="text-[11px] text-muted">
                  Clique para trocar o arquivo
                </p>
              </div>
            ) : (
              <>
                <span className="text-xl text-cyan">📎</span>
                <span className="mt-1 text-xs font-semibold text-fg">
                  Selecionar comprovante
                </span>
                <span className="mt-0.5 text-[11px] text-muted">
                  PNG, JPG, WEBP ou PDF
                </span>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="rounded-xl border border-line px-4 py-3 text-sm text-fg transition-colors hover:border-muted"
          >
            Voltar
          </button>
          <button
            onClick={onPay}
            disabled={!receiptFile}
            className="flex-1 rounded-xl bg-cyan py-3 text-sm font-semibold text-ink transition-colors hover:bg-[#5cebf5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enviar comprovante · {brl(total)}
          </button>
        </div>
      </div>
    </>
  );
}

function Field2({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="label text-muted">{label}</span>
      <input
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 font-mono text-sm outline-none placeholder:text-muted/60 focus:border-cyan"
      />
    </label>
  );
}

function QrPlaceholder() {
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" className="text-ink">
      <rect width="112" height="112" fill="white" />
      {Array.from({ length: 100 }).map((_, i) => {
        const x = (i % 10) * 11 + 1;
        const y = Math.floor(i / 10) * 11 + 1;
        const on = (i * 7 + Math.floor(i / 10) * 3) % 3 === 0;
        return on ? (
          <rect
            key={i}
            x={x}
            y={y}
            width="10"
            height="10"
            fill="currentColor"
          />
        ) : null;
      })}
      <rect
        x="1"
        y="1"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
      <rect
        x="79"
        y="1"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
      <rect
        x="1"
        y="79"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
      />
    </svg>
  );
}
