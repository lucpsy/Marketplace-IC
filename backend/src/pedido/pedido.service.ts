import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item_pedido.entity';
import { StatusPedido } from './entities/status_pedido.entity';
import { TransicaoStatus } from './entities/transicao-status.entity';
import { HistoricoStatus } from './entities/historico-status.entity';
import { Carrinho } from '../carrinho/entities/carrinho.entity';
import { CarrinhoItem } from '../carrinho/entities/carrinho-item.entity';
import { Produto } from '../catalogo/entities/produto.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Pagamento } from '../pagamento/entities/pagamento.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { seedStatusPedido } from '../database/seeds/seed-status-pedido';
import { PromocaoService } from '../promo/promo.service';

@Injectable()
export class PedidoService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,

    @InjectRepository(StatusPedido)
    private readonly statusRepo: Repository<StatusPedido>,

    @InjectRepository(TransicaoStatus)
    private readonly transicaoRepo: Repository<TransicaoStatus>,

    @InjectRepository(Carrinho)
    private readonly carrinhoRepo: Repository<Carrinho>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    private readonly promocaoService: PromocaoService,
  ) {}

  async onModuleInit() {
    await seedStatusPedido(this.statusRepo, this.transicaoRepo);
  }

  /* -------------------------------------------------------- STATUS */

  async listarStatus(): Promise<StatusPedido[]> {
    return this.statusRepo.find({
      where: { ativo: true },
      order: { ordem: "ASC" },
    });
  }

  async listarTransicoesPermitidas(idStatus: string): Promise<StatusPedido[]> {
    const transicoes = await this.transicaoRepo.find({
      where: {
        statusOrigem: { idStatus },
        permitido: true,
      },
      relations: ["statusDestino"],
    });

    return transicoes
      .map((t) => t.statusDestino)
      .filter((s) => s.ativo)
      .sort((a, b) => a.ordem - b.ordem);
  }

  /* -------------------------------------------------------- FECHAMENTO */

  async criarDoCarrinho(usuarioId: string, dto: CreatePedidoDto) {
    const carrinho = await this.carrinhoRepo.findOne({
      where: { usuario: { idUsuario: usuarioId } },
      relations: ["usuario", "itens", "itens.produto"],
    });

    if (!carrinho || !carrinho.itens || carrinho.itens.length === 0) {
      throw new BadRequestException(
        "Não é possível finalizar o pedido: o carrinho está vazio",
      );
    }

    for (const item of carrinho.itens) {
      if (!item.produto || item.produto.status !== "ativo") {
        throw new BadRequestException(
          `Produto "${item.produto?.nome ?? item.idCarrinhoItem}" não está mais disponível`,
        );
      }
      if (item.quantidade > item.produto.estoque) {
        throw new BadRequestException(
          `Estoque insuficiente para "${item.produto.nome}". Disponível: ${item.produto.estoque}`,
        );
      }
    }

    const statusInicial = await this.statusRepo.findOneBy({
      nome: "Confirmado",
    });

    if (!statusInicial) {
      throw new NotFoundException(
        'Status inicial "Confirmado" não configurado',
      );
    }

    const calculo = await this.promocaoService.calcularDescontos({
      itens: carrinho.itens.map((item) => ({
        produto: item.produto,
        quantidade: item.quantidade,
      })),
      codigoCupom: dto.codigoCupom,
      frete: dto.frete ?? 0,
    });

    const subtotal = calculo.subtotalBruto;
    const valorDesconto = calculo.descontoTotal;
    const frete = calculo.freteFinal;
    const valorTotal = calculo.valorTotal;

    const resumoPromos =
      calculo.promocoesAplicadas.length > 0
        ? ` (promoções aplicadas: ${calculo.promocoesAplicadas
            .map((p) => (p.codigo ? `${p.titulo} [${p.codigo}]` : p.titulo))
            .join(", ")})`
        : "";

    const idPedidoCriado = await this.dataSource.transaction(
      async (manager) => {
        const pedido = manager.create(Pedido, {
          usuario: carrinho.usuario,
          status: statusInicial,
          subtotal: subtotal.toFixed(2),
          valorDesconto: valorDesconto.toFixed(2),
          frete: frete.toFixed(2),
          valorTotal: valorTotal.toFixed(2),
          observacao: dto.observacao ?? null,
        });

        const pedidoSalvo = await manager.save(Pedido, pedido);

        const itensPedido = carrinho.itens.map((item, idx) => {
          const calcItem = calculo.itens[idx];
          const precoUnit =
            calcItem?.precoUnitario ?? Number(item.produto.precoVenda);
          const descontoItem = calcItem?.descontoTotalItem ?? 0;
          const totalItem =
            calcItem?.valorTotalItem ??
            Math.max(0, precoUnit * item.quantidade - descontoItem);

          return manager.create(ItemPedido, {
            pedido: pedidoSalvo,
            produto: item.produto,
            nomeProdutoSnapshot: item.produto.nome,
            skuSnapshot: item.produto.sku ?? null,
            quantidade: item.quantidade,
            precoUnitarioSnapshot: precoUnit.toFixed(2),
            desconto: descontoItem.toFixed(2),
            valorTotal: totalItem.toFixed(2),
          });
        });

        await manager.save(ItemPedido, itensPedido);

        // Baixa de estoque dos produtos comprados
        for (const item of carrinho.itens) {
          await manager.decrement(
            Produto,
            { idProduto: item.produto.idProduto },
            "estoque",
            item.quantidade,
          );
        }

        // Histórico inicial
        const historicoInicial = manager.create(HistoricoStatus, {
          pedido: pedidoSalvo,
          status: statusInicial,
          usuarioResponsavel: carrinho.usuario,
          observacao: `Pedido confirmado a partir do carrinho${resumoPromos}`,
        });
        await manager.save(HistoricoStatus, historicoInicial);

      // Lançamento financeiro inicial vinculado ao pedido
      const pagamentoInicial = manager.create(Pagamento, {
        pedido: pedidoSalvo,
        tipo: 'entrada',
        categoria: 'venda',
        valor: valorTotal.toFixed(2),
        metodo: dto.metodoPagamento ?? 'pix',
        status: 'pendente',
        descricao: `Venda — Pedido #${pedidoSalvo.idPedido}`,
        ativo: true,
      });
      await manager.save(Pagamento, pagamentoInicial);

      // Esvazia o carrinho do usuário
      await manager.delete(CarrinhoItem, {
        carrinho: { idCarrinho: carrinho.idCarrinho },
      });

        return pedidoSalvo.idPedido;
      },
    );

    return this.findOne(idPedidoCriado, usuarioId, true);
  }

  /* -------------------------------------------------------- CONSULTAS */

  async findMeusPedidos(usuarioId: string): Promise<Pedido[]> {
    return this.pedidoRepo.find({
      where: { usuario: { idUsuario: usuarioId } },
      relations: [
        "status",
        "itens",
        "itens.produto",
        "itens.produto.imagens",
        "itens.produto.fornecedor",
        "historicoStatus",
        "historicoStatus.status",
      ],
      order: {
        dataPedido: "DESC",
        historicoStatus: {
          dataHora: "ASC",
        },
      },
    });
  }

  async findAll(filtros?: {
    statusId?: string;
    usuarioId?: string;
  }): Promise<Pedido[]> {
    const qb = this.pedidoRepo
      .createQueryBuilder("pedido")
      .leftJoinAndSelect("pedido.usuario", "usuario")
      .leftJoinAndSelect("pedido.status", "status")
      .leftJoinAndSelect("pedido.itens", "itens")
      .leftJoinAndSelect("itens.produto", "produto")
      .leftJoinAndSelect("produto.fornecedor", "fornecedor")
      .leftJoinAndSelect("pedido.pagamentos", "pagamentos")
      .leftJoinAndSelect("pedido.historicoStatus", "historico")
      .leftJoinAndSelect("historico.status", "historicoStatus")
      .orderBy("pedido.dataPedido", "DESC")
      .addOrderBy("historico.dataHora", "ASC");

    if (filtros?.statusId) {
      qb.andWhere("status.idStatus = :statusId", {
        statusId: filtros.statusId,
      });
    }

    if (filtros?.usuarioId) {
      qb.andWhere("usuario.idUsuario = :usuarioId", {
        usuarioId: filtros.usuarioId,
      });
    }

    return qb.getMany();
  }

  async findOne(
    idPedido: string,
    usuarioId: string,
    isAdmin: boolean,
  ): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: { idPedido },
      relations: [
        'usuario',
        'status',
        'itens',
        'itens.produto',
        'itens.produto.imagens',
        'itens.produto.fornecedor',
        'historicoStatus',
        'historicoStatus.status',
        'historicoStatus.usuarioResponsavel',
        'pagamentos',
      ],
      order: {
        historicoStatus: {
          dataHora: "ASC",
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${idPedido} não encontrado`);
    }

    if (!isAdmin && pedido.usuario.idUsuario !== usuarioId) {
      throw new ForbiddenException(
        "Você não tem permissão para acessar este pedido",
      );
    }

    return pedido;
  }

  /* -------------------------------------------------------- TRANSIÇÃO DE STATUS */

  async atualizarStatus(
    idPedido: string,
    dto: UpdateStatusPedidoDto,
    responsavelId: string,
  ): Promise<Pedido> {
    if (!dto.idStatus && !dto.nomeStatus) {
      throw new BadRequestException(
        "Informe idStatus ou nomeStatus para atualizar o status do pedido",
      );
    }

    const pedido = await this.pedidoRepo.findOne({
      where: { idPedido },
      relations: ["status", "itens", "itens.produto"],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${idPedido} não encontrado`);
    }

    if (pedido.status?.statusFinal) {
      throw new BadRequestException(
        `O pedido #${idPedido} já está no status final "${pedido.status.nome}" e não pode ser alterado`,
      );
    }

    const statusDestino = dto.idStatus
      ? await this.statusRepo.findOneBy({ idStatus: dto.idStatus })
      : await this.statusRepo.findOneBy({ nome: dto.nomeStatus });

    if (!statusDestino || !statusDestino.ativo) {
      throw new NotFoundException(
        "Status de destino não encontrado ou inativo",
      );
    }

    if (pedido.status) {
      if (pedido.status.idStatus === statusDestino.idStatus) {
        throw new BadRequestException(
          `O pedido já se encontra no status "${statusDestino.nome}"`,
        );
      }

      const transicao = await this.transicaoRepo.findOne({
        where: {
          statusOrigem: { idStatus: pedido.status.idStatus },
          statusDestino: { idStatus: statusDestino.idStatus },
          permitido: true,
        },
      });

      if (!transicao) {
        throw new BadRequestException(
          `Transição de "${pedido.status.nome}" para "${statusDestino.nome}" não é permitida`,
        );
      }
    }

    const responsavel = await this.usuarioRepo.findOneBy({
      idUsuario: responsavelId,
    });

    await this.dataSource.transaction(async (manager) => {
      pedido.status = statusDestino;
      await manager.save(Pedido, pedido);

      // Se o pedido foi cancelado, estorna o estoque dos produtos e cancela pagamentos pendentes
      if (statusDestino.nome === 'Cancelado') {
        for (const item of pedido.itens) {
          await manager.increment(
            Produto,
            { idProduto: item.produto.idProduto },
            "estoque",
            item.quantidade,
          );
        }

        await manager
          .createQueryBuilder()
          .update(Pagamento)
          .set({ status: 'cancelado' })
          .where('id_pedido = :idPedido', { idPedido: pedido.idPedido })
          .andWhere("status IN ('pendente', 'processando')")
          .execute();
      }

      const registroHistorico = manager.create(HistoricoStatus, {
        pedido,
        status: statusDestino,
        usuarioResponsavel: responsavel ?? null,
        observacao:
          dto.observacao ?? `Status alterado para "${statusDestino.nome}"`,
      });

      await manager.save(HistoricoStatus, registroHistorico);
    });

    return this.findOne(idPedido, responsavelId, true);
  }
}
