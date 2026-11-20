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
exports.CarrinhoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const carrinho_entity_1 = require("./entities/carrinho.entity");
const carrinho_item_entity_1 = require("./entities/carrinho-item.entity");
const produto_entity_1 = require("../catalogo/entities/produto.entity");
const usuario_entity_1 = require("../usuario/entities/usuario.entity");
const promo_service_1 = require("../promo/promo.service");
let CarrinhoService = class CarrinhoService {
    constructor(carrinhoRepo, itemRepo, produtoRepo, usuarioRepo, promocaoService) {
        this.carrinhoRepo = carrinhoRepo;
        this.itemRepo = itemRepo;
        this.produtoRepo = produtoRepo;
        this.usuarioRepo = usuarioRepo;
        this.promocaoService = promocaoService;
    }
    async getOrCreateCarrinho(usuarioId) {
        let carrinho = await this.carrinhoRepo.findOne({
            where: { usuario: { idUsuario: usuarioId } },
        });
        if (!carrinho) {
            const usuario = await this.usuarioRepo.findOneBy({ idUsuario: usuarioId });
            if (!usuario) {
                throw new common_1.NotFoundException('Usuário não encontrado');
            }
            carrinho = this.carrinhoRepo.create({
                usuario,
                status: 'ativo',
            });
            carrinho = await this.carrinhoRepo.save(carrinho);
        }
        return carrinho;
    }
    async obterCarrinho(usuarioId, codigoCupom) {
        const carrinhoBase = await this.getOrCreateCarrinho(usuarioId);
        const carrinho = await this.carrinhoRepo.findOne({
            where: { idCarrinho: carrinhoBase.idCarrinho },
            relations: [
                'itens',
                'itens.produto',
                'itens.produto.imagens',
                'itens.produto.fornecedor',
            ],
            order: {
                itens: {
                    idCarrinhoItem: 'ASC',
                },
            },
        });
        const itens = carrinho?.itens ?? [];
        const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);
        if (itens.length === 0) {
            return {
                ...carrinho,
                itens: [],
                totalItens: 0,
                subtotal: 0,
                descontoProdutos: 0,
                descontoCombos: 0,
                descontoCupom: 0,
                descontoTotal: 0,
                totalComDesconto: 0,
                promocoesAplicadas: [],
                cupomAplicado: null,
            };
        }
        const calculo = await this.promocaoService.calcularDescontos({
            itens: itens.map((item) => ({
                produto: item.produto,
                quantidade: item.quantidade,
            })),
            codigoCupom,
        });
        const itensEnriquecidos = itens.map((item, idx) => {
            const calcItem = calculo.itens[idx];
            return {
                ...item,
                precoUnitarioFinal: calcItem?.precoUnitarioFinal ?? Number(item.precoUnitario),
                descontoUnitario: calcItem?.descontoUnitario ?? 0,
                descontoTotalItem: calcItem?.descontoTotalItem ?? 0,
                valorTotalItem: calcItem?.valorTotalItem ??
                    Number((Number(item.precoUnitario) * item.quantidade).toFixed(2)),
                promocaoAplicada: calcItem?.promocaoAplicada ?? null,
            };
        });
        return {
            ...carrinho,
            itens: itensEnriquecidos,
            totalItens,
            subtotal: calculo.subtotalBruto,
            descontoProdutos: calculo.descontoProdutos,
            descontoCombos: calculo.descontoCombos,
            descontoCupom: calculo.descontoCupom,
            descontoTotal: calculo.descontoTotal,
            totalComDesconto: calculo.valorTotal,
            promocoesAplicadas: calculo.promocoesAplicadas,
            cupomAplicado: calculo.cupomAplicado,
        };
    }
    async adicionarItem(usuarioId, dto) {
        const carrinho = await this.getOrCreateCarrinho(usuarioId);
        const produto = await this.produtoRepo.findOneBy({
            idProduto: dto.idProduto,
        });
        if (!produto || produto.status !== 'ativo') {
            throw new common_1.NotFoundException(`Produto #${dto.idProduto} não encontrado ou inativo`);
        }
        const itemExistente = await this.itemRepo.findOne({
            where: {
                carrinho: { idCarrinho: carrinho.idCarrinho },
                produto: { idProduto: produto.idProduto },
            },
        });
        const novaQuantidade = itemExistente
            ? itemExistente.quantidade + dto.quantidade
            : dto.quantidade;
        if (novaQuantidade > produto.estoque) {
            throw new common_1.BadRequestException(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoque}`);
        }
        if (itemExistente) {
            itemExistente.quantidade = novaQuantidade;
            itemExistente.precoUnitario = produto.precoVenda;
            await this.itemRepo.save(itemExistente);
        }
        else {
            const novoItem = this.itemRepo.create({
                carrinho,
                produto,
                quantidade: dto.quantidade,
                precoUnitario: produto.precoVenda,
            });
            await this.itemRepo.save(novoItem);
        }
        return this.obterCarrinho(usuarioId);
    }
    async atualizarQuantidade(usuarioId, idItem, dto) {
        const carrinho = await this.getOrCreateCarrinho(usuarioId);
        const item = await this.itemRepo.findOne({
            where: {
                idCarrinhoItem: idItem,
                carrinho: { idCarrinho: carrinho.idCarrinho },
            },
            relations: ['produto'],
        });
        if (!item) {
            throw new common_1.NotFoundException(`Item #${idItem} não encontrado no carrinho`);
        }
        if (dto.quantidade === 0) {
            await this.itemRepo.remove(item);
            return this.obterCarrinho(usuarioId);
        }
        if (dto.quantidade > item.produto.estoque) {
            throw new common_1.BadRequestException(`Estoque insuficiente para "${item.produto.nome}". Disponível: ${item.produto.estoque}`);
        }
        item.quantidade = dto.quantidade;
        item.precoUnitario = item.produto.precoVenda;
        await this.itemRepo.save(item);
        return this.obterCarrinho(usuarioId);
    }
    async removerItem(usuarioId, idItem) {
        const carrinho = await this.getOrCreateCarrinho(usuarioId);
        const item = await this.itemRepo.findOne({
            where: {
                idCarrinhoItem: idItem,
                carrinho: { idCarrinho: carrinho.idCarrinho },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Item #${idItem} não encontrado no carrinho`);
        }
        await this.itemRepo.remove(item);
        return this.obterCarrinho(usuarioId);
    }
    async limparCarrinho(usuarioId) {
        const carrinho = await this.getOrCreateCarrinho(usuarioId);
        await this.itemRepo.delete({
            carrinho: { idCarrinho: carrinho.idCarrinho },
        });
        return this.obterCarrinho(usuarioId);
    }
};
exports.CarrinhoService = CarrinhoService;
exports.CarrinhoService = CarrinhoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(carrinho_entity_1.Carrinho)),
    __param(1, (0, typeorm_1.InjectRepository)(carrinho_item_entity_1.CarrinhoItem)),
    __param(2, (0, typeorm_1.InjectRepository)(produto_entity_1.Produto)),
    __param(3, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        promo_service_1.PromocaoService])
], CarrinhoService);
//# sourceMappingURL=carrinho.service.js.map