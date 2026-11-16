import { Fornecedor } from "../../fornecedor/entities/fornecedor.entity";
import { ProdutoImagem } from "./produto-imagem.entity";
import { Categoria } from "./categoria.entity";
import { ProdutoPromocao } from "../../promo/entities/produto_promocao.entity";
import { CarrinhoItem } from "../../carrinho/entities/carrinho-item.entity";
import { ItemPedido } from "../../pedido/entities/item_pedido.entity";
export declare class Produto {
    idProduto: string;
    fornecedor: Fornecedor;
    nome: string;
    descricao: string | null;
    marca: string | null;
    selo: string | null;
    sku: string | null;
    precoCusto: string;
    precoVenda: string;
    estoque: number;
    status: string;
    dataCadastro: Date;
    dataAtualizacao: Date | null;
    imagens: ProdutoImagem[];
    categorias: Categoria[];
    promocoes: ProdutoPromocao[];
    itensCarrinho: CarrinhoItem[];
    itensPedido: ItemPedido[];
}
