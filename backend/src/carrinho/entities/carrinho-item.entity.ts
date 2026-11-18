import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Carrinho } from './carrinho.entity';
import { Produto } from '../../catalogo/entities/produto.entity';

@Entity({ name: 'carrinho_item' })
@Index('UQ_carrinho_item_produto', ['carrinho', 'produto'], {unique: true,})
export class CarrinhoItem {
  @PrimaryGeneratedColumn('identity', {name: 'id_carrinho_item',type: 'bigint',})
  idCarrinhoItem: string;

  @ManyToOne(() => Carrinho, carrinho => carrinho.itens, {nullable: false,})
  @JoinColumn({ name: 'id_carrinho' })
  carrinho: Carrinho;

  @ManyToOne(() => Produto, produto => produto.itensCarrinho, {nullable: false,})
  @JoinColumn({ name: 'id_produto' })
  produto: Produto;

  @Column({ type: 'integer', nullable: false })
  quantidade: number;

  @Column({name: 'preco_unitario',type: 'decimal',precision: 12,scale: 2,nullable: false,})
  precoUnitario: string;
}