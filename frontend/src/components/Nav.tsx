"use client";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function Nav(props: { setCarrinhoAberto: (value: boolean) => void }) {
  const [selecionado, setClicado] = useState("loja");

  return (
    <div id="nav" className="border border-[#313030] my-4 p-3 px-5 rounded-2xl bg-[#0e0f18bd]">
      <nav className="flex justify-between py-1.5">
        <div className="flex gap-1.5">
          <p className="font-black text-xl text-cyan-300">DIACOM</p>
          <p className="font-black text-xl text-[#EAEAEA]">UFAL</p>
        </div>
        <div id="nav-links" className="flex gap-40">
          <button onClick={() => { setClicado("loja") }} className={`text-[#EAEAEA] hover:text-cyan-300 ${selecionado == "loja" ? "text-cyan-500 bg-[#1b1f29] rounded-md px-3" : ""}`}>
            Loja
          </button>
          <button onClick={() => { setClicado("pedidos") }} className={`text-[#EAEAEA] hover:text-cyan-300 ${selecionado == "pedidos" ? "text-cyan-500 bg-[#1b1f29] rounded-md px-3" : ""}`}>
            Meus Pedidos
          </button>
          <button onClick={() => { setClicado("transparencia") }} className={`text-[#EAEAEA] hover:text-cyan-300 ${selecionado == "transparencia" ? "text-cyan-500 bg-[#1b1f29] rounded-md px-3" : ""}`}>
            Transparencia
          </button>
        </div>
        <div id="nav-cart-profile" className="flex gap-12">
          <button onClick={() => { props.setCarrinhoAberto(true) }} className="text-[#EAEAEA] hover:text-cyan-300">
            <ShoppingCart />
          </button>
          <button onClick={() => { }} className="text-[#EAEAEA] hover:text-cyan-300">
            Perfil
          </button>
        </div>
      </nav>
    </div>
  );
}