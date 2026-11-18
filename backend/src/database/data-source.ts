import 'dotenv/config';
import { DataSource } from 'typeorm';

 const AppDataSource = new DataSource({
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
export default AppDataSource;