import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Usuario } from "../../usuario/entities/usuario.entity";

@Entity({ name: "log_auditoria" })
export class Auditoria {
  @PrimaryGeneratedColumn("identity", { type: "bigint", name: "id_log" })
  idLog: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.auditorias, { nullable: true })
  @JoinColumn({ name: "id_usuario" })
  usuario: Usuario | null;

  @Column({ type: "varchar", length: 100, nullable: false })
  acao: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  entidade: string;

  @Column({ name: 'id_registro', type: "bigint", nullable: true })
  idRegistro: string | null;

  @Column({ type: "text", nullable: true })
  detalhes: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip: string | null;

  @CreateDateColumn({type: "timestamp",name: "data_hora",nullable: false,default: () => "now()",})
  dataRegistro: Date;
}
