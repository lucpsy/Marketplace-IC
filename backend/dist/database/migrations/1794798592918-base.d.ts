import { MigrationInterface, QueryRunner } from "typeorm";
export declare class Base1794798592918 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
