import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';
import { CarrinhoItem } from './carrinho-item.entity';

@Entity({ name: 'carrinho' })
export class Carrinho {
    @PrimaryGeneratedColumn('identity', {name: 'id_carrinho',type: 'bigint',})
    idCarrinho: string;

    @OneToOne(() => Usuario, usuario => usuario.carrinho, {nullable: false,})
    @JoinColumn({ name: 'id_usuario', referencedColumnName: 'idUsuario' })
    usuario: Usuario;

    @Column({type: 'varchar',length: 30,nullable: false,default: 'ativo',})
    status: string;

    @CreateDateColumn({name: 'data_criacao',type: 'timestamp',nullable: false,default: () => 'now()',})
    dataCriacao: Date;

    @UpdateDateColumn({name: 'data_atualizacao',type: 'timestamp',nullable: true,})
    dataAtualizacao: Date | null;

    @OneToMany(() => CarrinhoItem, item => item.carrinho)
    itens: CarrinhoItem[];  
}