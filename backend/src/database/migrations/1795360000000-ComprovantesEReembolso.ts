import { MigrationInterface, QueryRunner } from "typeorm";

export class ComprovantesEReembolso1795360000000 implements MigrationInterface {
  name = "ComprovantesEReembolso1795360000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pagamento"
      ADD COLUMN IF NOT EXISTS "comprovante_url" text,
      ADD COLUMN IF NOT EXISTS "comprovante_reembolso_url" text,
      ADD COLUMN IF NOT EXISTS "motivo_reembolso" text,
      ADD COLUMN IF NOT EXISTS "data_reembolso" timestamp
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pagamento"
      DROP COLUMN IF EXISTS "data_reembolso",
      DROP COLUMN IF EXISTS "motivo_reembolso",
      DROP COLUMN IF EXISTS "comprovante_reembolso_url",
      DROP COLUMN IF EXISTS "comprovante_url"
    `);
  }
}
