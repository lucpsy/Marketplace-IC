import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../common/config/env.config';

const isCompiled = __filename.endsWith('.js');
const ext = isCompiled ? 'js' : 'ts';

const AppDataSource = new DataSource({
  type: 'postgres',
  ...getDatabaseConfig(),
  entities: [path.join(__dirname, '..', '**', `*.entity.${ext}`)],
  migrations: [path.join(__dirname, 'migrations', `*.${ext}`)],
  synchronize: false,
});

export default AppDataSource;