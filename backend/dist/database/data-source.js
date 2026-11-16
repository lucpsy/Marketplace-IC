"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'postgres',
    port: 5432,
    username: 'marketplace',
    password: 'marketplace',
    database: 'marketplace',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
});
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map