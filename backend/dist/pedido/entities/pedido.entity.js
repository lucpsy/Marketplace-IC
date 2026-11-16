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
exports.Pedido = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("../../usuario/entities/usuario.entity");
const status_pedido_entity_1 = require("./status_pedido.entity");
const item_pedido_entity_1 = require("./item_pedido.entity");
const historico_status_entity_1 = require("./historico-status.entity");
const pagamento_entity_1 = require("../../pagamento/entities/pagamento.entity");
let Pedido = class Pedido {
};
exports.Pedido = Pedido;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', {
        name: 'id_pedido',
        type: 'bigint',
    }),
    __metadata("design:type", String)
], Pedido.prototype, "idPedido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, usuario => usuario.pedidos, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Pedido.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => status_pedido_entity_1.StatusPedido, status => status.pedidos, { nullable: true, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_status' }),
    __metadata("design:type", status_pedido_entity_1.StatusPedido)
], Pedido.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'data_pedido', type: 'timestamp', nullable: false, default: () => 'now()', }),
    __metadata("design:type", Date)
], Pedido.prototype, "dataPedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: false, }),
    __metadata("design:type", String)
], Pedido.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valor_desconto', type: 'decimal', precision: 12, scale: 2, nullable: false, default: 0, }),
    __metadata("design:type", String)
], Pedido.prototype, "valorDesconto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: false, default: 0, }),
    __metadata("design:type", String)
], Pedido.prototype, "frete", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valor_total', type: 'decimal', precision: 12, scale: 2, nullable: false, }),
    __metadata("design:type", String)
], Pedido.prototype, "valorTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, }),
    __metadata("design:type", String)
], Pedido.prototype, "observacao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'data_atualizacao', type: 'timestamp', nullable: true, }),
    __metadata("design:type", Date)
], Pedido.prototype, "dataAtualizacao", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_pedido_entity_1.ItemPedido, item => item.pedido),
    __metadata("design:type", Array)
], Pedido.prototype, "itens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => historico_status_entity_1.HistoricoStatus, historico => historico.pedido),
    __metadata("design:type", Array)
], Pedido.prototype, "historicoStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pagamento_entity_1.Pagamento, pagamento => pagamento.pedido),
    __metadata("design:type", Array)
], Pedido.prototype, "pagamentos", void 0);
exports.Pedido = Pedido = __decorate([
    (0, typeorm_1.Entity)({ name: 'pedido' })
], Pedido);
//# sourceMappingURL=pedido.entity.js.map