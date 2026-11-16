import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Pedido } from '../../pedido/entities/pedido.entity';

@Entity({ name: 'pagamento' })
export class Pagamento {
  @PrimaryGeneratedColumn('identity', {name: 'id_pagamento',type: 'bigint',})
  idPagamento: string;

  @ManyToOne(() => Pedido, pedido => pedido.pagamentos, {nullable: false,})
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @Column({type: 'decimal',precision: 12,scale: 2,nullable: false,})
  valor: string;

  @Column({type: 'varchar',length: 40,nullable: false,})
  metodo: string;

  @Column({type: 'varchar',length: 40,nullable: false,default: 'pendente',})
  status: string;

  @CreateDateColumn({name: 'data_criacao',type: 'timestamp',nullable: false,default: () => 'now()',})
  dataCriacao: Date;

  @Column({name: 'data_pagamento',type: 'timestamp',nullable: true,})
  dataPagamento: Date | null;

  @Column({name: 'referencia_gateway',type: 'varchar',length: 255,nullable: true,unique: true,})
  referenciaGateway: string | null;

  @Column({type: 'text',nullable: true,})
  descricao: string | null;
}