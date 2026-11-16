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
exports.Pagamento = void 0;
const typeorm_1 = require("typeorm");
const pedido_entity_1 = require("../../pedido/entities/pedido.entity");
let Pagamento = class Pagamento {
};
exports.Pagamento = Pagamento;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { name: 'id_pagamento', type: 'bigint', }),
    __metadata("design:type", String)
], Pagamento.prototype, "idPagamento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pedido_entity_1.Pedido, pedido => pedido.pagamentos, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_pedido' }),
    __metadata("design:type", pedido_entity_1.Pedido)
], Pagamento.prototype, "pedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: false, }),
    __metadata("design:type", String)
], Pagamento.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40, nullable: false, }),
    __metadata("design:type", String)
], Pagamento.prototype, "metodo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40, nullable: false, default: 'pendente', }),
    __metadata("design:type", String)
], Pagamento.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'data_criacao', type: 'timestamp', nullable: false, default: () => 'now()', }),
    __metadata("design:type", Date)
], Pagamento.prototype, "dataCriacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_pagamento', type: 'timestamp', nullable: true, }),
    __metadata("design:type", Date)
], Pagamento.prototype, "dataPagamento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia_gateway', type: 'varchar', length: 255, nullable: true, unique: true, }),
    __metadata("design:type", String)
], Pagamento.prototype, "referenciaGateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, }),
    __metadata("design:type", String)
], Pagamento.prototype, "descricao", void 0);
exports.Pagamento = Pagamento = __decorate([
    (0, typeorm_1.Entity)({ name: 'pagamento' })
], Pagamento);
//# sourceMappingURL=pagamento.entity.js.map