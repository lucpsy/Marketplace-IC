import { Produto } from "../../catalogo/entities/produto.entity";
import { Promocao } from "./promocao.entity";
export declare class ProdutoPromocao {
    idProdutoPromocao: string;
    promocao: Promocao;
    produto: Produto;
}
