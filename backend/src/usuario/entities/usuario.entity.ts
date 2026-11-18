import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Auditoria } from "../../auditoria/entities/log_auditoria.entity";
import { Carrinho } from "../../carrinho/entities/carrinho.entity";
import { Pedido } from "../../pedido/entities/pedido.entity";
import { HistoricoStatus } from "../../pedido/entities/historico-status.entity";
import { Notificacao } from "../../notificacao/entities/notificacao.entity";

@Entity({ name: "usuario" })
export class Usuario {
  @PrimaryGeneratedColumn("identity", { type: "bigint", name: "id_usuario" })
  idUsuario: string;

  @Column({ type: "varchar", length: 150 })
  nome: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, name: "senha_hash", select: false })
  senhaHash: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  telefone: string;

  @Column({ type: "varchar", length: 30, default: "ativo" })
  status: string;

  @CreateDateColumn({
    type: "timestamp",
    name: "data_cadastro",
    default: () => "now()",
  })
  dataCadastro: Date;

  @Column({ type: "timestamp", name: "data_atualizacao", nullable: true })
  dataAtualizacao: Date;

  @Column({ type: "varchar", length: 20, default: 'cliente' })
  cargo: string;

  @OneToMany(() => Auditoria, (auditoria) => auditoria.usuario)
  auditorias: Auditoria[];

  @OneToOne(() => Carrinho, carrinho => carrinho.usuario)
  carrinho: Carrinho;

  @OneToMany(() => Pedido, pedido => pedido.usuario)
  pedidos: Pedido[];

  @OneToMany(() => HistoricoStatus, historico => historico.usuarioResponsavel)
  historicoStatus: HistoricoStatus[];

  @OneToMany(() => Notificacao, notificacao => notificacao.usuario)
  notificacoes: Notificacao[];
}
