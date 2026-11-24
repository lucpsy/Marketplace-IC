import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ name: 'arquivo_upload' })
export class ArquivoUpload {
  @PrimaryGeneratedColumn('identity', {
    name: 'id_upload',
    type: 'bigint',
  })
  idUpload: string;

  @Column({ type: 'varchar', length: 160, unique: true, nullable: false })
  filename: string;

  @Column({
    name: 'nome_original',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  nomeOriginal: string | null;

  @Column({ type: 'varchar', length: 80, nullable: false })
  mimetype: string;

  @Column({ type: 'integer', nullable: false })
  tamanho: number;

  @Column({ type: 'bytea', nullable: false, select: false })
  dados: Buffer;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario | null;

  @CreateDateColumn({
    name: 'data_criacao',
    type: 'timestamp',
    nullable: false,
    default: () => 'now()',
  })
  dataCriacao: Date;
}
