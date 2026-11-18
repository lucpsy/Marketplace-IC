import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Pedido } from './pedido.entity';

@Entity({ name: 'status_pedido' })
export class StatusPedido {
  @PrimaryGeneratedColumn('identity', {name: 'id_status',type: 'bigint',})
  idStatus: string;

  @Column({type: 'varchar',length: 80,nullable: false,unique: true,})
  nome: string;

  @Column({type: 'text',nullable: true,})
  descricao: string | null;

  @Column({type: 'integer',nullable: false,default: 0,})
  ordem: number;

  @Column({type: 'varchar',length: 30,nullable: true,})
  cor: string | null;

  @Column({name: 'status_final',type: 'boolean',nullable: false,default: false,})
  statusFinal: boolean;

  @Column({type: 'boolean',nullable: false,default: true,})
  ativo: boolean;

  @OneToMany(() => Pedido, pedido => pedido.status)
  pedidos: Pedido[];
}