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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarrinhoItem = void 0;
const typeorm_1 = require("typeorm");
const carrinho_entity_1 = require("./carrinho.entity");
const produto_entity_1 = require("../../catalogo/entities/produto.entity");
let CarrinhoItem = class CarrinhoItem {
};
exports.CarrinhoItem = CarrinhoItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { name: 'id_carrinho_item', type: 'bigint', }),
    __metadata("design:type", String)
], CarrinhoItem.prototype, "idCarrinhoItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => carrinho_entity_1.Carrinho, carrinho => carrinho.itens, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_carrinho' }),
    __metadata("design:type", carrinho_entity_1.Carrinho)
], CarrinhoItem.prototype, "carrinho", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => produto_entity_1.Produto, produto => produto.itensCarrinho, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_produto' }),
    __metadata("design:type", produto_entity_1.Produto)
], CarrinhoItem.prototype, "produto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], CarrinhoItem.prototype, "quantidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preco_unitario', type: 'decimal', precision: 12, scale: 2, nullable: false, }),
    __metadata("design:type", String)
], CarrinhoItem.prototype, "precoUnitario", void 0);
exports.CarrinhoItem = CarrinhoItem = __decorate([
    (0, typeorm_1.Entity)({ name: 'carrinho_item' }),
    (0, typeorm_1.Index)('UQ_carrinho_item_produto', ['carrinho', 'produto'], { unique: true, })
], CarrinhoItem);
//# sourceMappingURL=carrinho-item.entity.js.map