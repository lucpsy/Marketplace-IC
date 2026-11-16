import { Pedido } from '../../pedido/entities/pedido.entity';
export declare class Pagamento {
    idPagamento: string;
    pedido: Pedido;
    valor: string;
    metodo: string;
    status: string;
    dataCriacao: Date;
    dataPagamento: Date | null;
    referenciaGateway: string | null;
    descricao: string | null;
}
