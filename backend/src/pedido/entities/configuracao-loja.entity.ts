import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'configuracao_loja' })
export class ConfiguracaoLoja {
  @PrimaryColumn({ type: 'varchar', length: 60 })
  chave: string;

  @Column({ type: 'text', nullable: true })
  valor: string | null;

  @UpdateDateColumn({
    name: 'data_atualizacao',
    type: 'timestamp',
    nullable: false,
    default: () => 'now()',
  })
  dataAtualizacao: Date;
}
