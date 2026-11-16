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
exports.HistoricoStatus = void 0;
const typeorm_1 = require("typeorm");
const pedido_entity_1 = require("./pedido.entity");
const status_pedido_entity_1 = require("./status_pedido.entity");
const usuario_entity_1 = require("../../usuario/entities/usuario.entity");
let HistoricoStatus = class HistoricoStatus {
};
exports.HistoricoStatus = HistoricoStatus;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('identity', { name: 'id_historico', type: 'bigint', }),
    __metadata("design:type", String)
], HistoricoStatus.prototype, "idHistorico", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pedido_entity_1.Pedido, pedido => pedido.historicoStatus, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_pedido' }),
    __metadata("design:type", pedido_entity_1.Pedido)
], HistoricoStatus.prototype, "pedido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => status_pedido_entity_1.StatusPedido, { nullable: false, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_status' }),
    __metadata("design:type", status_pedido_entity_1.StatusPedido)
], HistoricoStatus.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, usuario => usuario.historicoStatus, { nullable: true, }),
    (0, typeorm_1.JoinColumn)({ name: 'id_usuario_responsavel' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], HistoricoStatus.prototype, "usuarioResponsavel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, }),
    __metadata("design:type", String)
], HistoricoStatus.prototype, "observacao", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'data_hora', type: 'timestamp', nullable: false, default: () => 'now()', }),
    __metadata("design:type", Date)
], HistoricoStatus.prototype, "dataHora", void 0);
exports.HistoricoStatus = HistoricoStatus = __decorate([
    (0, typeorm_1.Entity)({ name: 'historico_status' })
], HistoricoStatus);
//# sourceMappingURL=historico-status.entity.js.map