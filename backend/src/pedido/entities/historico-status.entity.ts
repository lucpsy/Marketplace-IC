import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Pedido } from './pedido.entity';
import { StatusPedido } from './status_pedido.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'historico_status' })
export class HistoricoStatus {
  @PrimaryGeneratedColumn('identity', {name: 'id_historico',type: 'bigint',})
  idHistorico: string;

  @ManyToOne(() => Pedido, pedido => pedido.historicoStatus, {nullable: false,})
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @ManyToOne(() => StatusPedido, {nullable: false,})
  @JoinColumn({ name: 'id_status' })
  status: StatusPedido;

  @ManyToOne(() => Usuario, usuario => usuario.historicoStatus, {nullable: true,})
  @JoinColumn({ name: 'id_usuario_responsavel' })
  usuarioResponsavel: Usuario | null;

  @Column({type: 'text',nullable: true,})
  observacao: string | null;

  @CreateDateColumn({name: 'data_hora',type: 'timestamp',nullable: false,default: () => 'now()',})
  dataHora: Date;
}