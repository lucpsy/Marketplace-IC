import { X } from "lucide-react";
export default function Carrinho(props: {
  setCarrinhoAberto: (value: boolean) => void;
  carrinhoAberto: boolean;
}) {
  return (
    <>
      <div id = 'carrinho-overlay'
        className={`
          fixed inset-0 bg-black/50 z-40
          transition-opacity duration-300
          ${
            props.carrinhoAberto
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={() => props.setCarrinhoAberto(false)}
      />
      <div id = 'tab-carrinho'
        className={`
    fixed top-0 right-0 h-full w-1/3
    bg-[#0a1a1a] z-50
    transition-transform duration-300 ease-out
    ${props.carrinhoAberto ? "translate-x-0" : "translate-x-full"}
  `}
      >
        <div id = "carrinho-content" className="border border-[#31303067] p-4">
          <p className="text-cyan-400 font-bold">Carrinho</p>
          <div className="flex justify-between items-end">
            <p className="text-[#EAEAEA] text-2xl font-bold p pr-0">
              Seus pedidos
            </p>
            <button
              onClick={() => {
                props.setCarrinhoAberto(false);
              }}
              className="text-cyan-400 hover:text-cyan-300"
            >
              <X />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
