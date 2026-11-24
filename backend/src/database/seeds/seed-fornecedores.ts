import 'dotenv/config';
import { Repository } from 'typeorm';
import AppDataSource from '../data-source';
import { Fornecedor } from '../../fornecedor/entities/fornecedor.entity';

/**
 * Função única responsável pela criação dos fornecedores/pontos de retirada padrão.
 * Pode receber um repositório existente (do NestJS) ou usar o AppDataSource diretamente (via CLI).
 */
export async function seedFornecedores(repo?: Repository<Fornecedor>) {
  let fornecedorRepo = repo;
  let initializedHere = false;

  if (!fornecedorRepo) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      initializedHere = true;
    }
    fornecedorRepo = AppDataSource.getRepository(Fornecedor);
  }

  const count = await fornecedorRepo.count();

  if (count > 0) {
    console.log(`[Seed] Fornecedores já cadastrados (${count}). Nenhuma ação necessária.`);
  } else {
    await fornecedorRepo.save([
      {
        nomeRazaoSocial: 'Confecções IC Ltda',
        nomeFantasia: 'Confecções IC',
        email: 'confeccoes@diacom.ic.ufal.br',
        telefone: '(82) 3214-1000',
        status: 'ativo',
        dadosPagamento: JSON.stringify({
          pontoRetirada: 'Sala do DIACOM — Bloco 4',
          chavePix: 'confeccoes@diacom.ic.ufal.br',
          preparationFlow: [
            'Confirmado',
            'Corte & Estamparia',
            'Em separação',
            'Pronto para retirada',
            'Entregue',
          ],
          currentStage: 'Confirmado',
        }),
      },
      {
        nomeRazaoSocial: 'Gráfica Universitária Campus Ltda',
        nomeFantasia: 'Gráfica Campus',
        email: 'grafica@campus.ufal.br',
        telefone: '(82) 3214-1100',
        status: 'ativo',
        dadosPagamento: JSON.stringify({
          pontoRetirada: 'Gráfica Central — Bloco 1',
          chavePix: 'grafica@campus.ufal.br',
          preparationFlow: [
            'Confirmado',
            'Impressão / Acabamento',
            'Pronto para retirada',
            'Entregue',
          ],
          currentStage: 'Confirmado',
        }),
      },
      {
        nomeRazaoSocial: 'Brindes Alagoas Eireli',
        nomeFantasia: 'Brindes Alagoas',
        email: 'contato@brindesalagoas.com.br',
        telefone: '(82) 3214-1200',
        status: 'ativo',
        dadosPagamento: JSON.stringify({
          pontoRetirada: 'Coordenação de Extensão — Bloco 1',
          chavePix: 'contato@brindesalagoas.com.br',
          preparationFlow: [
            'Confirmado',
            'Em separação',
            'Pronto para retirada',
            'Entregue',
          ],
          currentStage: 'Confirmado',
        }),
      },
    ]);
    console.log('[Seed] Fornecedores padrão criados com sucesso!');
  }

  if (initializedHere) {
    await AppDataSource.destroy();
  }
}

// Execução direta via CLI (npm run seed:fornecedores)
if (require.main === module) {
  seedFornecedores().catch((err) => {
    console.error('[Seed] Erro ao executar seed de fornecedores:', err);
    process.exit(1);
  });
}
