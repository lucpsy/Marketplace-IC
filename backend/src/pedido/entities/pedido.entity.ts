import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';
import { StatusPedido } from './status_pedido.entity';
import { ItemPedido } from './item_pedido.entity';
import { HistoricoStatus } from './historico-status.entity';
import { Pagamento } from '../../pagamento/entities/pagamento.entity';

@Entity({ name: 'pedido' })
export class Pedido {
  @PrimaryGeneratedColumn('identity', {
    name: 'id_pedido',
    type: 'bigint',
  })
  idPedido: string;

  @ManyToOne(() => Usuario, usuario => usuario.pedidos, {nullable: false,})
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => StatusPedido, status => status.pedidos, {nullable: true,})
  @JoinColumn({ name: 'id_status' })
  status: StatusPedido | null;

  @CreateDateColumn({name: 'data_pedido',type: 'timestamp',nullable: false,default: () => 'now()',})
  dataPedido: Date;

  @Column({type: 'decimal',precision: 12,scale: 2,nullable: false,})
  subtotal: string;

  @Column({name: 'valor_desconto',type: 'decimal',precision: 12,scale: 2,nullable: false,default: 0,})
  valorDesconto: string;

  @Column({type: 'decimal',precision: 12,scale: 2,nullable: false,default: 0,})
  frete: string;

  @Column({name: 'valor_total',type: 'decimal',precision: 12,scale: 2, nullable: false,})
  valorTotal: string;

  @Column({type: 'text',nullable: true,})
  observacao: string | null;

  @UpdateDateColumn({name: 'data_atualizacao',type: 'timestamp',nullable: true,})
  dataAtualizacao: Date | null;

  @OneToMany(() => ItemPedido, item => item.pedido)
  itens: ItemPedido[];

  @OneToMany(() => HistoricoStatus, historico => historico.pedido)
  historicoStatus: HistoricoStatus[];

  @OneToMany(() => Pagamento, pagamento => pagamento.pedido)
  pagamentos: Pagamento[];
}