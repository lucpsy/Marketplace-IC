import { ShoppingCart } from "lucide-react";
export default function Nav() {
  return (
    <div className="border border-[#313030] mx-12 my-4 p-3 px-5 rounded-2xl bg-[#0e0f18bd]">
      <nav className="flex justify-between py-1.5">
        <div className="flex gap-1.5">
          <p className="font-black text-xl text-cyan-300">DIACOM</p>
          <p className="font-black text-xl text-[#EAEAEA]">UFAL</p>
        </div>
        <div className="flex gap-40">
          <a href="#" className="text-[#EAEAEA] hover:text-cyan-300">
            Loja
          </a>
          <a href="#" className="text-[#EAEAEA] hover:text-cyan-300">
            Meus Pedidos
          </a>
          <a href="#" className="text-[#EAEAEA] hover:text-cyan-300">
            Transparencia
          </a>
        </div>
        <div className="flex">
          <a href="#" className="text-[#EAEAEA] hover:text-cyan-300">
            <ShoppingCart />
          </a>
        </div>
      </nav>
    </div>
  );
}
