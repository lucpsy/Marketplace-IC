import { Carrinho } from './carrinho.entity';
import { Produto } from '../../catalogo/entities/produto.entity';
export declare class CarrinhoItem {
    idCarrinhoItem: string;
    carrinho: Carrinho;
    produto: Produto;
    quantidade: number;
    precoUnitario: string;
}
