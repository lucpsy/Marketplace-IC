import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagamento } from './entities/pagamento.entity';
import { Pedido } from '../pedido/entities/pedido.entity';
import { ItemPedido } from '../pedido/entities/item_pedido.entity';
import {
  CategoriaFinanceira,
  CreatePagamentoDto,
  TipoLancamento,
} from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { CreateRepasseDto } from './dto/create-repasse.dto';
import { UpdateStatusPagamentoDto } from './dto/update-status-pagamento.dto';

export type PeriodoFiltro = '7d' | '30d' | '90d' | 'tudo';

export interface FiltroPeriodo {
  periodo?: PeriodoFiltro;
  dataInicio?: string;
  dataFim?: string;
}

export interface FiltroLancamentos extends FiltroPeriodo {
  tipo?: string;
  categoria?: string;
  metodo?: string;
  status?: string;
  idPedido?: string;
  busca?: string;
  pagina?: number;
  limite?: number;
  incluirInativos?: boolean;
}

@Injectable()
export class PagamentoService {
  constructor(
    @InjectRepository(Pagamento)
    private readonly pagamentoRepo: Repository<Pagamento>,

    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,

    @InjectRepository(ItemPedido)
    private readonly itemPedidoRepo: Repository<ItemPedido>,
  ) {}

  private round2(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  private inferirTipoPorCategoria(categoria: CategoriaFinanceira): TipoLancamento {
    if (categoria === 'venda') return 'entrada';
    return 'saida';
  }

  private parseData(valor: string, fimDoDia = false): Date {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(valor.trim());
    const data = isDateOnly
      ? new Date(`${valor.trim()}T${fimDoDia ? '23:59:59.999' : '00:00:00.000'}Z`)
      : new Date(valor);

    if (Number.isNaN(data.getTime())) {
      throw new BadRequestException(`Data inválida: "${valor}"`);
    }
    return data;
  }

  private resolverIntervalo(filtros?: FiltroPeriodo): {
    inicio: Date | null;
    fim: Date | null;
    periodo: PeriodoFiltro;
  } {
    const periodo = filtros?.periodo ?? 'tudo';

    if (filtros?.dataInicio || filtros?.dataFim) {
      const inicio = filtros.dataInicio
        ? this.parseData(filtros.dataInicio, false)
        : null;
      const fim = filtros.dataFim
        ? this.parseData(filtros.dataFim, true)
        : null;

      if (inicio && fim && fim < inicio) {
        throw new BadRequestException('dataFim deve ser posterior ou igual a dataInicio');
      }

      return { inicio, fim, periodo };
    }

    if (periodo === '7d' || periodo === '30d' || periodo === '90d') {
      const dias = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90;
      const fim = new Date();
      const inicio = new Date(fim.getTime() - dias * 24 * 60 * 60 * 1000);
      return { inicio, fim, periodo };
    }

    return { inicio: null, fim: null, periodo: 'tudo' };
  }

  private async validarReferenciaUnica(referencia: string, ignorarId?: string) {
    const existente = await this.pagamentoRepo.findOneBy({
      referenciaGateway: referencia,
    });
    if (existente && existente.idPagamento !== ignorarId) {
      throw new ConflictException(
        `Já existe um lançamento com a referência "${referencia}"`,
      );
    }
  }

  private formatarLancamentoPublico(p: Pagamento) {
    const valorNum = this.round2(Number(p.valor));
    const valorAssinado = p.tipo === 'saida' ? -valorNum : valorNum;
    const dataEfetiva = p.dataPagamento ?? p.dataCriacao;

    return {
      idPagamento: p.idPagamento,
      idPedido: p.pedido?.idPedido ?? null,
      data: dataEfetiva,
      dataCriacao: p.dataCriacao,
      dataPagamento: p.dataPagamento,
      tipo: p.tipo,
      categoria: p.categoria,
      metodo: p.metodo,
      status: p.status,
      valor: valorNum,
      valorAssinado,
      descricao: p.descricao,
      validadorNome: p.validadorNome,
      validadorCargo: p.validadorCargo,
      comprovanteUrl: p.comprovanteUrl ?? null,
      comprovanteReembolsoUrl: p.comprovanteReembolsoUrl ?? null,
    };
  }

  /* -------------------------------------------------------- TRANSPARÊNCIA PÚBLICA */

  async obterResumoTransparencia(filtros?: FiltroPeriodo) {
    const { inicio, fim, periodo } = this.resolverIntervalo(filtros);

    // 1. Agregação principal de caixa (Entradas, Saídas, Saldo, Lucro) no PostgreSQL
    const resumoQb = this.pagamentoRepo
      .createQueryBuilder('p')
      .select(
        `COALESCE(SUM(CASE WHEN p.tipo = 'entrada' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'entradas',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'entrada' AND p.status IN ('pendente', 'processando') THEN p.valor ELSE 0 END), 0)`,
        'entradasPendentes',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'entrada' AND p.categoria = 'venda' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'receitaVendas',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'saidas',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' AND p.categoria = 'custo' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'custos',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' AND p.categoria = 'taxa' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'taxas',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' AND p.categoria = 'repasse' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'repasses',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' AND p.categoria = 'estorno' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'saidasEstorno',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'entrada' AND p.status = 'estornado' THEN p.valor ELSE 0 END), 0)`,
        'entradasEstornadas',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' AND p.categoria = 'outro' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'outros',
      )
      .addSelect(
        `COUNT(DISTINCT p.id_pedido) FILTER (WHERE p.id_pedido IS NOT NULL AND p.status <> 'cancelado')`,
        'totalPedidos',
      )
      .addSelect('COUNT(*)', 'totalLancamentos')
      .where('p.ativo = true');

    // 2. Agregação por categoria no PostgreSQL
    const categoriaQb = this.pagamentoRepo
      .createQueryBuilder('p')
      .select('p.categoria', 'categoria')
      .addSelect('p.tipo', 'tipo')
      .addSelect('COUNT(*)::int', 'quantidade')
      .addSelect('COALESCE(SUM(p.valor), 0)', 'total')
      .where('p.ativo = true')
      .andWhere("p.status = 'concluido'")
      .groupBy('p.categoria')
      .addGroupBy('p.tipo')
      .orderBy('total', 'DESC');

    // 3. Agregação por método de pagamento no PostgreSQL
    const metodoQb = this.pagamentoRepo
      .createQueryBuilder('p')
      .select('p.metodo', 'metodo')
      .addSelect('COUNT(*)::int', 'quantidade')
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'entrada' THEN p.valor ELSE 0 END), 0)`,
        'total_entradas',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' THEN p.valor ELSE 0 END), 0)`,
        'total_saidas',
      )
      .where('p.ativo = true')
      .andWhere("p.status = 'concluido'")
      .groupBy('p.metodo')
      .orderBy('total_entradas', 'DESC');

    // 4. Agregação de CMV (Custo dos Produtos Vendidos) no PostgreSQL
    const cmvQb = this.itemPedidoRepo
      .createQueryBuilder('item')
      .innerJoin('item.pedido', 'ped')
      .innerJoin('item.produto', 'prod')
      .leftJoin('ped.status', 'st')
      .select('COALESCE(SUM(item.quantidade * prod.preco_custo), 0)', 'custoProdutosVendidos')
      .addSelect('COALESCE(SUM(item.valor_total), 0)', 'receitaItensPedidos')
      .addSelect('COALESCE(SUM(item.quantidade), 0)::int', 'itensVendidos')
      .where("COALESCE(st.nome, '') <> 'Cancelado'");

    if (inicio) {
      resumoQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) >= :inicio', { inicio });
      categoriaQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) >= :inicio', { inicio });
      metodoQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) >= :inicio', { inicio });
      cmvQb.andWhere('ped.data_pedido >= :inicio', { inicio });
    }

    if (fim) {
      resumoQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) <= :fim', { fim });
      categoriaQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) <= :fim', { fim });
      metodoQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) <= :fim', { fim });
      cmvQb.andWhere('ped.data_pedido <= :fim', { fim });
    }

    const [resumoRaw, porCategoriaRaw, porMetodoRaw, cmvRaw] = await Promise.all([
      resumoQb.getRawOne(),
      categoriaQb.getRawMany(),
      metodoQb.getRawMany(),
      cmvQb.getRawOne(),
    ]);

    const entradas = this.round2(Number(resumoRaw?.entradas ?? 0));
    const entradasPendentes = this.round2(Number(resumoRaw?.entradasPendentes ?? 0));
    const receitaVendas = this.round2(Number(resumoRaw?.receitaVendas ?? 0));
    const saidas = this.round2(Number(resumoRaw?.saidas ?? 0));
    const custos = this.round2(Number(resumoRaw?.custos ?? 0));
    const taxas = this.round2(Number(resumoRaw?.taxas ?? 0));
    const repasses = this.round2(Number(resumoRaw?.repasses ?? 0));
    const saidasEstorno = this.round2(Number(resumoRaw?.saidasEstorno ?? 0));
    const entradasEstornadas = this.round2(Number(resumoRaw?.entradasEstornadas ?? 0));
    const outros = this.round2(Number(resumoRaw?.outros ?? 0));

    const saldo = this.round2(entradas - saidas);
    const lucro = this.round2(entradas - custos - taxas - saidasEstorno);
    const margemLucroPercentual =
      entradas > 0 ? this.round2((lucro / entradas) * 100) : 0;

    const custoProdutosVendidos = this.round2(Number(cmvRaw?.custoProdutosVendidos ?? 0));
    const receitaItensPedidos = this.round2(Number(cmvRaw?.receitaItensPedidos ?? 0));
    const lucroBrutoProdutos = this.round2(receitaItensPedidos - custoProdutosVendidos);

    return {
      periodo: {
        filtro: periodo,
        dataInicio: inicio ? inicio.toISOString() : null,
        dataFim: fim ? fim.toISOString() : null,
      },
      entradas,
      entradasPendentes,
      receitaVendas,
      saidas,
      saldo,
      lucro,
      margemLucroPercentual,
      detalhamentoSaidas: {
        custos,
        taxas,
        repasses,
        estornos: saidasEstorno,
        outros,
      },
      totalEstornado: this.round2(saidasEstorno + entradasEstornadas),
      custoProdutosVendidos,
      lucroBrutoProdutos,
      itensVendidos: Number(cmvRaw?.itensVendidos ?? 0),
      totalPedidos: Number(resumoRaw?.totalPedidos ?? 0),
      totalLancamentos: Number(resumoRaw?.totalLancamentos ?? 0),
      porCategoria: porCategoriaRaw.map((row) => ({
        categoria: row.categoria,
        tipo: row.tipo,
        quantidade: Number(row.quantidade),
        total: this.round2(Number(row.total)),
      })),
      porMetodo: porMetodoRaw.map((row) => ({
        metodo: row.metodo,
        quantidade: Number(row.quantidade),
        totalEntradas: this.round2(Number(row.total_entradas)),
        totalSaidas: this.round2(Number(row.total_saidas)),
      })),
    };
  }

  async listarLancamentosPublicos(filtros?: FiltroLancamentos) {
    const { inicio, fim } = this.resolverIntervalo(filtros);
    const pagina = Math.max(1, Number(filtros?.pagina ?? 1) || 1);
    const limite = Math.min(200, Math.max(1, Number(filtros?.limite ?? 50) || 50));

    const qb = this.pagamentoRepo
      .createQueryBuilder('p')
      .leftJoin('p.pedido', 'pedido')
      .addSelect(['pedido.idPedido'])
      .where('p.ativo = true');

    if (filtros?.tipo) {
      qb.andWhere('p.tipo = :tipo', { tipo: filtros.tipo });
    }
    if (filtros?.categoria) {
      qb.andWhere('p.categoria = :categoria', { categoria: filtros.categoria });
    }
    if (filtros?.metodo) {
      qb.andWhere('p.metodo = :metodo', { metodo: filtros.metodo });
    }
    if (filtros?.status) {
      qb.andWhere('p.status = :status', { status: filtros.status });
    }
    if (filtros?.busca) {
      qb.andWhere(
        `(LOWER(COALESCE(p.descricao, '')) LIKE LOWER(:busca) OR LOWER(COALESCE(p.validador_nome, '')) LIKE LOWER(:busca) OR CAST(COALESCE(pedido.id_pedido, 0) AS TEXT) LIKE :busca)`,
        { busca: `%${filtros.busca}%` },
      );
    }
    if (inicio) {
      qb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) >= :inicio', { inicio });
    }
    if (fim) {
      qb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) <= :fim', { fim });
    }

    const total = await qb.getCount();
    const registros = await qb
      .orderBy('COALESCE(p.data_pagamento, p.data_criacao)', 'DESC')
      .addOrderBy('p.idPagamento', 'DESC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getMany();

    return {
      dados: registros.map((p) => this.formatarLancamentoPublico(p)),
      paginacao: {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  async obterEvolucaoFinanceira(
    filtros?: FiltroPeriodo & { agrupamento?: 'dia' | 'mes' },
  ) {
    const { inicio, fim, periodo } = this.resolverIntervalo(filtros);
    const agrupamento = filtros?.agrupamento === 'mes' ? 'mes' : 'dia';
    const formatoSql = agrupamento === 'mes' ? "'YYYY-MM'" : "'YYYY-MM-DD'";

    const periodoExpr = `TO_CHAR(COALESCE(p.data_pagamento, p.data_criacao), ${formatoSql})`;

    const qb = this.pagamentoRepo
      .createQueryBuilder('p')
      .select(periodoExpr, 'periodo')
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'entrada' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'entradas',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'saidas',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.tipo = 'saida' AND p.categoria IN ('custo', 'taxa', 'estorno') AND p.status = 'concluido' THEN p.valor ELSE 0 END), 0)`,
        'custos_operacionais',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE p.status = 'concluido')::int`,
        'quantidade',
      )
      .where('p.ativo = true')
      .groupBy(periodoExpr)
      .orderBy('periodo', 'ASC');

    if (inicio) {
      qb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) >= :inicio', { inicio });
    }
    if (fim) {
      qb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) <= :fim', { fim });
    }

    const rows = await qb.getRawMany();

    let saldoAcumulado = 0;
    const serie = rows.map((row) => {
      const entradas = this.round2(Number(row.entradas));
      const saidas = this.round2(Number(row.saidas));
      const custosOperacionais = this.round2(Number(row.custos_operacionais));
      const saldoPeriodo = this.round2(entradas - saidas);
      const lucroPeriodo = this.round2(entradas - custosOperacionais);
      saldoAcumulado = this.round2(saldoAcumulado + saldoPeriodo);

      return {
        periodo: row.periodo,
        entradas,
        saidas,
        saldoPeriodo,
        saldoAcumulado,
        lucroPeriodo,
        quantidade: Number(row.quantidade),
      };
    });

    return {
      filtro: periodo,
      agrupamento,
      serie,
    };
  }

  /* -------------------------------------------------------- PAINEL ADMIN */

  async obterPainelAdmin(filtros?: FiltroPeriodo) {
    const { inicio, fim } = this.resolverIntervalo(filtros);

    const dataDiaExpr = `TO_CHAR(COALESCE(p.data_pagamento, p.data_criacao), 'YYYY-MM-DD')`;

    const arrecadacaoDiaQb = this.pagamentoRepo
      .createQueryBuilder('p')
      .select(dataDiaExpr, 'data')
      .addSelect('COALESCE(SUM(p.valor), 0)', 'valor')
      .addSelect('COUNT(DISTINCT p.id_pedido)::int', 'pedidos')
      .where('p.ativo = true')
      .andWhere("p.tipo = 'entrada'")
      .andWhere("p.categoria = 'venda'")
      .andWhere("p.status = 'concluido'")
      .groupBy(dataDiaExpr)
      .orderBy('data', 'ASC');

    const topProdutosQb = this.itemPedidoRepo
      .createQueryBuilder('item')
      .innerJoin('item.pedido', 'ped')
      .innerJoin('item.produto', 'prod')
      .leftJoin('ped.status', 'st')
      .select('prod.id_produto', 'id_produto')
      .addSelect('item.nome_produto_snapshot', 'nome')
      .addSelect('COALESCE(SUM(item.quantidade), 0)::int', 'quantidade_vendida')
      .addSelect('COALESCE(SUM(item.valor_total), 0)', 'receita')
      .addSelect('COALESCE(SUM(item.quantidade * prod.preco_custo), 0)', 'custo')
      .where("COALESCE(st.nome, '') <> 'Cancelado'")
      .groupBy('prod.id_produto')
      .addGroupBy('item.nome_produto_snapshot')
      .orderBy('quantidade_vendida', 'DESC')
      .limit(6);

    const statusQb = this.pagamentoRepo
      .createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)::int', 'quantidade')
      .addSelect('COALESCE(SUM(p.valor), 0)', 'total')
      .where('p.ativo = true')
      .groupBy('p.status')
      .orderBy('quantidade', 'DESC');

    if (inicio) {
      arrecadacaoDiaQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) >= :inicio', { inicio });
      topProdutosQb.andWhere('ped.data_pedido >= :inicio', { inicio });
      statusQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) >= :inicio', { inicio });
    }
    if (fim) {
      arrecadacaoDiaQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) <= :fim', { fim });
      topProdutosQb.andWhere('ped.data_pedido <= :fim', { fim });
      statusQb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) <= :fim', { fim });
    }

    const [resumo, arrecadacaoPorDiaRaw, topProdutosRaw, porStatusRaw] =
      await Promise.all([
        this.obterResumoTransparencia(filtros),
        arrecadacaoDiaQb.getRawMany(),
        topProdutosQb.getRawMany(),
        statusQb.getRawMany(),
      ]);

    const ticketMedio =
      resumo.totalPedidos > 0
        ? this.round2(resumo.receitaVendas / resumo.totalPedidos)
        : 0;

    return {
      resumo,
      metricasVendas: {
        totalArrecadado: resumo.receitaVendas,
        totalPedidos: resumo.totalPedidos,
        ticketMedio,
        itensVendidos: resumo.itensVendidos,
      },
      arrecadacaoPorDia: arrecadacaoPorDiaRaw.map((row) => ({
        data: row.data,
        valor: this.round2(Number(row.valor)),
        pedidos: Number(row.pedidos),
      })),
      topProdutos: topProdutosRaw.map((row) => {
        const receita = this.round2(Number(row.receita));
        const custo = this.round2(Number(row.custo));
        return {
          idProduto: String(row.id_produto),
          nome: row.nome,
          quantidadeVendida: Number(row.quantidade_vendida),
          receita,
          custo,
          lucroBruto: this.round2(receita - custo),
        };
      }),
      porStatusPagamento: porStatusRaw.map((row) => ({
        status: row.status,
        quantidade: Number(row.quantidade),
        total: this.round2(Number(row.total)),
      })),
    };
  }

  /* -------------------------------------------------------- CRUD & GESTÃO */

  async create(dto: CreatePagamentoDto): Promise<Pagamento> {
    let pedido: Pedido | null = null;
    if (dto.idPedido) {
      pedido = await this.pedidoRepo.findOneBy({ idPedido: dto.idPedido });
      if (!pedido) {
        throw new NotFoundException(`Pedido #${dto.idPedido} não encontrado`);
      }
    }

    const categoria: CategoriaFinanceira =
      dto.categoria ?? (pedido ? 'venda' : 'outro');
    const tipo: TipoLancamento =
      dto.tipo ?? this.inferirTipoPorCategoria(categoria);

    if (categoria === 'repasse' && !dto.validadorNome?.trim()) {
      throw new BadRequestException(
        'Lançamentos de repasse exigem o nome do validador institucional (validadorNome)',
      );
    }

    const referencia = dto.referenciaGateway?.trim() || null;
    if (referencia) {
      await this.validarReferenciaUnica(referencia);
    }

    const status = dto.status ?? (pedido ? 'pendente' : 'concluido');
    const dataPagamento = dto.dataPagamento
      ? this.parseData(dto.dataPagamento)
      : status === 'concluido'
        ? new Date()
        : null;

    const pagamento = this.pagamentoRepo.create({
      pedido,
      tipo,
      categoria,
      valor: this.round2(dto.valor).toFixed(2),
      metodo: dto.metodo,
      status,
      dataPagamento,
      referenciaGateway: referencia,
      descricao: dto.descricao?.trim() || null,
      validadorNome: dto.validadorNome?.trim() || null,
      validadorCargo: dto.validadorCargo?.trim() || null,
      ativo: true,
    });

    const salvo = await this.pagamentoRepo.save(pagamento);
    return this.findOneAdmin(salvo.idPagamento);
  }

  async criarRepasse(dto: CreateRepasseDto): Promise<Pagamento> {
    return this.create({
      tipo: 'saida',
      categoria: 'repasse',
      valor: dto.valor,
      metodo: dto.metodo,
      status: dto.status ?? 'concluido',
      dataPagamento: dto.dataPagamento,
      descricao: dto.descricao,
      validadorNome: dto.validadorNome,
      validadorCargo: dto.validadorCargo ?? 'Conselho Fiscal / DIACOM',
    });
  }

  async findAllAdmin(filtros?: FiltroLancamentos) {
    const { inicio, fim } = this.resolverIntervalo(filtros);

    const qb = this.pagamentoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.pedido', 'pedido')
      .leftJoinAndSelect('pedido.usuario', 'usuario')
      .orderBy('COALESCE(p.data_pagamento, p.data_criacao)', 'DESC')
      .addOrderBy('p.idPagamento', 'DESC');

    if (!filtros?.incluirInativos) {
      qb.andWhere('p.ativo = true');
    }
    if (filtros?.tipo) {
      qb.andWhere('p.tipo = :tipo', { tipo: filtros.tipo });
    }
    if (filtros?.categoria) {
      qb.andWhere('p.categoria = :categoria', { categoria: filtros.categoria });
    }
    if (filtros?.metodo) {
      qb.andWhere('p.metodo = :metodo', { metodo: filtros.metodo });
    }
    if (filtros?.status) {
      qb.andWhere('p.status = :status', { status: filtros.status });
    }
    if (filtros?.idPedido) {
      qb.andWhere('pedido.idPedido = :idPedido', { idPedido: filtros.idPedido });
    }
    if (filtros?.busca) {
      qb.andWhere(
        `(LOWER(COALESCE(p.descricao, '')) LIKE LOWER(:busca) OR LOWER(COALESCE(p.validador_nome, '')) LIKE LOWER(:busca) OR LOWER(COALESCE(p.referencia_gateway, '')) LIKE LOWER(:busca))`,
        { busca: `%${filtros.busca}%` },
      );
    }
    if (inicio) {
      qb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) >= :inicio', { inicio });
    }
    if (fim) {
      qb.andWhere('COALESCE(p.data_pagamento, p.data_criacao) <= :fim', { fim });
    }

    return qb.getMany();
  }

  async findByPedido(
    idPedido: string,
    usuarioId: string,
    isAdmin: boolean,
  ): Promise<Pagamento[]> {
    const pedido = await this.pedidoRepo.findOne({
      where: { idPedido },
      relations: ['usuario'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido #${idPedido} não encontrado`);
    }

    if (!isAdmin && pedido.usuario.idUsuario !== usuarioId) {
      throw new ForbiddenException(
        'Você não tem permissão para consultar os pagamentos deste pedido',
      );
    }

    return this.pagamentoRepo.find({
      where: {
        pedido: { idPedido },
        ativo: true,
      },
      order: { dataCriacao: 'DESC' },
    });
  }

  private async findOneAdmin(idPagamento: string): Promise<Pagamento> {
    const pagamento = await this.pagamentoRepo.findOne({
      where: { idPagamento },
      relations: ['pedido', 'pedido.usuario'],
    });

    if (!pagamento) {
      throw new NotFoundException(`Pagamento #${idPagamento} não encontrado`);
    }

    return pagamento;
  }

  async findOne(
    idPagamento: string,
    usuarioId: string,
    isAdmin: boolean,
  ): Promise<Pagamento> {
    const pagamento = await this.findOneAdmin(idPagamento);

    if (!isAdmin) {
      if (!pagamento.ativo) {
        throw new NotFoundException(`Pagamento #${idPagamento} não encontrado`);
      }
      if (!pagamento.pedido || pagamento.pedido.usuario.idUsuario !== usuarioId) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar este lançamento financeiro',
        );
      }
    }

    return pagamento;
  }

  async update(idPagamento: string, dto: UpdatePagamentoDto): Promise<Pagamento> {
    const pagamento = await this.findOneAdmin(idPagamento);

    if (dto.idPedido !== undefined) {
      if (!dto.idPedido) {
        pagamento.pedido = null;
      } else {
        const pedido = await this.pedidoRepo.findOneBy({ idPedido: dto.idPedido });
        if (!pedido) {
          throw new NotFoundException(`Pedido #${dto.idPedido} não encontrado`);
        }
        pagamento.pedido = pedido;
      }
    }

    if (dto.referenciaGateway !== undefined) {
      const ref = dto.referenciaGateway?.trim() || null;
      if (ref) {
        await this.validarReferenciaUnica(ref, idPagamento);
      }
      pagamento.referenciaGateway = ref;
    }

    if (dto.valor !== undefined) {
      pagamento.valor = this.round2(dto.valor).toFixed(2);
    }
    if (dto.metodo !== undefined) pagamento.metodo = dto.metodo;
    if (dto.categoria !== undefined) pagamento.categoria = dto.categoria;
    if (dto.tipo !== undefined) pagamento.tipo = dto.tipo;
    if (dto.descricao !== undefined) {
      pagamento.descricao = dto.descricao?.trim() || null;
    }
    if (dto.validadorNome !== undefined) {
      pagamento.validadorNome = dto.validadorNome?.trim() || null;
    }
    if (dto.validadorCargo !== undefined) {
      pagamento.validadorCargo = dto.validadorCargo?.trim() || null;
    }

    if (pagamento.categoria === 'repasse' && !pagamento.validadorNome) {
      throw new BadRequestException(
        'Lançamentos de repasse exigem o nome do validador institucional (validadorNome)',
      );
    }

    if (dto.status !== undefined) {
      pagamento.status = dto.status;
      if (dto.status === 'concluido' && !pagamento.dataPagamento && !dto.dataPagamento) {
        pagamento.dataPagamento = new Date();
      }
    }

    if (dto.dataPagamento !== undefined) {
      pagamento.dataPagamento = dto.dataPagamento
        ? this.parseData(dto.dataPagamento)
        : null;
    }

    await this.pagamentoRepo.save(pagamento);
    return this.findOneAdmin(idPagamento);
  }

  async updateStatus(
    idPagamento: string,
    dto: UpdateStatusPagamentoDto,
  ): Promise<Pagamento> {
    const pagamento = await this.findOneAdmin(idPagamento);

    pagamento.status = dto.status;
    if (dto.dataPagamento) {
      pagamento.dataPagamento = this.parseData(dto.dataPagamento);
    } else if (dto.status === 'concluido' && !pagamento.dataPagamento) {
      pagamento.dataPagamento = new Date();
    }

    if (dto.descricao !== undefined) {
      pagamento.descricao = dto.descricao.trim() || pagamento.descricao;
    }

    await this.pagamentoRepo.save(pagamento);
    return this.findOneAdmin(idPagamento);
  }

  async remove(idPagamento: string) {
    const pagamento = await this.findOneAdmin(idPagamento);
    pagamento.ativo = false;
    await this.pagamentoRepo.save(pagamento);
    return { message: `Lançamento #${idPagamento} desativado com sucesso` };
  }
}
