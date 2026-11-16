import { Pedido } from './pedido.entity';
import { Produto } from '../../catalogo/entities/produto.entity';
export declare class ItemPedido {
    idItemPedido: string;
    pedido: Pedido;
    produto: Produto;
    nomeProdutoSnapshot: string;
    skuSnapshot: string | null;
    quantidade: number;
    precoUnitarioSnapshot: string;
    desconto: string;
    valorTotal: string;
}
