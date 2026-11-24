import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConfiguracaoLojaPrazo1795450000000 implements MigrationInterface {
  name = 'ConfiguracaoLojaPrazo1795450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "configuracao_loja" ("chave" character varying(60) NOT NULL, "valor" text, "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_configuracao_loja_chave" PRIMARY KEY ("chave"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "configuracao_loja"`);
  }
}
