import { MigrationInterface, QueryRunner } from "typeorm";

export class Nova1794958063277 implements MigrationInterface {
    name = 'Nova1794958063277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "cargo" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "cargo" SET DEFAULT 'cliente'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "cargo" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "cargo" DROP NOT NULL`);
    }

}
