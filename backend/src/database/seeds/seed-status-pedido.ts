import 'dotenv/config';
import { Repository } from 'typeorm';
import AppDataSource from '../data-source';
import { StatusPedido } from '../../pedido/entities/status_pedido.entity';
import { TransicaoStatus } from '../../pedido/entities/transicao-status.entity';

const STATUS_PADRAO = [
  {
    nome: 'Aguardando confirmação',
    descricao: 'Comprovante enviado, aguardando validação do administrador',
    ordem: 0,
    cor: '#f59e0b',
    statusFinal: false,
    ativo: true,
  },
  {
    nome: 'Confirmado',
    descricao: 'Pagamento confirmado e pedido aprovado',
    ordem: 1,
    cor: '#3b82f6',
    statusFinal: false,
    ativo: true,
  },
  {
    nome: 'Em separação',
    descricao: 'Itens sendo separados/preparados pelo fornecedor',
    ordem: 2,
    cor: '#f59e0b',
    statusFinal: false,
    ativo: true,
  },
  {
    nome: 'Pronto para retirada',
    descricao: 'Pedido disponível no ponto de retirada',
    ordem: 3,
    cor: '#8b5cf6',
    statusFinal: false,
    ativo: true,
  },
  {
    nome: 'Entregue',
    descricao: 'Pedido retirado/entregue ao comprador',
    ordem: 4,
    cor: '#10b981',
    statusFinal: false,
    ativo: true,
  },
  {
    nome: 'Solicitação de reembolso',
    descricao: 'Cliente solicitou reembolso do pedido',
    ordem: 5,
    cor: '#fb923c',
    statusFinal: false,
    ativo: true,
  },
  {
    nome: 'Reembolsado',
    descricao: 'Reembolso efetivado com comprovante anexado pelo administrador',
    ordem: 6,
    cor: '#06b6d4',
    statusFinal: true,
    ativo: true,
  },
  {
    nome: 'Cancelado',
    descricao: 'Pedido cancelado',
    ordem: 7,
    cor: '#ef4444',
    statusFinal: true,
    ativo: true,
  },
];

const TRANSICOES_PADRAO: Array<[string, string]> = [
  ['Aguardando confirmação', 'Confirmado'],
  ['Aguardando confirmação', 'Cancelado'],
  ['Confirmado', 'Em separação'],
  ['Confirmado', 'Pronto para retirada'],
  ['Confirmado', 'Entregue'],
  ['Confirmado', 'Solicitação de reembolso'],
  ['Confirmado', 'Cancelado'],
  ['Em separação', 'Pronto para retirada'],
  ['Em separação', 'Entregue'],
  ['Em separação', 'Solicitação de reembolso'],
  ['Em separação', 'Cancelado'],
  ['Pronto para retirada', 'Entregue'],
  ['Pronto para retirada', 'Solicitação de reembolso'],
  ['Pronto para retirada', 'Cancelado'],
  ['Entregue', 'Solicitação de reembolso'],
  ['Solicitação de reembolso', 'Reembolsado'],
  ['Solicitação de reembolso', 'Confirmado'],
];

/**
 * Seed modular para os status de pedido e matriz de transições permitidas.
 * Pode receber repositórios do NestJS ou usar o AppDataSource via CLI.
 */
export async function seedStatusPedido(
  statusRepoParam?: Repository<StatusPedido>,
  transicaoRepoParam?: Repository<TransicaoStatus>,
) {
  let statusRepo = statusRepoParam;
  let transicaoRepo = transicaoRepoParam;
  let initializedHere = false;

  if (!statusRepo || !transicaoRepo) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      initializedHere = true;
    }
    statusRepo = statusRepo ?? AppDataSource.getRepository(StatusPedido);
    transicaoRepo = transicaoRepo ?? AppDataSource.getRepository(TransicaoStatus);
  }

  const mapaStatus = new Map<string, StatusPedido>();
  let criados = 0;

  for (const item of STATUS_PADRAO) {
    let status = await statusRepo.findOneBy({ nome: item.nome });
    if (!status) {
      status = statusRepo.create(item);
      status = await statusRepo.save(status);
      criados++;
    } else if (status.statusFinal !== item.statusFinal) {
      status.statusFinal = item.statusFinal;
      status = await statusRepo.save(status);
    }
    mapaStatus.set(item.nome, status);
  }

  let transicoesCriadas = 0;
  for (const [origemNome, destinoNome] of TRANSICOES_PADRAO) {
    const origem = mapaStatus.get(origemNome);
    const destino = mapaStatus.get(destinoNome);
    if (!origem || !destino) continue;

    const existente = await transicaoRepo.findOne({
      where: {
        statusOrigem: { idStatus: origem.idStatus },
        statusDestino: { idStatus: destino.idStatus },
      },
    });

    if (!existente) {
      const novaTransicao = transicaoRepo.create({
        statusOrigem: origem,
        statusDestino: destino,
        permitido: true,
      });
      await transicaoRepo.save(novaTransicao);
      transicoesCriadas++;
    }
  }

  if (criados > 0 || transicoesCriadas > 0) {
    console.log(
      `[Seed] Status de pedido provisionados (${criados} status, ${transicoesCriadas} transições).`,
    );
  } else {
    console.log('[Seed] Status de pedido e transições já cadastrados. Nenhuma ação necessária.');
  }

  if (initializedHere) {
    await AppDataSource.destroy();
  }
}

// Execução direta via CLI (npm run seed:status)
if (require.main === module) {
  seedStatusPedido().catch((err) => {
    console.error('[Seed] Erro ao executar seed de status de pedido:', err);
    process.exit(1);
  });
}
