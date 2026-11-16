import { Auditoria } from "../../auditoria/entities/log_auditoria.entity";
import { Carrinho } from "../../carrinho/entities/carrinho.entity";
import { Pedido } from "../../pedido/entities/pedido.entity";
import { HistoricoStatus } from "../../pedido/entities/historico-status.entity";
import { Notificacao } from "../../notificacao/entities/notificacao.entity";
export declare class Usuario {
    idUsuario: string;
    nome: string;
    email: string;
    senhaHash: string;
    telefone: string;
    status: string;
    dataCadastro: Date;
    dataAtualizacao: Date;
    cargo: string;
    auditorias: Auditoria[];
    carrinho: Carrinho;
    pedidos: Pedido[];
    historicoStatus: HistoricoStatus[];
    notificacoes: Notificacao[];
}
