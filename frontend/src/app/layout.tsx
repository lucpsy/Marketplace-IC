"use client";
import Nav from "@/components/Nav";
import "./global.css";
import { useState } from "react";
import Carrinho from "@/components/Carrinho";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  return (
    <html lang="pt-BR">
      <head>
        <title>Primeira página em next</title>
      </head>
      <body className="min-h-screen bg-[#040D0D] w-full px-50 mx-auto">
        <Nav setCarrinhoAberto={setCarrinhoAberto} />
        <Carrinho setCarrinhoAberto={setCarrinhoAberto} carrinhoAberto={carrinhoAberto} />
        {children}
      </body>
    </html>
  );
}
