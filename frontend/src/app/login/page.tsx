import { Suspense } from "react"
import { LoginView } from "@/views/LoginView"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-line border-t-cyan" />
        </div>
      }
    >
      <LoginView />
    </Suspense>
  )
}

