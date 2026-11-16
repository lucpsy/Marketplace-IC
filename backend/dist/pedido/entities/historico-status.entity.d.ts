import { Pedido } from './pedido.entity';
import { StatusPedido } from './status_pedido.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
export declare class HistoricoStatus {
    idHistorico: string;
    pedido: Pedido;
    status: StatusPedido;
    usuarioResponsavel: Usuario | null;
    observacao: string | null;
    dataHora: Date;
}
