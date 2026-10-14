import type { Metadata } from "next"
import "./global.css"
import { AppStore } from "@/lib/store"
import AppShell from "@/components/AppShell"

export const metadata: Metadata = { title: "DIACOM Loja" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppStore>
          <AppShell>{children}</AppShell>
        </AppStore>
      </body>
    </html>
  )
}