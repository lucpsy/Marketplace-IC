import { MigrationInterface, QueryRunner } from 'typeorm';

export class PagamentoTransparenciaFinanceira1795280000000
  implements MigrationInterface
{
  name = 'PagamentoTransparenciaFinanceira1795280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pagamento" ALTER COLUMN "id_pedido" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "pagamento" ADD "tipo" character varying(20) NOT NULL DEFAULT 'entrada'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pagamento" ADD "categoria" character varying(40) NOT NULL DEFAULT 'venda'`,
    );
    await queryRunner.query(
      `ALTER TABLE "pagamento" ADD "validador_nome" character varying(150)`,
    );
    await queryRunner.query(
      `ALTER TABLE "pagamento" ADD "validador_cargo" character varying(150)`,
    );
    await queryRunner.query(
      `ALTER TABLE "pagamento" ADD "ativo" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pagamento_transparencia" ON "pagamento" ("ativo", "status", "tipo", "categoria")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pagamento_datas" ON "pagamento" ("data_pagamento", "data_criacao")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_pagamento_datas"`);
    await queryRunner.query(`DROP INDEX "IDX_pagamento_transparencia"`);
    await queryRunner.query(`ALTER TABLE "pagamento" DROP COLUMN "ativo"`);
    await queryRunner.query(
      `ALTER TABLE "pagamento" DROP COLUMN "validador_cargo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pagamento" DROP COLUMN "validador_nome"`,
    );
    await queryRunner.query(`ALTER TABLE "pagamento" DROP COLUMN "categoria"`);
    await queryRunner.query(`ALTER TABLE "pagamento" DROP COLUMN "tipo"`);
    await queryRunner.query(
      `ALTER TABLE "pagamento" ALTER COLUMN "id_pedido" SET NOT NULL`,
    );
  }
}
