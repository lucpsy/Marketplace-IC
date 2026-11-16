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
exports.Auditoria = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("../../usuario/entities/usuario.entity");
let Auditoria = class Auditoria {
};
exports.Auditoria = Auditoria;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("identity", { type: "bigint", name: "id_log" }),
    __metadata("design:type", String)
], Auditoria.prototype, "idLog", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.auditorias, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "id_usuario" }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Auditoria.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: false }),
    __metadata("design:type", String)
], Auditoria.prototype, "acao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100, nullable: false }),
    __metadata("design:type", String)
], Auditoria.prototype, "entidade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_registro', type: "bigint", nullable: true }),
    __metadata("design:type", String)
], Auditoria.prototype, "idRegistro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Auditoria.prototype, "detalhes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 45, nullable: true }),
    __metadata("design:type", String)
], Auditoria.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamp", name: "data_hora", nullable: false, default: () => "now()", }),
    __metadata("design:type", Date)
], Auditoria.prototype, "dataRegistro", void 0);
exports.Auditoria = Auditoria = __decorate([
    (0, typeorm_1.Entity)({ name: "log_auditoria" })
], Auditoria);
//# sourceMappingURL=log_auditoria.entity.js.map