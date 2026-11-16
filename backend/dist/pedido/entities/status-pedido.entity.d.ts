import { Pedido } from './pedido.entity';
export declare class StatusPedido {
    idStatus: string;
    nome: string;
    descricao: string | null;
    ordem: number;
    cor: string | null;
    statusFinal: boolean;
    ativo: boolean;
    pedidos: Pedido[];
}
