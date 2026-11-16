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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const log_auditoria_entity_1 = require("../../auditoria/entities/log_auditoria.entity");
const carrinho_entity_1 = require("../../carrinho/entities/carrinho.entity");
const pedido_entity_1 = require("../../pedido/entities/pedido.entity");
const historico_status_entity_1 = require("../../pedido/entities/historico-status.entity");
const notificacao_entity_1 = require("../../notificacao/entities/notificacao.entity");
let Usuario = class Usuario {
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("identity", { type: "bigint", name: "id_usuario" }),
    __metadata("design:type", String)
], Usuario.prototype, "idUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Usuario.prototype, "nome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, unique: true }),
    __metadata("design:type", String)
], Usuario.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, name: "senha_hash", select: false }),
    __metadata("design:type", String)
], Usuario.prototype, "senhaHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "telefone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30, default: "ativo" }),
    __metadata("design:type", String)
], Usuario.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "data_cadastro",
        default: () => "now()",
    }),
    __metadata("design:type", Date)
], Usuario.prototype, "dataCadastro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "data_atualizacao", nullable: true }),
    __metadata("design:type", Date)
], Usuario.prototype, "dataAtualizacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "cargo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => log_auditoria_entity_1.Auditoria, (auditoria) => auditoria.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "auditorias", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => carrinho_entity_1.Carrinho, carrinho => carrinho.usuario),
    __metadata("design:type", carrinho_entity_1.Carrinho)
], Usuario.prototype, "carrinho", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pedido_entity_1.Pedido, pedido => pedido.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "pedidos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => historico_status_entity_1.HistoricoStatus, historico => historico.usuarioResponsavel),
    __metadata("design:type", Array)
], Usuario.prototype, "historicoStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notificacao_entity_1.Notificacao, notificacao => notificacao.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "notificacoes", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)({ name: "usuario" })
], Usuario);
//# sourceMappingURL=usuario.entity.js.map