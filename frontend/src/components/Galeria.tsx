"use client";
import {Produto} from "@/types/Produto";
import {useState} from "react";
import Card from "./Card";
export default function Galeria() {
  const [selecionado, setClicado] = useState("tudo");
  const [produtos, setProdutos] = useState<Produto[]>([
    {
      id: 1,
      empresa: "CONFECÇÕES IC",
      nome: "Camisa DIACOM 2026",
      tipo: "Vestuário",
      preco: 55.0,
      desconto: 25,
      evento: "secomp 2026",
      imagens: [
        "https://i.pinimg.com/736x/0e/6a/1e/0e6a1e8470aec3ac1d42a0ce934d1143.jpg",
        "https://i.pinimg.com/736x/b9/2e/73/b92e7372d06f5585ae6e7164e8061502.jpg",
        "https://i.pinimg.com/736x/b7/6d/c8/b76dc82c88bd36d39524e770fe03337d.jpg",
      ],
    },
    {
      id: 2,
      empresa: "Junior Confecções",
      nome: "Caneca DIACOM",
      tipo: "Acessórios",
      preco: 30.0,
      desconto: 10,
      evento: "secomp 2026",
      imagens: [
        "https://i.pinimg.com/736x/38/cc/fe/38ccfefeb083d0270735223ad581ebad.jpg",
        "https://i.pinimg.com/736x/d1/e7/da/d1e7da934af15a98434cbe27e84f66f4.jpg",
      ],
    },
    {
      id: 3,
      empresa: "Papelaria ABC",
      nome: "bottons DIACOM",
      tipo: "Papelaria",
      preco: 15.0,
      desconto: 5,
      evento: "secomp 2026",
      imagens: [
        "https://i.pinimg.com/736x/9d/a6/fc/9da6fca4b175b5a40a77567128cb4e1b.jpg",
        "https://i.pinimg.com/736x/f4/1b/dd/f41bdd3f134a28673c1b45f3252d97e1.jpg",
      ],
    },
  ]);

  return (
    <div>
      <nav id="galeria-filtros" className="flex gap-5">
        <button
          id="tudo"
          className={`text-[#eaeaea8f] hover:text-[#EAEAEA] ${selecionado == "tudo" ? "border-cyan-500 text-cyan-500 hover:text-cyan-500" : ""} border rounded-full p-2`}
          onClick={() => setClicado("tudo")}
        >
          Tudo
        </button>
        <button
          id="vestuario"
          className={`text-[#eaeaea8f] hover:text-[#EAEAEA] ${selecionado == "Vestuário" ? "border-cyan-500 text-cyan-500 hover:text-cyan-500" : ""} border rounded-full p-2`}
          onClick={() => setClicado("Vestuário")}
        >
          Vestuário
        </button>
        <button
          id="acessorios"
          className={`text-[#eaeaea8f] hover:text-[#EAEAEA] ${selecionado == "Acessórios" ? "border-cyan-500 text-cyan-500 hover:text-cyan-500" : ""} border rounded-full p-2`}
          onClick={() => setClicado("Acessórios")}
        >
          Acessórios
        </button>
        <button
          id="papelaria"
          className={`text-[#eaeaea8f] hover:text-[#EAEAEA] ${selecionado == "Papelaria" ? "border-cyan-500 text-cyan-500 hover:text-cyan-500" : ""} border rounded-full p-2`}
          onClick={() => setClicado("Papelaria")}
        >
          Papelaria
        </button>
      </nav>
      <div id="galeria-cards" className="mt-5 grid grid-cols-3 gap-5">
        {produtos
          .filter((produto) => selecionado === "tudo" || produto.tipo === selecionado)
          .map((produto) => (
            <Card key={produto.id} produto={produto} />
          ))}
      </div>
    </div>
  );
}
