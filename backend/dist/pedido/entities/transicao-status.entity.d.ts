import { StatusPedido } from './status_pedido.entity';
export declare class TransicaoStatus {
    idTransicao: string;
    statusOrigem: StatusPedido;
    statusDestino: StatusPedido;
    permitido: boolean;
}
