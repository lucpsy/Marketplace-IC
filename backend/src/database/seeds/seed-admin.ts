import 'dotenv/config';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import AppDataSource from '../data-source';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { isProduction } from '../../common/config/env.config';
import * as bcrypt from 'bcrypt';

/**
 * Função única responsável pela lógica de criação do administrador.
 * Pode receber um repositório existente (do NestJS) ou usar o AppDataSource diretamente (via CLI).
 */
export async function seedAdmin(repo?: Repository<Usuario>) {
  let usuarioRepo = repo;
  let initializedHere = false;

  if (!usuarioRepo) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      initializedHere = true;
    }
    usuarioRepo = AppDataSource.getRepository(Usuario);
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim() || 'admin@diacom.ic.ufal.br';
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminNome = process.env.ADMIN_NOME?.trim() || 'Coordenação DIACOM';

  const existente = await usuarioRepo.findOne({
    where: [{ email: adminEmail }, { cargo: 'admin' }],
  });

  if (existente) {
    console.log(`[Seed] Administrador já existente (${existente.email}). Nenhuma ação necessária.`);
  } else {
    let senhaFinal = envPassword;

    if (isProduction()) {
      if (!senhaFinal || senhaFinal.length < 12) {
        const msg =
          '[Seed] Nenhum administrador encontrado. Em produção, defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 12 caracteres) para criar o administrador inicial.';
        if (initializedHere) {
          await AppDataSource.destroy();
          throw new Error(msg);
        }
        console.warn(msg);
        return;
      }
    } else if (!senhaFinal) {
      senhaFinal = randomBytes(12).toString('base64url');
      console.warn(
        `[Seed] ADMIN_PASSWORD não definido em desenvolvimento. Senha temporária gerada para ${adminEmail}: ${senhaFinal}`,
      );
    }

    const senhaHash = await bcrypt.hash(senhaFinal, 10);
    const novoAdmin = usuarioRepo.create({
      nome: adminNome,
      email: adminEmail,
      senhaHash,
      cargo: 'admin',
      status: 'ativo',
      telefone: '(82) 3214-1000',
    });
    await usuarioRepo.save(novoAdmin);
    console.log(`[Seed] Administrador criado com sucesso! Email: ${adminEmail}`);
  }

  if (initializedHere) {
    await AppDataSource.destroy();
  }
}

// Execução direta via CLI (npm run seed:admin)
if (require.main === module) {
  seedAdmin().catch((err) => {
    console.error('[Seed] Erro ao executar seed de admin:', err);
    process.exit(1);
  });
}
