import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Pedido } from './pedido.entity';
import { Produto } from '../../catalogo/entities/produto.entity';

@Entity({ name: 'item_pedido' })
export class ItemPedido {
  @PrimaryGeneratedColumn('identity', {
    name: 'id_item_pedido',
    type: 'bigint',
  })
  idItemPedido: string;

  @ManyToOne(() => Pedido, pedido => pedido.itens, {nullable: false,})
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @ManyToOne(() => Produto, produto => produto.itensPedido, {nullable: false,})
  @JoinColumn({ name: 'id_produto' })
  produto: Produto;

  @Column({name: 'nome_produto_snapshot',type: 'varchar',length: 200,nullable: false,})
  nomeProdutoSnapshot: string;

  @Column({name: 'sku_snapshot',type: 'varchar',length: 100,nullable: true,})
  skuSnapshot: string | null;

  @Column({ type: 'integer', nullable: false })
  quantidade: number;

  @Column({name: 'preco_unitario_snapshot',type: 'decimal',precision: 12,scale: 2,nullable: false,})
  precoUnitarioSnapshot: string;

  @Column({type: 'decimal',precision: 12,scale: 2,nullable: false,default: 0,})
  desconto: string;

  @Column({name: 'valor_total',type: 'decimal',precision: 12,scale: 2,nullable: false,})
  valorTotal: string;
}