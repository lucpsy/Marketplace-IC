import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fornecedor } from './entities/fornecedor.entity';
import { ConfiguracaoLoja } from '../pedido/entities/configuracao-loja.entity';
import { StatusPedido } from '../pedido/entities/status_pedido.entity';
import { TransicaoStatus } from '../pedido/entities/transicao-status.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedorService implements OnModuleInit {
  constructor(
    @InjectRepository(Fornecedor)
    private readonly fornecedorRepo: Repository<Fornecedor>,

    @InjectRepository(ConfiguracaoLoja)
    private readonly configRepo: Repository<ConfiguracaoLoja>,

    @InjectRepository(StatusPedido)
    private readonly statusRepo: Repository<StatusPedido>,

    @InjectRepository(TransicaoStatus)
    private readonly transicaoRepo: Repository<TransicaoStatus>,
  ) {}

  async onModuleInit() {
    const existentes = await this.fornecedorRepo.find();
    for (const f of existentes) {
      await this.sincronizarFluxoStatus(f.dadosPagamento);
    }
  }

  private async sincronizarFluxoStatus(dadosPagamento?: string | null) {
    if (!dadosPagamento) return;
    let parsed: any;
    try {
      parsed = JSON.parse(dadosPagamento);
    } catch {
      return;
    }

    const rawFlow: unknown = parsed?.preparationFlow;
    if (!Array.isArray(rawFlow) || rawFlow.length < 2) return;

    const flow = rawFlow
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);
    if (flow.length < 2) return;

    const mapaStatus = new Map<string, StatusPedido>();
    for (let i = 0; i < flow.length; i++) {
      const nome = flow[i];
      let status = await this.statusRepo.findOneBy({ nome });
      if (!status) {
        status = this.statusRepo.create({
          nome,
          descricao: `Etapa de preparo do fornecedor: ${nome}`,
          ordem: 2,
          cor: '#38bdf8',
          statusFinal: false,
          ativo: true,
        });
        status = await this.statusRepo.save(status);
      }
      mapaStatus.set(nome, status);
    }

    const statusReembolso = await this.statusRepo.findOneBy({
      nome: 'Solicitação de reembolso',
    });
    const statusCancelado = await this.statusRepo.findOneBy({
      nome: 'Cancelado',
    });

    const garantirTransicao = async (
      origem: StatusPedido | undefined | null,
      destino: StatusPedido | undefined | null,
    ) => {
      if (!origem || !destino || origem.idStatus === destino.idStatus) return;
      const existente = await this.transicaoRepo.findOne({
        where: {
          statusOrigem: { idStatus: origem.idStatus },
          statusDestino: { idStatus: destino.idStatus },
        },
      });
      if (!existente) {
        await this.transicaoRepo.save(
          this.transicaoRepo.create({
            statusOrigem: origem,
            statusDestino: destino,
            permitido: true,
          }),
        );
      }
    };

    // Garante transições progressivas entre etapas do fluxo do fornecedor
    for (let i = 0; i < flow.length; i++) {
      const origem = mapaStatus.get(flow[i]);
      for (let j = i + 1; j < flow.length; j++) {
        await garantirTransicao(origem, mapaStatus.get(flow[j]));
      }
      if (flow[i] !== 'Aguardando confirmação') {
        await garantirTransicao(origem, statusReembolso);
        if (flow[i] !== 'Entregue') {
          await garantirTransicao(origem, statusCancelado);
        }
      }
    }
  }

  private async garantirPrazoEncerrado() {
    const deadlineCfg = await this.configRepo.findOneBy({
      chave: 'offer_deadline',
    });
    if (deadlineCfg?.valor) {
      const deadlineMs = new Date(deadlineCfg.valor).getTime();
      if (!Number.isNaN(deadlineMs) && Date.now() < deadlineMs) {
        throw new BadRequestException(
          'Alterações em fornecedores só são permitidas após o encerramento do prazo de compras.',
        );
      }
    }
  }

  async create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
    await this.garantirPrazoEncerrado();
    const fornecedor = this.fornecedorRepo.create({
      ...createFornecedorDto,
      status: createFornecedorDto.status ?? 'ativo',
    });
    const salvo = await this.fornecedorRepo.save(fornecedor);
    await this.sincronizarFluxoStatus(salvo.dadosPagamento);
    return salvo;
  }

  async findAll(filtros?: { status?: string; busca?: string }): Promise<Fornecedor[]> {
    const qb = this.fornecedorRepo.createQueryBuilder('fornecedor');

    if (filtros?.status) {
      qb.andWhere('fornecedor.status = :status', { status: filtros.status });
    }

    if (filtros?.busca) {
      qb.andWhere(
        '(LOWER(fornecedor.nomeRazaoSocial) LIKE LOWER(:busca) OR LOWER(fornecedor.nomeFantasia) LIKE LOWER(:busca))',
        { busca: `%${filtros.busca}%` },
      );
    }

    qb.orderBy('fornecedor.nomeFantasia', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({
      where: { idFornecedor: id },
      relations: ['produtos'],
    });

    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor #${id} não encontrado`);
    }

    return fornecedor;
  }

  async update(id: string, updateFornecedorDto: UpdateFornecedorDto): Promise<Fornecedor> {
    await this.garantirPrazoEncerrado();
    const fornecedor = await this.findOne(id);

    if (updateFornecedorDto.dadosPagamento) {
      try {
        const prevMeta = fornecedor.dadosPagamento
          ? JSON.parse(fornecedor.dadosPagamento)
          : {};
        const nextMeta = JSON.parse(updateFornecedorDto.dadosPagamento);

        const prevFlow: string[] = Array.isArray(prevMeta?.preparationFlow)
          ? prevMeta.preparationFlow
          : ['Confirmado', 'Em separação', 'Pronto para retirada', 'Entregue'];
        const nextFlow: string[] | null = Array.isArray(nextMeta?.preparationFlow)
          ? nextMeta.preparationFlow
          : null;

        const prevStage: string | undefined = prevMeta?.currentStage ?? prevFlow[0];
        const nextStage: string | undefined = nextMeta?.currentStage;
        const prevStageIdx = prevStage ? prevFlow.indexOf(prevStage) : 0;

        if (
          nextFlow &&
          prevStageIdx > 0 &&
          JSON.stringify(prevFlow) !== JSON.stringify(nextFlow)
        ) {
          throw new BadRequestException(
            'Não é permitido alterar o fluxo de preparo após o fornecedor já ter avançado do primeiro estágio.',
          );
        }

        if (nextStage && prevStage && nextStage !== prevStage) {
          const deadlineCfg = await this.configRepo.findOneBy({
            chave: 'offer_deadline',
          });
          if (deadlineCfg?.valor) {
            const deadlineMs = new Date(deadlineCfg.valor).getTime();
            if (!Number.isNaN(deadlineMs) && Date.now() < deadlineMs) {
              throw new BadRequestException(
                'A alteração de estágio do fornecedor só é permitida após o encerramento do prazo de compras.',
              );
            }
          }

          const flow: string[] = nextFlow ?? prevFlow;

          const prevIdx = flow.indexOf(prevStage);
          const nextIdx = flow.indexOf(nextStage);
          if (prevIdx >= 0 && nextIdx >= 0 && nextIdx < prevIdx) {
            throw new BadRequestException(
              `Não é permitido retroceder o estágio do fornecedor de "${prevStage}" para "${nextStage}".`,
            );
          }
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
      }
    }

    Object.assign(fornecedor, updateFornecedorDto);
    const salvo = await this.fornecedorRepo.save(fornecedor);
    await this.sincronizarFluxoStatus(salvo.dadosPagamento);
    return salvo;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.garantirPrazoEncerrado();
    const fornecedor = await this.findOne(id);
    fornecedor.status = 'inativo';
    await this.fornecedorRepo.save(fornecedor);
    return { message: `Fornecedor #${id} desativado com sucesso` };
  }
}
