const WEAK_SECRETS = new Set([
  'secret',
  'changeme',
  'jwt_secret',
  'admin123',
  '123456',
  '12345678',
  'marketplace',
  'dev-local-secret-change-in-production-32chars',
]);

const WEAK_DB_PASSWORDS = new Set([
  'marketplace',
  'postgres',
  'password',
  'admin',
  'admin123',
  '123456',
]);

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error(
      '[Security] Variável obrigatória JWT_SECRET não definida no ambiente.',
    );
  }

  if (isProduction()) {
    if (secret.length < 32 || WEAK_SECRETS.has(secret.toLowerCase())) {
      throw new Error(
        '[Security] Em produção, JWT_SECRET deve ter ao menos 32 caracteres aleatórios e não usar valores padrão.',
      );
    }
  }

  return secret;
}

export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();

  if (raw) {
    const origins = raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    if (isProduction() && (origins.length === 0 || origins.includes('*'))) {
      throw new Error(
        '[Security] Em produção, CORS_ORIGIN deve listar explicitamente os domínios permitidos (sem "*").',
      );
    }

    return origins;
  }

  if (isProduction()) {
    throw new Error(
      '[Security] Variável obrigatória CORS_ORIGIN não definida em produção.',
    );
  }

  return ['http://localhost:3000', 'http://127.0.0.1:3000'];
}

export interface DatabaseConnectionParams {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

export function getDatabaseConfig(): DatabaseConnectionParams {
  const sslEnabled = process.env.DB_SSL === 'true';
  const ssl = sslEnabled
    ? {
        rejectUnauthorized:
          process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      }
    : false;

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    if (isProduction()) {
      try {
        const parsed = new URL(databaseUrl);
        const pwd = decodeURIComponent(parsed.password || '');
        if (!pwd || WEAK_DB_PASSWORDS.has(pwd.toLowerCase())) {
          throw new Error(
            '[Security] DATABASE_URL utiliza senha padrão/fraca proibida em produção.',
          );
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('[Security]')) {
          throw err;
        }
        throw new Error('[Security] DATABASE_URL inválida.');
      }
    }

    return { url: databaseUrl, ssl };
  }

  const host = process.env.DB_HOST?.trim() || 'postgres';
  const port = Number(process.env.DB_PORT || 5432);
  const username =
    process.env.DB_USER?.trim() ||
    process.env.POSTGRES_USER?.trim() ||
    'marketplace';
  const password =
    process.env.DB_PASSWORD?.trim() ||
    process.env.POSTGRES_PASSWORD?.trim();
  const database =
    process.env.DB_NAME?.trim() ||
    process.env.POSTGRES_DB?.trim() ||
    'marketplace';

  if (isProduction()) {
    if (!password || WEAK_DB_PASSWORDS.has(password.toLowerCase())) {
      throw new Error(
        '[Security] Em produção, defina DB_PASSWORD (ou DATABASE_URL) com uma senha forte (valores padrão não são permitidos).',
      );
    }
  }

  return {
    host,
    port,
    username,
    password: password || 'marketplace',
    database,
    ssl,
  };
}
