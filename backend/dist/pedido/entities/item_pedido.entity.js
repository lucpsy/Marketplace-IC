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
exports.ItemPedido = void 0;
const typeorm_1 = require("typeorm");
const pedido_entity_1 = require("./pedido.entity");
const produto_entity_1 = require("../../catalogo/entities/produto.entity");
let ItemPedido = class ItemPedido {
};
exports.ItemPedido = ItemPedido;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', {
        name: 'id_item_pedido',
        type: 'bigint',
    }),
    __metadata("design:type", String)
], ItemPedido.prototype, "idItemPedido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pedido_entity_1.Pedido, pedido => pedido.itens, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_pedido' }),
    __metadata("design:type", pedido_entity_1.Pedido)
], ItemPedido.prototype, "pedido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => produto_entity_1.Produto, produto => produto.itensPedido, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_produto' }),
    __metadata("design:type", produto_entity_1.Produto)
], ItemPedido.prototype, "produto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nome_produto_snapshot', type: 'varchar', length: 200, nullable: false, }),
    __metadata("design:type", String)
], ItemPedido.prototype, "nomeProdutoSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sku_snapshot', type: 'varchar', length: 100, nullable: true, }),
    __metadata("design:type", String)
], ItemPedido.prototype, "skuSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], ItemPedido.prototype, "quantidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'preco_unitario_snapshot', type: 'decimal', precision: 12, scale: 2, nullable: false, }),
    __metadata("design:type", String)
], ItemPedido.prototype, "precoUnitarioSnapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: false, default: 0, }),
    __metadata("design:type", String)
], ItemPedido.prototype, "desconto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valor_total', type: 'decimal', precision: 12, scale: 2, nullable: false, }),
    __metadata("design:type", String)
], ItemPedido.prototype, "valorTotal", void 0);
exports.ItemPedido = ItemPedido = __decorate([
    (0, typeorm_1.Entity)({ name: 'item_pedido' })
], ItemPedido);
//# sourceMappingURL=item_pedido.entity.js.map