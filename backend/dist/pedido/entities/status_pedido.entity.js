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
exports.StatusPedido = void 0;
const typeorm_1 = require("typeorm");
const pedido_entity_1 = require("./pedido.entity");
let StatusPedido = class StatusPedido {
};
exports.StatusPedido = StatusPedido;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { name: 'id_status', type: 'bigint', }),
    __metadata("design:type", String)
], StatusPedido.prototype, "idStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 80, nullable: false, unique: true, }),
    __metadata("design:type", String)
], StatusPedido.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, }),
    __metadata("design:type", String)
], StatusPedido.prototype, "descricao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: false, default: 0, }),
    __metadata("design:type", Number)
], StatusPedido.prototype, "ordem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true, }),
    __metadata("design:type", String)
], StatusPedido.prototype, "cor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status_final', type: 'boolean', nullable: false, default: false, }),
    __metadata("design:type", Boolean)
], StatusPedido.prototype, "statusFinal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: false, default: true, }),
    __metadata("design:type", Boolean)
], StatusPedido.prototype, "ativo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pedido_entity_1.Pedido, pedido => pedido.status),
    __metadata("design:type", Array)
], StatusPedido.prototype, "pedidos", void 0);
exports.StatusPedido = StatusPedido = __decorate([
    (0, typeorm_1.Entity)({ name: 'status_pedido' })
], StatusPedido);
//# sourceMappingURL=status_pedido.entity.js.map