import { MigrationInterface, QueryRunner } from 'typeorm';

export class PedidoPinRetirada1795400000000 implements MigrationInterface {
  name = 'PedidoPinRetirada1795400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pedido" ADD "pin_retirada" character varying(10)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pedido" DROP COLUMN "pin_retirada"`);
  }
}
