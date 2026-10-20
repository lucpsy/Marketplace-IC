"use client"
import { ORDER_STAGES } from "@/lib/data"

export function OrderStepper({
  status,
  stages = ORDER_STAGES,
}: {
  status: string
  stages?: string[]
}) {
  const currentStages = stages && stages.length > 0 ? stages : ORDER_STAGES
  const rawIndex = currentStages.indexOf(status)
  const activeIndex = rawIndex >= 0 ? rawIndex : 0

  return (
    <div>
      <div className="flex items-center">
        {currentStages.map((stage, i) => {
          const reached = i <= activeIndex
          const current = i === activeIndex
          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div
                className={`grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-mono transition-colors ${
                  reached ? "border-cyan bg-cyan text-ink font-bold" : "border-line text-muted"
                } ${current ? "ring-4 ring-cyan/20" : ""}`}
              >
                {reached ? "✓" : i + 1}
              </div>
              {i < currentStages.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${i < activeIndex ? "bg-cyan" : "bg-line"}`}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between gap-1">
        {currentStages.map((stage, i) => (
          <span
            key={stage}
            className={`flex-1 text-[10px] leading-tight ${
              i <= activeIndex ? "text-fg font-medium" : "text-muted"
            } ${
              i === 0
                ? "text-left"
                : i === currentStages.length - 1
                ? "text-right"
                : "text-center"
            }`}
          >
            {stage}
          </span>
        ))}
      </div>
    </div>
  )
}
