import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'notificacao' })
export class Notificacao {
  @PrimaryGeneratedColumn('identity', {name: 'id_notificacao',type: 'bigint',})
  idNotificacao: string;

  @ManyToOne(() => Usuario, usuario => usuario.notificacoes, {nullable: false,})
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({type: 'varchar',length: 200,nullable: false,})
  titulo: string;

  @Column({type: 'text',nullable: false,})
  mensagem: string;

  @Column({type: 'varchar',length: 50,nullable: true,})
  tipo: string | null;

  @Column({type: 'boolean',nullable: false,default: false,})
  lida: boolean;

  @CreateDateColumn({name: 'data_criacao',type: 'timestamp',nullable: false,default: () => 'now()',})
  dataCriacao: Date;
}