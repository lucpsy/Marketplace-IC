import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { StatusPedido } from './status_pedido.entity';

@Entity({ name: 'transicao_status' })
@Unique('UQ_transicao_status_origem_destino', [
  'statusOrigem',
  'statusDestino',
])
export class TransicaoStatus {
  @PrimaryGeneratedColumn('identity', {name: 'id_transicao',type: 'bigint',})
  idTransicao: string;

  @ManyToOne(() => StatusPedido,{nullable: false,})
  @JoinColumn({ name: 'id_status_origem' })
  statusOrigem: StatusPedido;

  @ManyToOne(() => StatusPedido, {nullable: false,})
  @JoinColumn({ name: 'id_status_destino' })
  statusDestino: StatusPedido;

  @Column({type: 'boolean',nullable: false,default: true,})
  permitido: boolean;
}