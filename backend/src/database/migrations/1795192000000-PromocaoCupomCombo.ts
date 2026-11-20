import { MigrationInterface, QueryRunner } from 'typeorm';

export class PromocaoCupomCombo1795192000000 implements MigrationInterface {
  name = 'PromocaoCupomCombo1795192000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promocao" ADD "codigo" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "promocao" ADD CONSTRAINT "UQ_promocao_codigo" UNIQUE ("codigo")`,
    );
    await queryRunner.query(
      `ALTER TABLE "promocao" ADD "valor_minimo" numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "promocao" ADD "quantidade_minima" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promocao" DROP COLUMN "quantidade_minima"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promocao" DROP COLUMN "valor_minimo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promocao" DROP CONSTRAINT "UQ_promocao_codigo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promocao" DROP COLUMN "codigo"`,
    );
  }
}
