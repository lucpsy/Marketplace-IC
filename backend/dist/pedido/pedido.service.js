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
exports.PedidoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pedido_entity_1 = require("./entities/pedido.entity");
const item_pedido_entity_1 = require("./entities/item_pedido.entity");
const status_pedido_entity_1 = require("./entities/status_pedido.entity");
const transicao_status_entity_1 = require("./entities/transicao-status.entity");
const historico_status_entity_1 = require("./entities/historico-status.entity");
const carrinho_entity_1 = require("../carrinho/entities/carrinho.entity");
const carrinho_item_entity_1 = require("../carrinho/entities/carrinho-item.entity");
const produto_entity_1 = require("../catalogo/entities/produto.entity");
const usuario_entity_1 = require("../usuario/entities/usuario.entity");
const seed_status_pedido_1 = require("../database/seeds/seed-status-pedido");
const promo_service_1 = require("../promo/promo.service");
let PedidoService = class PedidoService {
    constructor(dataSource, pedidoRepo, statusRepo, transicaoRepo, carrinhoRepo, usuarioRepo, promocaoService) {
        this.dataSource = dataSource;
        this.pedidoRepo = pedidoRepo;
        this.statusRepo = statusRepo;
        this.transicaoRepo = transicaoRepo;
        this.carrinhoRepo = carrinhoRepo;
        this.usuarioRepo = usuarioRepo;
        this.promocaoService = promocaoService;
    }
    async onModuleInit() {
        await (0, seed_status_pedido_1.seedStatusPedido)(this.statusRepo, this.transicaoRepo);
    }
    async listarStatus() {
        return this.statusRepo.find({
            where: { ativo: true },
            order: { ordem: 'ASC' },
        });
    }
    async listarTransicoesPermitidas(idStatus) {
        const transicoes = await this.transicaoRepo.find({
            where: {
                statusOrigem: { idStatus },
                permitido: true,
            },
            relations: ['statusDestino'],
        });
        return transicoes
            .map((t) => t.statusDestino)
            .filter((s) => s.ativo)
            .sort((a, b) => a.ordem - b.ordem);
    }
    async criarDoCarrinho(usuarioId, dto) {
        const carrinho = await this.carrinhoRepo.findOne({
            where: { usuario: { idUsuario: usuarioId } },
            relations: ['usuario', 'itens', 'itens.produto'],
        });
        if (!carrinho || !carrinho.itens || carrinho.itens.length === 0) {
            throw new common_1.BadRequestException('Não é possível finalizar o pedido: o carrinho está vazio');
        }
        for (const item of carrinho.itens) {
            if (!item.produto || item.produto.status !== 'ativo') {
                throw new common_1.BadRequestException(`Produto "${item.produto?.nome ?? item.idCarrinhoItem}" não está mais disponível`);
            }
            if (item.quantidade > item.produto.estoque) {
                throw new common_1.BadRequestException(`Estoque insuficiente para "${item.produto.nome}". Disponível: ${item.produto.estoque}`);
            }
        }
        const statusInicial = await this.statusRepo.findOneBy({
            nome: 'Confirmado',
        });
        if (!statusInicial) {
            throw new common_1.NotFoundException('Status inicial "Confirmado" não configurado');
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
        const resumoPromos = calculo.promocoesAplicadas.length > 0
            ? ` (promoções aplicadas: ${calculo.promocoesAplicadas
                .map((p) => (p.codigo ? `${p.titulo} [${p.codigo}]` : p.titulo))
                .join(', ')})`
            : '';
        const idPedidoCriado = await this.dataSource.transaction(async (manager) => {
            const pedido = manager.create(pedido_entity_1.Pedido, {
                usuario: carrinho.usuario,
                status: statusInicial,
                subtotal: subtotal.toFixed(2),
                valorDesconto: valorDesconto.toFixed(2),
                frete: frete.toFixed(2),
                valorTotal: valorTotal.toFixed(2),
                observacao: dto.observacao ?? null,
            });
            const pedidoSalvo = await manager.save(pedido_entity_1.Pedido, pedido);
            const itensPedido = carrinho.itens.map((item, idx) => {
                const calcItem = calculo.itens[idx];
                const precoUnit = calcItem?.precoUnitario ?? Number(item.produto.precoVenda);
                const descontoItem = calcItem?.descontoTotalItem ?? 0;
                const totalItem = calcItem?.valorTotalItem ?? Math.max(0, precoUnit * item.quantidade - descontoItem);
                return manager.create(item_pedido_entity_1.ItemPedido, {
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
            await manager.save(item_pedido_entity_1.ItemPedido, itensPedido);
            for (const item of carrinho.itens) {
                await manager.decrement(produto_entity_1.Produto, { idProduto: item.produto.idProduto }, 'estoque', item.quantidade);
            }
            const historicoInicial = manager.create(historico_status_entity_1.HistoricoStatus, {
                pedido: pedidoSalvo,
                status: statusInicial,
                usuarioResponsavel: carrinho.usuario,
                observacao: `Pedido confirmado a partir do carrinho${resumoPromos}`,
            });
            await manager.save(historico_status_entity_1.HistoricoStatus, historicoInicial);
            await manager.delete(carrinho_item_entity_1.CarrinhoItem, {
                carrinho: { idCarrinho: carrinho.idCarrinho },
            });
            return pedidoSalvo.idPedido;
        });
        return this.findOne(idPedidoCriado, usuarioId, true);
    }
    async findMeusPedidos(usuarioId) {
        return this.pedidoRepo.find({
            where: { usuario: { idUsuario: usuarioId } },
            relations: [
                'status',
                'itens',
                'itens.produto',
                'itens.produto.imagens',
                'itens.produto.fornecedor',
                'historicoStatus',
                'historicoStatus.status',
            ],
            order: {
                dataPedido: 'DESC',
                historicoStatus: {
                    dataHora: 'ASC',
                },
            },
        });
    }
    async findAll(filtros) {
        const qb = this.pedidoRepo
            .createQueryBuilder('pedido')
            .leftJoinAndSelect('pedido.usuario', 'usuario')
            .leftJoinAndSelect('pedido.status', 'status')
            .leftJoinAndSelect('pedido.itens', 'itens')
            .leftJoinAndSelect('itens.produto', 'produto')
            .leftJoinAndSelect('pedido.historicoStatus', 'historico')
            .leftJoinAndSelect('historico.status', 'historicoStatus')
            .orderBy('pedido.dataPedido', 'DESC')
            .addOrderBy('historico.dataHora', 'ASC');
        if (filtros?.statusId) {
            qb.andWhere('status.idStatus = :statusId', {
                statusId: filtros.statusId,
            });
        }
        if (filtros?.usuarioId) {
            qb.andWhere('usuario.idUsuario = :usuarioId', {
                usuarioId: filtros.usuarioId,
            });
        }
        return qb.getMany();
    }
    async findOne(idPedido, usuarioId, isAdmin) {
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
            ],
            order: {
                historicoStatus: {
                    dataHora: 'ASC',
                },
            },
        });
        if (!pedido) {
            throw new common_1.NotFoundException(`Pedido #${idPedido} não encontrado`);
        }
        if (!isAdmin && pedido.usuario.idUsuario !== usuarioId) {
            throw new common_1.ForbiddenException('Você não tem permissão para acessar este pedido');
        }
        return pedido;
    }
    async atualizarStatus(idPedido, dto, responsavelId) {
        if (!dto.idStatus && !dto.nomeStatus) {
            throw new common_1.BadRequestException('Informe idStatus ou nomeStatus para atualizar o status do pedido');
        }
        const pedido = await this.pedidoRepo.findOne({
            where: { idPedido },
            relations: ['status', 'itens', 'itens.produto'],
        });
        if (!pedido) {
            throw new common_1.NotFoundException(`Pedido #${idPedido} não encontrado`);
        }
        if (pedido.status?.statusFinal) {
            throw new common_1.BadRequestException(`O pedido #${idPedido} já está no status final "${pedido.status.nome}" e não pode ser alterado`);
        }
        const statusDestino = dto.idStatus
            ? await this.statusRepo.findOneBy({ idStatus: dto.idStatus })
            : await this.statusRepo.findOneBy({ nome: dto.nomeStatus });
        if (!statusDestino || !statusDestino.ativo) {
            throw new common_1.NotFoundException('Status de destino não encontrado ou inativo');
        }
        if (pedido.status) {
            if (pedido.status.idStatus === statusDestino.idStatus) {
                throw new common_1.BadRequestException(`O pedido já se encontra no status "${statusDestino.nome}"`);
            }
            const transicao = await this.transicaoRepo.findOne({
                where: {
                    statusOrigem: { idStatus: pedido.status.idStatus },
                    statusDestino: { idStatus: statusDestino.idStatus },
                    permitido: true,
                },
            });
            if (!transicao) {
                throw new common_1.BadRequestException(`Transição de "${pedido.status.nome}" para "${statusDestino.nome}" não é permitida`);
            }
        }
        const responsavel = await this.usuarioRepo.findOneBy({
            idUsuario: responsavelId,
        });
        await this.dataSource.transaction(async (manager) => {
            pedido.status = statusDestino;
            await manager.save(pedido_entity_1.Pedido, pedido);
            if (statusDestino.nome === 'Cancelado') {
                for (const item of pedido.itens) {
                    await manager.increment(produto_entity_1.Produto, { idProduto: item.produto.idProduto }, 'estoque', item.quantidade);
                }
            }
            const registroHistorico = manager.create(historico_status_entity_1.HistoricoStatus, {
                pedido,
                status: statusDestino,
                usuarioResponsavel: responsavel ?? null,
                observacao: dto.observacao ?? `Status alterado para "${statusDestino.nome}"`,
            });
            await manager.save(historico_status_entity_1.HistoricoStatus, registroHistorico);
        });
        return this.findOne(idPedido, responsavelId, true);
    }
};
exports.PedidoService = PedidoService;
exports.PedidoService = PedidoService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(pedido_entity_1.Pedido)),
    __param(2, (0, typeorm_1.InjectRepository)(status_pedido_entity_1.StatusPedido)),
    __param(3, (0, typeorm_1.InjectRepository)(transicao_status_entity_1.TransicaoStatus)),
    __param(4, (0, typeorm_1.InjectRepository)(carrinho_entity_1.Carrinho)),
    __param(5, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        promo_service_1.PromocaoService])
], PedidoService);
//# sourceMappingURL=pedido.service.js.map