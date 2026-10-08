import { Produto } from "@/types/Produto";
export default function Card({ produto }: { produto: Produto }) {
    return (
        <div id="card"className="rounded-xl overflow-hidden">
            <img src={produto.imagens[0]} alt={produto.nome} className="w-full aspect-3/4 object-cover" />
            <div className="bg-[#1C2A2F] h-20 justify-center flex">
                <h2 className="text-white p-6">{produto.nome}</h2>
            </div>
        </div>
    );
} 