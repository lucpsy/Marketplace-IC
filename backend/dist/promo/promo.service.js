"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromocaoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promocao_entity_1 = require("./entities/promocao.entity");
const produto_promocao_entity_1 = require("./entities/produto_promocao.entity");
const produto_entity_1 = require("../catalogo/entities/produto.entity");
let PromocaoService = class PromocaoService {
    constructor(dataSource, promocaoRepo, produtoPromocaoRepo, produtoRepo) {
        this.dataSource = dataSource;
        this.promocaoRepo = promocaoRepo;
        this.produtoPromocaoRepo = produtoPromocaoRepo;
        this.produtoRepo = produtoRepo;
    }
    round2(valor) {
        return Math.round((valor + Number.EPSILON) * 100) / 100;
    }
    normalizarCodigo(codigo) {
        if (codigo === undefined || codigo === null)
            return null;
        const limpo = codigo.trim().toUpperCase();
        return limpo.length > 0 ? limpo : null;
    }
    isVigente(promocao, agora = new Date()) {
        return (promocao.status === 'ativa' &&
            new Date(promocao.dataInicio) <= agora &&
            new Date(promocao.dataFim) >= agora);
    }
    toResumo(promocao) {
        return {
            idPromocao: promocao.idPromocao,
            titulo: promocao.titulo,
            codigo: promocao.codigo ?? null,
            tipoDesconto: promocao.tipoDesconto,
            valorDesconto: Number(promocao.valorDesconto),
            cor: promocao.cor ?? null,
            dataFim: promocao.dataFim,
        };
    }
    validarRegrasPromocao(params) {
        if (Number.isNaN(params.dataInicio.getTime()) || Number.isNaN(params.dataFim.getTime())) {
            throw new common_1.BadRequestException('Datas de início e fim inválidas');
        }
        if (params.dataFim <= params.dataInicio) {
            throw new common_1.BadRequestException('dataFim deve ser posterior a dataInicio');
        }
        if (params.tipoDesconto === 'percentual') {
            if (params.valorDesconto <= 0 || params.valorDesconto > 100) {
                throw new common_1.BadRequestException('Para desconto percentual, valorDesconto deve estar entre 0.01 e 100');
            }
        }
        else if (params.tipoDesconto === 'fixo') {
            if (params.valorDesconto <= 0) {
                throw new common_1.BadRequestException('Para desconto fixo, valorDesconto deve ser maior que zero');
            }
        }
    }
    async validarCodigoUnico(codigo, ignorarId) {
        const existente = await this.promocaoRepo
            .createQueryBuilder('promocao')
            .where('UPPER(promocao.codigo) = :codigo', { codigo })
            .getOne();
        if (existente && existente.idPromocao !== ignorarId) {
            throw new common_1.ConflictException(`Já existe uma promoção com o código "${codigo}"`);
        }
    }
    async buscarEValidarProdutos(produtoIds) {
        const idsUnicos = Array.from(new Set(produtoIds));
        if (idsUnicos.length === 0)
            return [];
        const produtos = await this.produtoRepo.findBy({
            idProduto: (0, typeorm_2.In)(idsUnicos),
        });
        if (produtos.length !== idsUnicos.length) {
            const encontrados = new Set(produtos.map((p) => p.idProduto));
            const faltantes = idsUnicos.filter((id) => !encontrados.has(id));
            throw new common_1.NotFoundException(`Produtos não encontrados: ${faltantes.join(', ')}`);
        }
        return produtos;
    }
    calcularDescontoValor(base, tipoDesconto, valorDesconto) {
        if (base <= 0)
            return 0;
        if (tipoDesconto === 'percentual') {
            return this.round2(Math.min(base, base * (valorDesconto / 100)));
        }
        if (tipoDesconto === 'fixo') {
            return this.round2(Math.min(base, valorDesconto));
        }
        return 0;
    }
    async create(dto) {
        const dataInicio = new Date(dto.dataInicio);
        const dataFim = new Date(dto.dataFim);
        this.validarRegrasPromocao({
            tipoDesconto: dto.tipoDesconto,
            valorDesconto: dto.valorDesconto,
            dataInicio,
            dataFim,
        });
        const codigo = this.normalizarCodigo(dto.codigo);
        if (codigo) {
            await this.validarCodigoUnico(codigo);
        }
        const produtos = dto.produtoIds && dto.produtoIds.length > 0
            ? await this.buscarEValidarProdutos(dto.produtoIds)
            : [];
        const idCriado = await this.dataSource.transaction(async (manager) => {
            const promocao = manager.create(promocao_entity_1.Promocao, {
                titulo: dto.titulo.trim(),
                descricao: dto.descricao ?? null,
                tipoDesconto: dto.tipoDesconto,
                valorDesconto: dto.valorDesconto.toFixed(2),
                dataInicio,
                dataFim,
                cor: dto.cor ?? null,
                codigo,
                valorMinimo: dto.valorMinimo !== undefined ? dto.valorMinimo.toFixed(2) : null,
                quantidadeMinima: dto.quantidadeMinima ?? null,
                status: dto.status ?? 'rascunho',
            });
            const salva = await manager.save(promocao_entity_1.Promocao, promocao);
            if (produtos.length > 0) {
                const vinculos = produtos.map((produto) => manager.create(produto_promocao_entity_1.ProdutoPromocao, {
                    promocao: salva,
                    produto,
                }));
                await manager.save(produto_promocao_entity_1.ProdutoPromocao, vinculos);
            }
            return salva.idPromocao;
        });
        return this.findOne(idCriado);
    }
    async findAll(filtros) {
        const qb = this.promocaoRepo
            .createQueryBuilder('promocao')
            .leftJoinAndSelect('promocao.produtosPromocao', 'pp')
            .leftJoinAndSelect('pp.produto', 'produto')
            .leftJoinAndSelect('produto.imagens', 'imagem')
            .orderBy('promocao.dataCadastro', 'DESC');
        if (filtros?.apenasAtivas) {
            const agora = new Date();
            qb.andWhere('promocao.status = :statusAtiva', { statusAtiva: 'ativa' })
                .andWhere('promocao.dataInicio <= :agora', { agora })
                .andWhere('promocao.dataFim >= :agora', { agora });
        }
        else if (filtros?.status) {
            qb.andWhere('promocao.status = :status', { status: filtros.status });
        }
        if (filtros?.tipoDesconto) {
            qb.andWhere('promocao.tipoDesconto = :tipoDesconto', {
                tipoDesconto: filtros.tipoDesconto,
            });
        }
        if (filtros?.somenteCupons) {
            qb.andWhere('promocao.codigo IS NOT NULL');
        }
        if (filtros?.busca) {
            qb.andWhere('(LOWER(promocao.titulo) LIKE LOWER(:busca) OR LOWER(COALESCE(promocao.descricao, \'\')) LIKE LOWER(:busca) OR LOWER(COALESCE(promocao.codigo, \'\')) LIKE LOWER(:busca))', { busca: `%${filtros.busca}%` });
        }
        return qb.getMany();
    }
    async findAtivas() {
        return this.findAll({ apenasAtivas: true });
    }
    async findCuponsAtivos() {
        return this.findAll({ apenasAtivas: true, somenteCupons: true });
    }
    async findOne(id, apenasAtiva = false) {
        const promocao = await this.promocaoRepo.findOne({
            where: { idPromocao: id },
            relations: [
                'produtosPromocao',
                'produtosPromocao.produto',
                'produtosPromocao.produto.imagens',
            ],
        });
        if (!promocao) {
            throw new common_1.NotFoundException(`Promoção #${id} não encontrada`);
        }
        if (apenasAtiva && !this.isVigente(promocao)) {
            throw new common_1.NotFoundException(`Promoção #${id} não encontrada ou inativa`);
        }
        return promocao;
    }
    async update(id, dto) {
        const promocao = await this.findOne(id);
        const tipoDesconto = dto.tipoDesconto ?? promocao.tipoDesconto;
        const valorDesconto = dto.valorDesconto !== undefined
            ? dto.valorDesconto
            : Number(promocao.valorDesconto);
        const dataInicio = dto.dataInicio
            ? new Date(dto.dataInicio)
            : new Date(promocao.dataInicio);
        const dataFim = dto.dataFim
            ? new Date(dto.dataFim)
            : new Date(promocao.dataFim);
        this.validarRegrasPromocao({
            tipoDesconto,
            valorDesconto,
            dataInicio,
            dataFim,
        });
        let codigo = promocao.codigo;
        if (dto.codigo !== undefined) {
            codigo = this.normalizarCodigo(dto.codigo);
            if (codigo) {
                await this.validarCodigoUnico(codigo, id);
            }
        }
        const produtos = dto.produtoIds !== undefined
            ? await this.buscarEValidarProdutos(dto.produtoIds)
            : undefined;
        await this.dataSource.transaction(async (manager) => {
            if (dto.titulo !== undefined)
                promocao.titulo = dto.titulo.trim();
            if (dto.descricao !== undefined)
                promocao.descricao = dto.descricao;
            promocao.tipoDesconto = tipoDesconto;
            promocao.valorDesconto = valorDesconto.toFixed(2);
            promocao.dataInicio = dataInicio;
            promocao.dataFim = dataFim;
            if (dto.cor !== undefined)
                promocao.cor = dto.cor;
            promocao.codigo = codigo;
            if (dto.valorMinimo !== undefined) {
                promocao.valorMinimo = dto.valorMinimo.toFixed(2);
            }
            if (dto.quantidadeMinima !== undefined) {
                promocao.quantidadeMinima = dto.quantidadeMinima;
            }
            if (dto.status !== undefined)
                promocao.status = dto.status;
            await manager.save(promocao_entity_1.Promocao, promocao);
            if (produtos !== undefined) {
                await manager.delete(produto_promocao_entity_1.ProdutoPromocao, {
                    promocao: { idPromocao: id },
                });
                if (produtos.length > 0) {
                    const vinculos = produtos.map((produto) => manager.create(produto_promocao_entity_1.ProdutoPromocao, {
                        promocao,
                        produto,
                    }));
                    await manager.save(produto_promocao_entity_1.ProdutoPromocao, vinculos);
                }
            }
        });
        return this.findOne(id);
    }
    async updateStatus(id, dto) {
        const promocao = await this.findOne(id);
        promocao.status = dto.status;
        await this.promocaoRepo.save(promocao);
        return this.findOne(id);
    }
    async vincularProdutos(id, dto) {
        const promocao = await this.findOne(id);
        const produtos = await this.buscarEValidarProdutos(dto.produtoIds);
        const jaVinculados = new Set((promocao.produtosPromocao ?? []).map((pp) => pp.produto.idProduto));
        const novos = produtos.filter((p) => !jaVinculados.has(p.idProduto));
        if (novos.length > 0) {
            const vinculos = novos.map((produto) => this.produtoPromocaoRepo.create({
                promocao,
                produto,
            }));
            await this.produtoPromocaoRepo.save(vinculos);
        }
        return this.findOne(id);
    }
    async desvincularProduto(id, idProduto) {
        await this.findOne(id);
        const vinculo = await this.produtoPromocaoRepo.findOne({
            where: {
                promocao: { idPromocao: id },
                produto: { idProduto },
            },
        });
        if (!vinculo) {
            throw new common_1.NotFoundException(`Produto #${idProduto} não está vinculado à promoção #${id}`);
        }
        await this.produtoPromocaoRepo.remove(vinculo);
        return this.findOne(id);
    }
    async remove(id) {
        const promocao = await this.findOne(id);
        promocao.status = 'inativa';
        await this.promocaoRepo.save(promocao);
        return { message: `Promoção #${id} desativada com sucesso` };
    }
    async validarCupom(dto) {
        const codigo = this.normalizarCodigo(dto.codigo);
        if (!codigo) {
            throw new common_1.BadRequestException('Informe um código de cupom válido');
        }
        const promocao = await this.promocaoRepo
            .createQueryBuilder('promocao')
            .leftJoinAndSelect('promocao.produtosPromocao', 'pp')
            .leftJoinAndSelect('pp.produto', 'produto')
            .where('UPPER(promocao.codigo) = :codigo', { codigo })
            .getOne();
        if (!promocao) {
            throw new common_1.NotFoundException(`Cupom "${codigo}" não encontrado`);
        }
        if (!this.isVigente(promocao)) {
            throw new common_1.BadRequestException(`Cupom "${codigo}" está inativo ou fora do período de vigência`);
        }
        const valorMinimo = promocao.valorMinimo ? Number(promocao.valorMinimo) : 0;
        if (dto.subtotal !== undefined && valorMinimo > 0 && dto.subtotal < valorMinimo) {
            throw new common_1.BadRequestException(`Cupom "${codigo}" exige valor mínimo de R$ ${valorMinimo.toFixed(2)}`);
        }
        const descontoEstimado = dto.subtotal !== undefined
            ? this.calcularDescontoValor(dto.subtotal, promocao.tipoDesconto, Number(promocao.valorDesconto))
            : null;
        return {
            valido: true,
            cupom: {
                ...this.toResumo(promocao),
                valorMinimo: promocao.valorMinimo ? Number(promocao.valorMinimo) : null,
                quantidadeMinima: promocao.quantidadeMinima ?? null,
                produtoIds: (promocao.produtosPromocao ?? []).map((pp) => pp.produto.idProduto),
            },
            descontoEstimado,
        };
    }
    async carregarPromocoesVigentes() {
        const agora = new Date();
        return this.promocaoRepo
            .createQueryBuilder('promocao')
            .leftJoinAndSelect('promocao.produtosPromocao', 'pp')
            .leftJoinAndSelect('pp.produto', 'produto')
            .where('promocao.status = :status', { status: 'ativa' })
            .andWhere('promocao.dataInicio <= :agora', { agora })
            .andWhere('promocao.dataFim >= :agora', { agora })
            .getMany();
    }
    ehCampanhaDiretaProduto(promocao) {
        const temProdutos = (promocao.produtosPromocao?.length ?? 0) > 0;
        const exigeComboQtd = (promocao.quantidadeMinima ?? 0) > 1;
        const exigeValorMin = promocao.valorMinimo !== null && Number(promocao.valorMinimo) > 0;
        return (!promocao.codigo &&
            promocao.tipoDesconto !== 'frete_gratis' &&
            temProdutos &&
            !exigeComboQtd &&
            !exigeValorMin);
    }
    async enriquecerProdutosComPromocao(produtos) {
        if (produtos.length === 0)
            return [];
        const promocoesVigentes = await this.carregarPromocoesVigentes();
        const diretas = promocoesVigentes.filter((p) => this.ehCampanhaDiretaProduto(p));
        const mapaPromosPorProduto = new Map();
        for (const promo of diretas) {
            for (const pp of promo.produtosPromocao ?? []) {
                const idProd = pp.produto?.idProduto;
                if (!idProd)
                    continue;
                const lista = mapaPromosPorProduto.get(idProd) ?? [];
                lista.push(promo);
                mapaPromosPorProduto.set(idProd, lista);
            }
        }
        return produtos.map((produto) => {
            const precoBase = Number(produto.precoVenda);
            const candidatas = mapaPromosPorProduto.get(produto.idProduto) ?? [];
            let melhorDesconto = 0;
            let melhorPromocao = null;
            for (const promo of candidatas) {
                const desc = this.calcularDescontoValor(precoBase, promo.tipoDesconto, Number(promo.valorDesconto));
                if (desc > melhorDesconto) {
                    melhorDesconto = desc;
                    melhorPromocao = promo;
                }
            }
            const precoPromocional = melhorPromocao && melhorDesconto > 0
                ? this.round2(Math.max(0, precoBase - melhorDesconto))
                : null;
            return {
                ...produto,
                precoPromocional,
                promocaoAtiva: melhorPromocao ? this.toResumo(melhorPromocao) : null,
            };
        });
    }
    async calcularDescontos(params) {
        const freteOriginal = this.round2(Math.max(0, params.frete ?? 0));
        const promocoesVigentes = await this.carregarPromocoesVigentes();
        const promocoesDiretas = promocoesVigentes.filter((p) => this.ehCampanhaDiretaProduto(p));
        const promocoesCombo = promocoesVigentes.filter((p) => !p.codigo && !this.ehCampanhaDiretaProduto(p));
        const mapaDiretasPorProduto = new Map();
        for (const promo of promocoesDiretas) {
            for (const pp of promo.produtosPromocao ?? []) {
                const idProd = pp.produto?.idProduto;
                if (!idProd)
                    continue;
                const lista = mapaDiretasPorProduto.get(idProd) ?? [];
                lista.push(promo);
                mapaDiretasPorProduto.set(idProd, lista);
            }
        }
        const economiaPorCampanhaDireta = new Map();
        const itensCalculados = params.itens.map(({ produto, quantidade }) => {
            const precoUnitario = this.round2(Number(produto.precoVenda));
            const subtotalBrutoItem = this.round2(precoUnitario * quantidade);
            const candidatas = mapaDiretasPorProduto.get(produto.idProduto) ?? [];
            let melhorDescontoUnit = 0;
            let melhorPromocao = null;
            for (const promo of candidatas) {
                const descUnit = this.calcularDescontoValor(precoUnitario, promo.tipoDesconto, Number(promo.valorDesconto));
                if (descUnit > melhorDescontoUnit) {
                    melhorDescontoUnit = descUnit;
                    melhorPromocao = promo;
                }
            }
            const descontoTotalItem = this.round2(melhorDescontoUnit * quantidade);
            const precoUnitarioFinal = this.round2(Math.max(0, precoUnitario - melhorDescontoUnit));
            const valorTotalItem = this.round2(Math.max(0, subtotalBrutoItem - descontoTotalItem));
            if (melhorPromocao && descontoTotalItem > 0) {
                const atual = economiaPorCampanhaDireta.get(melhorPromocao.idPromocao);
                economiaPorCampanhaDireta.set(melhorPromocao.idPromocao, {
                    promocao: melhorPromocao,
                    valor: this.round2((atual?.valor ?? 0) + descontoTotalItem),
                });
            }
            return {
                idProduto: produto.idProduto,
                nome: produto.nome,
                quantidade,
                precoUnitario,
                precoUnitarioFinal,
                descontoUnitario: melhorDescontoUnit,
                descontoTotalItem,
                subtotalBrutoItem,
                valorTotalItem,
                promocaoAplicada: melhorPromocao ? this.toResumo(melhorPromocao) : null,
            };
        });
        const subtotalBruto = this.round2(itensCalculados.reduce((acc, i) => acc + i.subtotalBrutoItem, 0));
        const descontoProdutos = this.round2(itensCalculados.reduce((acc, i) => acc + i.descontoTotalItem, 0));
        const subtotalAposDiretas = this.round2(Math.max(0, subtotalBruto - descontoProdutos));
        const promocoesAplicadas = [];
        for (const { promocao, valor } of economiaPorCampanhaDireta.values()) {
            promocoesAplicadas.push({
                idPromocao: promocao.idPromocao,
                titulo: promocao.titulo,
                codigo: null,
                tipoDesconto: promocao.tipoDesconto,
                valorDesconto: Number(promocao.valorDesconto),
                categoria: 'produto',
                valorEconomizado: valor,
            });
        }
        let melhorCombo = null;
        let melhorFreteGratisAuto = null;
        for (const promo of promocoesCombo) {
            const produtoIdsPromo = new Set((promo.produtosPromocao ?? []).map((pp) => pp.produto.idProduto));
            const itensElegiveis = produtoIdsPromo.size > 0
                ? itensCalculados.filter((i) => produtoIdsPromo.has(i.idProduto))
                : itensCalculados;
            if (itensElegiveis.length === 0)
                continue;
            const qtdElegivel = itensElegiveis.reduce((acc, i) => acc + i.quantidade, 0);
            const baseElegivel = this.round2(itensElegiveis.reduce((acc, i) => acc + i.valorTotalItem, 0));
            if (promo.quantidadeMinima && qtdElegivel < promo.quantidadeMinima) {
                continue;
            }
            if (promo.valorMinimo && baseElegivel < Number(promo.valorMinimo)) {
                continue;
            }
            if (promo.tipoDesconto === 'frete_gratis') {
                if (!melhorFreteGratisAuto && freteOriginal > 0) {
                    melhorFreteGratisAuto = promo;
                }
                continue;
            }
            const desc = this.calcularDescontoValor(baseElegivel, promo.tipoDesconto, Number(promo.valorDesconto));
            if (desc > (melhorCombo?.valor ?? 0)) {
                melhorCombo = { promocao: promo, valor: desc };
            }
        }
        const descontoCombos = melhorCombo ? melhorCombo.valor : 0;
        if (melhorCombo && descontoCombos > 0) {
            promocoesAplicadas.push({
                idPromocao: melhorCombo.promocao.idPromocao,
                titulo: melhorCombo.promocao.titulo,
                codigo: null,
                tipoDesconto: melhorCombo.promocao.tipoDesconto,
                valorDesconto: Number(melhorCombo.promocao.valorDesconto),
                categoria: 'combo',
                valorEconomizado: descontoCombos,
            });
        }
        let descontoFrete = 0;
        if (melhorFreteGratisAuto && freteOriginal > 0) {
            descontoFrete = freteOriginal;
            promocoesAplicadas.push({
                idPromocao: melhorFreteGratisAuto.idPromocao,
                titulo: melhorFreteGratisAuto.titulo,
                codigo: null,
                tipoDesconto: melhorFreteGratisAuto.tipoDesconto,
                valorDesconto: Number(melhorFreteGratisAuto.valorDesconto),
                categoria: 'combo',
                valorEconomizado: freteOriginal,
            });
        }
        let descontoCupom = 0;
        let cupomAplicado = null;
        const codigoNormalizado = this.normalizarCodigo(params.codigoCupom);
        if (codigoNormalizado) {
            const cupom = promocoesVigentes.find((p) => this.normalizarCodigo(p.codigo) === codigoNormalizado);
            if (!cupom) {
                throw new common_1.BadRequestException(`Cupom "${codigoNormalizado}" inválido, inativo ou expirado`);
            }
            const produtoIdsCupom = new Set((cupom.produtosPromocao ?? []).map((pp) => pp.produto.idProduto));
            const itensElegiveis = produtoIdsCupom.size > 0
                ? itensCalculados.filter((i) => produtoIdsCupom.has(i.idProduto))
                : itensCalculados;
            if (itensElegiveis.length === 0) {
                throw new common_1.BadRequestException(`Cupom "${codigoNormalizado}" não se aplica aos produtos selecionados`);
            }
            const qtdElegivel = itensElegiveis.reduce((acc, i) => acc + i.quantidade, 0);
            const baseElegivelBruta = this.round2(itensElegiveis.reduce((acc, i) => acc + i.valorTotalItem, 0));
            const saldoRestantePedido = this.round2(Math.max(0, subtotalAposDiretas - descontoCombos));
            const baseCupom = this.round2(Math.min(baseElegivelBruta, saldoRestantePedido));
            if (cupom.quantidadeMinima && qtdElegivel < cupom.quantidadeMinima) {
                throw new common_1.BadRequestException(`Cupom "${codigoNormalizado}" exige no mínimo ${cupom.quantidadeMinima} item(ns) elegível(is)`);
            }
            if (cupom.valorMinimo && baseElegivelBruta < Number(cupom.valorMinimo)) {
                throw new common_1.BadRequestException(`Cupom "${codigoNormalizado}" exige valor mínimo de R$ ${Number(cupom.valorMinimo).toFixed(2)}`);
            }
            cupomAplicado = this.toResumo(cupom);
            if (cupom.tipoDesconto === 'frete_gratis') {
                const economiaFrete = this.round2(Math.max(0, freteOriginal - descontoFrete));
                descontoFrete = freteOriginal;
                promocoesAplicadas.push({
                    idPromocao: cupom.idPromocao,
                    titulo: cupom.titulo,
                    codigo: cupom.codigo,
                    tipoDesconto: cupom.tipoDesconto,
                    valorDesconto: Number(cupom.valorDesconto),
                    categoria: 'cupom',
                    valorEconomizado: economiaFrete,
                });
            }
            else {
                descontoCupom = this.calcularDescontoValor(baseCupom, cupom.tipoDesconto, Number(cupom.valorDesconto));
                promocoesAplicadas.push({
                    idPromocao: cupom.idPromocao,
                    titulo: cupom.titulo,
                    codigo: cupom.codigo,
                    tipoDesconto: cupom.tipoDesconto,
                    valorDesconto: Number(cupom.valorDesconto),
                    categoria: 'cupom',
                    valorEconomizado: descontoCupom,
                });
            }
        }
        const descontoTotal = this.round2(Math.min(subtotalBruto, descontoProdutos + descontoCombos + descontoCupom));
        const freteFinal = this.round2(Math.max(0, freteOriginal - descontoFrete));
        const valorTotal = this.round2(Math.max(0, subtotalBruto - descontoTotal) + freteFinal);
        return {
            subtotalBruto,
            descontoProdutos,
            descontoCombos,
            descontoCupom,
            descontoTotal,
            freteOriginal,
            descontoFrete,
            freteFinal,
            valorTotal,
            promocoesAplicadas,
            cupomAplicado,
            itens: itensCalculados,
        };
    }
    async simularDesconto(dto) {
        const ids = dto.itens.map((i) => i.idProduto);
        const produtos = await this.buscarEValidarProdutos(ids);
        const mapaProdutos = new Map(produtos.map((p) => [p.idProduto, p]));
        const itens = dto.itens.map((item) => {
            const produto = mapaProdutos.get(item.idProduto);
            if (produto.status !== 'ativo') {
                throw new common_1.BadRequestException(`Produto "${produto.nome}" não está ativo`);
            }
            return {
                produto,
                quantidade: item.quantidade,
            };
        });
        return this.calcularDescontos({
            itens,
            codigoCupom: dto.codigoCupom,
            frete: dto.frete ?? 0,
        });
    }
};
exports.PromocaoService = PromocaoService;
exports.PromocaoService = PromocaoService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(promocao_entity_1.Promocao)),
    __param(2, (0, typeorm_1.InjectRepository)(produto_promocao_entity_1.ProdutoPromocao)),
    __param(3, (0, typeorm_1.InjectRepository)(produto_entity_1.Produto)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PromocaoService);
//# sourceMappingURL=promo.service.js.map