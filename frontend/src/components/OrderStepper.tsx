"use client"
import { ORDER_STAGES, type OrderStatus } from "@/lib/data"

export function OrderStepper({ status }: { status: OrderStatus }) {
  const activeIndex = ORDER_STAGES.indexOf(status)
  return (
    <div>
      <div className="flex items-center">
        {ORDER_STAGES.map((stage, i) => {
          const reached = i <= activeIndex
          const current = i === activeIndex
          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div
                className={`grid size-6 shrink-0 place-items-center rounded-full border text-[10px] transition-colors ${
                  reached ? "border-cyan bg-cyan text-ink" : "border-line text-muted"
                } ${current ? "ring-4 ring-cyan/20" : ""}`}
              >
                {reached ? "✓" : i + 1}
              </div>
              {i < ORDER_STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${i < activeIndex ? "bg-cyan" : "bg-line"}`}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between gap-1">
        {ORDER_STAGES.map((stage, i) => (
          <span
            key={stage}
            className={`flex-1 text-[10px] leading-tight ${
              i <= activeIndex ? "text-fg" : "text-muted"
            } ${i === 0 ? "text-left" : i === ORDER_STAGES.length - 1 ? "text-right" : "text-center"}`}
          >
            {stage}
          </span>
        ))}
      </div>
    </div>
  )
}
