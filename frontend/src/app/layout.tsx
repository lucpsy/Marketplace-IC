import Nav from "@/components/Nav";
import "./global.css"
export default function RootLayout({children,}: {children: React.ReactNode;}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Primeira página em next</title>
      </head>
      <body className="min-h-screen bg-[#040D0D]">
        <Nav />
        {children}
      </body>
    </html>
  );
}