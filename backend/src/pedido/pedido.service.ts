import { randomInt } from 'crypto';
import * as fs from 'fs/promises';
import { basename, extname, join } from 'path';
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
import { ConfiguracaoLoja } from './entities/configuracao-loja.entity';
import { ArquivoUpload } from './entities/arquivo-upload.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { SolicitarReembolsoDto } from './dto/solicitar-reembolso.dto';
import { EfetivarReembolsoDto } from './dto/efetivar-reembolso.dto';
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

    @InjectRepository(ConfiguracaoLoja)
    private readonly configRepo: Repository<ConfiguracaoLoja>,

    @InjectRepository(Pagamento)
    private readonly pagamentoRepo: Repository<Pagamento>,

    @InjectRepository(ArquivoUpload)
    private readonly uploadRepo: Repository<ArquivoUpload>,

    private readonly promocaoService: PromocaoService,
  ) {}

  async onModuleInit() {
    await seedStatusPedido(this.statusRepo, this.transicaoRepo);
    const cfg = await this.configRepo.findOneBy({ chave: 'offer_deadline' });
    if (!cfg) {
      await this.configRepo.save(
        this.configRepo.create({ chave: 'offer_deadline', valor: null }),
      );
    }
  }

  /* -------------------------------------------------------- PRAZO DE COMPRAS */

  async obterPrazoCompras() {
    const cfg = await this.configRepo.findOneBy({ chave: 'offer_deadline' });
    const valor = cfg?.valor ?? null;
    if (!valor) {
      return { offerDeadline: null, aberto: false };
    }
    const ms = new Date(valor).getTime();
    const aberto = !Number.isNaN(ms) && Date.now() < ms;
    return { offerDeadline: valor, aberto };
  }

  async salvarComprovante(params: {
    filename: string;
    nomeOriginal: string | null;
    mimetype: string;
    tamanho: number;
    dados: Buffer;
    usuarioId: string;
  }): Promise<ArquivoUpload> {
    const usuario = await this.usuarioRepo.findOneBy({
      idUsuario: params.usuarioId,
    });

    const registro = this.uploadRepo.create({
      filename: params.filename,
      nomeOriginal: params.nomeOriginal?.slice(0, 255) ?? null,
      mimetype: params.mimetype,
      tamanho: params.tamanho,
      dados: params.dados,
      usuario: usuario ?? null,
    });

    return this.uploadRepo.save(registro);
  }

  async obterComprovanteRepassePublico(
    filename: string,
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    const safeName = basename(filename || '');
    if (
      safeName !== filename ||
      !/^\d+-[0-9a-f-]+\.(png|jpg|jpeg|webp|pdf)$/i.test(safeName)
    ) {
      throw new BadRequestException('Nome de comprovante inválido');
    }

    const repasse = await this.pagamentoRepo
      .createQueryBuilder('pag')
      .where('pag.ativo = true')
      .andWhere("pag.categoria = 'repasse'")
      .andWhere('pag.comprovanteUrl LIKE :suffix', { suffix: `%/${safeName}` })
      .getOne();

    if (!repasse) {
      throw new NotFoundException('Comprovante de repasse não encontrado');
    }

    const upload = await this.uploadRepo
      .createQueryBuilder('upload')
      .addSelect('upload.dados')
      .where('upload.filename = :filename', { filename: safeName })
      .getOne();

    if (upload) {
      return {
        buffer: upload.dados,
        mimeType: upload.mimetype,
      };
    }

    const filePath = join(process.cwd(), 'uploads', 'comprovantes', safeName);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      throw new NotFoundException('Comprovante de repasse não encontrado');
    }

    const ext = extname(safeName).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };

    return {
      buffer,
      mimeType: mimeMap[ext] ?? 'application/octet-stream',
    };
  }

  async obterComprovanteProtegido(
    filename: string,
    usuarioId: string,
    isAdmin: boolean,
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    const safeName = basename(filename || '');
    if (
      safeName !== filename ||
      !/^\d+-[0-9a-f-]+\.(png|jpg|jpeg|webp|pdf)$/i.test(safeName)
    ) {
      throw new BadRequestException('Nome de comprovante inválido');
    }

    const upload = await this.uploadRepo
      .createQueryBuilder('upload')
      .leftJoinAndSelect('upload.usuario', 'usuario')
      .addSelect('upload.dados')
      .where('upload.filename = :filename', { filename: safeName })
      .getOne();

    const possuiVinculoNoPedido = async (): Promise<boolean> => {
      const pagamento = await this.pagamentoRepo
        .createQueryBuilder('pag')
        .innerJoin('pag.pedido', 'ped')
        .innerJoin('ped.usuario', 'usr')
        .where('usr.idUsuario = :usuarioId', { usuarioId })
        .andWhere(
          '(pag.comprovanteUrl LIKE :suffix OR pag.comprovanteReembolsoUrl LIKE :suffix)',
          { suffix: `%/${safeName}` },
        )
        .getOne();
      return Boolean(pagamento);
    };

    if (upload) {
      const ehDonoDoUpload = upload.usuario?.idUsuario === usuarioId;
      if (!isAdmin && !ehDonoDoUpload && !(await possuiVinculoNoPedido())) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar este comprovante',
        );
      }

      return {
        buffer: upload.dados,
        mimeType: upload.mimetype,
      };
    }

    // Fallback legado para comprovantes salvos em disco antes da migration ArquivoUpload
    if (!isAdmin && !(await possuiVinculoNoPedido())) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este comprovante',
      );
    }

    const filePath = join(process.cwd(), 'uploads', 'comprovantes', safeName);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      throw new NotFoundException('Comprovante não encontrado');
    }

    const ext = extname(safeName).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };

    return {
      buffer,
      mimeType: mimeMap[ext] ?? 'application/octet-stream',
    };
  }

  async atualizarPrazoCompras(offerDeadline: string) {
    const parsed = new Date(offerDeadline);
    if (!offerDeadline || Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Data de prazo de compras inválida');
    }

    const registro = this.configRepo.create({
      chave: 'offer_deadline',
      valor: offerDeadline,
    });
    await this.configRepo.save(registro);
    return this.obterPrazoCompras();
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
    const { aberto } = await this.obterPrazoCompras();
    if (!aberto) {
      throw new BadRequestException(
        'O prazo de compras está encerrado. Novos pedidos não podem ser realizados no momento.',
      );
    }

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

    if (!dto.comprovanteUrl || !dto.comprovanteUrl.trim()) {
      throw new BadRequestException(
        "É obrigatório anexar o comprovante de pagamento para finalizar o pedido",
      );
    }

    const statusInicial =
      (await this.statusRepo.findOneBy({ nome: "Aguardando confirmação" })) ??
      (await this.statusRepo.findOneBy({ nome: "Confirmado" }));

    if (!statusInicial) {
      throw new NotFoundException(
        'Status inicial "Aguardando confirmação" não configurado',
      );
    }

    const calculo = await this.promocaoService.calcularDescontos({
      itens: carrinho.itens.map((item) => ({
        produto: item.produto,
        quantidade: item.quantidade,
      })),
      codigoCupom: dto.codigoCupom,
      frete: 0,
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
          pinRetirada: String(randomInt(1000, 10000)),
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

        // Baixa atômica de estoque (proteção contra concorrência / estoque negativo)
        for (const item of carrinho.itens) {
          const qtd = Number(item.quantidade);
          const updateResult = await manager
            .createQueryBuilder()
            .update(Produto)
            .set({ estoque: () => 'estoque - :qtd' })
            .where('id_produto = :idProduto', {
              idProduto: item.produto.idProduto,
            })
            .andWhere("status = 'ativo'")
            .andWhere('estoque >= :qtd', { qtd })
            .execute();

          if (!updateResult.affected) {
            throw new BadRequestException(
              `Estoque insuficiente para "${item.produto.nome}".`,
            );
          }
        }

        // Histórico inicial
        const historicoInicial = manager.create(HistoricoStatus, {
          pedido: pedidoSalvo,
          status: statusInicial,
          usuarioResponsavel: carrinho.usuario,
          observacao: `Comprovante enviado — aguardando confirmação do administrador${resumoPromos}`,
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
        comprovanteUrl: dto.comprovanteUrl.trim(),
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
        "usuario",
        "status",
        "itens",
        "itens.produto",
        "itens.produto.imagens",
        "itens.produto.fornecedor",
        "pagamentos",
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

    if (statusDestino.nome === 'Entregue' && pedido.pinRetirada) {
      const pinInformado = dto.pinRetirada?.trim();
      if (!pinInformado || pinInformado !== pedido.pinRetirada) {
        throw new BadRequestException(
          'Informe o PIN de retirada válido para marcar o pedido como Entregue.',
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

  /* ------------------------------------------------ CONFIRMAÇÃO & REEMBOLSO */

  async confirmarPagamento(idPedido: string, adminId: string): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: { idPedido },
      relations: ['status', 'pagamentos'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${idPedido} não encontrado`);
    }

    if (pedido.status?.nome !== 'Aguardando confirmação') {
      throw new BadRequestException(
        `O pedido #${idPedido} não está aguardando confirmação (status atual: "${pedido.status?.nome ?? 'desconhecido'}")`,
      );
    }

    const statusConfirmado = await this.statusRepo.findOneBy({
      nome: 'Confirmado',
    });
    if (!statusConfirmado) {
      throw new NotFoundException('Status "Confirmado" não configurado');
    }

    const admin = await this.usuarioRepo.findOneBy({ idUsuario: adminId });

    await this.dataSource.transaction(async (manager) => {
      pedido.status = statusConfirmado;
      await manager.save(Pedido, pedido);

      await manager
        .createQueryBuilder()
        .update(Pagamento)
        .set({
          status: 'concluido',
          dataPagamento: new Date(),
          validadorNome: admin?.nome ?? 'Administrador',
          validadorCargo: 'Administração DIACOM',
        })
        .where('id_pedido = :idPedido', { idPedido: pedido.idPedido })
        .andWhere("tipo = 'entrada'")
        .execute();

      const historico = manager.create(HistoricoStatus, {
        pedido,
        status: statusConfirmado,
        usuarioResponsavel: admin ?? null,
        observacao: 'Comprovante validado e pagamento confirmado pelo administrador',
      });
      await manager.save(HistoricoStatus, historico);
    });

    return this.findOne(idPedido, adminId, true);
  }

  async solicitarReembolso(
    idPedido: string,
    usuarioId: string,
    isAdmin: boolean,
    dto: SolicitarReembolsoDto,
  ): Promise<Pedido> {
    const pedido = await this.pedidoRepo.findOne({
      where: { idPedido },
      relations: ['usuario', 'status', 'pagamentos'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${idPedido} não encontrado`);
    }

    if (!isAdmin && pedido.usuario.idUsuario !== usuarioId) {
      throw new ForbiddenException(
        'Você não tem permissão para solicitar reembolso deste pedido',
      );
    }

    const statusBloqueados = new Set([
      'Aguardando confirmação',
      'Solicitação de reembolso',
      'Reembolsado',
      'Cancelado',
    ]);
    if (!pedido.status || statusBloqueados.has(pedido.status.nome)) {
      throw new BadRequestException(
        `Não é possível solicitar reembolso para pedido no status "${pedido.status?.nome ?? 'desconhecido'}"`,
      );
    }

    const temPagamentoConfirmado = (pedido.pagamentos ?? []).some(
      (p) => p.ativo && p.tipo === 'entrada' && p.status === 'concluido',
    );
    if (!temPagamentoConfirmado) {
      throw new BadRequestException(
        'Não é possível solicitar reembolso: este pedido não possui pagamento confirmado.',
      );
    }

    const statusSolicitacao = await this.statusRepo.findOneBy({
      nome: 'Solicitação de reembolso',
    });
    if (!statusSolicitacao) {
      throw new NotFoundException(
        'Status "Solicitação de reembolso" não configurado',
      );
    }

    const responsavel = await this.usuarioRepo.findOneBy({
      idUsuario: usuarioId,
    });

    const detalhes = [
      dto.motivo?.trim() ? `Motivo: ${dto.motivo.trim()}` : null,
      dto.chavePix?.trim() ? `Chave Pix: ${dto.chavePix.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    await this.dataSource.transaction(async (manager) => {
      pedido.status = statusSolicitacao;
      await manager.save(Pedido, pedido);

      if (detalhes) {
        await manager
          .createQueryBuilder()
          .update(Pagamento)
          .set({ motivoReembolso: detalhes })
          .where('id_pedido = :idPedido', { idPedido: pedido.idPedido })
          .andWhere("tipo = 'entrada'")
          .execute();
      }

      const historico = manager.create(HistoricoStatus, {
        pedido,
        status: statusSolicitacao,
        usuarioResponsavel: responsavel ?? null,
        observacao: detalhes || 'Solicitação de reembolso aberta pelo comprador',
      });
      await manager.save(HistoricoStatus, historico);
    });

    return this.findOne(idPedido, usuarioId, true);
  }

  async efetivarReembolso(
    idPedido: string,
    adminId: string,
    dto: EfetivarReembolsoDto,
  ): Promise<Pedido> {
    if (!dto.comprovanteReembolsoUrl || !dto.comprovanteReembolsoUrl.trim()) {
      throw new BadRequestException(
        'É obrigatório anexar o comprovante de reembolso',
      );
    }

    const pedido = await this.pedidoRepo.findOne({
      where: { idPedido },
      relations: ['status', 'itens', 'itens.produto', 'pagamentos'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${idPedido} não encontrado`);
    }

    if (pedido.status?.nome !== 'Solicitação de reembolso') {
      throw new BadRequestException(
        `O pedido #${idPedido} não possui solicitação de reembolso pendente (status atual: "${pedido.status?.nome ?? 'desconhecido'}")`,
      );
    }

    const statusReembolsado = await this.statusRepo.findOneBy({
      nome: 'Reembolsado',
    });
    if (!statusReembolsado) {
      throw new NotFoundException('Status "Reembolsado" não configurado');
    }

    const admin = await this.usuarioRepo.findOneBy({ idUsuario: adminId });

    await this.dataSource.transaction(async (manager) => {
      pedido.status = statusReembolsado;
      await manager.save(Pedido, pedido);

      // Restaura estoque dos produtos do pedido reembolsado
      for (const item of pedido.itens ?? []) {
        await manager.increment(
          Produto,
          { idProduto: item.produto.idProduto },
          'estoque',
          item.quantidade,
        );
      }

      // Atualiza o pagamento original com os metadados de reembolso
      await manager
        .createQueryBuilder()
        .update(Pagamento)
        .set({
          comprovanteReembolsoUrl: dto.comprovanteReembolsoUrl.trim(),
          dataReembolso: new Date(),
        })
        .where('id_pedido = :idPedido', { idPedido: pedido.idPedido })
        .andWhere("tipo = 'entrada'")
        .execute();

      // Registra saída de reembolso na tabela de pagamentos para constar na Transparência
      const pagamentoOriginal = (pedido.pagamentos ?? []).find(
        (p) => p.tipo === 'entrada',
      );
      const lancamentoReembolso = manager.create(Pagamento, {
        pedido,
        tipo: 'saida',
        categoria: 'estorno',
        valor: pedido.valorTotal,
        metodo: pagamentoOriginal?.metodo ?? 'pix',
        status: 'concluido',
        dataPagamento: new Date(),
        descricao: `Reembolso — Pedido #${pedido.idPedido}${dto.observacao?.trim() ? ` (${dto.observacao.trim()})` : ''}`,
        comprovanteReembolsoUrl: dto.comprovanteReembolsoUrl.trim(),
        dataReembolso: new Date(),
        validadorNome: admin?.nome ?? 'Administrador',
        validadorCargo: 'Administração DIACOM',
        ativo: true,
      });
      await manager.save(Pagamento, lancamentoReembolso);

      const historico = manager.create(HistoricoStatus, {
        pedido,
        status: statusReembolsado,
        usuarioResponsavel: admin ?? null,
        observacao:
          dto.observacao?.trim() ||
          'Reembolso efetivado com comprovante anexado pelo administrador',
      });
      await manager.save(HistoricoStatus, historico);
    });

    return this.findOne(idPedido, adminId, true);
  }
}
