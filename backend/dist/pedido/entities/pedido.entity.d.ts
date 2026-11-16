import { Usuario } from '../../usuario/entities/usuario.entity';
import { StatusPedido } from './status_pedido.entity';
import { ItemPedido } from './item_pedido.entity';
import { HistoricoStatus } from './historico-status.entity';
import { Pagamento } from '../../pagamento/entities/pagamento.entity';
export declare class Pedido {
    idPedido: string;
    usuario: Usuario;
    status: StatusPedido | null;
    dataPedido: Date;
    subtotal: string;
    valorDesconto: string;
    frete: string;
    valorTotal: string;
    observacao: string | null;
    dataAtualizacao: Date | null;
    itens: ItemPedido[];
    historicoStatus: HistoricoStatus[];
    pagamentos: Pagamento[];
}
